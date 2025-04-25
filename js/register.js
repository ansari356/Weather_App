document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const errorMessage = document.getElementById("loginError");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const createUser = document.getElementById("createUser2");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let passwords = JSON.parse(localStorage.getItem("passwords")) || [];    
    let userFound = false;

    console.log(users, passwords);

    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        usernameInput.classList.remove("input-error");
        passwordInput.classList.remove("input-error");
        confirmPasswordInput.classList.remove("input-error");
        errorMessage.style.display = "none";
        userFound = false;
        console.log(usernameInput.value, passwordInput.value,confirmPasswordInput.value);
        if(users.length === 0){
            if(passwordInput.value === confirmPasswordInput.value){
                users.push(usernameInput.value);
                passwords.push(passwordInput.value);
                console.log(users,passwords);
                localStorage.setItem("users", JSON.stringify(users));
                localStorage.setItem("passwords", JSON.stringify(passwords));
                window.location.href = "../html/login.html";
            }
            else{
                confirmPasswordInput.classList.add("input-error");
                errorMessage.textContent = "Passwords don't match!";
                errorMessage.style.display = "block";
                confirmPasswordInput.value = "";
                confirmPasswordInput.focus();
            }
        }
        else{
        for (i = 0 ; i < users.length ; i++){
            if( users[i] === usernameInput.value){
                usernameInput.classList.add("input-error");
                errorMessage.textContent = "Username already exists. Please try another one";
                errorMessage.style.display = "block";
                userFound = true;
                confirmPasswordInput.value = "";
                passwordInput.value = "";
            }

        }
        if(!userFound){
            if(passwordInput.value === confirmPasswordInput.value){
                users.push(usernameInput.value);
                passwords.push(passwordInput.value);
                console.log(users,passwords);
                localStorage.setItem("users", JSON.stringify(users));
                localStorage.setItem("passwords", JSON.stringify(passwords));
                window.location.href = "../html/login.html";
            }
            else{
                confirmPasswordInput.classList.add("input-error");
                errorMessage.textContent = "Passwords don't match!";
                errorMessage.style.display = "block";
                confirmPasswordInput.value = "";
                confirmPasswordInput.focus();
            }
    }
}
});

createUser.addEventListener("click", () => {
    window.location.href = "../html/login.html";
});

document.getElementById('clearStorageBtn').addEventListener('click', () => {
    localStorage.clear();
    alert(' Done ');
    window.location.reload();
  });
  

});

