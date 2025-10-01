import { registerfct } from './functions/registerfct.js';

document.addEventListener("DOMContentLoaded", () => {
    const saveBtn = document.getElementById("save-button");

    saveBtn.addEventListener("click", async (e) => {
        registerfct(e);
    })

})