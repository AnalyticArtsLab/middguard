var middguard = middguard || {};

(function () {
  'use strict';

  var TimelineView = middguard.View.extend({
    id: 'middguard-timeline',
    //dateRange and dateRange full are specific dates for the current project. They're not generalized (obviously)
		dateRangeFull: [new Date("2014-06-06 08:00:19"), new Date("2014-06-08 23:20:16")], // maximum range
		dateRange : [new Date("2014-06-06 08:00:19"), new Date("2014-06-08 23:20:16")], // currently displayed range
    initialize: function () {
			
      var globalThis = this;
      
      // Properties for our chart
      this.margin = {top: 20, right: 20, bottom: 30, left: 10};
      this.height = 125;
      this.svgWidth = 2150;
      this.widthOffset = 350;
      this.width = window.innerWidth - this.widthOffset;// - this.margin.left - this.margin.right;
      
      // Setup elements for the view
      this.d3el = d3.select(this.el);
      
      this.d3el.attr('width', this.width)
        .style('width', this.width + 'px');
      
      this.svg = this.d3el.append('svg')
          .attr('height', 75)
          .attr('width', this.svgWidth)
					.attr('id', 'timelineSVG')
          .attr('focusable', 'true')
			.append("g")
					.attr('transform','translate(' + this.margin.left +',' + this.margin.top + ')')
					.attr("width", this.width);
      this.slider = this.svg.append('g')
					.attr('transform','translate(' + this.margin.left +',' + this.margin.top + ')');
          
      var format = d3.time.format('%Y-%m-%d %H:%M:%S');
          
      this.dateList = [new Date("2014-06-06 08:00:00"), new Date("2014-06-06 12:00:00"), new Date("2014-06-06 16:00:00"), new Date("2014-06-06 20:00:00"), new Date("2014-06-07 00:00:00"),
        new Date("2014-06-07 04:00:00"), new Date("2014-06-07 08:00:00"), new Date("2014-06-07 12:00:00"), new Date("2014-06-07 16:00:00"), new Date("2014-06-07 20:00:00"), new Date("2014-06-08 00:00:00"),
        new Date("2014-06-08 04:00:00"), new Date("2014-06-08 08:00:00"), new Date("2014-06-08 12:00:00"), new Date("2014-06-08 16:00:00"), new Date("2014-06-08 20:00:00"), new Date("2014-06-09 00:00:00")];
        
  			
  			middguard.state.set({timeRange : {start : this.dateRangeFull[0],
        end : this.dateRangeFull[1],
        current: this.dateRangeFull[0]}});
  			
			this.axisEl = d3.svg.axis().tickValues(this.dateList);
      
			this.timeScale = d3.time.scale().domain(this.dateRangeFull);
			this.timeScale.range([0,this.svgWidth-this.margin.left*10]);
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
        
      this.d3el.append('p')
        .text('Attraction Type Filter: ')
        .style('display', 'inline')
        .style('font-family', 'Times New Roman, Times, serif');
        
        
      this.filters = ['No Filter', 'Thrill Rides', 'Kiddie Rides', 'Rides for Everyone', 'Shows & Entertainment', 'Information & Assistance', 'Entrance', 'Unknown'];
      
      this.filters.forEach(function(filter){
        var input = globalThis.d3el
          .append('label')
          .text(filter)
          .style('font-family', 'Times New Roman, Times, serif')
          .append('input')
          .attr('type', 'checkbox')
          .attr('class', 'filter')
          .attr('id', filter.replace(/\s+/g, ''));
          
      });
      
      this.buttons = this.d3el.append('div')
        .attr('id', 'buttons')
        .html('<div />')
        .style('width', this.svgWidth +'px');
      
      //append left button
      this.buttons.append('button')
        .attr('id', 'leftButton')
        .html('<button type="button" id="backwards">&#x2190 Go Back</button>')
        .on('click', function(){
          var dateRange = globalThis.mainBrush.extent();
          dateRange[0].setMinutes(dateRange[0].getMinutes()-1);
          dateRange[1].setMinutes(dateRange[1].getMinutes()-1);
          if (dateRange[0].valueOf() === dateRange[1].valueOf()){
      			middguard.state.set({timeRange : {start : globalThis.dateRangeFull[0],
            end : globalThis.dateRangeFull[1],
            current: dateRange[0]}});
          }else{
      			middguard.state.set({timeRange : {start : dateRange[0],
            end : dateRange[1],
            current: dateRange[0]}});
          }
        });
      //append right button
      this.buttons.append('button')
        .attr('id', 'rightButton')
        .html('<button type="button" id="backwards">Go Forward &#x2192</button>')
        .on('click', function(){
          var dateRange = globalThis.mainBrush.extent();
          dateRange[0].setMinutes(dateRange[0].getMinutes() + 1);
          dateRange[1].setMinutes(dateRange[1].getMinutes() + 1);
          if (dateRange[0].valueOf() === dateRange[1].valueOf()){
      			middguard.state.set({timeRange : {start : globalThis.dateRangeFull[0],
            end : globalThis.dateRangeFull[1],
            current: dateRange[0]}});
          }else{
      			middguard.state.set({timeRange : {start : dateRange[0],
            end : dateRange[1],
            current: dateRange[0]}});
          }
        });
        
        
        //resize timeline div appropriately when window is changed
        window.onresize = function(){
          globalThis.width = window.innerWidth - globalThis.widthOffset;
          globalThis.d3el.attr('width', globalThis.width)
            .style('width', globalThis.width + 'px');
        }
        
				
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
      // system state has changed, change the drawing
      console.log('here');
			this.dateRange = [middguard.state.timeRange.current, middguard.state.timeRange.end];
      
      if (this.dateRange[0].valueOf() != middguard.state.timeRange.start.valueOf()){
        // we have a single point, so the range is full, but we don't want to draw that
        this.dateRange[1] = middguard.state.timeRange.current;
      }
      
      
			this.mainBrush.extent(this.dateRange);
			if ( (this.timeScale(this.dateRange[0]) >= 0 && this.timeScale(this.dateRange[0]) <= this.width) && (this.timeScale(this.dateRange[1]) >= 0 && this.timeScale(this.dateRange[1]) <= this.width) ){
				//make sure both items in this.dateRange are valid
				this.brushG.call(this.mainBrush);
				this.makeTimelineTriangle(this.dateRange);
				this.makeMarker(this.dateRange);
			}
		},
		
		intervalChanged: function (){
      // the brush has changed, update the system state
			var dateRange = this.mainBrush.extent();

      // this somewhat mental conditional is because == and === doesn't work on dates for some
      // reason, but <= does
      if (dateRange[0].valueOf() === dateRange[1].valueOf()){
  			middguard.state.set({timeRange : {start : this.dateRangeFull[0],
        end : this.dateRangeFull[1],
        current: dateRange[0]}});
      }else{
  			middguard.state.set({timeRange : {start : dateRange[0],
        end : dateRange[1],
        current: dateRange[0]}});
      }
      
		},
		line: d3.svg.line()
				.x(function(d){ return d[0]})
				.y(function(d){ return d[1]})
				.interpolate('linear-closed'),
		
		makeTimelineTriangle: function(extent){
				//make a triangle to go in the middle of the brush
			//get triangle coordinates--triTop is mdpt of brush

			var triTop = [this.timeScale(extent[0]), 8];
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
				var newStart = new Date (middguard.state.timeRange.start.setSeconds(middguard.state.timeRange.start.getSeconds() + 60));
				var newEnd = new Date(middguard.state.timeRange.start.setSeconds(middguard.state.timeRange.start.getSeconds() + 60));
        
  			middguard.state.set({'timeRange' : {'start' : newStart,
  			    'end' : newEnd}
  				});
			} else if (event.keyCode == 37){
				//if left arrow
				var newStart = new Date (middguard.state.timeRange.start.setSeconds(middguard.state.timeRange.start.getSeconds() - 60));
				var newEnd = new Date (middguard.state.timeRange.start.setSeconds(middguard.state.timeRange.start.getSeconds() - 60));
        
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
