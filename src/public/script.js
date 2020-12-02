// client side of the application

const socket = io('/')
var videoGrid;

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
    addVideoStream(myVideo, stream, 0)
    // var btn = document.createElement("BUTTON");
    // btn.innerHTML = "1080p"; 
    // btn.addEventListener('click', function (){
    //     changeres("1080px", "1920");
    // });
    // var btn2 = document.createElement("BUTTON");
    // btn2.innerHTML = "240p"; 
    // btn2.addEventListener('click', function (){
    //     changeres("240px", "320");
    // });
    // var btn3 = document.createElement("BUTTON");
    // btn3.innerHTML = "480p"; 
    // btn3.addEventListener('click', function (){
    //     changeres("480px", "640");
    // });
    // var btn4 = document.createElement("BUTTON");
    // btn4.innerHTML = "720p"; 
    // btn4.addEventListener('click', function (){
    //     changeres("720px", "1280");
    // });
    // document.getElementById('buttons').append(btn2);
    // document.getElementById('buttons').append(btn3);
    // document.getElementById('buttons').append(btn4);
    // document.getElementById('buttons').append(btn);

    // people in the room is calling us
    myPeer.on('call', call => {
        // send our own stream to whoever is calling
        call.answer(stream)
        const video = document.createElement('video')
        // caller has sent his/her stream, append it to the grid
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream, 1)
        })
    })
    // when new user is connected (received the broadcast from server)
    socket.on('user-connected', userId => {
        setTimeout(() => {
          connectToNewUser(userId, stream);
          connect_text(userId)
        }, 3000);
      });

    });

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
        append_message("remote", data)
        // document.getElementById("text_message").innerText = data
        // document.getElementById("text").innerHTML = data
    });
    out_conn_text = conn
});

// take video stream and append it to the videogrid
function addVideoStream(video, stream, number) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    if (number ==0){
        videoGrid = document.getElementById("myvid")
    }
    else if (number == 1){
        videoGrid = document.getElementById("othervid")
    }
    videoGrid.append(video)
}


function connectToNewUser(userId, stream) {

    console.log("connnectToNewUser")

    // initiate a call, specified by userId
    const call = myPeer.call(userId, stream)
    // prepare a new video slot for new user's video
    const video = document.createElement('video')
    //send stream to the new user indicated by userId
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream, 1)
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
        append_message("remote", data)
        // document.getElementById("text_message").innerText = data
        // document.getElementById("text").innerHTML= data
    });
}

function send_message() {
    var message = document.getElementById("chat_text_input").value;
    // only send if the input is not empty
    if (message != "") {
        document.getElementById("chat_text_input").value = ""
        out_conn_text.send(message);
        append_message("local", message)
    }
}

function append_message(name, message) {
    // Find a <table> element with id="message_board":
    var table = document.getElementById("message_board");

    // Create an empty <tr> element and add it to the end of the table:
    var row = table.insertRow(-1);

    // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);

    // Add some text to the new cells:
    cell1.innerHTML = name;
    cell2.innerHTML = message;
}

function changeres(h, w){
    let x = "repeat(auto-fill," + w + "px)";
    console.log(x);
    document.getElementById('video-grid').style.gridTemplateColumns = x;
    document.getElementById('video-grid').style.gridAutoRows = h;
    
}