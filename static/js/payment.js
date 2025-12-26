let bookedSeats = [];
let event = [];
let seat = [];
let seatList;
let price = 0;

function empty(option){
    if (option === true)
        $("#msg").html('You currently have not selected any seat.');
    else
        $("#msg").html('Thank you for your payment!');

    $("#info").html("");
    localStorage.clear();
}

document.addEventListener('DOMContentLoaded', function () {
    for (let i = 0; i < localStorage.length; i++)
        bookedSeats.push(JSON.parse(localStorage[localStorage.key(i)]));

    if (bookedSeats.length !== 0){
        for (let j = 0; j < bookedSeats.length; j++){
            event.push(bookedSeats[j]["title"])
            seat.push("seat " + bookedSeats[j]["seatNo"] + " of event " + event[j])
            price += bookedSeats[j]["price"]

            if (j === 0)
                seatList = seat[j];
            else
                seatList = seatList.concat("<br>", seat[j]);
        }

        if (bookedSeats.length === 1)
            $("#msg").html('You have chosen the following seat, are you sure?');
        else
            $("#msg").html('You have chosen the following seats, are you sure?');

        const booked =
            `
            <div>
                <h3 class="m-3 text-center">${seatList}</h3>
                <div class="text-center">Total Price: $${price}</div>
                <div class="text-center">
                    <button id="pay" type="button" class="btn btn-primary m-2">Proceed to Payment</button>
                    <button id="empty" type="button" class="btn btn-secondary m-2">Empty the Cart</button>
                </div>
            </div>
            `
        $("#info").html(booked);

        document.getElementById('empty').addEventListener('click', function () {empty(true)})

        document.getElementById('pay').addEventListener('click', function () {
            $("#msg").html("");

            fetch('/auth/me')
                .then((response) => response.json())
                .then((data) => {
                    if (data.status === 'failed'){
                        const form =
                            `
                            <form action="/auth/pay" method="post" enctype="multipart/form-data">
                                <div class="p-3 text-center">
                                    <label for="firstName">First Name:</label>
                                    <input type="text" id="firstName" name="firstName">
                                </div>
                                <div class="p-3 text-center">
                                    <label for="lastName">Last Name:</label>
                                    <input type="text" id="lastName" name="lastName">
                                </div>
                                <div class="p-3 text-center">
                                    <label for="email">Email:</label>
                                    <input type="email" id="email" name="email">
                                </div>
                            `
                        $("#info").html(form);
                    }
                    else
                        $("#info").html('<form action="/auth/pay" method="post" enctype="multipart/form-data">');

                    const form =
                        `
                        <div class="p-3 text-center">
                            <label for="card">Credit Card Number:</label>
                            <input type="text" id="card" name="card">
                        </div>
                        <div class="p-3 text-center">
                            <label for="date">Card Expiration Date:</label>
                            <input type="text" id="date" name="date">
                        </div>
                        <div class="p-3 text-center">
                            <label for="code">Card Security Code:</label>
                            <input type="text" id="code" name="code">
                        </div>
                        <div class="text-center">
                            <button type="button" id="finishPayment" class="btn btn-primary m-2">Pay</button>
                            <button type="button" onClick="window.location.reload()" class="btn btn-secondary m-2">Back</button>
                        </div>
                        </form>
                        `
                    $("#info").append(form);

                    document.getElementById('finishPayment').addEventListener('click', async function () {
                        for (let k = 0; k < bookedSeats.length; k++){
                            const formData = new FormData();
                            formData.append('event', bookedSeats[k]["event"]);
                            formData.append('title', bookedSeats[k]["title"]);
                            formData.append('seatNo', String(bookedSeats[k]["seatNo"]));
                            formData.append('tier', String(bookedSeats[k]["tier"]));
                            formData.append('price', String(bookedSeats[k]["price"]));
                            if (data.status === 'failed'){
                                formData.append('firstName', document.getElementById('firstName').value);
                                formData.append('lastName', document.getElementById('lastName').value);
                                formData.append('email', document.getElementById('email').value);
                            }
                            else{
                                formData.append('firstName', data.user.firstName);
                                formData.append('lastName', data.user.lastName);
                                formData.append('email', data.user.email);
                            }
                            formData.append('card', document.getElementById('card').value);
                            formData.append('date', document.getElementById('date').value);
                            formData.append('code', document.getElementById('code').value);

                            const res = await fetch('/auth/pay', {
                                method: 'POST',
                                body: formData,
                            });
                            const process = await res.json();

                            if (process.status === 'failed'){
                                alert(process.message);
                                break;
                            }
                            else if (process.status === 'success'){
                                if (k === (bookedSeats.length - 1))
                                    empty(false);
                            }
                            else {
                                alert('error');
                                break;
                            }
                        }
                    })
                })
        })
    }
    else
        empty(true);
});
