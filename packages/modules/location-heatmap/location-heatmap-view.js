var middguard = middguard || {};

(function () {
  'use strict';

  var LocationHeatmap = middguard.View.extend({
    id: 'heatmap',
    
    template: _.template('<svg id="heatmap-svg" width="1000" height="1000"><image xlink:href="/modules/movement-trace-view/images/movement-trace-map.jpg" id="movement-trace-map" style="width:1000px; height:1000px;" x="0" y="0"/></svg><select id="heatmap-choice"><option value="all">All Locations</option><option value="checkins">Check-In Locations</option></select>'),
    
    events:{
      "change #heatmap-choice":"getData"
    },
    
    initialize: function () {
      
      //this.choice will switch between "all" and "checkins"
      this.choice = 'all';
      
      this.$el.html(this.template);
      this.yinc = 6; //margin at top
      
      this.colorScale = d3.scale.linear();
      this.colorScale.domain([0, 1000]);
      this.colorScale.rangeRound([0, 8]);
      this.areaScale = d3.scale.linear().range([0, Math.PI*400]);
      
      _.extend(this, Backbone.Events);
      _.bindAll(this, 'render', 'drawLoc', 'drawCheckin', 'processDataOpt', 'getData', 'selectChange');
      
      this.listenTo(middguard.state.timeRange, "change", this.getData);
      this.listenTo(middguard.entities['Locationcounts'], 'sync', this.render);
      //this.listenTo(middguard.entities['Locationcounts'], 'reset', this.render);
      this.dataStore = {};
      this.dataStoreList = [];
      this.getData();
			
    },
    
    selectChange: function(){
      this.choice = document.getElementById('heatmap-choice');
      this.getData();
    },
    
    getData: function(){
      //This function gets the data at a certain timestamp. Its execution will trigger the rendering.
      
      try {
        if (middguard.state.timeRange.start == Number.NEGATIVE_INFINITY){
          middguard.state.timeRange.start = new Date("2014-06-06 08:02:00");
        }
        var dateString = this.outputDate(middguard.state.timeRange.start);
      } catch(err) {
        console.log(err);
      }
      var start = new Date("2014-06-06 08:02:00");
      var end = new Date("2014-06-08 23:20:16");
      if (middguard.state.timeRange.start < start){
        middguard.state.timeRange.start = start;
      }
      if (middguard.state.timeRange.start > end){
        middguard.state.timeRange.start = end;
      }
      if (this.choice == 'all'){
        //if data is being pulled for all locations
        
        //use data from minute floor as base to get data for a specific time
        var minuteFloor = dateString.slice(0, 17) + '00';
        middguard.entities['Locationcounts'].fetch({reset: true, data: {where: ['timestamp', '<=', dateString],
              andWhere: ['timestamp', '>=', minuteFloor]}});  
      } else {
        middguard.entities['Check-ins'].fetch({reset: true, data: {where: ['timestamp', '<=', dateString]}});
      }
      
      
      /*
      if (this.dataStoreList.length > 0){
        //utilize cached heatmap data
        var closest = this.binarySearch(this.dataStoreList, 0, this.dataStoreList.length-1, middguard.state.timeRange.start.valueOf());
        var startVal = middguard.state.timeRange.start.valueOf();
        var closestDateString = this.outputDate(new Date(closest));
        if (startVal > closest){
          middguard.entities["Locationcounts"].fetch({reset: true, data: {where: ['timestamp', '<', dateString]},
                andWhere: ['timestamp', '>', closestDateString]});
        } else if (startVal < closest){
          middguard.entities["Locationcounts"].fetch({reset: true, data: {where: ['timestamp', '>', dateString]},
                andWhere: ['timestamp', '<', closestDateString]});
        } else {
          //if startVal == closest
          draw(this.dataStore[closest]);
        } 
        
      } else {
          middguard.entities["Locationcounts"].fetch({data: {where: ['timestamp', '<', dateString]}});
      }
      */
    },
    
    render: function () {
      if (this.choice == 'all'){
        //if location heatmap
        var dateString = this.outputDate(middguard.state.timeRange.start);
        var start = new Date("2014-06-06 08:00:19");
        var end = new Date("2014-06-08 23:20:16");
        var processData = this.processDataOpt;
        var draw = this.draw;
      
        var locCountData = processData(middguard.entities['Locationcounts'].models, dateString, start, end, 1361);
        drawLoc(locCountData);
        
        //this.dataStore[middguard.state.timeRange.start.valueOf()] = locCountData;
        //this.dataStoreList.push(middguard.state.timeRange.start.valueOf());
      } else {
        //if checkin heatmap
        var dateString = this.outputDate(middguard.state.timeRange.start);
        var curTime = new Date(dateString);
        var start = new Date("2014-06-06 08:00:19");
        var end = new Date("2014-06-08 23:20:16");
      
        var checkinData = this.processDataCheckin(middguard.entities['Check-ins'].models, dateString, start, end);
      
        var divisor = 345/9;
        var svg = d3.select("#heatmap-svg");
        var yinc = this.yinc;
        var xinc = this.xinc;
        var colorScale = ["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#b30000","#7f0000"];
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
                if (checkinData[row][col] > 0){
                  return colorScale[Math.floor(checkinData[row][col]/divisor)];
                } else {
                  return 'none';
                }
              },
              'stroke': function(){
                if (checkinData[row][col] > 0){
                  return colorScale[Math.floor(checkinData[row][col]/divisor)];
                } else {
                  return 'none';
                }
              }
    				});
          }
        }    
      }
      return this;
    },
    
    drawCheckin: function(data){
      //draw checkin data on map
      //var divisor = 345/9;
      var colors = ["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#b30000","#7f0000"];
      var svg = d3.select("#heatmap-svg");
      var yinc = this.yinc;
      var colorScale = this.colorScale.domain([0, 345]);
      var areaScale = this.areaScale;
      
      data.forEach(function(item, col){
        svg.selectAll('.col'+col)
          .data(item)
          .enter()
          .append('circle')
          .attr({
            'cx': function (d, row){
              //add 5 to x and y to guarantee that circle is in middle of square
              return (row*10)+5;
            },
  					'cy': ((100-col)*10)-yinc+5,
            'radius': function(d, row){
              if (d[2] && d[2] > 0){
                return Math.pow(areaScale(d[2])/Math.PI, 0.5);
              } else {
                return 0;
              }
            }
            'fill': function (d, row){
              if (d[2] && d[2] > 0){
               return colors[colorScale(d[2])]; 
              } else {
                return 'none';
              }
            },
            'stroke': function (d, row){
              if (d[2] && d[2] > 0){
               return colors[colorScale(d[2])]; 
              } else {
                return 'none';
              }
            },
            'class': 'heatCircle col'+col,
            'id': function (d, row){
              return 'heatmapr'+row+'c'+col;
            }
          });
      });
      d3.selectAll('.heatCircle')
      .on('mouseover', function(d){
        svg.append('text')
          .attr('x', 750)
          .attr('y', 970)
          .attr('fill', '#CC0000')
          .attr('class', 'tooltip')
        .text('x: ' + d[0] + ', y: ' + d[1] + ', count: ' + d[2]);
      }).on('mouseout', function(d){
        d3.selectAll('.tooltip').remove();
      });
    }
    
    drawLoc: function(data){
      //draw location data on map
      
      var colors = ["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#b30000","#7f0000"];
      var svg = d3.select("#heatmap-svg");
      var yinc = this.yinc;
      var colorScale = this.colorScale;
      var dim = 100;
      d3.selectAll('.heatRect').remove();
      
      data.forEach(function(item, col){
        svg.selectAll('.col'+col)
          .data(item)
          .enter()
          .append('rect')
          .attr({
            'x': function (d, row){
              return row*10;
            },
  					'y': ((100-col)*10)-yinc,
  					'height': 10,
  					'width': 10,
            'fill': function (d, row){
              if (d[2] && d[2] > 0){
               return colors[colorScale(d[2])]; 
              } else {
                return 'none';
              }
            },
            'stroke': function (d, row){
              if (d[2] && d[2] > 0){
               return colors[colorScale(d[2])]; 
              } else {
                return 'none';
              }
            },
            'class': 'heatRect col'+col,
            'id': function (d, row){
              return 'heatmapr'+row+'c'+col;
            }
          });
      });
      d3.selectAll('.heatRect')
      .on('mouseover', function(d){
        svg.append('text')
          .attr('x', 750)
          .attr('y', 970)
          .attr('fill', '#CC0000')
          .attr('class', 'tooltip')
        .text('x: ' + d[0] + ', y: ' + d[1] + ', count: ' + d[2]);
      }).on('mouseout', function(d){
        d3.selectAll('.tooltip').remove();
      });
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
    
    processDataCheckin: function(dataArray, timestamp, start, end){
      //process data for checkin heatmap
      
      var tsDate = new Date(timestamp);
      if (tsDate > end || tsDate < start){
        console.log("Error: Timestamp out of range");
        return null;
      }
      
      var heatmapData = [];
      for (var i = 0; i < 100; i++){
        heatmapData[i] = [];
        for (var j = 0; j < 100; j++){
          heatmapData[i][j] = 0;
        }
      }
      
      var curIndex = 0;
      var x;
      var y;
      while (new Date(dataArray[curIndex].attributes.timestamp) <= tsDate){
        x = dataArray[curIndex].attributes.x;
        y = dataArray[curIndex].attributes.y;
        heatmapData[y][x] = [x, y, dataArray[curIndex].attributes.count];
        curIndex++;
      }
      return heatmapData;
      
      
    },
    
    processDataOpt: function(dataArray, timestamp, start, end, distincts){
      //process data for location heatmap
      //distincts represents the number of distinct x,y pairs we need before we can exit
      
      var heatmapData = [];
      for (var i = 0; i < 100; i++){
        heatmapData[i] = [];
        for (var j = 0; j < 100; j++){
          heatmapData[i][j] = 0;
        }
      }
      
      var used = new Object();
      used.items = 0;
      var curIndex = dataArray.length-1;
      var x, y;
      //var countMax = 0;
      while (curIndex >= 0 && used.items < distincts){
        //while not every x,y pair has had a value found for it and the array has not been fully traversed
        x = dataArray[curIndex].attributes.x;
        y = dataArray[curIndex].attributes.y;
        if (! used[x + ',' + y]){
          //if x,y pair is unencountered
          used[x + ',' + y] = true;
          heatmapData[y][x] = [x, y, dataArray[curIndex].attributes.count];
          /*if (dataArray[curIndex].attributes.count > countMax){
            countMax = dataArray[curIndex].attributes.count;
          }*/
          used.items++;
        }
        curIndex--;
      }
      this.colorScale.domain([0, countMax]);
      return heatmapData;
    },
    
    binarySearch: function(array, first, last, val){
      var mdpt;
      if (last <= first){
        return first;
      }
      while (first < last){
        if (last == first+1){
          //if val appears between 2 indices in list or is beyond one end of the list
          firstDiff = Math.abs(val-array[first]);
          lastDiff = Math.abs(val-array[last]);
          if (lastDiff < firstDiff){
            return last;
          } else {
            //if val is closer to the 'first' index or value is equidistant from 'first' and 'last'
            return first;
          }
        }
        mdpt = first+((last-first)/2)
        if (array[mdpt] == val){
          return mdpt;
        } else if (array[mdpt] > val){
          last = mdpt;
        } else {
          //if array[mdpt] < val
          first = mdpt;
        }
      }
    },
    
  });

  middguard.addModule('LocationHeatmap', LocationHeatmap);
})();