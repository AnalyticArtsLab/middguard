var middguard = middguard || {};

(function () {
  'use strict';

  var LocationHeatmap = middguard.View.extend({
    id: 'heatmap',
    initialize: function () {
      
			middguard.socket.emit('query', {'a sql query': 'right here'});
      this.margin = {top: 20, right: 20, bottom: 30, left: 40};
      this.height = 1000;
      this.width = 1000;
			this.img = new Image(1000, 1000);
			this.img.src = '/modules/heatmap/images/map.jpg';
			console.log(this.img);
      this.d3el = d3.select(this.el);
			//document.body.appendChild(this.img);
      this.svg = this.d3el.append('svg')
      	.attr('height', this.height)
				.attr('width', this.width)
				.attr('transform', 'translate(' + this.margin.left + ','
        	+ this.margin.top + ')')
				.attr('stroke', 'black');
      var svg = this.svg;
      this.svg.append('image')
        .attr('xlink:href', '/modules/location-heatmap/images/map.jpg')
        .attr('height', 1000)
        .attr('width', 1000);
      this.yinc = 6; //margin at top
      
      this.colorScale = d3.scale.linear();
      this.colorScale.domain([0, 2355]);
      this.colorScale.rangeRound([0, 8]);
      
      _.extend(this, Backbone.Events);
      _.bindAll(this, 'render', 'draw');
      
      this.listenTo(middguard.state.timeRange, "change", this.getData);
      this.listenTo(middguard.entities['Locationcounts'], 'sync', this.render);
      this.listenTo(middguard.entities['Locationcounts'], 'reset', this.render);
      
      this.getData();
			
    },
    
    getData: function(){
      //This function gets the data at a certain timestamp. Its execution will trigger the rendering.
      try {
        var dateString = this.outputDate(middguard.state.timeRange.start);
      } catch(err){
        console.log(err);
      }
      var curTime = new Date(dateString);
      var start = new Date("2014-06-06 08:00:19");
      var end = new Date("2014-06-08 23:20:16");
      var processData = this.processData;
      var draw = this.draw;
      
      middguard.entities["Locationcounts"].fetch({data: {where: ['timestamp', '<', dateString]}});
    },
    
    render: function () {
      
      var dateString = this.outputDate(middguard.state.timeRange.start);
      var curTime = new Date(dateString);
      var start = new Date("2014-06-06 08:00:19");
      var end = new Date("2014-06-08 23:20:16");
      var processData = this.processData;
      var draw = this.draw;
      
      var locCountData = processData(middguard.entities['Locationcounts'].models, dateString, start, end);
      draw(locCountData);
        
      return this;
    },
    
    draw: function(data){
      var colors = ["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#b30000","#7f0000"];
      var svg = this.svg;
      var yinc = this.yinc;
      var colorScale = this.colorScale;
      var dim = 100;
      for (var row = 0; row < dim; row++){
        for (var col = 0; col < dim; col++){
  			  svg.append('rect')
  				.attr({
  					'x': (row*10),
  					'y': ((100-col)*10)-yinc,
  					'height': 10,
  					'width': 10,
            'fill': function(){
              if (data[row][col] > 0){
                return colors[colorScale(data[row][col])];
              } else {
                return 'none';
              }
            },
            'stroke': function(){
              if (data[row][col] > 0){
                return colors[colorScale(data[row][col])];
              } else {
                return 'none';
              }
            }
  				});
        }
      }
    },
    
    outputDate: function(date){
      //output the date in a certain string format
      
      var year = String(date.getFullYear());
      
      var month = String(date.getMonth() + 1);
      if (month.length == 1){
        month = '0' + month;
      }
      var day = String(date.getDate());
      if (day.length == 1){
        day = '0' + day;
      }
      var hours = String(date.getHours());
      if (hours.length == 1){
        hours = '0' + hours;
      }
      var minutes = String(date.getMinutes());
      if (minutes.length == 1){
        minutes = '0' + minutes;
      }
      var seconds = String(date.getSeconds());
      if (seconds.length == 1){
        seconds = '0' + seconds;
      }
      return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
    },
    
    processData: function(dataArray, timestamp, start, end){
      //create heatmap data at a certain timestamp
      var tsDate = new Date(timestamp);
      if (tsDate > end || tsDate < start){
        console.log(Error('Timestamp out of range'));
        return null;
      }
      
      var heatmapData = [];
      for (var i = 0; i < 100; i++){
        heatmapData[i] = [];
        for (var j = 0; j < 100; j++){
          heatmapData[i][j] = 0;
        }
      }
      var dataLen = dataArray.length;
      var x, y;
      for (var curIndex = 0; curIndex < dataLen; curIndex++){
        x = dataArray[curIndex].attributes.x;
        y = dataArray[curIndex].attributes.y;
        heatmapData[x][y] = dataArray[curIndex].attributes.count;
      }
      return heatmapData;
      
      
    }
    
  });

  middguard.addModule('LocationHeatmap', LocationHeatmap);
})();