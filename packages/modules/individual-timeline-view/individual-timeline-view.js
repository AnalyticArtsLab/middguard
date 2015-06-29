var middguard = middguard || {};

(function () {
  'use strict';

  var IndividualTimelinesView = middguard.View.extend({
    id: 'individual-timeline-rect',
		template: _.template('<h1>Individual activity</h1><div id="individual-timeline-container"></div>'),
    
    events:{},
    
    initialize: function () {
      var v = this;
      _.bindAll(this, 'addView' );
      
      this.$el.html(this.template);
      
      
      this.listenTo(middguard.state.People.workingSet, 'add', this.addView)
      this.listenTo(middguard.state.People.workingSet, 'reset', function(collection, options){
        collection.models.forEach(function(model){v.addView(model);})
      });

      var v = this;
			middguard.state.People.workingSet.forEach(function(m){v.addView(m); });

    },
    
    addView: function(model){
      var newTimeline = new IndividualTimelineView({model:model});
      newTimeline.listenTo(middguard.state.People.workingSet, 'reset', newTimeline.remove);
      newTimeline.listenTo(middguard.state.People.workingSet, 'remove', function(model){
        if (model === v.model){
          newTimeline.remove();
        }
      });

      $("#individual-timeline-container",this.$el).append(newTimeline.el);
    }
	});
  
  
  var IndividualTimelineView = middguard.View.extend({
    className:'individual-timeline',
    template: _.template('<h1><%- pid %></h1>'),
    
    events:{},
    width: 200,
    height: 1100,
    margins:20,
    initialize: function () {
      var v = this;
      _.bindAll(this, 'render', 'setupView', 'changeInterval' );
      var pid = this.model.get('id');

      this.$el.html(this.template({pid:pid}));
      
  		this.timeScale= d3.time.scale();
  		this.axis = d3.svg.axis();
     
      
     
      
      
      
  		this.timeScale.domain([middguard.state.timeRange.start, middguard.state.timeRange.end]);
      this.listenTo(middguard.state.timeRange, 'change',this.changeInterval);
      this.listenTo(middguard.state.Pois.selections, 'add reset remove', this.render)
      
      
  		this.setupView();
      
      if (middguard.entities.Movementtraces.where({person_id: pid}).length === 0){
        // data needs to be fetched
        this.listenTo(middguard.entities.Movementtraces, 'sync reset', this.render);
        
        // check if another view has taken responsibility for it
        if (! this.model.get('loading')){
          middguard.entities.Movementtraces.fetch({data:{where:{person_id:pid}}, remove:false,  error:function(c,r,o){console.log(r);}});
          
        }
      }
      
      
    },
    
    changeInterval:function(){
  		// Called when the time interval has been changed
  		if (this.axisObject){
  			this.timeScale.domain([middguard.state.timeRange.start, middguard.state.timeRange.end]);
  			this.axisObject.call(this.axis);
  			this.render();
  		}
      
      
    },
    
    setupView: function(){
      // Do the initial layout of the timeline
      var v = this;
      var pid = this.model.get('id');
      
      var svg = d3.select(v.el)
      .append('svg')
      .attr('class','individual-timeline-svg')
      .attr('id', 'timeline_' + pid)
      .attr('width', v.width)
      .attr('height', v.height);
     
      v.canvas = svg.append('g')
      .attr('transform', 'translate('+v.margins+', '+v.margins+')')
      .attr('width', v.width - 2*v.margins)
      .attr('height', v.height - 2 * v.margins);
      
      
      v.timeScale.range([0, v.height - 2*v.margins]); 
      
      v.axis.scale(v.timeScale)
      .orient('left')
      .innerTickSize(20)
      .outerTickSize(10);
     
      
      v.axisObject = v.canvas
      .append('g')
      .attr('transform', 'translate(40,0)')
      .attr('class','axis')
      .call(v.axis);
      
      
      v.checkins = v.canvas.append('g')
      .attr('class', 'individual-check-ins')
      .attr('transform', 'translate(35,0)');
      
      v.labels = v.canvas.append('g')
      .attr('class', 'individual-check-in-labels')
      .attr('transform', 'translate(50,0)');
      
      return v.render();
      
    },
    
    fetchLabel: function(x,y){
      var poi = middguard.entities.Pois.findWhere({x:x, y:y});
      if (poi){
        return poi.get('name');
      }else{
        return '('+x+', '+y+')';
      }
      
    },
    
    render: function () {
      console.log('render');
      var v = this;
      var pid = this.model.get('id');
      var traces = middguard.entities.Movementtraces.where({person_id: pid});
      var events = [];
      
      var start = middguard.state.timeRange.start;
      var end = middguard.state.timeRange.end;
    
      
      var current = {start: null, end: null, x: null, y: null, type:null};
  
      for (var i = 0; i < traces.length; i++){
        var t = traces[i];
        var timestamp = new Date(t.get('timestamp'));
        var x = t.get('x');
        var y = t.get('y');
        var type = t.get('type');

        if (current.start != null && current.start.getDay() === timestamp.getDay()){
          current.end = timestamp;
          
          if (current.start < end 
            && current.end > start 
            && (current.type==='check-in' || current.end - current.start > 2*(6000))){
            // keep this if the type is a check-in or they have been standing there for
            // more than two minutes
            // check-in overlaps current time at least
            // trim to fit
            current.start = new Date(Math.max(start, current.start));
            current.end = new Date(Math.min(end, current.end));
            // save it
            events.push(current);
          }
        }
        current = {start: timestamp, end: null, x: x, y: y, type:type};
      }
      
      var rects = v.checkins.selectAll('rect')
      .data(events);
      
      rects.exit().remove();
      rects.enter().append('rect');
      
      rects
      .attr('width',10)
      .attr('x', 0)
      .attr('y', function(d){ return v.timeScale(d.start);})
      .attr('height', function(d){ return v.timeScale(d.end) - v.timeScale(d.start)})
      .style('fill', function(d){
          if (middguard.state.Pois.selections.findWhere({x:d.x, y:d.y})){
            return '#00FF00';
          }else{
            return (d.type==='check-in')? '#BBBBBB' : 'white';
          }
        })
      .style('stroke', 'black');
      
      
      var labels = v.labels.selectAll('text')
      .data(events);
      
      labels.exit().remove();
      labels.enter().append('text');
      
      labels
      .attr('x', 0)
      .attr('y', function(d){ 
        return v.timeScale(d.start) + (7 + v.timeScale(d.end) - v.timeScale(d.start))/2;})
      .text(function(d){return v.fetchLabel(d.x, d.y)});
      
      
      rects.on('click', function(d){
         if (d3.event.altKey){
           var match = middguard.state.Pois.selections.findWhere({x:d.x, y:d.y})
           console.log(d);
           console.log(match);
           
           if (match){
             console.log('remove')
             middguard.state.Pois.selections.remove(match);
           }else{
             middguard.state.Pois.selections.add({x:d.x, y:d.y});
           }
           
         }else{
           middguard.state.Pois.selections.reset({x:d.x, y:d.y});
         }
         console.log(middguard.state.Pois.selections);
      });
      
      
      return v;
    }
    
    
    
  });
  
	
	middguard.addModule('IndividualTimelinesView', IndividualTimelinesView);
})();




