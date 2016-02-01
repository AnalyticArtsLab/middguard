var _ = require('lodash');

module.exports = function() {
  return new analytics();
};

function analytics() {
  this.settings = {
    inputs: {},
    output: undefined
  };
};

/**
 * Add an input to the analytics module.
 *
 * Inputs are grouped by the module they come from.
 * Each input group represents a different module.
 * Input group names and variables don't have to share
 * a name with their corresponding connection (output
 * the previous module).
 *
 * @return `analytics.settings.inputs`
 * @public
 */

analytics.prototype.in = function(collection, inputs) {
  if (!inputs) {
    _.each(collection, (value, key) => {
      this.settings.inputs[key] = value;
    });
  } else {
    this.settings.inputs[collection] = inputs;
  }

  return this.get('inputs');
};

/**
 * Set the output collection for the analytics module.
 *
 * @return `analytics.settings.output`
 * @public
 */

analytics.prototype.out = function(collection) {
  this.set('output', collection);

  return this.get('output');
};

/**
 * Set a setting on the analytics module.
 *
 * @public
 */

analytics.prototype.set = function(key, value) {
  this.settings[key] = value;
  return this;
};

/**
 * Get a setting on the analytics module.
 *
 * @public
 */
analytics.prototype.get = function() {
  return this.settings[key];
};

analytics.prototype.prepare = function() {
  var middguard = this.get('middguard');

  if (!middguard) {
    raise new Error('Analytics require middguard to be set.');
  }
};
