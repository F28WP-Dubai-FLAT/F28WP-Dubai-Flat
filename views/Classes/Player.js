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
            src: './Images/botfly.gif',
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
        this.htmlElement.style.top = (document.getElementById("gameWindow").offsetHeight - this.htmlElement.offsetHeight - 30) + "px";
    }

    //moves the player. Call in update
    move(xDir) {
        this.x += this.speed * xDir;
        this.display(xDir);
    } 

    //updates player position. Called in move
    display(xDir) {
        this.fitBounds();
        if(xDir < 0)
            this.htmlElement.src = "../Images/botflyLeft.gif";
        else
            this.htmlElement.src = "../Images/botfly.gif";
        this.htmlElement.style.left = this.x + "px";
        this.htmlElement.style.top = (document.getElementById("gameWindow").offsetHeight - this.htmlElement.offsetHeight-30) + "px";
        this.htmlElement.style.display = "block";
    }

    // Makes the player not go over the container bounds
    fitBounds() {
        let parent = this.htmlElement.parentElement;
        let iw = this.htmlElement.offsetWidth;
        let w = parent.offsetWidth;
        if (this.x < 0)
            this.x = 0;
        if (this.x > w - iw)
            this.x = w - iw;
    }

    // Remove the player
    kill() {
        this.htmlElement.remove()
    }
}