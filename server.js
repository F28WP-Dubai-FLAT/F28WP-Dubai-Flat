//server side

//create server
const express = require('express');
const app = express();
const path = require('path');




//To access the  folder "views"
app.use(express.static('views'));
 
//sending the index html file
app.get('/', function(request, response) {
    response.sendFile('Index.html', { root: __dirname });
});

// middleware     //used for data management
app.use(express.json());
app.use(express.urlencoded());

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database:"game"
});

function executeQuery(query, callback) {
    pool.getConnection(function(err, connection) {
        if (err) {
            return callback(err, null);
        } else if (connection) {
            connection.query(query, function(err, rows, fields) {
                connection.release();
                if (err) {
                    return callback(err, null);
                }
                return callback(null, rows);
            });
        } else {
            return callback(true, "No Connection");
        }
    });
}


function getResult(query, callback) {
    executeQuery(query, function(err, rows) {
        if (!err) {
            callback(null, rows);
        } else {
            callback(true, err);
        }
    });
}

//setting up port
const port = process.env.PORT || 3000;
const server = app.listen(port, function() {
    console.log(`Our game listening on port : ${port}`);
});

 

//pass requests to the router middleware
const gameRouter = require('./game_routes/post');
app.use(gameRouter);

//create database if not exists

connection.connect(function(err) {
    if (err) throw err;
    //create database
    const sqlDB = "CREATE DATABASE IF NOT EXISTS `leaderboard`;";
    connection.query(sqlDB, function(err, result) {
        if (err) throw err;
        console.log('The database has been created');
    });
    //change database
    connection.changeUser({ database: 'leaderboard' }, function(err) {
        if (err) {
            console.log('error in changing database', err);
            return;
        }
    });

    //create table Players
    const sqlUser = "Create table if not exists `leaderboard`.`users`(" +
        "id int(10) " +
        "`pseudoname` varchar(32) NOT NULL default 'Unkown'," + +
        "`score` int(10) , "+
        "PRIMARY KEY (`id`)" +
        "); ";
    connection.query(sqlUser, function(err, result) {
        if (err) throw err;
        console.log("Users table created");
    });
     
});

//loading socket.io and binding to the server
const io = require('socket.io')(server);

//setting up the eventHandler for the "connection" event type
//so we are registering a function to handle this event
io.sockets.on('connection', function(socket) {
    console.log('Connection !');
    //socket here is the payload received by the server along with the connection event

    socket.on('login', function(user) {
        //here the payload is the pseudoname, sent by the browser
        socket.pseudoname = user.pseudoname;
        io.emit('logged', user);
    });

    socket.on('gameOver',function(score){


    });

});

