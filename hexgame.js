let pangramLetters = [];
let middleLetter = "";

let allHexagons = [];
let outerHexagons = [];
let centralHexagon = null;

let entryContent = null;
let messageBox = null;
let foundWords = null;
let points = null;

let dictionary = [];
let foundWordsList = [];
/**
 * sets up game
 */
const start = () => {
    // set up controls - assign buttons to functions
    allHexagons = document.querySelectorAll(".outer-hexagon, .central-hexagon");
    outerHexagons = document.querySelectorAll(".outer-hexagon");
    centralHexagon = document.querySelectorAll(".central-hexagon")[0];
    entryContent = document.querySelector("#entryContent");
    messageBox = document.querySelector("#messageBox");
    foundWords = document.querySelector("#foundWords");
    points = document.querySelector("#points");

    document.querySelector("#deleteButton").addEventListener("click", deleteLetter);
    document.querySelector("#shuffleButton").addEventListener("click", shuffle);
    document.querySelector("#enterButton").addEventListener("click", enter);
    document.addEventListener("keydown", typeLetter);

    allHexagons.forEach((ele) => {
        ele.addEventListener("click", addLetter);
    });

    // seed the Math random function based on the current date
    // https://github.com/davidbau/seedrandom
    const today = new Date();
    Math.seedrandom("" + today.getFullYear() + today.getMonth() + today.getDate());

    // set up game
    fetch("sevenletterwords.txt").then((response) => {
        return response.text().then((file) => {
            const lines = file.split(/\n/g);
            const count = (lines || []).length;

            const no = Math.floor(Math.random() * count);
            const pangram = lines[no];

            console.log(pangram);

            // remove duplicate letters
            for (let i = 0; i < pangram.length - 1; i++) {
                if (!pangramLetters.includes(pangram[i].toUpperCase())) {
                    pangramLetters.push(pangram[i].toUpperCase());
                }
            }
            shuffleArray(pangramLetters);
            middleLetter = pangramLetters[Math.floor(Math.random() * pangramLetters.length)];
            pangramLetters.splice(pangramLetters.indexOf(middleLetter), 1);

            // for each unique letter in word, assign to hex
            for (let i = 0; i < pangramLetters.length; i++) {
                outerHexagons[i].innerText = pangramLetters[i];
            }
            centralHexagon.innerText = middleLetter;
        });
    });

    fetch("dictionary.txt").then((response) => {
        return response.text().then((file) => {
            dictionary = file.split(/\r\n/g);
        });
    });
};

/**
 * Shuffles the letters around in the outer hexagons
 */
const shuffle = () => {
    shuffleArray(pangramLetters);
    for (let i = 0; i < pangramLetters.length; i++) {
        outerHexagons[i].innerText = pangramLetters[i];
    }
};

/**
 * Adds a letter to the entered word when pressing button
 * @param {*} event button press event
 */
const addLetter = (event) => {
    const letter = event.currentTarget.innerText;
    entryContent.innerText += letter;
    validateLetters();
};

/**
 * Adds a letter to the entered word when typing
 * @param {*} event type event
 */
const typeLetter = (event) => {
    if (!event.metaKey) {
        event.preventDefault();
        if (event.code === "Backspace" || event.code === "Delete") deleteLetter();
        else if (event.code === "Enter" || event.code === "NumpadEnter") enter();
        else if (event.code === "Space") shuffle();
        else if (event.key.length === 1) {
            entryContent.innerText += event.key.toUpperCase();
            validateLetters();
        }
    }
};

/**
 * Deletes a letter from the entered word
 */
const deleteLetter = () => {
    if (entryContent.innerText.length > 0) {
        entryContent.innerText = entryContent.innerText.slice(0, -1);
    }
    validateLetters();
};

/**
 * Adds valid or invalid class to entered word field
 */
const validateLetters = () => {
    entryContent.classList.remove("valid");
    entryContent.classList.remove("invalid");
    if (entryContent.innerText.includes(middleLetter)) {
        entryContent.classList.add("valid");
    } else {
        entryContent.classList.add("invalid");
    }
};

/**
 * Event listener to get word from entry content and then check if word is valid and process valid/invalid words.
 */
const enter = () => {
    //get word
    const word = entryContent.innerText;
    let isValid = true;

    //check if word is valid
    if (word.length > 0) {
        if (isValid && word.length < 4) {
            isValid = false;
            incorrectWord("Not long enough!");
        }
        if (isValid && !word.includes(middleLetter)) {
            isValid = false;
            incorrectWord("No middle letter!");
        }
        if (isValid && !dictionary.includes(word.toLowerCase())) {
            isValid = false;
            incorrectWord("Not in dictionary!");
        }
        if (isValid && foundWordsList.includes(word)) {
            isValid = false;
            incorrectWord("Already found!");
        }
        if (isValid) {
            for (let i = 0; i < word.length; i++) {
                if (!(pangramLetters.includes(word[i]) || word[i] === middleLetter)) {
                    isValid = false;
                    incorrectWord("Invalid letters!");
                    break;
                }
            }
        }
        if (isValid) {
            console.log("correct word");
            correctWord(word);
        }
    }


};

/**
 * Processes the entry when the word is a valid word
 * @param {*} word 
 */
const correctWord = (word) => {
    //add word to list
    foundWords.innerText += word + "\n";
    foundWordsList.push(word);

    //add points
    let currentPoints = parseInt(points.innerText);
    let newPoints = word.length + 1;
    if (word.length === 4) newPoints = 1;
    points.innerText = currentPoints + newPoints;

    entryContent.innerText = "";
};

/**
 * Processes the entry when the word is an invalid word
 * @param {*} error 
 */
const incorrectWord = (error) => {
    entryContent.classList.add("shake");
    messageBox.innerText = error;
    entryContent.addEventListener("animationend", () => {
        entryContent.innerText = "";
        messageBox.innerText = "";
        entryContent.classList.remove("shake");
    });
};

/**
 * Helper function to shuffle an array
 * https://stackoverflow.com/a/12646864/8182370
 * @param {*} array array to shuffle
 */
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

window.onload = start;