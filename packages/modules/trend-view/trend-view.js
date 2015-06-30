var middguard = middguard || {};

(function () {
  'use strict';

  var TrendView = middguard.View.extend({
    id: 'loc-spark',
    
    initialize: function () {
      var globalThis = this;
      this.current = 0;
      this.d3el = d3.select(this.el);
      //.style('display', 'table');
      this.current = 0;
      middguard.state.trendScale = {}
      middguard.state.trendScale.max = 0;
      this.childViews = {};
      this.d3el.append('input')
        .attr('type', 'submit')
        .attr('value', 'Clear')
        .on('click', function(){
          var choice = middguard.state.heatmapChoice;
          //remove items from selection as well when their spark lines are removed
          middguard.state.Pois.selections.reset([]);
          middguard.state.trendScale.max = 0;
          globalThis.childViews = {};
          $('.trendGraphParent').remove();
        });
        
      this.d3el.append('select')
        .attr('id', 'scale-select')
        .html('<option value="abs">Absolute Scale</option><option value="rel">Relative Scales per XY</option>')
        .on('change', function(){
          globalThis.switchScale();
        });
      
      _.bindAll(this, 'coordChange', 'goFetch');
        
      this.listenTo(middguard.state.Pois.selections, 'add', function(currentModel){
        globalThis.coordChange(currentModel);
      });
      
      middguard.state.Pois.selections.forEach(function(currentModel){
        globalThis.coordChange(currentModel);
      });
      
      this.listenTo(middguard.entities.Locationcounts, 'sync', function(col, resp, opt){
        console.log(opt);
        if (opt.source.slice(0,5) === 'spark'){
          var curIter = parseInt(opt.source.charAt(5));
          if (globalThis.childViews['x' + opt.x + 'y' + opt.y]){
            globalThis.childViews['x' + opt.x + 'y' + opt.y].appendChild(col, resp, opt);
            //append a just-completed view to the parent view
            if (globalThis.childViews['x' + opt.x + 'y' + opt.y].children.length === 3){
              globalThis.childViews['x' + opt.x + 'y' + opt.y].render();
              $('#loc-spark').append(globalThis.childViews['x' + opt.x + 'y' + opt.y].el);
              
              //make sure that every chart currently displayed is scaled properly
              for (var view in globalThis.childViews){
                if (middguard.state.trendScale.max > globalThis.childViews[view].absMax && document.getElementById('scale-select').value === 'abs'){
                  globalThis.childViews[view].render();
                }
              }
              
            }
          } else {
            //if a new child View
            globalThis.childViews['x' + opt.x + 'y' + opt.y] = new TrendViewWeekend(opt.x, opt.y);
            globalThis.childViews['x' + opt.x + 'y' + opt.y].appendChild(col, resp, opt);
          }
          globalThis.current++;
          globalThis.goFetch(opt.x, opt.y, curIter + 1);
        }
      });
      this.listenTo(middguard.entities['Check-ins'], 'sync', function(col, resp, opt){
        if (opt.source.slice(0,5) === 'spark'){
          if (globalThis.childViews['x' + opt.x + 'y' + opt.y]){
            globalThis.childViews['x' + opt.x + 'y' + opt.y].appendChild(col, resp, opt);
            //append a just-completed view to the parent view
            if (globalThis.childViews['x' + opt.x + 'y' + opt.y].children.length === 3){
              globalThis.childViews['x' + opt.x + 'y' + opt.y].render();
              $('#loc-spark').append(globalThis.childViews['x' + opt.x + 'y' + opt.y].el);
              
              //make sure that every chart currently displayed is scaled properly
              for (var view in globalThis.childViews){
                if (middguard.state.trendScale.max > globalThis.childViews[view].absMax && document.getElementById('scale-select').value === 'abs'){
                  globalThis.childViews[view].render();
                }
              }
              
            }
          } else {
            //if a new child View
            globalThis.childViews['x' + opt.x + 'y' + opt.y] = new TrendViewWeekend(opt.x, opt.y);
            globalThis.childViews['x' + opt.x + 'y' + opt.y].appendChild(col, resp, opt);
          
          }
          globalThis.current++;
          globalThis.goFetch();
        }
      });
    
    },
    
    switchScale: function(){
      //switches the scale of the charts
      
      for (var view in this.childViews){
        this.childViews[view].render();
      }
    },
    
    goFetch: function(x, y, iteration){
      //function does the fetching of the data
      
      if (this.current === 3){
        this.current = 0;
      } else {
        var curFetch = new Object(this.fetches[iteration]);
        curFetch.x = x;
        curFetch.y = y;
        var choice = middguard.state.heatmapChoice;
        if (choice === 'all'){
          middguard.entities.Locationcounts.fetch(curFetch);
        } else {
          //if choice == 'checkins'
          curFetch.poi = this.poiName;
          middguard.entities['Check-ins'].fetch(curFetch);
        }
        
      }
      
    },
    
    
    coordChange: function(currentModel){
      //function called whenever new coordinates/locations have been clicked

      var poiName;
      var choice = middguard.state.heatmapChoice;
      
      if (!currentModel){
        return false;
      }
      var x = currentModel.get('x');
      var y = currentModel.get('y');
      
      if (choice === 'checkins'){
        poiName = middguard.entities.Pois.findWhere({x: x, y: y}).get('name');
      }
      this.x = x;
      this.y = y;
      this.poiName = poiName;
      
      this.fetches = [
        {source: 'spark0', data: {whereRaw: 'x = ' + x + ' AND y = ' + y + ' AND timestamp <= \'2014-06-07 00:00:00\' '}},
        {source: 'spark1', data: {whereRaw: 'x = ' + x + ' AND y = ' + y + ' AND timestamp >= \'2014-06-07 01:00:00\' AND timestamp <= \'2014-06-08 01:00:00\'  '}},
        {source: 'spark2', data: {whereRaw: 'x = ' + x + ' AND y = ' + y + ' AND timestamp >= \'2014-06-08 01:00:00\' AND timestamp <= \'2014-06-09 01:00:00\'  '}}         
      ];
      
      this.goFetch();
      return true;
    }
    
  });
  
  var TrendViewWeekend = middguard.View.extend({
    //wrapper view for each of the daily charts
    
    template: _.template('<div />'),
    
    initialize: function(x, y){
      
      this.x = x;
      this.y = y;
      this.el.classList.remove('middguard-module');
      this.d3el = d3.select(this.el);
      this.d3el.attr('id', 'x' + this.x + 'y' + this.y);
      this.d3el.attr('class', 'trendGraphParent');
      this.max = 0;
      this.absMax = middguard.state.trendScale.max;
      this.children = [];
      
    },
    
    appendChild: function(col, resp, opt){
      var newChart = new TrendViewDay(col, resp, opt, this);
      this.children.push(newChart);
      this.opt = opt;
    },
    
    render: function(){
      this.d3el.selectAll('.trendGraphChildren').remove();
      this.d3el.selectAll('p').remove();
      if (this.opt.poi){
        var textHeader = 'X: ' + this.x + ' Y: ' + this.y + ' -- ' + ' Location Name: ' + this.opt.poi;
      } else {
        var textHeader = 'X: ' + this.x + ' Y: ' + this.y;
      }
      
      this.d3el
        .append('p')
        .attr('class', 'textHeaderBold')
        .text(textHeader);
        
      var globalThis = this;
      if (this.children.length > 3){
        //change this.children to the 3 most recently selected items
        this.children = this.children.slice(this.children.length-3);
      }
      this.children.forEach(function(day){
        if (document.getElementById('scale-select').value === 'abs'){
          var newChart = day.render(day.borderHeight, day.heightSqueeze, day.borderWidth, day.data, day.startTime, day.endTime, 0, middguard.state.trendScale.max, day.opt.x, day.opt.y, day.day, day.opt.poi, true);
        } else {
          var newChart = day.render(day.borderHeight, day.heightSqueeze, day.borderWidth, day.data, day.startTime, day.endTime, 0, globalThis.max, day.opt.x, day.opt.y, day.day, day.opt.poi, false);
        }
        globalThis.$el.append(newChart.el);
        
      });
      return this;
    }
    
    
  });
  
  var TrendViewDay = middguard.View.extend({
    //individual views for each chart
    
    template: _.template('<div/>'),
    
    initialize: function(col, resp, opt, parentView){
      this.parentView = parentView;
      this.max = 0;
      this.height = 60;
      this.width = 1030;
      this.d3el = d3.select(this.el)
        .style('display', 'block')
        .style('height', this.height)
        .style('width', this.width)
        .attr('class', 'trendGraphChild');
      this.el.classList.remove('middguard-module');
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
      this.data = this.arrangeDailyData(startTime, endTime, resp, this.outputDate);
      this.startTime = startTime;
      this.endTime = endTime;
      this.day = day;
      this.opt = opt;
      this.borderHeight = 60;
      this.heightSqueeze = 20;
      this.borderWidth = 1030;
      
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
        tStamp = current;//dateFunction(current);
        var newDate = new Date(current);
        if (index >= fetchData.length){
          //if fetchData's bound has been passed
          finalArray.push([newDate, 0]);
        } else {
          var minuteFloor = new Date(fetchData[index].timestamp);
          if (minuteFloor.getSeconds() != 0){
            minuteFloor.setSeconds(0);
          }
          //minuteFloor = dateFunction(minuteFloor);
          if (minuteFloor.valueOf() === tStamp.valueOf()){
            finalArray.push([newDate, fetchData[index].count]);
            if (fetchData[index].count > this.parentView.max){
              this.parentView.max = fetchData[index].count;
            }
            if (fetchData[index].count > middguard.state.trendScale.max){
              middguard.state.trendScale.max = fetchData[index].count;
              this.parentView.absMax = fetchData[index].count;
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
    
    render: function(borderHeight, axisY, borderWidth, allData, xMin, xMax, yMin, yMax, xCoord, yCoord, day, poi, abs){
      //function actually draws a trend line
      //function is specific, not particularly extensible
      
      //this.d3el.selectAll('.trendGraphChild').remove();
      var parentElmnt = this.d3el
        .append('div')
        .attr('class', 'trendGraphChildren');
        
      var textHeader = '' + day;
      
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
        
      //use global max if scale is absolute
      if (abs){
        yMax = middguard.state.trendScale.max;
      }
      
      var yScale = d3.scale.linear()
        .domain([yMin, yMax])
        .range([axisY+2, borderHeight-2])
        .clamp(true);
      
      var line = d3.svg.line()
        .x(function(d){return xScale(d[0]);})
        .y(function(d){return borderHeight - yScale(d[1]);})
        .interpolate('linear');
        
      var axis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .ticks(d3.time.hours, 4);
        
      canvas
        .append('path')
        .datum(allData)
        .attr('d', line)
        .attr('stroke', '#626f91')
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

  middguard.addModule('TrendView', TrendView);
})();