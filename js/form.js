// -- DEVMODE -- //
let isDevmode = false;

window.onload = () => {
    if (!isDevmode) return;

    id("signin-userid").value = "apskhem";
    id("signin-password").value = "0821866840a";
    id("signin-button").click();
}

// -- SIGNIN FORM -- //
function ShootError(inputChannel) {
    id(inputChannel).focus();
    id(inputChannel).style.boxShadow = "0 0 6px 0px #EC7063";
    id(inputChannel).style.border = "1px solid #EC7063";
}

id("signin-userid").onkeydown = (e) => {
    if (e.keyCode == 13) {
        id("signin-userid").value == "" ? ShootError("signin-userid") : id("signin-password").focus();
    }
    
    id("signin-userid").style.boxShadow = "";
    id("signin-userid").style.border = "1px solid lightgrey";
}

id("signin-password").onkeydown = (e) => {
    if (e.keyCode == 13) {
        id("signin-password").value == "" ? ShootError("signin-password") : id("signin-button").click();
    }
    
    id("signin-userid").style.boxShadow = "";
    id("signin-userid").style.border = "1px solid lightgrey";
}

id("signin-button").onclick = () => {
    if (id("signin-userid").disabled) return;

    if (id("signin-userid").value == "") {
        ShootError("signin-userid");
    }
    else if (id("signin-password").value == "") {
        ShootError("signin-password");
    }
    else {
        id("signin-button").textContent = "Loading...";
        id("signin-userid").disabled = true;
        id("signin-password").disabled = true;

        Database.GetUserSettingsData();
    }
}


// -- LOWER BUTTONS IN FORM -- //
function SignUp() {
    id("signin-form").style.display = "none";
    id("signup-form").style.display = "block";
}

function BackToSignIn() {
    id("signin-form").style.display = "block";
    id("signup-form").style.display = "none";
}