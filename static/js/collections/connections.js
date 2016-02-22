var middguard = middguard || {};

(function() {
  'use strict';

  var Connections = middguard.BaseCollection.extend({
    model: middguard.Connection,
    url: 'connection'
  });

  middguard.Connections = new Connections();
})();
