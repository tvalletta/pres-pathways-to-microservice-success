const { forEach, reduce } = require('lodash')

let votes = {}
const clients = {
  voters: {},
  reporters: {}
}

exports.onConnection = socket => {
  var clientId = socket.id
  console.log(`${clientId} connected`)

  socket.on('register', type => {
    console.log({ register: type })
    switch (type) {
      case 'voter':
        clients.voters[clientId] = socket
        break
      case 'reporter':
        clients.reporters[clientId] = socket
        break
      default:
        console.log('Cannot register type: ', type)
    }
  })

  socket.on('vote', function(vote) {
    console.log(vote)
    votes[clientId] = vote
    tally()
  })

  socket.on('reset', function() {
    votes = {}
    tally()
  })

  socket.on('disconnect', () => {
    console.log(`${clientId} disconnected`)
  })

  socket.emit('ack', { message: 'You are connected.' })
}

var generateGuid = function() {
  var mask = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  var guid = mask.replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
  return guid
}

const tally = () => {
  const summary = reduce(votes, (result, choice, client) => {
    console.log({ votes, choice, client })
    result[choice]++
    return result
  }, { a: 0, b: 0, c: 0, d: 0 })
  const formatted = [
    { choice: 'a', count: summary.a },
    { choice: 'b', count: summary.b },
    { choice: 'c', count: summary.c },
    { choice: 'd', count: summary.d }
  ]
  forEach(clients.reporters, socket => {
    socket.emit('update', formatted)
  })
}
