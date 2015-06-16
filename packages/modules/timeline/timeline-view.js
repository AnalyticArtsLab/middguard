var middguard = middguard || {};

(function () {
  'use strict';

  var TimelineView = middguard.View.extend({
    id: 'middguard-timeline',
		dateRangeFull: [new Date("2014-06-06 08:00:19"), new Date("2014-06-08 23:20:16")], // maximum range
		dateRange : [new Date("2014-06-06 08:00:19"), new Date("2014-06-08 23:20:16")], // currently displayed range
    initialize: function () {
			
      // Properties for our chart
      this.margin = {top: 20, right: 20, bottom: 30, left: 40};
      this.height = 75;
      this.width = 2000 - this.margin.left - this.margin.right;
			
      // Setup elements for the view
      this.d3el = d3.select(this.el);
      this.svg = this.d3el.append('svg')
          .attr('height', 75)
          .attr('width', this.width)
					.attr('id', 'timelineSVG')
          .attr('focusable', 'true')
			.append("g")
					.attr('transform','translate(' + this.margin.left +',' + this.margin.top + ')')
					.attr("width", this.width);
      this.slider = this.svg.append('g')
					.attr('transform','translate(' + this.margin.left +',' + this.margin.top + ')');
			this.axisEl = d3.svg.axis();
      
			this.timeScale = d3.time.scale.utc().domain(this.dateRangeFull);
			this.timeScale.range([0,this.width-this.margin.left*3]);
			this.axisEl.scale(this.timeScale)
				.orient('bottom')
				.innerTickSize(20)
				.outerTickSize(0);
			this.axisObj = this.slider.append('g')
				.attr('class','slider axis')
				.call(this.axisEl);
				
			this.mainBrush = d3.svg.brush().x(this.timeScale);
			
			this.brushG = this.slider.append('g')
				.attr('class', 'slider brush')
				.call(this.mainBrush);

			this.brushG.selectAll('rect')
				.attr('y', -8)
				.attr('height', 16);
				
			_.extend(this, Backbone.Events);
      
      document.onkeydown = this.onKD;
			
			
			// notify all listeners of changes to the slider
			//_.bind function needed to get the brush working (it makes "this" refer to the same thing
			// in both the current scope and in the intervalChanged function)
			//for alternate explanation, see Shirley Wu's "Marrying Backbone.js and D3.js" post
			// at http://shirley.quora.com/Marrying-Backbone-js-and-D3-js, where the _.bind code came from
			this.mainBrush.on("brushend", _.bind(this.intervalChanged, this));
			
			this.listenTo(middguard.state.timeRange, "change", this.updateDateRange);
			
      
    },
		updateDateRange: function(){
			this.dateRange = [middguard.state.timeRange.start, middguard.state.timeRange.end];
			this.mainBrush.extent(this.dateRange);
			if ( (this.timeScale(this.dateRange[0]) >= 0 && this.timeScale(this.dateRange[0]) <= this.width) && (this.timeScale(this.dateRange[1]) >= 0 && this.timeScale(this.dateRange[1]) <= this.width) ){
				//make sure both items in this.dateRange are valid
				this.brushG.call(this.mainBrush);
				this.makeTimelineTriangle(this.dateRange);
				this.makeMarker(this.dateRange);
			}
		},
		
		intervalChanged: function (){
			this.dateRange = this.mainBrush.extent()
			middguard.state.set({'timeRange' : {'start' : this.dateRange[0],
			'end' : this.dateRange[1]}
														});
			
		},
		line: d3.svg.line()
				.x(function(d){ return d[0]})
				.y(function(d){ return d[1]})
				.interpolate('linear-closed'),
		
		makeTimelineTriangle: function(extent){
				//make a triangle to go in the middle of the brush
			//get triangle coordinates--triTop is mdpt of brush

			var triTop = [this.timeScale(extent[0])+((this.timeScale(extent[1]) - this.timeScale(extent[0]))/2), 8];
			var triLeft = [triTop[0]-(12/(Math.pow(3, 0.5))), 20];
			var triRight = [triTop[0]+(12/(Math.pow(3, 0.5))), 20];
			var triangleData = [triTop, triLeft, triRight];
			
			d3.selectAll('#timeTriangle').remove();
			
			this.brushG
				.append("path")
				.datum(triangleData)
				.attr("d", this.line)
				.attr("id", "timeTriangle");
		},
		
		makeMarker: function(extent){
			var markerBottom = [this.timeScale(extent[0])+((this.timeScale(extent[1]) - this.timeScale(extent[0]))/2), 8];
			var markerTop = [this.timeScale(extent[0])+((this.timeScale(extent[1]) - this.timeScale(extent[0]))/2), -8];
			var markerData = [markerBottom, markerTop];
			
			d3.selectAll('#timeMarker').remove();
			
			this.axisObj
				.append("path")
				.datum(markerData)
				.attr("d", this.line)
				.attr("id", "timeMarker")
				.attr("stroke-width", 3)
				.attr("stroke", 'red')
				.attr("fill", 'red');
			
			
		},
    
    events: {'click': 'onClick',
      'keydown': 'onKD'},
    
    onKD: function(event){
			if (event.keyCode == 39){
				//if right arrow
				var newStart = new Date (middguard.state.timeRange.start.setSeconds(middguard.state.timeRange.start.getSeconds() + 10));
				var newEnd = new Date(middguard.state.timeRange.start.setSeconds(middguard.state.timeRange.start.getSeconds() + 10));
        
  			middguard.state.set({'timeRange' : {'start' : newStart,
  			    'end' : newEnd}
  				});
			} else if (event.keyCode == 37){
				//if left arrow
				var newStart = new Date (middguard.state.timeRange.start.setSeconds(middguard.state.timeRange.start.getSeconds() - 10));
				var newEnd = new Date (middguard.state.timeRange.start.setSeconds(middguard.state.timeRange.start.getSeconds() - 10));
        
  			middguard.state.set({'timeRange' : {'start' : newStart,
  			    'end' : newEnd}
  				});
			}
    },
		
    render: function () {			
      return this;
    }
  });
	
	
	middguard.addModule('TimelineView', TimelineView);
})();
