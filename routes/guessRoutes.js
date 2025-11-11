const { Router } = require('express');
const sanitizeMessage = require('../middlewares/sanitizeMessage.js');

const router = Router();

// Route pour le jeu de devinettes avec mémoire de conversation
router.post('/guess', sanitizeMessage, async (req, res) => {
    try {
        // Récupérer le client Mistral depuis l'app (il faudra le passer en paramètre)
        const client = req.app.get('mistralClient');
        
        if (!client) {
            return res.status(503).json({ message: 'Service indisponible (clé API manquante)' });
        }
        
        // Utiliser le message et l'historique sanitisés
        const { message: userMessage, history } = req.body.sanitizedMessage;
        
        if (!userMessage || typeof userMessage !== 'string') {
            return res.status(400).json({ message: 'message requis' });
        }
        
        // Construire l'historique complet pour Mistral
        const systemPrompt = {
            role: 'system',
            content: 'You are playing a guessing game with a user. The user will describe a word in English, and your goal is to guess it by asking yes/no questions or requesting more details. Follow these rules strictly: Language: Respond only in English, even if the user mixes languages. Questions: Ask one question at a time to narrow down possibilities (e.g., "Is it something you can eat?", "Is it bigger than a car?"). Guessing: When you think you know the answer, say: "I think the word is [your guess]. Am I right?". Feedback: If the user says "No", ask a new question. If "Yes", congratulate them and end the game. Tone: Stay curious and encouraging (e.g., "Interesting! Let me ask…"). Start now: "I\'m ready! Describe your word, and I\'ll try to guess it."'
        };
        
        const messages = [
            systemPrompt,
            ...history, // Historique de la conversation
            { role: 'user', content: userMessage } // Nouveau message
        ];
        
        console.log('[GUESS] Conversation history length:', history.length);
        
        const chatResponse = await client.chat.complete({
            model: 'mistral-small-latest',
            messages: messages
        });
        
        const aiResponse = chatResponse.choices[0].message.content;
        
        // Retourner la réponse
        return res.json({ 
            reply: aiResponse
        });
        
    } catch (err) {
        console.error('[GUESS][ERROR]', err.message);
        return res.status(500).json({ message: 'Erreur interne (guess)' });
    }
});

module.exports = router;