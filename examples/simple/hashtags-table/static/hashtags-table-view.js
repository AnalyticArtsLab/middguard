var middguard = middguard || {};

(function() {
  var HashtagsTableView = middguard.View.extend({
    id: 'hashtags-table',

    className: 'list-unstyled middguard-module',

    tagName: 'table',

    template: _.template(
      '<th><tr><td>Hashtag</td><td>Count</td></tr></th>'
    ),

    hashtagTemplate: _.template(
      '<tr><td><%= hashtag %></td><td><%= count %></td></tr>'
    ),

    initialize: function() {
      this.context = this.createContext();

      var hashtagsCollection = this.context.inputs.hashtags.collection;
      hashtagsCollection.comparator = function(hashtag) {
        return -hashtag.get('count');
      };
      var hashtagsTable = this.context.inputs.hashtags.tableName;
      this.listenTo(hashtagsCollection, 'reset', this.addAllHashtags);

      this.fetch(hashtagsTable, {reset: true, data: {}});
    },

    render: function() {
      this.$el.html(this.template());

      return this;
    },

    addAllHashtags: function() {
      var hashtagsCollection = this.context.inputs.hashtags.collection;
      hashtagsCollection.each(this.addOneHashtag, this);
    },

    addOneHashtag: function(hashtag) {
      this.$el.append(this.hashtagTemplate(hashtag.toJSON()));
    }
  });

  middguard.HashtagsTableView = HashtagsTableView;
  middguard.addModule('HashtagsTableView', HashtagsTableView);
})();
