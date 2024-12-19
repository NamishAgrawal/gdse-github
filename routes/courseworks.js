const express = require('express');
const router = express.Router();
const axios = require('axios');
const schedule = require('node-schedule');

router.get('/:id', async (req, res, next) => {
  try {
    const courseId = req.params.id;
    console.log(courseId);

    const course = await axios({
      method: 'get',
      url: `https://classroom.googleapis.com/v1/courses/${courseId}`,
      headers: {
          authorization: req.cookies.token
      }
    });

    const courseworks = await axios({
      method: 'get',
      url: `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`,
      headers: {
          authorization: req.cookies.token
      }
    });

    let submissions = [];

    for (let coursework of courseworks.data.courseWork){


      const submission = await axios({
          method: 'get',
          url: `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${coursework.id}/studentSubmissions`,
          headers: {
              authorization: req.cookies.token
          }
        });
      submissions.push(submission.data.studentSubmissions);

    }
    let courseworksData = [];
    let i = 0;

    for (let coursework of courseworks.data.courseWork){

      let assigned = 0;
      let turnedin = 0;
      for (let submission of submissions[i]){
        console.log(submission);
        if (submission.courseWorkId == coursework.id){
          if (submission.state == 'CREATED'){
            assigned += 1;
          }
          else if (submission.state == 'NEW'){
            assigned += 1;
          }
          else if (submission.state == 'TURNED_IN'){
            assigned += 1;
            turnedin += 1;
          }

        }
      }
      i++;
      var autograde = "-";
      let buffer = {
        courseId: coursework.courseId,
        id: coursework.id,
        title: coursework.title,
        state: coursework.state,
        dueDate: coursework.dueDate,
        dueTime: coursework.dueTime,
        creationTime: coursework.creationTime,
        updateTime: coursework.updateTime,
        maxPoints: coursework.maxPoints,
        workType: coursework.workType,
        assigned: assigned,
        turnedin: turnedin,
      }
      courseworksData.push(buffer);
    }

    res.render('courseworks', { title: course.data.name, courseworks: courseworksData, courseId: courseId });
  } catch (error) {
    console.log(error);
    res.clearCookie("token");
    res.redirect('/');
  }

});

router.post('/autograde', async (req, res, next) => {
  try {
    const intimeMarks = req.body.intime;
    const lateDate = new Date(req.body.date);
    var dueDate;
    const courseId = req.body.courseId;
    const courseworkId = req.body.courseworkId;
    const lateMarks = req.body.late;

    const courseworks = await axios({
      method: 'get',
      url: `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`,
      headers: {
          authorization: req.cookies.token
      }
    });
    for (let coursework of courseworks.data.courseWork) {
      if (courseworkId == coursework.id) {
        console.log(coursework.dueDate.year, coursework.dueDate.month - 1, coursework.dueDate, coursework.dueTime.hours, coursework.dueTime.minutes);
        if (coursework.dueTime.minutes) {
          dueDate = new Date(coursework.dueDate.year, coursework.dueDate.month - 1, coursework.dueDate.day, coursework.dueTime.hours + 7, coursework.dueTime.minutes);
        }
        else {
          dueDate = new Date(coursework.dueDate.year, coursework.dueDate.month - 1, coursework.dueDate.day, coursework.dueTime.hours + 7);
        }
      }
    }

    console.log(dueDate, lateDate);
    const in_time = schedule.scheduleJob(dueDate, async function(){
      console.log("intime");
      let submissions = [];
      for (let coursework of courseworks.data.courseWork){
        const submission = await axios({
            method: 'get',
            url: `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${coursework.id}/studentSubmissions`,
            headers: {
                authorization: req.cookies.token
            }
          });
        submissions.push(submission.data.studentSubmissions);
      }
      let i = 0;
      for (let coursework of courseworks.data.courseWork){
        for (let submission of submissions[i]){
          if (submission.courseWorkId == coursework.id){
            if (submission.state == 'TURNED_IN'){
              const return_submission = await axios.patch(`https://classroom.googleapis.com/v1/courses/${submission.courseId}/courseWork/${submission.courseWorkId}/studentSubmissions/${submission.id}?updateMask=draftGrade,assignedGrade`, {
                  draftGrade: intimeMarks,
                  assignedGrade: intimeMarks
              }, {
                  headers: {
                      authorization: req.cookies.token
                  }
              });
            }
          }
        }
      }
    });

    const late = schedule.scheduleJob(lateDate, async function(){
      console.log('late');
      let submissions = [];
      for (let coursework of courseworks.data.courseWork){
        const submission = await axios({
            method: 'get',
            url: `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${coursework.id}/studentSubmissions`,
            headers: {
                authorization: req.cookies.token
            }
          });
        submissions.push(submission.data.studentSubmissions);
      }
      let i = 0;
      for (let coursework of courseworks.data.courseWork){
        for (let submission of submissions[i]){
          if (submission.courseWorkId == coursework.id){
            if (submission.state == 'TURNED_IN'){
              const return_submission = await axios.patch(`https://classroom.googleapis.com/v1/courses/${submission.courseId}/courseWork/${submission.courseWorkId}/studentSubmissions/${submission.id}?updateMask=draftGrade,assignedGrade`, {
                  draftGrade: lateMarks,
                  assignedGrade: lateMarks
              }, {
                  headers: {
                      authorization: req.cookies.token
                  }
              });
            }
          }
        }
      }
    });

    res.redirect(`/courseworks/${courseId}`)
  } catch (error) {
    console.log(error);
    res.clearCookie("token");
    res.redirect('/');
  }
});

router.post('/create_coursework', async (req, res, next) => {
  try {
    console.log("create works")
    const d = new Date();
    const courseId = req.body.courseId;
    const title = req.body.title;
    const description = req.body.description;
    const date = {day: req.body.day, month: req.body.month, year: req.body.year}
    const time = {hours: req.body.hour - 7, minutes: req.body.minute};
    const maxPoints = req.body.maxPoints;
    const type = req.body.type;


    const coursework = await axios({
      method: 'post',
      url: `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`,
      headers: {
          authorization: req.cookies.token
      },
      data :{
        title: title,
        description: description,
        dueDate: date,
        dueTime: time,
        maxPoints: maxPoints,
        workType: type,
        state: "PUBLISHED"
      }
    });

    res.redirect(`/courseworks/${courseId}`)
  } catch (error) {
    console.log(error);
    res.clearCookie("token");
    res.redirect('/');
  }
});

module.exports = router;
