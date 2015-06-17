var middguard = middguard || {};

(function () {
  'use strict';

  var RelationGridView = middguard.View.extend({
    id: 'middguard-relation-grid',
		template: _.template('<svg id="relation-grid-svg"></svg> '),
    
    events:{
      
    },
    
    initialize: function () {
      
      _.bindAll(this, 'render');
      
      this.$el.html(this.template);
      
      
      this.listenTo(middguard.entities.Persons, 'sync', this.render);
      this.listenTo(middguard.entities.Persons, 'reset', this.render);
      

			
    },

		
    render: function () {
      var v = this;
      
      var canvas = d3.select('#relation-grid-svg');
      
     
      return v;
    }
	});
	
	middguard.addModule('RelationGridView', RelationGridView);
})();
