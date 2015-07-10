module.exports = function (Bookshelf) {
  return Bookshelf.Model.extend({
    tableName: 'person'

    // constructor:function(attributes, options){
 //      if (attributes){
 //        attributes.test = 'boo';
 //      }
 //      return Bookshelf.Model.prototype.constructor.call(this, attributes, options);
 //    },
 //
 //    toJSON: function(){
 //
 //      var result = Bookshelf.Model.prototype.toJSON.call(this, arguments);
 //
 //      //console.log(result)
 //      return result;
 //    }
    
  });
};