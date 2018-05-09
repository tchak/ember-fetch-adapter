import Adapter from './adapter';

const AdapterPrototype = Adapter.prototype;
const AdapterMixin = {};
for (let property of Object.getOwnPropertyNames(AdapterPrototype)) {
  if (property !== 'constructor') {
    AdapterMixin[property] = AdapterPrototype[property];
  }
}

export default AdapterMixin;
