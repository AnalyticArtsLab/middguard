var middguard = middguard || {};

(function() {
  'use strict';

  var Nodes = middguard.BaseCollection.extend({
    model: middguard.Node,
    url: 'node',

    connectTo: function(other) {
      var outputs = this.get('outputs');
      var inputs = other.
    }
  });

  middguard.Nodes = new Nodes();
})();
