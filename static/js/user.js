import {
  getFilename,
  updateImg,
  register,
  updateTierPrice,
  updateEvent
} from './functionList.js';

document.addEventListener('DOMContentLoaded', function () {
  fetch('/auth/me')
    .then((response) => response.json())
    .then(async (data) => {
      if (data.status === 'failed'){
        alert("Please login");
        window.location.href = '/login.html';
      }
      else{
        const buttons = 
          `
          <div><button type="button" id="checkButton" class="btn btn-primary m-3">Check Profile</button></div>
          <div><button type="button" id="updateButton" class="btn btn-primary m-3">Update Profile</button></div>
          `
        $("#buttons").html(buttons);

        if (data.user.role === "admin"){
          $("#welcome").html(`${data.user.username}, you will not get a raise, only minimal wage! Now work!`);
          const adminButtons = 
            `
            <div><button type="button" id="eventButton" class="btn btn-primary m-3">Add Event</button></div>
            <div><button type="button" id="userButton" class="btn btn-primary m-3">View Users</button></div>
            `
          $("#buttons").append(adminButtons);
        }
        else
          $("#welcome").html(`${data.user.username}, welcome back!`);

        $("#buttons").append('<div><button type="button" id="logoutButton" class="btn btn-primary m-3">Logout</button></div>');

        const res = await fetch('/auth/userBooked')
        const usersBooked = JSON.parse(await res.json());
        let userBooked =[];
        usersBooked.forEach((user) => {
          if (user.user === data.user.username)
            userBooked.push(user);
        })

        if (data.user.role === "user"){
          if (userBooked.length === 0)
            $("#msg").html("You currently have not booked any seat.<br>");
          else{
            if (userBooked.length === 1)
              $("#msg").html("You currently have booked the following seat:<br>");
            else
              $("#msg").html("You currently have booked the following seats:<br>");

            for (let i = 0; i < userBooked.length; i++)
              $("#msg").append(`seat ${userBooked[i]["seat"]} of event ${userBooked[i]["title"]}, you payed $${userBooked[i]["price"]}<br>`);
          }
        }
        else{
          if (usersBooked.length === 0)
            $("#msg").html("None of the site users have booked any seat.<br>");
          else{
            if (usersBooked.length === 1)
              $("#msg").html("One user has booked the following seat:<br>");
            else
              $("#msg").html("The following seats are booked by site users:<br>");

            for (let i = 0; i < usersBooked.length; i++){
              if (usersBooked[i]["user"] !== null)
                $("#msg").append(`seat ${usersBooked[i]["seat"]} of event ${usersBooked[i]["title"]}, user ${usersBooked[i]["user"]} payed $${usersBooked[i]["price"]}<br>`);
            }
          }
        }
      }

      document.getElementById('checkButton').addEventListener('click', async function () {
        $("#welcome").html("");

        const filename = await getFilename(data.user.username, true)

        const msg = 
          `
          <div class="row row-cols-lg-2 row-cols-md-2 row-cols-sm-1 justify-content-center">
            <div>
              <div class="p-2">First Name: ${data.user.firstName}</div>
              <div class="p-2">Last Name: ${data.user.lastName}</div>
              <div class="p-2">Username: ${data.user.username}</div>
              <div class="p-2">Email: ${data.user.email}</div>
            </div>
            <div>
              <div>Icon:</div>
              <img class="w-50 h-75 object-fit-cover border rounded”" src="assets/${filename}.jpg" alt="icon">
            </div>
          </div>
          `
        $("#msg").html(msg);

        $("#buttons").html('<button type="button" onClick="window.location.reload()" class="btn btn-secondary m-2">Back</button>');
      })

      document.getElementById('updateButton').addEventListener('click', async () => {
        $("#welcome").html("Change your info by modifying the values below");
        
        const filename = await getFilename(data.user.username, true)

        const form = 
          `
          <form id="uploadForm" action="/auth/uploadImage" method="post" enctype="multipart/form-data">
            <div class="row row-cols-lg-2 row-cols-md-2 row-cols-sm-1 justify-content-center">
              <div>
                <div class="p-2">
                  <label for="firstName">First Name:</label>
                  <input type="text" id="firstName" name="firstName" value="${data.user.firstName}">
                </div>
                <div class="p-2">
                  <label for="lastName">Last Name:</label>
                  <input type="text" id="lastName" name="lastName" value="${data.user.lastName}">
                </div>
                <div class="p-2">
                  <label for="name">Username:</label>
                  <input type="text" id="name" name="name" value="${data.user.username}">
                </div>
                <div class="p-2">
                  <label for="password">Password:</label>
                  <input type="password" id="password" name="password">
                </div>
                <div class="p-2">
                  <label for="repeat">Repeat Your Password:</label>
                  <input type="password" id="repeat" name="repeat">
                </div>
                <div class="p-2">
                  <label for="firstName">Email:</label>
                  <input type="email" id="email" name="email" value="${data.user.email}">
                </div>
                <div class="p-2">
                  <button type="button" id="updateInfo" class="btn btn-primary m-2">Update Info</button>
                  <button type="button" onClick="window.location.reload()" class="btn btn-secondary m-2">Back</button>
                </div>
              </div>
              <div>
                <div>Change Icon:</div>
                <input type="file" id="image" name="image" accept="image/png, image/jpeg, image/jpg">
                <img class="w-50 h-75 object-fit-cover border rounded”" src="assets/${filename}.jpg" alt="icon">
              </div>
            </div>
          </form>
          `
        $("#msg").html(form);

        document.querySelector('input[type="file"]').addEventListener('change', () => updateImg());

        document.getElementById('updateInfo').addEventListener('click', () => register(false));

        $("#buttons").html("");
      })

      if (data.user.role === "admin"){
        document.getElementById('eventButton').addEventListener('click', async  function () {
          const res = await fetch('/auth/event');
          const list = JSON.parse(await res.json());

          $("#welcome").html("Add event by filling out the form below:");
          const form =
            `
            <form id="uploadForm" action="/auth/uploadImage" method="post" enctype="multipart/form-data">
              <div class="row row-cols-lg-2 row-cols-md-1 row-cols-sm-1 justify-content-center text-center">
                <div>
                  <div><input type="hidden" id="name" name="name" value="event${list.length + 1}"></div>
                  <div>Add Event Image:</div>
                  <input type="file" id="image" name="image" accept="image/png, image/jpeg, image/jpg">
                  <img class="w-100 max-height-100 object-fit-cover border rounded”" src="assets/event.jpg" alt="event${list.length + 1}">
                </div>
                <div>
                  <div class="m-3">
                    <label for="title">Title:</label>
                    <input type="text" id="title" name="title">
                  </div>
                  <div>
                    <label for="date">Date:</label>
                    <input type="text" id="date" name="date">
                  </div>
                  <div>
                    <label for="time">Time:</label>
                    <input type="text" id="time" name="time">
                  </div>
                  <div>
                    <label for="venue">Venue:</label>
                    <input type="text" id="venue" name="venue">
                  </div>
                  <div>
                    <label for="description">Description:</label>
                    <input type="text" id="description" name="description">
                  </div>
                  <div>
                    <label for="tier">No. of Seat Tier:</label>
                    <input type="number" id="tier" name="tier" min="1" max="5" onkeydown="return false">
                  </div>
                  <div id="price"></div>
                  <div id="seat"></div>
                  <div id="booked"></div>
                  <div>
                    <label for="status">Status:</label>
                    <select id="status" name="status">
                      <option value="available">available</option>
                      <option value="full">full</option>
                    </select>
                  </div>
                  <div class="p-2">
                    <button type="button" id="addEvent" class="btn btn-primary m-2">Add Event</button>
                    <button type="button" onClick="window.location.reload()" class="btn btn-secondary m-2">Back</button>
                  </div>
                </div>
              </div>
            </form>
            `

          $("#msg").html(form);
          $("#buttons").html("");

          const tier = document.getElementById('tier');
          tier.addEventListener('change', () => updateTierPrice(tier.value, ""));

          document.querySelector('input[type="file"]').addEventListener('change', () => updateImg());

          document.getElementById('addEvent').addEventListener('click', async () => await updateEvent(true))
        })

        document.getElementById('userButton').addEventListener('click', async function () {
          $("#welcome").html("");

          $("#msg").html(`<div id="userList" class="row row-cols-lg-3 row-cols-md-2 row-cols-sm-1 justify-content-center"></div>`)

          $("#buttons").html('<button type="button" onClick="window.location.reload()" class="btn btn-secondary m-2">Back</button>');

          const res = await fetch('/auth/users');
          const userList = JSON.parse(await res.json());

          for (let i = 0; i < userList.length; i++){
            const username = userList[i]["username"];
            const filename = await getFilename(username, true)

            const info = 
              `
              <div class="hidden">
                <img class="w-50 h-50 object-fit-cover border rounded”" src="assets/${filename}.jpg" alt="${username}">
                <div class="p-2">First Name: ${userList[i]["firstName"]}</div>
                <div class="p-2">Last Name: ${userList[i]["lastName"]}</div>
                <div class="p-2">Username: ${username}</div>
                <div class="p-2">Email: ${userList[i]["email"]}</div>
              </div>
              `

            if (i === 0)
              $("#userList").html(info);
            else
              $("#userList").append(info);
          }

          $("div.hidden").show(500);
        })
      }

      document.getElementById('logoutButton').addEventListener('click', function () {
        if (confirm("Confirm to logout?")) {
          fetch('/auth/logout', {
            method: 'POST'
          })
            .then((response) => response.text())
            .then((data) => {
              if (data.length === 0){
                window.location.href = '/login.html';
              }
            })
        }
        else
          return;
      })
    })
});
