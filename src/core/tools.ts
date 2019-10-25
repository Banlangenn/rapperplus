import * as _ from 'lodash';
import chalk from 'chalk';
import { Interface, Intf, UrlMapper } from '../types';

/**
 * 转换rap接口名称
 * 比如 magix 将 / 转换成 _ ，RESTful接口，清除占位符
 * 参数 noTransform 用来配置是否 将 / 转换成 _ ，默认转换
 */
export function rap2name(itf: Interface.Root, urlMapper: UrlMapper = t => t) {
  // copy from http://gitlab.alibaba-inc.com/thx/magix-cli/blob/master/util/rap.js
  const { method, url, repositoryId: projectId, id } = itf;
  const apiUrl = urlMapper(url);

  const regExp = /^(?:https?:\/\/[^\/]+)?(\/?.+?\/?)(?:\.[^./]+)?$/;
  const regExpExec = regExp.exec(apiUrl);

  if (!regExpExec) {
    console.log(
      chalk.red(
        `\n  ✘ 您的rap接口url设置格式不正确，参考格式：/api/test.json (接口url:${apiUrl}, 项目id:${projectId}, 接口id:${id})\n`,
      ),
    );
    return;
  }

  const urlSplit = regExpExec[1].split('/');

  //接口地址为RESTful的，清除占位符
  //api/:id/get -> api//get
  //api/bid[0-9]{4}/get -> api//get
  urlSplit.forEach((item, i) => {
    if (/\:id/.test(item)) {
      urlSplit[i] = '$id';
    } else if (/[\[\]\{\}]/.test(item)) {
      urlSplit[i] = '$regx';
    }
  });

  //只去除第一个为空的值，最后一个为空保留
  //有可能情况是接口 /api/login 以及 /api/login/ 需要同时存在
  if (urlSplit[0].trim() === '') {
    urlSplit.shift();
  }

  urlSplit.unshift(method.toLocaleUpperCase());
  return urlSplit.join('/');
}

/** 给接口增加 modelName */
export function getIntfWithModelName(
  intfs: Interface.Root[],
  urlMapper: UrlMapper = t => t,
): Intf[] {
  return intfs.map(itf => ({
    ...itf,
    modelName: rap2name(itf, urlMapper),
  }));
}

/** 接口去重 */
export function uniqueItfs(itfs: Intf[]) {
  const itfMap = new Map<string, Intf[]>();
  itfs.forEach(itf => {
    const name = itf.modelName;
    if (itfMap.has(name)) {
      itfMap.get(name).push(itf);
    } else {
      itfMap.set(name, [itf]);
    }
  });
  const newItfs: Intf[] = [];
  itfMap.forEach(dupItfs => {
    dupItfs.sort(
      // 后更改的在前面
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    newItfs.push(dupItfs[0]);
    if (dupItfs.length > 1) {
      console.log(
        chalk.yellow('发现重复接口，修改时间最晚的被采纳：\n') +
          dupItfs
            .map((itf, index) => {
              const str = `${itf.name}: http://rap2.alibaba-inc.com/repository/editor?id=${itf.repositoryId}&mod=${itf.moduleId}&itf=${itf.id}`;

              return index === 0 ? chalk.green(str) : chalk.gray(str);
            })
            .join('\n') +
          '\n',
      );
    }
  });
  return newItfs;
}
