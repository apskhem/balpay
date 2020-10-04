import { db } from "./__main__.js";
export class Form {
    static AlertInputError(input) {
        input.focus();
        input.classList.add("input-error");
    }
    static Init() {
        this.usernameInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                !this.usernameInput.value ? this.AlertInputError(this.usernameInput) : this.passwordInput.focus();
            }
            this.usernameInput.classList.remove("input-error");
        });
        this.passwordInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                !this.passwordInput.value ? this.AlertInputError(this.passwordInput) : this.signInProceedBtn.click();
            }
            this.passwordInput.classList.remove("input-error");
        });
        this.gotoForgotPasswordBtn.addEventListener("click", () => {
        });
        this.gotoSignUpBtn.addEventListener("click", () => {
            this.signUpSection.hidden = false;
            this.signInSection.hidden = true;
            this.forgotPasswordSection.hidden = true;
        });
        this.gotoSignInBtn.addEventListener("click", () => {
            this.signUpSection.hidden = true;
            this.signInSection.hidden = false;
            this.forgotPasswordSection.hidden = true;
        });
        this.signInProceedBtn.addEventListener("click", () => {
            if (this.usernameInput.disabled || this.passwordInput.disabled)
                return;
            if (!this.usernameInput.value) {
                this.AlertInputError(this.usernameInput);
            }
            else if (!this.passwordInput.value) {
                this.AlertInputError(this.passwordInput);
            }
            else {
                this.signInProceedBtn.textContent = "Processing Request...";
                this.usernameInput.disabled = true;
                this.passwordInput.disabled = true;
                db.Request("SIGNIN", {
                    "userid": this.usernameInput.value,
                    "password": this.passwordInput.value
                });
            }
        });
        this.signUpProceedBtn.addEventListener("click", () => {
            if (!this.signUpFullNameInput.value)
                this.AlertInputError(this.signUpFullNameInput);
            else if (!this.signUpUsernameInput.value)
                this.AlertInputError(this.signUpUsernameInput);
            else if (!this.signUpPasswordInput.value)
                this.AlertInputError(this.signUpPasswordInput);
            else if (!this.signUpEmailInput.value)
                this.AlertInputError(this.signUpEmailInput);
            else {
                this.signUpProceedBtn.textContent = "Processing Request...";
                db.Request("SIGNUP", {
                    "userid": this.signUpUsernameInput.value,
                    "password": this.signUpPasswordInput.value,
                    "fullname": this.signUpFullNameInput.value,
                    "email": this.signUpEmailInput.value,
                    "setting": this.signUpCurrencyInput.value || "THB"
                });
            }
        });
    }
    SetActiveSection(section) {
        switch (section) {
            case "singin":
                ;
                break;
            case "singup":
                ;
                break;
            case "forgotpassword":
                ;
                break;
        }
    }
    static get active() {
        return document.body.contains(this.pane);
    }
    static set active(value) {
        value
            ? document.body.appendChild(this.pane)
            : this.pane.remove();
    }
}
Form.pane = document.getElementById("form-module");
Form.usernameInput = document.getElementById("signin-userid");
Form.passwordInput = document.getElementById("signin-password");
Form.signUpFullNameInput = document.getElementById("signup-fullname");
Form.signUpUsernameInput = document.getElementById("signup-userid");
Form.signUpPasswordInput = document.getElementById("signup-password");
Form.signUpEmailInput = document.getElementById("signup-email");
Form.signUpCurrencyInput = document.getElementById("signup-currency");
Form.signInSection = document.getElementById("signin-form");
Form.signUpSection = document.getElementById("signup-form");
Form.forgotPasswordSection = document.getElementById("forgotmypassword-form");
Form.gotoSignUpBtn = document.getElementById("goto-signup-form-button");
Form.gotoSignInBtn = document.getElementById("goto-signin-form-button");
Form.gotoForgotPasswordBtn = document.getElementById("goto-forget-password-form-button");
Form.signInProceedBtn = document.getElementById("signin-button");
Form.signUpProceedBtn = document.getElementById("signup-button");
