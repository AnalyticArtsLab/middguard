var middguard = middguard || {};

(function () {
  'use strict';

  var RideByRide = middguard.View.extend({
    id: "ride-by-ride",

    template: _.template(
      '<p>Click a ride to toggle it on the map</p>' +
      '<ul class="ride-list"></ul>' +
      '<svg id="heatmap-svg" width="500" height="800"></svg>'
    ),

    initialize: function () {
      this.fetch('Rides', {
        remove: false
      });

      this.d3el = d3.select(this.el);
      this.$el.html(this.template());
      this.svg = this.d3el.select('#heatmap-svg');

      this.svgWidth = 500;
      this.svgHeight = 800;
      this.projection = d3.geo.albers();

      this.listenTo(middguard.entities['Rides'], 'sync', this.addAllRides);
    },
    render: function () {
      var _this = this;
      var projection = this.projection;

      // setup properties of the svg element
      var svg = this.svg;

      var width = this.svgWidth,
          height = this.svgHeight;

      // svg path contructors
      var path = d3.geo.path()
          .projection(this.projection);

      var gpsPath = d3.svg.line()
        .interpolate('cardinal')
        .x(function (d) { return projection([d.lon, d.lat])[0]; })
        .y(function (d) { return projection([d.lon, d.lat])[1]; });

      // create the base map
      d3.json('https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/us.json', function (error, us) {
        var states = topojson.feature(us, us.objects.states),
            state = _this.state = states.features.filter(function (d) {
              return d.id === 50;
            })[0];

        projection
            .scale(1)
            .translate([0, 0]);

        var b = path.bounds(state),
            s = 1.05 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
            t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

        projection
            .scale(s)
            .translate(t);

        svg.append('path')
            .datum(states)
            .attr('class', 'feature')
            .attr('d', path);

        svg.append('path')
            .datum(topojson.mesh(us, us.objects.states, function (a, b) { return a !== b; }))
            .attr('class', 'mesh')
            .attr('d', path);

        svg.append('path')
            .datum(state)
            .attr('class', 'outline')
            .attr('d', path);
      });

      return this;
    },

    addAllRides: function () {
      var _this = this;

      this.$('.ride-list').html('');
      middguard.entities['Rides'].each(function (model) {
        var view = new middguard.RideListView({model: model});
        _this.$('.ride-list').append(view.render().el);
      });
    }
  });

  middguard.addModule('RideByRide', RideByRide);
})();
