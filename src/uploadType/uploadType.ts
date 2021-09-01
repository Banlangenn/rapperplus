import * as path from 'path';
import * as ora from 'ora';
import chalk from 'chalk';
import { uploadInterface } from './fetch/index';
import { generateUploadRapJson, tsTypeParse } from './tsTypeFileParse/index';
import { requestFileParse } from './requestFileParse';
import type { IOptions } from './mergeOptions'
import { getFiles } from './../core/scanFile';
const spinner = ora(chalk.grey('开始扫描本地文件'));
// const requestFile = './../actions/testdemo.ts';

// console.log(getFiles(path.resolve(__dirname, './../actions')));
const typeFileJsonMap = {};
// Blitzcrank  布里茨 机器人

function getModulesFetchParams(requestFile: string, config: IOptions) {
  const { importType, funcType } = requestFileParse(requestFile, params => ({
    returnType: params.returnType.match(/T,\s*(\w+)>>$/)[1],
    paramsType: params.paramsType[0].data,
    fetchUrl: params.comment.match(/http:\/\/rap2\.tao[\s\S]+&itf=\d+/)[0],
  }), config);

  return funcType
    .filter(name => name)
    .map(e => {
      if (importType.importNames.includes(e.paramsType && e.returnType)) {
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
          e.returnType,
          e.paramsType,
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
  spinner.succeed(chalk.green(`开始同步到远程文档`));
  try {
    await Promise.all(
      interfaces.map(el => uploadInterface(el.rapJson, el.interfaceId, config.upload.tokenCookie)),
    );
    spinner.succeed(chalk.grey('提交成功'));
  } catch (err) {
    spinner.fail(chalk.red(`同步失败！${err}`));
  }
}

function getFileInterface(config: IOptions) {
  const allFile = getFiles(config.upload.matchDir);
  spinner.succeed(chalk.green(`共扫描到${allFile.length}个文件`));
  spinner.succeed(chalk.green(`开始分析有效文件`));

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
spinner.start();
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
