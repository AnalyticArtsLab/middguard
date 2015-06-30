var middguard = middguard || {};

(function () {
  middguard.socket = Backbone.socket = io();

  middguard.state = {
   
//     //other properties of middguard.state are initialized in the packages-view.js file
//
		
    //selections: new Backbone.Collection(),
    //workingSet: new Backbone.Collection(),
		
    // Encode the state as JSON to save in a message
    toJSON: function () {
			var returnObj = {};//{timeRange: {start: this.timeRange.start, end: this.timeRange.end}};
			
			for (dataSet in this){
				if (typeof this[dataSet] == 'object'){
          returnObj[dataSet] ={};
					//only data is encoded, not functions
					for (attribute in this[dataSet]){
            if (attribute === 'workingSet' || attribute === 'selections'){
              var encoding = getModelIdentifiers(this[dataSet][attribute].models);
              returnObj[dataSet][attribute] = this[dataSet][attribute].reset(encoding);
					  } else{
					    returnObj[dataSet][attribute] = this[dataSet][attribute];
              
					  }
		      // var selectionsEncoding = getModelIdentifiers(this[dataSet].selections.models);
//           var workingSetEncoding = getModelIdentifiers(this[dataSet].workingSet.models);
//           returnObj[dataSet] = {selections: this[dataSet].selections.reset(selectionsEncoding),
//                                       workingSet: this[dataSet].workingSet.reset(workingSetEncoding)
//                                     };
  				}
  			}
      }
      return returnObj;
    },

    // Properties can be anything of the form 
    // {Property name: {attribute1: value1, attribute2: value2, ...}}
    //
    // Setting a non-existent state variable creates a new variable
    //
    // For dataset/collections, we maintain two attributes: 
    // - workingSet: the set of visible entities
    // - selection: a highlighted entity or set of entities from the working set
    // both of these should be set as Backbone Collection objects or as arrays of objects
  
		// IMPORTANT: Write modules to listen to changes on these 'state' objects so they update
		// when other modules set the state.
		
    set: function(state){
      var hasOwnProperty = Object.prototype.hasOwnProperty;
			for (prop in state){
				//replace old 'workingSet' and 'selections' collections with new groups of data for each dataset
        // check to see if there is a property matching this on in the state
        if (! this.hasOwnProperty(prop)){
          this[prop] = {};
        }
        
				//(i.e. collection of models) in the database
				if (! this[prop].bind){
					//if property is not yet extended to Backbone.events, bind it
					_.extend(this[prop], Backbone.Events);
				}
        
        for (attribute in state[prop]){
          if (attribute === 'workingSet' || attribute === 'selections'){
  					if (hasOwnProperty.call(state[prop][attribute], 'models')){
  						//this[prop].workingSet.reset(getModelIdentifiers(state[prop].workingSet.models));
              this[prop][attribute].reset(state[prop][attribute].models);
  					} else {
  						//if workingSet is just an array (i.e. if a JSON object is being decoded)

  						//this[prop].workingSet.reset(getModelIdentifiers(state[prop].workingSet));
              this[prop][attribute].reset(state[prop][attribute]);
  					}
          }else{
            this[prop][attribute] = state[prop][attribute];
            
          }
          
        }
        
				this[prop].trigger('change', this[prop]);
      }
    },
    
      // //NOTE: "selections" is a Backbone collection when referenced as a property of
      // //"this", but it can be anything
      // //(i.e. it's whatever the value field is for the "selections" key in the "state" object 
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