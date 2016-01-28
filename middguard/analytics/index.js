var _ = require('lodash');

/**
 * Add an input to the analytics module.
 *
 * Inputs are grouped by the module they come from.
 * Each input group represents a different module.
 * Input group names and variables don't have to share
 * a name with their corresponding connection (output
 * the previous module).
 *
 * @return `analytics.inputs`
 * @public
 */

var input = function(collection, inputs) {
  this.inputs[collection] = inputs;
};

module.exports = function() {
  var analytics = {
    inputs: {},
    outputs: {}
  };

  _.extend(analytics, {input: input});

  return analytics;
};
