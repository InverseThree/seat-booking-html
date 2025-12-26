let seatNo = 0;
let totalSeat = 0;
let row = 0;
let totalSeatNo = 0;
let tier = 0; 
let booked = [];

async function show (event, title, seatNo, tier, price){
    const info = {
        "event": event,
        "title": title,
        "seatNo": seatNo,
        "tier": tier,
        "price": price,
    }

    if ($("#" + seatNo).hasClass('booked')){
        fetch('/auth/me')
            .then((response) => response.json())
            .then(async (data) => {
                if (data.user.role === "admin"){
                    const res = await fetch('/auth/userBooked')
                    const userBooked = JSON.parse(await res.json());

                    for (let i = 0; i < userBooked.length; i++){
                        if (userBooked[i]["event"] === event && userBooked[i]["seat"] === String(seatNo)){
                            const formData = new FormData();
                            formData.append('username', userBooked[i]["user"]);

                            fetch('/auth/user', {
                                method: 'POST',
                                body: formData,
                            })
                                .then((response) => response.json())
                                .then((data) => {
                                    if (data.status === 'success') {
                                        if (confirm(`This seat is booked by ${userBooked[i]["user"]}. show user info?`))
                                            alert(`Username: ${userBooked[i]["user"]}\nFirst Name: ${data["user"]["firstName"]}\nLast Name: ${data["user"]["lastName"]}\nEmail: ${data["user"]["email"]}`);
                                    }
                                })
                                .catch((error) => {
                                    console.error('Error:', error);
                                    alert(error);
                                });

                            break;
                        }
                        else if (i === (userBooked.length - 1))
                            alert ("This seat is booked by a non-registered user.");
                    }
                }
                else
                    alert ("This seat is already booked.");
            })
        return;
    }
    else if ($("#" + seatNo).hasClass('selected')){
        $("#msg").html("Do you want to cancel the selection of seat " + seatNo + "?<br>Price: $" + price);
        $("#buttons").html("<div class='text-center'><button id='cancel' type='button' class='btn btn-primary m-3 btn-sm'>Cancel</button><button id='back' type='button' class='btn btn-secondary m-3 btn-sm'>Back</button></div>");

        document.getElementById('cancel').addEventListener('click', function () {
            localStorage.removeItem(event + "Seat" + seatNo, JSON.stringify(info));
            $("#msg").html("");
            $("#buttons").html("");
            window.location.reload();
        })
    }
    else{
        $("#msg").html("Do you want to book seat " + seatNo + "?<br>Price: $" + price);
        $("#buttons").html("<div class='text-center'><button id='book' type='button' class='btn btn-primary m-3 btn-sm'>Book</button><button id='back' type='button' class='btn btn-secondary m-3 btn-sm'>Back</button></div>");

        document.getElementById('book').addEventListener('click', function () {
            localStorage.setItem(event + "Seat" + seatNo, JSON.stringify(info));
            $("#msg").html("");
            $("#buttons").html("");
            window.location.reload();
        })
    }
    document.getElementById('back').addEventListener('click', function () {
        $("#msg").html("");
        $("#buttons").html("");
    })
};

document.addEventListener('DOMContentLoaded', function () {
    fetch('/auth/seat')
        .then((response) => response.json())
        .then((data) => {
            const bookedList = JSON.parse(data);
            const list = JSON.parse(sessionStorage.getItem("detail"));

            if (list !== null){
                for (let i = 0; i < list["info"].length; i++)
                    totalSeat += Number(list["info"][i]["seat"]);

                for (let j = 0; j < bookedList.length; j++){
                    if (bookedList[j][list["event"]] !== undefined){
                        for (let k = 0; k < bookedList[j][list["event"]].length; k++)
                            booked.push(Number(bookedList[j][list["event"]][k]["seat"]));
                    }
                }

                $("#placeholder").append(`<svg id="seat" width="500" height="${(4 * totalSeat) + 150}" class="d-block mx-auto"></svg>`);

                $("#seat").append('<rect x="0" y="10" width="500" height="30" fill="grey" />');
                $("#seat").append('<text x="225" y="30" fill="white">Screen</text>');

                while (seatNo < totalSeat){
                    $("#seat").append(`<g>`);
                    for (let l = 0; l < 10; l++){
                        seatNo++;

                        $("#seat").append(`<rect id="${seatNo}" x="${50 + l * 40}" y="${50 + row * 40}" width="35" height="30" class="btn" onclick="show(\'${list["event"]}\', \'${list["title"]}\', ${seatNo}, ${tier + 1}, ${list["info"][tier]["price"]})" />`);

                        if (booked.includes(seatNo))
                            $("#" + seatNo).addClass("booked");
                        else if (localStorage.getItem(list["event"] + "Seat" + seatNo) !== null)
                            $("#" + seatNo).addClass("selected");
                        else
                            $("#" + seatNo).addClass("seat");

                        $("#seat").append(`<text x="${(50 + l * 40) + 5}" y="${(50 + row * 40) + 20}" fill="white">${seatNo}</text>`);

                        if (seatNo === Number(list["info"][tier]["seat"]) + totalSeatNo){
                            if (tier === (list["info"].length - 1))
                                break;
                            else{
                                totalSeatNo = seatNo;
                                tier++;
                                $("#seat").append(`<rect x="0" y="${(50 + row * 40) + 32.5}" width="500" height="5" fill="black" />`);
                                break;
                            }
                        }
                    }
                    $("#seat").append(`</g>`);
                    row++;
                }

                $("#placeholder").html($("#placeholder").html());
                $("#placeholder").append(`<div class="p-2 text-center"><a href="${document.referrer}" class="btn btn-secondary m-3">Back</a></div>`);
            }
            else
                window.location.href = '/event.html';
        })
});
