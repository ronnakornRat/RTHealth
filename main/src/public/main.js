const socket = io('/')
$(document).ready(verify_token())

function get_room_name() {
    var room_name = document.getElementById("room_text_input").value;
    // alert("room = " + room_name)
    if (room_name === "") {
        alert("Please enter a room name")
    }

    socket.emit('check', room_name)
    socket.on('returncheck', num_client => {
        if (num_client >= 2) {
            alert("room full")
            // reloading the page
            window.location.href = "/"
        }
        else {
            window.location.href = "/" + room_name
        }
    })
}

function verify_token() {
    g_user_id = localStorage.getItem("g_user_id")
    console.log("verifying otken for user ")
    const database_url = 'http://127.0.0.1:5000/'
    $.ajax({
        type: 'POST',
        // crossDomain: true,
        dataType: 'json',
        data: {idtoken : id_token},
        url: uri,
        success: function (response) {
            console.log('response: ' + JSON.stringify(response))
            console.log('data: ' + response.data)
            console.log('status: ' + response.status)
            if(response.status != 'ok') {
                // store google user_id in local
                localStorage.setItem("g_user_id", response.data);
                window.location.href = "/login"
            }
        }
    })

    // $.get(database_url + '/test', function (data, status) {
    //     alert("Data: " + data + "\nStatus: " + status);
    // });
}
