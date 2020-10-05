// this is the server side of the application

const express = require('express') // create express server
const app = express()   // create 'app' variable
const server = require('http').Server(app)  // server for socket.io
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
app.set('view engine', 'ejs')
app.use(express.static('public'))
 
app.get('/', (req,res) => {
    // create a 'room' when received GET request to home directory
    // also append a random url using uuid
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    // this 'room' is the dynamic url
    res.render('room', {roomId: req.params.room})
})

// run this whenever someone connect to the webpage 
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        // broadcast userId of the person that just connected to everyone else in the room
        socket.join(roomId)
        socket.to(roomId).broadcast.emit('user-connected', userId)

        // broadcast userId of the person that just disconnected to everyone else in the room
        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})
server.listen(3000)