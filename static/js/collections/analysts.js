var middguard = middguard || {};

(function() {
  'use strict';

  var Analysts = Backbone.Collection.extend({
    model: middguard.Analyst,
    url: 'analysts',
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

  middguard.Analysts = new Analysts();
})();
