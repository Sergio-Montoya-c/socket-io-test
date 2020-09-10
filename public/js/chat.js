const socket = io()

// Elements
const $messageForm = document.querySelector('form')
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $locationButton = document.querySelector('#share-location')
const $messages = document.querySelector("#messages")
const $sidebar = document.querySelector("#sidebar")

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoScroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild

  // Get new message height
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // Visible height
  const visibleHeight = $messages.offsetHeight

  // Height of messages container
  const containerHeight = $messages.scrollHeight

  // How far have I scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
  }

}

socket.on('message', message => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('H:mm:s A')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

socket.on('updateRoom', ({room, users}) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })
  $sidebar.innerHTML = html
})

socket.on('locationMessage', message => {
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format('H:mm:s A')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

$messageForm.addEventListener('submit', event => {
  event.preventDefault()
  $messageFormButton.setAttribute('disabled', 'disabled')
  const message = event.target.elements.message.value
  socket.emit('sendMessage', message, sendMessageAcknoledge)
})

const sendMessageAcknoledge = error => {
  $messageFormButton.removeAttribute('disabled')
  $messageFormInput.value = ''
  $messageFormInput.focus()

  if (error) return console.log(error)
}

$locationButton.addEventListener('click', () => {
  if (!navigator.geolocation) return alert("Can't use on this browser")

  $locationButton.setAttribute('disabled', 'disabled')

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords
    const location = { latitude, longitude }
    socket.emit('sendLocation', location, sendLocationAcknowledge)
  })
})

const sendLocationAcknowledge = () => {
  $locationButton.removeAttribute('disabled')
}

socket.emit('join', { username, room },  error => {
  if (error) {
    alert("Can't join, user already on this room")
    location.href = '/'
  }
})