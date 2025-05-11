import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";




// initialized firebase
const firebaseConfig = {
    apiKey: "AIzaSyC3EhUGavODR6SdTozhA4YJqb1xqloDZlA",
    authDomain: "login-sign-f1555.firebaseapp.com",
    projectId: "login-sign-f1555",
    storageBucket: "login-sign-f1555.firebasestorage.app",
    messagingSenderId: "713788420417",
    appId: "1:713788420417:web:af5315675d3e2f4d3831c0"
};
const app = initializeApp(firebaseConfig);




// Signup
const signUp = document.getElementById("submitSignUp");
signUp.addEventListener("click", (event) => {
    event.preventDefault();

    const signupEmail = document.getElementById("signupEmail").value;
    const signupPassword = document.getElementById("signupPassword").value;
    const signupFirstName = document.getElementById("signupFirstName").value;
    const signupLastName = document.getElementById("signupLastName").value;

    // console.log(signupEmail, signupPassword, signupFirstName, signupLastName);

    const auth = getAuth();
    const db = getFirestore();

    createUserWithEmailAndPassword(auth, signupEmail, signupPassword)
        .then((userCredential) => {
            const user = userCredential.user;
            const userData = {
                email: signupEmail,
                // password : signupPassword,
                firstName: signupFirstName,
                lastName: signupLastName
            };
            alert("Account Created Sucessfully")
            // console.log(user);
            const docRef = doc(db, "users", user.uid);
            setDoc(docRef, userData).then(() => {
                window.location.href = "./login.html"
            }).catch((error) => {
                console.log("getting error writing document", error)
            })
        })
        .catch((error) => {
            // console.log(error.code);
            const errorMessage = error.code
            if (errorMessage == "auth/email-already-in-use") {
                alert("email already existed")
            }
            else {
                alert("unable to create your account please try again")
            }
        });
});





// Login
const submitLoginIn = document.getElementById("submitLoginIn");
submitLoginIn.addEventListener("click", (event) => {
    event.preventDefault();
    const loginEmail = document.getElementById("loginEmail").value;
    const loginPassword = document.getElementById("loginPassword").value;
    const auth = getAuth();
    signInWithEmailAndPassword(auth, loginEmail, loginPassword)
        .then((user) => {
            console.log(user?.user.email);
            alert("Welcome " + user?.user.email);
            const userdata = user.user;
            localStorage.setItem("loggedInUserId", userdata.uid);
            window.location.href = "./homepage1.html";
        })
        .catch((error) => {
            const errorMsg = error.code;
            if (errorMsg == "auth/invalid-credentials") {
                alert("Invalid email/password")
            } else {
                alert("Invalid email/password");
            }
        })
    // Select the logout button
    const logoutButton = document.getElementById('logout');
});


