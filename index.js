const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3008;
const axios = require('axios');
const puppeteer = require('puppeteer');


app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get('/details/:movieId', async (req, res) => {
  const id = req.params.movieId;
  // console.log(id);
  const API_URL = 'https://api.themoviedb.org/3/';
  const fetchMovie = async (id) => {
    const { data } = await axios.get(`${API_URL}/movie/${id}`, {
      params: {
        api_key: '54880feab2b97d617bc064ae0ae04156',
        append_to_response: 'videos'
      }
    })
    // console.log(data);
    // res.status(200).send(data);
    return data;
  }
  const movieData = await fetchMovie(id);
  if (movieData.videos && movieData.videos.results) {
    var trailer = movieData.videos.results.find(vid => vid.name === "Official Trailer");
  }

  let trailer_key = '';

  if (trailer === undefined) {
    trailer_key = movieData.videos.results[0].key;
  } else {
    trailer_key = trailer.key;
  }
  //console.log(trailer_key);
  res.status(200).send(trailer_key);
})


app.get('/details/price/:movieId', async (req, res) => {
  const id = req.params.movieId;
  // console.log(id);
  const API_URL = 'https://api.themoviedb.org/3/';
  const fetchProvieder = async (id) => {
    const { data } = await axios.get(`${API_URL}/movie/${id}/watch/providers`, {
      params: {
        api_key: '54880feab2b97d617bc064ae0ae04156',
        append_to_response: 'videos'
      }
    })
    //  console.log(data.results.US.link);
    return data.results.US.link;
  }
  const movieUrl = await fetchProvieder(id);
  console.log(movieUrl);
  const browser = await puppeteer.launch();
  //create a new in headless chrome
  const page = await browser.newPage();
  //go to target website
  await page.goto(`${movieUrl}`, {
    //wait for content to load
    waitUntil: 'networkidle0',
  });
  const html = await page.content();
  //get price

  // if (await page.$eval('.buy .price', el => el.innerText)) {
  //   price = await page.$eval('.buy .price', el => el.innerText);
  // } else {
  //   price = 'Stream';
  // }
  const price = await page.evaluate(() => {
    const element = document.querySelector('.buy .price')
    if (element) {
      return element.textContent
    }
    return 'Stream';
  })

  const mUrl = await page.evaluate(() =>
    Array.from(document.querySelectorAll('ul.providers > li a')).map(a => a.href)
  );
  const sentBack = [price, mUrl[0]];
  console.log(sentBack);
  //close headless chrome
  await browser.close();
  res.status(200).send(sentBack);
})


app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
})