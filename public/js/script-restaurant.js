/*const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://aiset.juliuselgringo.fr';*/

document.addEventListener('DOMContentLoaded', function() {
    
    let userInput = document.getElementById("userInput");
    const sendButton = document.getElementById("sendButton");
    const chatBox = document.getElementById("chatBox");
    const restaurantWords = ["menu", "order", "reservation", "table", "food", "meal",
         "dish", "bill", "tip", "chef", "server"];
    const wordsToUseDisplay = document.getElementById("words-to-use");
    const messagesSaved = JSON.parse(localStorage.getItem('lastMessages'));

    // Afficher le dernier message sauvegardé si disponible
    if(messagesSaved !== null){
        const userSaved = messagesSaved.user;
        const userSavedDisplay = document.createElement("div");
        userSavedDisplay.innerHTML = `<strong>You:</strong> <br>${userSaved}`;
        userSavedDisplay.id = "you"
        const chatSaved = messagesSaved.chat;
        const chatSavedDisplay = document.createElement("div");
        chatSavedDisplay.id = "theCat"
        chatSavedDisplay.innerHTML = `<strong>Le Chat:</strong> ${chatSaved}`;
        chatBox.appendChild(userSavedDisplay);
        chatBox.appendChild(chatSavedDisplay);
    }

    function saveLastChatToLocalStorage(userMessage, chatResponse){
        const messages = {
            user: userMessage,
            chat: chatResponse
        };

        const messagesString = JSON.stringify(messages);
        localStorage.setItem('lastMessages', messagesString);

    }

    // Générer des mots aléatoires à utiliser
    function generateRandomWords(){
        let wordsToUse = new Set();
        let wordsUniqueToUse = [];
        while(wordsUniqueToUse.length <= 3){
            let randomIndex = Math.floor(Math.random()*restaurantWords.length);
            wordsToUse.add(restaurantWords[randomIndex]);
            wordsUniqueToUse = Array.from(wordsToUse);
        }
        return wordsUniqueToUse;
        
    }
    
    let wordsUniqueToUse = generateRandomWords();
    wordsUniqueToUse.forEach(word => {
        let wordElement = document.createElement("div");
        wordElement.textContent = word;
        wordElement.id = word;
        wordElement.className = "word";
        wordsToUseDisplay.appendChild(wordElement);
    });
    
    // Event listener du bouton envoyer
    sendButton.addEventListener("click", (e) => {
        e.preventDefault();

        // traitement des inputs
        const userMessage = userInput.value;
        const cleanMessage = DOMPurify.sanitize(userMessage);

        // Vérification des mots pour valider les mots utilisés
        const arrayMessage = cleanMessage.split(" ");
        
        wordsUniqueToUse.forEach(word => {
            const regex = new RegExp(`(^|\\s|\\p{P})${word}(?=$|\\s|\\p{P})`, 'gui');
            if(arrayMessage.find(elt => regex.test(elt))){
                document.getElementById(word).style.backgroundColor = "var(--main-color)";
            }
        })
      
        // Affichage du message
        const messageElement = document.createElement("div");
        messageElement.innerHTML = `<strong>You : </strong> <br>${cleanMessage}`;
        messageElement.id = "you";
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;

        
        fetch(`/api/chat`, {
            method:'POST',
            headers:{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({message: cleanMessage}),
        })
        .then(response =>response.json())
        .then(data => {
            const responseChat = marked.parse(data.reply);
            const serverMessageElement = document.createElement("div");
            serverMessageElement.innerHTML = `<strong>Le Chat:</strong> ${responseChat}`;
            serverMessageElement.id = "theCat";
            chatBox.appendChild(serverMessageElement);
            chatBox.scrollTop = chatBox.scrollHeight;
            saveLastChatToLocalStorage(cleanMessage,responseChat);
        })
        .catch((error) => {
            console.log("error fetch : ", error)
        })
        
        userInput.value = "";
    })
})


