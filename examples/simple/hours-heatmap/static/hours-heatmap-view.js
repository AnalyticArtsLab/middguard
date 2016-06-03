var middguard = middguard || {};

(function() {
  var HoursHeatmapView = middguard.View.extend({
    id: 'hours-heatmap',

    className: 'list-unstyled middguard-module',

    tagName: 'div',

    events: {
      'mouseover .dayhour': 'showInputTooltip',
      'mouseout .dayhour': 'hideInputTooltip'
    },

    template: _.template(
      '<h4>Hours Heatmap</h4>' +
      '<div class="heatmap-tooltip">' +
        '<span class="count1"></span>' +
        '<span class="count2"></span>' +
      '</div>'
    ),

    initialize: function() {
      this.context = this.createContext();
      console.log(this.context);

      var tableName = this.context.inputs.hours.tableName;
      this.listenTo(this.context.inputs.hours.collection, 'reset', this.render);

      this.fetch(tableName, {reset: true, data: {}});
    },

    render: function() {
      this.$el.html(this.template());
      this.$el.css('position', 'relative');

      var data = this.context.inputs.hours.collection.map(function(hours) {
        return _.clone(hours.attributes);
      });

      var margin = {top: 0, left: 90, right: 0, bottom: 20};

      var rowHeight = 60,
          height = 7 * rowHeight - margin.top - margin.bottom,
          colWidth = 60,
          width = colWidth * 24 - margin.left - margin.right;

      var week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      var x = this.x = d3.scale.linear()
          .domain([0, 23])
          .range([colWidth / 2, width - colWidth / 2]);

      var y = this.y = d3.scale.linear()
          .domain([0, 6])
          .range([rowHeight / 2, height - rowHeight / 2]);

      var xAxis = d3.svg.axis()
          .scale(x)
          .ticks(24)
          .orient('bottom');

      var yAxis = d3.svg.axis()
          .scale(y)
          .orient('left')
          .ticks(6)
          .tickFormat(function(d) {
            return week[d];
          });

      var size = this.size = d3.scale.sqrt()
          .domain([0, d3.max(data, function(d) { return Math.max(d.count1, d.count2); })])
          .range([0, 25]);

      var svg = d3.select(this.el).select('svg')[0][0]
              ? d3.select(this.el).select('svg')
              : d3.select(this.el).append('svg');

      svg = svg
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

      var circles = svg
        .selectAll('g.dayhour')
          .data(data)
        .enter().append('g')
          .attr('class', 'dayhour')
          .attr('transform', function(d, i) {
            return 'translate(' + x(d.hour) + ',' + y(d.day) + ')';
          });

      circles.append('circle')
          .attr('r', function(d) { return size(d.count1); })
          .style('fill', 'transparent')
          .style('stroke-width', 2)
          .style('stroke', 'orange');

      circles.append('circle')
          .attr('r', function(d) { return size(d.count2); })
          .style('fill', 'transparent')
          .style('stroke-width', 2)
          .style('stroke', 'steelblue');

      svg.append('g')
          .attr('class', 'y axis')
          .call(yAxis);

      svg.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + height + ')')
          .call(xAxis);

      return this;
    },

    showInputTooltip: function(event) {
      var tooltip = d3.select('.heatmap-tooltip');

      var d = d3.select(event.target).datum();
      tooltip.select('.count1').text(d.count1);
      tooltip.select('.count2').text(d.count2);

      var bounds = event.currentTarget.getBoundingClientRect(),
          inputRadius = 5,
          tooltipWidth = parseFloat(tooltip.style('width')) / 2,
          tooltipHeight = parseFloat(tooltip.style('height')) + 5;

      tooltip
        .style('left', (this.x(d.hour) + 65) + 'px')
        .style('top', (this.y(d.day) - this.size(Math.max(d.count1, d.count2)) - 10) + 'px')
        .style('visibility', 'visible');
    },

    hideInputTooltip: function() {
      d3.select('.heatmap-tooltip')
          .style('visibility', 'hidden');
    }
  });

  middguard.addModule('HoursHeatmapView', HoursHeatmapView);
})();
