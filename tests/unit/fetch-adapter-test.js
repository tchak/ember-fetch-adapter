import { module, test } from 'qunit';
import FetchAdapter from 'ember-fetch-adapter';
import { setupFakeServer, stubRequest } from 'ember-cli-fake-server';

module('FetchAdapter', function(hooks) {
  setupFakeServer(hooks);

  hooks.beforeEach(function() {
    this.adapter = new FetchAdapter();
  });

  test('#requestFor', async function(assert) {
    let request = await this.adapter.requestFor({ url: 'posts' });

    assert.equal(request.url, '/posts');
    assert.equal(request.method, 'GET');
    assert.deepEqual(Array.from(request.headers), []);
  });

  test('#requestFor post', async function(assert) {
    let request = await this.adapter.requestFor({
      url: 'posts',
      method: 'post',
      data: { hello: 'world' }
    });

    assert.equal(request.url, '/posts');
    assert.equal(request.method, 'POST');

    assert.deepEqual(await request.json(), { hello: 'world' });
    assert.deepEqual(
      [...request.headers.entries()],
      [['content-type', 'application/json; charset=utf-8']]
    );
  });

  test('#request', async function(assert) {
    assert.expect(4);
    let posts = [{ id: 1 }];
    stubRequest('get', '/posts', request => {
      assert.deepEqual(request.queryParams, { sort: 'title' });
      return request.ok(posts);
    });

    let response = await this.adapter.request({
      url: 'posts',
      query: { sort: 'title' }
    });

    assert.ok(response.ok);
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, posts);
  });

  test('#buildURL', async function(assert) {
    let url = this.adapter.buildURL('posts');
    assert.equal(url, '/posts');

    url = this.adapter.buildURL('/posts');
    assert.equal(url, '/posts');

    url = this.adapter.buildURL('https://test.com/posts');
    assert.equal(url, 'https://test.com/posts');

    this.adapter.host = 'https://example.com';

    url = this.adapter.buildURL('posts');
    assert.equal(url, 'https://example.com/posts');

    url = this.adapter.buildURL('/posts');
    assert.equal(url, 'https://example.com/posts');

    url = this.adapter.buildURL('https://test.com/posts');
    assert.equal(url, 'https://test.com/posts');

    this.adapter.namespace = 'api';

    url = this.adapter.buildURL('posts');
    assert.equal(url, 'https://example.com/api/posts');

    url = this.adapter.buildURL('/posts');
    assert.equal(url, 'https://example.com/api/posts');

    url = this.adapter.buildURL('https://test.com/posts');
    assert.equal(url, 'https://test.com/posts');
  });
});
