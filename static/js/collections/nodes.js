var middguard = middguard || {};

(function() {
  'use strict';

  var Nodes = middguard.BaseCollection.extend({
    model: middguard.Node,

    url: 'nodes',

    initialize: function() {
      _.bindAll(this, 'serverCreate', 'serverUpdate');

      this.ioBind('create', this.serverCreate, this);
      this.ioBind('update', this.serverUpdate, this);
    },

    serverCreate: function(data) {
      var exists = this.get(data.id);
      if (!exists) {
        this.add(data);
      } else {
        exists.set(data);
      }
    },

    serverUpdate: function(data) {
      var exists = this.get(data.id);
      if (exists) {
        exists.set(data);
      }
    }
  });

  middguard.Nodes = new Nodes();
})();
