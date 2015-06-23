var middguard = middguard || {};

(function () {
  'use strict';

  var LocSpark = middguard.View.extend({
    id: 'loc-spark',
    
    
    
    initialize: function () {
      var globalThis = this;
      this.current = 0;
      this.d3el = d3.select(this.el);
      _.bindAll(this, 'processData', 'goFetch');
      var current = middguard.state.Locationcounts.selections.pop();
      var x = current.get('x');
      var y = current.get('y');
      this.fetches = [
        {source: 'spark', data: {whereRaw: 'x = ' + x + ' AND y = ' + y + ' AND timestamp <= \'2014-06-07 00:00:00\' '}},
        {source: 'spark', data: {whereRaw: 'x = ' + x + ' AND y = ' + y + ' AND timestamp >= \'2014-06-07 01:00:00\' AND timestamp <= \'2014-06-08 01:00:00\'  '}},
        {source: 'spark', data: {whereRaw: 'x = ' + x + ' AND y = ' + y + ' AND timestamp >= \'2014-06-08 01:00:00\' AND timestamp <= \'2014-06-09 01:00:00\'  '}}
      ]
      _.extend(this, Backbone.Events);
      
      //dataFri,Sat, and Sun are specific, non-extensible variables
      /*
      middguard.entities.Locationcounts.fetch({source: 'spark', data: {whereRaw: 'x = ' + x + ' AND y = ' + y + ' AND timestamp <= \'2014-06-07 00:00:00\' '},
        success: function (col, resp, opt){
          var newData = arrangeDailyData(new Date("2014-06-06 08:00:00"), new Date("2014-06-07 00:00:00"), resp, globalThis.outputDate);
          globalThis.makeSparkline.call(globalThis, 50, 1000, newData.data, new Date("2014-06-06 08:00:00"), new Date("2014-06-07 00:00:00"), 0, newData.max);
        }
      });
      middguard.entities.Locationcounts.fetch({source: 'spark', data: {whereRaw: 'x = ' + x + ' AND y = ' + y + ' AND timestamp >= \'2014-06-07 01:00:00\' AND timestamp <= \'2014-06-08 01:00:00\'  '},
        success: function (col, resp, opt){
          var newData = globalThis.arrangeDailyData(new Date("2014-06-07 08:00:00"), new Date("2014-06-07 23:59:00"), resp, globalThis.outputDate);
          globalThis.makeSparkline.call(globalThis, 50, 1000, newData.data, new Date("2014-06-07 08:00:00"), new Date("2014-06-07 23:59:00"), 0, newData.max);
        }
      });
      var dataSat = middguard.entities.Locationcounts.fetch({source: 'spark', data: {whereRaw: 'x = ' + x +' y = ' + y + ' AND timestamp > 2014-06-07 01:00:00 AND timestamp < 2014-06-08 01:00:00'}});
      var dataSun = middguard.entities.Locationcounts.fetch({source: 'spark', data: {whereRaw: 'x = ' + x +' y = ' + y + ' AND timestamp > 2014-06-08 01:00:00 AND timestamp < 2014-06-09 01:00:00'}});
      var arrangeDailyData = this.arrangeDailyData;
      var dataSat = middguard.entities.Locationcounts.fetch({source: 'spark', data: {whereRaw: 'x = ' + x +' y = ' + y + ' AND timestamp > 2014-06-07 01:00:00 AND timestamp < 2014-06-08 01:00:00'}});
      */
      this.listenTo(middguard.entities.Locationcounts, 'sync', function(col, resp, opt){
        this.processData(col, resp, opt);
      });
      this.goFetch();
    
    },
    
    goFetch: function(){
      if (this.current == 3){
        this.current = 0;
      } else {
        middguard.entities.Locationcounts.fetch(this.fetches[this.current]);
      }
      
    },
    
    processData: function (col, resp, opt){
      //fetch the second 2 days' data after the first

      var startTime, endTime;
      switch(this.current){
        case 0:
          startTime = new Date("2014-06-06 08:00:00");
          endTime = new Date("2014-06-07 00:00:00");
          break;
        case 1:
          startTime = new Date("2014-06-07 08:00:00");
          endTime = new Date("2014-06-08 00:00:00");
          break;
        case 2:
          startTime = new Date("2014-06-08 08:00:00");
          endTime = new Date("2014-06-09 00:00:00");
          break;
      }
      console.log(startTime, endTime);
      var newData = this.arrangeDailyData(startTime, endTime, resp, this.outputDate);
      console.log(startTime, endTime);
      this.makeSparkline.call(this, 50, 1000, newData.data, startTime, endTime, 0, newData.max);
      this.current++;
      this.goFetch();
    },
    
    arrangeDailyData: function (start, end, fetchData, dateFunction){
      //Function makes an array of the data from a day
      //that can be passed into the makeSparkline function
      //'dateFunction' is used to pass in the this.outputDate function

      var tStamp;
      var finalArray = [];
      var index = 0;
      var max = 0;
      var current = new Date(start);
      //console.log('start');
      while (current <= end){
        //console.log(start);
        if (current.getDate() == 8 && current.getHours() == 0 && current.getMinutes() == 0){
          //debugger;
        }
        tStamp = dateFunction(current);
        var newDate = new Date(current);
        var minuteFloor = new Date(fetchData[index].timestamp);
        if (minuteFloor.getSeconds() != 0){
          minuteFloor.setSeconds(0);
        }
        minuteFloor = dateFunction(minuteFloor);
        //console.log(tStamp, minuteFloor);
        if (minuteFloor === tStamp){
          finalArray.push([newDate, fetchData[index].count]);
          if (fetchData[index].count > max){
            max = fetchData[index].count;
          }
          index++;
        } else {
          finalArray.push([newDate, 0]);
        }
        current.setMinutes(current.getMinutes() + 1);
      }
      return {data: finalArray, max: max}
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
      //console.log('here');
      debugger;
      
      var canvas = this.d3el
        .append('svg')
        .attr('y', document.getElementById('loc-spark').children.length*borderHeight)
        .attr('height', borderHeight)
        .attr('width', borderWidth);
      console.log(xMin, xMax);
      var xScale = d3.time.scale()
        .domain([xMin, xMax])
        .range([0, borderWidth]);
        
      var yScale = d3.scale.linear()
        .domain([yMin, yMax])
        .range([0, borderHeight]);
        
      var line = d3.svg.line()
        .x(function(d){return xScale(d[0])})
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