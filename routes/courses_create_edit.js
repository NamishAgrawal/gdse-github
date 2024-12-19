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
    res.render('courses_create_edit', { title: 'Create/Edit Courses', courses: courses.data.courses });
  } catch (error) {
    res.clearCookie("token");
    res.redirect('/');
  }
  
});

/* POST create courses */
router.post('/', async (req, res, next) => {
  const name = req.body.name;
  const section = req.body.section;
  const description = req.body.description;
  const id = req.body.id;
  console.log(name, section, description, id);

  try {
    if (id == 0) {
      const courses = await axios({
        method: 'post',
        url: 'https://classroom.googleapis.com/v1/courses',
        headers: {
            authorization: req.cookies.token
        },
        data :{
          name: name,
          section: section,
          description: description,
          ownerId: "me",
          courseState: 'PROVISIONED'
        }
      });
    } else {
      var url = 'https://classroom.googleapis.com/v1/courses/';
      url = url.concat(id);
      console.log(url);
      const courses = await axios({
        method: 'put',
        url: url,
        headers: {
            authorization: req.cookies.token
        },
        data :{
          name: name,
          section: section,
          description: description,
        }
      });
    }

    res.redirect('/courses');
  } catch (error) {
    console.log(error);
  }
  
});

module.exports = router;
