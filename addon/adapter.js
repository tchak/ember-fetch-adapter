import fetch, { Request, Headers } from 'fetch';
import { serializeQueryParams } from 'ember-fetch/mixins/adapter-fetch';
import AdapterRequest from './-private/adapter-request';
import AdapterResponse from './-private/adapter-response';
import merge from './-private/merge';
import signalForRequest from './-private/signal-for-request';

export default class Adapter {
  constructor(options = {}) {
    if (options.timeout) {
      this.timeout = options.timeout;
    }
  }

  async methodForRequest({ method = 'get' }) {
    return method;
  }

  async headersForRequest({ headers }) {
    return merge(this.headers, headers);
  }

  async pathForRequest({ url }) {
    return url;
  }

  async queryForRequest({ query }) {
    return query;
  }

  async bodyForRequest({ body }) {
    if (typeof body === 'string') {
      return body;
    }
    return JSON.stringify(body);
  }

  async normalizeSuccess(options, body) {
    return body;
  }

  async normalizeError(options, body) {
    return body;
  }

  normalize(options, body, response) {
    if (arguments.length === 1) {
      return (body, response) => this.normalize(options, body, response);
    }
    if (response.ok) {
      return this.normalizeSuccess(options, body, response);
    }
    return this.normalizeError(options, body, response);
  }

  request(params) {
    return new AdapterRequest(options => this.fetch(options), params);
  }

  fetch(options) {
    let { signal, timeout } = options;
    let response = this.requestFor(options).then(request =>
      this.makeRequest(request, { signal, timeout })
    );
    return new AdapterResponse(response, this.normalize(options));
  }

  async urlForRequest(options) {
    let path = await this.pathForRequest(options);
    let query = await this.queryForRequest(options);

    let url = this.buildURL(path);

    if (query) {
      query = serializeQueryParams(query);
      let delimiter = url.indexOf('?') > -1 ? '&' : '?';
      url += `${delimiter}${query}`;
    }

    return url;
  }

  async optionsForRequest({ options }) {
    let { mode = 'cors', credentials = 'same-origin' } = options || {
      mode: 'cors',
      credentials: 'same-origin'
    };

    return {
      mode,
      credentials
    };
  }

  buildURL(path) {
    if (/^\/\//.test(path) || /http(s)?:\/\//.test(path)) {
      // Do nothing, the full host is already included.
      return path;
    }

    let { host, namespace } = this;
    let url = [];

    if (!host || host === '/') {
      host = '';
    }
    if (host) {
      url.push(host);
    }
    if (namespace) {
      url.push(namespace);
    }
    url = url.join('/');

    if (path.charAt(0) === '/') {
      url += path;
    } else {
      url += '/' + path;
    }

    if (!host && url && url.charAt(0) !== '/') {
      url = '/' + url;
    }

    url = this.buildServerURL(url);

    return url;
  }

  buildServerURL(url) {
    return url;
  }

  makeRequest(request, options = {}) {
    let [signal, resolve, reject] = signalForRequest(options);

    if (signal) {
      request.signal = signal;
    }
    if (resolve && reject) {
      return fetch(request).then(resolve, reject);
    }

    return fetch(request);
  }

  async requestFor(params) {
    params = Object.freeze(params);

    let method = await this.methodForRequest(params);
    let url = await this.urlForRequest(params);
    let headers = await this.headersForRequest(params);
    let options = await this.optionsForRequest(params);

    method = method.toUpperCase();
    headers = new Headers(headers);

    options.method = method;
    options.headers = headers;

    if (method === 'GET' || method === 'HEAD') {
      if (params.body) {
        throw new Error(`${method} request with body`);
      }
    } else {
      let body = await this.bodyForRequest(params);

      if (body) {
        options.body = body;

        if (!headers.has('content-type')) {
          headers.set('content-type', 'application/json; charset=utf-8');
        }
      }
    }

    return new Request(url, options);
  }
}
