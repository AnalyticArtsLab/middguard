var middguard = middguard || {};

(function() {
  'use strict';

  var <%- mainView %> = middguard.View.extend({
    id: '<%- moduleName %>',

    className: 'middguard-module',

    template: _.template(),

    initialize: function() {
      this.context = this.createContext();
    },

    render: function() {
      this.$el.html(this.template());

      return this;
    }
  });

  middguard.addModule('<%- mainView %>', <%- mainView %>);
})();
