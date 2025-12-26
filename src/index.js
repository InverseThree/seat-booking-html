import express from 'express';
import session from 'express-session';
import multer from 'multer';
import route from './route.js';
import mongostore from 'connect-mongo';
import client from './dbclient.js' ;
import {validate_user} from './userdb.js';

const app = express();

app.use(
  session({
    secret: 'project',
    resave: false,
    saveUninitialized: false,
    cookie: {httpOnly: true},
    store: mongostore.create({
      client,
      dbName: 'orcdb',
      collectionName: 'session',
    }),
  }));

app.use('/auth', route);

app.get('/', (req, res) => {
  res.redirect('/index.html');
});

const form = multer();

route.post('/login', form.none(), async (req, res) => {

  req.session.logged = false;

  const user = await validate_user(req.body?.username, req.body?.password);

  if (req.body?.remember === "true")
    req.session.cookie.maxAge = 3600000000;
  else
    req.session.cookie.maxAge = 3600000;
  if (user === false)
    res.status(401).json({
      "status": "failed",
      "message": "Incorrect username and password"
    })
  else {
    req.session.firstName = user.firstName;
    req.session.lastName = user.lastName;
    req.session.username = user.username;
    req.session.email = user.email;
    req.session.role = user.role;
    req.session.timestamp = new Date().toLocaleString('en-GB');
    req.session.logged = true
    res.json({
      status: "success",
      user: {
        firstName: req.session.firstName,
        lastName: req.session.lastName,
        username: req.session.username,
        email: req.session.email,
        role: req.session.role
      }  
    })
  }
});

app.use('/', express.static('static'));

app.listen(8080, () => {
    console.log('Date/Time: ' + new Date().toLocaleString('en-GB'));
    console.log('Server started at http://127.0.0.1:8080');
});
