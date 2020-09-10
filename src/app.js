const path = require('path')
const express = require('express')

const app = express()

const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

const indexPage = (req, res) => {
  const pageInfo = {
    title: 'Chat App',
    name: 'Sergio Montoya'
  }
  res.render('index', pageInfo)
}

app.get('', indexPage)

module.exports = app