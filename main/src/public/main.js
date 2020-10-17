function get_room_name() {
    var x = document.getElementById("room_text_input").value;
    // alert("room = " + x)
    window.location.href = "/" + x
}