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
      var setSize = this.model.size;
      var numGroups = this.model.groups.length;

      this.$el.html(this.template({size:setSize}));
      
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
      .attr('y', function(d,i){return Math.floor(i/100)* 10 })
      .attr('stroke', '#CCCCCC')
      .attr('fill','white');
      
      this.cells.on('click', function(d){
        middguard.state.Groups.selections.reset(d);
        
        var members = [];
        d.get('members').forEach(function(member){
          members.push({id:member});
         
        });
        console.log(members);
        middguard.state.People.workingSet.reset(members);
      });
      
    }
    
    
  });
  
 
	
	middguard.addModule('GroupView', GroupView);
})();




