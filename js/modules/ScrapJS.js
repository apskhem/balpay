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
        "header": {
            "div.form-container": {
                "form": {
                    "section#signin-form": {
                        "li.head-text": {
                            textContent: "SIGN IN TO BALPAY"
                        },
                        "label": {
                            for: "signin-userid",
                            textContent: "Enter Username or Email"
                        },
                        "input#signin-userid": {
                            type: "text",
                            placeholder: "Username or Email",
                            maxlength: 50,
                            listeners: {
                                "click": (e, el) => {
    
                                }
                            }
                        },
                        "div.form-options": {
                            "span#goto-forget-password-form-button": {
                                textContent: "Forgot Password"
                            },
                            "span#goto-signup-form-button": {
                                textContent: "Sign Up"
                            }
                        }
                    }
                }
            }
        },
        "body": {
            "nav#user-panel": {
                "aside": {
                    "i#user-icon.fas.fa-user-circle": null,
                    "span#fullname": {
                        textContent: name || "%fullname%"
                    }
                },
                "aside": {
                    "div#today-date": null
                }
            }
        },
        "footer": {
    
        }
    }
})