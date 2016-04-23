import {socket} from './app';

export state {

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

// Internal hash of module views
middguard.__modules = {};

// Internal hash of submodule views
middguard.__submodules = {};

/* middguard.addModule
 * Makes MiddGuard aware of a top level view.
 * Top level views are listed under "Modules" in the sidebar.
 */
middguard.addModule = function (name, view) {
  _addView(name, view, true /* top level */);
};

/* middguard.addSubview
 * Makes MiddGuard aware of a subview (a view instantiated from another view)
 * Subviews are not listed in the sidebar, but have models they fetch tracked
 * and removed when the view is removed.
 */
middguard.addSubview = function (name, view) {
  _addView(name, view, false /* not top level */);
};

var _addView = function (name, view, topLevel) {
  if (!Object.prototype.hasOwnProperty.call(middguard.__modules, name)) {
    view.prototype.middguard_view_name = name;
    view.prototype.middguard_entities = [];

    if (topLevel) {
      middguard.__modules[name] = {ctor: view, live: null};
    } else {
      middguard.__submodules[name] = {ctor: view, live: null};
    }
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

    this.listenTo(this, 'sync', this.addViewReferences);
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
  serverDelete: function (data) {
    // Already deleted from database, so don't need to model.destroy
    var exists = this.get(data.id);
    if (exists) this.remove(exists);
  },
  addViewReferences: function (collection, response, options) {
    var middguard_view_name = options.middguard_view_name;

    // if a view name wasn't passed in we can't do anything about it
    if (!middguard_view_name)
      return;

    console.log('Adding view references for view "' + middguard_view_name +
                '" to ' + response.length + ' fetched models.');

    // get models added to the collection that match the criteria
    // we fetched for
    (options.data
      ? collection.where(options.data)
      : collection).forEach(function (model) {
      var currentViews = model.get('middguard_views');

      // if 'middguard_views' doesn't exist on the model, set it to an empty
      // array
      if (!currentViews)
        model.set('middguard_views', []);

      currentViews = model.get('middguard_views');

      // if the view has already been added
      if (currentViews.indexOf(options.middguard_view_name) > -1)
        return;

      // add the view to the model's 'middguard_views'
      currentViews.push(middguard_view_name);
      model.set('middguard_views', currentViews);
    });
  }
});

middguard.View = Backbone.View.extend({
  className: 'middguard-module',
  fetch: function (collection, options) {
    // set the view name to add to the middguard_views when we create/update
    // the models
    options.middguard_view_name = this.cid;

    // add the entity to this view
    // so we can check the entities and remove the view from middguard_views
    // when the view is destroyed
    if (this.middguard_entities.indexOf(collection) < 0) {
      this.middguard_entities.push(collection);
    }

    middguard.entities[collection].fetch(options);
  },

  /* middguard.View.prototype.remove
   * Extend the view remove function to remove referenced models
   *
   * Important: If you need to extend remove functionality, you must call
   * `middguard.View.prototype.remove.call(this)` as the super call instead
   * of the usual `Backbone.View.prototype.remove.call(this)`.
   */
  remove: function () {
    var viewName = this.cid;

    console.log('About to remove view "' + viewName + '".');

    // For each model this view references
    this.middguard_entities.forEach(function (entityName) {
      var collection = middguard.entities[entityName];

      // First iteration to remove reference to this model
      collection.each(function (model, i) {
        if (model.get('middguard_views').indexOf(viewName) > -1) {
          removeFromArray(model.get('middguard_views'), viewName);
        }
      });

      // Get an array of models from this entity collection to remove
      var toRemove = collection.filter(function (model) {
        if (model.get('middguard_views').length === 0) {
          delete model.attributes.middguard_views;
          return true;
        }
      });

      console.log('Removing ' + toRemove.length +
                  ' models that are no longer in use from collection "' +
                  entityName + '".');
      // remove them without sending anything to the server
      collection.remove(toRemove);
    });

    console.log('Done removing view "' + viewName + '".');

    // call super
    Backbone.View.prototype.remove.call(this);
  }
});

/* Remove elements from an array.
 * arr is the array to remove from (param 0).
 * Elements to remove are arguments 1 .. n.
 * Source: http://stackoverflow.com/questions/3954438
 */
function removeFromArray(arr) {
  var what, a = arguments, L = a.length, ax;
  while (L > 1 && arr.length) {
    what = a[--L];
    while ((ax= arr.indexOf(what)) !== -1) {
      arr.splice(ax, 1);
    }
  }
  return arr;
}
