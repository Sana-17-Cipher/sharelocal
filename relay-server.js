const express = require('express');
const app = express();

app.get('/', async (req, res) => {
  try {
    const response = await fetch('http://localhost:5173/');
    const data = await response.text();
    res.send(data);
  } catch (err) {
    res.status(502).send('Could not reach local app.');
  }
});

app.listen(4000, () => {
  console.log('Relay server running at http://localhost:4000');
});