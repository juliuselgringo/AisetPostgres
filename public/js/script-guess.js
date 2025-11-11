document.addEventListener('DOMContentLoaded', () => {
    const dirtUserInput = document.getElementById('userInput');
    const chatBox = document.getElementById('chatBox');
    const sendButton = document.getElementById('sendButton');
    const displayWordToGuess = document.getElementById('wordToGuess');
    
    const wordToGuessArray = [
        'Sunset', 'Waterfall', 'Forest', 'Lantern', 'Backpack', 'Puzzle', 'Curiosity', 'Nostalgia', 'Courage', 'Baker', 'Librarian', 'Gardener',
        'Hiking', 'Painting', 'Fishing', 'Pancake', 'Avocado', 'Honey', 'Mirror', 'Bridge', 'Whisper'
    ];

    function randomizeWordToGuess(){
        const rndIndex = Math.floor(Math.random()*wordToGuessArray.length);
        const rndWord = wordToGuessArray[rndIndex];
        return rndWord;
    }

    const wordToGuess = randomizeWordToGuess();
    
    const wordDiv = document.createElement('div');
    wordDiv.textContent = wordToGuess;
    wordDiv.className = 'word';
    displayWordToGuess.appendChild(wordDiv);

    sendButton.addEventListener('click', (e) => {
        e.preventDefault();

        const userInput = DOMPurify.sanitize(dirtUserInput);

        fetch({
            method:'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({message: userInput})
        })
        .then(response => response.json())
        .then(data => {
            console.log("succes: ", data)
        })
        .catch((error) => {
            console.log("error fetch: ", error)
        })
    })
})