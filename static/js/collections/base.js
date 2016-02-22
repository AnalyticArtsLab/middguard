var middguard = middguard || {};

(function() {
  'use strict';

  middguard.BaseCollection = Backbone.Collection.extend({
    initialize: function() {
      _.bindAll(this, 'serverCreate');
      this.ioBind('create', this.serverCreate, this);
    },
    serverCreate: function(data) {
      var exists = this.get(data.id);
      if (!exists) {
        this.add(data);
      } else {
        exists.set(data);
      }
    }
  });
})();
