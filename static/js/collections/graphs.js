var middguard = middguard || {};

(function() {
  'use strict';

  var Graphs = middguard.BaseCollection.extend({
    model: middguard.Graph,
    url: 'graphs'
  });

  middguard.Graphs = new Graphs();
})();
