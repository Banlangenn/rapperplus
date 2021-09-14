import { IOptions } from './../uploadType/mergeOptions';
import * as path from 'path';
import { getFiles } from './../core/scanFile';
import { generateUploadRapJson, tsTypeParse } from './../uploadType/tsTypeFileParse/index';
import {
  writeFile,
  updateFileContent,
  promiseReadFile,
  getContentMd5,
  getRapModuleId,
} from './../utils';
import { updateInterface, createInterface, createModule } from './../uploadType/fetch';
import * as ora from 'ora';
import chalk from 'chalk';

function typeFileIsChange(content: string): boolean {
  const { oldMd5, newMd5 } = getContentMd5(content);
  if (oldMd5 && oldMd5 === newMd5) {
    // 说明 请求文件是没有被改的
    // 开始检查 依赖文件是否被修改
    return false;
  }
  return true;
}

async function getContent(config: IOptions, spinner: ora.Ora) {
  const allFile = getFiles(config.rapper.rapperPath);
  // TODO: 没找到一步扫描本地 代码的 api
  spinner.succeed(chalk.green(`共扫描到${allFile.length}个文件`));
  spinner.start(chalk.grey(`开始分析有效文件`));
  const readAllFile = allFile.map(async filePath => {
    const fileReg = new RegExp(config.upload.fileRegex);
    if (fileReg.test(filePath)) {
      const result = await promiseReadFile(filePath);
      if (!typeFileIsChange(result.content)) return null;
      const schema = tsTypeParse(filePath);
      // 检查合法性 -- 这东西会自动扩散 去解析导入类型的文件
      return {
        schema,
        ...result,
      };
    }
    return null;
  });
  const allSchemaContent = await Promise.all(readAllFile);
  return allSchemaContent.filter(file => file);
}

async function getFileInterface(
  {
    content,
    schema,
    path: filePath,
  }: {
    path: string;
    content: string;
    schema: any;
  },
  config: IOptions,
) {
  const definitions = schema.definitions;
  const fileName = path.basename(filePath).replace(/\.[a-z0-9]+$/, '');
  const interfaceContainer = [];
  let moduleId = getRapModuleId(content);
  let newContent;
  let fetchContent = moduleId ? `/* Rap仓库ModuleId: ${moduleId} */ \n` : '';
  fetchContent += config.download.requestModule({
    repositoryId: config.rapper.repositoryId,
    moduleId: moduleId,
    moduleRapUrl: ``,
    moduleDescription: fileName,
  }).moduleHeader;
  const fetchContentPath = path.resolve(config.rapper.rapperPath, `./${fileName}.ts`);
  try {
    for (const item in definitions) {
      const el = definitions[item];
      // http://rap2.taobao.org/repository/editor?id=284428&mod=476168&itf=2079995
      let interfaceId = el.rapUrl ? (el.rapUrl.match(/itf=(\d+)$/) ?? [])[1] : null;
      if (el?.properties?.request && el?.properties?.response) {
        if (!el.url || !el.method) {
          console.log(`请检查${item} JsDoc写法是否正确, 更新将会跳过`);
          continue;
        }
        if (!moduleId) {
          const { id: modId } = await createModule(
            {
              description: fileName,
              name: fileName,
              repositoryId: config.rapper.repositoryId,
            },
            config.rapper.apiUrl,
            config.rapper.tokenCookie,
          );
          //  修改 content
          const moduleIdStr = `/* Rap仓库ModuleId: ${modId} */ \n`;
          fetchContent = moduleIdStr + fetchContent;
          newContent = moduleIdStr + (newContent || content);
          moduleId = modId;
          // 如果 没有 moduleId  就认为这个文件新接口
        }
        if (!el.rapUrl) {
          // console.log('创建');
          // 文件顶部 moduleId
          const result = await createInterface(
            {
              name: el.description,
              url: el.url,
              method: el.method,
              description: item,
              moduleId,
              repositoryId: config.rapper.repositoryId,
            },
            config.rapper.apiUrl,
            config.rapper.tokenCookie,
          );
          interfaceId = result.itf.id;
          const reg = new RegExp(
            `((\/\\*([^*]|[\r\n]|(\\*+([^*/]|[\r\n])))*\\*+\/)|(\/\/.*))\\s*(?=export\\s+(type|interface)\\s+${item}\)`,
          );
          newContent = (newContent || content).replace(reg, (_, group) => {
            return group.replace(
              /((\s+)\*\/$)/,
              `$2* @rapUrl  ${config.rapper.rapUrl}/repository/editor?id=${config.rapper.repositoryId}&mod=${moduleId}&itf=${interfaceId}$1\n`,
            );
          });
        }

        fetchContent += `
/**
 * 接口名：${el.description}
 * Rap 地址: ${config.rapper.rapUrl}/repository/editor?id=${
          config.rapper.repositoryId
        }&mod=${moduleId}&itf=${interfaceId}
 */
export const ${item.charAt(0).toLowerCase()}${item.slice(1)}${fileName
          .charAt(0)
          .toUpperCase()}${fileName.slice(
          1,
        )} = createFetch<${item}['request'], ${item}['response']>("${el.url}", "${el.method}");\n`;

        interfaceContainer.push({
          id: interfaceId,
          properties: generateUploadRapJson(
            schema,
            interfaceId,
            [item, 'response'],
            [item, 'request'],
          ),
        });
      }
    }

    await Promise.all(
      interfaceContainer.map(async e => {
        const result = await updateInterface(
          {
            id: e.id,
            properties: e.properties,
          },
          e.name,
          config.rapper.apiUrl,
          config.rapper.tokenCookie,
        );
        newContent = newContent || content;
        return result;
      }),
    );
  } catch (error) {
    if (newContent) {
      updateFileContent(filePath, newContent);
    }
    throw error;
  }

  const writes: any[] = [writeFile(fetchContentPath, fetchContent)];
  if (newContent) {
    writes.push(updateFileContent(filePath, newContent));
  }
  await Promise.all(writes);
  return interfaceContainer.length;
}
export default async function typeUpload(config: IOptions) {
  const spinner = ora();
  // const spinner = ora(chalk.grey('开始扫描本地文件'));
  spinner.start();
  spinner.info(chalk.grey(`当前mode:${config.upload.mode}`));
  spinner.succeed(chalk.grey('开始扫描本地文件'));
  try {
    const result = await getContent(config, spinner);
    if (result.length === 0) {
      spinner.info('没检查到需要更新的文件');
      spinner.info('原因可能是：\n1.fileRegex不正确\n2.rapperPath不正确\n3.文件没有变更');

      return;
    } else {
      spinner.succeed(chalk.green(`将要提交${result.length}个模块`));
    }

    spinner.start(chalk.grey(`开始同步到远程文档`));
    const counts = await Promise.all(result.map(e => getFileInterface(e, config)));
    const total = counts.reduce((c, n) => c + n, 0);
    spinner.succeed(chalk.green(`一共更新了${total}个接口`));
    spinner.succeed(chalk.grey('提交成功'));
  } catch (error) {
    spinner.fail(chalk.red(`同步失败！${error}`));
  }
}
