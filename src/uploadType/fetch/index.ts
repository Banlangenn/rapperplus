// import * as fetch from ;
const fetch = require('node-fetch');
export function uploadInterface(
  properties: any,
  interfaceId: number,
  cookie: string,
): Promise<any> {
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
      } else {
        throw new Error(e.errMsg);
      }
    })

    .catch(err => {
      throw new Error(err);
    });
}
