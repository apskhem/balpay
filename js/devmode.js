let isDevmode = false;

window.onload = function Devmode() {
    if (!isDevmode) return;
    ID("form").style.display = "none";

    user = "apskhem";
    TN("title")[0].textContent = "Balpay - Devmode";
    ID("fullname").textContent = "Devmode";

    Database.GetUserRecordData();

    ID("signin-userid").disabled = true;
    ID("signin-password").disabled = true;
    TN("main")[0].style.display = "block";
    TN("footer")[0].style.display = "block";
    ID("form").style.display = "none";
}