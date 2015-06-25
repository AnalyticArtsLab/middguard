var middguard = middguard || {};

(function () {
  'use strict';

  var LocSpark = middguard.View.extend({
    id: 'loc-spark',
    
    //template: _.template('<input type="submit" id=\'locSpark-clear\'>Clear</input>'),
    
    initialize: function () {
      var globalThis = this;
      this.current = 0;
      this.d3el = d3.select(this.el);
      this.current = 0;
      
      this.d3el.append('input')
        .attr('type', 'submit')
        .attr('value', 'Clear')
        .on('click', function(){
          var choice = middguard.state.heatmapChoice;
          //remove items from selection as well when their spark lines are removed
          if (choice === 'all'){
            middguard.state.Locationcounts.selections.reset([]);
          } else {
            //if choice == 'checkins'
            middguard.state['Check-ins'].selections.reset([]);
          }
          $('.sparkline').remove();
        });
        
      _.bindAll(this, 'coordChange', 'goFetch');
        
      this.listenTo(middguard.state['Check-ins'].selections, 'add', function(){
        globalThis.coordChange();
      });
      this.listenTo(middguard.state.Locationcounts.selections, 'add', function(){
        globalThis.coordChange();
      });
      
      
      this.listenTo(middguard.entities.Locationcounts, 'sync', function(col, resp, opt){
        if (opt.source.slice(0,5) === 'spark'){
          var newChart = new LocSparkChart(col, resp, opt);
          $('#loc-spark').append(newChart.el);
          globalThis.current++;
          globalThis.getData();
        }
      });
      this.listenTo(middguard.entities['Check-ins'], 'sync', function(col, resp, opt){
        if (opt.source.slice(0,5) === 'spark'){
          var newChart = new LocSparkChart(col, resp, opt);
          $('#loc-spark').append(newChart.el);
          globalThis.current++;
          globalThis.goFetch();
        }
      });
    
    },
    
    goFetch: function(){
      //function does the fetching of the data
      
      if (this.current === 3){
        this.current = 0;
      } else {
        var choice = middguard.state.heatmapChoice;
        if (choice === 'all'){
          middguard.entities.Locationcounts.fetch(this.fetches[this.current]);
        } else {
          //if choice == 'checkins'
          var curFetch = new Object(this.fetches[this.current]);
          curFetch.poi = this.poiName;
          middguard.entities['Check-ins'].fetch(curFetch);
        }
        
      }
      
    },
    
    
    coordChange: function(){
      //function called whenever new coordinates/locations have been clicked
      
      var poiName;
      var choice = middguard.state.heatmapChoice;
      if (choice === 'all'){
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
      this.poiName = poiName;
      
      this.fetches = [
        {source: 'spark1', data: {whereRaw: 'x = ' + x + ' AND y = ' + y + ' AND timestamp <= \'2014-06-07 00:00:00\' '}},
        {source: 'spark2', data: {whereRaw: 'x = ' + x + ' AND y = ' + y + ' AND timestamp >= \'2014-06-07 01:00:00\' AND timestamp <= \'2014-06-08 01:00:00\'  '}},
        {source: 'spark3', data: {whereRaw: 'x = ' + x + ' AND y = ' + y + ' AND timestamp >= \'2014-06-08 01:00:00\' AND timestamp <= \'2014-06-09 01:00:00\'  '}}         
      ];
      
      this.goFetch();
      return true;
    }/*,
    
    goFetch: function(poiName){
      //function fetches data, stops after each day's data has been fetched
      
      if (this.current == 3){
        this.current = 0;
      } else {
        var choice = middguard.state.heatmapChoice;
        if (choice === 'all'){
          middguard.entities.Locationcounts.fetch(this.fetches[this.current]);
        } else {
          //if choice == 'checkins'
          var curFetch = new Object(this.fetches[this.current]);
          curFetch.poi = poiName;
          middguard.entities['Check-ins'].fetch(curFetch);
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
        //yMaxes of 3687 and 325 reflect the max values for all xy coords and non-checkin xy coords, respectively
        var poiName;
        if (opt.poi){
          poiName = opt.poi;
          this.makeSparkline.call(this, 60, 20, 1030, newData.data, startTime, endTime, 0, 3687, this.x, this.y, day, opt.poi);
        } else {
          this.makeSparkline.call(this, 60, 20, 1030, newData.data, startTime, endTime, 0, 325, this.x, this.y, day);
        }
        this.current++;
        this.goFetch(poiName);
      }
    },
    
    arrangeDailyData: function (start, end, fetchData, dateFunction){
      //Function makes an small-space-consuming array containing indices/pointers to data to be used in the makeSparkline function (leanData)
      //Function also makes an array containing the actual data to be used in makeSparkline (data)
      //'dateFunction' is used to pass in the this.outputDate function

      var tStamp;
      var finalArray = [];
      var leanArray = [];
      var index = 0;
      var max = 0;
      var current = new Date(start);
      var masterIndex = 0;
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
        masterIndex++;
        current.setMinutes(current.getMinutes() + 1);
      }
      //console.log('finish');
      return {data: finalArray, leanData: leanArray, max: max}
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
    
    makeSparkline: function(borderHeight, axisY, borderWidth, allData, xMin, xMax, yMin, yMax, xCoord, yCoord, day, poi){
      //function actually draws a sparkline
      //function is specific, not particularly extensible
      
      var parentElmnt = this.d3el
      .append('div')
      .attr('class', 'sparkline');
        
      //if a place of interest is passed, include it in the header
      if (poi){
        var textHeader = 'X: ' + xCoord + ' Y: ' + yCoord + ' -- ' + day + ' Location Name: ' + poi;
      } else {
        var textHeader = 'X: ' + xCoord + ' Y: ' + yCoord + ' -- ' + day;
      }
      
      parentElmnt
        .append('p')
        .attr('class', 'textHeader')
        .text(textHeader);
        //.attr('transform', 'translate(' + 15 + ',0)');
      
      var canvas = parentElmnt
        .append('svg')
        .attr('height', borderHeight)
        .attr('width', borderWidth);
      
      //pinching by 10 done to allow for tick marks
      var xScale = d3.time.scale()
        .domain([xMin, xMax])
        .range([15, borderWidth-15]);
        
      var yScale = d3.scale.linear()
        .domain([yMin, yMax])
        .range([axisY+2, borderHeight-2])
        .clamp(true);
      
        
      var line = d3.svg.line()
        .x(function(d){return xScale(d[0]);})
        .y(function(d){return borderHeight - yScale(d[1]);})
        .interpolate('basis');
        
      var axis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .ticks(d3.time.hours, 4);
        
      canvas
        .append('path')
        .datum(allData)
        .attr('d', line)
        .attr('stroke', 'blue')
        .attr('stroke-width', 2)
        .attr('fill', 'none');
        
        //d3.selectAll('path').datum([]);
      
      canvas
        .append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + (borderHeight-axisY) + ')')
        .call(axis);
        
      //parentElmnt.style('display', 'block');
    },
    
    render: function(){
      return this;
    }*/
    
  });
  
  var LocSparkChart = middguard.View.extend({
    //individual views for each chart
    
    template: _.template('<div class="sparkline" />'),
    
    initialize: function(col, resp, opt){
      /*switch(num){
        case 0:
          this.fetch = {source: 'spark0', data: {whereRaw: 'x = ' + x + ' AND y = ' + y + ' AND timestamp <= \'2014-06-07 00:00:00\' '}};
          break;
        case 1:
          this.fetch = {source: 'spark1', data: {whereRaw: 'x = ' + x + ' AND y = ' + y + ' AND timestamp >= \'2014-06-07 01:00:00\' AND timestamp <= \'2014-06-08 01:00:00\'  '}};
          break;
        case 2:
          this.fetch = {source: 'spark2', data: {whereRaw: 'x = ' + x + ' AND y = ' + y + ' AND timestamp >= \'2014-06-08 01:00:00\' AND timestamp <= \'2014-06-09 01:00:00\'  '}};
          break;
      }
      this.current = num;
      
      _.extend(this, Backbone.Events);
      
      this.d3el = d3.select(this.el);
      var poiName;
      var choice = middguard.state.heatmapChoice;
      if (choice === 'all'){
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
        this.x = x;
        this.y = y;
        this.goFetch(poiName);
      }*/
        //console.log('here');
        this.max = 0;
        this.d3el = d3.select(this.el);
        this.current = parseInt(opt.source.charAt(5));
        this.processData(col, resp, opt);
    },
    
    goFetch: function(poiName){
      //function fetches data, stops after each day's data has been fetched
      
      if (this.current == 3){
        this.current = 0;
      } else {
        var choice = middguard.state.heatmapChoice;
        if (choice === 'all'){
          middguard.entities.Locationcounts.fetch(this.fetch);
        } else {
          //if choice == 'checkins'
          var curFetch = new Object(this.fetches[this.current]);
          curFetch.poi = poiName;
          middguard.entities['Check-ins'].fetch(curFetch);
        }
      }
      
    },
    
    processData: function (col, resp, opt){
      //fetch the second 2 days' data after the first
      
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
      //yMaxes of 3687 and 325 reflect the max values for all xy coords and non-checkin xy coords, respectively
      
      var poiName;
      if (opt.poi){
        poiName = opt.poi;
        this.render(60, 20, 1030, newData.data, startTime, endTime, 0, 3687, this.x, this.y, day, opt.poi);
      } else {
        this.render(60, 20, 1030, newData.data, startTime, endTime, 0, 325, this.x, this.y, day);
      }
    },
    
    arrangeDailyData: function (start, end, fetchData, dateFunction){
      //Function makes an small-space-consuming array containing indices/pointers to data to be used in the makeSparkline function (leanData)
      //Function also makes an array containing the actual data to be used in makeSparkline (data)
      //'dateFunction' is used to pass in the this.outputDate function
      
      var tStamp;
      var finalArray = [];
      var index = 0;
      var current = new Date(start);
      var masterIndex = 0;
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
          console.log(minuteFloor, tStamp);
          if (minuteFloor === tStamp){
            console.log('here');
            finalArray.push([newDate, fetchData[index].count]);
            if (fetchData[index].count > max){
              this.max = fetchData[index].count;
            }
            index++;
          } else {
            finalArray.push([newDate, 0]);
          }
        }
        masterIndex++;
        current.setMinutes(current.getMinutes() + 1);
      }
      return finalArray
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
    
    render: function(borderHeight, axisY, borderWidth, allData, xMin, xMax, yMin, yMax, xCoord, yCoord, day, poi){
      //function actually draws a sparkline
      //function is specific, not particularly extensible
      
      
      var parentElmnt = this.d3el
      .append('div')
      .attr('class', 'sparkline');
        
      //if a place of interest is passed, include it in the header
      if (poi){
        var textHeader = 'X: ' + xCoord + ' Y: ' + yCoord + ' -- ' + day + ' Location Name: ' + poi;
      } else {
        var textHeader = 'X: ' + xCoord + ' Y: ' + yCoord + ' -- ' + day;
      }
      
      
      parentElmnt
        .append('p')
        .attr('class', 'textHeader')
        .text(textHeader);
        //.attr('transform', 'translate(' + 15 + ',0)');
      
      var canvas = parentElmnt
        .append('svg')
        .attr('height', borderHeight)
        .attr('width', borderWidth);
      
      //pinching by 10 done to allow for tick marks
      var xScale = d3.time.scale()
        .domain([xMin, xMax])
        .range([15, borderWidth-15]);
        
      var yScale = d3.scale.linear()
        .domain([yMin, yMax])
        .range([axisY+2, borderHeight-2])
        .clamp(true);
      
      var line = d3.svg.line()
        .x(function(d){return xScale(d[0]);})
        .y(function(d){return borderHeight - yScale(d[1]);})
        .interpolate('basis');
        
      var axis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .ticks(d3.time.hours, 4);
        
      console.log(allData);

      canvas
        .append('path')
        .datum(allData)
        .attr('d', line)
        .attr('stroke', 'blue')
        .attr('stroke-width', 2)
        .attr('fill', 'none');
        
      canvas
        .append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + (borderHeight-axisY) + ')')
        .call(axis);
    
        return this;
    }
    
  });

  middguard.addModule('LocSpark', LocSpark);
})();