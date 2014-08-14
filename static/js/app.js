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


  middguard.app = new middguard.AppView();
});