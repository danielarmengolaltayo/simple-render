//expand data records of interactions for easy access later

function expandData(data) {

    //loop entities
    let total = 0;
    let c;
    for (let i = 0; i < data.ent.length; i++) {

        //loop all relationships for each entity (using indexes)
        //different entities share the same relationship, this loop repeat some relationships and interactions
        for (let j = 0; j < data.app.ent[i].relsIndex.length; j++) {
            const index = data.app.ent[i].relsIndex[j];
            //calculate total
            total += data.rel[index].ints.length;
            //if both indexes are the same, an entity is interacting with itself
            if (data.app.rel[index].aIndex === data.app.rel[index].bIndex) {
                //calculate c
                c = data.int[data.app.rel[index].intsIndex[0]].context.c;
            }
        }

        ////////////////////////////////////////////////////////////
        //save total of interactions for each entity and reset the counter
        data.app.ent[i].totalInt = total;
        total = 0;

        ////////////////////////////////////////////////////////////
        //save value of c
        data.app.ent[i].c = c;

    }

    //loop relationships
    for (let i = 0; i < data.rel.length; i++) {

        //loop all interacions for each relationship (using indexes)
        //relationships contain all interactions, this loop goes through all interactions
        for (let j = 0; j < data.app.rel[i].intsIndex.length; j++) {

            const ii = data.app.rel[i].intsIndex[j];

            ////////////////////////////////////////////////////////////
            //save the ids of the entities for each relationship
            data.app.rel[i].a = data.int[ii].ents.a;
            data.app.rel[i].b = data.int[ii].ents.b;

            ////////////////////////////////////////////////////////////
            //format the long "date" field into short date and time separately
            data.app.int[ii].d = formatDate(data.int[ii].context.date);
            data.app.int[ii].t = formatTime(data.int[ii].context.date);

            ////////////////////////////////////////////////////////////
            //save number of relationships for each entity inside interactions
            const ai = data.app.rel[i].aIndex;
            data.app.int[ii].aNumOfRels = data.ent[ai].rels.length;
            const bi = data.app.rel[i].bIndex;
            data.app.int[ii].bNumOfRels = data.ent[bi].rels.length;

            ////////////////////////////////////////////////////////////
            //last interaction of the same relationship
            const lastIntIndex = data.app.rel[i].intsIndex[data.app.rel[i].intsIndex.length - 1];
            (ii === lastIntIndex) ? data.app.int[ii].lastOfTheSame = true : data.app.int[ii].lastOfTheSame = false;

        }
    }

    //loop interactions
    for (let i = 0; i < data.int.length; i++) {

        ////////////////////////////////////////////////////////////
        //last entry of the day
        if (i > 0) { data.app.int[i - 1].lastOfTheDay = lastD(data.app.int[i - 1].d, data.app.int[i].d); }
        data.app.int[i].lastOfTheDay = true;

    }

    console.log("data expanded");
    return data;

}


//auxiliar functions to make main function more readable

function lastD(prevDate, thisDate) {

    //assuming that entries are sorted by date

    //if consecutive data entries share the same date
    if (prevDate === thisDate) {
        //the first entry is not the last entry of the day
        return false;
        //if not the same date
    } else {
        //the first date is considered the last entry of its day
        return true;
    }

    //we don't care about the second entry
    //it will always be true in the current step of the loop
    //and it will be overwritten in the next step
    //except for the last step of the loop
    //when, because we are in the last data entry, 
    //it will be definitely the last entry of its day

}

function checkSame(a1, b1, a2, b2) {

    if (
        //if the two entities creating the first interaction are the same as the second interaction
        (a1 === a2 && b1 === b2)
        //or
        ||
        //the same but in reverse order
        (a1 === b2 && b1 === a2)
    ) {
        return true;
    } else {
        return false;
    }

}

//format time into HH:MM:SS
function formatTime(date) {
    const d = new Date(date);
    return twoDigits(d.getHours()) + ":" + twoDigits(d.getMinutes()) + ":" + twoDigits(d.getSeconds());
}

//format date into YY-MM-DD
function formatDate(date) {
    const d = new Date(date);
    return d.getFullYear() + "-" + twoDigits(d.getMonth() + 1) + "-" + twoDigits(d.getDate());
}

function twoDigits(n) {
    if (n < 10) { return "0" + n; } else { return n; }
}