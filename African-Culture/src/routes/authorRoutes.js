import express, { application } from 'express';
import session from 'express-session';
const router = express.Router();
import pool from '../database/db.js';

///////////////////////
//////////////////////
// registration routes
router.get('/register', async (req, res) => {
  try {
    res.render('register');
  } catch (e) {}
});

router.post('/register', async (req, res) => {
  //   console.log(req.body);
  let authorInfo = {
    first_name: req.body.first_name || null,
    last_name: req.body.last_name || null,
    email: req.body.email || null,
    password: req.body.password || null,
    gender: req.body.gender || null,
    confirm_password: req.body.confirm_password || null,
    username: req.body.username || null,
    phone: req.body.phone || null,
    address: req.body.address || null,
    bio: req.body.bio || null,
  };
  //   console.log(authorInfo);

  try {
    if (
      authorInfo.first_name === null ||
      authorInfo.last_name === null ||
      authorInfo.email === null ||
      authorInfo.gender === null ||
      authorInfo.password === null ||
      authorInfo.bio === null
    ) {
      console.log('required field missed');
      return res
        .status(400)
        .send(
          'first Name , Last name , email password, bio ,fields are required'
        );
    }

    const query = `INSERT INTO author(first_name, last_name, bio, email, password, gender, phone) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const user = await pool.query(query, [
      authorInfo.first_name,
      authorInfo.last_name,
      authorInfo.bio,
      authorInfo.email,
      authorInfo.password,
      authorInfo.gender,
      authorInfo.phone,
    ]);
    const id = user[0].insertId;

    if (!user[0].insertId) {
      console.log('error occured while insreting');
      res.render('register');
    }
    console.log(user[0].insertId, '\n \n ///');
    //   console.log(user[0]);

    const newUser = await pool.query(
      `select * from author where id = ${user[0].insertId}`
    );

    console.log(newUser[0]);
    res.render('login', {
      response: {
        signal: true,
        message: 'registration successfull',
      },
    });
  } catch (e) {}
});

/////////////////////
////////////////////
// login routes
router.get('/login', async (req, res) => {
  try {
    res.render('login', { response: null });
  } catch (e) {}
});

router.post('/login', async (req, res) => {
  const userData = {
    email: req.body.email,
    password: req.body.password,
  };

  console.log(userData);

  try {
    if (!userData.email || !userData.password) {
      return res.render('login', {
        response: {
          signal: false,
          message: 'login unsuccessful , check email , password and try again',
        },
      });
    }

    const userLogin = await pool.query(
      `SELECT * FROM author WHERE  email=(?) AND password=(?) `,
      [req.body.email, req.body.password]
    );

    if (!userLogin[0][0]) {
      console.log('login failed');
      return res.render('login', {
        response: {
          signal: false,
          message: 'login unsuccessful , check email , password and try again',
        },
      });
    }
    // console.log(userLogin[0]);

    // if (userLogin[0]) {
    //   res.render('login', {
    //     response: {
    //       signal: true,
    //       message: 'login successful ',
    //       id: userLogin[0][0].id,
    //     },
    //   });
    // }

    // using session
    if (userLogin[0][0]) {
      req.session.user_id = userLogin[0][0].id;
    }

    if (userLogin[0]) {
      return res.redirect('/');
    }
  } catch (e) {
    console.log(e);
    res.render('login', {
      response: { signal: false, message: 'server error' },
    });
  }
  try {
  } catch (e) {}
});

/////////////////////
////////////////////
// dashboard routes

router.get('/dashboard', async (req, res) => {
  try {
    if (!req.session.user_id) {
      return res.redirect('/author/login');
    }

    const user = await pool.query(`select * from author where id = (?)`, [
      req.session.user_id,
    ]);
    // console.log(user[0][0]);

    const info = await pool.query(
      `select author.id , blog_post.id as 'blog_id', 
      author.first_name as firstName , author.last_name as lastName, 
      blog_post.title , blog_post.slug, blog_post.summary as description , author.phone, author.email
      from author inner join blog_post on 
      author.id = blog_post.author_id And author.id = (?)`,
      [req.session.user_id]
    );
    // console.log(info[0]);
    res.render('dashboard', {
      info: info[0],
      id: req.session.user_id,
      user: user[0][0],
    });
  } catch (e) {
    res.render('dashboard', { info: null, id: req.session.user_id || null });
  }
});

router.get('/view/:id', async (req, res) => {
  try {
    //     const id = req.params.id;
    //     // const info = await pool.query(`select * from blog_post where id = (?)`, [
    //     //   id,
    //     // ]);
    //     const info = await pool.query(
    //       `select author.first_name as firstName ,
    //       author.last_name as lastName,
    //       blog_post.title as title ,
    //       blog_post.views as views,
    //       blog_post.content as content,
    //       blog_post.image_url as image_url,
    //       blog_post.meta_keywords as meta_keywords,
    //       category.name as category_name,

    //       blog_post.slug, blog_post.summary ,
    //       author.phone, author.email,
    //       blog_post.created_at as created_at,
    //       blog_post.updated_at as updated_at,

    //       from author inner join blog_post
    //       on
    //       author.id = blog_post.author_id And author.id = (?)
    //        inner join category
    //        on
    //        blog_post.category_id = category.id`,
    //       [req.session.user_id]
    //     );
    //     console.log(info[0][0]);
    //     res.render('blogInfo', { info: info[0][0], id: req.session.user_id });

    const info = await pool.query(
      `select * from author inner join blog_post 
        on 
        author.id = blog_post.author_id And author.id = (?)
         inner join category 
         on 
         blog_post.category_id = category.id
         where blog_post.id = (?)`,
      [req.session.user_id, req.params.id]
    );

    // console.log(info[0][0]);
    res.render('blogInfo', { info: info[0][0], id: req.session.user_id });
  } catch (e) {}
});

//////////////

/////////////////////
////////////////////
// logout routes

router.get('/logout', async (req, res) => {
  try {
    req.session.destroy();
    res.redirect('/');
  } catch (e) {}
});

export default router;
