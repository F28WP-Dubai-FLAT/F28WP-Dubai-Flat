console.log("Program has started")

import io from 'socket.io-client';

// Global values
let spawnStop;
let gameOver = false;
let score = 0;
var player;

const socket = io()

// Class that spawns the projectiles
function projSpawner() {
    this.timer = 400;
}

// function to start the projectile spawning. ****Recommened that this function is called in init****
projSpawner.prototype.start = function() {
    let timer = this.timer
    spawnStop = false;
    setTimeout(spawners, timer);

    
    function spawners(){
        let check = (randomize(-10, 1010));
        if(score < 200)
            projectile(check,7);
        else if((score >= 200) && (score < 800)) {
            timer = 350;
            projectile(check, 8)
        }
        else if((score >= 800) && (score < 1600)) {
            timer = 300;
            projectile(check, 9)
        }
        else if((score >= 1600) && (score < 2400)){
            timer = 250;
            projectile(check, 10)
        }
        else if(score > 2400) {
            timer = 200;
            projectile(check, 12)
        }
        if(!spawnStop) 
            setTimeout(spawners, timer)
    }
}

/*
function spawners(){
    clearInterval
    let check = (randomize(-100, 1100));
    if(score < 200) 
        projectile(check, 7);
    
}*/
//projectile is a child function/class of projSpawner
function projectile(xPos, velo){
    //Projectile speed and position accumulator
    let current = 0
    let width = $("#gameWindow").width();

    // creates projectile element on the html side
    let projectile = $('<img />', { 
        id: 'projectile',
        src: './Images/FLat01.png',
        alt: 'Proj'
      });

    if(xPos <= 0)
        xPos = 0;
    if(xPos >= width - 95)
        xPos = width - 95;

    //sets projectiles position and generates it on the map element
    projectile = projectile.css({"position":"absolute", "top":0, "left":xPos})
    
    if(!spawnStop)
        $("#map").prepend(projectile)
    
    //updates projectile's position every 10ms
    let interval = setInterval(function(){
        //current keeps track of player position
        current += velo;
        projectile = projectile.css({"top":current})
        //If position is below game window, interval is stopped and element is deleted
        //Checks collision
        isHit(projectile, player);
        
        if(current > 550) {
            score += 10
            clearInterval(interval);
            projectile.remove();
        }

        if(spawnStop) {
            clearInterval(interval);
            projectile.remove()
        }
    },10);
}



// Helper function to randomize value
function randomize(min, max) {
    return (Math.floor(Math.random() * (max - min) ) + min);
}



function keyDownHandler(e) {
    if ((e.keyCode == 39) || (e.keyCode == 68)) {
        player.move(1);
    }
    if ((e.keyCode == 37) || (e.keyCode == 65)) {
        player.move(-1);
    }
}

function isHit(defender, offender) {
    if (cross(defender, offender)) {
        console.log("Player got hit");
        
        spawnStop = true;
        gameOver = true;
        console.log("Your score is: " + score)
        //socket.emit('gameOver', score)
    }
}

function cross(element1, element2) {
    let left1 = element1.offset().left - 200;
    let top1 = element1.offset().top-119;
    let right1 = left1 + element1.width();
    let bottom1 = top1 + element1.height();

    let left2 = element2.htmlElement.offsetLeft;
    let top2 = element2.htmlElement.offsetTop;
    let right2 = element2.htmlElement.offsetLeft + element2.htmlElement.offsetWidth;
    let bottom2 = element2.htmlElement.offsetTop + element2.htmlElement.offsetHeight;
    
    let x_overlap = Math.max(0, Math.min(right1, right2) - Math.max(left1, left2));
    let y_overlap = Math.max(0, Math.min(bottom1, bottom2) - Math.max(top1, top2));
    let overlapArea = x_overlap * y_overlap;


    if (overlapArea == 0 || isNaN(overlapArea)) 
        return false;

    return true;
    
}

////////////////////////////////////
import Player from "./Classes/Player.js"

socket.on('connect', () => {
    var modal = $("#myModal");
    modal.show();

    $("#nameEnter").submit((event) => {
        let playerName = $("#fname").val()
        event.preventDefault();
        socket.emit('gameStart', playerName)

        console.log(playerName)
        modal.hide();

        player = new Player();
        player.spawn();
        document.addEventListener("keydown", keyDownHandler, false);

        //Creates an object from projSpawner
        let projSpawn = new projSpawner();
        /*This is to be called when starting projectile spawning 
            ****Call this in the init function**** */
        projSpawn.start();
    })
})

//let gameEnd = setInterval(() => {
    /*if(gameOver) {
        $("#nameEnter")[0].reset();
        modal.show();
    }*/
//}, 10)
/////////////////////////////////////
