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

        Database.GetUserSettingsData();
        //Database.GetUserRecordData();
    }
}

// click into login form
function SignUp() {
    ID("signin-form").style.display = "none";
    ID("signup-form").style.display = "block";
}

function BackToSignIn() {
    ID("signin-form").style.display = "block";
    ID("signup-form").style.display = "none";
}