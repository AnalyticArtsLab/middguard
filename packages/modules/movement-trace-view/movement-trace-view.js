var middguard = middguard || {};

(function () {
  'use strict';

  var MovementTraceView = middguard.View.extend({
    id: 'middguard-movement-trace',
		template: _.template('<svg id="movement-trace-svg"><image xlink:href="/modules/movement-trace-view/images/movement-trace-map.jpg" id="movement-trace-map" x="0" y="0"/><g id="movement-trace-paths"></g></svg><p>Person: <input type="text" id="trace-query" /> <input type="submit" id="trace-query-add" value="Add person"/><input type="submit" id="trace-query-replace" value="Replace person"/> <input type="submit" id="trace-query-clear" value="Clear all"/></p>'),
    
    events:{
      "click #trace-query-add":"addPerson",
      "click #trace-query-replace":"changePerson",
      "click #trace-query-clear":"clearAll"
    },
    
    initialize: function () {
      this.mapWidth = 800;
      this.mapHeight = 800;
      this.cells = 100;
      this.tracked = new Set();
      
      _.bindAll(this, 'render', 'addPerson', 'changePerson', 'clearAll');
      
      this.$el.html(this.template);
      
      
      this.listenTo(middguard.entities.Movementtraces, 'sync', this.render);
      this.listenTo(middguard.entities.Movementtraces, 'reset', this.render);
      this.listenTo(middguard.state.timeRange, 'change',this.render);

			
    },
    
    addPerson: function(){
      // add a new person to the tracked set
      var pid = +document.getElementById('trace-query').value;
      if (! this.tracked.has(pid)){
        middguard.entities.Movementtraces.fetch({data:{where:{person_id:pid}}, remove:false});
        this.tracked.add(pid);
      }
      
    },
    
    changePerson: function(){
      // replace the current set of tracked people with a new one
      var pid = +document.getElementById('trace-query').value;
      middguard.entities.Movementtraces.fetch({data:{where:{person_id:pid}}});
      this.tracked.clear();
      this.tracked.add(pid);
    },
    
    clearAll: function(){
      // clear all of the tracked ids
      middguard.entities.Movementtraces.reset();
      this.tracked.clear();
    },
		
    render: function () {
      var v = this;
      
      var canvas = d3.select('#movement-trace-paths');
      
      // use color brewer set1[9] for coloring
      var color = d3.scale.ordinal()
      .domain(v.tracked)
        .range(["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf","#999999"])

      var routePath = d3.svg.line()
      .x(function(d){return (d.get('x') + .5) *(v.mapWidth/v.cells);})
      .y(function(d){ return v.mapHeight - (d.get('y') + .5) *(v.mapHeight/v.cells);})
      .interpolate("basis-open");
      
    
      var routeCollection = {}
      v.tracked.forEach(function(pid) {
        var before = null;
        var after = null;
        var traces = middguard.entities.Movementtraces.where({person_id:pid})
        .filter(function (t){
          var timestamp = new Date(t.get('timestamp'));
          var start = middguard.state.timeRange.start;
          var end = middguard.state.timeRange.end;
          if (timestamp <= start){
            before = t;
          }
          if (timestamp >= end){
            after = t;
          }
          

          return (start === Number.NEGATIVE_INFINITY || timestamp >= start) && (end === Number.POSITIVE_INFINITY || timestamp <= end);

        });
        
        if (traces.length > 0){
          routeCollection[pid] = traces;
        }else if ( before != null && after != null){
          // time range falls between two movement samples
          routeCollection[pid] = [before];
        }
      
      });
      
      
  
      var routes = canvas.selectAll('path').data(Object.keys(routeCollection));
     routes.exit().remove();
     routes.enter()
     .append("path");
     
     
     routes.attr("d", function(d){ return routePath(routeCollection[d]);})
     .attr('stroke', function(d){return color(d)})
     .attr('stroke-width', 2)
     .attr('fill', 'none');
   
   
      
   
      var endPoints = canvas.selectAll('rect')
     .data(Object.keys(routeCollection));
    
     endPoints.exit().remove();
     
     endPoints.enter().append('rect');
     
     
     endPoints.attr('fill', function(d){return color(d)})
     .attr('x',function(d){return  routeCollection[d][routeCollection[d].length - 1].get('x') *(v.mapWidth/v.cells);})
     .attr('y',function(d){return v.mapHeight -routeCollection[d][routeCollection[d].length - 1].get('y') *(v.mapHeight/v.cells);})
     .attr('width',10)
     .attr('height',10);
      
      return v;
    }
	});
	
	middguard.addModule('MovementTraceView', MovementTraceView);
})();
