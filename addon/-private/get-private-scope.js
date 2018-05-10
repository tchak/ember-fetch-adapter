import { assign } from '@ember/polyfills';
const hasWeakMap = typeof WeakMap !== 'undefined';
const PRIVATE_SCOPE = hasWeakMap ? new WeakMap() : undefined;
const PRIVATE_KEY = '__3454hu5yu43hr47y7efh';

export default (hasWeakMap
  ? function(object, properties) {
      let scope;
      if (!PRIVATE_SCOPE.has(object)) {
        scope = Object.create(null);
        PRIVATE_SCOPE.set(object, scope);
      } else {
        scope = PRIVATE_SCOPE.get(object);
      }
      if (properties) {
        assign(scope, properties);
      }
      return scope;
    }
  : function(object, properties) {
      let scope;
      if (!object[PRIVATE_KEY]) {
        scope = Object.create(null);
        object[PRIVATE_KEY] = scope;
      } else {
        scope = object[PRIVATE_KEY];
      }
      if (properties) {
        assign(scope, properties);
      }
      return scope;
    });
