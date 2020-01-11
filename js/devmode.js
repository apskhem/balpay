let isDevmode = false;

window.onload = function Devmode() {
    if (!isDevmode) return;
    id("form").style.display = "none";

    user = "apskhem";
    tn("title")[0].textContent = "Balpay - Devmode";
    id("fullname").textContent = "Devmode";

    Database.GetUserRecordData();

    id("signin-userid").disabled = true;
    id("signin-password").disabled = true;
    tn("main")[0].style.display = "block";
    tn("footer")[0].style.display = "block";
    id("form").style.display = "none";
}