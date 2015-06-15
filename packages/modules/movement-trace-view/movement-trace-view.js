var middguard = middguard || {};

(function () {
  'use strict';

  var MovementTraceView = middguard.View.extend({
    id: 'middguard-movement-trace',
		template: _.template('<img src="/modules/movement-trace-view/images/movement-trace-map.jpg" id="movement-trace-map" />'),
    initialize: function () {
      
      
			
    },
		
    render: function () {
      this.$el.html(this.template);
      return this;
    }
  });
	
	
	middguard.addModule('MovementTraceView', MovementTraceView);
})();
