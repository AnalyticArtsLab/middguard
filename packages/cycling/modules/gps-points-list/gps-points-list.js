var middguard = middguard || {};

(function () {
  'use strict';

  var GPSPointsList = middguard.View.extend({
    id: "cycling-data-view",

    template: _.template('<p>(lat: <%- latitude %>, lon: <%- longitude %>)</p>'),

    initialize: function () {
      this.fetch('Gps-points', {
        data: {ride_id: 21},
        remove: false
      });

      // The above is a convenience method so you don't have to specify
      // middguard_view_name.
      // It is equivalent to the following:

      // this.entities = ['Gps-points'];
      // middguard.entities['Gps-points'].fetch({
      //   data: {cyclist_id: 1},
      //   reset: false,
      //   middguard_view_name: 'CyclingDataView'
      // });

      this.listenTo(middguard.entities['Gps-points'], 'sync', this.render);
    },
    render: function () {
      var data = middguard.entities['Gps-points'];

      this.$el.append('<h4>View One</h4>');

      data.each(_.bind(function (point) {
        this.$el.append(this.template(point.attributes));
      }, this))

      return this;
    }
  });

  middguard.addModule('GPSPointsList', GPSPointsList);
})();
