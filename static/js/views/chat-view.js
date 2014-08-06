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
      'keydown #middguard-chat-input': 'sendMessage',
      'click #middguard-chat-collapse': 'toggleCollapsed',
      'click': 'focusInput'
    },
    initialize: function () {
      this.collapsed = false;
      middguard.Messages.fetch();
    },
    render: function () {
      this.$el.html(this.template());
      this.$chatlog = this.$('#middguard-chat-log');
      this.$collapse = this.$('#middguard-chat-collapse');
      this.$input = this.$('#middguard-chat-input');
      return this;
    },
    messageContents: function () {
      return {
        content: this.$input.val().trim(),
        analyst_id: 1,
        seen: true,
        state: JSON.stringify(middguard.state.toJSON())
      }
    },
    sendMessage: function (event) {
      if (event.which === 13 && !event.shiftKey) {
        event.preventDefault();
        var message = middguard.Messages.create(this.messageContents());
        this.$input.val('');
        return false;
      }
    },
    toggleCollapsed: function () {
      if (this.collapsed) {
        this.$chatlog.show();
        this.$input.show();
        this.$collapse.html('&mdash;');
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
  });
})();