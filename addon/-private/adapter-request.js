export default class AdapterRequest {
  constructor(fetch, options = {}) {
    this.fetch = fetch;
    this.options = options;
  }

  factory(options = {}) {
    options = Object.assign({}, this.options, options);
    return new AdapterRequest(this.fetch, options);
  }

  url(url) {
    return this.factory({ url });
  }

  headers(headers) {
    headers = Object.assign(this.options.headers || {}, headers);
    return this.factory({ headers });
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
    query = Object.assign(this.options.query || {}, query);
    return this.factory({ query });
  }

  options(options) {
    options = Object.assign(this.options.options || {}, options);
    return this.factory({ options });
  }

  body(body) {
    return this.factory({ body });
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
    let options = Object.assign({}, this.options, { method });
    return this.fetch(options);
  }
}
