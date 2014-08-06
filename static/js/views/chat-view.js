var middguard = middguard || {};

(function () {
  'use strict';

  middguard.ChatView = Backbone.View.extend({
    id: 'middguard-chat',
    template: _.template(
      '<div id="middguard-chat-header">Chat' +
      '<button id="middguard-chat-collapse">&mdash;</button></div>' +
      '<ul id="middguard-chat-log"></ul>' +
      '<textarea id="middguard-chat-input"></textarea>'
    ),
    events: {
      'keyup #middguard-chat-input': 'sendMessage',
      'click #middguard-chat-collapse': 'toggleCollapsed',
      'click': 'focusInput'
    },
    initialize: function () {
      this.collapsed = false;
    },
    render: function () {
      this.$el.html(this.template());
      this.$chatlog = this.$('#middguard-chat-log');
      this.$collapse = this.$('#middguard-chat-collapse')
      this.$input = this.$('#middguard-chat-input');
      return this;
    },
    messageContents: function () {
      return {
        contents: this.$('#middguard-chat-input').val(),
        analyst: middguard.user.get('id'),
        state: middguard.state.getJSON()
      }
    },
    sendMessage: function (event) {
      console.log('e');
      if (event.which === 13) {
        middguard.messages.create(this.messageContents());
      }
    },
    toggleCollapsed: function () {
      console.log(this.$log);
      if (this.collapsed) {
        this.$chatlog.show();
        this.$input.show();
        this.$collapse.html('&mdash;')
        this.collapsed = false;
      } else {
        this.$chatlog.hide();
        this.$input.hide();
        this.$collapse.html('+');
        this.collapsed = true;
      }
    },
    focusInput: function () {
      this.$input.focus();
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