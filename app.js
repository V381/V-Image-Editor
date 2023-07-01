const sharp = require('sharp');
const express = require('express');
const multer = require('multer');
const app = express();
const bodyParser = require('body-parser');
const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.json());

app.post('/upload', upload.single('image'), (req, res) => {
  if (req.file) {
    const filePath = req.file.path;
    
    sharp(filePath)
      .toBuffer()
      .then(imageData => {
        res.writeHead(200, {
          'Content-Type': req.file.mimetype,
          'Content-Length': imageData.length
        });
        res.end(imageData);
      })
      .catch(error => {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to process the image' });
      });
  } else {
    res.status(400).json({ error: 'No file received' });
  }
});

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public/views'));
app.use(express.static(__dirname + '/public/logic'));
app.use(express.static(__dirname + '/public/assets'));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`listening on *:${port}`);
});
