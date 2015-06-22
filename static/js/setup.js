var middguard = middguard || {};

(function () {
  middguard.socket = Backbone.socket = io();

  middguard.state = {
    timeRange: _.extend({
      start: Number.NEGATIVE_INFINITY,
      end: Number.POSITIVE_INFINITY
    }, Backbone.Events),
		//other properties of middguard.state are initialized in the packages-view.js file
		
		
    //selections: new Backbone.Collection(),
    //workingSet: new Backbone.Collection(),
		
    // Encode the state as JSON to save in a message
    toJSON: function () {
			var returnObj = {timeRange: {start: this.timeRange.start, end: this.timeRange.end}};
			
			for (dataSet in this){
				if (typeof this[dataSet] == 'object' && dataSet != 'timeRange'){
					//only data is encoded, not functions
					
		      var selectionsEncoding = getModelIdentifiers(this[dataSet].selections.models);
		      var workingSetEncoding = getModelIdentifiers(this[dataSet].workingSet.models);
					returnObj[dataSet] = {selections: this[dataSet].selections.reset(selectionsEncoding),
        															workingSet: this[dataSet].workingSet.reset(workingSetEncoding)
																		};
				}
			}
      return returnObj;
    },

    // Add properties to/update the state using an object of the form: 
		// {Dataset/Collection Name: 
		//		{'workingSet': Backbone collection of data to be displayed, 
		//		'selections': selected data among the workingSet data, also a Backbone collection},
		// ...
		//	}
		//
		// IMPORTANT: Write modules to listen to changes on these 'state' objects so they update
		// when other modules set the state.
		
    set: function (state) {
			
      var hasOwnProperty = Object.prototype.hasOwnProperty;
			for (prop in state){
				if (prop != 'timeRange'){
					//replace old 'workingSet' and 'selections' collections with new groups of data for each dataset
					//(i.e. collection of models) in the database
					if (! this[prop].bind){
						//if property is not yet extended to Backbone.events, bind it
						_.extend(this[prop], Backbone.Events);
					}
					if (hasOwnProperty.call(state[prop], 'workingSet')){
						//if workingSet is a Backbone collection
						if (hasOwnProperty.call(state[prop].workingSet, 'models')){
							//this[prop].workingSet.reset(getModelIdentifiers(state[prop].workingSet.models));
              this[prop].workingSet.reset(state[prop].workingSet.models);
						} else {
							//if workingSet is just an array (i.e. if a JSON object is being decoded)

							//this[prop].workingSet.reset(getModelIdentifiers(state[prop].workingSet));
              this[prop].workingSet.reset(state[prop].workingSet);
						}
					}
					if (hasOwnProperty.call(state[prop], 'selections')){
						if (hasOwnProperty.call(state[prop].selections, 'models')){
							//if selections is a Backbone collection
							//this[prop].selections.reset(getModelIdentifiers(state[prop].selections.models));
              this[prop].selections.reset(state[prop].selections.models);
						} else {
							//if selections is just an array (i.e. if a JSON object is being decoded)

							//this[prop].selections.reset(getModelIdentifiers(state[prop].selections));
              this[prop].selections.reset(state[prop].selections);
              
						}
					}
					this[prop].trigger('change', this[prop]);
				} else {
					//if prop == 'timeRange'
	        if (hasOwnProperty.call(state.timeRange, 'start')) {
	          this.timeRange.start = state.timeRange.start;
	          this.timeRange.trigger('change', this.timeRange);
	        }

	        if (hasOwnProperty.call(state.timeRange, 'end')) {
	          this.timeRange.end = state.timeRange.end;
	          this.timeRange.trigger('change', this.timeRange);
	        }
				}
			}
			/*
			//NOTE: "selections" is a Backbone collection when referenced as a property of
			//"this", but it can be anything
			//(i.e. it's whatever the value field is for the "selections" key in the "state" object parameter)
			
      if (hasOwnProperty.call(state, 'selections'))
				//idea: replace current middguard.state.selections Backbone collection
				// with the list of models referenced by the state.selections
        this.selections.reset(state.selections.map(getModel));

      if (hasOwnProperty.call(state, 'workingSet'))
        this.workingSet.reset(state.workingSet.map(getModel));
			
      if (hasOwnProperty.call(state, 'timeRange')) {
        if (hasOwnProperty.call(state.timeRange, 'start')) {
          this.timeRange.start = state.timeRange.start;
          this.timeRange.trigger('change', this.timeRange);
        }

        if (hasOwnProperty.call(state.timeRange, 'end')) {
          this.timeRange.end = state.timeRange.end;
          this.timeRange.trigger('change', this.timeRange);
        }
      }*/
    }
  };

  var getModelIdentifiers = function (collection) {
		if (collection.length == 0){
			return collection;
		} else{
	    return _.map(collection, function (model) {
				if (model.attributes && model.cid){
					//if 'model' is an actual Backbone model
					return {id: model.get('id')};
				} else {
					//if 'model' is just a regular JS object
					return {id: model.id};
				}
	    });
		}
  };

  var getModel = function (entity) {
		//get first model instance whose id matches "entity"
    return middguard.entities[entity.model].findWhere({id: entity.id});
  };

  // Internal hash of module views
  middguard.__modules = {};

  middguard.addModule = function (name, mainView) {
    if (!Object.prototype.hasOwnProperty.call(this.__modules, name)) {
      this.__modules[name] = {ctor: mainView, live: null};
    } else {
      throw new Error('Module ' + name + ' already loaded');
    }
  };

  middguard.analytics = function (name, data) {
    if (middguard.PackagedAnalytics.findWhere({name: name})) {
      middguard.socket.emit('analytics:' + name, data);
    } else {
      throw new Error('Analytics package ' + name + ' not found');
    }
  };

  middguard.entities = {};

  middguard.EntityCollection = Backbone.Collection.extend({
    initialize: function (models, options) {
      this.url = _.result(options, 'url');

      _.bindAll(this, 'serverCreate', 'serverUpdate', 'serverDelete');
      this.ioBind('create', this.serverCreate, this);
      this.ioBind('update', this.serverUpdate, this);
      this.ioBind('delete', this.serverDelete, this);
    },
    serverCreate: function (data) {
      var exists = this.get(data.id);
      if (!exists) {
        this.add(data);
      } else {
        exists.set(data);
      }
    },
    serverUpdate: function (data) {
      var exists = this.get(data.id);
      if (exists) exists.set(data);
    },
    serverDelete: function () {
      // Already deleted from database, so don't need to model.destroy
      var exists = this.get(data.id);
      if (exists) this.remove(exists);
    }
  });

  middguard.View = Backbone.View.extend({
    className: 'middguard-module'
  });

})();