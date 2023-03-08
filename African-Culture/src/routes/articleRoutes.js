import express, { application } from 'express';
const router = express.Router();
import { marked } from 'marked';
import session from 'express-session';
// import blogPosts from '../info.js';
import pool from '../database/db.js';

// this route is to get and render the blogs page along with all the articles
router.get('/', async (req, res) => {
  try {
    const articles = await pool.query('SELECT * FROM blog_post limit 20');
    // console.log(articles[0]);
    if (!articles[0]) {
      if (req.session.user_id) {
        return res.render('blogs', { articles: null, id: req.session.user_id });
      }

      return res.render('blogs', { articles: null, id: null });
    }

    if (req.session.user_id) {
      return res.render('blogs', {
        articles: articles[0],
        id: req.session.user_id,
      });
    }

    res.render('blogs', { articles: articles[0], id: null });
  } catch (e) {}
});

// getting article by slug and rendering it in the blog page
router.get('/view/:slug', async (req, res) => {
  try {
    const article = await pool.query(
      'SELECT * FROM blog_post WHERE slug = (?)',
      [req.params.slug]
    );
    // console.log('this ', article[0][0], ' is the article');
    const htmlContent = marked(article[0][0].content);
    const content = article[0][0];
    res.render('blog', {
      article: { content, htmlContent },
      id: req.session.user_id || null,
    });
  } catch (e) {}
});

// this route is to get and render the compost page
router.get('/compose', async (req, res) => {
  try {
    // res.render('creatPost', { articles: null });

    if (!req.session.user_id) {
      return res.render('login', {
        response: {
          signal: false,
          message: 'register to compose ariticle',
        },
      });
    }
    // if (req.session.user_id) {
    //   console.log(req.session.user_id);
    // }

    if (req.session.user_id) {
      res.render('createPost', { response: null, id: req.session.user_id });
    }
  } catch (e) {}
});

// routes to create a new post
// this route is for creatin a new post
router.post('/compose', async (req, res) => {
  // console.log('create route');

  try {
    const category = await pool.query(
      'SELECT id FROM category where name = (?)',
      [req.body.category]
    );

    const articleInfo = {
      title: req.body.title,
      slug: req.body.slug,
      description: req.body.description.trim(),
      content: req.body.content.trim(),
      author_id: req.session.user_id,
      category_id: category[0][0].id,
      featured: false,
      image: req.body.image,
      category: req.body.category,
      meta_title: req.body.title,
      meta_description: req.body.description.trim(),
      keywords: req.body.keywords,
    };
    // console.log(articleInfo);

    if (
      !articleInfo.title ||
      !articleInfo.category ||
      !articleInfo.slug ||
      !articleInfo.description ||
      !articleInfo.content ||
      !articleInfo.category
    ) {
      return res.render('createPost', {
        response: {
          failed: 'above fields are required',
          data: { articleInfo },
        },
      });
    }

    if (!articleInfo.author_id) {
      return res.render('login', {
        response: {
          signal: false,
          message: 'register to compose ariticle',
        },
      });
    }
    // const query = 'INSERT INTO ';

    const newArticle = await pool.query(
      'INSERT INTO blog_post(title, slug, summary, content, author_id, category_id, image_url,meta_title , meta_description, meta_keywords) values(?,?,?,?,?,?,?,?,?,?)',
      [
        articleInfo.title,
        articleInfo.slug,
        articleInfo.description,
        articleInfo.content,
        articleInfo.author_id,
        articleInfo.category_id,
        articleInfo.image,
        articleInfo.meta_title,
        articleInfo.meta_description,
        articleInfo.keywords,
      ]
    );

    // console.log(newArticle[0]);

    if (!newArticle || !newArticle[0].insertId) {
      return res.render('createPost', {
        response: {
          failed: 'an error occured check the above field before submiting',
          data: { articleInfo },
        },
      });
    }

    console.log('successfull', newArticle[0].insertId);

    const article = await pool.query('SELECT * FROM blog_post WHERE id = (?)', [
      newArticle[0].insertId,
    ]);
    // console.log('this ', article[0][0], ' is the article');
    const htmlContent = marked(article[0][0].content);
    const content = article[0][0];
    return res.render('blog', {
      article: { content, htmlContent },
      id: req.session.user_id || null,
    });
  } catch (e) {
    res.render('index', { articles: null, id: req.session.id || null });
  }
});

// this route is for geting a post and rendering it to the edit page
router.get('/edit/:id', async (req, res) => {
  if (!req.session.user_id || !req.params.id) {
    return res.render('index', { articles: null, id: null });
  }
  try {
    const article = await pool.query('SELECT * FROM blog_post WHERE id = (?)', [
      req.params.id,
    ]);

    // console.log(article[0][0]);
    if (!article[0][0]) {
      return res.render('editPost', { article: null, response: null });
    }

    res.render('editPost', { article: article[0][0], response: null });
  } catch (e) {
    res.render('editPost', {
      article: article[0][0],
      response: 'some error occured pleas try again',
    });
  }
});

// this route is for updating a post
router.put('/edit/:id', async (req, res) => {
  console.log('edit route activated FOR PUT');

  try {
    const article = await pool.query('SELECT * FROM blog_post WHERE id = (?)', [
      req.params.id,
    ]);

    const category = await pool.query(
      'SELECT id FROM category where name = (?)',
      [req.body.category]
    );

    const articleInfo = {
      title: req.body.title,
      slug: req.body.slug,
      description: req.body.description.trim(),
      content: req.body.content.trim(),
      author_id: req.session.user_id,
      category: category[0][0].id,
      featured: parseInt(req.body.featured),
      image: req.body.image,
      meta_title: req.body.title,
      meta_description: req.body.description.trim(),
      keywords: req.body.keywords,
    };

    // console.log(articleInfo, 'before saving \n \n');

    if (!article[0][0]) {
      const oldPost = await pool.query(
        'SELECT * FROM blog_post WHERE id = (?)',
        [req.params.id]
      );

      return res.render('editPost', {
        article: oldPost[0][0],
        response: 'some error occured pleas try again',
      });
    }

    const newPost = await pool.query(
      `update blog_post set 
      title = (?), 
      slug = (?), 
      summary = (?), 
      content = (?), 
      featured = (?),
      category_id = (?),
      image_url = (?), 
      meta_title = (?), 
      meta_description = (?), 
      meta_keywords = (?) 
      where id = (?)`,
      [
        articleInfo.title,
        articleInfo.slug,
        articleInfo.description,
        articleInfo.content,
        articleInfo.featured,
        articleInfo.category,
        articleInfo.image,
        articleInfo.title,
        articleInfo.description,
        articleInfo.keywords,
        req.params.id,
      ]
    );

    // console.log(newPost);

    if (!newPost) {
      return res.render('editPost', {
        article: article[0][0],
        response: 'some error occured pleas try again',
      });
    }
    if (!newPost[0].affectedRows) {
      return res.render('editPost', {
        article: article[0][0],
        response: 'some error occured pleas try again',
      });
    }

    // console.log(newPost);
    // const info = await pool.query(`select * from blog_post where id = (?)`, [
    //   req.params.id,
    // ]);
    // getting the information for authorView
    const info = await pool.query(
      `select author.id , blog_post.id as 'blog_id', 
      author.first_name as firstName , author.last_name as lastName, 
      blog_post.title , blog_post.slug, blog_post.summary as description , author.phone, author.email
      from author inner join blog_post on 
      author.id = blog_post.author_id And author.id = (?)`,
      [req.session.user_id]
    );

    // console.log(info[0], 'info gotten');

    // console.log(info[0][0], 'info gotten');
    res.render('dashboard', { info: info[0], id: req.session.user_id });
  } catch (e) {}
});

// this route is for search in post by keyword
router.get('/search/:keyword', async (req, res) => {
  // console.log('search route activated', 'keyword is ', req.params.keyword);

  try {
    let keyword = req.params.keyword.toString();
    if (keyword === 'form-search-value') {
      // console.log(req.query.search);
      keyword = req.query.search;
    }
    const articles = await pool.query(
      `select * from blog_post where meta_keywords like '%${keyword}%';`
    );
    // console.log(articles[0]);

    // if (req.session.user_id) {
    //   return res.render('blogs', {
    //     articles: articles[0],
    //     id: req.session.user_id,
    //   });
    // }

    res.render('blogs', {
      articles: articles[0],
      id: req.session.user_id || null,
    });
  } catch (e) {
    res.render('blogs', { articles: null, id: req.session.user_id || null });
  }
});

// this route is for deleting a post
router.delete('/delete/:id', async (req, res) => {
  console.log('from ', req.params.id, 'id id');
  try {
    const article = await pool.query('SELECT * FROM blog_post WHERE id = (?)', [
      req.params.id,
    ]);

    console.log('delete router activated');

    res.render('dashboard', { info: info[0], id: req.session.user_id });
  } catch (e) {}
});

export default router;
