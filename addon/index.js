import Service from '@ember/service';
import { computed } from '@ember/object';
import { getOwner } from '@ember/application';
import { get } from '@ember/object';
import AdapterMixin from './adapter-mixin';

const httpRegex = /^https?:\/\//;
const protocolRelativeRegex = /^\/\//;

export default Service.extend(AdapterMixin, {
  timeout: null,

  init() {
    this._super(...arguments);
    this.fetch = this.fetch.bind(this);
  },

  fastboot: computed(function() {
    let owner = getOwner(this);
    return owner && owner.lookup('service:fastboot');
  }),

  protocol: computed(function() {
    let protocol = get(this, 'fastboot.request.protocol');
    // In Prember the protocol is the string 'undefined', so we default to HTTP
    if (protocol === 'undefined:') {
      protocol = 'http:';
    }

    return protocol;
  }),

  buildServerURL(url) {
    if (!get(this, 'fastboot.isFastBoot')) {
      return url;
    }
    let protocol = get(this, 'protocol');
    let host = get(this, 'fastboot.request.host');

    if (protocolRelativeRegex.test(url)) {
      return `${protocol}${url}`;
    } else if (!httpRegex.test(url)) {
      try {
        return `${protocol}//${host}${url}`;
      } catch (fbError) {
        throw new Error(
          'You are using Fetch Adapter with no host defined in your adapter. This will attempt to use the host of the FastBoot request, which is not configured for the current host of this request. Please set the hostWhitelist property for in your environment.js. FastBoot Error: ' +
            fbError.message
        );
      }
    }
  }
});
