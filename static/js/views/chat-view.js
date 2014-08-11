var middguard = middguard || {};

(function () {
  'use strict';

  middguard.ChatView = Backbone.View.extend({
    id: 'middguard-chat',
    template: _.template(
      '<div id="middguard-chat-header">Chat' +
      '<button id="middguard-chat-collapse">&mdash;</button></div>' +
      '<div id="middguard-chat-log"></div>' +
      '<textarea id="middguard-chat-input"></textarea>'
    ),
    events: {
      'keydown #middguard-chat-input': 'sendMessage',
      'click #middguard-chat-collapse': 'toggleCollapsed',
      'click': 'focusInput'
    },
    initialize: function () {
      this.collapsed = false;

      _.bindAll(this, 'addOne', 'addAll');
      this.listenTo(middguard.Messages, 'add', this.addOne);
      this.listenTo(middguard.Messages, 'reset', this.addAll);
      middguard.Analysts.fetch();
      middguard.Messages.fetch({reset: true});
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
        analyst_id: middguard.user.id,
        seen: true,
        state: JSON.stringify(middguard.state.toJSON())
      }
    },
    addOne: function (message) {
      var view = new middguard.ChatMessageView({model: message});
      this.$chatlog.append(view.render().el);
    },
    addAll: function () {
      middguard.Messages.each(this.addOne);
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
    tagName: 'div',
    className: 'middguard-chat-message',
    template: _.template(
      '<div class="middguard-chat-message-meta"><%= analyst %>' +
      '<span class="timeOrRestore"><%= time %></span></div>' +
      '<div class="middguard-chat-message-content"><%= content %></div>'
    ),
    events: {
      'mouseover': 'showRestoreState',
      'mouseout': 'showTime',
      'click .timeOrRestore': 'restoreState'
    },
    initialize: function () {
      this.analyst = middguard.Analysts.findWhere({
        id: this.model.get('analyst_id')
      });

      this.sentBySelf = this.analyst.get('id') === middguard.user.id;

      this.listenTo(this.model, 'change', this.render);
    },
    render: function () {
      var attrs = {
        analyst: this.analyst.get('username'),
        content: this.model.get('content'),
        time: moment(this.model.get('timestamp')).calendar()
      };
      this.$el.html(this.template(attrs));
      this.$el.toggleClass('sent-by-self', this.sentBySelf);
      return this;
    },
    showRestoreState: function () {
      this.$el.find('span').html('Restore state');
    },
    showTime: function () {
      this.$el.find('span').html(moment(this.model.get('timestamp')).calendar());
    },
    restoreState: function () {

    }
  });
})();