const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { config } = require('dotenv');
const mistral = require('@mistralai/mistralai');

const authRoutes = require('./routes/authRoutes.js');
const verifyToken = require('./middlewares/verifyToken.js');
const sanitizeMessage = require('./middlewares/sanitizeMessage.js');

const app = express();
const PORT = 3000;

config();
const apiKey = process.env.MISTRAL_API_KEY;


if (!apiKey) {
    console.warn('[MISTRAL] Aucune clé API trouvée (MISTRAL_API_KEY). La route /api/chat renverra une erreur 503.');
}

const client = apiKey ? new mistral.Mistral({ apiKey }) : null;

// Définition des origines autorisées pour CORS
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://aiset.juliuselgringo.fr',
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // requêtes internes / same-origin
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Origin non autorisée: ' + origin), false);
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'))
})

app.get('/index.html',(req,res) =>{
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'))
})

app.get('/loginPage.html',(req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'loginPage.html'))
})

app.get('/exerciseSelection.html', verifyToken, (req,res) =>{
    res.sendFile(path.join(__dirname, 'views', 'exerciseSelection.html'));
})

app.get('/restaurant.html', verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'restaurant.html'));
});

app.get('/guess.html', verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'guess.html'));
});

app.post('/api/chat', sanitizeMessage, async (req, res) => {
    try {
        if (!client) return res.status(503).json({ message: 'Service indisponible (clé API manquante)' });
        
        // Utiliser le message sanitisé
        const userMessage = req.body.sanitizedMessage.message;
        if (!userMessage || typeof userMessage !== 'string') {
            return res.status(400).json({ message: 'message requis' });
        }
        const chatResponse = await client.chat.complete({
            model: 'mistral-small-latest',
            messages: [
                {
                    role: 'system',
                    content: 'You are an English teacher. You only speak English and use simple vocabulary. The user sends you a message in a restaurant role-play context. Your response must include two phases: 1- analysis -> Briefly analyze the user\'s message. Suggest a correction or congratulate the user if their sentence is correct. 2-role-play –> If you think the user is playing the role of a customer, respond as a server. If you think the user is playing the role of a server, respond as a customer. '
                },
                { role: 'user', content: userMessage }
            ]
        });
        return res.json({ reply: chatResponse.choices[0].message.content });
    } catch (err) {
        console.error('[CHAT][ERROR]', err.message);
        return res.status(500).json({ message: 'Erreur interne (chat)' });
    }
});

app.post('/api/guess', sanitizeMessage, async (req, res) => {
    try {
        if (!client) return res.status(503).json({ message: 'Service indisponible (clé API manquante)' });
        
        // Utiliser le message sanitisé
        const userMessage = req.body.sanitizedMessage.message;
        if (!userMessage || typeof userMessage !== 'string') {
            return res.status(400).json({ message: 'message requis' });
        }
        
        // TODO: Implémenter logique spécifique pour guess
        // Exemple d'appel Mistral pour le jeu de devinettes
        const chatResponse = await client.chat.complete({
            model: 'mistral-small-latest',
            messages: [
                {
                    role: 'system',
                    content: 'You are a word guessing game helper. Analyze the user guess and provide helpful hints.'
                },
                { role: 'user', content: userMessage }
            ]
        });
        return res.json({ reply: chatResponse.choices[0].message.content });
    } catch (err) {
        console.error('[GUESS][ERROR]', err.message);
        return res.status(500).json({ message: 'Erreur interne (guess)' });
    }
});

// Routes auth
app.use('/auth', authRoutes);

// Listen
if (typeof PhusionPassenger !== 'undefined') {
    // Mode production avec Passenger (o2switch)
    app.listen('passenger');
} else {
    // Mode développement local
    app.listen(PORT, () => {
        console.log(`🚀 Serveur démarré sur le port ${PORT}!`);
    });
}




