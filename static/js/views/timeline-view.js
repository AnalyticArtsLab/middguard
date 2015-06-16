var middguard = middguard || {};

(function () {
  'use strict';

  middguard.TimelineView = Backbone.View.extend({
    id: 'middguard-timeline',
    template: _.template(
      '<div id="timeControl">'+
				'<h3>Time Control</h3>'+
			'</div>'
    ),
		dateRangeFull: [new Date("2014-01-06"), new Date("2014-01-20")], // maximum range
		dateRange : [new Date("2014-01-06"), new Date("2014-01-20")], // currently displayed range
    initialize: function () {
			this.timeController = makeTimeSlider()
				.width(2140)
				.height(45)
				.domain(this.dateRange);

			this.listenTo(this.timeController, "intervalChange", this.updateDateRange);
      
    },
		updateDateRange: function(range){
			this.dateRange = range;
			this.trigger("intervalChange", this.dateRange);
		},
    render: function () {
      this.$el.html(this.template());
      return this;
    }
  });
	
	function makeTimeSlider(){
		var width = 800;
		var height = 45;
		var hMargin = 25;
		var vMargin = 10;
		var timeScale= d3.time.scale.utc();
		var mainBrush = d3.svg.brush().x(timeScale);
		var axis = d3.svg.axis();
		var axisObj;
		var eventHandlers = [];
		var brushG = null;

		function control(selection){
			selection.each(function(data){
				var canvas = d3.select(this)
					.append("svg")
					.attr("width",width)
					.attr("height",height);


				timeScale.range([0,width-hMargin*2]);

				axis.scale(timeScale)
					.orient("bottom")
					.innerTickSize(20)
					.outerTickSize(0);

				var slider = canvas.append("g")
					.attr("transform","translate(" + hMargin +"," + vMargin + ")");

				axisObj = slider.append("g")
					.attr("class","slider axis")
					.call(axis);

				brushG = slider.append("g")
					.attr("class", "slider brush")
					.call(mainBrush);

					brushG.selectAll("rect")
					.attr("y", -8)
					.attr("height", 16);

				// notify all listeners of changes to the slider
				mainBrush.on("brush", intervalChanged)
			})
		}


		function intervalChanged(){
			var dateRange = timeScale.domain();
			if (! mainBrush.empty()){
				dateRange = mainBrush.extent()
			}

			control.trigger("intervalChange", dateRange);
		}


		control.setInterval = function(range){
			console.log(mainBrush.extent())
			mainBrush.extent(range);

			console.log(brushG)
			brushG.call(mainBrush);
			console.log(mainBrush.extent())
			intervalChanged();

		}

		control.domain = function(_){
			if (!arguments.length) return timeScale.domain();
			timeScale.domain(_);
			if (axisObj){
				axisObj.call(axis);
			}
			intervalChanged();
			return control;
		}

		control.width = function(_){
			if (!arguments.length) return width;
			width = _;
			return control;
		};

		control.height = function(_){
			if (!arguments.length) return height;
			height = _;
			return control;
		};


		_.extend(control, Backbone.Events);
		return control;
	}
})