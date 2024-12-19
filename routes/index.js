const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const router = express.Router();

const scopes = [
  'https://www.googleapis.com/auth/classroom.courses',
  'https://www.googleapis.com/auth/classroom.coursework.me',
  'https://www.googleapis.com/auth/classroom.coursework.students'
];

/* GET home page. */
router.get('/', async (req, res, next) => {
  if (!req.cookies.token) {

  
    const credentials = fs.readFileSync('credentials.json');
    const { client_id, client_secret, redirect_uris } = JSON.parse(credentials).web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    if (!req.query.code) {
      const url = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
      });

      res.redirect(url);
    } else {
        const tokens = await oAuth2Client.getToken(req.query.code);
        
        res.cookie('token', `Bearer ${tokens.tokens.access_token}`);
        res.render('index', { title: 'Google Classroom Manager' });
    }

  } else {
    res.render('index', { title: 'Google Classroom Manager' });
  }

  
});

/* POST home page. */
router.post('/change_account', (req, res, next) => {
  res.clearCookie("token");
  res.redirect('/');
});

module.exports = router;
