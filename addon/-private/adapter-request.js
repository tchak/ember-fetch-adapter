import { assign } from '@ember/polyfills';
import getPrivateScope from './get-private-scope';
import merge, { deepMerge } from './merge';

export default class AdapterRequest {
  constructor(fetch, options) {
    this.fetch = fetch;
    if (options) {
      assign(getPrivateScope(this), options);
    }
  }

  clone(options = {}) {
    let adapter = new AdapterRequest(this.fetch);
    options = deepMerge(getPrivateScope(this), options);
    assign(getPrivateScope(adapter), options);
    return adapter;
  }

  url(url) {
    return this.clone({ url });
  }

  headers(headers) {
    return this.clone({ headers });
  }

  query(query) {
    return this.clone({ query });
  }

  options(options) {
    return this.clone({ options });
  }

  body(body) {
    return this.clone({ body });
  }

  /**
   * Shortcut to set the "Accept" header.
   * @param header Header value
   */
  accept(header) {
    return this.headers({ accept: header });
  }

  /**
   * Shortcut to set the "Content-Type" header.
   * @param header Header value
   */
  content(header) {
    return this.headers({ 'content-type': header });
  }

  /**
   * Shortcut to set the "Authorization" header.
   * @param header Header value
   */
  auth(header) {
    return this.headers({ authorization: header });
  }

  json(object) {
    return this.content('application/json').body(JSON.stringify(object));
  }

  get() {
    return this.method('get');
  }

  head() {
    return this.method('head');
  }

  post() {
    return this.method('post');
  }

  patch() {
    return this.method('patch');
  }

  put() {
    return this.method('put');
  }

  delete() {
    return this.method('delete');
  }

  method(method) {
    let options = merge(getPrivateScope(this), { method });
    return this.fetch(options);
  }
}
