import { module, test } from 'qunit';
import { setupTest } from 'web-client/tests/helpers';

module('Unit | Route | performance-test', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:performance-test');
    assert.ok(route);
  });
});
