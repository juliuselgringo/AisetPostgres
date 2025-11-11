const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const sanitizeMessage = (req, res, next) => {
    const { message, history } = req.body;

    req.body.sanitizedMessage = {
        message: DOMPurify.sanitize(message || ''),
        history: Array.isArray(history) ? history.map(msg => ({
            role: msg.role === 'user' || msg.role === 'assistant' ? msg.role : 'user',
            content: DOMPurify.sanitize(msg.content || '')
        })) : []
    };

    next();
};

module.exports = sanitizeMessage;