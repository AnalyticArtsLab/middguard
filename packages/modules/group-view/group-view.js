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


      // Create the context menu we will use for the details

      $.contextMenu({
        selector: '.group-member',
        build: function($trigger, e){
          var menu = {
            callback: function(key, options){
              var pid = this.html();
              var comma = pid.lastIndexOf(',');
              pid = (comma === -1 )? +pid: +pid.slice(0, comma);
              var gid = this.closest('.group-detail-view').data('gid');
              var destID = +key.slice(5);
              
              
              // remove the person from this group
              if (key === 'remove' || (key.slice(0, 4) === 'move' && destID !== gid)){
                
                console.log('remove', pid, gid);
                // remove the person from the current group
                var currentGroup = middguard.entities.Groups.get(gid);
                var members = currentGroup.get('members');
                members.splice(members.indexOf(pid), 1 );
                if (members.length === 0){
                  currentGroup.destroy();
                }else{
                  currentGroup.set('group_id', members[0]);
                  currentGroup.set('members', members);
                  currentGroup.save();
                }
              }
              
              
              if (key === 'remove'){
                // create a new group with one person
                var newGroup = middguard.entities.Groups.create(
                  {
                    group_id: pid,
                    days: currentGroup.get('days'),
                    members: [pid],
                    checked: true // change this
                  }, {success:function(model, response, options)
                    {
                      console.log('created', model);
                      middguard.state.Groups.selections.add(model);
                    },
                    error: function(model,response, options){
                      console.log(response);
                    }});
                // add the new group to the current selection
                // (something also need to update the display -- worry about that shortly)
                
              }else if (key.slice(0, 4) === 'move' && destID !== gid){
                // add person to new group
                var newGroup = middguard.entities.Groups.get(destID);
                var members = newGroup.get('members');
                members.push(pid);
                newGroup.set('members', members);
          
                newGroup.save();
              }
              
            },
            items: { "remove": {name:'Remove from group'}}
          };
          
          if (middguard.state.Groups.selections.length > 1){
            var destinations = {};
            
            middguard.state.Groups.selections.forEach(function(model){
              destinations['move:'+model.id] = {name: 'Group ' + model.id};
            });
            
            menu.items["move"] = {name:'Move to group', items: destinations};
            
          }
          
          
          return menu;
        }
      });


    },
    
    addDetails: function(model){
      var v = this;
      var groupDetails = new GroupDetailView({model:model});
      groupDetails.listenTo(middguard.state.Groups.selections, 'reset', groupDetails.remove);
      groupDetails.listenTo(middguard.state.Groups.selections, 'remove', function(removedModel){
        if (model === removedModel){
          groupDetails.remove();
        }
      });
      groupDetails.listenTo(model, 'destroy', groupDetails.remove);
      
      
      
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
      _.bindAll(this, 'update', 'toggleChecked');
      var gid = this.model.get('id');
      this.$el.html(this.template({gid:gid}));
      this.$el.data('gid', gid);
      
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
      .attr('class', 'group-member')
      .html(function(d,i){return (i < v.model.get('members').length - 1)? d+', ': d ;});
      
      this.checkbox = $(".group-checkbox", this.$el);
      this.checkbox.prop('checked', this.model.get('checked'));

      this.listenTo(this.model, 'change sync', this.update);
      
      
    },
    
    toggleChecked: function(){
      this.model.save({checked:this.checkbox.prop('checked')},
        {error:function(m,r,c){console.log(r);}});

    },
    
    update: function(){
      var v = this;
      console.log('update');
      var days = d3.select(this.el)
      .select('.days-list')
      .selectAll('span')
      .data(this.model.get('days'));
      
      days.exit().remove();
      
      days.enter().append('span');
      days.html(function(d, i){return (i < v.model.get('days').length - 1)? d+', ': d ;});
      
      
      var members = d3.select(this.el)
      .select('.members-list')
      .selectAll('span')
      .data(this.model.get('members'));
      
      members.exit().remove();
      
      members.enter()
      .append('span')
      .attr('class', 'group-member');
      
      members.html(function(d,i){return (i < v.model.get('members').length - 1)? d+', ': d ;});
      
      return this;
    }
    
    
  });
 
	
	middguard.addModule('GroupView', GroupView);
})();




