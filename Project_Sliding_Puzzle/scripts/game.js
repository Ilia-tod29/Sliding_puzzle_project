'use strict' 
import * as Timer from "./timer.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-auth.js";
import { getFirestore, setDoc, updateDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-firestore.js";
 
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
const board = document.getElementsByClassName("sliding-puzzle")[0];
const puzzleHeight = document.querySelector(".sliding-puzzle").clientHeight;
const shuffleEl = document.getElementById("shuffle");
const giveUp = document.getElementById("give-up");
const signOutBtn = document.querySelector(".sign-out-btn");
const rankingBtn = document.querySelector(".ranking");
let size;
let baseDistance;
let parts = [];
let shuffleTimeouts = [];
let lastShuffled;
let currentUser;

//Calculating the row and column of a part by it's position
const getRow = (pos) => {
  return Math.ceil(pos / size);
}
const getCol = (pos) => {
  const col = pos % size;
  if(col === 0) {
    return size;
  }
  return col;
}

//Event listener for redirecting to ranking page
rankingBtn.addEventListener("click", () => {
  window.location.href = "ranking.html";
});

//Function for setting the event listener to the play btn when it is visible(calling it right after because it is visible on the page load)
const setupPlayEventlistener = () => {
  const playBtn = document.getElementsByClassName("play")[0];
  const winLabel = document.getElementsByClassName("win-label")[0];
  const levels = document.getElementsByClassName("level")[0];
  const separator = [...document.getElementsByClassName("separator")];
  const level = [...document.getElementsByName("options")];

  playBtn.addEventListener("click", () => {
    playBtn.innerHTML = "Play Again";
    //Hiding all the unnessecery elements and showing all we need
    shuffleEl.classList.remove("hidden");
    giveUp.classList.remove("hidden");
    separator.forEach(element => element.classList.remove("hidden"));
    playBtn.classList.add("hidden");
    winLabel.classList.add("hidden");
    levels.classList.add("hidden");
    //Deciding the level
    if(level[0].checked) {
      size = 3;
      baseDistance = 33;
    }
    else if(level[1].checked) {
      size = 4;
      baseDistance = 25;
    }
    else if(level[2].checked) {
      size = 5;
      baseDistance = 20;
    }
    //Loading the game
    loadGame();
    //Starting the timer
    Timer.resetTimer();
    Timer.startTimer();
  });
}
setupPlayEventlistener();



// Movement map(returns an array of all parts that can be moved)
const movementMap = (position) => {
  if(size == 3){
    if (position == 1) return [2, 4];
    else if (position == 2) return [1, 3, 5];
    else if (position == 3) return [2, 6];
    else if (position == 4) return [1, 5, 7];
    else if (position == 5) return [2, 4, 6, 8];
    else if (position == 6) return [3, 5, 9];
    else if (position == 7) return [4, 8];
    else if (position == 8) return [5, 7, 9];
    else if (position == 9) return [6, 8];
  }
  if(size == 4) {
    if (position == 1) return [2, 5];
    else if (position == 2) return [1, 3, 6];
    else if (position == 3) return [2, 4, 7];
    else if (position == 4) return [3, 8];
    else if (position == 5) return [1, 6, 9];
    else if (position == 6) return [2, 5, 7, 10];
    else if (position == 7) return [3, 6, 8, 11];
    else if (position == 8) return [4, 7, 12];
    else if (position == 9) return [5, 10, 13];
    else if (position == 10) return [6, 9, 11, 14];
    else if (position == 11) return [7, 10, 12, 15];
    else if (position == 12) return [8, 11, 16];
    else if (position == 13) return [9, 14];
    else if (position == 14) return [10, 13, 15];
    else if (position == 15) return [11, 14, 16];
    else if (position == 16) return [12, 15];
  }
  if(size == 5) {
    if (position == 1) return [2, 6];
    else if (position == 2) return [1, 3, 7];
    else if (position == 3) return [2, 4, 8];
    else if (position == 4) return [3, 5, 9];
    else if (position == 5) return [4, 10];
    else if (position == 6) return [1, 7, 11];
    else if (position == 7) return [2, 6, 8, 12];
    else if (position == 8) return [3, 7, 9, 13];
    else if (position == 9) return [4, 8, 10, 14];
    else if (position == 10) return [5, 9, 15];
    else if (position == 11) return [6, 12, 16];
    else if (position == 12) return [7, 11, 13, 17];
    else if (position == 13) return [8, 12, 14, 18];
    else if (position == 14) return [9, 13, 15, 19];
    else if (position == 15) return [10, 14, 20];
    else if (position == 16) return [11, 17, 21];
    else if (position == 17) return [12, 16, 18, 22];
    else if (position == 18) return [13, 17, 19, 23];
    else if (position == 19) return [14, 18, 20, 24];
    else if (position == 20) return [15, 19, 25];
    else if (position == 21) return [16, 22];
    else if (position == 22) return [17, 21, 23];
    else if (position == 23) return [18, 22, 24];
    else if (position == 24) return [19, 23, 25];
    else if (position == 25) return [20, 24];
  }
}

//Function for putting all the elements on the board
const renderPuzzle = () => {
  let partSize;
  //Deciding the right CSS class for the choosen level
  switch(size) {
    case 3: partSize = "size3x3"; break;
    case 4: partSize = "size4x4"; break;
    case 5: partSize = "size5x5"; break;
  }
  for (let i = 0; i < size * size - 1; ++i) {
    board.innerHTML += `
        <li class="part ${partSize}">${parts[i].partNumber}</li>
        `;
  }
}

//Function for calculating the position of a part and aplying the correct CSS
const setup = (part) => {
  let partId = part.innerHTML;
  partId--;
  let translateX = puzzleHeight * (parts[partId].left / 100);
  let translateY = puzzleHeight * (parts[partId].top / 100);
  part.style.webkitTransform = "translateX(" + translateX + "px) " + "translateY(" + translateY + "px)";
}


//Function for updating the database after a win
const updateFirebse = async () => {
  //Getting the data from firebase
  const docRef = doc(db, "scores", currentUser.uid);
  const docSnap = await getDoc(docRef);
  
  //Variables for operations used based on the current level
  let newResults = {};
  let currentUserScoreTens;
  let currentUserScoreSeconds;
  let currentUserScoreMinuets;
  let currentUserScoreHours;
  let shouldUpdate;
  if(size == 3) {
    //Getting the correct Data
    currentUserScoreTens = docSnap.data().x3.tens;
    currentUserScoreSeconds = docSnap.data().x3.seconds;
    currentUserScoreMinuets = docSnap.data().x3.minuets;
    currentUserScoreHours = docSnap.data().x3.hours;
    shouldUpdate = (currentUserScoreHours === Timer.hours && currentUserScoreMinuets === Timer.minuets && currentUserScoreSeconds === Timer.seconds && currentUserScoreTens > Timer.tens)
                          || (currentUserScoreHours === Timer.hours && currentUserScoreMinuets === Timer.minuets && currentUserScoreSeconds > Timer.seconds)
                          || (currentUserScoreHours === Timer.hours && currentUserScoreMinuets > Timer.minuets)
                          || (currentUserScoreHours > Timer.hours)
                          || (currentUserScoreHours === 0 && currentUserScoreMinuets === 0 && currentUserScoreSeconds === 0 && currentUserScoreTens === 0);
    if(shouldUpdate) {
      newResults = {
        user: currentUser.email,
        x3: {
          tens: Timer.tens,
          seconds: Timer.seconds,
          minuets: Timer.minuets,
          hours: Timer.hours
        }
      }
      //Updating firebase if the score is worse than the one on the firebase the newResults obj will be empty
      await updateDoc(docRef, newResults);
    }
  }
  if(size == 4) {
    //Getting the correct Data
    currentUserScoreTens = docSnap.data().x4.tens;
    currentUserScoreSeconds = docSnap.data().x4.seconds;
    currentUserScoreMinuets = docSnap.data().x4.minuets;
    currentUserScoreHours = docSnap.data().x4.hours;
    shouldUpdate = (currentUserScoreHours === Timer.hours && currentUserScoreMinuets === Timer.minuets && currentUserScoreSeconds === Timer.seconds && currentUserScoreTens > Timer.tens)
                          || (currentUserScoreHours === Timer.hours && currentUserScoreMinuets === Timer.minuets && currentUserScoreSeconds > Timer.seconds)
                          || (currentUserScoreHours === Timer.hours && currentUserScoreMinuets > Timer.minuets)
                          || (currentUserScoreHours > Timer.hours)
                          || (currentUserScoreHours === 0 && currentUserScoreMinuets === 0 && currentUserScoreSeconds === 0 && currentUserScoreTens === 0);
    if(shouldUpdate) {
      newResults = {
        user: currentUser.email,
        x4: {
          tens: Timer.tens,
          seconds: Timer.seconds,
          minuets: Timer.minuets,
          hours: Timer.hours
        }
      }
      //Updating firebase if the score is worse than the one on the firebase the newResults obj will be empty
      await updateDoc(docRef, newResults);
    }
  }
  else if(size == 5) {
    //Getting the correct Data
    currentUserScoreTens = docSnap.data().x5.tens;
    currentUserScoreSeconds = docSnap.data().x5.seconds;
    currentUserScoreMinuets = docSnap.data().x5.minuets;
    currentUserScoreHours = docSnap.data().x5.hours;
    shouldUpdate = (currentUserScoreHours === Timer.hours && currentUserScoreMinuets === Timer.minuets && currentUserScoreSeconds === Timer.seconds && currentUserScoreTens > Timer.tens)
                          || (currentUserScoreHours === Timer.hours && currentUserScoreMinuets === Timer.minuets && currentUserScoreSeconds > Timer.seconds)
                          || (currentUserScoreHours === Timer.hours && currentUserScoreMinuets > Timer.minuets)
                          || (currentUserScoreHours > Timer.hours)
                          || (currentUserScoreHours == 0 && currentUserScoreMinuets === 0 && currentUserScoreSeconds === 0 && currentUserScoreTens === 0);
    if(shouldUpdate) {
      newResults = {
        user: currentUser.email,
        x5: {
          tens: Timer.tens,
          seconds: Timer.seconds,
          minuets: Timer.minuets,
          hours: Timer.hours
        }
      }
      //Updating firebase if the score is worse than the one on the firebase the newResults obj will be empty
      await updateDoc(docRef, newResults);
    }
  }
}

//Function for ending the game (win/loose)
const endGame = (isWin) => {
  const partsElements = document.querySelectorAll('.part');
  const winLabel = document.getElementsByClassName("win-label")[0];
  const separator = [...document.getElementsByClassName("separator")];
  const levels = document.getElementsByClassName("level")[0];
  const playBtn = document.getElementsByClassName("play")[0];
  const shuffleEl = document.getElementById("shuffle");
  const giveUpBtn = document.getElementById("give-up");
  //Deciding the label based on the given parameter and doing the proper operations with the timer
  if(isWin) {
    winLabel.innerHTML = "You Win!";
    Timer.stopTimer();
    updateFirebse();
  }
  else {
    winLabel.innerHTML = "You Loose :(";
    Timer.resetTimer();
  }
  //Removing all parts from the board, hiding all the unnessecery elements, showing all we need and setting the event listener to the play btn again after it is visible
  partsElements.forEach(element => element.remove());
  playBtn.classList.remove("hidden");
  levels.classList.remove("hidden");
  shuffleEl.classList.add("hidden");
  giveUpBtn.classList.add("hidden");
  winLabel.classList.remove("hidden");
  separator.forEach(element => element.classList.add("hidden"));
  parts = [];
  setupPlayEventlistener();
}

//Function, triggered on every part movement(checks for a win on evry move)
const winCheck = (event) => {
  movePart(event.target);

  if (checkSolution()) {
    endGame(true);
  }
}

//Function for moving a part to the empty spot(in case it can be moved)
const movePart = (part) => {
  let partNumber = part.innerHTML;
  partNumber--;
  if (!isPartMovable(partNumber)) {
    return;
  }

  // Swap a part with empty one based on calculations and setting the proper CSS to the patr that should be moved
  let emptyTop = parts[size * size - 1].top;
  let emptyLeft = parts[size * size - 1].left;
  let emptyPosition = parts[size * size - 1].position;
  parts[size * size - 1].top = parts[partNumber].top;
  parts[size * size - 1].left = parts[partNumber].left;
  parts[size * size - 1].position = parts[partNumber].position;
  
  let translateX = puzzleHeight * (emptyLeft / 100);
  let translateY = puzzleHeight * (emptyTop / 100);
  part.style.webkitTransform = "translateX(" + translateX + "px) " + "translateY(" + translateY + "px)";
  
  parts[partNumber].top = emptyTop;
  parts[partNumber].left = emptyLeft;
  parts[partNumber].position = emptyPosition;
}

//Function for checking if a part can be moved 
const isPartMovable = (partNumber) => {
  let selectedPart = parts[partNumber];
  let emptyPart = parts[size * size - 1];
  let movableParts = movementMap(emptyPart.position);

  if (movableParts.includes(selectedPart.position)) {
    return true;
  } else {
    return false;
  }
}

//Function that returns true/false based on if the puzzle has been solved
const checkSolution = () => {
  if (parts[size * size - 1].position !== size * size) return false;
  for (let key in parts) {
    if ((key != 0) && (key != size * size - 1)) {
      if (parts[key].position < parts[key - 1].position) return false;
    }
  }

  return true;
}

//Function that shuffles the current parts
const shuffle = () => {
  let shuffleDelay = 100;
  shuffleLoop();

  let shuffleCounter = 0;
  while (shuffleCounter <= size * 10) {
    shuffleDelay += 100;
    shuffleTimeouts.push(setTimeout(shuffleLoop, shuffleDelay));
    shuffleCounter++;
  }
}

//Function that moves a random part of the movable ones
//Moving a part only if it wasn't moved the a step before(in the shuffle process)
//Otherwise repeats itsef untill randomly it choses a movable part that wasn't moved a step before(in the shuffle process)
const shuffleLoop = () => {
  let partsElements = document.querySelectorAll('.part');
  let emptyPosition = parts[size * size - 1].position;
  let shuffleParts = movementMap(emptyPosition);
  let partPosition = shuffleParts[Math.floor(Math.random() * shuffleParts.length)];
  let locatedPart;
  let locatedPartNumber;
  for(let i = 0; i < size * size; i++) {
    if (parts[i].position == partPosition) {
      locatedPartNumber = parts[i].partNumber;
      locatedPart = partsElements[locatedPartNumber-1];
    }
  }
  if (lastShuffled != locatedPartNumber) {
    movePart(locatedPart);
    lastShuffled = locatedPartNumber;
  } 
  else {
    shuffleLoop();
  }
}

//Adding event listeners to the shuffle and give-up btn and hiding them right after
shuffleEl.addEventListener('click', shuffle);
giveUp.addEventListener('click', () => {endGame(false)});
shuffleEl.classList.add("hidden");
giveUp.classList.add("hidden");


//Function that loads the game, using all the functions above
const loadGame = async () => {
  //Getting the data from firebase
  const docRef = doc(db, "scores", currentUser.uid);
  const docSnap = await getDoc(docRef);
  //If the user is new the first game creates record on the firebase for all the levels (filled with 0s)
  if(!docSnap.exists()) {
    setDoc(docRef, {
      user: currentUser.email,
      x3: {
        tens: 0,
        seconds: 0,
        minuets: 0,
        hours: 0
      },
      x4: {
        tens: 0,
        seconds: 0,
        minuets: 0,
        hours: 0
      },
      x5: {
        tens: 0,
        seconds: 0,
        minuets: 0,
        hours: 0
      }
    });
  }

  //Filling the parts array with propper info
  for (let index = 1; index < size * size; index++) {
    const row = getRow(index);
    const column = getCol(index);
    parts.push({
      partNumber: index,
      position: index,
      top: baseDistance * (row - 1),
      left: baseDistance * (column - 1)
    })
  }
  parts.push({
    position: size * size,
    top: baseDistance * (size - 1),
    left: baseDistance * (size - 1)
  });
  renderPuzzle();

  //Placed here in oreder to get the elements after rendering them
  const partsElements = document.querySelectorAll('.part');
  for(var i = 0; i < partsElements.length; i++) {
    partsElements[i].addEventListener('click', winCheck);
    setup(partsElements[i]);
  }
  
  //Start shuffle
  shuffle();
}



//Sign out
signOutBtn.addEventListener('click', () => {
  signOut(auth).then(() => {
    console.log("Signed out successfully!");
  }).catch((error) => {
    window.alert(error.message);
  });
});

//Auth listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    document.getElementById("username").innerHTML = `User: ${user.email}`;
  } else {
    if(window.location.href != "http://localhost:5500/auth.html") {
      window.location.href = "auth.html";
    }
  }
});