module.exports = function (Bookshelf, data) {
  var Person = Bookshelf.model('person');
  Person.fetchAll()
  .then(function (people) {
    return people.groupBy(function (person) {
      return person.get('birthday');
    });
  })


}