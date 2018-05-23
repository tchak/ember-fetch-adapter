import InMemoryBucket from './buckets/in-memory';

export default class Cache {
  constructor(bucket) {
    this.bucket = bucket || new InMemoryBucket();
  }

  async match(request) {
    return this.get(request);
  }

  async put(request, response) {
    if (response.ok) {
      await this.set(request, response);
      return true;
    }
    return false;
  }

  cacheKey(request) {
    return request.url;
  }

  async delete(request) {
    let cacheKey = this.cacheKey(request);
    await this.bucket.delete(cacheKey);
  }

  async get(request) {
    let cacheKey = this.cacheKey(request);
    return this.bucket.get(cacheKey) || null;
  }

  async set(request, response) {
    let cacheKey = this.cacheKey(request);
    if (!cacheKey) {
      throw new Error('Invalid cache key!');
    }
    await this.bucket.set(cacheKey, response.clone());
  }
}
