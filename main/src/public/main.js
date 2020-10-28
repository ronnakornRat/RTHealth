const socket = io('/')

function get_room_name() {
    var room_name = document.getElementById("room_text_input").value;
    // alert("room = " + room_name)
    if (room_name === "") {
        alert("Please enter a room name")
    }

    socket.emit('check', room_name)
    socket.on('returncheck', num_client => {
        if(num_client >= 2) {
            alert("room full")
            // reloading the page
            window.location.href = "/"
        }
        else {
            window.location.href = "/" + room_name
        }
    })


    
}


