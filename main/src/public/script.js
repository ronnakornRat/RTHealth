// client side of the application

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

// connection for sending text
var in_conn_text    // channel from caller -> callee
var out_conn_text   // channel from callee -> caller

// connect our video
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)

    // people in the room is calling us
    myPeer.on('call', call => {
        // send our own stream to whoever is calling
        call.answer(stream)
        const video = document.createElement('video')
        // caller has sent his/her stream, append it to the grid
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })
    // when new user is connected (received the broadcast from server)
    socket.on('user-connected', userId => {
        connnectToNewUser(userId, stream)
        connect_text(userId)
    })
    // caller - callee
})

// when new user is disconnected (received the broadcast from server)
socket.on('user-disconnected', userId => {
    console.log(userId)
    // close the call to the disconnected user
    if (peers[userId]) {
        peers[userId].close()
    }
})

socket.on('full', roomId => {
    console.log(roomId)
    alert("Sorry, room: " + roomId + " is currently full")
    window.location.href = "/"
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

// receiving text connection
myPeer.on('connection', function (conn) {
    conn.on('data', function (data) {
        console.log(data);
        // do stuff to "data"
        // document.getElementById("text_message").innerText = data
        document.getElementById("text_message").innerHTML = data
        // 
    });
    out_conn_text = conn
});

// take video stream and append it to the videogrid
function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}


function connnectToNewUser(userId, stream) {

    console.log("connnectToNewUser")

    // initiate a call, specified by userId
    const call = myPeer.call(userId, stream)
    // prepare a new video slot for new user's video
    const video = document.createElement('video')
    //send stream to the new user indicated by userId
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    

    // chat connection
    // out_conn_text = myPeer.connect(userId);
    // out_conn_text.on('open', function () {
    //     console.log("sending message");
    //     // here you have conn.id
    //     out_conn_text.send('hi!');
    // });
    
    //remove new user video when the call is ended
    call.on('close', () => {
        video.remove()
    })


    peers[userId] = call
}

// button to exit the room
// prob won't need this in later stage
function exit_room() {
    window.location.href = "/"
}

function pause_unpause() {
    myVideo.srcObject.getTracks().forEach(t => t.enabled = !t.enabled)
    var button = document.getElementById("pause_button");
    if (button.innerHTML === "pause") {
        button.innerHTML = "unpause";
    } else {
        button.innerHTML = "pause";
    }
}

function connect_text(userId) {
    out_conn_text = myPeer.connect(userId);
    out_conn_text.on('open', function () {
        console.log("sending message");
        // here you have conn.id
        // out_conn_text.send('hi!');
    });

    out_conn_text.on('data', function (data) {
        // do stuff with "data"
        console.log(data);
        // document.getElementById("text_message").innerText = data
        document.getElementById("text_message").innerHTML= data
    });
}

function send_message() {
    var message = document.getElementById("chat_text_input").value;
    document.getElementById("chat_text_input").value = ""
    out_conn_text.send(message);
}

