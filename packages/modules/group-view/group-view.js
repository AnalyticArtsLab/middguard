var middguard = middguard || {};

(function () {
  'use strict';

  var GroupView = middguard.View.extend({
    id: 'group-view-rect',
		template: _.template('<h1>Groups</h1>'),
    
    events:{},
    
    initialize: function () {
      var v = this;
      _.bindAll(this, 'render' );
      
      this.$el.html(this.template);
      
      
      var groups = {};
      
      middguard.entities.Groups.models.forEach(function(group){
        var size = group.get('members').length;

        if (groups.hasOwnProperty(size)){

          groups[size].push(group);
        }else{
          groups[size] = [group];
        }
      });
      
      for (var groupSize in groups){
        var newGroupSet = new GroupSetView({model:{size: groupSize, groups: groups[groupSize]}});
        $(this.$el).append(newGroupSet.el);
      };

    },
    

	});
  
  
  var GroupSetView = middguard.View.extend({
    className: 'group-set-view',
    template: _.template('<h2><%= size %></h2><svg class="groups-svg"><g class="group-grid"></g></svg><div id="group-data></div>"'),
    
    initialize: function(){
      var v = this;
      _.bindAll(this, 'render');
      
      var setSize = this.model.size;
      var numGroups = this.model.groups.length;

      this.$el.html(this.template({size:(setSize==1)? 'Individuals': setSize}));
      
      d3.select(this.el).select('.groups-svg')
      .attr('width', 1000)
      .attr('height', Math.floor(numGroups/100)* 10  +10);
      
      d3.select(this.el)
      .style('height', Math.floor(numGroups/100)* 10  +60);
      
      
      var canvas = d3.select(this.el).select('.group-grid');
      this.cells = canvas.selectAll('rect')
      .data(this.model.groups)
      .enter()
      .append('rect');
      
      
      this.cells.attr('width',10)
      .attr('height', 10)
      .attr('x', function(d,i){return (i%100) * 10;})
      .attr('y', function(d,i){return Math.floor(i/100)* 10 });
      
      this.cells.on('click', function(d){
        middguard.state.Groups.selections.reset(d);
        
        var members = [];
        d.get('members').forEach(function(member){
          members.push({id:member});
         
        });
        middguard.state.People.workingSet.reset(members);
      });
     
     this.listenTo(middguard.state.People.workingSet, 'add remove reset', this.render)
    this.listenTo(middguard.state.Groups.selections, 'add remove reset', this.render)
      this.render();
    },
    
    render: function(){
      var v = this;
      
      this.cells
      .attr('stroke', function(d){
        if (middguard.state.Groups.selections.findWhere({group_id:d.get('group_id'), day:d.get('day')})){
          return 'green';
        }else{
          return '#CCCCCC';
        }
      })
      .attr('fill',function(d){
        for (var i=0; i < middguard.state.People.workingSet.models.length; i++){
          if (_.contains(d.get('members'), middguard.state.People.workingSet.models[i].get('id'))){
            return '#5555FF';
          }
        }
        return 'white';
   
        
      });
      
      
      return v;
    }
    
    
  });
  
 
	
	middguard.addModule('GroupView', GroupView);
})();




