var middguard = middguard || {};

(function () {
  'use strict';

  var LocSpark = middguard.View.extend({
    id: 'loc-spark',
    
    
    
    initialize: function () {
      
      this.d3el = d3.select(this.el);
      var data = [[new Date("2014-06-06 08:00:19"),3], [new Date("2014-06-06 09:00:19"),5], [new Date("2014-06-06 10:00:19"),2], [new Date("2014-06-06 11:00:19"),7], [new Date("2014-06-06 12:00:19"),1]]
			this.makeSparkline(50, 200, data, data[0][0], data[4][0], 1, 7);
      var outputDate = this.outputDate;
      
      var current = middguard.state.Locationcounts.selections.pop();
      var x = current.get('x');
      var y = current.get('y');
      
      //dataFri,Sat, and Sun are specific, non-extensible variables
      var dataFri = middguard.entities.Locationcounts.fetch({data: {where: ['x', '=', x], andWhere:
      ['y', '=', y]}});
      var dataSat = middguard.entities.Locationcounts.fetch({data: {where: ['x', '=', x], andWhere:
      ['y', '=', y], andWhere: ['timestamp', '>', '2014-06-07 01:00:00'], andWhere: ['timestamp', '<', '2014-06-08 01:00:00']}});
      var dataSun = middguard.entities.Locationcounts.fetch({data: {where: ['x', '=', x], andWhere:
      ['y', '=', y], andWhere: ['timestamp', '>', '2014-06-08 01:00:00'], andWhere: ['timestamp', '<', '2014-06-09 01:00:00']}});
      var arrangeDailyData = this.arrangeDailyData;
      this.listenTo(middguard.entities['Locationcounts'], 'sync', function(col, resp){
        console.log(resp);
        //console.log(middguard.entities['Locationcounts']);
        var incoming = col;
        //var d1 = arrangeDailyData(new Date("2014-06-06 08:00:00"), new Date("2014-06-06 20:13:00"), middguard.entities.Locationcounts.models, this.outputDate);
        //console.log(d1);
      });
      //var d2 = arrangeDailyData(new Date("2014-06-07 08:00:00"), new Date("2014-06-08 00:00:00"), dataSat);
      //var d3 = arrangeDailyData(new Date("2014-06-08 08:00:00"), new Date("2014-06-09 00:00:00"), dataSun);
      //console.log(d1);
      //console.log(d2);
      //console.log(d3);
    
    },
    
    arrangeDailyData: function (start, end, fetchData, dateFunction){
      //Function makes an array of the data from a day
      //that can be passed into the makeSparkline function
      //'dateFunction' is used to pass in the this.outputDate function
      
      var tStamp;
      var finalArray = [];
      var index = 0;
      //console.log(fetchData);
      while (start <= end){
        //console.log(start);
        tStamp = dateFunction(start);
        var newDate = new Date(start);
        var minuteFloor = new Date(fetchData[index].get('timestamp'));
        if (minuteFloor.getSeconds() != 0){
          minuteFloor.setSeconds() = 0;
        }
        minuteFloor = dateFunction(minuteFloor);
        //console.log(tStamp, minuteFloor);
        if (minuteFloor === tStamp){
          finalArray.push([newDate, fetchData[index].get('count')]);
          index++;
        } else {
          finalArray.push([newDate, 0]);
        }
        start.setMinutes(start.getMinutes() + 1);
      }
      return finalArray;
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
        .x(function(d){ return xScale(d[0])})
        .y(function(d){return borderHeight - yScale(d[1])})
        .interpolate('basis');
        
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