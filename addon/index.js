import Service from '@ember/service';
import { computed } from '@ember/object';
import { getOwner } from '@ember/application';
import { get } from '@ember/object';
import AdapterMixin from './adapter-mixin';

const httpRegex = /^https?:\/\//;
const protocolRelativeRegex = /^\/\//;

export default Service.extend(AdapterMixin, {
  timeout: null,

  fastboot: computed(function() {
    let owner = getOwner(this);
    return owner && owner.lookup('service:fastboot');
  }),

  protocolForUrl(url) {
    if (get(this, 'fastboot.isFastBoot')) {
      url = this.buildFastbootURL(url);
    }
    return url;
  },

  buildFastbootURL(url) {
    let protocol = get(this, 'fastboot.request.protocol');
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
