let settings = {};
let loaded = false;
let data;

load().
    then(function () {
        loaded = true;
    }).
    catch(err => {
        console.log("ERROR?");
        console.error(err);
    });


async function load() {
    data = await getData("http://localhost:3000/data");
    data = expandData(data);
    console.log(data);
    settingsJSON = await getSettings("./json/settings.json");
    settings = JSON.parse(JSON.stringify(settingsJSON));
    vizData(data);
    applySettings(settings);


}


async function getData(d) {
    const response = await fetch(d);
    const data = await response.json();
    // console.log(data);
    return data;
}

async function getSettings(s) {
    const response = await fetch(s);
    const settings = await response.json();
    // console.log(settings);
    return settings;
}


function applySettings(settings) {
    // console.log(settings);
    if (settings.color) {
        // document.getElementById("controlPanel").style.backgroundColor = settings.color;
    }
    if (settings.show) {
        const s = settings.show;
        if (s.entities === true || s.entities === false) settingsShow("entities", "#entities");
        if (s.date === true || s.date === false) settingsShow("date", ".date");
        if (s.time === true || s.time === false) settingsShow("time", ".time");
        if (s.interactions === true || s.interactions === false) settingsShow("interactions", ".notTheLast");
    }
}


function vizData(data) {

    const tableInt = document.getElementById("relationshipsTable");
    const tableEnt = document.getElementById("entitiesTable");

    for (let i = data.ent.length - 1; i >= 0; i--) {

        const tdEnt = tableEnt.appendChild(document.createElement("tr")).appendChild(document.createElement("td"));

        tdEnt.innerHTML = "<span class='ent input' id='" + data.ent[i]._id + "'>" + data.ent[i].self + "</span>";
        tdEnt.innerHTML += "<span class='ent'>&nbsp;</span>";
        tdEnt.innerHTML += "<span class='ent grey'>(" + data.ent[i].others.length + "/" + data.ent[i].totalInt + ")</span>";

    }


    for (let i = data.int.length - 1; i >= 0; i--) {

        const tdDate = tableInt.appendChild(document.createElement("tr")).appendChild(document.createElement("td"));
        const tdInt = tableInt.appendChild(document.createElement("tr")).appendChild(document.createElement("td"));

        if (data.int[i].lastOfTheDay) {
            tdDate.innerHTML = "<span class='date'>" + data.int[i].d + "</span>";
        }

        tdInt.innerHTML += "<span class='int time'>&nbsp;&nbsp;</span";
        tdInt.innerHTML += "<span class='int time'>" + data.int[i].t + "</span>";
        tdInt.innerHTML += "<span class='int time'>&nbsp;</span>";
        if (data.int[i].selfA === "settings" || data.int[i].selfB === "settings") {
            tdInt.innerHTML += "<span class='int input settings'><span class='intA'>" + data.int[i].selfA + "</span><span> ——— </span><span class='intB'>" + data.int[i].selfB + "</span></span>";
        } else {
            tdInt.innerHTML += "<span class='int input'><span class='intA'>" + data.int[i].selfA + "</span><span> ——— </span><span class='intB'>" + data.int[i].selfB + "</span></span>";
        }
        if (data.int[i].c) {
            tdInt.innerHTML += "<span class='int'>&nbsp;</span>";
            tdInt.innerHTML += "<span class='int connection'>" + data.int[i].c + "</span>";
        }

        if (!data.int[i].lastOfTheSame) {
            for (let i = 0; i < tdInt.getElementsByClassName("int").length; i++) {
                tdInt.getElementsByClassName("int")[i].classList.add("notTheLast");
                tdInt.getElementsByClassName("int")[i].classList.add("grey");
            }
        }

    }


    setupButtons();

}


//toogle elements in settings (show/hide)
function settingsShow(settingsKey, involvedElements) {
    const e = document.querySelectorAll(involvedElements);
    for (let i = 0; i < e.length; i++) {
        if (settings.show[settingsKey]) {
            e[i].classList.remove("hide");
        } else {
            e[i].classList.add("hide");
        }
    }
}

//add event listeners to enable buttons
function setupButtons() {

    ////////////////////////////////
    //add event listeners to settings buttons
    document.getElementById("entitiesButton").addEventListener("click", function () {
        settings.show.entities = !settings.show.entities;
        settingsShow("entities", "#entities");
    });

    document.getElementById("dateButton").addEventListener("click", function () {
        settings.show.date = !settings.show.date;
        settingsShow("date", ".date");
    });

    document.getElementById("timeButton").addEventListener("click", function () {
        settings.show.time = !settings.show.time;
        settingsShow("time", ".time");
    });

    const interactionsButton = document.getElementById("interactionsButton");
    interactionsButton.addEventListener("click", function () {
        settings.show.interactions = !settings.show.interactions;
        if (interactionsButton.value === "show all interactions") {
            interactionsButton.value = "show only last interactions";
        } else {
            interactionsButton.value = "show all interactions";
        }
        settingsShow("interactions", ".notTheLast");
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
    }

}