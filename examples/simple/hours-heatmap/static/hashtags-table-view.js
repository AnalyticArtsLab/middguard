var middguard = middguard || {};

(function() {
  var HoursHeatmapView = middguard.View.extend({
    id: 'hashtags-table',

    className: 'list-unstyled',

    tagName: 'table',

    template: _.template(
      '<th><tr><td>Hashtag</td><td>Count</td></tr></th>'
    ),

    hashtagTemplate: _.template(
      '<tr><td><%= hashtag %></td><td><%= count %></td></tr>'
    ),

    initialize: function() {
      this.context = this.createContext();

      this.listenTo(this.context.inputs.hours.collection, 'reset', this.render);

      this.context.inputs.hours.collection.fetch({reset: true, data: {}});
    },

    render: function() {
      console.log(this.context.inputs.hours.collection)

      return this;
    }
  });

  middguard.addModule('HoursHeatmapView', HoursHeatmapView);
})();
