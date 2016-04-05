var middguard = middguard || {};

(function () {
  var Messages = Backbone.Collection.extend({
    model: middguard.Message,
    url: 'messages',
    initialize: function () {
      _.bindAll(this, 'serverCreate');
      this.ioBind('create', this.serverCreate, this);
    },
    serverCreate: function (data) {
      var exists = this.get(data.id);
      if (!exists) {
        this.add(data);
      } else {
        exists.set(data);
      }
    },
    messagesPerUser: function () {
      var stats = {},
          nativeHasOwnProperty = Object.prototype.hasOwnProperty;
      this.each(function (message) {
        var analyst = middguard.Analysts.findWhere({
          id: message.get('analyst_id')
        }).get('username');
        if (nativeHasOwnProperty.call(stats, analyst)) stats[analyst]++;
        else stats[analyst] = 1;
      });
      return d3.entries(stats);
    },
    messagesInInterval: function (buckets) {
			//make a histogram of message times
			//i.e. show how many messages were sent in each time interval for some number of time intervals
      var stats = {},
				nativeHasOwnProperty = Object.prototype.hasOwnProperty,
					minTS, maxTS,
						TSList = [];

      this.each(function (message) {
				//run through once to find the minimum timestamp, maximum timestamp, and range
        var timestamp = new Date(message.get('timestamp'));
				if (!minTS && ! maxTS){
					minTS = timestamp;
					maxTS = timestamp;
				} else {
					if (timestamp < minTS){
						minTS = timestamp;
					} else if (timestamp > maxTS){
						//as long as minTS and maxTS are defined, a new timestamp cannot be both the minTS and maxTS
						//thus, we use "else if"
						maxTS = timestamp;
					}
				}
				TSList.push(timestamp);
      });
			var range = maxTS.getTime()-minTS.getTime();
			var interval = range/buckets;
			for (var i = 0; i<buckets; i++){
				//initialize all buckets to zero
				stats[new Date(minTS.getTime()+(interval*i))] = 0;
			}

			TSList.forEach(function(curTS){
				//put each timestamp in its correct bucket
				var bucket = Math.min(4, Math.floor((curTS.getTime()-minTS.getTime())/interval));
				stats[new Date(minTS.getTime()+(interval*bucket))] += 1;
			});

      return d3.entries(stats);
    }
  });

  middguard.Messages = new Messages();
})();
