const users = []

// Add a new user
const addUser = (user) => {

  // Clean the data
  id = user.id
  username = user.username.trim().toLowerCase()
  room = user.room.trim().toLowerCase()

  if (!username || !room) return { error: 'User name and room are required!'}

  // Check for existing user
  const existingUser = users.find(user => {
    return user.room === room & user.username === username
  })

  // Validate username
  if (existingUser) return { error: 'Duplicated user'}

  // Store user
  users.push({ id, username, room })
  return { user }
}

// Remove a user
const removeUser = id => {
  const index = users.findIndex(user => user.id === id)

  if (index !== -1) return users.splice(index, 1)[0]
}

// Get a user
const getUser = id => users.find(user => user.id === id)

// Get users in room
const getUsersInRoom = room => users.filter(user => user.room === room.toLowerCase())

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}