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
    }
  };

  var getModelIdentifiers = function (collection) {
    return collection.map(function (model) {
      return {type: model.get('type'), id: model.get('id')};
    });
  };

  middguard.app = new middguard.AppView();
});