var middguard = middguard || {};

(function() {
  'use strict';

  var Graphs = middguard.BaseCollection.extend({
    model: middguard.Graph,
    url: 'graph'
  });

  middguard.Graphs = new Graphs();
})();
