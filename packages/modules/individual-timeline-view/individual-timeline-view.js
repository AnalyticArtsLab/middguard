var middguard = middguard || {};

(function () {
  'use strict';

  var IndividualTimelinesView = middguard.View.extend({
    id: 'individual-timeline-rect',
		template: _.template(''),
    
    events:{},
    
    initialize: function () {
      var v = this;
     // _.bindAll(this, 'render' );
      
      //this.$el.html(this.template);
      
      
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

      $("#individual-timeline-rect").append(newTimeline.el);
    }
	});
  
  
  var IndividualTimelineView = middguard.View.extend({
    template: _.template('<h1><%- pid %></h1><div class="individual-timeline"></div>'),
    
    events:{},
    width: 200,
    height: 1100,
    margins:20,
    initialize: function () {
      var v = this;
      _.bindAll(this, 'render', 'setupView', 'changeInterval' );
      var pid = this.model.get('id');
      console.log(pid);
      this.$el.html(this.template({pid:this.model.get('id')}));
      
  		this.timeScale= d3.time.scale();
  		this.axis = d3.svg.axis();
     
      var data = middguard.entities.Movementtraces.where({person_id: this.model.get('id')});
      console.log(data);
     
     
      
  		this.timeScale.domain([middguard.state.timeRange.start, middguard.state.timeRange.end]);
      this.listenTo(middguard.state.timeRange, 'change',this.changeInterval);
  		this.setupView();
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
      
      var svg = d3.select(v.el).select('.individual-timeline')
      .append('svg')
      .attr('class','individual-timeline-svg')
      .attr('id', 'timeline_' + pid)
      .attr('width', v.width)
      .attr('height', v.height);
     
      v.canvas = svg.append('g')
      .attr('transform', 'translate('+v.margins+', '+v.margins+')')
      .attr('width', v.width - 2*v.margins)
      .attr('height', v.height - 2 * v.margins);
      
      
      v.timeScale.range([0, v.height - 2*v.margins]); // make this better later
      
      v.axis.scale(v.timeScale)
      .orient('left')
      .innerTickSize(20)
      .outerTickSize(10);
      console.log(v.axis.scale().domain());
      
      v.axisObject = v.canvas
      .append('g')
      .attr('transform', 'translate(40,0)')
      .attr('class','axis')
      .call(v.axis);
      
      return v;
      
    },
    
    render: function () {
      var v = this;
      
      return v;
    }
    
    
    
  });
  
	
	middguard.addModule('IndividualTimelinesView', IndividualTimelinesView);
})();




