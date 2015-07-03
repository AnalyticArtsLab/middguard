var middguard = middguard || {};

(function () {
  'use strict';

  var DwelltimeHeatmap = middguard.View.extend({
    id: 'dwell-heatmap',
    
    template: _.template('<div id="dwellTitle"><h1>Dwell Time Heatmap</h1></div><svg id="heatmap-svg" width="800" height="800"><image xlink:href="/modules/movement-trace-view/images/movement-trace-map.jpg" id="movement-trace-map" style="width:800px; height:800px;" x="0" y="0"/></svg><div><p>Scale Max: <input type="range" id="stepSlider" min="0" max="3706" step="50" value="3706" /> <input type="text" id="stepDisplay" value="3706" /></p></div>'),
    
    events:{
      "change #heatmap-choice":"userChange",
      "change .filter": "userChange"
      
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
      this.colorScale.domain([0, 3706]); //domain is a deliberate, specific choice
      this.colorScale.range(['#fee8c8', '#e34a33']);
      this.areaScale = d3.scale.linear().range([0, Math.PI*9]); //9 is a specific, deliberate choice
      
      _.extend(this, Backbone.Events);
      _.bindAll(this, 'render', 'processDataAll', 'getData');
      
      this.listenTo(middguard.state.timeRange, 'all', this.getData); //this.getData
      
      this.listenTo(middguard.entities['Dwell-instances'], 'sync', function(col, resp, opt){
        this.render(col, resp, opt);
      });
      //this.listenTo(middguard.entities['Locationcounts'], 'reset', this.render);
      this.distinctCheckins = new Set([
        '42$37', '34$68', '67$37', '73$79', '81$77', '92$81', '73$84', '85$86', '87$63', '28$66',
        '38$90', '87$48', '79$89', '16$49', '23$54', '99$77', '86$44', '63$99', '83$88', '78$48', '27$15', '50$57',
        '87$81', '79$87', '78$37', '76$22', '43$56', '69$44', '26$59', '6$43', '82$80', '76$88', '47$11', '16$66', '17$43',
        '43$78', '45$24', '32$33', '60$37', '0$67', '17$67', '48$87'
      ]);
      
      var slider = this.d3el.select('#stepSlider')[0][0];
      var display = this.d3el.select('#stepDisplay')[0][0];
      slider.oninput = function(){
        var val = parseInt(slider.value);
        display.value = val;
        globalThis.colorScale.domain([0, val]);
        globalThis.getData();
      }
      
      display.onchange = function(){
        var val = parseInt(display.value);
        slider.value = val;
        globalThis.colorScale.domain([0, val]);
        globalThis.getData();
      }
      
      this.listenTo(middguard.state.Pois.selections, 'add reset', function(){
        this.render(globalThis.col, globalThis.resp, globalThis.opt);
      });
      this.listenTo(middguard.state.Pois.selections, 'remove', function(model){
        globalThis.d3el.select('#rx' + model.get('x') + 'y' + model.get('y'))
          .attr('fill', function(d){
            d.clicked = false;
            return globalThis.colorScale(d.dwell);
          })
          .attr('stroke', function(d){
            return globalThis.colorScale(d.dwell);
          });
      });
      
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
      if (middguard.state.timeRange.current < start){
        this.stopListening(middguard.state.timeRange, "change", this.selectChange);
        middguard.state.timeRange.current = start;
        this.listenTo(middguard.state.timeRange, "change", this.selectChange);
      }
      if (middguard.state.timeRange.current > end){
        this.stopListening(middguard.state.timeRange, "change", this.selectChange);
        middguard.state.timeRange.current = end;
        this.listenTo(middguard.state.timeRange, "change", this.selectChange);
      }
      var dayRange = [middguard.state.timeRange.start, middguard.state.timeRange.end];
      
      if (dayRange[0].getDate() === dayRange[1].getDate()){
        //if only the data from 1 day is required

        middguard.entities['Dwell-instances'].fetch({source: 'dwelltime', multiday: false, reset: true, data: {where: ['day', '=', dayRange[0].getDate()]} });
      } else if (middguard.state.timeRange.current.valueOf() !== dayRange[0].valueOf()){
        //if only the data from 1 day is required, and exactly one instant has been selected
        
        middguard.entities['Dwell-instances'].fetch({source: 'dwelltime', multiday: false, reset: true, data: {where: ['day', '=', middguard.state.timeRange.current.getDate()]} });
      } else {
        //if data from multiple days is required
        
        middguard.entities['Dwell-instances'].fetch({source: 'dwelltime', multiday: true, reset: true, data: {where: ['day', '>=', dayRange[0].getDate()],
        andWhere: ['day', '<=', dayRange[1].getDate()]} });
      }
      
    },
    
    render: function (col, resp, opt) {
      //render the heatmap
      
      //make sure the function call is coming from the right place
      if (!opt || opt.source !== 'dwelltime'){
        return this;
      }
      
      if (opt.multiday){
        resp = this.processDataAll(resp);
      }
      
      this.col = col;
      this.resp = resp;
      this.opt = opt;
      
      var svg = this.svg;
      
      //if (middguard.state.heatmapChoice == 'all'){
        //if location heatmap
        
        var colorScale = this.colorScale;
        
        svg.selectAll('.heatCircle')
        .attr('r', 0);
        
        var rects = this.svg.selectAll('rect')
        .data(resp);
        
        rects
          .attr('x', function(d){return d.x*8})
          .attr('y', function(d){return 800-(d.y*8)-5}) //-6 is a specific choice given the image we're working with
          .attr('width', function(d){
            return (d.dwell > 0) ? 8: 0;
          })
          .attr('height', function(d){
            return (d.dwell > 0) ? 8: 0;
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
              return colorScale(d.dwell); 
            }
          })
          .attr('stroke', function(d){
            var newModel = middguard.state.Pois.selections.findWhere({x: d.x, y: d.y});
            if (newModel){
              d.clicked = true;
              d.model = newModel;
              return '#99ff66';
            } else {
              d.clicked = false;
              d.model = null;
              return colorScale(d.dwell); 
            }
          })
          .attr('class', 'heatRect')
          .attr('id', function(d){
            return 'rx' + d.x + 'y' + d.y;
          });
        
        rects
          .enter()
          .append('rect')
          .attr('x', function(d){return d.x*8})
          .attr('y', function(d){return 800-(d.y*8)-5}) //-6 is a specific choice given the image we're working with
          .attr('width', function(d){
            return (d.dwell > 0) ? 8: 0;
          })
          .attr('height', function(d){
            return (d.dwell > 0) ? 8: 0;
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
              return colorScale(d.dwell); 
            }
          })
          .attr('stroke', function(d){
            var newModel = middguard.state.Pois.selections.findWhere({x: d.x, y: d.y});
            if (newModel){
              d.clicked = true;
              d.model = newModel;
              return '#99ff66';
            } else {
              d.clicked = false;
              d.model = null;
              return colorScale(d.dwell); 
            }
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
              .attr('x', 550) //750 and 950 are specific, deliberate choices
              .attr('y', 772)
              .attr('fill', '#CC0000')
              .attr('class', 'tooltip')
            .text('x: ' + d.x + ', y: ' + d.y + ', Avg. Dwell Time: ' + d.dwell);
          }).on('mouseout', function(d){
            svg.selectAll('.tooltip').remove();
          }).on('click', function(d){
            if (d.clicked){
              d3.select(this)
                .attr('fill', function(d){return colorScale(d.dwell)})
                .attr('stroke', function(d){return colorScale(d.dwell)});
              d.clicked = false;
              middguard.state.Pois.selections.remove(d.model);
              var removed = middguard.state.Pois.workingSet.remove(d.model);
              d.model = null;
            } else {
              d3.select(this).attr('fill', '#99ff66')
                .attr('stroke', '#99ff66');
              d.clicked = true;
              var newModel = new Backbone.Model({x: d.x, y: d.y})
              middguard.state.Pois.selections.reset(newModel);
              if (d3.event.altKey){
                middguard.state.Pois.workingSet.add(newModel);
              } else {
                middguard.state.Pois.workingSet.reset(newModel);
              }
              d.model = newModel;
            }
          });
    
      return this;
    },
    
    
    processDataAll: function(resp){
      //process data for location heatmap
      //distincts represents the number of distinct x,y pairs we need before we can exit
      
      var dwellData = new Map();
      var dataArray = [];
      
      resp.forEach(function(row){
        if (dwellData.has(row.x+','+row.y)){
          var datum = dwellData.get(row.x+','+row.y);
          datum.dwell = datum.dwell * datum.days;
          datum.days = datum.days + 1;
          datum.dwell = (datum.dwell + row.dwell)/datum.days;
          dwellData.set('dwell', datum );
        } else {
          dwellData.set(row.x+','+row.y, {x: row.x, y:row.y, day: row.day, dwell: row.dwell, days: 1});
        }
      })
      dwellData.forEach(function(item){
        dataArray.push(item)
      })
      
      return dataArray;
    },
    
    
  });

  middguard.addModule('DwelltimeHeatmap', DwelltimeHeatmap);
})();