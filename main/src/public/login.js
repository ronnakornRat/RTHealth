CLIENT_ID = "1044675055259-dtg2j9c75uuapbu73qukltu25ptuirql"

function onSignIn(googleUser) {
    console.log('google sign in');
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.

    var id_token = googleUser.getAuthResponse().id_token;
    var user_name = profile.getName()
    console.log('token: ' + id_token);
    // send id_token to backend
    const database_url = 'https://ec601-database.herokuapp.com/' // << change database URI here
    // https POST, for now
    var uri = encodeURI(database_url + '/users/' + user_name + '/login'); // << change database URI here

    // xhr.open('POST', uri); 
    // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    // xhr.onload = function () {
    //     console.log('Signed in as: ' + xhr.responseText);
    // };
    // xhr.send('idtoken=' + id_token);

    // using ajax
    $.ajax({
        type: 'POST',
        crossDomain: true,
        dataType: 'json',
        data: {idtoken : id_token},
        url: uri,
        success: function (response) {
            console.log('response: ' + JSON.stringify(response))
            console.log('data: ' + response.data)
            console.log('status: ' + response.status)
            if(response.status === 'ok') {
                // store google user_id in local
                localStorage.setItem("g_user_id", response.data);
                window.location.href = "/"
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
