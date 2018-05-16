import { serializeQueryParams } from 'ember-fetch/mixins/adapter-fetch';

export default function addQueryParams(url, queryParams) {
  if (queryParams && Object.keys(queryParams).length) {
    queryParams = serializeQueryParams(queryParams);
    let delimiter = url.indexOf('?') > -1 ? '&' : '?';
    return `${url}${delimiter}${queryParams}`;
  }
  return url;
}
