import { module, test } from 'qunit';
import Adapter from 'ember-fetch-adapter/adapter';
import { AbortController } from 'fetch';
import { setupFakeServer, stubRequest } from 'ember-cli-fake-server';

module('FetchAdapter', function(hooks) {
  hooks.beforeEach(function() {
    this.adapter = new Adapter();
  });

  module('with pretender', function(hooks) {
    setupFakeServer(hooks);

    test('#fetch()', async function(assert) {
      assert.expect(5);
      let posts = [{ id: 1 }];
      stubRequest('get', '/posts', request => {
        assert.deepEqual(request.queryParams, { sort: 'title' });
        return request.ok(posts);
      });

      let response = await this.adapter.fetch({
        url: 'posts',
        query: { sort: 'title' }
      });

      assert.ok(response.ok);
      assert.equal(response.status, 200);
      assert.equal(response.statusText, 'OK');
      assert.ok(response.headers.has('content-type'));
    });

    test('#fetch().response()', async function(assert) {
      assert.expect(6);
      let posts = [{ id: 1 }];
      stubRequest('get', '/posts', request => {
        assert.deepEqual(request.queryParams, { sort: 'title' });
        return request.ok(posts);
      });

      let response = await this.adapter
        .fetch({
          url: 'posts',
          query: { sort: 'title' }
        })
        .response();

      assert.ok(response.ok);
      assert.equal(response.status, 200);
      assert.equal(response.statusText, 'OK');
      assert.deepEqual(response.headers, {
        'content-type': 'application/json'
      });
      assert.deepEqual(await response.json(), posts);
    });

    test('#fetch().url().json()', async function(assert) {
      assert.expect(2);
      let posts = [{ id: 1 }];
      stubRequest('get', '/posts', request => {
        assert.deepEqual(request.queryParams, { sort: 'title' });
        return request.ok(posts);
      });

      let body = await this.adapter
        .request()
        .url('posts')
        .query({ sort: 'title' })
        .get()
        .json();

      assert.deepEqual(body, posts);
    });

    test('#fetch().url().json() 404', async function(assert) {
      assert.expect(4);
      let error = { error: 'not found' };
      stubRequest('get', '/posts', request => {
        return request.notFound(error);
      });

      let e = await this.adapter
        .request()
        .url('posts')
        .get()
        .json()
        .catch(e => e);

      assert.ok(e instanceof Error);
      assert.equal(e.message, 'NetworkError');
      assert.equal(e.status, 404);
      assert.deepEqual(e.body, error);
    });

    test('#fetch().url().json() 204', async function(assert) {
      assert.expect(2);
      stubRequest('put', '/posts/1', request => {
        return request.noContent();
      });

      let request = this.adapter
        .request()
        .url('posts/1')
        .put();

      let response = await request.response();
      let body = await request.json();

      assert.equal(body, null);
      assert.equal(response.status, 204);
    });
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
      body: { hello: 'world' }
    });

    assert.equal(request.url, '/posts');
    assert.equal(request.method, 'POST');

    assert.deepEqual(await request.json(), { hello: 'world' });
    assert.deepEqual(
      [...request.headers.entries()],
      [['content-type', 'application/json; charset=utf-8']]
    );
  });

  test('#requestFor empty query params', async function(assert) {
    let request = await this.adapter.requestFor({ url: 'posts', query: {} });
    assert.equal(request.url, '/posts');
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

  const URL_WITH_DELAY = 'https://reqres.in/api/users?delay=2';

  test('timeout', async function(assert) {
    assert.expect(1);

    // stubRequest(
    //   'get',
    //   '/posts',
    //   request => {
    //     console.log(request);
    //     assert.ok(false, 'should abort');
    //     return request.noContent();
    //   },
    //   100000000
    // );

    try {
      await this.adapter.fetch({
        url: URL_WITH_DELAY,
        timeout: 1
      });
    } catch (e) {
      assert.equal(e.name, 'AbortError');
    }
  });

  module('abort', function() {
    test('after request', function(assert) {
      assert.expect(1);
      let controller = new AbortController();
      let done = assert.async();

      this.adapter
        .fetch({
          url: URL_WITH_DELAY,
          signal: controller.signal
        })
        .catch(e => {
          assert.equal(e.name, 'AbortError');
          done();
        });
      controller.abort();
    });

    test('before request', async function(assert) {
      assert.expect(1);
      let controller = new AbortController();
      controller.abort();

      try {
        await this.adapter.fetch({
          url: URL_WITH_DELAY,
          signal: controller.signal
        });
      } catch (e) {
        assert.equal(e.name, 'AbortError');
      }
    });

    test('with timeout', async function(assert) {
      assert.expect(1);
      let controller = new AbortController();

      try {
        await this.adapter.fetch({
          url: URL_WITH_DELAY,
          timeout: 1,
          signal: controller.signal
        });
      } catch (e) {
        assert.equal(e.name, 'AbortError');
      }
    });

    test('abort with timeout', function(assert) {
      assert.expect(1);
      let controller = new AbortController();
      let done = assert.async();

      this.adapter
        .fetch({
          url: URL_WITH_DELAY,
          timeout: 1,
          signal: controller.signal
        })
        .catch(e => {
          assert.equal(e.name, 'AbortError');
          done();
        });
      controller.abort();
    });
  });
});
