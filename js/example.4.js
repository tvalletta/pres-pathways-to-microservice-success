const thing = {
  name: 'Something',
  hello: function() {
    console.log(`Hello, ${this}`)
  },
  toString: function() {
    return this.name
  }
}
function go(fn) {
  fn()
}
go(thing.hello)