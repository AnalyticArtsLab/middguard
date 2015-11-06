var middguard = middguard || {};

(function () {
  'use strict';

  var CyclingDataView = middguard.View.extend({
    id: "cycling-data-view",

    template: _.template('<p>(lat: <%- latitude %>, lon: <%- longitude %>)</p>'),

    initialize: function () {

    },
    render: function () {
      var data = middguard.entities['Gps-points'];

      data.each(_.bind(function (point) {
        this.$el.append(this.template(point.attributes));
      }, this))

      return this;
    }
  });

  middguard.addModule('CyclingDataView', CyclingDataView);
})();
