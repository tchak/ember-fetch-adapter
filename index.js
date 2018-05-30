'use strict';

module.exports = {
  name: 'ember-fetch-adapter',

  included() {
    this._super.included.apply(this, arguments);

    this.import('node_modules/network-adapter/dist/browser.js', {
      using: [{ transformation: 'amd', as: 'network-adapter' }]
    });
  }
};
