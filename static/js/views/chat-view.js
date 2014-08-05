var middguard = middguard || {};

(function () {
  'use strict';

  middguard.ChatView = Backbone.View.extend({
    id: 'middguard-chat',
    template: _.template(
      '<ul id="chatlog"></ul>' +
      '<input id="middguard-chat-input" type="text">'
    ),
    events: {
      'keyup #middguard-chat-input': 'sendMessage'
    },
    initialize: function () {
    },
    render: function () {
      this.$el.html(this.template());
      return this;
    },
    messageContents: function () {
      return {
        contents: this.$('#middguard-chat-input'),
        analyst: middguard.user.get('id'),
        state: middguard.state.encode()
      }
    },
    sendMessage: function (event) {
      if (event.which === 13) {
        middguard.messages.create(this.messageContents());
      }
    }
  });

  middguard.ChatMessageView = Backbone.View.extend({
    tagName: 'li',
    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
    },
    render: function () {
      this.$el.html(this.model.get('content'));
    }
  })
})();