import * as path from 'path';
import * as ora from 'ora';
import chalk from 'chalk';
import { updateInterface } from './fetch/index';
import { generateUploadRapJson, tsTypeParse } from './tsTypeFileParse/index';
import { requestFileParse } from './requestFileParse';
import type { IOptions } from './mergeOptions'
import { getFiles } from './../core/scanFile';
const spinner = ora(chalk.grey('开始扫描本地文件'));
spinner.start();
// const requestFile = './../actions/testdemo.ts';
// GET|POST|PUT|DELETE|OPTIONS|PATCH|HEAD
// console.log(getFiles(path.resolve(__dirname, './../actions')));
const typeFileJsonMap = {};
// Blitzcrank  布里茨 机器人

function getModulesFetchParams(requestFile: string, config: IOptions) {

  const { importType, funcTypes } = requestFileParse(requestFile, config.upload.formatFunc, config);

  return funcTypes
    .map(e => {
      if (importType.importNames.includes(e.reqTypeName && e.resTypeName)) {
        // 在这个文件内
        if (!typeFileJsonMap[importType.importPath]) {
          typeFileJsonMap[importType.importPath] = tsTypeParse(
            path.resolve(__dirname, importType.importPath),
          );
        }

        // id=284428&mod=459499&itf=2006088
        const urlMatch = e.fetchUrl.match(/&mod=(\d+)&itf=(\d+)$/);
        const interfaceId = Number(urlMatch[2]);
        const moduleId = Number(urlMatch[1]);
        const rapJson = generateUploadRapJson(
          typeFileJsonMap[importType.importPath],
          interfaceId,
          e.resTypeName,
          e.reqTypeName,
        );
        return {
          rapJson,
          interfaceId,
          moduleId,
        };
      }
    });
}
async function fetchAllInterface(
  interfaces: {
    rapJson: any[];
    interfaceId: number;
  }[],
  config: IOptions
) {
  spinner.start(chalk.grey(`开始同步到远程文档`));
  try {
    await Promise.all(
      // 有问题了
      interfaces.map(el => updateInterface({
        id: el.interfaceId,
        properties: el.rapJson
      }, config.upload.apiUrl, config.upload.tokenCookie)),
    );
    spinner.succeed(chalk.grey('提交成功'));
  } catch (err) {
    spinner.fail(chalk.red(`同步失败！${err}`));
  }
}

function getFileInterface(config: IOptions) {
  const allFile = getFiles(config.upload.matchDir);
  spinner.succeed(chalk.green(`共扫描到${allFile.length}个文件`));

  spinner.start(chalk.grey(`开始分析有效文件`));

  const allModule = allFile
    .map(file => {
      return getModulesFetchParams(file, config);
    })
    .filter(e => {
      if (e.length === 0) {
        return false;
      }
      // 上传  modId
      if (config.upload.moduleId) {
        if (config.upload.moduleId === e[0].moduleId) {
          return true;
        } else {
          return false;
        }
      }

      return true;
    });

  const interfaces = allModule.reduce((p, n) => {
    return p.concat(n);
  }, []);
  spinner.succeed(chalk.green(`将要提交${allModule.length}个模块, ${interfaces.length}个接口`));
  return interfaces;
}

export  default function uploadType(config: IOptions) {
spinner.succeed(chalk.grey('开始扫描本地文件'));
  try {
    // console.log(path.resolve(__dirname, config.upload.matchDir))
    const fetchParams = getFileInterface(config);
    if(fetchParams.length === 0 ) {
      spinner.fail('没有可提交接口');
      return
    }
    fetchAllInterface(fetchParams, config);
  } catch (error) {
    spinner.fail('文件解析失败， 请检查path 是否正确');
  }
}
