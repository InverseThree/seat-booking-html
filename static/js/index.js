import {getFilename} from './functionList.js';

document.addEventListener('DOMContentLoaded', function () {
    fetch('/auth/event')
        .then((response) => response.json())
        .then(async(data) => {
            const list = JSON.parse(data);
            let lastNum;

            for(let i = 0; i < 2; i++){
                let num = Math.floor(Math.random() * list.length)
                while (num === lastNum)
                    num = Math.floor(Math.random() * list.length)
                lastNum = num 

                const filename = await getFilename(list[num]["event"], false);
                let event =
                    `
                    <div class="hidden">
                        <img class="w-100 h-50 object-fit-cover border rounded”" src="assets/${filename}.jpg" alt="${list[num]["event"]}">
                        <h3 class="m-3 text-center">${list[num]["title"]}</h3>
                        <div class="text-center">Date: ${list[num]["date"]}</div>
                        <div class="text-center">Venue: ${list[num]["venue"]}</div>
                        <div class="text-center"><button id="${list[num]["event"]}" type="button" class="btn btn-primary m-3">More Detail</button></div>
                    </div>
                    `
                $("#randomEvent").append(event);

                document.getElementById(list[num]["event"]).addEventListener('click', function () {
                    const event = list[num]["event"];

                    const formData = new FormData();
                    formData.append('event', event);

                    fetch('/auth/detail', {
                        method: 'POST',
                        body: formData,
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            if (data.status === 'success') {
                                sessionStorage.setItem("detail", JSON.stringify(data.detail));
                                sessionStorage.setItem("lastURL", window.location.href);
                                window.location.href = '/detail.html';
                            }
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                            alert(error);
                        });
                });

            }
            $("div.hidden").show(500);
        })
});

