const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello from my ACTUAL local website!');
});

app.listen(5173, () => {
  console.log('Real local app running at http://localhost:5173');
});