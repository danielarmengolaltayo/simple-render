function Particle(x, y, pRadius, eRadius, static) {

    let options = {
        friction: 0,
        restitution: 0
    }

    if (static) {
        options.isStatic = true;
    } else {
        options.isStatic = false;
    }

    this.body = Bodies.circle(x, y, pRadius, options);
    World.add(world, this.body);

    this.show = function (i) {

        push();

        translate(this.body.position.x, this.body.position.y);
        rotate(this.body.angle);
        rectMode(CENTER);
        noStroke();

        //draw the particle
        fill(240);
        ellipse(0, 0, this.pRadius * 2);

        //draw the entity
        noStroke();
        if (data.app.ent[i].h) {
            fill(0, 0, 255);
            ellipse(0, 0, eRadius);
        } else {
            if (static) {
                fill(170);
                ellipse(0, 0, eRadius);
            } else {
                fill(0);
                ellipse(0, 0, eRadius * 0.5);
            }
        }

        pop();

    }

}