import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';

const window = new JSDOM ('').window;
const DOMPurify = createDOMPurify(window);

export const sanitizeLogin = (req, res, next) => {
    const { email, password } = req.body;

    req.body.sanitizedLogin = {
        email: DOMPurify.sanitize(email),
        password: password,
    };

    next();
}
