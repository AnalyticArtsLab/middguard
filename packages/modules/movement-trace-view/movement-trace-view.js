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
      var pid = document.getElementById('trace-query').value;
      if (! this.tracked.has(pid)){
        middguard.entities.Movementtraces.fetch({data:{where:{person_id:pid}}, remove:false});
        this.tracked.add(pid);
      }
      
    },
    
    changePerson: function(){
      // replace the current set of tracked people with a new one
      var pid = document.getElementById('trace-query').value;
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
      
      var color = d3.scale.category10()
      .domain(v.tracked);
      
      // var color = d3.scale.ordinal()
      // .domain(v.tracked)
      // .range(colorbrewer.Set1[9])

      var routePath = d3.svg.line()
      .x(function(d){return (d.get('x') + .5) *(v.mapWidth/v.cells);})
      .y(function(d){ return v.mapHeight - (d.get('y') + .5) *(v.mapHeight/v.cells);})
      .interpolate("basis");
      
      var pids = [];
      v.tracked.forEach(function(pid) {pids.push(pid);});
  
      var routes = canvas.selectAll('path').data(pids);
     routes.exit().remove();
     routes.enter()
     .append("path");
     
     
     routes.attr("d", function(d){
       var traces = middguard.entities.Movementtraces.where({person_id:+d})
       .filter(function (t){
         var timestamp = new Date(t.get('timestamp'));
         var start = middguard.state.timeRange.start;
         var end = middguard.state.timeRange.end;

         return (start === Number.NEGATIVE_INFINITY || timestamp >= start) && (end === Number.POSITIVE_INFINITY || timestamp <= end);

       });

       return routePath(traces);})
     .attr("stroke", function(d){return color(d)})
     .attr("stroke-width", "2")
     .attr("fill", "none");
   
      
      
      
      return v;
    }
  });
	
	
	middguard.addModule('MovementTraceView', MovementTraceView);
})();
