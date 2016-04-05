var middguard = middguard || {};

(function () {
  'use strict';

  middguard.AppView = Backbone.View.extend({
    initialize: function () {
      this.$body = $('body');
      this.header = new middguard.HeaderView();
      // this.packages = new middguard.PackagesView();
      this.render();
    },
    render: function () {
      this.header.render();
      // $('#obs-control-div').append(this.packages.render().el);
    }
  });
})();
