var isDevmode = false;

function Devmode() {
    if (!isDevmode) return;
    ID("form").style.display = "none";

    user = "apskhem";
    ReadReq();
    TN("main")[0].style.display = "block";
    TN("footer")[0].style.display = "block";
    ID("form").style.display = "none";

    ID("fullname").textContent = "Devmode";
}
Devmode();