var middguard = middguard || {};

(function() {
  var HashtagsTableView = middguard.View.extend({
    id: 'hashtags-table',

    className: 'list-unstyled',

    tagName: 'table',

    template: _.template(
      '<th><tr><td>Hashtag</td><td>Count</td></tr></th>'
    ),

    hashtagTemplate: _.template(
      '<tr><td><%= hashtag %></td><td><%= count %></td></tr>'
    ),

    initialize: function(options) {
      this.fetch(this.model)
    },

    render: function() {

    }
  });

  middguard.HashtagsTableView = HashtagsTableView;
  middguard.addModule('HashtagsTableView', HashtagsTableView);
})();
