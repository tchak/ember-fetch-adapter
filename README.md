ember-fetch-adapter
==============================================================================

[![Build Status](https://travis-ci.org/tchak/ember-fetch-adapter.svg?branch=master)](https://travis-ci.org/tchak/ember-fetch-adapter)
[![Ember Observer Score](http://emberobserver.com/badges/ember-fetch-adapter.svg)](http://emberobserver.com/addons/ember-fetch-adapter)
[![npm version](https://badge.fury.io/js/ember-fetch-adapter.svg)](http://badge.fury.io/js/ember-fetch-adapter)

A Network Adapter Service based on https://github.com/emberjs/rfcs/pull/171

Installation
------------------------------------------------------------------------------

```
ember install ember-fetch-adapter
```


Usage
------------------------------------------------------------------------------

```javascript
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  adapter: service(),

  model() {
    return this.adapter.fetch({ url: 'items' }).json();
  }
});
```


Contributing
------------------------------------------------------------------------------

### Installation

* `git clone <repository-url>`
* `cd ember-fetch-adapter`
* `yarn install`

### Linting

* `yarn lint:js`
* `yarn lint:js --fix`

### Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
