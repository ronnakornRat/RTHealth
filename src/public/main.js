const socket = io('/')

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
    // check for g_user_id


    console.log("verifying token for user ")
    const database_url = 'https://ec601-database.herokuapp.com/'
    const uri = database_url + '/google/' + g_user_id + '/verify'
    $.ajax({
        type: 'GET',
        crossDomain: true,
        dataType: 'json',
        url: uri,
        success: function (response) {
            console.log('response: ' + JSON.stringify(response))
            console.log('data: ' + response.data)
            console.log('status: ' + response.status)
            // store google user_id in local
            localStorage.setItem("g_user_id", response.data);
            if(response.status != 'ok') {
                
                
                // window.location.href = "/login"
            }

            
        }

        
    })

}

function signOut() {
    
    console.log('google logout');
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });
}

$(window).on('load', function(){
    console.log("ready")
    gapi.load('auth2', function() {
        gapi.auth2.init();
        
        var valid = gapi.auth2.getAuthInstance().isSignedIn.get()
        if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
            // if user is not signed in
            console.log("user not signed in " + valid)
            // window.location.href = "/login"
        }

        verify_token()
      });
  });
  

