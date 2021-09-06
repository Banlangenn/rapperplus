#!/usr/bin/env node

import { rapper, defineConfig, uploadType } from './index';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { searchRootPath } from './utils';
import chalk from 'chalk';
import * as program from 'commander';

(() => {
  program
    .option('--apiUrl <apiUrl>', '设置Rap平台后端地址')
    .option('--rapUrl <rapUrl>', '设置Rap平台前端地址')
    .option('--rapperPath <rapperPath>', '设置生成代码所在目录')
    .option('--c, --config <configPath>', 'config文件路径')
    .option('--m, --moduleId <moduleId>', '模块ID')
    .option('--u, --upload []', '上传类型')
    .option('--d, --download []', '下载类型');

  program.parse(process.argv);

  const isUpload: boolean = program.upload ? true : false;
  const configName = 'rapper-Plus';
  let config = defineConfig({});
  const rootPath = searchRootPath();

  // 通过 命令行配置config
  if (program.config) {
    const configPath = resolve(rootPath, program.config);
    if (existsSync(configPath)) {
      console.log(chalk.yellow('config 文件路径不对，请检查'));
      process.exit(1);
    }
    config = require(configPath);
  } else {
    // 通过config.js配置config
    const configPath = resolve(rootPath, `${configName}.config.js`);
    const existsConfigPath = existsSync(configPath);
    if (existsConfigPath) {
      config = require(configPath);
    }
  }

  /** 通过 package.json 配置config */
  const packageConfig = require(resolve(rootPath, './package.json'));

  if (packageConfig.rapperPlus) {
    config = defineConfig(packageConfig.rapperPlus);
  }

  // 都没有就用 defaultConfig

  if (program.moduleId) {
    config.download.moduleId = program.moduleId;
    config.upload.moduleId = program.moduleId;
  }

  if (program.apiUrl && program.rapUrl) {
    /** 通过 scripts 配置 */
    const rapperConfig = {
      apiUrl: program.apiUrl,
      rapUrl: program.rapUrl,
      rapperPath: program.rapperPath || config.rap.rapperPath,
    };
    config.rap = rapperConfig;
  }

  if (isUpload) {
    rapper(config);
  } else {
    uploadType(config);
  }
})();
