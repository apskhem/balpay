// this is signin form
function ShootError(formchannel) {
    id(formchannel).focus();
    id(formchannel).style.boxShadow = "0 0 6px 0px #EC7063";
    id(formchannel).style.border = "1px solid #EC7063";
}

id("signin-userid").onkeydown = function(e) {
    if (e.keyCode == 13) {
        if (id("signin-userid").value == "")
            ShootError("signin-userid");
        else
            id("signin-password").focus();
    }
    
    id("signin-userid").style.boxShadow = "";
    id("signin-userid").style.border = "1px solid lightgrey";
}

id("signin-password").onkeydown = function(e) {
    if (e.keyCode == 13) {
        if (id("signin-password").value == "")
            ShootError("signin-password");
        else
            id("signin-button").click();
    }
    
    id("signin-userid").style.boxShadow = "";
    id("signin-userid").style.border = "1px solid lightgrey";
}

id("signin-button").onclick = function() {
    if (id("signin-userid").disabled) return;

    if (id("signin-userid").value == "")
    ShootError("signin-userid");
    else if (id("signin-password").value == "")
        ShootError("signin-password");
    else {
        id("signin-button").textContent = "Loading...";
        id("signin-userid").disabled = true;
        id("signin-password").disabled = true;

        Database.GetUserSettingsData();
        //Database.GetUserRecordData();
    }
}


// click into login form
function SignUp() {
    id("signin-form").style.display = "none";
    id("signup-form").style.display = "block";
}

function BackToSignIn() {
    id("signin-form").style.display = "block";
    id("signup-form").style.display = "none";
}