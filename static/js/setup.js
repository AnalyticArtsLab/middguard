var middguard = middguard || {};

(function () {
  middguard.socket = Backbone.socket = io();

  middguard.state = {

    //other properties of middguard.state are initialized in the packages-view.js file

    //selections: new Backbone.Collection(),
    //workingSet: new Backbone.Collection(),

    // Encode the state as JSON to save in a message
    toJSON: function () {
      var returnObj = {};

      for (dataSet in this){
        if (dataSet === 'timeRange'){
          returnObj[dataSet] = {};
          returnObj[dataSet].current = this[dataSet].current;
          returnObj[dataSet].start = this[dataSet].start;
          returnObj[dataSet].end = this[dataSet].end;
        } else if (typeof this[dataSet] == 'object'){
          returnObj[dataSet] ={};
          //only data is encoded, not functions
          for (attribute in this[dataSet]){
            if (attribute === 'workingSet' || attribute === 'selections'){
              var encoding = getModelBareBones(this[dataSet][attribute].models);
              returnObj[dataSet][attribute] = this[dataSet][attribute].reset(encoding);
            } else{
              //returnObj[dataSet][attribute] = this[dataSet][attribute];
            }
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
          } else {
            if (prop === 'timeRange' &&  (attribute === 'current' || attribute === 'start' || attribute === 'end')){
              //convert to Date type if necessary (i.e. state is being restored from a JSON string object)
              if (Object.prototype.toString.call(state[prop][attribute]) !== '[object Date]'){
                this[prop][attribute] = new Date(state[prop][attribute]);
              } else {
                this[prop][attribute] = state[prop][attribute];
              }
            } else {
              this[prop][attribute] = state[prop][attribute];
            }

          }

        }
    		this[prop].trigger('change', this[prop]);
      }
    },

    //NOTE: "selections" is a Backbone collection when referenced as a property of
    //"this", but it can be anything
    //(i.e. it's whatever the value field is for the "selections" key in the "state" object
  };

  var getModelBareBones = function (collection) {
  	if (collection.length == 0){
  		return collection;
  	} else{
      return _.map(collection, function (model) {
  			if (model.attributes && model.cid){
  				//if 'model' is an actual Backbone model
  				return model.attributes;
  			} else {
  				//if 'model' is just a regular JS object
          var returnObj = {};
          for (var prop in model){
            if (typeof(prop) != 'function'){
              returnObj[prop] = model[prop];
            }
          }
  				return returnObj;
  			}
      });
  	}
  };

  var getModel = function (entity) {
  	//get first model instance whose id matches "entity"
    return middguard.entities[entity.model].findWhere({id: entity.id});
  };

})();
