import { createModel } from './index';
import { resolve } from 'path';

createModel({
  /** rap项目id */
  projectId: 3564,
  baseFetchPath: resolve(__dirname, './basefetch.ts'),
  additionalProperties: false,
  useCommonJsModule: true,
  optionalExtra: false,
  /** 输出文件的目录，默认是 ./model */
  outputPath: resolve(process.cwd(), './test_data/model'),
  /** rap地址，默认是 http://rap2api.taobao.org */
  rapUrl: 'https://rap2api.alibaba-inc.com',
  type: 'redux'
});
// .then(() => {
//     console.log('rapper:generate model success')
// })
// .catch(err => {
//     console.log('rapper:generate model failed', err)
// })