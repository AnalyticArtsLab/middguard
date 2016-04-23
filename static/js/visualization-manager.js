var middguard = middguard || {};

(function() {


  middguard.activateView = function(main) {
    var ctor = middguard.__modules[main].ctor;
    var live = new ctor();

    middguard.__modules[main].live = live;

    $('.middguard-views').append(live.render().el);
  };

  middguard.deactivateView = function(main) {
    middguard.__modules[main].live.remove();
    middguard.__modules[main].live = null;
  };

})();
