const express = require('express');
const app = express();

const cors = require('cors');
const morgan = require('morgan');

const path = require('path');
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname,'/')));
app.use(cors());
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server listening in on port ${port}`);
});