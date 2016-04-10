module.exports = {
  prefix: 'static/js',
  js: [
    'setup.js',

    'models/analyst.js',
    'models/message.js',
    'models/graph.js',
    'models/node.js',
    'models/packaged-module.js',
    'models/packaged-model.js',
    'models/packaged-analytics.js',

    'collections/base.js',
    'collections/analysts.js',
    'collections/messages.js',
    'collections/graphs.js',
    'collections/nodes.js',
    'collections/packaged-modules.js',
    'collections/packaged-models.js',
    'collections/packaged-analytics.js',

    'views/packages-view.js',
    'views/package-view.js',
    'views/observations-view.js',
    'views/app-view.js',
    'views/header-view.js',
    'views/graphs-view.js',
    'views/graph-editor-view.js',

    'app.js'
  ]
};
