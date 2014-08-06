var middguard = middguard || {};

(function () {
  var Messages = Backbone.Collection.extend({
    model: middguard.Message,
    url: 'messages',
    initialize: function () {
      _.bindAll(this, 'serverCreate');
      this.ioBind('create', this.serverCreate, this);
    },
    serverCreate: function (data) {
      var exists = this.get(data.id);
      if (!exists) {
        this.add(data);
      } else {
        exists.set(data);
      }
    }
  });

  middguard.Messages = new Messages();
})();