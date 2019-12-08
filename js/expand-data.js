//expand data records of interactions for easy access later

function expandData(d) {

    //deep clone
    const data = JSON.parse(JSON.stringify(d));

    //loop all the data

    //loop entities
    //calculate total of interactions for each entity
    let total = 0;
    for (let i = 0; i < data.ent.length; i++) {

        for (let j = 0; j < data.ent[i].others.length; j++) {
            for (let k = 0; k < data.rel.length; k++) {
                if (data.ent[i].others[j] === data.rel[k]._id) {
                    total += data.rel[k].list.length;
                    break;
                }
            }
        }

        data.ent[i].totalInt = total;
        total = 0;

    }

    //loop interactions
    for (let i = 0; i < data.int.length; i++) {

        ////////////////////////////////////////////////////////////
        //expand data.int w/ readable content from data.ent for easier retrieval when rendering
        for (let j = 0; j < data.ent.length; j++) {

            //for the first entity
            if (data.int[i].a == data.ent[j]._id) {
                //add content from "entities" into "interactions"
                data.int[i].selfA = data.ent[j].self;
                //add number of relationships
                data.int[i].othersA = data.ent[j].others.length;
            }

            //the same for the second entity
            if (data.int[i].b == data.ent[j]._id) {
                data.int[i].selfB = data.ent[j].self;
                data.int[i].othersB = data.ent[j].others.length;
            }

        }

        ////////////////////////////////////////////////////////////
        //last interaction of the same relationship
        for (let j = 0; j < data.int.length; j++) {

            if (j > i) {

                //if both interactions are the same
                if (checkSame(data.int[i].a, data.int[i].b, data.int[j].a, data.int[j].b)) {
                    data.int[i].lastOfTheSame = false;
                    //jump out of the loop
                    break;
                }

                //if there is no coincidence, this interaction is unique, therefore the last one
                data.int[i].lastOfTheSame = true;

                //if last loop, assign value to last item (always will be true) 
            } else if (j === data.int.length - 1) {
                data.int[i].lastOfTheSame = true;
            }

        }

        ////////////////////////////////////////////////////////////
        //format the long "date" field into short date and time separately
        data.int[i].d = formatDate(data.int[i].date);
        data.int[i].t = formatTime(data.int[i].date);

        ////////////////////////////////////////////////////////////
        //last entry of the day
        if (i > 0) {
            data.int[i - 1].lastOfTheDay = lastD(data.int[i - 1].d, data.int[i].d);
        }
        data.int[i].lastOfTheDay = true;
    }

    //loop relationships
    //store the ids of the entities for each relationship
    for (let i = 0; i < data.rel.length; i++) {
        //label to break nested loops
        next:
        //loop interactions
        for (let j = 0; j < data.int.length; j++) {
            //look for a match of interactions (ids)
            //in this case we use the first interaction inside each relationship's list
            if (data.int[j]._id === data.rel[i].list[0]) {
                //loop entities
                for (let k = 0; k < data.ent.length; k++) {
                    //look for a match between entities
                    //first entity of the relationship
                    if (data.ent[k]._id === data.int[j].a) {
                        //store the id inside relationships
                        data.rel[i].a = data.ent[k]._id;
                    }
                    //second entity of the relationship
                    if (data.ent[k]._id === data.int[j].b) {
                        //store the id inside relationships
                        data.rel[i].b = data.ent[k]._id;
                    }
                    //once both entities found
                    if (data.rel[i].a && data.rel[i].b) {
                        //exit the two loops to stop searching
                        break next;
                    }
                }
            }
        }
    }


    console.log("data expanded");
    return data;

}


//auxiliar functions to make main function more readable

function lastD(prevDate, thisDate) {

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

function formatTime(date) {
    const d = new Date(date);
    return twoDigits(d.getHours()) + ":" + twoDigits(d.getMinutes()) + ":" + twoDigits(d.getSeconds());
}

function formatDate(date) {
    const d = new Date(date);
    return d.getFullYear() + "-" + twoDigits(d.getMonth() + 1) + "-" + twoDigits(d.getDate());
}

function twoDigits(n) {
    if (n < 10) { return "0" + n; } else { return n; }
}