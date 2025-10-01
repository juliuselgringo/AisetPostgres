// npm init -y pour gérer les dépendances
// npm install dotenv
// npm install @mistralai/mistralai
// modifier package.json, add "type" : "module" 

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { Mistral } from '@mistralai/mistralai';

import authRoutes from './routes/authRoutes.js';
import verifyToken from './middlewares/verifyToken.js';

import { testDbConnection } from './models/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname= dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

config();
const apiKey = process.env.MISTRAL_API_KEY;


if (!apiKey) {
    console.warn('[MISTRAL] Aucune clé API trouvée (MISTRAL_API_KEY). La route /api/chat renverra une erreur 503.');
}
const client = apiKey ? new Mistral({ apiKey }) : null;

const allowedOrigins = [
    process.env.PUBLIC_URL,
    'https://aiset.juliuselgringo.fr',
    'http://localhost:3000'
].filter(Boolean);

app.set('trust proxy', 1); // important derrière un reverse proxy (SSL)
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

// Healthcheck utile pour monitoring
app.get('/health', (req,res)=> res.json({ status:'ok', time: new Date().toISOString() }));

// Middleware d’erreurs final
app.use((err, req, res, next) => {
    console.error('Erreur serveur finale :', err);
    if (res.headersSent) return next(err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Ajout (en bas du fichier, avant listen éventuellement) :
process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});



const start = async () => {
    try {
        await testDbConnection();
        app.listen(PORT, () => {
            const serverUrl = process.env.URL || `http://localhost:${PORT}`;
            console.log(`🚀 Serveur démarré sur ${serverUrl}`);
        });
    } catch (e) {
        console.error('[SERVER][FATAL] Arrêt (DB indisponible)');
        process.exit(1);
    }
};
start();




