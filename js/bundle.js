(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
const data_url = "http://localhost:3000/data"
let filter = true;

const fs = require('fs');

let rawdata = fs.readFileSync("./json/settings.json");
let settings = JSON.parse(rawdata);
console.log(settings);


getData().
then(data => {
    data = expandData(data);
    vizData(data);
}).
catch(err => {
    console.log("ERROR?");
    console.error(err);
});


async function getData(){
    const response = await fetch(data_url);
    const data = await response.json();
    // console.log(data);
    return data;
}


function vizData(data){
    
    const tableInt = document.getElementById("interactions");
    const tableEnt = document.getElementById("entities");

    for(let i = data.ent.length - 1; i >= 0 ; i--){

        const tdEnt = tableEnt.appendChild(document.createElement("tr")).appendChild(document.createElement("td"));

        tdEnt.innerHTML = "<span class='ent'>" + data.ent[i].self + "</span>";
        tdEnt.innerHTML += "<span class='ent'>&nbsp;</span>";
        tdEnt.innerHTML += "<span class='ent grey'>(" + data.ent[i].others.length + "/" + data.ent[i].totalInt + ")</span>";

    }
    

    for(let i = data.int.length - 1; i >= 0 ; i--){



        const tdDate = tableInt.appendChild(document.createElement("tr")).appendChild(document.createElement("td"));
        const tdInt = tableInt.appendChild(document.createElement("tr")).appendChild(document.createElement("td"));

        if(data.int[i].lastOfTheDay){
            tdDate.innerHTML = "<span class='date'>" + data.int[i].d + "</span>";
        }

        tdInt.innerHTML += "<span class='int time'>&nbsp;&nbsp;</span";
        tdInt.innerHTML += "<span class='int time'>" + data.int[i].t + "</span>";
        tdInt.innerHTML += "<span class='int time'>&nbsp;</span>";
        if(data.int[i].selfA === "settings"){
            tdInt.innerHTML += "<span class='int settings'>" + data.int[i].selfA + "</span>";
            tdInt.innerHTML += "<span class='int settings'> ——— </span>";
            tdInt.innerHTML += "<span class='int settings'>" + data.int[i].selfB + "</span>";
        }else{
            tdInt.innerHTML += "<span class='int'>" + data.int[i].selfA + "</span>";
            tdInt.innerHTML += "<span class='int'> ——— </span>";
            tdInt.innerHTML += "<span class='int'>" + data.int[i].selfB + "</span>";
            
        }
        if(data.int[i].c){
            tdInt.innerHTML += "<span class='int'>&nbsp;</span>";
            tdInt.innerHTML += "<span class='int connection'>" + data.int[i].c + "</span>";
        }

        if(!data.int[i].lastOfTheSame){
            for(let i = 0; i < tdInt.getElementsByClassName("int").length; i++){
                tdInt.getElementsByClassName("int")[i].classList.add("repeated");
                tdInt.getElementsByClassName("int")[i].classList.add("filter");
                tdInt.getElementsByClassName("int")[i].classList.add("grey");
            }
        }



        
        
    }

    
    document.getElementById("entitiesButton").addEventListener("click", function(){
        const e = document.querySelectorAll("#entities");
        for(let i = 0; i < e.length; i++){
            e[i].classList.toggle("hide");
        }
    });

    document.getElementById("date").addEventListener("click", function(){
        const e = document.getElementsByClassName("date");
        for(let i = 0; i < e.length; i++){
            e[i].classList.toggle("hide");
        }
    });

    document.getElementById("time").addEventListener("click", function(){
        const e = document.getElementsByClassName("time");
        for(let i = 0; i < e.length; i++){
            e[i].classList.toggle("hide");
        }
    });

    
    document.getElementById("filterButton").addEventListener("click", function(){
        
        filter = !filter;

        const e = document.querySelectorAll(".repeated");
        for(let i = 0; i < e.length; i++){
            if(filter){
                e[i].classList.add("filter");
            }else{
                e[i].classList.remove("filter");
            }
            // e[i].classList.toggle("filter");
        }

        if(filter){
            document.getElementById("filterText").innerHTML = "(last interaction)"
        }else{
            document.getElementById("filterText").innerHTML = "(all interactions)"
        }

    });

    

}
},{"fs":1}]},{},[2]);
