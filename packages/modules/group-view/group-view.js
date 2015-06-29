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
      var v = this;
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
      .attr('y', function(d,i){return Math.floor(i/v.widthCount)* v.cellSize })
      .attr('stroke', '#CCCCCC');
      
      this.cells.on('click', function(d){
        var members = [];
        d.get('members').forEach(function(member){
          members.push({id:member});
         
        });
        
        if (d3.event.altKey){
          if (middguard.state.Groups.selections.find(function(g){
            return d.get('group_id') === g.get('group_id') && v.listEquals(d.get('days'),g.get('days'));
          })){
            // group is already a selection, remove it
             middguard.state.Groups.selections.remove(d);
             
             // remove members from people working set by reseting and adding all from other groups back in
             middguard.state.People.workingSet.reset();
             middguard.state.Groups.selections.models.forEach(function(group){
               var members = [];
               group.get('members').forEach(function(member){
                 members.push({id:member});
         
               });
               
               
               middguard.state.People.workingSet.add(members);
             });
          }else{
            // just add to the selections
            middguard.state.People.workingSet.add(members);
            middguard.state.Groups.selections.add(d);
          }
        }else{
          // reset the selections
          middguard.state.People.workingSet.reset(members);
          middguard.state.Groups.selections.reset(d);
        }
        
        
      });
     
     this.listenTo(middguard.state.People.workingSet, 'add remove reset', this.render)
      this.listenTo(middguard.state.Groups.selections, 'add remove reset', this.render)
      this.render();
    },
    
    render: function(){
      var v = this;
      
      this.cells
      .attr('fill',function(d){
         if (middguard.state.Groups.selections.find(function(g){
           return d.get('group_id') === g.get('group_id') && v.listEquals(d.get('days'),g.get('days'));
         })){
          return '#00FF00';
        }else{
          for (var i=0; i < middguard.state.People.workingSet.models.length; i++){
            if (_.contains(d.get('members'), middguard.state.People.workingSet.models[i].get('id'))){
              return '#AAAACC';
            }
          }
          return (d.get('checked')) ? 'white': '#FFDDDD';
        }
        
      });
      
      
      return v;
    },
    
    listEquals: function(l1, l2){
      if (l1.length !== l2.length){
        return false;
      }
      
      for (var i = 0; i < l1.length; i++){
        if (l1[i] !== l2[i]){
          return false;
        }
      }
      return true;
      
    }
    
    
  });
  
  
  var GroupDetailView = middguard.View.extend({
    className: 'group-detail-view',
    template: _.template('<h2><%= gid %></h2><p>Days: <span class="days-list"></span></p><p >Members: <span class="members-list"></span></p><p>Checked: <input class="group-checkbox" type="checkbox" /></p>'),
    events: {
      "click .group-checkbox": "toggleChecked"
    },
    initialize: function(){
      var v = this;
      _.bindAll(this, 'render', 'toggleChecked');
      var gid = this.model.get('id');
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
      
      this.checkbox = $(".group-checkbox", this.$el);
      this.checkbox.prop('checked', this.model.get('checked'));

      
    },
    
    toggleChecked: function(){
      console.log(this.model.attributes);
      this.listenTo(this.model, 'request', function(d){console.log('request')});
      this.listenTo(this.model, 'update', function(d){console.log('update')});
      this.listenTo(this.model, 'sync', function(d){console.log('sync')});
      this.listenTo(this.model, 'change', function(d){console.log('change')});
      
      var prom = this.model.save({checked:this.checkbox.prop('checked')},
      {success:function(m,r,c){console.log('success')}, error:function(m,r,c){console.log(r);}});
      
      prom.then(function(result){console.log('it did something', result);}, function(error){console.log("didn't work", error)});
      
      
      if (this.model.validationError){
        console.log('error');
      }
    }
    
  });
 
	
	middguard.addModule('GroupView', GroupView);
})();




