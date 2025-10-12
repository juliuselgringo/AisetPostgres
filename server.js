const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { config } = require('dotenv');
const mistral = require('@mistralai/mistralai');

const authRoutes = require('./routes/authRoutes.js');
const verifyToken = require('./middlewares/verifyToken.js');

// wrapper o2switch
if(typeof PhusionPassenger !== "undefined"){
    PhusionPassenger({autoInstall: false})
}

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
    'https://votre-domaine.com', // Remplacer par votre domaine de production
    // Ajoutez d'autres domaines autorisés ici
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

app.post('/api/chat', async (req, res) => {
    try {
        if (!client) return res.status(503).json({ message: 'Service indisponible (clé API manquante)' });
        const userMessage = req.body.message;
        if (!userMessage || typeof userMessage !== 'string') {
            return res.status(400).json({ message: 'message requis' });
        }
        const chatResponse = await client.chat.complete({
            model: 'mistral-small-latest',
            messages: [
                {
                    role: 'system',
                    content: 'You are an English teacher who speaks only in simple English. Analyse each student sentence (restaurant customer role-play), give concise natural suggestions or congratulate if fine.'
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

// Routes auth
app.use('/auth', authRoutes);

// Listen
if (typeof PhusionPassenger !== 'undefined') {
    // Mode production avec Passenger (o2switch)
    app.listen('passenger', () => {
        console.log(`🚀 Serveur démarré en mode Passenger!`);
    });    
} else {
    // Mode développement local
    app.listen(PORT, () => {
        console.log(`🚀 Serveur démarré sur le port ${PORT}!`);
    });
}




