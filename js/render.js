const data_url = "http://localhost:3000/data"
let settings = {};



load().
    catch(err => {
        console.log("ERROR?");
        console.error(err);
    });


async function load() {
    let data = await getData();
    data = expandData(data);
    settingsJSON = await getSettings();
    settings = JSON.parse(JSON.stringify(settingsJSON));
    vizData(data);
    applySettings(settings);
}


async function getData() {
    const response = await fetch(data_url);
    const data = await response.json();
    // console.log(data);
    return data;
}


async function getSettings() {
    const response = await fetch("./json/settings.json");
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
        if (s.date === true || s.date === false) settingsShow("date");
        if (s.time === true || s.time === false) settingsShow("time");
        if (s.interactions === true || s.interactions === false) settingsShow("interactions", ".notTheLast");
    }
}


function vizData(data) {

    const tableInt = document.getElementById("relationshipsTable");
    const tableEnt = document.getElementById("entitiesTable");

    for (let i = data.ent.length - 1; i >= 0; i--) {

        const tdEnt = tableEnt.appendChild(document.createElement("tr")).appendChild(document.createElement("td"));

        tdEnt.innerHTML = "<span class='ent input'>" + data.ent[i].self + "</span>";
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
                // tdInt.getElementsByClassName("int")[i].classList.add("filter");
                tdInt.getElementsByClassName("int")[i].classList.add("grey");
            }
        }





    }


    document.getElementById("entitiesButton").addEventListener("click", function () {
        settings.show.entities = !settings.show.entities;
        settingsShow("entities", "#entities");
    });

    document.getElementById("dateButton").addEventListener("click", function () {
        settings.show.date = !settings.show.date;
        settingsShow("date");
    });

    document.getElementById("timeButton").addEventListener("click", function () {
        settings.show.time = !settings.show.time;
        settingsShow("time");
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


    //click on listed elements as inputs
    const inIntA = document.getElementById("inputIntA");
    const inIntB = document.getElementById("inputIntB");
    //list of entities
    const ents = document.getElementsByClassName("ent input");
    let inIntAfocus = true;

    inIntA.addEventListener("click", function () { inIntAfocus = true; });
    inIntB.addEventListener("click", function () { inIntAfocus = false; });

    for (let i = 0; i < ents.length; i++) {
        ents[i].addEventListener("click", function () {
            if (inIntAfocus) {
                inIntA.value = ents[i].innerHTML;
                inIntB.focus();
                inIntAfocus = false;
            } else {
                inIntB.value = ents[i].innerHTML;
                inIntA.focus();
                inIntAfocus = true;
            }
        });
    }

    //list of relationships
    const ints = document.getElementsByClassName("int input");

    for (let i = 0; i < ints.length; i++) {
        ints[i].addEventListener("click", function () {
            inIntA.value = this.getElementsByClassName("intA")[0].innerHTML;
            inIntB.value = this.getElementsByClassName("intB")[0].innerHTML;
            document.getElementById("inputIntC").focus();
            inIntAfocus = true;
        });
    }

}


function settingsShow(settingsKey, involvedElements) {
    if (!involvedElements) {
        involvedElements = "." + settingsKey;
    }
    const e = document.querySelectorAll(involvedElements);
    for (let i = 0; i < e.length; i++) {
        if (settings.show[settingsKey]) {
            e[i].classList.remove("hide");
        } else {
            e[i].classList.add("hide");
        }
    }
}