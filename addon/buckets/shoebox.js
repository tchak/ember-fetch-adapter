import { Response } from 'fetch';
import headersToObject from '../-private/headers-to-object';

const SHOEBOX_CACHE_NAMESPACE = 'SHOEBOX_CACHE_NAMESPACE';

export default class ShoeboxBucket {
  constructor(fastboot) {
    if (fastboot.isFastBoot) {
      this.cache = {};
      fastboot.shoebox.put(SHOEBOX_CACHE_NAMESPACE, this.cache);
    } else {
      this.cache = fastboot.shoebox.retrieve(SHOEBOX_CACHE_NAMESPACE);
    }
  }

  async get(cacheKey) {
    let responseData = this.cache[cacheKey];
    if (responseData) {
      let { body, status, statusText, headers } = responseData;
      return new Response(body, { headers, status, statusText });
    }
  }

  async set(cacheKey, response) {
    let body = await response.clone().text();
    let headers = headersToObject(response.headers);
    let responseData = {
      body,
      headers,
      status: response.status,
      statusText: response.statusText
    };
    this.cache[cacheKey] = responseData;
  }

  async delete(cacheKey) {
    delete this.cache[cacheKey];
  }
}
