var middguard = middguard || {};

(function () {
  'use strict';

  middguard.ObservationsView = Backbone.View.extend({
    id: 'observations',

    template: _.template(
      '<div class="log-messages"></div>' +
      '<textarea class="log-new-message" placeholder="Record an observation..."></textarea>'
    ),

    events: {
      'keydown .log-new-message': 'sendMessage',
      'click': 'focusInput'
    },

    initialize: function () {
      _.bindAll(this, 'addOne', 'addAll');

      this.listenTo(middguard.Messages, 'add', this.addOne);
      this.listenTo(middguard.Messages, 'reset', this.addAll);

      middguard.Analysts.fetch();
      middguard.Messages.fetch({reset: true});
    },

    render: function () {
      this.$el.html(this.template());

      this.$log = this.$('.log-messages');
      this.$input = this.$('.log-new-message');

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
      var view = new middguard.ObsMessageView({model: message});
      this.$log.append(view.render().el);
    },

    addAll: function () {
      middguard.Messages.each(this.addOne);
    },

    sendMessage: function (event) {
      if (event.which === 13 && !event.shiftKey) {
        event.preventDefault();

        var message = middguard.Messages.create(this.messageContents());
        this.$input.val('');

				//scroll to bottom when a message is entered
				this.$log.scrollTop(this.$log[0].scrollHeight);
        return false;
      }
    },

    focusInput: function () {
      this.$input.focus();
    }
  });

  middguard.ObsMessageView = Backbone.View.extend({
    tagName: 'div',
    className: 'middguard-obs-message',
    template: _.template(
      '<div class="middguard-obs-message-meta">' +
        '<%= analyst %>' +
        '<span class="timeOrRestore"><%= time %></span>' +
      '</div>' +
      '<div class="middguard-obs-message-content"><%= content %></div>'
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
      var state = JSON.parse(this.model.get('state'));
      middguard.state.set(state)
    }
  });
})();
