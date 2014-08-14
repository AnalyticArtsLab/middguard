var middguard = middguard || {};

(function () {
  // Use a middguard.EntityCollection since it already listens for socket events
  middguard.Relationships = new middguard.EntityCollection([], {
    url: 'relationships',
    model: middguard.Relationship
  });
})();