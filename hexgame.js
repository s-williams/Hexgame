let pangramLetters = [];
let middleLetter = "";

let allHexagons = [];
let outerHexagons = [];
let centralHexagon = null;

let entryContent = null;
let messageBox = null;
let foundWords = null;
let points = null;
let wordCount = null;
let yesterdayPangram = null;

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
    wordCount = document.querySelector("#wordCount");
    yesterdayPangram = document.querySelector("#yesterdayPangram");

    document.querySelector("#deleteButton").addEventListener("click", deleteLetter);
    document.querySelector("#shuffleButton").addEventListener("click", shuffle);
    document.querySelector("#enterButton").addEventListener("click", enter);
    yesterdayPangram.addEventListener("click", () => { yesterdayPangram.classList.add("revealed")});

    document.addEventListener("keydown", typeLetter);

    allHexagons.forEach((ele) => {
        ele.addEventListener("click", addLetter);
    });

    // Used to get yesterday's pangram
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayRng = new Math.seedrandom("" + yesterday.getFullYear() + yesterday.getMonth() + yesterday.getDate());

    // seed the Math random function based on the current date
    // https://github.com/davidbau/seedrandom
    const today = new Date();
    Math.seedrandom("" + today.getFullYear() + today.getMonth() + today.getDate());

    // set up game
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("pangram")) {
        if (urlParams.has("mid")) {
            setUpWithWord(urlParams.get("pangram").toUpperCase(), urlParams.get("mid").toUpperCase());
        } else {
            setUpWithWord(urlParams.get("pangram").toUpperCase());
        }
    } else {
        fetch("sevenletterwords.txt").then((response) => {
            return response.text().then((file) => {
                const lines = file.split(/\n/g);
                const count = (lines || []).length;

                const noYesterday = Math.floor(yesterdayRng() * count);
                const pangramYesterday = lines[noYesterday].trim().toUpperCase();
                yesterdayPangram.innerText = pangramYesterday;

                const no = Math.floor(Math.random() * count);
                const pangram = lines[no].trim();

                console.log(pangram);

                setUpWithWord(pangram);
            });
        });
    }

    fetch("dictionary.txt").then((response) => {
        return response.text().then((file) => {
            dictionary = file.split(/\r\n/g);
            if (urlParams.has("pangram")) {
                dictionary.push(urlParams.get("pangram"));
            }
        });
    });
};

/**
 * Takes a seven letter word and processes it to set up the game
 */
const setUpWithWord = (pangram, mid) => {
    // remove duplicate letters
    for (let i = 0; i < pangram.length; i++) {
        if (!pangramLetters.includes(pangram[i].toUpperCase())) {
            pangramLetters.push(pangram[i].toUpperCase());
        }
    }
    shuffleArray(pangramLetters);
    if (mid && pangramLetters.includes(mid)) {
        middleLetter = mid;
    } else {
        middleLetter = pangramLetters[Math.floor(Math.random() * pangramLetters.length)];
    }
    pangramLetters.splice(pangramLetters.indexOf(middleLetter), 1);

    // for each unique letter in word, assign to hex
    for (let i = 0; i < pangramLetters.length; i++) {
        outerHexagons[i].innerText = pangramLetters[i];
    }
    centralHexagon.innerText = middleLetter;
}

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
            incorrectWord("Too short");
        }
        if (isValid && !word.includes(middleLetter)) {
            isValid = false;
            incorrectWord("Missing centre letter");
        }
        if (isValid && !dictionary.includes(word.toLowerCase())) {
            isValid = false;
            incorrectWord("Not in dictionary");
        }
        if (isValid && foundWordsList.includes(word)) {
            isValid = false;
            incorrectWord("Already found");
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
    foundWordsList.push(word);
    foundWordsList.sort()
    foundWords.innerText = foundWordsList.join("\n");

    //check if pangram
    let isPangram = true;
    for (let i = 0; i < pangramLetters.length; i++) {
        if (!word.includes(pangramLetters[i])) {
            isPangram = false;
            break;
        }
    }

    //add points
    let currentPoints = parseInt(points.innerText);
    let newPoints = word.length + 1;
    if (word.length === 4) newPoints = 1;
    if (isPangram) newPoints += 7;
    points.innerText = currentPoints + newPoints;

    //update number of words found
    wordCount.innerText = foundWordsList.length;

    //show positive message
    if (isPangram) {
        showGoodMessage("Pangram!");
    } else if (word.length === 4) {
        showGoodMessage("Good!");
    } else if (word.length < 7) {
        showGoodMessage("Great!");
    } else {
        showGoodMessage("Amazing!");
    }

    //reset entry
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
 * Show a message without the shake
 * @param {} message 
 */
const showGoodMessage = (message) => {
    messageBox.innerText = message;
    messageBox.classList.add("valid");
    setTimeout(() => {
        messageBox.innerText = "";
       messageBox.classList.remove("valid");
    }, 1000);
}

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