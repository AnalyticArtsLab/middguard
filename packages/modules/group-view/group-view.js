var middguard = middguard || {};

(function () {
  'use strict';

  var GroupView = middguard.View.extend({
    id: 'group-view-rect',
		template: _.template('<h1>Groups</h1><div><div id="all-groups-container"></div><div id="group-details"></div></div>'),
    
    events:{},
    
    initialize: function () {
      var v = this;
      _.bindAll(this, 'addDetails' );
      
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
        $("#all-groups-container",this.$el).append(newGroupSet.el);
      };

      this.listenTo(middguard.state.Groups.selections, 'add', this.addDetails);
      this.listenTo(middguard.state.Groups.selections, 'reset', function(collection, options){
        collection.models.forEach(function(model){v.addDetails(model);});
      });

    },
    
    addDetails: function(model){
      var groupDetails = new GroupDetailView({model:model});
      groupDetails.listenTo(middguard.state.Groups.selections, 'reset', groupDetails.remove);
      groupDetails.listenTo(middguard.state.Groups.selections, 'remove', function(model){
        if (model === v.model){
          groupDetails.remove();
        }
      });

      $("#group-details",this.$el).append(groupDetails.el);
    }
    

	});
  
  
  var GroupSetView = middguard.View.extend({
    className: 'group-set-view',
    template: _.template('<h2><%= size %></h2><svg class="groups-svg"><g class="group-grid"></g></svg>'),
    widthCount: 50,
    cellSize: 10,
    initialize: function(){
      var v = this;
      _.bindAll(this, 'render');
      
      var setSize = this.model.size;
      var numGroups = this.model.groups.length;

      this.$el.html(this.template({size:(setSize==1)? 'Individuals': setSize}));
      
      d3.select(this.el).select('.groups-svg')
      .attr('width', v.widthCount*v.cellSize)
      .attr('height', Math.floor(numGroups/v.widthCount)* v.cellSize  +10);
      
      d3.select(this.el)
      .style('height', Math.floor(numGroups/v.widthCount)* v.cellSize  +60);
      
      
      var canvas = d3.select(this.el).select('.group-grid');
      this.cells = canvas.selectAll('rect')
      .data(this.model.groups)
      .enter()
      .append('rect');
      
      
      this.cells.attr('width',v.cellSize)
      .attr('height', v.cellSize)
      .attr('x', function(d,i){return (i%v.widthCount) * v.cellSize;})
      .attr('y', function(d,i){return Math.floor(i/v.widthCount)* v.cellSize });
      
      this.cells.on('click', function(d){
        var members = [];
        d.get('members').forEach(function(member){
          members.push({id:member});
         
        });
        
        if (d3.event.shiftKey){
          // reset the selections
          middguard.state.People.workingSet.reset(members);
          middguard.state.Groups.selections.reset(d);
        }else{
          // just add to the selections
          middguard.state.People.workingSet.add(members);
          middguard.state.Groups.selections.add(d);
        }
        
        
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
  
  
  var GroupDetailView = middguard.View.extend({
    className: 'group-detail-view',
    template: _.template('<h2><%= gid %></h2><p>Days: <span class="days-list"></span></p><p >Members: <span class="members-list"></span></p>'),
    
    initialize: function(){
      var v = this;
      _.bindAll(this, 'render');
      var gid = this.model.get('group_id');
      this.$el.html(this.template({gid:gid}));
      
      var days = d3.select(this.el)
      .select('.days-list')
      .selectAll('span')
      .data(this.model.get('days'))
      .enter()
      .append('span')
      .html(function(d, i){return (i < v.model.get('days').length - 1)? d+', ': d ;});
      
      
      var members = d3.select(this.el)
      .select('.members-list')
      .selectAll('span')
      .data(this.model.get('members'))
      .enter()
      .append('span')
      .html(function(d,i){return (i < v.model.get('members').length - 1)? d+', ': d ;});
      
      
      
      
    }
  });
 
	
	middguard.addModule('GroupView', GroupView);
})();




