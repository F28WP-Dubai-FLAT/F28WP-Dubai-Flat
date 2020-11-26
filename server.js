
//server side
//create server
const express = require('express');
const app = express();
const mysql = require('mysql');

//pools to set the connections
var pool = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "faiz1234#Zim",
});

var pool2 = mysql.createConnection({
    connectionLimit: 100,
    host: "localhost",
    user: "root",
    password: "faiz1234#Zim",
    database: "game",
    debug: true
});

var http = require('http').createServer(app);

//allowing static file send from folder "views"
app.use(express.static('views'));
 
//sending the index html file
app.get('/', function(request, response) {
    response.sendFile('Index.html', { root: __dirname });
});

http.listen((process.env.PORT || 3000), () => {
    console.log(`Our game is listening on port`)
})


//loading socket.io and binding to the server
const io = require('socket.io')(http);

// On pool connection
pool.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    pool.query("Create database if not exists `game`;", function (err, result) {
      if (err) throw err;
      console.log("Database exists");
    });
    pool.query("Use game;", function (err, result) {
        if (err) throw err;
    });
    const sqlUser = "Create table if not exists leaderboard(" +
            "ID int NOT NULL, " +
            "Name varchar(40) NOT NULL default 'Unknown'," +
            "Score int, "+
            "PRIMARY KEY (ID)" +
            "); ";
    pool.query(sqlUser, function (err, result) {
        if (err) throw err;
        console.log("Table exists");
    });
});

// Recieves player data whose score is not null
const getInfo = function(callback) {
    pool2.connect(function(err) {
        //select all sessions
        callback = callback || function(){};
        selectInfo = "Select * from `leaderboard` where score is not null;";
        pool2.query(selectInfo, function(err, result) {
            if (err) throw err;
            return callback(result);
        });
    });
};

// Recieves all player data
const getInfoDebug = function() {
    pool2.connect(function(err) {
        //select all sessions
        selectInfo = "Select * from `leaderboard`";
        pool2.query(selectInfo, function(err, result) {
            if (err) throw err;
            console.log(result);
            return result;
        });
    });
};

//Find the last existing ID to set up new user ID
const findLastID = function(callback) {
    pool2.connect(function(err){
        callback = callback || function(){};
        const findID = `Select * from leaderboard order by ID Desc limit 1`;
        pool2.query(findID, function(err, result) {
            if (err) throw err;
            try {    
                result = (result[0])["ID"]
            } catch(err) {
                result = 0
            }
            id = Number(result) +1
            return callback(Number(result) +1);
        });
    })
}

// Create new player in the table
const createUser = function(name) {
    pool2.connect(function(err) {
        findLastID(function(results) {
            addUser = `Insert into leaderboard (ID, Name) VALUES (${results}, "${name}") ;`;
            pool2.query(addUser, function(err, result) {
                if (err) throw err;
                console.log("Succesfully done");
                return result;
            });
        });
    })
}

// To change the score of player in the table based on ID
const insertScore = function(id, score) {
    pool2.connect(function(err) {
        const insertval = `Update leaderboard set score= ${score} where id = ${id};`;
        pool2.query(insertval, function(err, result) {
            if (err) throw err;
            console.log(result);
            return result;
        });
    })
}


// for debugging
const deleteID = function(id) {
    pool2.connect(function(err) {
        deleter = (`Delete from leaderboard where ID = ${id}`);
        pool2.query(deleter, function(err, result) {
            if (err) throw err;
            console.log("Succesfully done");
            return result;
        });
    })
}

// For debugging
const deleteAll = function() {
    pool2.connect(function(err) {
        deleteC = (`Delete from leaderboard;`);
        pool2.query(deleteC, function(err, result) {
            if (err) throw err;
            console.log("Succesfully done");
            return result;
        });
    })
}


// Main connection function
io.on('connection', function(socket) {
    console.log("It starts")

    socket.on('gameStart', function(username){
        createUser(username);
        console.log("Added user:"+username)
    })

    socket.on('gameOver', function(score){
        findLastID(function(results){ 
            let id = results
            insertScore(id-1, score)
            console.log("Added score")
        }) 
    })

    socket.on('askScore', function(){
        getInfo(function(result){
            socket.emit('getScore', result);
        })
    })
})