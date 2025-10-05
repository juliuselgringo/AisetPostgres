const express = require('express');

const app = express();

if (typeof(PhusionPassenger) !== 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
}

app.get("/", (req, res) => {
    return res.status(200).json({
        message: "Hello World"
    })
})

if (typeof(PhusionPassenger) !== 'undefined') {
    app.listen('passenger');
} else {
    app.listen(3000);
}