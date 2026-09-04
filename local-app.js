const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello! This is my local website running on port 5173.');
});

app.listen(5173, () => {
  console.log('Local app running at http://localhost:5173');
});