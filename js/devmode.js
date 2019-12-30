let isDevmode = false;

function Devmode() {
    if (!isDevmode) return;
    ID("form").style.display = "none";

    user = "apskhem";
    ReadReq();

    ID("signin-userid").disabled = true;
    ID("signin-password").disabled = true;
    TN("main")[0].style.display = "block";
    TN("footer")[0].style.display = "block";
    ID("form").style.display = "none";

    ID("fullname").textContent = "Devmode";
}
Devmode();