var middguard = middguard || {};

(function() {
  'use strict';

  var Nodes = middguard.BaseCollection.extend({
    model: middguard.Node,
    url: 'nodes'
  });

  middguard.Nodes = new Nodes();
})();
