var middguard = middguard || {};

(function () {
  'use strict';

  var QueryView = middguard.View.extend({
    id: 'middguard-query',
		template: _.template('<h1>Query</h1><div id="query-body"><div id="query-options"><div id="query-location-options"><h2>Location</h2><svg id="query-map-svg"><image xlink:href="/modules/query-view/images/map.jpg" id="query-map" x="0" y="0"/></svg><div id="query-location-list"><select id="query-locations" multiple size="5"></select></div></div><div id="query-time-div"><h2>Time</h2><select id="query-time-options" size="7"><option value="all" selected>All time</option><option value="range" id="query-range-time">Range </option><option value="current" id="query-current-time">Current </option><option value="fri">Friday </option><option value="sat">Saturday</option><option value="sun">Sunday</option><option id="query-duration_inc" value="duration_inc"></option><option id="query-duration_ex" value="duration_ex"></option></select><p>Duration  <span id="query-current-range"></span><input type="range" min="2" max="960" value="30" id="query-range-slider"/></div><div id="query-tags-div"><h2>Tags</h2><select id="query-tag-options" multiple size="15" ></select></div></div><div id="query-results"><h2>Results</h2><button id="query-button">Perform Lookup</button><p id="result-count"></p><select id="query-results-list" multiple size="60"></select></div></div>'),
    
    events:{
      "click #query-button":"performQuery",
      "change #query-results-list":"groupSelection",
      "change #query-locations":"performQuery",
      "change #query-time-options":"performQuery",
      "change #query-tag-options":"performQuery",
      "change #query-range-slider":"setDuration"
    },
    
    mapWidth: 600,
    mapHeight:600,
    
    initialize: function () {
      
      _.bindAll(this, 'loadTags', 'setTime', 'loadLocations', 'performQuery', 'showResults', 'groupSelection', 'setDuration');
      var v = this;
      
      this.$el.html(v.template);
      
      var svg = d3.select(this.el).select('#query-map-svg');
      svg.style('width', this.mapWidth).style('height',this.mapHeight);
      
      svg.select('#query-map').attr('width', this.mapWidth).attr('height',this.mapHeight);
      
      var cellSize = this.mapWidth / 100;
      
      this.pois = d3.select(this.el)
      .select('#query-map-svg')
      .append('g')
      .selectAll('rect')
      .data(middguard.entities.Pois.models)
      .enter()
      .append('rect')
      .attr('class','query-location-rect')
      .attr('width',cellSize)
      .attr('height',cellSize)
      .attr('x', function(d){return d.get('x') * cellSize;})
      .attr('y', function(d){return v.mapHeight - d.get('y') * cellSize - 4})
      .on('click', function(d){
        if (d3.event.altKey){
          middguard.state.Pois.selections.add(d);
        }else{
          middguard.state.Pois.selections.reset(d);
        }
      });
      
      this.results = middguard.entities.Groups.models;
      this.results.sort(function(a,b){ return a.id - b.id;});
      
      this.listenTo(middguard.state.Pois.selections, 'add remove reset', this.loadLocations);
      this.listenTo(middguard.state.Groups.selections, 'add remove reset', this.showResults);
      this.listenTo(middguard.state.timeRange, 'change',this.setTime);
      this.listenTo(middguard.entities.Tags, 'add remove', this.loadTags);
      this.listenTo(middguard.state.Groups.selections, 'add remove reset', this.showResults);
      
      this.showResults();
      this.setDuration();
      this.setTime();
      this.loadTags();
      this.loadLocations();

    },
    
    loadTags: function(){
      var options = d3.select(this.el)
      .select('#query-tag-options')
      .selectAll('option')
      .data(middguard.entities.Tags.models);
      
      options.exit().remove();
      
      options.enter().append('option');
      
      options.attr('value', function(d){return d.id;})
      .html(function(d){return d.get('tag');});
      
      
    },
    
    setTime: function(){
      var start = (new Date(middguard.state.timeRange.start - 4*60*60*1000)).toISOString();
      var end = (new Date(middguard.state.timeRange.end - 4*60*60*1000)).toISOString();
      var current = (new Date(middguard.state.timeRange.current - 4*60*60*1000)).toISOString();
      start = start.slice(0,-5);
      end = end.slice(0,-5);
      current = current.slice(0,-5);
      
      d3.select(this.el).select('#query-range-time').html('Range: ' + start + ' - '+ end);
      d3.select(this.el).select('#query-current-time').html('At: ' + current);
      this.performQuery();
    },
    
    setDuration: function(){
      var duration = $('#query-range-slider', this.$el).val();
      
      var metric = ' minutes';
      if (duration >= 60){
        duration = (duration/60).toFixed(2);
        metric = ' hours';
      }
      
      $('#query-current-range', this.$el).html(duration+metric);
      $('#query-duration_inc', this.$el).html('At least: ' + duration+metric);
      $('#query-duration_ex', this.$el).html('No more than: ' + duration+metric);
      
      this.performQuery();
    },
    
    loadLocations: function(){
      var options = d3.select(this.el)
      .select('#query-locations')
      .selectAll('option')
      .data(middguard.state.Pois.selections.models.filter(function(poi){
        return poi.id;
      }));
      
      options.exit().remove();
      
      options.enter().append('option');
      
      options.attr('value', function(d){return d.id;})
      .html(function(d){return d.get('name');});
      
      
      
      this.pois.attr('fill', function(d){ 
        return (middguard.state.Pois.selections.get(d.id)) ? '#00FF00': '#FFFF99';
      });
    },
    
    performQuery: function(){
      var v = this;
    
      var tagIds = $('#query-tag-options', this.$el).val();
      if (tagIds){
        tagIds = tagIds.map(function(d){return +d;});
      }

      
      var times = $('#query-time-options', this.$el).val();
      


      var poiIds = $('#query-locations', this.$el).val();
      if (poiIds){
        poiIds = poiIds.map(function(d){return +d;});
      }
 
  
      this.results = middguard.entities.Groups.models;
      // trim group list down to groups matching the tag
      if (tagIds){
        this.results = this.results.filter(function(group){
          for (var i=0; i < tagIds.length; i++){
            if (group.get('tags').indexOf(tagIds[i]) === -1){
              return false;
            }
          }
          return true;
        });
      }

      
      // now check the location
      if (poiIds){
        this.results = this.results.filter(function(group){
          var pid = group.get('members')[0];
          var person = middguard.entities.People.get(pid);
        
          for (var i=0; i < poiIds.length; i++){
            if (person.get('locations').indexOf(poiIds[i]) === -1){
              return false;
            }
          }
          return true;
        });
      }
      
      
      // and check the time
      // if there are no locations, we just check if the group was active
      // otherwise we want to know if they were in one of those locations within that time
      if (times !== 'all'){
        var start = middguard.state.timeRange.start;
        var end = middguard.state.timeRange.end;
        var current = middguard.state.timeRange.current;

        var startStr = start.toISOString();
        var endStr = end.toISOString();
        var currentStr = current.toISOString();
        var duration = +$('#query-range-slider', this.$el).val() * 60 * 1000; // convert to milliseconds
        
        if (poiIds){
          var people = [];
          this.results.forEach(function(group){
            people.push(group.get('members')[0]);
          });
          people = _.uniq(people);
          
          
          // fetch the intervals associated with the people in this group
          // before we can do the actual test
          var query = 'person_id IN ('+people.toString()+') AND poi_id IN ('+poiIds.toString()+')';
          
          middguard.entities.Intervals.fetch({data:{whereRaw:query},
            error:function(collection,response,options){console.log(response)},
            success:function(collection,response,options){
              v.results = v.results.filter(function(group){
                var pid = group.get('members')[0];
                var intervals = collection.where({person_id: pid});


                if (intervals){
                  var totalTime = 0;
                  for (var i = 0; i < intervals.length; i++){
                    var iStart = new Date(intervals[i].get('start'));
                    var iStop = new Date(intervals[i].get('stop'));

                  
                    if (times === 'fri' && iStart.getDay() === 6){
                      return true;
                    }else if (times === 'sat' && iStart.getDay() === 7){
                      return true;
                    }else if (times === 'sun' && iStart.getDay() === 8){
                      return true;
                    }else if (times === 'current' && iStart<= current && iEnd >= current){
                      return true;
                    }else if (times === 'range' && ((iStart >= start && iStart <= end) || (iStart <= start && iStop >= start))){
                      return true;
                    }else{
                      // we are doing durations, sum the length for our pois of interest
                      if (poiIds.indexOf(intervals[i].get('poi_id')) !== -1){
                        totalTime += iStop - iStart;
                      }
                    }
                  }
                  
                  if (times === 'duration_ex'){
                    return totalTime <= duration;
                  }else if (times === 'duration_inc'){
                    return totalTime >= duration;
                  }
                }
                return false;
              });

            v.results.sort(function(a,b){ return a.id - b.id;})
            // display the results
            v.showResults();
          }
          });
         
        }else{
          // no location, so we just want to know if they were active for this time range
          this.results = this.results.filter(function(group){
            var pid = group.get('members')[0];
            var person = middguard.entities.People.get(pid);

            
            var fri_enter = new Date(person.get('fri_enter'));
            var fri_exit  = new Date(person.get('fri_exit'));
            var sat_enter = new Date(person.get('sat_enter'));
            var sat_exit  = new Date(person.get('sat_exit'));
            var sun_enter = new Date(person.get('sun_enter'));
            var sun_exit  = new Date(person.get('sun_exit'));
            
            
            if (times === 'fri'){
              return group.get('days').indexOf(6) !== -1;
            }else if (times === 'sat'){
              return group.get('days').indexOf(7) !== -1;
            }else if (times === 'sun'){
              return group.get('days').indexOf(8) !== -1;
            }else if (times === 'current'){
              return (group.get('days').indexOf(6) !== -1 && currentStr >= person.get('fri_enter') && currentStr <= person.get('fri_exit')) ||
              (group.get('days').indexOf(7) !== -1 && currentStr >= person.get('sat_enter') && currentStr <= person.get('sat_exit')) ||
              (group.get('days').indexOf(8) !== -1 && currentStr >= person.get('sun_enter') && currentStr <= person.get('sun_exit'));
            }else if (times === 'range'){
              return (group.get('days').indexOf(6) !== -1 && (startStr >= person.get('fri_enter') && startStr <= person.get('fri_exit')) ||
              (startStr < person.get('fri_enter') && endStr >= person.get('fri_enter'))) ||
              (group.get('days').indexOf(7) !== -1 && (startStr >= person.get('sat_enter') && startStr <= person.get('sat_exit')) ||
              (startStr < person.get('sat_enter') && endStr >= person.get('sat_enter'))) ||
              (group.get('days').indexOf(8) !== -1 && (startStr >= person.get('sun_enter') && startStr <= person.get('sun_exit')) ||
              (startStr < person.get('sun_enter') && endStr >= person.get('sun_enter')));
            }else if (times === 'duration_ex'){
              // spent no more than X amount of time in the park on a given day
              return (group.get('days').indexOf(6) !== -1 && fri_exit - fri_enter <= duration) || 
              (group.get('days').indexOf(7) !== -1 && sat_exit - sat_enter <= duration) ||
              (group.get('days').indexOf(8) !== -1 && sun_exit - sun_enter <= duration);
             
            }else if (times === 'duration_inc'){
              // spent at least x amount of time in the park on a given day
              return (group.get('days').indexOf(6) !== -1 && fri_exit - fri_enter >= duration) || 
              (group.get('days').indexOf(7) !== -1 && sat_exit - sat_enter >= duration) ||
              (group.get('days').indexOf(8) !== -1 && sun_exit - sun_enter >= duration);
            }
          });

          // sort the results
          this.results.sort(function(a,b){ return a.id - b.id;})
          // display the results
          this.showResults();
        }
      }else{
        // sort the results
        this.results.sort(function(a,b){ return a.id - b.id;})
        // display the results
        this.showResults();
      }
      
    },
    
    
    showResults:function(){
      
      $('#result-count', this.$el).html(this.results.length + ' groups');
      
      var options = d3.select(this.el)
      .select('#query-results-list')
      .selectAll('option')
      .data(this.results);
      
      options.exit().remove();
      
      options.enter().append('option');
      
      options.attr('value', function(d){return d.id;})
      .html(function(d){return d.id + ' ['+d.get('members').length +']';})
      .style('background', function(d){return middguard.state.Groups.selections.get(d.id) ? '#00FF00':'white';})
      .property('selected',function(d){return middguard.state.Groups.selections.get(d.id) ? true:false});
      
      
    },
    
    groupSelection:function(){
      var selections = $('#query-results-list', this.$el).val();
  
      if (selections){
        selections = selections.map(function(d){return middguard.entities.Groups.get(+d);});
        middguard.state.Groups.selections.reset(selections);
      }
    }
   

    
	});
	
	middguard.addModule('QueryView', QueryView);
})();
