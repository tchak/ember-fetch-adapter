import getPrivateScope from './get-private-scope';

export default class AdapterRequest {
  constructor(fetch, options) {
    this.fetch = fetch;
    if (options) {
      Object.assign(getPrivateScope(this), options);
    }
  }

  clone(options = {}) {
    let adapter = new AdapterRequest(this.fetch);
    Object.assign(getPrivateScope(adapter), getPrivateScope(this), options);
    return adapter;
  }

  url(url) {
    return this.clone({ url });
  }

  headers(headers) {
    headers = Object.assign({}, getPrivateScope(this).headers, headers);
    return this.clone({ headers });
  }

  /**
   * Shortcut to set the "Accept" header.
   * @param header Header value
   */
  accept(header) {
    return this.headers({ Accept: header });
  }

  /**
   * Shortcut to set the "Content-Type" header.
   * @param header Header value
   */
  content(header) {
    return this.headers({ 'Content-Type': header });
  }

  /**
   * Shortcut to set the "Authorization" header.
   * @param header Header value
   */
  auth(header) {
    return this.headers({ Authorization: header });
  }

  query(query) {
    query = Object.assign({}, getPrivateScope(this).query, query);
    return this.clone({ query });
  }

  options(options) {
    options = Object.assign({}, getPrivateScope(this).options, options);
    return this.clone({ options });
  }

  body(body) {
    return this.clone({ body });
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
    let options = Object.assign({}, getPrivateScope(this), { method });
    return this.fetch(options);
  }
}
