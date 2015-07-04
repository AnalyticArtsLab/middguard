var middguard = middguard || {};

(function () {
  'use strict';
  
 
  

  var GroupView = middguard.View.extend({
    id: 'group-view-rect',
		template: _.template('<h1>Groups</h1><div><p>Color by: <select id="group-color-select"><option value="checked">Checked</option><option value="fri">Active Friday</option><option value="sat">Active Saturday</option><option value="sun">Active Sunday</option></select></p><div id="all-groups-container"></div><div id="group-details"></div></div>'),
    tagFormTemplate: _.template('<div id="tag-form" title="Add New Tag"><form><fieldset><ul id="tag-list"></ul><label for="group-tag">Tag</label> <input type="text" name="tag" id="group-tag" class="text ui-widget-content ui-corner-all"></fieldset></form></div>'),
    events:{},
    
    initialize: function () {
      var v = this;
      _.bindAll(this, 'addDetails' );
      
      this.$el.html(this.template);
      this.$el.append(this.tagFormTemplate);
      
      // create an event broadcaster
      var switchboard = _.extend({}, Backbone.Events);
      
      
      
      // populate the color selector
      this.populateColorSelector();
      
      this.listenTo(middguard.entities.Tags, 'add remove reset', this.populateColorSelector);
      d3.select(this.el).select('#group-color-select')
      .on('change', function(){
        switchboard.trigger('select:change', this.value);
      });
      
      // create the group sets
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
        var newGroupSet = new GroupSetView({model:{size: groupSize, groups: groups[groupSize]}, switchboard:switchboard});
        $("#all-groups-container",this.$el).append(newGroupSet.el);
        
      };

      this.listenTo(middguard.state.Groups.selections, 'add', this.addDetails);
      this.listenTo(middguard.state.Groups.selections, 'reset', function(collection, options){
        collection.models.forEach(function(model){v.addDetails(model);});
      });
      
      
      // create the tagging dialog box
      $('#tag-form', this.$el).dialog({
    		autoOpen: false,
    		height: 400,
    		width: 400,
    		modal: true,
        position: {my:'center', at:'center', of: '#group-view-rect'},
    		buttons: [
    		  {text:"Add Tag", 
        click:function() {
          var group = $(this).data().group;
          var gid = group.id;
    			var tag = $('#group-tag').val();
 
            
          
          var tagModel = middguard.entities.Tags.findWhere({tag:tag});
          
          if (tagModel){
            // existing tag, just add it
            group.get('tags').push(tagModel.id);
            group.save();
            group.trigger('change:tag', group); 
            
          }else{
            // new tag, need to create it
            middguard.entities.Tags.create({tag:tag},{success:function(model, response, options)
                    {
                      group.get('tags').push(model.id);
                      group.save();
                      group.trigger('change:tag', group); 
                    }} );
          }
            
            

    			    $(this).dialog("close");
    			}},
          {text:'Cancel',
      			click: function() {
      				$(this).dialog("close");
      			}
          }
    		],
        open:function(event, ui){
          
          var tags = middguard.entities.Tags.models.map(function(m){return m.get('tag');});
          
          var items = d3.select('#tag-list').selectAll('li').data(tags);
          items.exit().remove();
          items.enter().append('li');
          
          items.text(function(d){return d});
          
          
          
          $('#tag-list').menu(
            {role:'listbox',
            select:function(event, ui){
              var tag = ui.item.prop('__data__');
              $('#group-tag').val(tag);
            }
          }
          );
          
          $('#group-tag').autocomplete({
            source:function( request, response ) {
              var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( request.term ), "i" );
              response( $.grep( tags, function( item ){
                return matcher.test( item );
              }) );
            }
          });
          
          
        },
        close:function(event,ui){
          $('#tag-list').menu('destroy');
        }
        
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
          
                // remove the person from the current group
                var currentGroup = middguard.entities.Groups.get(gid);
                var members = currentGroup.get('members');
                members.splice(members.indexOf(pid), 1 );
                if (members.length === 0){
                  console.log('destroying');
                  currentGroup.destroy();
                }else{
                  currentGroup.set('group_id', members[0]);
                  currentGroup.set('members', members);
                  // added because the array ref doesn't change, so no change event is triggered
                  currentGroup.trigger('change:removeGroup', currentGroup); 
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
                      console.log('created new group');
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
                if (members.indexOf(pid) === -1){
                  // only add if the person isn't in the group
                  members.push(pid);
                  newGroup.set('members', members);
                  // added because the array ref doesn't change, so no change event is triggered
                  newGroup.trigger('change:addGroup', newGroup);
                  newGroup.save();
                }else{
                  var days = [];
                  currentGroup.get('days').forEach(function(day){
                    if (newGroup.get('days').indexOf(day) === -1){
                      days.push(day);
                    }
                  });
                  
                  if (days.length > 0){
                    Array.prototype.push.apply(newGroup.get('days'), days);
                    newGroup.trigger('change:addGroup', newGroup);
                    newGroup.save();
                  }
                  
                }
                
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
      
      // create a context menu for removing tags
      $.contextMenu({
        selector: '.group-tag-item',
        build: function($trigger, e){
          var menu = {
            callback: function(key, options){
              var tagid = this.prop('__data__');
              var gid = this.closest('.group-detail-view').data('gid');

              if (key === 'remove'){
                var group = middguard.entities.Groups.get(gid);
                var tags = group.get('tags');
                tags.splice(tags.indexOf(tagid), 1 );
                group.save();
                group.trigger('change:tag', group);
              }
              
            },
            items: { "remove": {name:'Remove tag'}}
          };
          
          
          return menu;
        }
      }); 






    },
    
    populateColorSelector: function(){
      var selector = d3.select(this.el).select('#group-color-select');
      
      var tagOptions = selector.selectAll('.tag-option').data(middguard.entities.Tags.models);
      
      tagOptions.exit().remove();
      
      tagOptions.enter()
      .append('option')
      .attr('class','tag-option')
      .attr('value', function(d){return 'tag:' + d.get('tag');})
      .html(function(d){return 'Tag: ' + d.get('tag')});
   
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
    initialize: function(options){
      var v = this;
      
      _.bindAll(this, 'render', 'setup');
      
      var setSize = +this.model.size;
      var numGroups = this.model.groups.length;

      this.$el.html(this.template({size:(setSize==1)? 'Individuals': setSize}));
     
      this.coloringFunc = this.coloringTestChecked;
      this.listenTo(options.switchboard, 'select:change', function(value){
        if (value === 'checked'){
          v.coloringFunc = v.coloringTestChecked;
        }else if (value === 'fri'){
          v.coloringFunc = function(group){
            return v.coloringTestDay(group, 6);
          }
        }else if (value === 'sat'){
          v.coloringFunc = function(group){
            return v.coloringTestDay(group, 7);
          }
        }else if (value === 'sun'){
          v.coloringFunc = function(group){
            return v.coloringTestDay(group, 8);
          }
        }else{
          var tag = value.slice(value.indexOf(':')+1);
          v.coloringFunc = function(group){
            return v.coloringTestTag(group, tag);
          }
          
        }
     
        v.render();
      });
      
     
      this.listenTo(middguard.state.People.workingSet, 'add remove reset', this.render);
      this.listenTo(middguard.state.Groups.selections, 'add remove reset', this.render);
      this.listenTo(middguard.entities.Groups, 'change:addGroup', function(model) {
        
        var members = model.get('members');
        if (members.length === setSize && v.model.groups.indexOf(model) === -1){
          // new member of this set
          v.model.groups.push(model);
          v.setup();
        }else if (members.length - 1 === setSize){
          // old member of this group -- remove it
          v.model.groups.splice(v.model.groups.indexOf(model), 1);

          v.setup();
        }
      });
      
      this.listenTo(middguard.entities.Groups, 'change:removeGroup', function(model) {
        var members = model.get('members');
        if (members.length === setSize && v.model.groups.indexOf(model) === -1){
          // new member of this set
          v.model.groups.push(model);
          v.setup();
        }else if (members.length + 1 === setSize){
          // old member of this group -- remove it
          v.model.groups.splice(v.model.groups.indexOf(model), 1);

          v.setup();
        }
        
      });
      
      this.listenTo(middguard.entities.Groups, 'destroy', function(model){
        if (v.model.groups.indexOf(model) !== -1){
           v.model.groups.splice(v.model.groups.indexOf(model), 1);
          v.setup();
        }
        
      });
      
      
      this.setup();
  
    },
    
    coloringTestChecked: function(group){
      return group.get('checked');
      
    },
    
    coloringTestDay: function(group, day){
      return group.get('days').indexOf(day) !== -1;
    },
    
    coloringTestTag: function(group, tag){
      var tagModel = middguard.entities.Tags.findWhere({tag:tag});
      if (tagModel){
        return group.get('tags').indexOf(tagModel.id) != -1;
      }
      return false;
    },
    
    
    
    setup: function(){
      var v = this;
 
      var setSize = +this.model.size;
      var numGroups = this.model.groups.length;
      
      d3.select(this.el).select('.groups-svg')
      .attr('width', v.widthCount*v.cellSize)
      .attr('height', Math.floor(numGroups/v.widthCount)* v.cellSize  +10);
      
      d3.select(this.el)
      .style('height', Math.floor(numGroups/v.widthCount)* v.cellSize  +60);
      
      
      var canvas = d3.select(this.el).select('.group-grid');
      
      this.cells = canvas.selectAll('rect')
      .data(this.model.groups);
      
      this.cells.enter()
      .append('rect');
      
      this.cells.exit().remove();
      
      
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
            return d.get('id') === g.get('id');
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
          middguard.state.People.selections.reset();
          middguard.state.People.workingSet.reset(members);
          middguard.state.Groups.selections.reset(d);
        }
        
        
      });
      
      
      return this.render();
      
    },
    
    render: function(){
      var v = this;
      
    
      this.cells
      .attr('fill',function(d){
         if (middguard.state.Groups.selections.find(function(g){
           return d.get('id') === g.get('id');
         })){
          return '#00FF00';
        }else{
          for (var i=0; i < middguard.state.People.workingSet.models.length; i++){
            if (_.contains(d.get('members'), middguard.state.People.workingSet.models[i].get('id'))){
              return 'rgb(0,100,255)';
            }
          }

          return (v.coloringFunc(d)) ? '#FFFF88': 'white';
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
    template: _.template('<h2><%= gid %></h2><p>Days: <span class="days-list"></span></p><p >Members: <span class="members-list"></span></p><p >Tags: <span class="tag-list"></span> <input type="button" value="+"  id="add-tag" /><p>Checked: <input class="group-checkbox" type="checkbox" /></p><p>Notes</p><textarea cols = "40" rows="8" class="group-notes"/>'),
    events: {
      "click .group-checkbox": "toggleChecked",
      "click #add-tag":"showDialog"
    },
    initialize: function(){
      var v = this;
      _.bindAll(this, 'update', 'toggleChecked', 'showDialog', 'render');
      var gid = this.model.get('id');
      this.$el.html(this.template({gid:gid}));
      this.$el.data('gid', gid);
      
      this.update();
      
      this.checkbox = $(".group-checkbox", this.$el);
      this.checkbox.prop('checked', this.model.get('checked'));

      this.listenTo(this.model, 'change change:addGroup change:removeGroup change:tag sync', this.update);

      this.listenTo(middguard.state.People.selections, 'add reset', this.render);
      this.listenTo(middguard.state.Tags.selections, 'add reset', this.render);

    },
    
    showDialog:function(){
      $('#tag-form').data("group", this.model).dialog('open');
    },
    
    toggleChecked: function(){
      this.model.save({checked:this.checkbox.prop('checked')},
        {error:function(m,r,c){console.log(r);}});

    },
    
    update: function(){
      var v = this;
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
      
      members.html(function(d,i){return (i < v.model.get('members').length - 1)? d+', ': d ;})
      .on('click', function(d){
        var person = middguard.entities.People.get(d);
        if (middguard.state.People.selections.get(d)){
          // this is the selection, remove it
          middguard.state.People.selections.reset();
        }else{
          middguard.state.People.selections.reset(person);
        }
        
      });
      
      
      
      var tags = d3.select(this.el)
      .select('.tag-list')
      .selectAll('span')
      .data(this.model.get('tags'));
      
      tags.exit().remove();
      
      tags.enter()
      .append('span')
      .attr('class', 'group-tag-item');
      
      tags.html(function(d,i){
        var tag = middguard.entities.Tags.get(d).get('tag');
        return (i < v.model.get('tags').length - 1)? tag+', ': tag ;})
      .on('click', function(d){
          var tag = middguard.entities.Tags.get(d);
          if (middguard.state.Tags.selections.get(d)){
            // this is the selection, remove it
            middguard.state.Tags.selections.reset();
          }else{
            middguard.state.Tags.selections.reset(tag);
          }
        });
      
      
      d3.select(this.el)
      .select('.group-notes')
        .datum(this.model.get('notes'))
        .text(function(d){ return d;})
        .on('blur', function(d){
          v.model.set('notes', $(this).val());
          v.model.save();
        });
   
      
      return this.render();
    },
    
    render: function(){
      var v = this;
      
      d3.select(this.el).selectAll('.group-member')
      .style('background',function(d){return (middguard.state.People.selections.get(d)) ? '#00FF00' : 'white';});
      
      d3.select(this.el).selectAll('.group-tag-item')
      .style('background',function(d){return (middguard.state.Tags.selections.get(d)) ? '#00FF00' : 'white';});
       
      
      return this;
    }
    
    
  });
  
  
  
 
	
	middguard.addModule('GroupView', GroupView);
})();




