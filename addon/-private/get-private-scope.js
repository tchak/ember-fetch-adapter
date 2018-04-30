const hasWeakMap = typeof WeakMap !== 'undefined';
const PRIVATE_SCOPE = hasWeakMap ? new WeakMap() : undefined;
const PRIVATE_KEY = '__3454hu5yu43hr47y7efh';

export default (hasWeakMap
  ? function(object) {
      if (!PRIVATE_SCOPE.has(object)) {
        let scope = Object.create(null);
        PRIVATE_SCOPE.set(object, scope);
        return scope;
      }

      return PRIVATE_SCOPE.get(object);
    }
  : function(object) {
      if (!object[PRIVATE_KEY]) {
        let scope = Object.create(null);
        object[PRIVATE_KEY] = scope;
        return scope;
      }

      return object[PRIVATE_KEY];
    });
