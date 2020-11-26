console.log("Program has started")


// Global values
let spawnStop;
let gameOver = false;
let restart = false;
let score = 0;
var player;

                
//socket
const socket = io()

// Class that spawns the projectiles
function projSpawner() {
    this.timer = 500;
}

// function to start the projectile spawning. ****Recommened that this function is called in init****
projSpawner.prototype.start = function() {
    let timer = this.timer
    spawnStop = false;
    setTimeout(spawners, timer);
    
    function spawners(){
        let check = (randomize(-10, 1010));
        if(score < 200)
            projectile(check,5);
        else if((score >= 200) && (score < 800)) {
            timer = 450;
            projectile(check, 6)
        }
        else if((score >= 800) && (score < 1600)) {
            timer = 400;
            projectile(check, 7)
        }
        else if((score >= 1600) && (score < 2400)){
            timer = 350;
            projectile(check, 8)
        }
        else if(score > 2400) {
            timer = 300;
            projectile(check, 11)
        }
        if(!spawnStop) 
            setTimeout(spawners, timer)
    }
}

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
    let intervals = setInterval(function(){
        
        //current keeps track of player position
        current += velo;
        projectile = projectile.css({"top":current})
        //If position is below game window, interval is stopped and element is deleted
        //Checks collision
        isHit(projectile, player);
        
        if(current > 550) {
            score += 10
            $("#score").empty()
            $("#score").append("Score: "+score)
            clearInterval(intervals);
            projectile.remove();
        }

        if(spawnStop) {
            clearInterval(intervals);
            projectile.remove()
        }
    },10);
}



// Helper function to randomize value
function randomize(min, max) {
    return (Math.floor(Math.random() * (max - min) ) + min);
}


// Moves player in correct direction
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
        player.kill()
        document.removeEventListener("keydown", keyDownHandler, false);
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

var modal;
var player = new Player()
let projSpawn = new projSpawner();
var songs = [
    {
        "location" : "../Audio/The_Gun.mp3",
        "name" : "The Gun",
        "artist" : "Lorn"
    },
    {
        "location" : "../Audio/66Mhz.mp3",
        "name" : "66 Mhz",
        "artist" : "Waveshaper"
    },
    {
        "location" : "../Audio/Sonic_Blaster.mp3",
        "name" : "Sonic Blaster",
        "artist" : "F-777"
    },
    {
        "location" : "../Audio/Narc.mp3",
        "name" : "NARC",
        "artist" : "Mega Drive"
    },
    {
        "location" : "../Audio/Future_Club.mp3",
        "name" : "Future Club",
        "artist" : "Pertubator"
    },
    {
        "location" : "../Audio/Diabolic.mp3",
        "name" : "Diabolic",
        "artist" : "Dance With The Dead"
    },
    {
        "location" : "../Audio/Get_Out.mp3",
        "name" : "Get Out",
        "artist" : "Dance With The Dead"
    },
    {
        "location" : "../Audio/Roller_Mobster.mp3",
        "name" : "Roller Mobster",
        "artist" : "Carpenter Brut"
    },
    {
        "location" : "../Audio/Turbo_Killer.mp3",
        "name" : "Turbo Killer",
        "artist" : "Carpenter Brut"
    }
];
var currentSong;
var currentSongInfo;

socket.on('connect', () => {
    gameLoop()
    setInterval(() => {
        if(gameOver) {
            socket.emit('gameOver', score);
            let deathSound = new Audio("../Audio/soundDeath.wav")
            deathSound.play()
            document.getElementById('map').style.backgroundImage="url(../Images/bg1.gif)"
            $("#deathMessage").append("You died.")
            $("#song").empty()
            currentSong.pause()
            currentSong.currentTime = 0;
            gameOver = false
            gameLoop()
        }
    }, 20);

    setInterval(() => {
        if(restart) {
            restart = false
            modal.hide()
            gameLoop()
        }
    }, 20);

    setInterval(() => {
        socket.emit('askScore',score)
        socket.on('getScore',function(scores){
            leaderboard(scores)
        })
    }, 1000);
})

$("#LBbox").empty()

function gameLoop() {
    $("#mainPlay").show()
    var span = document.getElementsByClassName("close")[0];
    $("#nameEnter")[0].reset();
    $("#mainPlay").click(function(){
        modal.show()
        $("#mainPlay").hide()
    })
    

    $("#play").click(function(){
        location.reload()
    })

    $("#about").click(function(){
        document.location.href = "../About.html"
    })

    modal= $("#myModal")
    span.onclick = function() {
        modal.hide();
        $("#mainPlay").show()
    }

    score = 0;
    let exit = true



    $("#nameEnter").submit((event) => {
        if(exit) {
            let playerName = $("#fname").val()
            if(!checkName(playerName)) {
                event.preventDefault();
                alert("Usernames must be lesser than 12 characters and should not contain special characters")
                exit = false
                restart = true
            }
            event.preventDefault();

            if(!restart) {
                document.getElementById('map').style.backgroundImage="url(../Images/bg2.gif)"
                $("#deathMessage").empty()
                let val = randomize(-1,songs.length)
                currentSong = new Audio((songs[val])["location"])
                currentSongInfo = songs[val]
                if(val==1)    
                    currentSong.currentTime = 8
                currentSong.volume = 0.09
                currentSong.play()
                $("#song").hide()
                $("#song").empty()
                $("#song").append("Now playing: "+currentSongInfo["name"]+" by "+currentSongInfo["artist"])
                setTimeout(() => {
                    $("#song").fadeIn(3000)
                    setTimeout(() => {
                        $("#song").fadeOut(3000)
                    },3000)
                },3000)
                
                $("#score").empty()
                $("#score").append("Score: ")
                socket.emit('gameStart', playerName)
                modal.hide();
                
                projSpawn.start()
                
                player.spawn();
                document.addEventListener("keydown", keyDownHandler, false);
                exit = false
            }
        }
    })

}

function leaderboard(scoreList) {
    let cutoff = 6
    scoreList.sort(function(a,b) {
        if (a["Score"] > b["Score"]) {
            return -1;
          }
          if (a["Score"] < b["Score"]) {
            return 1;
          }
          return 0;
    })

    $("#LBbox1").empty()
    $("#LBbox2").empty()
    $("#LBbox1").append(`Leaderboard`)

    insertBreak()
    insertBreak()
    $("#LBbox1").append(`Name`)
    $("#LBbox2").append(`Score`)
    insertBreak()

    for(let i = 0; i < cutoff; ++i) {
        let spaceRequired = 15
        insertBreak()
        insertBreak()
        $("#LBbox1").append((scoreList[i])["Name"]) 
        $("#LBbox2").append((scoreList[i])["Score"])
    }
}

function checkName(name) {
    let flag = true
    var regNum = new RegExp('^[0-9]+$');
    var letters = new RegExp('^[A-Za-z]+$');
    for (let i = 0; i < name.length; i++) {
        if(!(name.charAt(i).match(regNum) || name.charAt(i).match(letters))) {
            flag = false
            break;
        }
        if((name.length > 12 ))  {
            flag = false
            break;
        }
    }

    if(name.length == 0) 
        flag = false

    return flag
}

function insertBreak() {
    var linebreak1 = document.createElement("br");
    var linebreak2 = document.createElement("br");
    $("#LBbox1").append(linebreak1)
    $("#LBbox2").append(linebreak2)
}

/////////////////////////////////////
