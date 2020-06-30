class Scrap {
    constructor(data) {
        for (const d in data) {
            switch (d) {
                case "data": {

                } break;
                case "methods": {

                } break;
                case "html": {

                } break;
            }
        }
    }
}

const test = new Scrap({
    data() {
        return {
            
        }
    },
    methods: {

    },
    html: {
        "div .form-container": {
            "form": {
                "section #signin-form": {
                    "li .head-text": {
                        textContent: "SIGN IN TO BALPAY"
                    },
                    "label": {
                        for: "signin-userid",
                        textContent: "Enter Username or Email"
                    },
                    "input #signin-userid": {
                        type: "text",
                        placeholder: "Username or Email",
                        maxlength: 50,
                        on: {
                            "keypress.enter": (e, el) => {

                            }
                        }
                    },
                    "label": {
                        for: "signin-userid",
                        textContent: "Enter Password"
                    },
                    "input #signin-password": {
                        type: "password",
                        placeholder: "Password",
                        maxlength: 50,
                        on: {
                            "keypress.enter": (e, el) => {

                            }
                        }
                    },
                    "div .form-options": {
                        "span #goto-forget-password-form-button": {
                            textContent: "Forgot Password"
                        },
                        "span #goto-signup-form-button": {
                            textContent: "Sign Up"
                        }
                    },
                    "div #signin-button .comfirm-button": {
                        textContent: "Sign In"
                    }
                },
                "section #signup-form": {
                    hidden: true,
                    "li .head-text": {
                        class: "SIGN UP"
                    }
                }
            }
        },
        "body": {
            "nav #user-panel": {
                "aside": {
                    "i #user-icon .fas .fa-user-circle": null,
                    "span #fullname": {
                        textContent: this.name || "%fullname%"
                    }
                },
                "aside": {
                    "div #today-date": null
                }
            }
        },
        "footer": {
    
        }
    }
})