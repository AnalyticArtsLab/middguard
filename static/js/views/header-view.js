var middguard = middguard || {};

(function () {
  'use strict';

  middguard.HeaderView = Backbone.View.extend({
    el: '#middguard-header',

    template: _.template($('#sidebar-template').html()),

    events: {
      'click #toggle-graphs' : 'showGraphsPanel',
      'click #toggle-messages': 'showMessagesPanel',
      'click #toggle-user': 'showUserPanel'
    },

    initialize: function (options) {
      options = options || {};
      this.activePanel = options.activePanel || 'graphs';
    },

    render: function () {
      this.$el.html(this.template());

      this.$('.toggle-panel:not(#panel-' + this.activePanel + ')').hide()
      this.$('#toggle-' + this.activePanel).addClass('active');

      var observationsView = new middguard.ObservationsView();
      this.$('#panel-messages').append(observationsView.render().el);

      var graphsView = new middguard.GraphsView();
      this.$('#panel-graphs').append(graphsView.render().el);
      return this;
    },

    showUserPanel: function() {
      this.activePanel = 'user';
      this.render();
    },

    showGraphsPanel: function() {
      this.activePanel = 'graphs';
      this.render();
    },

    showMessagesPanel: function() {
      this.activePanel = 'messages';
      this.render();
    }
  });
})();
