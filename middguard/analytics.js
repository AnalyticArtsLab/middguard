var _ = require('lodash');

/* Validate a node's input groups.
 * Does every input group have a connection?
 *
 * @param node: a fetched `Node` instance
 * @this: middguard
 */
exports.validateInputGroupConnections = function(node) {
  var inputs = this.bookshelf.collection('modules').findWhere({
        name: node.get('module')
      }).get('inputs'),
      connections = node.get('connections');

  return _.every(inputs, input => _.has(connections, input.name));
};

/* Validate a node's input groups.
 * Does every input group have a connection?
 *
 * @param node: a fetched `Node` instance
 * @this: middguard
 */
exports.resolveDependentNodes = function(node) {
  
}
