var middguard = middguard || {};

(function () {
  'use strict';

  var BarChartMessagesView = Backbone.View.extend({
    id: '#bar-chart-messages',
    initialize: function () {
      // Properties for our chart
      this.margin = {top: 20, right: 20, bottom: 30, left: 40};
      this.height = 300 - this.margin.top - this.margin.bottom;
      this.width = 500 - this.margin.left - this.margin.right;

      // Setup elements for the view
      this.d3el = d3.select(this.el);
      this.svg = this.d3el.append('svg');
      this.xAxisEl = this.svg.append('g').attr('class', 'x axis');
      this.yAxisEl = this.svg.append('g').attr('class', 'y axis');
      this.rectsEl = this.svg.append('g').attr('class', 'rects')
          .attr('transform', 'translate(' + this.margin.left + ','
                + this.margin.top + ')');
      this.yAxisEl.append('text')
          .style('text-anchor', 'end')
          .attr('transform', 'rotate(-90)')
          .attr('y', 6)
          .attr('dy', '.71em')
          .text('Frequency');

      // Create D3 constructors ahead of time
      this.x = d3.scale.ordinal().rangeRoundBands([0, this.width], 0.1);
      this.y = d3.scale.linear().range([this.height, 0]);
      this.xAxis = d3.svg.axis().orient('bottom');
      this.yAxis = d3.svg.axis().orient('left').ticks(5);

      // Listen to changes on the Messages collection
      this.listenTo(middguard.Messages, 'add', this.render);
    },
    render: function () {
      var data = middguard.Messages.messagesPerUser();

      this.x.domain(data.map(function (d) { return d.key; }));
      this.y.domain([0, d3.max(data, function (d) { return d.value; })]);

      this.xAxis.scale(this.x);
      this.yAxis.scale(this.y);

      this.xAxisEl.call(this.xAxis);
      this.yAxisEl.call(this.yAxis);

      var rects = this.rectsEl.selectAll('rect')
          .data(data);

      rects.exit().remove();

      rects.enter().append('rect');

      rects
          .attr('class', 'bar')
          .attr('x', _.bind(function(d) { return this.x(d.key); }, this))
          .attr('y', _.bind(function(d) { return this.y(d.value); }, this))
          .attr('width', this.x.rangeBand())
          .attr('height', _.bind(function(d) { return this.height - this.y(d.value); }, this));

      return this;
    }
  });

  middguard.addModule('BarChartMessagesView', BarChartMessagesView);
})();