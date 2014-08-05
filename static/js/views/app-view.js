var middguard = middguard || {};

(function () {
  'use strict';

  middguard.AppView = Backbone.View.extend({
    initialize: function () {
      this.$body = $('body');
      // this.packages = new MiddGuard.PackagesView();
      this.chat = new middguard.ChatView();

      this.render();
    },
    render: function () {
      // this.$body.append(this.packages.render().el);
      this.$body.append(this.chat.render().el);
    }
  });
})();