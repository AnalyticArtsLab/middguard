module.exports = {
  prefix: 'static/js',
  js: [
    'socket_setup.js',

    'models/analyst.js',
    'models/message.js',
    'models/relationship.js',

    'collections/analysts.js',
    'collections/messages.js',
    'collections/relationships.js',

    'views/packages-view.js',
    'views/chat-view.js',
    'views/app-view.js',

    'app.js'
  ]
};