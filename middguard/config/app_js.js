module.exports = {
  prefix: 'static/js',
  js: [
    'setup.js',

    'models/analyst.js',
    'models/message.js',
    'models/relationship.js',
    'models/packaged-module.js',
    'models/packaged-model.js',
    'models/packaged-analytics.js',

    'collections/analysts.js',
    'collections/messages.js',
    'collections/relationships.js',
    'collections/packaged-modules.js',
    'collections/packaged-models.js',
    'collections/packaged-analytics.js',

    'views/packages-view.js',
    'views/chat-view.js',
    'views/app-view.js',

    'app.js'
  ]
};