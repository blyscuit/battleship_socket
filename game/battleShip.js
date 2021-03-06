/**
 * TODO:
 *  DONE - Restart after winning
 *  - Handle possible delay when joining the room where the player may able to join multiple rooms
 *  - Kill game when user disconnect -- emit 'disconnectNotice' to user in a room, frint end provided
 * FIXME:
 *  DONE - Score only display for myself - DONE
 *  DONE - Turn name display wrongly if timer end/ still pretty buggy - DONE
 */

var uuid = require('node-uuid');

// Google Image
var ImagesClient = require('google-images');
var googleImageClient = new ImagesClient('014187161452568699414:yh-hz5utvi8', 'AIzaSyAOCzQYhZw10lh2-Qx16Rrp4iNLh7tdZ00');

// Timer
var Timer = require('timer.js');

var BattleshipGameModule = function() {
    // map gameId to room
    var roomList = {};
    // map host to gameId (should use database but meh)
    var socketGameMap = {};
    var io;

    /**
     * must run first
     * @param _io - server's io
     */
    var init = function (_io) {
        io = _io;
        console.log("GameModuleInited");

        io.on('createGameRoom', function (name) {
            console.log(name);
        })

    };

    // delete the room associated with this socket
    var onDisconnect = function(socket){
        removeRoom(socket.id);
        console.log('user '+socket.id+' disconnected');
    };

    // give the new comer the current list of rooms
    var getRoomList = function () {
        return roomList;
    };

    // ==========================================================
    // helper functions
    // ==========================================================

    function notifyRoomListUpdated() {
        io.emit('roomListUpdated', roomList);
    }

    /**
     * Remove a room from roomList
     * Do nothing if room not found or is undefined
     * Will notify client of roomList changes
     * @param socketId - the room to be removed
     */
    function removeRoom(socketId) {
        var room = roomList[socketGameMap[socketId]];

        if (typeof room === 'undefined') return;

        var players = room.game.getPlayers();

        delete roomList[socketGameMap[socketId]];

        // force all user in the room to disconnect
        for (var i = 0; i < players.length; i++) {
            var socket = players[i].socket;
            io.to(socket.id).emit('forceDisconnect');

            delete socketGameMap[socket.id];
        }

        notifyRoomListUpdated()
    }

    // ==========================================================

    var bindSocket = function (socket) {

        console.log("BattleShipSocket: a user has joined the game: "+socket.id);

        socket.on('createGameRoom', function (hostName) {

            // generate a unique id for this game
            //noinspection JSUnresolvedFunction
            var gameId = uuid.v4();

            var game = GameFactory.newInstance(gameId,socket,hostName);

            // create a room object and assign the game
            var room = {
                hostName: hostName,
                gameId: gameId,
                game: game
            };

            // remove previous room created by this socket
            // just in case the socket somehow create multiple room
            removeRoom(socketGameMap[socket.id]);

            // keep track of the new room
            roomList[gameId] = room;

            notifyRoomListUpdated();

            io.emit('roomCreated', room)

        });

        socket.on('joinRoom', function (room, name) {
            // map client-side room doesn't contain the game object so we map it to server-side room
            var _room = roomList[room.gameId];

            // if room is in progress, reject connection
            if (_room.game.inProgress()) {
                io.to(socket.id).emit('connectionRejected');
                return;
            }

            _room.game.join(socket, name);

            // since the each room always have the host
            // we know that this is the second player, so we should start the game!
            _room.game.start();

        })

    };

    var bindAdmin = function (socket){
      console.log("BattleShipAdmin: an admin has joined the game: "+socket.id);

        socket.on('resetRoom', function (room) {
          var _room = roomList[room.gameId];
            // _room.restartGame();
          _room.game.reset();
        });
    };

    var GameFactory = function(){

        /**
         * Create a new room with Host's Socket, Name, and ID
         * @param gameId - unique game id
         * @param socket - host's socket
         * @param name - host's name
         */
        var newInstance = function(gameId, socket, name) {

            /* ============================================================================== *
                Instance's Variables
             * ============================================================================== */

            const SEA_WIDTH = 8; // x
            const SEA_HEIGHT = 8; // y

            const GAME_ID = gameId;

            /** Array index of the current platey */
            var playingPlayer = -1;

            var numberOfPlayerSubmittedPlan = 0;

            var gameInProgress = false;

            var getGameInprogress = function () {
              return gameInProgress;
            };

            /**
             *
             * Keep tracks of the players
             *
             * sea - is a 2 dimensional array containing the player's sea (ship placement)
             * shots - array of shots (array containing x and y location) this player has made
             * index - player's index in players array
             * [{
             *      socket: Object{socket.io},
             *
             *      name: string,
             *
             *      id: string,
             *
             *      sea:    [
             *                  [0,0,0],
             *                  [0,0,0],
             *                  [0,0,0]
             *              ],
             *
             *      shots: [
             *                  [x, y],
             *                  [x, y]
             *             ],
             *
             *      life: int,
             *
             *      index: int,
             *
             *      score: int
             *
             * }]
             */
            var players = [];


            /* ============================================================================== *
                Timer
             * ============================================================================== */

            var myTimer = new Timer({
                tick    : 0.5, // how many sec per tick
                ontick  : function(ms) {
                    io.sockets.in(gameId).emit('timer', { time: ms });
                    // console.log(ms + ' ms left')
                },  //ms <-> sec
                onstart : function() { console.log('timer started') },
                onstop  : function() { console.log('timer stop') },
                onpause : function() { console.log('timer set on pause') },
                onend   : function() { console.log('timer ended normally') }
            });

            /**
             * reset and start the timer
             */
            function resetAndStartTimer(){
                myTimer.stop();
                myTimer.start(11).on('end',function(){
                    io.sockets.in(gameId).emit('timer', { time: 10000 });
                    resetAndStartTimer();
                    //send name and score of next user and pass the turn
                    var player = players[playingPlayer];
                    var opponent = players[(player.index+1)%players.length];
                    io.to(player.socket.id).emit('result', player.shots, player.score);
                    io.to(opponent.socket.id).emit('update map', player.shots,player.score);

                    nextTurn();
                });
            }

            function stopTimer() {
                myTimer.stop();
            }

            /* ============================================================================== *
                Functions
             * ============================================================================== */

            /**
             * add a player to the room
             * @param socket
             * @param name
             */
            var addPlayer = function (socket, name) {
                socket.join(gameId);

                // update the socket.id <-> gameId map
                socketGameMap[socket.id] = gameId;

                var player = {
                    socket: socket,
                    name: name,
                    shots: [],
                    gotShots: [],
                    sea: createEmptySea(SEA_WIDTH, SEA_HEIGHT),
                    life: -1,
                    index: players.length,
                    score: 0,
                    imgUrl: ""
                };

                googleImageClient.search(name).then(function (images) {
                    player.imgUrl = images[0].url;
                    io.to(player.socket.id).emit('shouldRequestImages');
                });

                setupPlayerSocketFunctions(player);
                players.push(player);
                console.log('added');

                notifyRoomListUpdated();

            };

            var resetScore = function() {
              for (var i = 0; i < players.length; i++) {
                var player = players[i];
                player.score = 0;
              }
            };

            /**
             * This function should be run once both user has joined.
             * It reset the game state and start player's planning process
             */
            var restartGame = function() {

                gameInProgress = true;

                numberOfPlayerSubmittedPlan = 0;

                // reset game parameters for each player
                // also initiate ship-placement
                for (var i = 0; i < players.length; i++) {

                    var player = players[i];

                    // reset player
                    player.sea = createEmptySea(SEA_WIDTH, SEA_HEIGHT);
                    player.shots = [];
                    player.life = -1; // life will be set after the player submit a plan

                    // tell each player to start ship-placing
                    // also give the opponent's name (this function is over-complicated because we only have 2 players
                    // but this is to keep as much generality and future proofing as possible)
                    io.to(player.socket.id).emit('startGame', players[(i+1)%players.length].name);

                }
                console.log('game starting')
            };

            /**
             * Start the game AFTER all player submitted plan
             */
            var startGame = function() {
                resetAndStartTimer();
                console.log(players[playingPlayer].name + " start first!");

                // send turn state for every player
                for (var i = 0; i < players.length; i++) {
                    var player = players[i];
                    var isMyTurn = (i === playingPlayer);
                    console.log(i+"|"+player+"|"+isMyTurn+" ||| "+player.name);
                    io.to(player.socket.id).emit('gameReady', isMyTurn);
                }

            };


            /**
             * get room parameters such as seaWidth and seaHeight
             * @returns {{seaWidth: number, seaHeight: number}}
             */
            var getRoomParams = function () {
                return {seaWidth: SEA_WIDTH, seaHeight: SEA_HEIGHT};
            };

            /* =============================================== *
                helper functions
             * =============================================== */

            function createEmptySea(width, height) {
                var sea = [];
                for (var j = 0; j < height; j++) {
                    // create a zero-filled array of SEA_WIDTH length
                    sea.push(
                        Array.apply(null, new Array(width)).map(Number.prototype.valueOf, 0));
                }
                return sea;
            }

            /**
             * Turned into a self-involving: On next restart, winner play first...
             * random the current player's turn
             */
            (function randomPlayingPlayer() {
                playingPlayer = Math.floor(Math.random() * players.length);
            })();

            /**
             * change turn
             */
            function nextTurn() {
                playingPlayer = (playingPlayer+1) % players.length;
            }

            function getPlayerFromId(socketId) {
                for (var i = 0; i < players.length; i++) {
                    if (players[i].socket.id === socketId) {
                        return players[i];
                    }
                }
            }

            function setupPlayerSocketFunctions(player) {

                var socket = player.socket;

                socket.on('submitPlan', function (atLocationArray) {
                    var sea = player.sea;

                    for (var i = 0; i < atLocationArray.length; i++) {
                        var num = atLocationArray[i];
                        var row = num[0];
                        var column = num[1];
                        var shipNum = num[2];

                        sea[row][column] = shipNum;

                    }

                    setPlayerLife(player);

                    io.to(socket.id).emit('receivedPlan');
                    console.log("plan receive");

                    numberOfPlayerSubmittedPlan += 1;
                    if (numberOfPlayerSubmittedPlan === players.length) {
                        startGame();
                    }

                });

                socket.on('submitMove', function (move) {

                    // if it is not this player's turn, do nothing
                    if (player.index !== playingPlayer) return;

                    var opponent = players[(player.index+1)%players.length];

                    var row = move[0];
                    var column = move[1];

                    var shots = player.shots;
                    var opponentSea = opponent.sea;

                    var hit = 1; // miss

                    // if we hit a target
                    if (opponentSea[row][column]>0) {
                        hit = 2; // hit
                        opponent.life -= 1;
                        player.score += 1;
                    }

                    shots.push([row, column, hit]);

                    io.to(player.socket.id).emit('result', player.shots, player.score);
                    io.to(opponent.socket.id).emit('update map', player.shots,player.score);
                    io.to(player.socket.id).emit('life',player.life,opponent.life);
                    io.to(opponent.socket.id).emit('life',opponent.life,player.life);
                    if (opponent.life <= 0) {
                        // if opponent died
                        stopTimer();
                        io.to(player.socket.id).emit('gameOver', player.score, opponent.score, 1);
                        io.to(opponent.socket.id).emit('gameOver', opponent.score, player.score, 0);

                    } else {
                        nextTurn();
                        resetAndStartTimer();
                    }

                });

                socket.on('forfeit',function(){
                  var opponent = players[(player.index+1)%players.length];
                  io.to(player.socket.id).emit('gameOver', player.score, opponent.score, 0);
                  io.to(opponent.socket.id).emit('gameOver', opponent.score, player.score, 1);
                })

                socket.on('requestImages', function () {
                    var opponent = players[(player.index+1)%players.length];
                    socket.emit('updateImages', player.imgUrl, opponent.imgUrl);
                })

                socket.on('restartGame', function () {
                    restartGame();
                    io.sockets.in(gameId).emit('gameRestarted');
                })


            }

            /**
             * count the total number of cells allocated to ship
             * and use that as player's life
             * @param player
             */
            var setPlayerLife = function() {
                // cache
                var defaultLife;

                return (function(player) {
                    // if not already calculated
                    if (typeof defaultLife === 'undefined') {
                        var sea = player.sea;
                        var life = 0;
                        for (var i = 0; i < sea.length; i++) {
                            var row = sea[i];
                            for (var j = 0; j < row.length; j++) {
                                // if there is a ship at that location,
                                // increment life
                                if (row[j]>0) {
                                    life += 1;
                                }
                            }
                        }
                        defaultLife = life
                    }
                    player.life = defaultLife;
                })
            }();

            /**
             * reset both score and sea
             */
            var resetRoom = function() {
              restartGame();
              resetScore();
              io.sockets.in(gameId).emit('roomReset');
            };

            var getPlayers = function () {
                return players;
            };

            /* ============================================================================== *
             Self-involved Functions (Init)
             * ============================================================================== */

            (function init() {
                // add the host to the game
                addPlayer(socket, name);
            })();

            return {
                join: addPlayer,
                start: restartGame,
                reset: resetRoom,
                getPlayers: getPlayers,
                inProgress: getGameInprogress
            };

        };

        // expose function of GameFactory
        return {newInstance: newInstance};

    }();

    // expose function BattleshipGameModule
    return {
        init: init,
        bindSocket: bindSocket,
        bindAdmin: bindAdmin,
        onDisconnect: onDisconnect,
        getRoomList: getRoomList};

}();




  module.exports = BattleshipGameModule;
