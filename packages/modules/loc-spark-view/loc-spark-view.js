var middguard = middguard || {};

(function () {
  'use strict';

  var LocSpark = middguard.View.extend({
    id: 'loc-spark',
    
    
    
    initialize: function () {
      this.d3el = d3.select(this.el);
      var data = [[new Date("2014-06-06 08:00:19"),3], [new Date("2014-06-06 09:00:19"),5], [new Date("2014-06-06 10:00:19"),2], [new Date("2014-06-06 11:00:19"),7], [new Date("2014-06-06 12:00:19"),1]]
			this.makeSparkline(50, 200, data, data[0][0], data[4][0], 1, 7);
    },
    
    makeSparkline: function(borderHeight, borderWidth, allData, xMin, xMax, yMin, yMax){
      var canvas = this.d3el
        .append('svg')
        .attr('height', borderHeight)
        .attr('width', borderWidth);
        
        console.log(xMin);
      var xScale = d3.time.scale()
        .domain([xMin, xMax])
        .range([0, borderWidth]);
        
      var yScale = d3.scale.linear()
        .domain([yMin, yMax])
        .range([0, borderHeight]);
        
      var line = d3.svg.line()
        .x(function(d){console.log(d); return xScale(d[0])})
        .y(function(d){return borderHeight - yScale(d[1])})
        .interpolate('linear');
        
      canvas
        .append('path')
        .datum(allData)
        .attr('d', line)
        .attr('stroke', 'blue')
        .attr('stroke-width', 2)
        .attr('fill', 'none');
    },
    
    render: function(){
      return this;
    }
    
  });

  middguard.addModule('LocSpark', LocSpark);
})();