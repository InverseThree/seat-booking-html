import {getFilename} from './functionList.js';

let text;

document.addEventListener('DOMContentLoaded', function () {
    fetch('/auth/event')
        .then((response) => response.json())
        .then(async(data) => {
            const list = JSON.parse(data);
            const res = await fetch('/auth/me');
            const info = await res.json();

            if (info.user.role === 'admin')
                text = 'Manage'
            else
                text = 'More Detail'
            
            for(let i = 0; i < list.length; i++){
                const filename = await getFilename(list[i]["event"], false)

                const event =
                    `
                    <div id="info${i}" class="text-center hidden">
                        <img class="w-100 h-50 object-fit-cover border rounded”" src="assets/${filename}.jpg" alt="${list[i]["event"]}">
                        <h3 class="m-3">${list[i]["title"]}</h3>
                        <div>Date: ${list[i]["date"]}</div>
                        <div>Venue: ${list[i]["venue"]}</div>
                        <div><button id="${list[i]["event"]}" type="button" class="btn btn-primary m-3">${text}</button></div>
                    </div>
                    `
                $("#eventList").append(event);

                document.getElementById(list[i]["event"]).addEventListener('click', function () {
                    const event = list[i]["event"];

                    const formData = new FormData();
                    formData.append('event', event);

                    fetch('/auth/detail', {
                        method: 'POST',
                        body: formData,
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            if (data.status === 'success') {
                                window.location.href = '/detail.html';
                                sessionStorage.setItem("detail", JSON.stringify(data.detail));
                                sessionStorage.setItem("lastURL", window.location.href);
                            }
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                            alert(error);
                        });
                });

            }
            $("div.hidden").show(500);

            const search = document.getElementById("search");

            for (let j = 0; j < list.length; j++){
                let status;

                for (let k = 0; k < list[j]["info"].length; k++){
                    if (list[j]["info"][k]["status"] === "available"){
                        status = "available";
                        break;
                    }
                }
                if (status === undefined)
                    status = "full";

                const items = [list[j]["title"], list[j]["date"], list[j]["time"], list[j]["venue"], list[j]["description"], status];

                search.addEventListener('change', () => {
                    if (items.some(item => item.toLowerCase().includes(search.value.toLowerCase()))){
                        $(`#info${j}`).removeClass("d-none");
                        $(`#info${j}`).addClass("d-block");
                    }
                    else {
                        $(`#info${j}`).addClass("d-none");
                        $(`#info${j}`).removeClass("d-block");
                    }
                })
            }
        })

});
