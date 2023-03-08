import bodyParser from 'body-parser';
import express from 'express';
const app = express();
import pool from './src/database/db.js';
import dotenv from 'dotenv';
import articleRoute from './src/routes/articleRoutes.js';
import authorRoute from './src/routes/authorRoutes.js';
import session from 'express-session';
import methodOverride from 'method-override'; // using method override for delete and put request

// for path setup so __dirname can work in node
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// config files usage
dotenv.config();
const port = process.env.PORT || 500;

//
// to use static files in the public folder
app.use(express.static('public'));

app.use('/css', express.static(__dirname + 'public/css'));
app.use('/image', express.static(__dirname + 'public/images'));
app.use('/js', express.static(__dirname + 'public/js'));

app.use(methodOverride('_method')); // using method override for delete and put request

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', './src/views');

app.use(
  session({
    secret: 'notgood',
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true },
  })
);

// test data
// import posts from './src/info.js';

//testing pool
// const results = await pool.query('SELECT * FROM students LIMIT 4');
// console.log(results[0], 'from server', process.env.MYSQL_HOST);

// routes
app.use('/articles', articleRoute);
app.use('/author', authorRoute);

app.get('/', async (req, res) => {
  if (req.session.user_id) {
    console.log({ id: req.session.user_id });
  }
  try {
    const featuredPosts = await pool.query(
      'SELECT * FROM blog_post  ORDER BY views DESC LIMIT 3'
    );

    if (!featuredPosts[0]) {
      const articles = null;
      if (req.session.user_id) {
        console.log({ id: req.session.user_id });
        return res.render('index', {
          articles: articles,
          id: req.session.user_id,
        });
      }
      return res.render('index', { articles: articles, id: null });
    }
    // console.log(results[0], 'from server', process.env.MYSQL_HOST);
    // console.log(featuredPosts[0]);
    // const popularPosts = featuredPosts[0].forEach(element => {

    // });

    if (req.session.user_id) {
      console.log({ id: req.session.user_id });
      return res.render('index', {
        articles: featuredPosts[0],
        id: req.session.user_id,
      });
    }

    res.render('index', { articles: featuredPosts[0], id: null });
  } catch (e) {}
});

app.get('/contact', (req, res) => {
  res.render('contact', { id: req.session.user_id || null });
});

app.all('*', (req, res) => {
  res.render('404');
});

app.listen(port, () => {
  console.log(`running on port ${port}...`);
});
