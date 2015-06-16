module.exports = function (Bookshelf) {
  return Bookshelf.Model.extend({
    tableName: 'person',
    age: function () {
      var birthday = this.get('birthday');
      return new Date().getFullYear() - birthday.getFullYear();
    }
  });
};