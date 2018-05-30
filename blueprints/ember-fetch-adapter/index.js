module.exports = {
  description: 'Add ember-fetch in the consumer app',

  normalizeEntityName() {},

  /*
  * This is necessary until this is fixed
  * https://github.com/ember-cli/ember-fetch/issues/98
  */
  afterInstall() {
    return this.addAddonToProject({ name: 'ember-fetch', target: '^4.0.2' });
  }
};
