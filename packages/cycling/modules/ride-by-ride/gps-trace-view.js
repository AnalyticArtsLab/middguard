var middguard = middguard || {};

(function () {
  'use strict';

  var GPSTraceView = middguard.View.extend({
    initialize: function (options) {
      this.ride = options.ride;

      this.mapView = middguard.__modules['RideByRide'].live;

      this.svg = this.mapView.svg;

      this.el = '#ride-' + this.ride.id + '-path';

      this.fetch('Gps-points', {
        data: {ride_id: this.ride.id},
        remove: false
      });

      this.listenTo(middguard.entities['Gps-points'], 'sync', this.render);
    },

    render: function () {
      var data = middguard.entities['Gps-points'].where({ride_id: this.ride.id});
      var mapView = this.mapView;

      var width = mapView.width,
          height = mapView.height;

      var path = d3.geo.path()
          .projection(mapView.projection);

      var gpsPath = d3.svg.line()
        .interpolate('cardinal')
        .x(function (d) { return mapView.projection([d.lon, d.lat])[0]; })
        .y(function (d) { return mapView.projection([d.lon, d.lat])[1]; });

      this.d3el = this.svg.append('path')
          .attr('d', gpsPath(data.map(function (d) {
              return {lon: d.get('longitude'), lat: d.get('latitude')};
          })))
          .attr('id', 'ride-' + this.ride.id + '-path')
          .attr('class', 'path')
          .style('fill', 'none')
          .style('stroke', 'purple')
          .style('stroke-width', '1.5px');

      return this;
    },
    remove: function () {
      d3.selectAll(this.el).remove();
      this.d3el = null;

      middguard.View.prototype.remove.call(this);
    }
  });

  middguard.GPSTraceView = GPSTraceView;
  middguard.addSubview('GPSTraceView', GPSTraceView);
})();
