document.addEventListener('DOMContentLoaded', () => {
    const dirtUserInput = document.getElementById('userInput');
    const chatBox = document.getElementById('chatBox');
    const sendButton = document.getElementById('sendButton');
    const displayWordToGuess = document.getElementById('wordToGuess');
    
    // Mémoire de la conversation (Option 3)
    let conversationHistory = [];

    // génération du mot à deviner
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

    // affichage du mot
    const wordDiv = document.createElement('div');
    wordDiv.textContent = wordToGuess;
    wordDiv.className = 'word';
    displayWordToGuess.appendChild(wordDiv);

    // Event listener bouton envoyer
    sendButton.addEventListener('click', (e) => {
        e.preventDefault();

        // traitement input
        const userInput = DOMPurify.sanitize(dirtUserInput.value);

        // Affichage du message
        const messageElement = document.createElement("div");
        messageElement.innerHTML = `<strong>You : </strong> <br>${userInput}`;
        messageElement.id = "you";
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;

        // Envoyer le message avec l'historique de conversation
        fetch('api/guess', {
            method:'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({
                message: userInput,
                history: conversationHistory // Envoyer l'historique
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log("succes: ", data)
            const responseChat = marked.parse(data.reply);
            const serverMessageElement = document.createElement("div");
            serverMessageElement.innerHTML = `<strong>Le Chat:</strong> ${responseChat}`;
            serverMessageElement.id = "theCat";
            chatBox.appendChild(serverMessageElement);
            chatBox.scrollTop = chatBox.scrollHeight;
            
            // Mettre à jour l'historique de conversation
            conversationHistory.push(
                { role: 'user', content: userInput },
                { role: 'assistant', content: data.reply }
            );
            
            // Optionnel: limiter la taille de l'historique pour éviter les tokens excessifs
            if (conversationHistory.length > 20) { // Garder max 10 échanges
                conversationHistory = conversationHistory.slice(-20);
            }
            
            console.log('Historique conversation:', conversationHistory.length, 'messages');
        })
        .catch((error) => {
            console.log("error fetch: ", error)
        })
        dirtUserInput.value = "";
    })
})