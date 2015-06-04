var middguard = middguard || {};

(function () {
  middguard.socket = Backbone.socket = io();

  middguard.state = {
    timeRange: _.extend({
      start: Number.NEGATIVE_INFINITY,
      end: Number.POSITIVE_INFINITY
    }, Backbone.Events),
    selections: new Backbone.Collection(),
    workingSet: new Backbone.Collection(),

    // Encode the state as JSON to save in a message
    toJSON: function () {
      var selectionsEncoding = getModelIdentifiers(this.selections);
      var workingSetEncoding = getModelIdentifiers(this.workingSet);
      return {
        timeRange: {start: this.timeRange.start, end: this.timeRange.end},
        selections: selectionsEncoding,
        workingSet: workingSetEncoding
      };
    },

    // Set the state using an object with optional keys *selections*,
    // *workingSet*, *timeRange.start*, and *timeRange.end*. Write modules
    // to listen to changes on these objects to they update when other modules
    // set the state.
    set: function (state) {
      var hasOwnProperty = Object.prototype.hasOwnProperty;

      if (hasOwnProperty.call(state, 'selections'))
        this.selections.reset(state.selections.map(getModel));

      if (hasOwnProperty.call(state, 'workingSet'))
        this.workingSet.reset(state.workingSet.map(getModel));

      if (hashOwnProperty.call(state, 'timeRange')) {
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
  };

  var getModelIdentifiers = function (collection) {
    return collection.map(function (model) {
      return {type: model.get('type'), id: model.get('id')};
    });
  };

  var getModel = function (entity) {
    return middguard.collections[entity.model].findWhere({id: entity.id});
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