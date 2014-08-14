var middguard = middguard || {};

(function () {
  var PackagedAnalytics = Backbone.Collection.extend({
    url: 'analytics',
    model: middguard.PackagedAnalyticsModel
  });

  middguard.PackagedAnalytics = new PackagedAnalytics();
})();