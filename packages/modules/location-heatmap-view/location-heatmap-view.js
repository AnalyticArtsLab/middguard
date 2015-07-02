var middguard = middguard || {};

(function () {
  'use strict';

  var LocationHeatmap = middguard.View.extend({
    id: 'heatmap',
    
    template: _.template('<div id="heatmapTitle"><h1>Location Heatmap</h1></div><svg id="heatmap-svg" width="1000" height="1000"><image xlink:href="/modules/movement-trace-view/images/movement-trace-map.jpg" id="movement-trace-map" style="width:1000px; height:1000px;" x="0" y="0"/></svg><div><select id="heatmap-choice"><option value="all">All Locations</option><option value="checkins">Check-In Locations</option></select></div>'),
    
    events:{
      "change #heatmap-choice":"userChange"
      
    },
    
    initialize: function () {
      var globalThis = this;
      
      //this.choice will switch between "all" and "checkins"
      middguard.state.heatmapChoice = 'all';
      
      this.$el.html(this.template);
      this.d3el = d3.select(this.el);
      this.yinc = 6; //margin at top--not a generalized value
      this.svg = d3.select(this.el).select('#heatmap-svg');
      this.colorScale = d3.scale.linear();
      this.colorScale.domain([0, 200]); //domain is a deliberate, specific choice
      this.colorScale.range(['#fee8c8', '#e34a33']);
      this.areaScale = d3.scale.linear().range([0, Math.PI*9]); //9 is a specific, deliberate choice
      
      _.extend(this, Backbone.Events);
      _.bindAll(this, 'render', 'getData', 'userChange');
      
      this.listenTo(middguard.state.timeRange, 'all', this.getData);
      this.listenTo(middguard.state.filters, 'change', function(col, resp, opt){
        this.render(globalThis.col, globalThis.resp, globalThis.opt);
      });
      this.listenTo(middguard.entities.Locationcounts, 'sync', function(col, resp, opt){
        this.render(col, resp, opt);
      });
      this.listenTo(middguard.entities['Check-ins'], 'sync', function(col, resp, opt){
        this.render(col, resp, opt);
      });
      this.listenTo(middguard.state.Pois.selections, 'reset', function(){
        this.render(globalThis.col, globalThis.resp, globalThis.opt);
      });
      
      this.availAttractions = new Set();
      
      this.distinctCheckins = new Set([
        '42$37', '34$68', '67$37', '73$79', '81$77', '92$81', '73$84', '85$86', '87$63', '28$66',
        '38$90', '87$48', '79$89', '16$49', '23$54', '99$77', '86$44', '63$99', '83$88', '78$48', '27$15', '50$57',
        '87$81', '79$87', '78$37', '76$22', '43$56', '69$44', '26$59', '6$43', '82$80', '76$88', '47$11', '16$66', '17$43',
        '43$78', '45$24', '32$33', '60$37', '0$67', '17$67', '48$87'
      ]);
      
      //this.listenTo(middguard.state.filters.selections, 'change', this.userChange);
      this.dataStore = {};
      this.dataStoreList = [];
      this.getData();
      
      this.listenTo(middguard.state.Pois.selections, 'add', function(){
        this.render(globalThis.col, globalThis.resp, globalThis.opt);
      });
      this.listenTo(middguard.state.Pois.selections, 'remove', function(model){
        if (middguard.state.heatmapChoice == 'all'){
          //if all locations
          
          globalThis.d3el.select('#rx' + model.get('x') + 'y' + model.get('y'))
            .attr('fill', function(d){
              d.clicked = false;
              return globalThis.colorScale(d.count);
            })
            .attr('stroke', function(d){
              return globalThis.colorScale(d.count);
            });
        } else {
          //if checkins
          globalThis.d3el.select('#cx' + model.get('x') + 'y' + model.get('y'))
            .attr('fill', function(d){
              d.clicked = false;
              return globalThis.colorScale(d.count);
            });
        }
      });
      
      
			
    },
    
    userChange: function(model){
      middguard.state.heatmapChoice = document.getElementById('heatmap-choice').value;
      this.getData();
    },
    
    getData: function(){
      //This function gets the data at a certain timestamp. Its execution will trigger the rendering.
      try {
        if (middguard.state.timeRange.current == Number.NEGATIVE_INFINITY){
          //this.stopListening(middguard.state.timeRange, "change", this.selectChange);
          middguard.state.timeRange.current = new Date("2014-06-06 08:02:00");
          //this.listenTo(middguard.state.timeRange, "change", this.selectChange);
        }
      } catch(err) {
        console.log(Error(err));
      }
      //start and end are specific, non-extensible dates
      var start = new Date("2014-06-06 08:02:00");
      var end = new Date("2014-06-08 23:20:16");
      
      var dateString = this.outputDate(middguard.state.timeRange.current);
      if (middguard.state.heatmapChoice == 'all'){
        //if data is being pulled for all locations
        
        //use data from minute floor as base to get data for a specific time
        var minuteFloor = dateString.slice(0, 17) + '00';
        middguard.entities['Locationcounts'].fetch({source: 'heatmap', reset: true, data: {where: ['timestamp', '<=', dateString],
            andWhere: ['timestamp', '>=', minuteFloor]}});  
      } else {
        //if data is being pulled for checkins
          var minuteFloor = dateString.slice(0, 17) + '00';
          middguard.entities['Check-ins'].fetch({source: 'heatmap', reset: true, data: {where: ['timestamp', '<=', dateString],
              andWhere: ['timestamp', '>=', minuteFloor]}});
      }
      
    },
    
    render: function (col, resp, opt) {
      //render the heatmap
      
      var globalThis = this;
      
      //make sure the function call is coming from the right place
      if (!opt || opt.source !== 'heatmap'){
        return this;
      }
      this.col = col;
      this.resp = resp;
      this.opt = opt;
      var svg = this.svg;
      
      if (middguard.state.heatmapChoice == 'all'){
        //if location heatmap
        
        var colorScale = this.colorScale;
        
        svg.selectAll('.heatCircle')
        .attr('r', 0);
        
        var rects = this.svg.selectAll('rect')
          .data(resp)
        
        rects
          .attr('x', function(d){return d.x*10;})
          .attr('y', function(d){return 1000-(d.y*10)-6}) //-6 is a specific choice given the image we're working with
          .attr('width', function(d){
            return (d.count > 0) ? 10: 0;
          })
          .attr('height', function(d){
            return (d.count > 0) ? 10: 0;
          })
          .attr('height', function(d){
            return (d.count > 0) ? 10: 0;
          })
          .attr('fill', function(d){
            var newModel = middguard.state.Pois.selections.findWhere({x: d.x, y: d.y});
            if (newModel){
              d.clicked = true;
              d.model = newModel;
              return '#99ff66';
            } else {
              d.clicked = false;
              d.model = null;
              return colorScale(d.count); 
            }
          })
          .attr('stroke', function(d){
            return (middguard.state.Pois.selections.findWhere({x: d.x, y: d.y})) ? '#99ff66': colorScale(d.count);
          })
          .attr('class', 'heatRect');
        
        rects
          .enter()
          .append('rect')
          .attr('x', function(d){return d.x*10;})
          .attr('y', function(d){return 1000-(d.y*10)-6}) //-6 is a specific choice given the image we're working with
          .attr('width', function(d){
            return (d.count > 0) ? 10: 0;
          })
          .attr('height', function(d){
            return (d.count > 0) ? 10: 0;
          })
          .attr('fill', function(d){
            var newModel = middguard.state.Pois.selections.findWhere({x: d.x, y: d.y});
            if (newModel){
              d.clicked = true;
              d.model = newModel;
              return '#99ff66';
            } else {
              d.clicked = false;
              d.model = null;
              return colorScale(d.count); 
            }
          })
          .attr('stroke', function(d){
            return (middguard.state.Pois.selections.findWhere({x: d.x, y: d.y})) ? '#99ff66': colorScale(d.count);
          })
          .attr('class', 'heatRect')
          .attr('id', function(d){
            return 'rx' + d.x + 'y' + d.y;
          });
          
        rects
          .exit()
          .attr('width', 0)
          .attr('height', 0);
          
        rects
          .on('mouseover', function(d){
            svg.append('text')
              .attr('x', 750) //750 and 950 are specific, deliberate choices
              .attr('y', 970)
              .attr('fill', '#CC0000')
              .attr('class', 'tooltip')
            .text('x: ' + d.x + ', y: ' + d.y + ', count: ' + d.count);
          }).on('mouseout', function(d){
            svg.selectAll('.tooltip').remove();
          }).on('click', function(d){
            if (d.clicked){
              d3.select(this)
                .attr('fill', function(d){return colorScale(d.count)})
                .attr('stroke', function(d){return colorScale(d.count)});
                d.clicked = false;
                middguard.state.Pois.selections.remove(d.model);
                d.model = null;
            } else {
              d3.select(this).attr('fill', '#99ff66')
                .attr('stroke', '#99ff66');
              d.clicked = true;
              var newModel = middguard.state.Pois.selections.add({x: d.x, y: d.y});
              d.model = newModel;
            }
          });
          
      } else {
        //if checkin heatmap
        
        var areaScale = this.areaScale;
        var colorScale = d3.scale.linear().domain([0, 200]).range(['#fee8c8', '#e34a33']); //domain is a specific choice
        
        svg.selectAll('.heatRect')
        .attr('height', 0)
        .attr('width', 0);
        
        
        var circles = this.svg.selectAll('circle')
          .data(resp)
        
        circles
          .attr('cx', function(d){return d.x*10;})
          .attr('cy', function(d){return 1000-(d.y*10)-6}) //-6 is a specific choice given the image we're working with
          .attr('r', function(d){
            if (middguard.state.filters['No Filter']){
              return Math.pow(areaScale(d.count)/Math.PI, 0.5);
            }
            var possibility = middguard.entities.Pois.findWhere({x: d.x, y: d.y});
            return (possibility && middguard.state.filters[possibility.get('type')] && d.count > 0) ? Math.pow(areaScale(d.count)/Math.PI, 0.5): 0;
          })
          .attr('fill', function(d){
            var newModel = middguard.state.Pois.selections.findWhere({x: d.x, y: d.y});
            if (newModel){
              d.clicked = true;
              d.model = newModel;
              return '#99ff66';
            } else {
              d.clicked = false;
              d.model = null;
              return colorScale(d.count); 
            }
          })
          .attr('stroke', 'black')
          .attr('class', 'heatCircle');
      
        circles
          .enter()
          .append('circle')
          .attr('cx', function(d){return d.x*10;})
          .attr('cy', function(d){return 1000-(d.y*10)-6}) //-6 is a specific choice given the image we're working with
          .attr('r', function(d){
            if (middguard.state.filters['No Filter']){
              return Math.pow(areaScale(d.count)/Math.PI, 0.5);
            }
            var possibility = middguard.entities.Pois.findWhere({x: d.x, y: d.y});
            return (possibility && middguard.state.filters[possibility.get('type')] && d.count > 0) ? Math.pow(areaScale(d.count)/Math.PI, 0.5): 0;
          })
          .attr('fill', function(d){
            var newModel = middguard.state.Pois.selections.findWhere({x: d.x, y: d.y});
            if (newModel){
              d.clicked = true;
              d.model = newModel;
              return '#99ff66';
            } else {
              d.clicked = false;
              d.model = null;
              return colorScale(d.count); 
            }
          })
          .attr('stroke', 'black')
          .attr('class', 'heatCircle')
          .attr('id', function(d){
            return 'cx' + d.x + 'y' + d.y;
          });
          
        circles
          .exit()
          .attr('r', 0);
            
        circles
          .on('mouseover', function(d){
            svg.append('text')
              .attr('x', 750) //750 and 950 are specific, deliberate choices
              .attr('y', 970)
              .attr('fill', '#CC0000')
              .attr('class', 'tooltip')
            .text('x: ' + d.x + ', y: ' + d.y + ', count: ' + d.count);
          }).on('mouseout', function(d){
            svg.selectAll('.tooltip').remove();
          }).on('click', function(d){
            if (d.clicked){
              d3.select(this)
                .attr('fill', function(d){return colorScale(d.count)})
                .attr('stroke', function(d){return colorScale(d.count)});
                d.clicked = false;
                middguard.state.Pois.selections.remove(d.model);
                d.model = null;
            } else {
              d3.select(this).attr('fill', '#99ff66')
                .attr('stroke', '#99ff66');
              d.clicked = true;
              var newModel = middguard.state.Pois.selections.add({x: d.x, y: d.y});
              d.model = newModel;
            }
          });
      }
      return this;
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