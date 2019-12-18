const Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Constraint = Matter.Constraint,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint;

let engine;
let world;
let particles = [];
const eRadius = 15;

let mConstraint;

let canvas;


function setup() {

    if (loaded) {
        //setup p5.js canvas
        canvas = createCanvas(200, 200);

        //move the canvas so it’s inside our <div id="p5">
        canvas.parent("p5");

        //setup matter.js
        engine = Engine.create();
        world = engine.world;
        Engine.run(engine);

        //gravity for y axis is 1 by default, change it to 0
        world.gravity.y = 0;

        //create mouse and mouse constraint + add it to the world
        let canvasMouse = Mouse.create(canvas.elt);
        canvasMouse.pixelRatio = pixelDensity(); //take into account high density displays
        mConstraint = MouseConstraint.create(engine, { mouse: canvasMouse });
        World.add(world, mConstraint);

        setupParticles();
    }

}


function setupParticles() {

    //assign random positions for each entity
    //except the first one
    data.app.ent[0].x = width / 2;
    data.app.ent[0].y = height / 2;

    for (let i = 1; i < data.ent.length; i++) {
        // Returns a random integer between min (include) and max (include)
        // Math.floor(Math.random() * (max - min + 1)) + min;
        const minx = 0;
        const maxx = width;
        const miny = 0;
        const maxy = height;
        data.app.ent[i].x = Math.floor(Math.random() * (maxx - minx + 1)) + minx;
        data.app.ent[i].y = Math.floor(Math.random() * (maxy - miny + 1)) + miny;
    }


    //create a new particle for each entity
    for (let i = 0; i < data.ent.length; i++) {

        //assign different radius values for the particle
        //depending on the number of relationships an entity has
        let pRadius;
        if (data.ent[i].rels.length < 2) {
            pRadius = eRadius * 0.4;
        } else if (data.ent[i].rels.length >= 2 && data.ent[i].rels.length < 5) {
            pRadius = eRadius;
        } else if (data.ent[i].rels.length >= 5) {
            pRadius = eRadius * 2;
        }

        //make the first particle static
        if (i === 0) {
            particles.push(new Particle(data.app.ent[i].x, data.app.ent[i].y, pRadius, eRadius, true));
        } else {
            particles.push(new Particle(data.app.ent[i].x, data.app.ent[i].y, pRadius, eRadius, false));
        }
    }


    expandRel();
    expandEnt();

    // console.log("entities: ", data.ent);
    // console.log("particles: ", particles);

    // console.log("data.rel: ", data.rel);

}

function expandRel() {

    //loop relationships
    for (let i = 0; i < data.rel.length; i++) {

        //get index array of data.ent (the same as particles) to retrieve easier which particle is related with each other
        //look for a match between entities' ids and the entities forming a relationship
        // for (let j = 0; j < data.ent.length; j++) {
        //     if (data.ent[j]._id === data.app.rel[i].a) { data.app.rel[i].pa = j; }
        //     if (data.ent[j]._id === data.app.rel[i].b) { data.app.rel[i].pb = j; }
        //     //once both found, break the loop

        //     //FUNCIONA?

        //     console.log(data.app.rel[i]);

        //     if (data.app.rel[i].pa && data.app.rel[i].pb) { break; }
        // }

        //initialize rel.h as "highlighted relationships"
        data.app.rel[i].h = false;

    }

}

function expandEnt() {

    //loop entities
    for (let i = 0; i < data.ent.length; i++) {
        //initialize ent.h as "highlighted entities"
        data.app.ent[i].h = false;
    }

}

function draw() {
    //background color for each iteration of draw loop
    background("#f5f5f5");

    // console.log(mouseX, mouseY);

    //draw a line for each relationship
    for (let i = 0; i < data.rel.length; i++) {
        //black or blue depending if highlighted or not
        if (data.app.rel[i].h) {
            strokeWeight(eRadius / 4);
            stroke(0, 0, 255);
        } else {
            strokeWeight(1);
            stroke(0);
        }
        line(particles[data.app.rel[i].aIndex].body.position.x, particles[data.app.rel[i].aIndex].body.position.y, particles[data.app.rel[i].bIndex].body.position.x, particles[data.app.rel[i].bIndex].body.position.y);
    }

    //draw particles + entities
    for (let i = 0; i < particles.length; i++) {
        particles[i].show(i);
    }


    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        mouseInteraction();
    }



}

function mouseInteraction() {

    //if the mouse is pressed
    if (mouseIsPressed) {

        //if the mouse is clicking a particle
        if (mConstraint.body) {

            //if the mouse is moving slowly (or not moving)
            //(difference between the current position of the mouse and the previous position)
            if (Math.abs(mouseX - pmouseX) < 5 && Math.abs(mouseY - pmouseY) < 5) {
                activateParticlesSystem();
            } else {
                deactivateParticlesSystem();
            }

            //loop particles
            for (let i = 0; i < particles.length; i++) {
                //search for the id of the selected particle
                if (mConstraint.body.id === particles[i].body.id) {

                    highlightEnt(data.ent[i]._id);

                    //once selected particle is found and processed, break the loop
                    break;
                }
            }

        }


    } else {

        deactivateParticlesSystem();

        notHighlightAny();

    }

}

function highlightInt(id) {

    //loop interactions
    for (let i = 0; i < data.int.length; i++) {
        if (id === data.int[i]._id) {
            const aIndex = data.app.int[i].aIndex;
            const bIndex = data.app.int[i].bIndex;
            data.app.ent[aIndex].h = true;
            data.app.ent[bIndex].h = true;

            const relIndex = data.app.int[i].relIndex;
            data.app.rel[relIndex].h = true;
        }
    }

}

function highlightEnt(id) {

    //loop particles
    for (let i = 0; i < data.ent.length; i++) {

        //search for the id of the selected particle
        if (id === data.ent[i]._id) {

            // 1) mark the selected entity as highlighted
            data.app.ent[i].h = true;

            // 2) search for the rest of entities related to the selected one
            for (let j = 0; j < data.app.ent[i].relsIndex.length; j++) {
                const index = data.app.ent[i].relsIndex[j];
                if (data.app.rel[index].a === id) {
                    //if a is the same as id, highlight b
                    data.app.ent[data.app.rel[index].bIndex].h = true;
                } else {
                    //if b is the same as id, highlight a
                    data.app.ent[data.app.rel[index].aIndex].h = true;
                }
            }

            // 3) search among all the relationships, which ones involve this id
            for (let j = 0; j < data.rel.length; j++) {
                if (i === data.app.rel[j].aIndex || i === data.app.rel[j].bIndex) {
                    //and mark them as highlighted
                    data.app.rel[j].h = true;
                    //mark also the connected entities
                }
            }

            // 4) once selected particle is found and processed, break the loop
            break;
        }

    }

}

function notHighlightAny() {

    //set all entities/particles to a not-highlighted state
    for (let i = 0; i < data.ent.length; i++) {
        data.app.ent[i].h = false;
    }
    //the same with relationships
    for (let i = 0; i < data.rel.length; i++) {
        data.app.rel[i].h = false;
    }

}

function mouseReleased() {
    noLoop();
}

function mouseClicked() {
    loop();
}

function activateParticlesSystem() {

    //loop particles
    for (let i = 0; i < particles.length; i++) {

        //define vector of force
        let force = {
            x: 0,
            y: 0,
            multiplier: 1
        };

        //loop relationships
        for (let j = 0; j < data.rel.length; j++) {
            //to get the index of the related particles
            if (data.app.rel[j].aIndex !== data.app.rel[j].bIndex) {

                if (data.app.rel[j].aIndex === i) {
                    //update forces
                    force.x = force.x + (particles[data.app.rel[j].bIndex].body.position.x - particles[data.app.rel[j].aIndex].body.position.x);
                    force.y = force.y + (particles[data.app.rel[j].bIndex].body.position.y - particles[data.app.rel[j].aIndex].body.position.y);
                    break;
                } else if (data.app.rel[j].bIndex === i) {
                    force.x = force.x + (particles[data.app.rel[j].aIndex].body.position.x - particles[data.app.rel[j].bIndex].body.position.x);
                    force.y = force.y + (particles[data.app.rel[j].aIndex].body.position.y - particles[data.app.rel[j].bIndex].body.position.y);
                    break;
                }

            }


        }

        //update forces multiplier
        //(particle and data.ent arrays reference the same elements)
        force.multiplier = data.ent[i].rels.length * 5;

        //apply forces
        if (!particles[i].body.isStatic) {
            Body.applyForce(particles[i].body, particles[i].body.position, {
                x: force.x * 0.000001 * force.multiplier,
                y: force.y * 0.000001 * force.multiplier,
            });
        }

    }

}

function deactivateParticlesSystem() {

    //set velocity for each particle to zero
    for (let i = 0; i < particles.length; i++) {
        //except for the particles that are static
        if (!particles[i].body.isStatic) {
            Body.setVelocity(particles[i].body, {
                x: 0,
                y: 0
            });
            Body.setAngularVelocity(particles[i].body, 0);
        }
    }

}