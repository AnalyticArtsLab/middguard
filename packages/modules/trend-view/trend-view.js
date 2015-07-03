var middguard = middguard || {};

(function () {
  'use strict';

  var TrendView = middguard.View.extend({
    id: 'loc-spark',
    
    template: _.template('<div id="XYTrendTitle"><h1>Location Trends</h1></div>'),
    
    initialize: function () {
      var globalThis = this;
      
      this.$el.html(this.template);
      this.current = 0;
      this.d3el = d3.select(this.el);
      //.style('display', 'table');
      this.current = 0;
      middguard.state.trendScale = {}
      middguard.state.trendScale.max = 0;
      this.childViews = {};
      this.d3el.append('input')
        .attr('type', 'submit')
        .attr('value', 'Clear Selection')
        .on('click', function(){
          var choice = middguard.state.heatmapChoice;
          //remove items from selection as well when their spark lines are removed
          middguard.state.Pois.workingSet.reset([]);
          middguard.state.trendScale.max = 0;
          globalThis.childViews = {};
          $('.trendGraphParent').remove();
        });
        
      this.d3el.append('select')
        .attr('id', 'scale-select')
        .html('<option value="rel">Relative Scales per Day</option><option value="relWeekend">Relative Scales per XY/Weekend</option><option value="abs">Absolute Scale</option>')
        .on('change', function(){
          globalThis.switchScale();
        });
      
      _.bindAll(this, 'coordChange', 'goFetch');
        
      this.listenTo(middguard.state.Pois.workingSet, 'add', function(currentModel){
        globalThis.coordChange(currentModel);
      });
      
      this.listenTo(middguard.state.Pois.workingSet, 'remove', function(currentModel){
        if (globalThis.childViews['x' + currentModel.get('x') + 'y' + currentModel.get('y')]){
          globalThis.childViews['x' + currentModel.get('x') + 'y' + currentModel.get('y')].removeSelf();
          delete globalThis.childViews['x' + currentModel.get('x') + 'y' + currentModel.get('y')];
        }
      });
      
      this.listenTo(middguard.state.Pois.workingSet, 'reset', function(newModels, options){
        
        //get rid of the old models
        middguard.state.trendScale.max = 0;
        globalThis.childViews = {};
        $('.trendGraphParent').remove();
        /*
        options.previousModels.forEach(function(currentModel){
          if (globalThis.childViews['x' + currentModel.get('x') + 'y' + currentModel.get('y')]){
            globalThis.childViews['x' + currentModel.get('x') + 'y' + currentModel.get('y')].removeSelf();
            delete globalThis.childViews['x' + currentModel.get('x') + 'y' + currentModel.get('y')];
          }
        });
        */
        //add the new ones
        middguard.state.Pois.workingSet.forEach(function(currentModel){
          globalThis.coordChange(currentModel);
        });
      });
      
      middguard.state.Pois.workingSet.forEach(function(currentModel){
        globalThis.coordChange(currentModel);
      });
      
      this.listenTo(middguard.entities.Locationcounts, 'sync', function(col, resp, opt){
        globalThis.syncResponse(col, resp, opt, globalThis);
      });
      this.listenTo(middguard.entities['Check-ins'], 'sync', function(col, resp, opt){
        globalThis.syncResponse(col, resp, opt, globalThis);
      });
    
    },
    
    syncResponse: function (col, resp, opt, globalThis){
      //function responds to sync by fetching again or creating a chart view
      
      if (opt.source.slice(0,5) === 'spark'){
        var curIter = parseInt(opt.source.charAt(5));
        if (globalThis.childViews['x' + opt.x + 'y' + opt.y]){
          globalThis.childViews['x' + opt.x + 'y' + opt.y].appendChild(col, resp, opt);
          //append a just-completed view to the parent view
          if (globalThis.childViews['x' + opt.x + 'y' + opt.y].children.length === 3){
            globalThis.childViews['x' + opt.x + 'y' + opt.y].render();
            $('#loc-spark').append(globalThis.childViews['x' + opt.x + 'y' + opt.y].el);
            return true;
            //make sure that every chart currently displayed is scaled properly
            for (var view in globalThis.childViews){
              if (middguard.state.trendScale.max > globalThis.childViews[view].absMax && document.getElementById('scale-select').value === 'abs'){
                globalThis.childViews[view].render();
              }
            }
            
          }
        } else {
          //if a new child View
          
          globalThis.childViews['x' + opt.x + 'y' + opt.y] = new TrendViewWeekend({x:opt.x, y:opt.y});
          globalThis.childViews['x' + opt.x + 'y' + opt.y].appendChild(col, resp, opt);
        }
        //globalThis.current++;
        globalThis.goFetch(opt.x, opt.y, curIter + 1);
      }
    },
    
    switchScale: function(){
      //switches the scale of the charts
      
      for (var view in this.childViews){
        this.childViews[view].render();
      }
    },
    
    goFetch: function(x, y, iteration){
      //function does the fetching of the data
        switch(iteration){
          case 0:
            var curFetch = {source: 'spark0', data: {whereRaw: 'x = ' + x + ' AND y = ' + y + ' AND timestamp <= \'2014-06-07 00:00:00\' ', orderBy: ['timestamp', 'asc']}};
            break;
          case 1:
            var curFetch = {source: 'spark1', data: {whereRaw: 'x = ' + x + ' AND y = ' + y + ' AND timestamp >= \'2014-06-07 01:00:00\' AND timestamp <= \'2014-06-08 01:00:00\' ', orderBy: ['timestamp', 'asc']}};
            break;
          case 2:
            var curFetch = {source: 'spark2', data: {whereRaw: 'x = ' + x + ' AND y = ' + y + ' AND timestamp >= \'2014-06-08 01:00:00\' AND timestamp <= \'2014-06-09 01:00:00\' ', orderBy: ['timestamp', 'asc']}};
            break;
        }
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
      
      this.goFetch(x, y, 0);
      //return true;
    }
    
  });
  
  var TrendViewWeekend = middguard.View.extend({
    //wrapper view for each of the daily charts
    
    template: _.template('<div />'),
    
    initialize: function(options){
      
      this.x = options.x;
      this.y = options.y;
      this.el.classList.remove('middguard-module');
      this.d3el = d3.select(this.el);
      this.d3el.attr('id', 'x' + this.x + 'y' + this.y);
      this.d3el.attr('class', 'trendGraphParent');
      this.max = 0;
      this.absMax = middguard.state.trendScale.max;
      this.children = [];
      
    },
    
    removeSelf: function(){
      //remove this view and its child views
      this.d3el.selectAll('.trendGraphChildren').remove();
      this.d3el.remove();
    },
    
    appendChild: function(col, resp, opt){
      //append a child view
      
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
          var newChart = day.render(day.borderHeight, day.heightSqueeze, day.borderWidth, day.data, day.startTime, day.endTime, 0, middguard.state.trendScale.max, day.opt.x, day.opt.y, day.day, day.opt.poi);
        } else if (document.getElementById('scale-select').value === 'relWeekend'){
          var newChart = day.render(day.borderHeight, day.heightSqueeze, day.borderWidth, day.data, day.startTime, day.endTime, 0, globalThis.max, day.opt.x, day.opt.y, day.day, day.opt.poi);
        } else {
          //else if value = 'rel'
          var newChart = day.render(day.borderHeight, day.heightSqueeze, day.borderWidth, day.data, day.startTime, day.endTime, 0, day.max, day.opt.x, day.opt.y, day.day, day.opt.poi);
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
      //Function also makes an array containing the actual data to be used in rendering a chart
      //'dateFunction' is used to pass in the this.outputDate function
      //NOTE: -- Function assumed fetchData is sorted from least timestamp to greatest timestamp!
      
      var tStamp;
      var x = fetchData[0].x;
      var y = fetchData[0].y;
      var finalArray = [];
      var lastEntry = {};
      var index = 0;
      var current = new Date(start);
      var masterIndex = 0;
      while (current <= end){
        var newDate = new Date(current);
        if (index >= fetchData.length){
          //if fetchData's bound has been passed
          finalArray.push([newDate, 0]);
        } else {
          var minuteFloor = new Date(fetchData[index].timestamp);
          if (minuteFloor.getSeconds() != 0){
            minuteFloor.setSeconds(0);
          }
          if (minuteFloor.valueOf() === current.valueOf()){
            //if there's a value at the current time
            
            finalArray.push([newDate, fetchData[index].count]);
            lastEntry[x + ',' + y] = fetchData[index].count;
            
            //SET MAXES IF NEEDED
            if (fetchData[index].count > this.max){
              this.max = fetchData[index].count;
            }
            if (fetchData[index].count > this.parentView.max){
              this.parentView.max = fetchData[index].count;
            }
            if (fetchData[index].count > middguard.state.trendScale.max){
              middguard.state.trendScale.max = fetchData[index].count;
              this.parentView.absMax = fetchData[index].count;
            }
            //-----
            
            index++;
          } else {
            //if there's not a value at the current time
            
            if (lastEntry[x + ',' + y]){
              finalArray.push([newDate, lastEntry[x + ',' + y]])
            } else {
              finalArray.push([newDate, 0]);
            }
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
    
    render: function(borderHeight, axisY, borderWidth, allData, xMin, xMax, yMin, yMax, xCoord, yCoord, day, poi, whichMax){
      //function actually draws a trend line
      //function is specific, not particularly extensible
      
      var globalThis = this;
     
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
      
      var revXScale = d3.time.scale()
        .domain([15, borderWidth-15])
        .range([xMin, xMax]);
      
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
        /*
        .on('mouseover', function(d){
          
          //get rid of any previous mouseover stuff
          d3.selectAll('.xTrack').remove();
          d3.selectAll('.trendTooltip').remove();
          
          console.log(d3.mouse(this));
          var dateTime = new Date(revXScale(d3.mouse(this)[0]));
          canvas.append('circle')
          .attr('cx', function(){
            console.log(d3.mouse(this)[0]); return d3.mouse(this)[0];
          })
            .attr('cy', d3.mouse(this)[1])
            .attr('r', 4)
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('class', 'xTrack');
            
          globalThis.parentView.d3el.select('p').html(function(d){
            console.log(this.innerHTML);
            this.innerHTML = String(this.innerHTML) + String('\t\t\tDate and Time: ' + globalThis.outputDate(dateTime));
            return this;
          })
            //.append('text')
            //.property('x', '900px')
            //.attr('y', '20px')
            //.attr('class', 'trendTooltip')
            //.text('Date and Time: ' + globalThis.outputDate(dateTime));
            
        });
        */
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