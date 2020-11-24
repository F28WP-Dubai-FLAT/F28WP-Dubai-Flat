export default class Player {
    constructor() {
        //player attributes
        this.speed= 100;
        this.initPos = (($("#gameWindow").width())/2)-150/2;
        this.htmlElement;
        this.x;

        // creates html element for the player
        this.handle = $('<img />', { 
            id: 'player',
            src: './Images/Flat02.png',
            alt: 'Player'
          });        
    }

    //spawns the player. ****call in init****
    spawn() {
        //set player's element position and creates it on screen
        this.handle = this.handle.css({"position":"absolute", "top":0, "left":this.initPos});
        $("#map").prepend(this.handle);

        //DOM used for player movement
        this.htmlElement = document.getElementById("player");
        this.x = this.htmlElement.offsetLeft;;
        //initial top position changed
        this.htmlElement.style.top = (document.getElementById("gameWindow").offsetHeight - this.htmlElement.offsetHeight) + "px";
    }

    //moves the player. Call in update
    move(xDir) {
        this.x += this.speed * xDir;
        this.display();
    } 

    //updates player position. Called in move
    display() {
        this.fitBounds();
        this.htmlElement.style.left = this.x + "px";
        this.htmlElement.style.top = (document.getElementById("gameWindow").offsetHeight - this.htmlElement.offsetHeight) + "px";
        this.htmlElement.style.display = "block";
    }

    fitBounds() {
        let parent = this.htmlElement.parentElement;
        let iw = this.htmlElement.offsetWidth;
        let w = parent.offsetWidth;
        if (this.x < 0)
            this.x = 0;
        if (this.x > w - iw)
            this.x = w - iw;
    }

    kill() {
        this.htmlElement.remove()
    }
}