# Google Classroom manager V.1
#### Video Demo:  <URL https://www.youtube.com/watch?v=T92kb34dfL0>
#### Description:
Google Classroom Manager V.1 is a web application that helps to manage classes in google classroom on the teacher side. While google classroom is so convenient for the students, managing it as a teacher is a hassle. SO the program aims to automate the tasks for the teacher.

The web application is built using Node JS Express and Google Classroom API. The *views* folder contains .ejs files which are similar to HTML The *routes* folder contains .js files. *credentials.json* contains a credentials that is used to authorize the request to the Google Classroom API. The *axios* node module is used to send request to the Google Classroom API. The *node-schedule8 node module is used to schedule the *Auto Grade* functionality. This program does not have a database because all processed data are sent back to Google's server.

The index page contains navigation menu to other pages. Moreover, *index.js* file contains the instruction to prompt the user to sign in using google account if the user hasn't signed in or the token is expired. The user can also change account here.

The *courses_create_edit* page allows the user to create new course (which is a classroom). Also, the user could edit the details of existing courses here. The courses which are created or edited must be activated in the Google Classroom website first.

The *courses* page shows a list of courses that the user has access too. It shows the courses' details. The user can click view button under the *Coursework* column to view the courseworks of the selected course and this direct the user to *courseworks* route.

The *courseworks* page shows the details (title, type, state, duedate, maximum grade, etc) of all courseworks. In addition, the user can create a new coursework using *Create Coursework* button. The first version of the program allows the user to create assignment and short answer question but not multiple choices question. Moreover, the user can use *Auto Grade* function which will automatically grade and return the coursework to the student when the due date and time is reached.

The program is still in the V.1 version so it might not be perfect and might have some limitations.

At first when I was working on this project, I don't have the knowledge about APIs so I was building the whole program from the start (I did not intend to use it with Google Classroom too but to be a standalone web application), using Flask in Python. However, I realized that I can use Google Classroom API to create this project. This way I don't have to write the student side of the program (which even if I did, the one built by Google is obviously going to be better) and don't have to build a database of my own.

Nevetheless, the difficulty is to learn to code in Javascript in a more advanced way than the script tag in a HTML. Also, the documentation of Google Classroom API is very difficult to understand for a beginner like me and there are many limitations.