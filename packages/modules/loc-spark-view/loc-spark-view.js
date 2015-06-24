var middguard = middguard || {};

(function () {
  'use strict';

  var LocSpark = middguard.View.extend({
    id: 'loc-spark',
    
    //template: _.template('<input type="submit" id=\'locSpark-clear\'>Clear</input>'),
    
    events:{
      "click .heatRect":"coordChange",
      "click .heatCircle": "coordChange"
      
    },
    
    initialize: function () {
      var globalThis = this;
      this.current = 0;
      this.d3el = d3.select(this.el);
      _.bindAll(this, 'processData', 'goFetch', 'coordChange');
      
      _.extend(this, Backbone.Events);
      
      this.listenTo(middguard.entities.Locationcounts, 'sync', function(col, resp, opt){
        this.processData(col, resp, opt);
      });
      this.listenTo(middguard.entities['Check-ins'], 'sync', function(col, resp, opt){
        this.processData(col, resp, opt);
      });
      this.d3el.append('input')
        .attr('type', 'submit')
        .attr('value', 'Clear')
        .on('click', function(){
          var choice = document.getElementById('heatmap-choice');
          //remove items from selection as well when their spark lines are removed
          if (choice.value == 'all'){
            middguard.state.Locationcounts.selections.reset([]);
          } else {
            //if choice.value = 'checkins'
            middguard.state['Check-ins'].selections.reset([]);
          }
          d3.selectAll('.sparkline').remove();
        })
      this.listenTo(middguard.state['Check-ins'].selections, 'add', this.coordChange);
      this.listenTo(middguard.state.Locationcounts.selections, 'add', this.coordChange);
      this.coordChange();
    
    },
    
    coordChange: function(){
      //function called whenever new coordinates/locations have been clicked
      var poiName;
      var choice = document.getElementById('heatmap-choice');
      if (choice.value == 'all'){
        var currentModel = middguard.state.Locationcounts.selections.at(middguard.state.Locationcounts.selections.length-1);
        if (!currentModel){
          return false;
        }
        var x = currentModel.get('x');
        var y = currentModel.get('y');
      } else {
        var currentModel = middguard.state['Check-ins'].selections.at(middguard.state['Check-ins'].selections.length-1);
        if (!currentModel){
          return false;
        }
        var x = currentModel.get('x');
        var y = currentModel.get('y');
        poiName = middguard.entities.Pois.findWhere({x: x, y: y}).get('name');
          
      }
      this.x = x;
      this.y = y;
      this.fetches = [
        {source: 'spark', data: {whereRaw: 'x = ' + x + ' AND y = ' + y + ' AND timestamp <= \'2014-06-07 00:00:00\' '}},
        {source: 'spark', data: {whereRaw: 'x = ' + x + ' AND y = ' + y + ' AND timestamp >= \'2014-06-07 01:00:00\' AND timestamp <= \'2014-06-08 01:00:00\'  '}},
        {source: 'spark', data: {whereRaw: 'x = ' + x + ' AND y = ' + y + ' AND timestamp >= \'2014-06-08 01:00:00\' AND timestamp <= \'2014-06-09 01:00:00\'  '}}
      ]
      this.goFetch(poiName);
      return true;
    },
    
    goFetch: function(poiName){
      if (this.current == 3){
        this.current = 0;
      } else {
        var choice = document.getElementById('heatmap-choice');
        if (choice.value == 'all'){
          middguard.entities.Locationcounts.fetch(this.fetches[this.current]);
        } else {
          //if choice == 'checkins'
          var curFetch = new Object(this.fetches[this.current]);
          curFetch.poi = poiName;
          middguard.entities['Check-ins'].fetch(this.fetches[this.current]);
        }
        
      }
      
    },
    
    processData: function (col, resp, opt){
      //fetch the second 2 days' data after the first
      if (opt.source === 'spark'){
        var startTime, endTime, day;
        switch(this.current){
          case 0:
            startTime = new Date("2014-06-06 08:00:00");
            endTime = new Date("2014-06-07 00:00:00");
            day = 'Fri';
            break;
          case 1:
            startTime = new Date("2014-06-07 08:00:00");
            endTime = new Date("2014-06-08 00:00:00");
            day = 'Sat';
            break;
          case 2:
            startTime = new Date("2014-06-08 08:00:00");
            endTime = new Date("2014-06-09 00:00:00");
            day = 'Sun';
            break;
        }
        var newData = this.arrangeDailyData(startTime, endTime, resp, this.outputDate);
        if (opt.poi){
          this.makeSparkline.call(this, 50, 1000, newData.data, startTime, endTime, 0, newData.max, this.x, this.y, day, opt.poi);
        } else {
           this.makeSparkline.call(this, 50, 1000, newData.data, startTime, endTime, 0, newData.max, this.x, this.y, day);
        }
        this.current++;
        this.goFetch(); 
      }
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

      while (current <= end){
        tStamp = dateFunction(current);
        var newDate = new Date(current);
        if (index >= fetchData.length){
          //if fetchData's bound has been passed
          finalArray.push([newDate, 0]);
        } else {
          var minuteFloor = new Date(fetchData[index].timestamp);
          if (minuteFloor.getSeconds() != 0){
            minuteFloor.setSeconds(0);
          }
          minuteFloor = dateFunction(minuteFloor);
          if (minuteFloor === tStamp){
            finalArray.push([newDate, fetchData[index].count]);
            if (fetchData[index].count > max){
              max = fetchData[index].count;
            }
            index++;
          } else {
            finalArray.push([newDate, 0]);
          }
        }
        current.setMinutes(current.getMinutes() + 1);
      }
      //console.log('finish');
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
    
    makeSparkline: function(borderHeight, borderWidth, allData, xMin, xMax, yMin, yMax, xCoord, yCoord, day, poi){
      //function actually draws a sparkline
      //function is specific, not particularly extensible
      
      var parentElmnt = this.d3el
      .append('div')
      .attr('class', 'sparkline');
        
      //if a place of interest is passed, include it in the header
      if (poi){
        var textHeader = 'X: ' + xCoord + ' Y: ' + yCoord + ' ' + day + ' Location Name: ' + poi;
      } else {
        var textHeader = 'X: ' + xCoord + ' Y: ' + yCoord + ' ' + day;
      }
      
      parentElmnt
      .append('p').text(textHeader);
      
      var canvas = parentElmnt
        .append('svg')
        .attr('height', borderHeight)
        .attr('width', borderWidth);
      
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
        
      //var axis = d3.svg.axis().
        
      canvas
        .append('path')
        .datum(allData)
        .attr('d', line)
        .attr('stroke', 'blue')
        .attr('stroke-width', 2)
        .attr('fill', 'none');
        
      //parentElmnt.style('display', 'block');
    },
    
    render: function(){
      return this;
    }
    
  });

  middguard.addModule('LocSpark', LocSpark);
})();