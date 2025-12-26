import express from 'express';
import multer from 'multer';
import {
  fetch_user,
  update_user,
  username_exist,
  validate_username,
  email_exist,
  validate_email,
  fetch_event,
  fetch_detail,
  update_event,
  fetch_seat,
  fetch_booked,
  transact_payment,
  fetch_userBooked,
  update_userBooked,
  update_seat,
  update_icon,
  fetch_userList
} from './userdb.js';

const route = express.Router();

const form = multer();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './static/assets')
  },
  filename: function (req, file, cb) {
    cb(null, `${req.body?.name}.jpg`)
  }
})

const upload = multer({ storage: storage })

express().use('/', express.static('static'));

route.get('/me', (req, res) => {
  if (req.session.logged === true) {
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
  else
    res.status(401).json({
      status: "failed",
      user: {
        firstName: null,
        lastName: null,
        username: null,
        email: null,
        role: null
      }, 
      message: "Unauthorized"
    })
});

route.post('/user', form.none(), async (req, res) => {
  const user = await fetch_user(req.body?.username);

  if (user !== null)
    res.json({
      status: "success",
      user: user
    })
  else
    res.status(401).json({
      "status": "failed"
    })
});

route.post('/logout', (req, res) => {
  if (req.session.logged === true) {
    req.session.destroy();
    res.end();
  }
  else
    res.status(401).json({
      status: "failed",
      message: "Unauthorized"
    })
});

route.get('/users', async (req, res) => {
  const list = JSON.stringify(await fetch_userList());
    res.json(list)
});

route.post('/logout', (req, res) => {
  if (req.session.logged === true) {
    req.session.destroy();
    res.end();
  }
  else
    res.status(401).json({
      status: "failed",
      message: "Unauthorized"
    })
});

route.post('/uploadImage', upload.single('image'), (req, res) => {
  if (req.session.logged === true) 
    res.redirect(req.get('referer'));
  else
    res.redirect('/login.html');
})

route.post('/updateIcon', form.none(), async (req, res) => {
  const oldUsername = req.body?.oldUsername;
  const newUsername = req.body?.newUsername;

  await update_icon(oldUsername, newUsername);

  res.end();
});

route.post('/register', form.none(), async (req, res) => {
  const firstName = req.body?.firstName;
  const lastName = req.body?.lastName;
  const oldUsername = req.body?.oldUsername;
  const newUsername = req.body?.newUsername;
  const password = req.body?.password;
  const email = req.body?.email;
  const role = req.body?.role;

  if (!firstName || !lastName || !newUsername || !password || !email)
    res.status(400).json({
      status: 'failed',
      message: 'Missing fields',
    })
  else if (newUsername.length < 3)
    res.status(400).json({
      status: 'failed',
      message: 'Username must be at least 3 characters',
    })
  else if (await username_exist(newUsername) && req.session.logged === false)
    res.status(400).json({
      status: 'failed',
      message: 'Username ' + newUsername + ' already exists',
    })
  else if (await validate_username(newUsername) === false)
    res.status(400).json({
      status: 'failed',
      message: 'Username cannot contain specical characters',
    })
  else if (await email_exist(email) && req.session.logged === false)
    res.status(400).json({
      status: 'failed',
      message: 'Account with email address: ' + email + ' already exists',
    })
  else if (await validate_email(email) === false)
    res.status(400).json({
      status: 'failed',
      message: 'Please enter a valid email address',
    })
  else if (password.length < 8)
    res.status(400).json({
      status: 'failed',
      message: 'Password must be at least 8 characters',
    })
  else if (await update_user(firstName, lastName, oldUsername, newUsername, password, email, role) === false)
    res.status(500).json({
      status: 'failed',
      message: 'Unable to save account into the database',
    })
  else
    res.json({
      status: 'success',
      user: {
        firstName: firstName,
        lastName: lastName,
        username: newUsername,
        email: email,
        role: role
      }   
    })
});

route.get('/event', async (req, res) => {
  const list = JSON.stringify(await fetch_event());
    res.json(list)
});

route.post('/detail', form.none(), async (req, res) => {
  const detail = await fetch_detail(req.body?.event);

  if (detail !== null)
    res.json({
      status: "success",
      detail: detail
    })
  else
    res.status(401).json({
      "status": "failed"
    })
});

route.get('/seat', async (req, res) => {
  const booked = JSON.stringify(await fetch_seat());
  res.json(booked);
});

route.post('/pay', form.none(), async (req, res) => {
  const event = req.body?.event;
  const title = req.body?.title;
  const seatNo = req.body?.seatNo;
  const tier = req.body?.tier;
  const price = req.body?.price;
  const firstName = req.body?.firstName;
  const lastName = req.body?.lastName;
  const email = req.body?.email;
  const card = req.body?.card;
  const date = req.body?.date;
  const code = req.body?.code;

  if (!card || !date || !code || !firstName || !lastName || !email)
    res.status(400).json({
      status: 'failed',
      message: 'Missing fields',
    })
  else if (await validate_email(email) === false)
    res.status(400).json({
      status: 'failed',
      message: 'Please enter a valid email address',
    })
  else if (isNaN(card))
    res.status(400).json({
      status: 'failed',
      message: 'Please enter a valid credit card number',
    })
  else if (!date.match(/[0-9]+\/[0-9]+/))
    res.status(400).json({
      status: 'failed',
      message: 'Please enter a valid credit expiration date (e.g. 12/26)',
    })
  else if (isNaN(code))
    res.status(400).json({
      status: 'failed',
      message: 'Please enter a valid credit card security code',
    })
  else if (await transact_payment(event, title, seatNo, tier, price, req.session.username) === false)
    res.status(500).json({
      status: 'failed',
      message: 'Unable to save payment record into the database',
    })
  else
    res.json({
      status: 'success',
    })
});

route.get('/userBooked', async (req, res) => {
  const userBooked = JSON.stringify(await fetch_userBooked());
  res.json(userBooked);
});

route.post('/updateUserBooked', form.none(), async (req, res) => {

  const oldUsername = req.body?.oldUsername;
  const newUsername = req.body?.newUsername;

  await update_userBooked(oldUsername, newUsername)
  res.end();
});

route.post('/updateEvent', form.none(), async (req, res) => {
  const event = req.body?.event;
  const title = req.body?.title;
  const date = req.body?.date;
  const time = req.body?.time;
  const venue = req.body?.venue;
  const info = JSON.parse(req.body?.info);
  const description = req.body?.description;

  if (await update_event(event, title, date, time, venue, info, description) === false)
    res.status(500).json({
      status: 'failed',
      message: 'Unable to save event into the database',
    })
  else
    res.json({
      status: 'success',
    })
});

route.post('/updateSeat', form.none(), async (req, res) => {
  const event = req.body?.event;
  const info = JSON.parse(req.body?.info);
  const pastInfo = await fetch_detail(event);
  const bookedList = await fetch_booked(event);
  let maxSeat = 0;
  let minSeat = 0;
  let seatList = [];
  let seatNo;

  if (bookedList !== null){
    for (let i = 0; i < bookedList[event].length; i++)
      seatList.push(Number(bookedList[event][i]["seat"]))
  }

  for (let j = 0; j < info.length; j++){
    maxSeat += Number(info[j]["seat"]);
    seatNo = Math.floor(Math.random() * (maxSeat - minSeat)) + minSeat + 1;

    if (pastInfo !== null && bookedList !== null){
      const booked = Number(info[j]["booked"]);
      const pastBooked = Number(pastInfo["info"][j]["booked"]);

      if (booked > pastBooked){
        for (let k = 0; k < (booked - pastBooked); k++){
          while (seatList.includes(seatNo))
            seatNo = Math.floor(Math.random() * (maxSeat - minSeat)) + minSeat + 1;

          if (await update_seat(event, seatNo, true) === false)
            res.status(500).json({
              status: 'failed',
              message: 'Unable to save booked seat into the database',
            })

          seatList.push(seatNo);
        }
      }
      else if (booked < pastBooked){
        for (let l = 0; l < (pastBooked - booked); l++){
          while (!seatList.includes(seatNo))
            seatNo = Math.floor(Math.random() * (maxSeat - minSeat)) + minSeat + 1;

          if (await update_seat(event, seatNo, false) === false)
            res.status(500).json({
              status: 'failed',
              message: 'Unable to save booked seat into the database',
            })

          seatList = seatList.filter(item => item !== seatNo);
        }
      }
    } 
    else {
      for (let m = 0; m < info[j]["booked"]; m++){
        while (seatList.includes(seatNo))
          seatNo = Math.floor(Math.random() * (maxSeat - minSeat)) + minSeat + 1;

        if (await update_seat(event, seatNo, true) === false)
          res.status(500).json({
            status: 'failed',
            message: 'Unable to save booked seat into the database',
          })
        seatList.push(seatNo);
      }
    } 

    minSeat += Number(info[j]["seat"]);
  }

  res.json({
    status: 'success',
  })
});

export default route;
