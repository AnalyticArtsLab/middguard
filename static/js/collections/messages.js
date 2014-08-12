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
    },
    messagesPerUser: function () {
      var stats = {},
          nativeHasOwnProperty = Object.prototype.hasOwnProperty;
      this.each(function (message) {
        var analyst = middguard.Analysts.findWhere({
          id: message.get('analyst_id')
        }).get('username');
        if (nativeHasOwnProperty.call(stats, analyst)) stats[analyst]++;
        else stats[analyst] = 1;
      });
      return d3.entries(stats);
    }
  });

  middguard.Messages = new Messages();
})();