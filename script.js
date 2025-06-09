const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
const upload = multer({ dest: 'uploads/' });

// Convert from URL
app.post('/download', (req, res) => {
  const url = req.body.url;
  const output = 'output.mp4';

  exec(`ffmpeg -i "${url}" -c copy ${output}`, (err, stdout, stderr) => {
    if (err) {
      console.error('FFmpeg error:', stderr);
      return res.status(500).send('Error downloading video');
    }

    res.download(output, () => fs.unlinkSync(output));
  });
});

// Convert from uploaded file
app.post('/upload', upload.single('file'), (req, res) => {
  const inputPath = req.file.path;
  const outputPath = 'output.mp4';

  exec(`ffmpeg -i ${inputPath} -c copy ${outputPath}`, (err, stdout, stderr) => {
    if (err) {
      console.error('FFmpeg error:', stderr);
      return res.status(500).send('Error converting file');
    }

    res.download(outputPath, () => {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  });
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
