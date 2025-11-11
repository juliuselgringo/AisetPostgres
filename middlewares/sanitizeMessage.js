const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const sanitizeMessage = (req, res, next) => {
    const { message } = req.body;

    req.body.sanitizedMessage = {
        message: DOMPurify.sanitize(message || ''),
    };

    next();
};

module.exports = sanitizeMessage;