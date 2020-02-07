// -- DEVMODE -- //
let isDevmode = false;

window.onload = () => {
    if (!isDevmode) return;

    id("signin-userid").value = "apskhem";
    id("signin-password").value = "0821866840a";
    id("signin-button").click();
}

class Form {
    static ShootInputError(inputChannel) {
        id(inputChannel).focus();
        id(inputChannel).style.boxShadow = "0 0 6px 0px #EC7063";
        id(inputChannel).style.border = "1px solid #EC7063";
    }

    static DisplaySignUp() {
        id("signup-form").style.display = "block";
        id("signin-form").style.display = "none";
        id("forgotmypassword-form").style.display = "none";
    }
    
    static DisplaySignIn() {
        id("signup-form").style.display = "none";
        id("signin-form").style.display = "block";
        id("forgotmypassword-form").style.display = "none";
    }

    static DisplayForgotPassword() {

    }

    static SignInCheck() {
        if (id("signin-userid").disabled || id("signin-password").disabled) return;

        if (id("signin-userid").value === "") {
            this.ShootInputError("signin-userid");
        }
        else if (id("signin-password").value === "") {
            this.ShootInputError("signin-password");
        }
        else {
            cl("comfirm-button")[0].textContent = "Loading...";
            id("signin-userid").disabled = true;
            id("signin-password").disabled = true;
    
            Database.GetUserSettingsData();
        }
    }

    static SignUpCheck() {

    }
}

// form interface
id("signin-userid").onkeydown = function(e) {
    if (e.keyCode === 13) {
        id(this.id).value === "" ? Form.ShootInputError(this.id) : id("signin-password").focus();
    }
    
    id(this.id).style.boxShadow = "";
    id(this.id).style.border = "1px solid #5D6D7E";
}

id("signin-password").onkeydown = function(e) {
    if (e.keyCode === 13) {
        id(this.id).value === "" ? Form.ShootInputError(this.id) : cl("comfirm-button")[0].click();
    }
    
    id(this.id).style.boxShadow = "";
    id(this.id).style.border = "1px solid #5D6D7E";
}