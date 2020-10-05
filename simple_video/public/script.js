const socket = io('/')
const videoGrid = document.getElementById('video-grid')

// use peerjs to generate a userId for us
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})

const myVideo = document.createElement('video')

// mute ourselves so the output won't playback our own voice
myVideo.muted = true

// an object to keep track of the call me made
const peers = {}

// connect our video
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)

    // send our own stream to whoever is calling us (new user)
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })
    // when new user is connected (received the broadcast from server)
    socket.on('user-connected', userId => {
        connnectToNewUser(userId, stream)
    })
})

// when new user is disconnected (received the broadcast from server)
socket.on('user-disconnected', userId => {
    console.log(userId)
    // close the call to the disconnected user
    if(peers[userId]) {
        peers[userId].close()
    }
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

// take video stream and append it to the videogrid
function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

function connnectToNewUser(userId, stream) {
    
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    //send stream to the new user indicated by userId
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    //remove new user video when the call is ended
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}