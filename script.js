const SubmitSignUp = document.getElementById("submitSignUp");
const submitLoginIn = document.getElementById("submitLoginIn");
const login = document.getElementById("login");
const signup = document.getElementById("signup");

SubmitSignUp.addEventListener("click", function () {
    login.style.display = "none";
    signup.style.display = "block";
})
submitLoginIn.addEventListener("click", function () {
    login.style.display = "block";
    signup.style.display = "none";
})