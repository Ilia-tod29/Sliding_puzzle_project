'use strict'
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-auth.js";
//Configuring firebase
const firebaseConfig = {
  apiKey: "AIzaSyDqFZTT263jLPYflBN0VnsWtIJjN5W4v2s",
  authDomain: "sliding-game-fmi.firebaseapp.com",
  projectId: "sliding-game-fmi",
  storageBucket: "sliding-game-fmi.appspot.com",
  messagingSenderId: "889143574175",
  appId: "1:889143574175:web:5332a2e2dbbb6007f9acaa",
  measurementId: "G-YCLHHY6VTR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();

//Initial elements
const authSwitchLinks = document.querySelectorAll(".switch");
const authModals = document.querySelectorAll(".form-wrapper .modal");
// const authWrapper = document.querySelector(".form-wrapper");
const signUpForm = document.querySelector(".sign-up");
const signInForm = document.querySelector(".sign-in");
// Toggle auth modules
authSwitchLinks.forEach(link => {
  link.addEventListener('click', () => {
    authModals.forEach(modal => modal.classList.toggle("active"));
  });
});

//Sign up form
signUpForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const email = signUpForm.email.value;
  const passwordCmp = signUpForm.password;

  if(passwordCmp[0].value != passwordCmp[1].value) {
    signUpForm.querySelector('.error').textContent = "Passwords do not match";
    return;
  }

  const password = passwordCmp[0].value;

  //Creating a new user
  createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    signUpForm.reset();
  })
  .catch((error) => {
    let errorMessage = error.message.slice(10);
    signUpForm.querySelector('.error').textContent = errorMessage;
  });
});


//Sign in form
signInForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const email = signInForm.email.value;
  const password = signInForm.password.value;

  //Signing in
  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in     
    signInForm.reset();
  })
  .catch((error) => {
    // Error
    let errorMessage = error.message.slice(10);
    signInForm.querySelector('.error').textContent = errorMessage;
  });
});


// Auth listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "game.html";
  }
});
