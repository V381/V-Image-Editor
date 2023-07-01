const sharp = require('sharp');
const express = require('express');
const app = express();



app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public/views'));
app.use(express.static(__dirname + '/public/logic'));
app.use(express.static(__dirname + '/public/assets'));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`listening on *:${port}`);
});