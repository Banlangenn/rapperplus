import * as path from 'path';

import * as ora from 'ora';
import chalk from 'chalk';
import { updateInterface, createInterface, createModule } from './fetch/index';
import { generateUploadRapJson, tsTypeParse } from './tsTypeFileParse/index';
import { requestFileParse } from './requestFileParse';
import type { IOptions } from './mergeOptions'
import { getFiles } from './../core/scanFile';
import { updateFileContent } from './../utils'
// import { format } from 'json-schema-to-typescript/dist/src/formatter';
// import { DEFAULT_OPTIONS } from 'json-schema-to-typescript';
const spinner = ora(chalk.grey('开始扫描本地文件'));
spinner.start();
// const requestFile = './../actions/testdemo.ts';
// GET|POST|PUT|DELETE|OPTIONS|PATCH|HEAD
// console.log(getFiles(path.resolve(__dirname, './../actions')));
const typeFileJsonMap = {};
// Blitzcrank  布里茨 机器人

function getModulesFetchParams(requestFile: string, config: IOptions) {

  const { importType, funcTypes, fileInfo } = requestFileParse(requestFile, config.upload.formatFunc, config);
  // 检查出来没有附符合的方法
  if(funcTypes.length === 0) return null
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
              repositoryId: config.rap.repositoryId
            }, config.rap.apiUrl, config.rap.tokenCookie)
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
             repositoryId: config.rap.repositoryId
           }, config.rap.apiUrl, config.rap.tokenCookie)
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
* Rap 地址: ${config.rap.rapUrl}/repository/editor?id=${config.rap.repositoryId}&mod=${moduleId}&itf=${e.interfaceId}
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
        if(newContent) {
          await updateFileContent(fileInfo.filePath, newContent)
        }
      // console.log('开始更接口', containInterface)
      await Promise.all(
        // 有问题了
        containInterface.map(el =>{
          if (!typeFileJsonMap[importType.importPath]) {
            typeFileJsonMap[importType.importPath] = tsTypeParse(
              path.resolve(__dirname, importType.importPath),
            );
          }
          const properties =  generateUploadRapJson(
            typeFileJsonMap[importType.importPath],
            el.interfaceId,
            el.resTypeName,
            el.reqTypeName,
          );
          return updateInterface({
            id: el.interfaceId,
            properties
          }, config.rap.apiUrl, config.rap.tokenCookie)
        })
      );

      return containInterface.length
    }

    return {
      execute,
      name: fileInfo.fileName,
      moduleId,
    }
}




function getFileInterface(config: IOptions) {
  const allFile = getFiles(config.rap.rapperPath);
  spinner.succeed(chalk.green(`共扫描到${allFile.length}个文件`));

  spinner.start(chalk.grey(`开始分析有效文件`));

  const allModule = allFile
    .map(filePath => {
      const extName = path.extname(filePath);
      if (!['.ts', '.js', '.vue', '.es'].includes(extName)) {
        return null
      }
      return getModulesFetchParams(filePath, config);
    })
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

  const updateInterfaces = allModule.map((el) => {
    return el.execute
  }, []);

  // 数据统计 必须要有的 先放一下
  spinner.succeed(chalk.green(`将要提交${allModule.length}个模块`));
  return updateInterfaces;
}

export default  async function uploadType(config: IOptions) {
spinner.succeed(chalk.grey('开始扫描本地文件'));
  // try {
    // console.log(path.resolve(__dirname, config.upload.matchDir))
    const fetchParams = getFileInterface(config);
    if(fetchParams.length === 0 ) {
      spinner.fail('没有可提交接口');
      return
    }
    spinner.start(chalk.grey(`开始同步到远程文档`));
    const counts = await Promise.all(fetchParams.map(e => e()))
    const total = counts.reduce((c,n) =>c + n, 0)
    spinner.succeed(chalk.green(`一共更新了${total}个接口`));
    spinner.succeed(chalk.grey('提交成功'));
  // } catch (err) {
  //   spinner.fail(chalk.red(`同步失败！${err}`));
  // }
}
