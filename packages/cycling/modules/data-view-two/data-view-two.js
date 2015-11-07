var middguard = middguard || {};

(function () {
  'use strict';

  var CyclingDataViewTwo = middguard.View.extend({
    id: "cycling-data-view-two",

    template: _.template('<p>(lat: <%- latitude %>, lon: <%- longitude %>)</p>'),

    initialize: function () {
      this.fetch('Gps-points', {
        data: {cyclist_id: 1},
        remove: false
      });
      this.fetch('Gps-points', {
        data: {cyclist_id: 2},
        remove: false
      });

      this.listenTo(middguard.entities['Gps-points'], 'sync', this.render);
    },
    render: function () {
      var data = middguard.entities['Gps-points'];

      this.$el.append('<h4>View Two</h4>');

      data.each(_.bind(function (point) {
        this.$el.append(this.template(point.attributes));
      }, this))

      return this;
    }
  });

  middguard.addModule('CyclingDataViewTwo', CyclingDataViewTwo);
})();
