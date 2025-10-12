const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

const window = new JSDOM ('').window;
const DOMPurify = createDOMPurify(window);

const sanitizeInputs = (req, res, next) => {
    const { pseudo, email, password, passwordConfirmation } = req.body;

    req.body.sanitizedInputs = {
        pseudo: DOMPurify.sanitize(pseudo),
        email: DOMPurify.sanitize(email),
        password: password,
        passwordConfirmation: passwordConfirmation,
    };

    next();
};

module.exports = sanitizeInputs;
