import fs from 'fs/promises';
import client from './dbclient.js';
import bcrypt from 'bcrypt';

const users = client.db('orcdb').collection('users');
const events = client.db('orcdb').collection('events');
const seats = client.db('orcdb').collection('seats');
const usersBooked = client.db('orcdb').collection('usersBooked');

async function init_db() {
  try {
    if (await users.countDocuments({}) === 0){
      const content = await fs.readFile('./users.json', 'utf-8');
      const data = JSON.parse(content);
      
      console.log("Added #" + (await users.insertMany(data)).insertedCount + " users")
    }
    if (await events.countDocuments({}) === 0){
      const content = await fs.readFile('./events.json', 'utf-8');
      const data = JSON.parse(content);
      
      console.log("Added #" + (await events.insertMany(data)).insertedCount + " events")
    }
    if (await seats.countDocuments({}) === 0){
      const content = await fs.readFile('./events.json', 'utf-8');
      const data = JSON.parse(content);

      for (let i = 0; i < data.length; i++){
        let maxSeat = 0;
        let minSeat = 0;
        let bookedCount;
        let bookedSeats = [];
        let tmpList = [];
        let bookedList = [{}];

        for (let j = 0; j < data[i]["info"].length; j++){
          maxSeat += Number(data[i]["info"][j]["seat"]);
          bookedCount = Number(data[i]["info"][j]["booked"]);

          for (let k = 0; k < bookedCount; k++){
            let booked = {}
            booked["seat"] = Math.floor(Math.random() * (maxSeat - minSeat)) + minSeat + 1;

            while (tmpList.includes(booked["seat"]))
              booked["seat"] = Math.floor(Math.random() * (maxSeat - minSeat)) + minSeat + 1;

            tmpList.push(booked["seat"]);
            bookedSeats.push(booked);
          }

          minSeat += Number(data[i]["info"][j]["seat"]);
        }
          bookedList[0][data[i]["event"]] = bookedSeats;
          console.log("Added #" + (await seats.insertMany(bookedList)).insertedCount + " booked seats list")
      }
    }
  }
  catch (err) {
    console.log("Unable to initialize the database!")
  }
}

export async function fetch_user(username) {
  try {
    return await users.findOne({"username": username})
  }
  catch (err) {
    console.log("Unable to fetch from database!")
  }
}

export async function fetch_userList() {
  try {
    return await users.find({"role": "user"}).toArray();
  }
  catch (err) {
    console.log("Unable to fetch from database!")
  }
}

export async function validate_user(username, password) {
  try {
    if (!username || !password)
      return false;

    const user = await fetch_user(username);

    if (user === null)
      return false;
    else if (!await bcrypt.compare(password, user.password))
      return false;
    else
      return user;
  }
  catch (err) {
    console.log("Unable to fetch from database!")
  }
}

export async function update_user(firstName, lastName, oldUsername, newUsername, password, email, role) {
  try{
    const hashedPassword = await bcrypt.hash(password, 10);
    if (await fetch_user(oldUsername) !== null) {
      await users.updateOne({"username": oldUsername}, {$set:{
        "firstName": firstName,
        "lastName": lastName,
        "username": newUsername,
        "password": hashedPassword,
        "email": email,
        "role": role,
      }}, {upsert: true})
      console.log("Updated 1 user")
    }
    else {
      await users.insertMany([{
        "firstName": firstName,
        "lastName": lastName,
        "username": newUsername,
        "password": hashedPassword,
        "email": email,
        "role": "user",
      }])
      console.log("Added 1 user")
    }
    return true
  }
  catch (err) {
    console.log("Unable to update the database!")
    return false
  } 
}

export async function username_exist(username) {
  try {
    if (await fetch_user(username) === null)
      return false;
    else 
      return true;
  }
  catch (err) {
    console.log("Unable to fetch from database!")
  }
}

export async function validate_username(username) {
  try {
    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

    if(format.test(username))
      return false;
    else
      return true;
  }
  catch (err) {
    console.log("Unable to fetch from database!")
  }
}

export async function fetch_email(email) {
  try {
    return await users.findOne({"email": email});
  }
  catch (err) {
    console.log("Unable to fetch from database!")
  }
}

export async function email_exist(email) {
  try {
    if (await fetch_email(email) === null)
      return false;
    else 
      return true;
  }
  catch (err) {
    console.log("Unable to fetch from database!")
  }
}

export async function validate_email(email) {
  try {
    if (email_exist(email) === true)
      return true;
    else if (email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  ))
      return true;
    else
      return false;
  }
  catch (err) {
    console.log("Unable to fetch from database!")
  }
}

export async function fetch_event() {
  try {
    return await events.find().toArray();
  }
  catch (err) {
    console.log("Unable to fetch from database!")
  }
}

export async function fetch_detail(event) {
  try {
    return await events.findOne({"event": event});
  }
  catch (err) {
    console.log("Unable to fetch from database!")
  }
}

export async function update_event(event, title, date, time, venue, info, description) {
  try{
    if (await fetch_detail(event) !== null) {
      await events.updateOne({"event": event}, {$set:{
        "event": event,
        "title": title,
        "date": date,
        "time": time,
        "venue": venue,
        "info": info,
        "description": description,
      }}, {upsert: true})
      console.log("Updated 1 event")
    }
    else {
      await events.insertMany([{
        "event": event,
        "title": title,
        "date": date,
        "time": time,
        "venue": venue,
        "info": info,
        "description": description,
      }])
      console.log("Added 1 event")
    }
    return true
  }
  catch (err) {
    console.log("Unable to update the database!")
    return false
  } 
}

async function update_eventBooked(event, tier) {
  try{
    const deatil = await fetch_detail(event);
    const num = Number(tier);
    const bookedSeats = Number(deatil["info"][num - 1]["booked"]);
    const newBookedSeats = bookedSeats + 1;
    let status;
    if (newBookedSeats === Number(deatil["info"][num - 1]["seat"]))
      status = "full";
    else
      status = "available";

    await events.updateOne({"event": event, "info.tier": tier}, {$set:{
      "info.$.booked": newBookedSeats,
      "info.$.status": status
      }}, {upsert: true})
      console.log("Updated 1 event")
    return true
  }
  catch (err) {
    console.log("Unable to update the database!")
    return false
  } 
}

export async function fetch_seat() {
  try {
    return await seats.find().toArray();
  }
  catch (err) {
    console.log("Unable to fetch from database!")
  }
}

export async function fetch_booked(event) {
  try {
    return await seats.findOne({[event]: {$exists: true}})
  }
  catch (err) {
    console.log("Unable to fetch from database!")
  }
}

export async function transact_payment(event, title, seatNo, tier, price, username) {
  try{
    if (username !== undefined){
      const booked = [{
        "user": username,
        "event": event,
        "title": title,
        "seat": seatNo,
        "tier": tier,
        "price": price
      }]
      await usersBooked.insertMany(booked);
      console.log(username + " booked a seat.")
    }

    await seats.updateOne({[event]: {$exists: true}}, {$push: {[event]: {"seat": seatNo}}}, {upsert: true});
    await update_eventBooked(event, tier);
    console.log("Updated 1 seat")
    return true
  }
  catch (err) {
    console.log("Unable to update the database!")
    return false
  } 
}

export async function fetch_userBooked() {
  try{
    const userBooked = await usersBooked.find().toArray();
    return userBooked;
  }
  catch (err) {
    console.log("Unable to fetch from database!")
    return false
  } 
}

export async function update_userBooked(oldUsername, newUsername) {
  try{
    await usersBooked.updateMany({"user": oldUsername}, {$set:{
      "user": newUsername
    }})
    console.log("Updated 1 record of userBooked")
  }
  catch (err) {
    console.log("Unable to update the database!")
  } 
}

async function remove_userBooked(event, seat) {
  try{
    if (await usersBooked.findOne({"event": event, "seat": seat}) !== null){
      await usersBooked.deleteOne({"event": event, "seat": seat})
      console.log("Removed 1 record of userBooked")
    }
  }
  catch (err) {
    console.log("Unable to update the database!")
  } 
}

export async function update_seat(event, seatNo, option) {
  try{
    if (await fetch_booked(event) === null)
      await seats.insertOne({[event]: []});

    const seat = String(seatNo);

    if (option){
      await seats.updateOne({[event]: {$exists: true}}, {$push: {[event]: {"seat": seat}}}, {upsert: true})

      console.log("Updated 1 seat")
      return true
    }
    else {
      await seats.updateOne({[event]: {$exists: true}}, {$pull: {[event]: {"seat": seat}}})
      await remove_userBooked(event, seat)

      console.log("Removed 1 seat")
      return true
    }
  }
  catch (err) {
    console.log("Unable to update the database!")
    return false
  } 
}

export async function update_icon(oldUsername, newUsername) {
  try{
    await fs.rename(`./static/assets/${oldUsername}.jpg`, `./static/assets/${newUsername}.jpg`)
    console.log("Updated filename of a user's icon")
  }
  catch (err) {
    console.log("Unable to update the database!")
  } 
}

init_db().catch(console.dir);
