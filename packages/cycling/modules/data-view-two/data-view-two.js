var middguard = middguard || {};

(function () {
  'use strict';

  var CyclingDataViewTwo = middguard.View.extend({
    id: "cycling-data-view-two",

    template: _.template('<svg id="heatmap-svg" width="500" height="800">'),

    initialize: function () {
      this.fetch('Gps-points', {
        data: {cyclist_id: 3},
        remove: false
      });
      // this.fetch('Gps-points', {
      //   data: {cyclist_id: 2},
      //   remove: false
      // });

      this.d3el = d3.select(this.el);
      this.$el.html(this.template({}));
      this.svg = this.d3el.select('#heatmap-svg');

      this.listenTo(middguard.entities['Gps-points'], 'sync', this.render);
    },
    render: function () {
      var data = middguard.entities['Gps-points'];

      var svg = this.svg;

      var width = 500,
          height = 800;

      var projection = d3.geo.albers();

      var path = d3.geo.path()
          .projection(projection);

      var gpsPath = d3.svg.line()
        .interpolate('cardinal')
        .x(function (d) { return projection([d.lon, d.lat])[0]; })
        .y(function (d) { return projection([d.lon, d.lat])[1]; });

      d3.json('https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/us.json', function (error, us) {
        var states = topojson.feature(us, us.objects.states),
            state = states.features.filter(function (d) { return d.id === 50; })[0];

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

        // svg.append('path')
        //     .attr('d', gpsPath(data.map(function (d) {
        //         return {lon: d.get('longitude'), lat: d.get('latitude')};
        //     })))
        //     .attr('class', 'path')
        //     .style('fill', 'none')
        //     .style('stroke', 'purple')
        //     .style('stroke-width', '1.5px');

        svg.selectAll('.gpspoint')
            .data(data.models)
          .enter()
            .append('circle')
            .attr('class', 'gpspoint')
            .style('fill', 'purple')
            .attr('r', '0.5')
            .attr('cx', function (d) { return projection([d.get('longitude'), d.get('latitude')])[0] })
            .attr('cy', function (d) { return projection([d.get('longitude'), d.get('latitude')])[1] });

      });

      // this.svg
      //   .attr('width', width)
      //   .attr('height', height);
      //
      // this.svg
      //   .append('path')
      //   .attr('d', path(data.map(function (d) {
      //     return {lon: d.get('longitude'), lat: d.get('latitude')};
      //   })))
      //   .attr('class', 'path')
      //   .style('fill', 'none')
      //   .style('stroke', 'purple')
      //   .style('stroke-width', '1.5px');

      // data.each(_.bind(function (point) {
      //   this.$el.append(this.template(point.attributes));
      // }, this))

      return this;
    }
  });

  middguard.addModule('CyclingDataViewTwo', CyclingDataViewTwo);
})();
