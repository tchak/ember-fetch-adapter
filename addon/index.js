import Service from '@ember/service';
import { computed } from '@ember/object';
import { getOwner } from '@ember/application';
import { get } from '@ember/object';
import { hash } from 'rsvp';
import fetch, { Request, Headers } from 'fetch';
import { serializeQueryParams } from 'ember-fetch/mixins/adapter-fetch';
import AdapterRequest from './-private/adapter-request';
import AdapterResponse from './-private/adapter-response';

const httpRegex = /^https?:\/\//;
const protocolRelativeRegex = /^\/\//;

export default Service.extend({
  fastboot: computed(function() {
    let owner = getOwner(this);
    return owner && owner.lookup('service:fastboot');
  }),

  async methodForRequest({ method = 'get' }) {
    return method;
  },

  async headersForRequest({ headers }) {
    return Object.assign({}, this.headers, headers);
  },

  async pathForRequest({ url }) {
    return url;
  },

  async queryForRequest({ query }) {
    return query;
  },

  async bodyForRequest({ body }) {
    if (typeof body === 'string') {
      return body;
    }
    return JSON.stringify(body);
  },

  async normalizeSuccess(options, body) {
    return body;
  },

  async normalizeError(options, body) {
    return body;
  },

  normalize(options, body, response) {
    if (arguments.length === 1) {
      return (body, response) => this.normalize(options, body, response);
    }
    if (response.ok) {
      return this.normalizeSuccess(options, body, response);
    }
    return this.normalizeError(options, body, response);
  },

  fetch(options) {
    if (arguments.length === 0) {
      return new AdapterRequest(options => this.fetch(options));
    }
    let response = this.requestFor(options).then(request => fetch(request));
    return new AdapterResponse(response, this.normalize(options));
  },

  async urlForRequest(options) {
    let { path, query } = await hash({
      path: this.pathForRequest(options),
      query: this.queryForRequest(options)
    });

    let url = this.buildURL(path);

    if (query) {
      query = serializeQueryParams(query);
      let delimiter = url.indexOf('?') > -1 ? '&' : '?';
      url += `${delimiter}${query}`;
    }

    return url;
  },

  async optionsForRequest({ options }) {
    let { mode = 'cors', credentials = 'same-origin' } = options || {
      mode: 'cors',
      credentials: 'same-origin'
    };

    return {
      mode,
      credentials
    };
  },

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

    if (get(this, 'fastboot.isFastBoot')) {
      url = this.buildFastbootURL(url);
    }

    return url;
  },

  buildFastbootURL(url) {
    let protocol = get(this, 'fastboot.request.protocol');
    let host = get(this, 'fastboot.request.host');

    if (protocolRelativeRegex.test(url)) {
      return `${protocol}${url}`;
    } else if (!httpRegex.test(url)) {
      try {
        return `${protocol}//${host}${url}`;
      } catch (fbError) {
        throw new Error(
          'You are using Fetch Adapter with no host defined in your adapter. This will attempt to use the host of the FastBoot request, which is not configured for the current host of this request. Please set the hostWhitelist property for in your environment.js. FastBoot Error: ' +
            fbError.message
        );
      }
    }
  },

  async requestFor(params) {
    params = Object.freeze(params);

    let { method, url, headers, options } = await hash({
      method: this.methodForRequest(params),
      url: this.urlForRequest(params),
      headers: this.headersForRequest(params),
      options: this.optionsForRequest(params)
    });

    method = method.toUpperCase();
    headers = new Headers(headers);

    Object.assign(options, {
      method,
      headers
    });

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
});
