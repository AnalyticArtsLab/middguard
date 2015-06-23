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
    template: _.template('<div class="individual-timeline"></div>'),
    
    events:{},
    
    initialize: function () {
      var v = this;
      _.bindAll(this, 'render', 'setupView' );
      
      this.$el.html(this.template);
      
      this.listenTo(middguard.state.timeRange, 'change',this.render);
      
      
  		this.timeScale= d3.time.scale();
  		this.axis = d3.svg.axis();
  		this.timeScale.domain([middguard.state.timeRange.start, middguard.state.timeRange.end]);
      this.listenTo(middguard.state.timeRange, 'change',this.render);
  		this.setupView();
    },
    
    changeInterval:function(){
  		// Called when the time interval has been changed
  		if (this.axisObj){
  			this.timeScale.domain([middguard.state.timeRange.start, middguard.state.timeRange.end]);
  			this.axisObj.call(this.axis);
  			this.render();
  		}
      
      
    },
    
    setupView: function(){
      var v = this;
      var pid = this.model.get('id');
      
      v.canvas = d3.select(v.el)
      .append('svg')
      .attr('class','individual-timeline-svg')
      .attr('id', 'timeline_' + pid);
      
      v.timeScale.range([0, 1200]); // make this better later
      
      v.axis.scale(v.timeScale)
      .orient('left');
      
      v.axisObject = v.canvas.append('g')
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




