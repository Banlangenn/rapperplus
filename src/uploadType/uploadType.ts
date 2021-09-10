import * as path from 'path';
import * as ora from 'ora';
import chalk from 'chalk';
import { updateInterface, createInterface, createModule } from './fetch/index';
import { generateUploadRapJson, tsTypeParse } from './tsTypeFileParse/index';
import { requestFileParse } from './requestFileParse';
import type { IOptions } from './mergeOptions'
import { getFiles } from './../core/scanFile';
import { updateFileContent, promiseReadFile, getContentMd5 } from './../utils'
// import { format } from 'json-schema-to-typescript/dist/src/formatter';
// import { DEFAULT_OPTIONS } from 'json-schema-to-typescript';
const spinner = ora(chalk.grey('开始扫描本地文件'));
spinner.start();
// const requestFile = './../actions/testdemo.ts';
// GET|POST|PUT|DELETE|OPTIONS|PATCH|HEAD
// console.log(getFiles(path.resolve(__dirname, './../actions')));
const typeFileJsonMap = {};
// Blitzcrank  布里茨 机器人、、


function requestFileOrTypeFileIsChange(requestPath: string, allFileMap, importPath?: string):boolean {
  const { oldMd5, newMd5 } = getContentMd5(allFileMap[requestPath])
  if(oldMd5 && oldMd5 === newMd5) {
    // 说明 请求文件是没有被改的
    // 开始检查 依赖文件是否被修改
    if(importPath) {
      return requestFileOrTypeFileIsChange(importPath, allFileMap)
    }
    return false
  }
  return true
}

function getAllModule(
  requestFile: {path: string, content: string},
  allFileMap: Record<string, unknown>,
  config: IOptions
  ) {
  if(!requestFile) return null
  const { importType, funcTypes, fileInfo } = requestFileParse(requestFile, config.upload.formatFunc, config);
  // 检查出来没有附符合的方法
  if(funcTypes.length === 0) return null

  // 有咩有更改
  const isChange = requestFileOrTypeFileIsChange(requestFile.path, allFileMap, importType.importPath)
  if(!isChange) {
    return null
  }

  let { moduleId } = fileInfo
  const content = fileInfo.content
  let newContent = ''
    // 如果返回
    // outputFile.content = format(content, DEFAULT_OPTIONS)
    // 要不要 把 请求全部内敛进来
    const execute =  async () => {
      const verifyFetchParams = funcTypes.filter(e => {
        if(importType.importNames.includes(e.reqTypeName)&&importType.importNames.includes(e.resTypeName)) {
          return true
        }
        console.log(`导出的 ${importType.importNames}文件内[${e.reqTypeName}, ${e.resTypeName}] 没有这个接口, 同步将会忽略掉`)
        return false
      })
      // 有模块请求 创建模块请求
      interface ICreateInterface {
        reqUrl: string;
        reqMethod: string;
        funcName: string;
        interfaceId?: number;
        body: string;
        resTypeName: string;
        reqTypeName: string;
        comment: string;
      }
      const containInterface: ICreateInterface[] = []
      const noInterface: ICreateInterface[] = []
        try {
          if (!moduleId) {
            const { id: modId } = await createModule({
              description: fileInfo.fileName,
              name: fileInfo.fileName,
              repositoryId: config.rapper.repositoryId
            }, config.rapper.apiUrl, config.rapper.tokenCookie)
            //  修改 content

            newContent = `/* Rap仓库ModuleId: ${modId} */ \n` + (newContent ||content)

            moduleId = modId
            // 如果 没有 moduleId  就认为这个文件新接口
          }
         
          verifyFetchParams.forEach(element => {
              if(element.interfaceId) {
                containInterface.push(element)
              } else {
                noInterface.push(element)
              }
          });
          const containInter = await Promise.all(noInterface.map(async e => {
            let interfaceName = e.funcName

            if(e.comment) {
              const commentMatch = e.comment.match(/\s*\/\/\s*([\s|\S]+)$/)
              if (commentMatch) {
                interfaceName = commentMatch[1]
              }
            }
            const result = await createInterface({
             name: interfaceName,
             url: e.reqUrl,
             method: e.reqMethod,
             description: e.funcName,
             moduleId,
             repositoryId: config.rapper.repositoryId
           }, config.rapper.apiUrl, config.rapper.tokenCookie)
             e.interfaceId = result.itf.id
            //  修改 content
          //  注释

          if(interfaceName !== e.funcName) {
            const commentReg = new RegExp(`(${e.comment.replace(/([()])/g,'\\$1')})`)
            newContent = (newContent || content).replace(commentReg, '')
          }

       
           const bodyReg = new RegExp(`(${e.body.replace(/([()])/g,'\\$1')})`)
           newContent = (newContent || content).replace(bodyReg,
`/**
* 接口名：${interfaceName}
* Rap 地址: ${config.rapper.rapUrl}/repository/editor?id=${config.rapper.repositoryId}&mod=${moduleId}&itf=${e.interfaceId}
*/
$1`
)
            // interface 第一行的位置
            return e
           })) 
           containInterface.push(...containInter)
        } catch (error) {
          //  先把本地修改掉 在 抛错
          if(newContent) {
            updateFileContent(fileInfo.filePath, newContent)
          }
          throw error
        }
      // console.log('开始更接口', containInterface)
      await Promise.all(
        // 有问题了
        containInterface.map(async el =>{
          if (!typeFileJsonMap[importType.importPath]) {
            typeFileJsonMap[importType.importPath] = tsTypeParse(importType.importPath);
          }
          const properties = generateUploadRapJson(
            typeFileJsonMap[importType.importPath],
            el.interfaceId,
            el.resTypeName,
            el.reqTypeName,
          );
          const result = await updateInterface({
            id: el.interfaceId,
            properties
          }, el.funcName, config.rapper.apiUrl, config.rapper.tokenCookie)
          // console.log(Object.keys(allFileMap), '====' ,importType.importPath)
          await updateFileContent(importType.importPath, allFileMap[importType.importPath])
          return result
        })
      );
      if(newContent) {
        await updateFileContent(fileInfo.filePath, newContent)
      }

      return containInterface.length
    }

    return {
      execute,
      name: fileInfo.fileName,
      moduleId,
    }
}

async function getFileInterface(config: IOptions) {
  const allFile = getFiles(config.rapper.matchDir);
  spinner.succeed(chalk.green(`共扫描到${allFile.length}个文件`));

  spinner.start(chalk.grey(`开始分析有效文件`));

  // 生成依赖图
  const readAllFile = allFile
    .map(filePath => {
      const extName = path.extname(filePath);
      if (!['.ts', '.js', '.vue', '.es'].includes(extName)) {
        return null
      }
      return promiseReadFile(filePath);
    })

    const allFileContent = await Promise.all(readAllFile)
    const allFileMap = allFileContent.reduce((c,n) => {
      if(n) {
        c[n.path] = n.content
      }
      return c
    }, {})
    const effectiveFile = allFileContent.map(file => getAllModule(file, allFileMap, config))
    .filter(e => {
      if (!e) {
        return false;
      }
      // 上传  modId
      if (config.upload.moduleId) {
        if (config.upload.moduleId === e.moduleId) {
          return true;
        } else {
          return false;
        }
      }

      return true;
    });

  const updateInterfaces = effectiveFile.map((el) => {
    return el.execute
  });

  // 数据统计 必须要有的 先放一下
  if(effectiveFile.length !== 0) {
    spinner.succeed(chalk.green(`将要提交${effectiveFile.length}个模块`));
  }
  return updateInterfaces;
}

export default  async function uploadType(config: IOptions) {
  spinner.succeed(chalk.grey('开始扫描本地文件'));
  try {
    const fetchParams = await getFileInterface(config);
    if(fetchParams.length === 0 ) {
      spinner.info('没检查到有文件变更');
      return
    }
    spinner.start(chalk.grey(`开始同步到远程文档`));
    const counts = await Promise.all(fetchParams.map(e => e()))
    const total = counts.reduce((c,n) =>c + n, 0)
    spinner.succeed(chalk.green(`一共更新了${total}个接口`));
    spinner.succeed(chalk.grey('提交成功'));
  } catch (err) {
    spinner.fail(chalk.red(`同步失败！${err}`));
  }
}
