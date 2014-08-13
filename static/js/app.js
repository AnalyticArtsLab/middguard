var middguard = middguard || {};

$(function () {
  'use strict';

  middguard.state = {
    timeRange: _.extend({
      start: Number.NEGATIVE_INFINITY,
      end: Number.POSITIVE_INFINITY
    }, Backbone.Events),
    selections: new Backbone.Collection(),
    workingSet: new Backbone.Collection(),
    toJSON: function () {
      var selectionsEncoding = getModelIdentifiers(this.selections);
      var workingSetEncoding = getModelIdentifiers(this.workingSet);
      return {
        timeRange: {start: this.timeRange.start, end: this.timeRange.end},
        selections: selectionsEncoding,
        workingSet: workingSetEncoding
      };
    },
    set: function (state) {
      this.selections.reset(state.selections.map(getModel));
      this.workingSet.reset(state.workingSet.map(getModel));
      this.timeRange.start = state.timeRange.start;
      this.timeRange.end = state.timeRange.end;
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

  $.ajax({
    url: '/models',
    success: function (models) {
      models.forEach(function (model) {
        var capital = capitalize(model.name);
        var plural = pluralize(model.name);
        var capitalPlural = capitalize(plural);

        middguard.entities[capital] = Backbone.Model;
        middguard.entities[capitalPlural] = new middguard.EntityCollection([], {
          url: plural,
          model: middguard.entities[capital]
        });
      });

      middguard.app = new middguard.AppView();
    }
  });

  var capitalize = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
});