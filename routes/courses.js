const express = require('express');
const router = express.Router();
const axios = require('axios');

/* GET users listing. */
router.get('/', async (req, res, next) => {
  try {
    const courses = await axios({
      method: 'get',
      url: 'https://classroom.googleapis.com/v1/courses',
      headers: {
          authorization: req.cookies.token
      }
    });
    res.render('courses', { title: 'Courses', courses: courses.data.courses });
  } catch (error) {
    res.clearCookie("token");
    res.redirect('/');
  }
    
});

module.exports = router;
