// let settings = {};
let loaded = false;
let data;

let socket = io.connect("http://localhost:3000");

load().
    then(function () {
        loaded = true;
        console.log("render loaded");
    }).
    catch(err => {
        console.log("ERROR loading render");
        console.error(err);
    });


async function load() {
    const rawData = await getData("http://localhost:3000/data");
    console.log("raw", rawData);
    data = JSON.parse(JSON.stringify(rawData)); //deep clone
    console.log(data);
    data = indexData(data);
    data = expandData(data);

    vizData(data);

    applySettings(data.app[0].settings);


    socket.on("hellofromserver", function (data) {
        console.log(data);
        socket.emit("hellofromclient", "websockets: hello from client");
    });


    console.log(data);

}

function sendMessageToTheServer(s) {
    console.log("click on settings:", s);
    socket.emit("settings", s);

}

socket.on("settingsresponse", function (res) {
    if (res) {
        // console.log("response: ", res);

        applySettings(res);

    }
});


async function getData(d) {
    const response = await fetch(d);
    const data = await response.json();
    // console.log(data);
    return data;
}

function applySettings(settings) {

    settingsShow("showEntities", "#entities");
    settingsShow("showInteractions", ".notTheLast");

    //toogle elements in settings (show/hide)
    function settingsShow(settingsKey, involvedElements) {
        const e = document.querySelectorAll(involvedElements);
        for (let i = 0; i < e.length; i++) {
            if (settings[settingsKey]) {
                e[i].classList.remove("hide");
            } else {
                e[i].classList.add("hide");
            }
        }
    }

}

function updateSetting(s) {

}


function vizData(data) {

    const tableInt = document.getElementById("relationshipsTable");
    const tableEnt = document.getElementById("entitiesTable");

    for (let i = data.ent.length - 1; i >= 0; i--) {

        const tdEnt = tableEnt.appendChild(document.createElement("tr")).appendChild(document.createElement("td"));

        tdEnt.innerHTML = "<span class='ent input' id='" + data.ent[i]._id + "'>" + data.app.ent[i].c + "</span>";
        tdEnt.innerHTML += "<span class='ent'>&nbsp;</span>";
        tdEnt.innerHTML += "<span class='ent grey'>(" + data.ent[i].rels.length + "/" + data.app.ent[i].totalInt + ")</span>";

    }


    for (let i = data.int.length - 1; i >= 0; i--) {

        const tdDate = tableInt.appendChild(document.createElement("tr")).appendChild(document.createElement("td"));
        const tdInt = tableInt.appendChild(document.createElement("tr")).appendChild(document.createElement("td"));

        if (data.app.int[i].lastOfTheDay) {
            tdDate.innerHTML = "<span class='date'>" + data.app.int[i].d + "</span>";
        }

        tdInt.innerHTML += "<span class='int time'>&nbsp;&nbsp;</span";
        tdInt.innerHTML += "<span class='int time'>" + data.app.int[i].t + "</span>";
        tdInt.innerHTML += "<span class='int time'>&nbsp;</span>";
        // if (data.int[i].ents.a === data.int[i].ents.b && data.int[i].context.c === "settings") {
        //     tdInt.innerHTML += "<span class='int input settings'><span class='intA'>" + data.int[i].selfA + "</span><span> ——— </span><span class='intB'>" + data.int[i].selfB + "</span></span>";
        // } else {
        tdInt.innerHTML += "<span class='int input' id='" + data.int[i]._id + "'><span class='intA'>" + data.app.ent[data.app.int[i].aIndex].c + "</span><span> ——— </span><span class='intB'>" + data.app.ent[data.app.int[i].bIndex].c + "</span></span>";
        // }
        if (data.int[i].context.c) {
            tdInt.innerHTML += "<span class='int'>&nbsp;</span>";
            tdInt.innerHTML += "<span class='int connection'>" + data.int[i].context.c + "</span>";
        }

        if (!data.app.int[i].lastOfTheSame) {
            for (let i = 0; i < tdInt.getElementsByClassName("int").length; i++) {
                tdInt.getElementsByClassName("int")[i].classList.add("notTheLast");
                tdInt.getElementsByClassName("int")[i].classList.add("grey");
            }
        }

    }


    setupButtons();

}




//add event listeners to enable buttons
function setupButtons() {

    ////////////////////////////////
    //add event listeners to settings buttons
    document.getElementById("entitiesButton").addEventListener("click", function () {
        // settings.showEntities = !settings.showEntities;
        // settingsShow("showEntities", "#entities");
        sendMessageToTheServer("showEntities");
    });

    const interactionsButton = document.getElementById("interactionsButton");
    interactionsButton.addEventListener("click", function () {
        // settings.showInteractions = !settings.showInteractions;
        // if (interactionsButton.value === "show all interactions") {
        //     interactionsButton.value = "show only last interactions";
        // } else {
        //     interactionsButton.value = "show all interactions";
        // }
        // settingsShow("showInteractions", ".notTheLast");
        sendMessageToTheServer("showInteractions");
    });

    ////////////////////////////////
    //add event listeners to all listed elements to prefill inputs
    const inA = document.getElementById("inputA");
    const inB = document.getElementById("inputB");

    //list of entities
    const ents = document.getElementsByClassName("ent input");
    let inAfocus = true;

    inA.addEventListener("click", function () { inAfocus = true; });
    inB.addEventListener("click", function () { inAfocus = false; });

    for (let i = 0; i < ents.length; i++) {
        ents[i].addEventListener("click", function () {
            if (inAfocus) {
                inA.value = ents[i].innerHTML;
                inB.focus();
                inAfocus = false;
            } else {
                inB.value = ents[i].innerHTML;
                inA.focus();
                inAfocus = true;
            }
        });

        ents[i].addEventListener("mouseenter", function (e) {
            highlightEnt(e.target.id);
        });

        ents[i].addEventListener("mouseleave", function () {
            notHighlightAny();
        });
    }

    //list of relationships
    const ints = document.getElementsByClassName("int input");

    for (let i = 0; i < ints.length; i++) {
        ints[i].addEventListener("click", function () {
            inA.value = this.getElementsByClassName("intA")[0].innerHTML;
            inB.value = this.getElementsByClassName("intB")[0].innerHTML;
            document.getElementById("inputC").focus();
            inAfocus = true;
        });

        ints[i].addEventListener("mouseenter", function (e) {
            highlightInt(e.target.id);
            // console.log(e.target.id);
        });

        ints[i].addEventListener("mouseleave", function () {
            notHighlightAny();
        });

    }

}