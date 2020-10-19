function get_room_name() {
    var x = document.getElementById("room_text_input").value;
    // alert("room = " + x)
    if (x === "") {
        alert("Please enter a room name")
    }
    window.location.href = "/" + x
}