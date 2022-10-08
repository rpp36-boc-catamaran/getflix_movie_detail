
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3008;


app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Getflix');
})

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
})