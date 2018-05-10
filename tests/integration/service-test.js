import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Integration | Service | adapter', function(hooks) {
  setupTest(hooks);

  test('inject service', function(assert) {
    let adapter = this.owner.lookup('service:adapter');
    assert.ok(adapter);
  });
});
