export default class InMemoryBucket {
  constructor() {
    this.map = new Map();
  }

  async get(cacheKey) {
    let response = this.map.get(cacheKey);
    if (response) {
      return response.clone();
    }
  }

  async set(cacheKey, response) {
    this.map.set(cacheKey, response.clone());
  }

  async delete(cacheKey) {
    this.map.delete(cacheKey);
  }
}
