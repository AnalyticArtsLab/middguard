var middguard = middguard || {};

(function () {
  middguard.socket = Backbone.socket = io();

  // Internal hash of module views
  middguard.__modules = {};

  middguard.addModule = function (name, mainView) {
    if (!Object.prototype.hasOwnProperty.call(this.__modules, name)) {
      this.__modules[name] = {ctor: mainView, live: null};
    } else {
      throw new Error('Module ' + name + ' already loaded');
    }
  };

  middguard.View = Backbone.View.extend({
    className: 'middguard-module'
  });

})();