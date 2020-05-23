class Form {
    static ShootInputError(inputChannel) {
        document.getElementById(inputChannel).focus();
        document.getElementById(inputChannel).style.boxShadow = "0 0 6px 0px #EC7063";
        document.getElementById(inputChannel).style.border = "1px solid #EC7063";
    }

    static DisplaySignUp() {
        document.getElementById("signup-form").hidden = false;
        document.getElementById("signin-form").hidden = true;
        document.getElementById("forgotmypassword-form").hidden = true;
    }
    
    static DisplaySignIn() {
        document.getElementById("signup-form").hidden = true;
        document.getElementById("signin-form").hidden = false;
        document.getElementById("forgotmypassword-form").hidden = true;
    }

    static DisplayForgotPassword() {

    }

    static SignInCheck() {
        if (document.getElementById("signin-userid").disabled || document.getElementById("signin-password").disabled) return;

        if (document.getElementById("signin-userid").value === "") {
            this.ShootInputError("signin-userid");
        }
        else if (document.getElementById("signin-password").value === "") {
            this.ShootInputError("signin-password");
        }
        else {
            document.getElementsByClassName("comfirm-button")[0].textContent = "Loading...";
            document.getElementById("signin-userid").disabled = true;
            document.getElementById("signin-password").disabled = true;
    
            Database.GetUserSettingsData();
        }
    }

    static SignUpCheck() {

    }
};

// form interface
document.getElementById("signin-userid").addEventListener("keydown", function(e) {
    if (e.keyCode === 13) {
        document.getElementById(this.id).value === "" ? Form.ShootInputError(this.id) : document.getElementById("signin-password").focus();
    }
    
    document.getElementById(this.id).style.boxShadow = null;
    document.getElementById(this.id).style.border = "1px solid #5D6D7E";
});

document.getElementById("signin-password").addEventListener("keydown", function(e) {
    if (e.keyCode === 13) {
        document.getElementById(this.id).value === "" ? Form.ShootInputError(this.id) : document.getElementsByClassName("comfirm-button")[0].click();
    }
    
    document.getElementById(this.id).style.boxShadow = null;
    document.getElementById(this.id).style.border = "1px solid #5D6D7E";
});