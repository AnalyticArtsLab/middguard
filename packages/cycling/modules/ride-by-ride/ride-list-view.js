var middguard = middguard || {};

(function () {
  'use strict';

  var RideListView = middguard.View.extend({
    tagName: 'li',

    className: 'ride',

    template: _.template('<a href="#"><%- name %></a>'),

    events: {
      'click': 'toggleGpsTrace'
    },

    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
    },

    render: function () {
      this.$el.html(this.template({name: this.model.get('name')}));

      return this;
    },

    toggleGpsTrace: function () {
      if (!this.gpsTrace) {
        this.$el.addClass('active');
        this.gpsTrace = new middguard.GPSTraceView({ride: this.model}).render();
      } else {
        this.$el.removeClass('active');
        this.gpsTrace.remove();
        this.gpsTrace = null;
      }
    }
  });

  middguard.RideListView = RideListView;
  middguard.addSubview('RideListView', RideListView);
})();
