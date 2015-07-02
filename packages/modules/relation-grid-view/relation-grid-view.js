var middguard = middguard || {};

(function () {
  'use strict';

  var RelationGridView = middguard.View.extend({
    id: 'middguard-relation-grid',
		template: _.template('<h1>Individuals</h1><p>Filter by: <select id="individual-filter-select"></select></p><svg id="relation-grid-svg"><g id="relation-grid"></g></svg> '),
    
    events:{
      
    },
    
    initialize: function () {
      
      _.bindAll(this, 'render', 'changeSelection', 'shouldShow', 'setColor');
      var v = this;
      
      v.$el.html(v.template);
      
      var selector = $('#individual-filter-select', this.$el);
      var options = [
        {text:"None", value:"none"},
        {text:"Time", value:"time"},
        {text:"Location", value:"location"}
      ];
      
      options.forEach(function(option){
        selector.append($('<option>').attr('value', option.value).text(option.text));
      });
      v.filter = 'none';
      selector.on('change', function(){
        v.filter = selector.val();
        v.render();
      });
      
      
      // add a metric to the Person records
      middguard.entities.People.models.forEach(function(m){
        m.set({metric:0})
      });
      
      middguard.entities.People.comparator = function(m){return -m.get('metric');};
      
      // make sure the pairs are ordered by delta to make finding the max easy
      middguard.entities.Pairs.comparator = function(m){return m.get('delta');};
      
      
      
      // set up the color scale
      v.colors = d3.scale.linear()
      .domain([0,0])
      .range([255,0]);
      
      
      
      
      this.listenTo(middguard.state.People.selections, 'add remove reset', this.changeSelection);
      this.listenTo(middguard.state.People.workingSet, 'add remove reset', this.render);
      this.listenTo(middguard.state.Pois.selections, 'add remove reset', this.render);
      this.listenTo(middguard.state.timeRange, 'change', this.render);
    },

    changeSelection: function(){
      var v = this;
      var pid = middguard.state.People.selections.models[0].get('id');
      var query = 'id1='+pid+' or id2='+pid;
      middguard.entities.Pairs.fetch({data:{whereRaw:query},
        error:function(c,r,o){console.log(r)}, 
        success:function(c,r,o){
          var max = c.models[c.length - 1].get('delta');
          v.colors.domain([0,max]);
          
          middguard.entities.People.models.forEach(function(m){m.set({metric:0});});
          c.models.forEach(function(m){
            var id2 = m.get('id1') === pid ? m.get('id2') : m.get('id1');
            var p = middguard.entities.People.get(id2);
            p.set({metric:m.get('delta')}); 
          });
          middguard.entities.People.get(pid).set({metric:max});
          
          middguard.entities.People.sort();
          
          v.render();
        }});
      
      
      
    },

    rgb:function(r,g,b){
      return 'rgb('+Math.floor(r)+','+Math.floor(g)+','+Math.floor(b)+')';
    },
    
    setColor:function(person){
      var v = this;
      var c = v.colors(person.get('metric')); 
      if (middguard.state.People.workingSet.get(person.id)){
        return v.rgb(0, 100, 255);
      }
      
      return v.rgb(c,c,c)
      
    },
		
    render: function () {
      var v = this;
      
      
      // the data for People should be pre-fetched on load
      // so we make some rects and grab the selector
      var canvas = d3.select(this.el).select('#relation-grid');
      
      var cells = canvas.selectAll('rect')
      .data(middguard.entities.People.models.filter(v.shouldShow));
      
      cells.exit().remove();
      
      cells.enter().append('rect');
      
      // do initial layout and color them all white
      cells.attr('width',10)
      .attr('height', 10)
      .attr('x', function(d,i){return (i%100) * 10;})
      .attr('y', function(d,i){return Math.floor(i/100)* 10 })
      .attr('stroke', '#CCCCCC')
      .attr('fill', v.setColor);
      
      cells.on('click', function(){
        var pid = d3.select(this).data()[0].get('id');
        middguard.state.People.selections.reset(middguard.entities.People.get(pid));
        middguard.state.People.workingSet.add(middguard.entities.People.get(pid));
        
      });
      
      
      
     
      return v;
    },
    
    shouldShow:function(person){
      var v = this;

      if (v.filter === 'time' && middguard.state.timeRange){
        //debugger;
        var start = middguard.state.timeRange.start;
        var end = middguard.state.timeRange.end;
        var enter = new Date(person.get('fri_enter'));
        var exit = new Date(person.get('fri_exit'));
        
        if (enter && ((enter <= start && exit >= start) || (enter > start && enter < end))){
            return true;
        }
        
        enter = new Date(person.get('sat_enter'));
        exit = new Date(person.get('sat_exit'));
        
        if (enter && ((enter <= start && exit >= start) || (enter > start && enter < end))){
            return true;
        }
        enter = new Date(person.get('sun_enter'));
        exit = new Date(person.get('sun_exit'));
        
        if (enter && ((enter <= start && exit >= start) || (enter > start && enter < end))){
            return true;
        }
        
        return false;
        
      }else if (v.filter === 'location'&& middguard.state.Pois.selections.length > 0){
        var locationid = middguard.state.Pois.selections.models[0].id;
        if (! locationid){
          locationid = middguard.entities.Pois.findWhere({x:middguard.state.Pois.selections.models[0].get('x'), y:middguard.state.Pois.selections.models[0].get('y')}).id;
        }
        var locations = person.get('locations');
       
        return ! locationid ||( locations && locations.indexOf(locationid) !== -1);
      }
      return true;
    },
    
    cellValue: function (model){
      var pid = model.get('id');
      var pair = middguard.entities.Pairs.findWhere({id1:pid});
      
      if (! pair){
         pair = middguard.entities.Pairs.findWhere({id2:pid});
      }
      
      if (! pair){
        return 0;
      }else{
        return pair.get('delta');
      }
      
      
      
    }
    
	});
	
	middguard.addModule('RelationGridView', RelationGridView);
})();
