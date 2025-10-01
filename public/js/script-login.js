import { loginfct } from './functions/loginfct.js';

document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("connect-button");

    loginBtn.addEventListener("click", async (e) => {
        loginfct(e);
    })

})