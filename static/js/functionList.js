export let status;
export let totalPrice;
export let default1;
export let default2;
export let text;
export let hide;
export let show = "d-none";

export async function getFilename(name, option){
  const res = await fetch(`assets/${name}.jpg`, {method: 'HEAD'})
  if (res.ok)
    return name;
  else if (option)
    return "icon";
  else
    return "event";
}

export function updateImg(){
  const path = document.querySelector('input[type="file"]');

  if (path.files && path.files[0]) {
    const img = document.querySelector('img');
    img.onload = () => {
      URL.revokeObjectURL(img.src);
    }

    img.src = URL.createObjectURL(path.files[0]);
  }
}

export function register(option){
  fetch('/auth/me')
    .then((response) => response.json())
    .then((data) => {
      const firstName = document.getElementById('firstName').value;
      const lastName = document.getElementById('lastName').value;
      const oldUsername = data.user.username;
      const newUsername = document.getElementById('name').value;
      const password = document.getElementById('password').value;
      const repeat = document.getElementById('repeat').value;
      const email = document.getElementById('email').value;
      const role = data.user.role;
      const image = document.getElementById('image').value;

      if (!firstName || !lastName) {
        alert('First name and last name cannot be empty');
        return;
      }
      if (!newUsername || !password) {
        alert('Username and password cannot be empty');
        return;
      }
      else if (password.length < 8) {
        alert('Password must be at least 8 characters');
        return;
      }
      else if (password != repeat) {
        alert('Password mismatch');
        return;
      }
      else if (!email) {
        alert('Please enter your Email address');
        return;
      }

      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('oldUsername', oldUsername);
      formData.append('newUsername', newUsername);
      formData.append('username', newUsername);
      formData.append('password', password);
      formData.append('email', email);
      formData.append('role', role);

      fetch('/auth/register', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then(async (data) => {
          if (data.status === 'success') {
            if (option)
              alert(`Welcome, ${data.user.username}!\nYou can login with your account now!`);
            else {
              alert(`${data.user.username}, your info have been updated.`);

              await fetch('/auth/login', {
                method: 'POST',
                body: formData
              })

              await fetch('/auth/updateUserBooked', {
                method: 'POST',
                body: formData
              })

              if (oldUsername !== newUsername)
                await fetch('/auth/updateIcon', {
                  method: 'POST',
                  body: formData
                })
            }

            if (image !== "")
              await document.getElementById('uploadForm').submit();
            else if (option)
              window.location.href = 'login.html'
            else
              window.location.href = 'user.html'
          }
          else if (data.status === 'failed')
            alert(data.message);
          else
            alert('error');
        })
        .catch((error) => {
          console.error('Error:', error);
          alert(error);
        })
    })
}

export function updateTierPrice(tier, value){
    let price;
    let seat;
    let booked;

    for (let i = 0; i < tier; i++){
        if (value[i] === undefined){
            price =
                `
                <div>
                    <label for="price${i + 1}">Tier ${i + 1} Price:</label>
                    <input type="text" id="price${i + 1}" name="price${i + 1}">
                </div>
                `
            seat =
                `
                <div>
                    <label for="seat${i + 1}">No. of Tier ${i + 1} Seat(s):</label>
                    <input type="text" id="seat${i + 1}" name="seat${i + 1}">
                </div>
                `
            booked =
                `
                <div>
                    <label for="booked${i + 1}">No. of Tier ${i + 1} Booked Seat(s):</label>
                    <input type="text" id="booked${i + 1}" name="booked${i + 1}">
                </div>
                `
        }
        else {
            price =
                `
                <div>
                    <label for="price${i + 1}">Tier ${i + 1} Price:</label>
                    <input type="text" id="price${i + 1}" name="price${i + 1}" value="${value[i]["price"]}">
                </div>
                `
            seat =
                `
                <div>
                    <label for="seat${i + 1}">No. of Tier ${i + 1} Seat(s):</label>
                    <input type="text" id="seat${i + 1}" name="seat${i + 1}" value="${value[i]["seat"]}">
                </div>
                `
            booked =
                `
                <div>
                    <label for="booked${i + 1}">No. of Tier ${i + 1} Booked Seat(s):</label>
                    <input type="text" id="booked${i + 1}" name="booked${i + 1}" value="${value[i]["booked"]}">
                </div>
                `
        }

        if (i === 0){
            $('#price').html(price);
            $('#seat').html(seat);
            $('#booked').html(booked);
        }
        else {
            $('#price').append(price);
            $('#seat').append(seat);
            $('#booked').append(booked);
        }

    }
}

export async function checkAvailability(info, option){
    let infoStatus;
    status = undefined;

    if (!option)
        infoStatus = document.getElementById('status').value;

    for (let j = 0; j < info.length; j++){
        if (option){
            const price = info[j]["price"];
            if (j === 0)
                totalPrice = "$" + price;
            else
                totalPrice = totalPrice.concat("/$", price);

        }
        else {
            if (info[j]["status"] === "available" && infoStatus === "full"){
                alert('Status contradicts with seats info');
                return false;
            }
        }

        if (info[j]["status"] === "available"){
            status = "available";
            default1 = "selected";
        }
    }

    if (status === undefined){
        if (option){
            status = "full";
            default2 = "selected";
            hide = "d-none";
        }
        else {
            if (infoStatus === "available"){
                alert('Status contradicts with seats info');
                return false;
            }
        }
    }
    
    if (option){
        const res = await fetch('/auth/me');
        const userInfo = await res.json();

        if (userInfo.user.role === 'admin'){
            hide = undefined;
            show = undefined;
            text = 'Check Seat';
        }
        else
            text = 'Book';
    }

    return true;
}

export async function updateEvent(option){
    const event = document.getElementById('name').value;
    const title = document.getElementById('title').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const venue = document.getElementById('venue').value;
    const description = document.getElementById('description').value;
    const tier = document.getElementById('tier').value;
    const image = document.getElementById('image').value;
    const info = [];

    if (!title || !date || !time || !venue || !description || ! tier){
        alert('Missing fields');
        return;
    }

    for (let k = 0; k < tier; k++){
        const price = document.getElementById(`price${k + 1}`).value;
        const seat = document.getElementById(`seat${k + 1}`).value;
        const booked = document.getElementById(`booked${k + 1}`).value;
        let infoStatus;

        if (!price || !seat || !booked){
            alert('Missing fields');
            return;
        }
        else if (isNaN(price) || isNaN(seat) || isNaN(booked)){
            alert('Value of price, seat, or booked seat must be a number');
            return;
        }
        else if (Number(seat) < Number(booked)){
            alert('Number of booked seats cannot exceeds total seats\'');
            return;
        }
        else if (seat === booked)
            infoStatus = "full";
        else
            infoStatus = "available";

        info.push({
            "price": price,
            "tier": k + 1,
            "seat": seat,
            "booked": booked,
            "status": infoStatus,
        })
    }

    if (await checkAvailability(info, false) === false)
        return;

    const formData = new FormData();
    formData.append('event', event);
    formData.append('title', title);
    formData.append('date', date);
    formData.append('time', time);
    formData.append('venue', venue);
    formData.append('info', JSON.stringify(info));
    formData.append('description', description);

    await fetch('/auth/updateSeat', {
        method: 'POST',
        body: formData,
    })

    await fetch('/auth/updateEvent', {
        method: 'POST',
        body: formData,
    })
        .then((response) => response.json())
        .then(async (data) => {
            if (data.status === 'success') {
                if (option)
                    alert(`Event ${title} added.`);
                else {
                    alert(`Event ${title} modified.`);

                    const res = await fetch('/auth/detail', {
                        method: 'POST',
                        body: formData
                    });
                    const info = await res.json();

                    sessionStorage.setItem("detail", JSON.stringify(info.detail));
                }

                if (image !== "")
                    await document.getElementById('uploadForm').submit();
                else
                    window.location.reload();
            }
            else if (data.status === 'failed')
                alert(data.message);
            else
                alert('error');
        })
        .catch((error) => {
            console.error('Error:', error);
            alert(error);
        })
}
