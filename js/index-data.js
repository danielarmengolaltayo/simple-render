//INDEXING
//connect ent-rel-int by storing the indexes to avoid unnecessary loops

function indexData(data) {

    //create new arrays for "app"
    data.app.ent = new Array(data.ent.length);
    data.app.rel = new Array(data.rel.length);
    data.app.int = new Array(data.int.length);

    //loop all entities
    for (let i = 0; i < data.ent.length; i++) {
        //create new array to store the indexes
        data.app.ent[i] = { relsIndex: new Array(data.ent[i].rels.length) };
        //for each entity, loop all its relationships
        for (let j = 0; j < data.ent[i].rels.length; j++) {
            //search relationships by matching ids
            //loop all relationships until match found
            for (let k = 0; k < data.rel.length; k++) {
                if (data.ent[i].rels[j] === data.rel[k]._id) {
                    //save the index of rel inside ent.rels and break the loop
                    data.app.ent[i].relsIndex[j] = k;
                    break;
                }
            }
        }
    }

    //loop all relationships
    for (let i = 0; i < data.rel.length; i++) {
        let aIndex, bIndex;
        //create new array to store the indexes
        data.app.rel[i] = { intsIndex: new Array(data.rel[i].ints.length) };
        //for each relationship, loop all its interactions
        for (let j = 0; j < data.rel[i].ints.length; j++) {
            //loop all interactions until match on ids found
            for (let k = 0; k < data.int.length; k++) {
                if (data.rel[i].ints[j] === data.int[k]._id) {
                    //save the index of int inside rel.ints
                    data.app.rel[i].intsIndex[j] = k;

                    //we are looping all interactions in here
                    //we take advantage of that and keep indexing

                    //restart values for aIndex and bIndex
                    aIndex = undefined, bIndex = undefined;
                    //for each interaction, find the entities involved
                    for (let l = 0; l < data.ent.length; l++) {
                        //save the index of ent inside int
                        if (data.int[k].ents.a === data.ent[l]._id) { aIndex = l; }
                        if (data.int[k].ents.b === data.ent[l]._id) { bIndex = l; }
                        //stop searching once both entites have been found and save
                        if (aIndex !== undefined && bIndex !== undefined) {
                            //save also the index of rel inside int.relIndex
                            data.app.int[k] = { aIndex: aIndex, bIndex: bIndex, relIndex: i };
                            break;
                        }

                    }
                    //break the loop and continue with the next interaction in this relationship
                    break;
                }
            }
        }
        //save the index of ent inside rel
        data.app.rel[i].aIndex = aIndex;
        data.app.rel[i].bIndex = bIndex;
    }

    console.log("data indexed");
    return data;

}