var middguard = middguard || {};

(function () {
  'use strict';

  var MovementTraceView = middguard.View.extend({
    id: 'middguard-movement-trace',
		template: _.template('<h1>Movement Traces</h1><svg id="movement-trace-svg"><image xlink:href="/modules/movement-trace-view/images/movement-trace-map.jpg" id="movement-trace-map" x="0" y="0"/><g id="movement-trace-paths"></g><g id="movement-trace-locations"></g></svg><!--<p>Person: <input type="text" id="trace-query" /> <input type="submit" id="trace-query-add" value="Add person"/><input type="submit" id="trace-query-replace" value="Replace person"/> <input type="submit" id="trace-query-clear" value="Clear all"/></p> -->'),
    
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
      //this.listenTo(middguard.state.People.workingSet, 'add remove reset', this.update);
      this.listenTo(middguard.state.People.selections, 'add remove reset', this.update);
      this.listenTo(middguard.state.Pois.selections, 'add remove reset', this.render)
      this.listenTo(middguard.state.timeRange, 'change',this.render);

      var v = this;
      
      // make sure that movement traces remain sorted
      middguard.entities.Movementtraces.comparator = function(m){return m.get('timestamp');};
      
      
			middguard.state.People.selections.forEach(function(m){
        var pid = m.get('id');
        v.tracked.add(pid);
        middguard.entities.Movementtraces.fetch({data:{where:{person_id:pid}}, remove:false,  error:function(c,r,o){console.log(r);}});
      });

    },
    
    addPerson: function(){
      // add a new person to the tracked set
      var pid = +document.getElementById('trace-query').value;
      if (! this.tracked.has(pid)){
        middguard.state.People.workingSet.add({id:pid, loading: this});
        middguard.state.People.selections.reset({id:pid, loading: this});
      }
      
    },
    
    changePerson: function(){
      // replace the current set of tracked people with a new one
      var pid = +document.getElementById('trace-query').value;
      middguard.state.People.workingSet.reset({id:pid, loading: this});
      middguard.state.People.selections.reset({id:pid, loading: this});
    },
    
    clearAll: function(){
      // clear all of the tracked ids
      middguard.state.People.workingSet.reset();
      middguard.state.People.selections.reset();
    },
    
    update: function(model, collection, options){
      var v = this;
      var model;
      var collection;
      var options;
      if (arguments.length === 3){
        model = arguments[0];
        collection = arguments[1];
        options = arguments[2];
      }else{
        collection = arguments[0];
        options = arguments[1];
      }
      if (options && options.add){

        var pid = model.get('id');
        v.tracked.add(pid);
       
        if (middguard.entities.Movementtraces.where({person_id:pid}).length === 0 && (! model.get('loading') || model.get('loading') === v)){
          // whoever posted this event isn't going to also load the movement traces and
          // we don't have the data available, so fetch it
          // claim ownership
          model.set({loading: v});
         
          // do the fetch
          middguard.entities.Movementtraces.fetch({data:{where:{person_id:pid}}, remove:false,  error:function(c,r,o){console.log(r);}});
        }
        
      }else{
        model = collection.models[0];
        middguard.entities.Movementtraces.reset();
        v.tracked.clear();
        
        middguard.state.People.selections.forEach(function(m){
          var pid = m.get('id');
          v.tracked.add(pid);
          if (middguard.entities.Movementtraces.where({person_id:pid}).length === 0 && (! m.get('loading') || m.get('loading') === v)){
            // claim ownership
            m.set({loading: v});
           
            // do the fetch
            middguard.entities.Movementtraces.fetch({data:{where:{person_id:m.get('id')}}, remove:false});
          }
          
        }) 
      }
    },
    
    
		
    render: function () {
      var v = this;
  
      var canvas = d3.select('#movement-trace-paths');
      
     
      var routePath = d3.svg.line()
      .x(function(d){return (d.get('x') + .5) *(v.mapWidth/v.cells);})
      .y(function(d){ return v.mapHeight - (d.get('y') - .5) *(v.mapHeight/v.cells);})
      .interpolate("basis");
      
    
      var start = middguard.state.timeRange.current;
      var end = middguard.state.timeRange.end;
      if (start.valueOf() != middguard.state.timeRange.start.valueOf()){
        // we have a point rather than an interval
        end = start;
      }
    
    
      var routeCollection = {}
      
      
      v.tracked.forEach(function(pid) {
        var before = null;
        var after = null;
        var traces = middguard.entities.Movementtraces.where({person_id:pid})
        .filter(function (t){
          var timestamp = new Date(t.get('timestamp'));
          
          if (timestamp <= start){
            before = t;
          }
          if (timestamp >= end){
            after = t;
          }
          

          return (timestamp >= start && timestamp <= end);

        });
        
        if (traces.length > 0){
          routeCollection[pid] = traces;
          // add the last point on again to make the path draw correctly
          routeCollection[pid].push(traces[traces.length - 1]);
        }else if ( before != null && after != null){
          // time range falls between two movement samples
          routeCollection[pid] = [before];
        }
        
      });
      
      
      var pids = Object.keys(routeCollection);
      
      // use color brewer set1[9] for coloring
      var color = d3.scale.ordinal()
      .domain(pids)
        .range(["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf","#999999"])
      
      // if there is a selected person, put them on the back of the list so they will draw on top
      // if (pids.length > 0 && middguard.state.People.selections.length > 0){
//         pids.push(middguard.state.People.selections.models[0].id);
//       }
  
      var routes = canvas.selectAll('path').data(pids);
      routes.exit().remove();
      
      routes.enter()
      .append("path");
   
   
     routes.attr("d", function(d){return routePath(routeCollection[d]);})
     //.attr('stroke', function(d){return (middguard.state.People.selections.get(d))? '#00FF00':color(d);})
      .attr('stroke', function(d){return color(d);})
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
      
      
      var traceLayer = d3.select('#movement-trace-locations');
      
      var selections = traceLayer.selectAll('rect')
      .data(middguard.state.Pois.selections.models);
      
      selections.exit().remove();
      selections.enter().append('rect')
      .attr('width', 10)
      .attr('height',10)
      .attr('fill', '#00FF00');
      
      selections
      .attr('x',function(d){return  d.get('x') *(v.mapWidth/v.cells);})
      .attr('y',function(d){return v.mapHeight -d.get('y') *(v.mapHeight/v.cells);})
      
      
      return v;
    }
	});
	
	middguard.addModule('MovementTraceView', MovementTraceView);
})();
