var middguard = middguard || {};

(function () {
  'use strict';

  middguard.AppView = Backbone.View.extend({
    initialize: function () {
      this.$body = $('body');
      this.header = new middguard.HeaderView();
      this.packages = new middguard.PackagesView();
      this.obs = new middguard.ObsView();
      this.render();
    },
    render: function () {
      this.$body.append(this.header.render().el);
      $('#middguard-header').append(this.packages.render().el);
      $('#middguard-header').append(this.obs.render().el);
    }
  });
})();