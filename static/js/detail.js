import {
    status,
    totalPrice,
    default1,
    default2,
    text,
    hide,
    show,
    updateImg,
    getFilename,
    updateTierPrice,
    checkAvailability,
    updateEvent
} from './functionList.js';

document.addEventListener('DOMContentLoaded', async function () {
    const list = JSON.parse(sessionStorage.getItem("detail"));
    if (list !== null){
        await checkAvailability(list["info"], true);

        const filename = await getFilename(list["event"], false);
        const lastURL = sessionStorage.getItem("lastURL");

        const event =
            `
            <div class="row row-cols-lg-2 row-cols-md-1 row-cols-sm-1 justify-content-center">
                <div>
                    <img class="w-100 h-100 object-fit-cover border rounded”" src="assets/${filename}.jpg" alt="${list["event"]}">
                </div>
                <div class="text-center">
                    <h3 class="m-3">${list["title"]}</h3>
                    <div>Date: ${list["date"]}</div>
                    <div>Time: ${list["time"]}</div>
                    <div>Venue: ${list["venue"]}</div>
                    <div>Description: ${list["description"]}</div>
                    <div>No. of Seat Tier: ${list["info"].length}</div>
                    <div>Price: ${totalPrice}</div>
                    <div>Status: ${status}</div>
                    <div>
                        <button id="edit" type="button" class="btn btn-primary m-3 ${show}">Edit Event</button>
                        <a id="${list["event"]}" href="booking.html" class="btn btn-primary m-3 ${hide}">${text}</a>
                        <a href="${lastURL}" class="btn btn-secondary m-3">Back</a>
                    </div>
                </div>
            </div>
            `
        $("#event").append(event);

        document.getElementById('edit').addEventListener('click', async () => {
            const form = 
                `
                <form id="uploadForm" action="/auth/uploadImage" method="post" enctype="multipart/form-data">
                    <div class="row row-cols-lg-2 row-cols-md-1 row-cols-sm-1 justify-content-center text-center">
                        <div>
                            <div><input type="hidden" id="name" name="name" value="${list["event"]}"></div>
                            <div>Change Event Image:</div>
                            <input type="file" id="image" name="image" accept="image/png, image/jpeg, image/jpg">
                            <img class="w-100 max-height-100 object-fit-cover border rounded”" src="assets/${filename}.jpg" alt="${list["event"]}">
                        </div>
                        <div>
                            <h3 class="m-3">
                                <label for="title">Title:</label>
                                <input type="text" id="title" name="title" value="${list["title"]}">
                            </h3>
                            <div>
                                <label for="date">Date:</label>
                                <input type="text" id="date" name="date" value="${list["date"]}">
                            </div>
                            <div>
                                <label for="time">Time:</label>
                                <input type="text" id="time" name="time" value="${list["time"]}">
                            </div>
                            <div>
                                <label for="venue">Venue:</label>
                                <input type="text" id="venue" name="venue" value="${list["venue"]}">
                            </div>
                            <div>
                                <label for="description">Description:</label>
                                <input type="text" id="description" name="description" value="${list["description"]}">
                            </div>
                            <div>
                                <label for="tier">No. of Seat Tier:</label>
                                <input type="number" id="tier" name="tier" value="${list["info"].length}" min="1" max="5" onkeydown="return false">
                            </div>
                            <div id="price"></div>
                            <div id="seat"></div>
                            <div id="booked"></div>
                            <div>
                                <label for="status">Status:</label>
                                <select id="status" name="status">
                                    <option ${default1} value="available">available</option>
                                    <option ${default2} value="full">full</option>
                                </select>
                            </div>
                            <div class="p-2">
                                <button type="button" id="updateInfo" class="btn btn-primary m-2">Update Info</button>
                                <button type="button" onClick="window.location.reload()" class="btn btn-secondary m-2">Back</button>
                            </div>
                        </div>
                    </div>
                </form>
                `
            $("#event").html(form);

            const tier = document.getElementById('tier');
            updateTierPrice(tier.value, list["info"]);
            tier.addEventListener('change', () => updateTierPrice(tier.value, list["info"]));

            document.querySelector('input[type="file"]').addEventListener('change', () => updateImg());

            document.getElementById('updateInfo').addEventListener('click', async () => await updateEvent(false));
        })
    }
    else
        window.location.href = '/event.html';
});
