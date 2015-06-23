var middguard = middguard || {};

(function () {
  'use strict';

  var RelationGridView = middguard.View.extend({
    id: 'middguard-relation-grid',
		template: _.template('<svg id="relation-grid-svg"><g id="relation-grid"></g></svg> '),
    
    events:{
      
    },
    
    initialize: function () {
      
      _.bindAll(this, 'render', 'update');
      var v = this;
      
      v.$el.html(v.template);
      
      
      
      
      // add a metric to the Person records
      middguard.entities.People.models.forEach(function(m){
        m.set({id:m.get('person_id'),metric:0})
      });
      
      middguard.entities.People.comparator = function(m){return -m.get('metric');};
      
      // make sure the pairs are ordered by delta to make finding the max easy
      middguard.entities.Pairs.comparator = function(m){return m.get('delta');};
      
      
      
      // set up the color scale
      v.colors = d3.scale.linear()
      .domain([0,0,0])
      .range(['white', 'grey', 'blue']);
      
      
      // the data for People should be pre-fetched on load
      // so we make some rects and grab the selector
      var canvas = d3.select(this.el).select('#relation-grid');
      
      this.cells = canvas.selectAll('rect')
      .data(middguard.entities.People.models)
      .enter()
      .append('rect');
      
      // do initial layout and color them all white
      this.cells.attr('width',10)
      .attr('height', 10)
      .attr('x', function(d,i){return (i%100) * 10;})
      .attr('y', function(d,i){return Math.floor(i/100)* 10 })
      .attr('stroke', '#CCCCCC')
      .attr('fill','white');
      
      this.cells.on('click', function(){
        var pid = d3.select(this).data()[0].get('person_id');
        middguard.state.People.selections.reset({id:pid});
        middguard.state.People.workingSet.reset({id:pid});
        
      });
      
      
      this.listenTo(middguard.state.People.selections, 'add remove reset', this.update)
    },

    update: function(){
      var v = this;
      var pid = middguard.state.People.selections.models[0].get('id');
      var query = 'id1='+pid+' or id2='+pid;
      middguard.entities.Pairs.fetch({data:{whereRaw:query},
        error:function(c,r,o){console.log(r)}, 
        success:function(c,r,o){
          var max = c.models[c.length - 1].get('delta');
          v.colors.domain([0,max*.15, max]);
          
          middguard.entities.People.models.forEach(function(m){m.set({metric:0});});
          c.models.forEach(function(m){
            var id2 = m.get('id1') === pid ? m.get('id2') : m.get('id1');
            var p = middguard.entities.People.get(id2);
            p.set({metric:m.get('delta')}); 
          });
          middguard.entities.People.get(pid).set({metric:max});
          
          //middguard.entities.People.sort();
          
          v.render();
        }});
      
      
      
    },

		
    render: function () {
      var v = this;
      
      v.cells.data(middguard.entities.People.models)
      .attr('fill', function(d){return v.colors(d.get('metric'));});
      
      
     
      return v;
    },
    
    
    cellValue: function (model){
      var pid = model.get('person_id');
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