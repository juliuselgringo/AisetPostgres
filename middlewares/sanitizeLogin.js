const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

const window = new JSDOM ('').window;
const DOMPurify = createDOMPurify(window);

const sanitizeLogin = (req, res, next) => {
    const { email, password } = req.body;

    req.body.sanitizedLogin = {
        email: DOMPurify.sanitize(email),
        password: password,
    };

    next();
};

module.exports = sanitizeLogin;
