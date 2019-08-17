// this is signin form
function ShootError(formchannel) {
    ID(formchannel).focus();
    ID(formchannel).style.boxShadow = "0 0 6px -1px red";
}

function EnterID() {
    if (event.keyCode == 13) {
        if (ID("signin-userid").value == "")
            ShootError("signin-userid");
        else
            ID("signin-password").focus();
    }
    else {
        ID("signin-userid").style.boxShadow = "";
    }
}

function EnterPassword() {
    if (event.keyCode == 13) {
        if (ID("signin-password").value == "")
            ShootError("signin-password");
        else
            ID("signin-button").click();
    }
    else {
        ID("signin-userid").style.boxShadow = "";
    }
}

function SignInCheck() {
    if (ID("signin-userid").value == "")
        ShootError("signin-userid");
    else if (ID("signin-password").value == "")
        ShootError("signin-password");
    else {
        ID("signin-troubleshoot").textContent = "Loading...";
        ID("signin-troubleshoot").style.color = "black";
        ID("signin-troubleshoot").style.display = "block";
        ID("signin-userid").disabled = true;
        ID("signin-password").disabled = true;
        ReqSignIn();
    }
}

function ReqSignIn() {

    var req = [
        ["userid", ID("signin-userid").value],
        ["password", ID("signin-password").value]
    ];

    var url = URLQuery(script_url, req, "signin", "SignInResponse");

    var request = jQuery.ajax({
        crossDomain: true,
        url: url,
        method: "GET",
        dataType: "jsonp"
    });
}

function SignInResponse(e) {
    ID("signin-userid").disabled = false;
    ID("signin-password").disabled = false;
    if (e.result == "error") {
        ID("signin-troubleshoot").style.color = "red";
        if (e.error == "id") {
            ShootError("signin-userid");
            ID("signin-troubleshoot").textContent = "User ID didn't exist.";
        }
        if (e.error == "password") {
            ShootError("signin-password");
            ID("signin-troubleshoot").textContent = "Password is incorrect.";
        }
    }
    if (e.result == "pass") {
        user = ID("signin-userid").value;
        ReadReq();
        TN("main")[0].style.display = "block";
        TN("footer")[0].style.display = "block";
        ID("form").style.display = "none";
    }
}

// click into login form
function SignUp() {
    ID("signin-form").style.display = "none";
    ID("signup-form").style.display = "block";
}