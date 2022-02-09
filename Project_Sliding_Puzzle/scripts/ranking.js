'use strict'
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-auth.js";
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
const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();

//Initial elements
const x3List = document.querySelector(".rank3x3");
const x4List = document.querySelector(".rank4x4");
const x5List = document.querySelector(".rank5x5");
const signOutBtn = document.querySelector(".sign-out-btn");
const backToGameBtn = document.querySelector(".back-to-game");
let currentUser;
let results3x3 = [];
let results4x4 = [];
let results5x5 = [];

//Adding event listener for back to game btn which redirects the user to the game
backToGameBtn.addEventListener("click", () => {
    window.location.href = "game.html";
});

//Sign out
signOutBtn.addEventListener('click', () => {
  signOut(auth).then(() => {
    console.log("Signed out successfully!");
  }).catch((error) => {
    window.alert(error.message);
  });
});

// Auth listener
onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      document.getElementById("username").innerHTML = `User: ${user.email}`;
    } else {
        window.location.href = "auth.html";
    }
  });

//Getting the information from firebase and filling the array for each level
const querySnapshot = await getDocs(collection(db, "scores"));
querySnapshot.forEach((doc) => {
    const username = doc.data().user;
    const x3 = doc.data().x3;
    const x4 = doc.data().x4;
    const x5 = doc.data().x5;
    results3x3.push({
        username: username,
        score: x3
    });
    results4x4.push({
        username: username,
        score: x4
    });
    results5x5.push({
        username: username,
        score: x5
    });
});

//Function used to sort the elements in each array
const sortingFunction = (fst, scnd) => {
    let resA = fst.score;
    let resB = scnd.score;
    const allZerosResA = (resA.hours === 0 && resA.minuets === 0 && resA.seconds === 0 && resA.tens === 0); 
    const allZerosResB = (resB.hours === 0 && resB.minuets === 0 && resB.seconds === 0 && resB.tens === 0);

    if(allZerosResA) {
        return 1;
    }
    if(allZerosResB) {
        return -1;
    }
    if(resA.hours === resB.hours && resA.minuets === resB.minuets && resA.seconds === resB.seconds && resA.tens != resB.tens) {
        return resA.tens - resB.tens;
    }
    if(resA.hours === resB.hours && resA.minuets === resB.minuets && resA.seconds != resB.seconds) {
        return resA.seconds - resB.seconds;
    }
    if(resA.hours === resB.hours && resA.minuets != resB.minuets) {
        return resA.minuets - resB.minuets;
    }
    if(resA.hours != resB.hours) {
        return resA.hours - resB.hours;
    }
}

//Sorting the data
const sortData = () => {
    results3x3.sort(sortingFunction);
    results4x4.sort(sortingFunction);
    results5x5.sort(sortingFunction);
}
sortData();

//Render scores
const rederElements = (element, index, destination) => {
    const username = element.username;
    const score = element.score;
    const newElement = document.createElement("li");
    newElement.innerHTML = `<p><span style="font-weight: bold; font-size: 20px;">${index + 1}. &nbsp</span>${username} &nbsp${(currentUser.email === username) ? "YOU" : ""}</p>
                    <p>${((score.hours === 0) ? "00" : score.hours)}:
                        ${((score.minuets === 0) ? "00" : score.minuets)}:
                        ${((score.seconds === 0) ? "00" : score.seconds)}:
                        ${((score.tens === 0) ? "00" : score.tens)}
                    </p>`;
    newElement.classList.add("user-score-li");
    if(currentUser.email === username) {
        newElement.classList.add("current-user");
    }
    destination.appendChild(newElement);
}
results3x3.forEach((element, index) => {
    rederElements(element, index, x3List);
});
results4x4.forEach((element, index) => {
    rederElements(element, index, x4List);
});
results5x5.forEach((element, index) => {
    rederElements(element, index, x5List);
});