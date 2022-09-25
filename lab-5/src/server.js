const express = require('express');
const dotenv = require('dotenv');

const route = require('./routes/index.route');

const app = express();
dotenv.config();
const POST = process.env.POST || 3000;

// template
app.use(express.json({ extended: true }));
app.use(express.static('./src/resource/views'));
app.set('view engine', 'ejs');
app.set('views', './src/resource/views');

route(app);

app.listen(POST, () => {
    console.log(`running http://localhost:${POST}`);
});
