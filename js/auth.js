
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const errorMessage = document.getElementById("loginError");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const createUser = document.getElementById("createUser");
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const passwords = JSON.parse(localStorage.getItem("passwords")) || [];
    let userFound = false;
    
    if (localStorage.getItem("isLoggedIn") === "true") {
        window.location.href = "../html/home.html";
    }

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        errorMessage.style.display = "none";
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
    
        for (let i = 0; i < users.length; i++) {
            if (users[i] === username) {
                userFound = true;
                if (passwords[i] === password) {
                    errorMessage.style.display = "none";
                    usernameInput.classList.remove("input-error");
                    passwordInput.classList.remove("input-error");
                    
                    // Set current user and login status
                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem("currentUser", username);
                    
                    // Initialize user data if not exists
                    if (!localStorage.getItem(`user_${username}`)) {
                        localStorage.setItem(`user_${username}`, JSON.stringify({
                            lastSearch: null,
                            searchHistory: []
                        }));
                    }
                    
                    window.location.href = "../html/home.html";
                } else {
                    passwordInput.classList.add("input-error");
                    errorMessage.textContent = "Wrong password. Please try again.";
                    errorMessage.style.display = "block";
                }
                break;
            }
        }
        
        if (!userFound) {
            usernameInput.classList.add("input-error");
            errorMessage.textContent = "Username not found!";
            errorMessage.style.display = "block";
            passwordInput.value = "";
            usernameInput.focus();
        }
    });

    createUser.addEventListener("click", () => {
        window.location.href = "../index.html";
    });
});