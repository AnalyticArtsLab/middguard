var _ = require('lodash');

var Analytics = function() {};

_.extend(Analytics.prototype, {
  prepare: function(middguard, in, out) {
    var Bookshelf = middguard.get('bookshelf');
    var Connection = Bookshelf.model('Connections');
  }
});

// Backbone.x.extend
Analytics.extend = function(protoProps, staticProps) {
  var parent = this;
  var child;

  if (protoProps && _.has(protoProps, 'constructor')) {
    child = protoProps.constructor;
  } else {
    child = function() { return parent.apply(this, arguments); };
  }

  _.extend(child, parent, staticProps);

  var Surrogate = function() { this.constructor = child; };
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate();

  if (protoProps) {
    _.extend(child.prototype, protoProps);
  }

  child.__super__ = parent.prototype;

  return child;
};

// analytics.prototype.prepare = function() {
//   var middguard = this.get('middguard');
//
//   if (!middguard) {
//     raise new Error('Analytics require middguard to be set.');
//   }
// };

module.exports = Analytics;
