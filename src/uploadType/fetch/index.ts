// import * as fetch from ;
const fetch = require('node-fetch');
export function uploadInterface(properties: any, interfaceId: number, cookie: string) {
  return fetch(`http://rap2api.taobao.org/properties/update?itf=${interfaceId}`, {
    headers: {
      'content-type': 'application/json',
      cookie,
    },
    body: JSON.stringify({ properties, summary: { bodyOption: 'FORM_DATA', posFilter: 2 } }),
    method: 'POST',
  })
    .then(e => e.json())
    .then(e => {
      if (e.isOk || e.data) {
        console.log('提交服务器成功');
      } else {
        console.log('失败', e.errMsg);
      }
    })

    .catch(err => {
      console.log('失败', err);
    });
}
