const app = require('./app')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const server = http.createServer(app)
const io = socketio(server)

io.on('connection', socket => {

  // When someone joins a channel
  socket.on('join', (options, callback) => {
    const {error, user} = addUser({ id: socket.id, ...options})
    if (error) return callback("Can't joing")

    socket.join(user.room)
    socket.emit('message', generateMessage('Chattify', 'Welcome to Chatify'))
    socket.broadcast.to(user.room).emit('message', generateMessage('Chattify', `${user.username} has joined!`))

    // Update users lis on chat
    io.to(user.room).emit('updateRoom', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    callback()
  })

  // Receive a message from the client
  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter()

    const user = getUser(socket.id)

    if (filter.isProfane(message)) {
      return callback("Can't send profane messages")
    }

    io.to(user.room).emit('message', generateMessage(user.username, message))
    callback()
  })

  // When user send location
  socket.on('sendLocation', ({ latitude, longitude }, callback) => {
    const user = getUser(socket.id)

    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, {latitude, longitude}))
    callback()
  })

  // When user disconnects
  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit('message', generateMessage('Chattify', `${user.username} has left ${user.room}`))
      // Update users lis on chat
      io.to(user.room).emit('updateRoom', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  })
})

server.listen(process.env.PORT, () => {
  console.log(`Server running on ${process.env.PORT}`)
})