
//server side
//create server
const express = require('express');
const app = express();
const mysql = require('mysql');


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

const getInfo = function() {
    
    pool2.connect(function(err) {
        //select all sessions
        selectInfo = "Select * from `leaderboard` where score is not null;";
        pool2.query(selectInfo, function(err, result) {
            if (err) throw err;
            console.log(result);
            return result;
        });
    });
};

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
        addUser = (`Delete from leaderboard where ID = ${id}`);
        pool2.query(addUser, function(err, result) {
            if (err) throw err;
            console.log("Succesfully done");
            return result;
        });
    })
}


io.on('connection', function(socket) {
    console.log("It starts")
    socket.on('gameStart', function(username){
        createUser(username);
        console.log("IT WORKS!!!")
    })
})