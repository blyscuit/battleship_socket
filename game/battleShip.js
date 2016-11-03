var uuid = require('node-uuid');

var GameModule = function () {

    // map gameId to room
    var roomList = {};
    // map host to gameId (should use database but meh)
    var hostGameMap = {};
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
     * @param hostId - the room to be removed
     */
    function removeRoom(hostId) {
        delete roomList[hostGameMap[hostId]];
        notifyRoomListUpdated()
    }

    // ==========================================================

    var bindSocket = function (socket) {

        console.log("BattleShipSocket: a user has joined the game: "+socket.id);

        socket.on('createGameRoom', function (hostName) {

            // generate a unique id for this game
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
            removeRoom(hostGameMap[socket.id]);

            // update the hostId <-> gameId map
            hostGameMap[socket.id] = gameId;

            // keep track of the new room
            roomList[gameId] = room;

            notifyRoomListUpdated();

            io.emit('roomCreated', room)

        });

        socket.on('joinRoom', function (room, name) {
            // map client-side room doesn't contain the game object so we map it to server-side room
            var _room = roomList[room.gameId];
            _room.game.join(socket, name);

            // since the each room always have the host
            // we know that this is the second player, so we should start the game!
            _room.game.start();

        })

    };

    var GameFactory = function(){

        /**
         * Create a new room with Host's Socket, Name, and ID
         * @param socket - host's socket
         * @param name - host's name
         * @param id - host's id
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
                Functions
             * ============================================================================== */

            /**
             * add a player to the room
             * @param socket
             * @param name
             */
            var addPlayer = function (socket, name) {
                var player = {
                    socket: socket,
                    name: name,
                    shots: [],
                    gotShots: [],
                    sea: createEmptySea(SEA_WIDTH, SEA_HEIGHT),
                    life: -1,
                    index: players.length,
                    score: 0
                };

                setupPlayerSocketFunctions(player);
                players.push(player);
                console.log('added');
            };

            /**
             * This function should be run once both user has joined.
             * It reset the game state and start player's planning process
             */
            var restartGame = function() {

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

            var startGame = function() {

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
            }

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
            })()

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
                        var num = atLocationArray[i]
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
                    io.to(opponent.socket.id).emit('update map', player.shots);

                    if (opponent.life <= 0) {
                        // if opponent died
                        io.to(player.socket.id).emit('gameOver', player.score, opponent.score, 1);
                        io.to(opponent.socket.id).emit('gameOver', opponent.score, player.score, 0);

                    } else {
                        // nextTurn();
                    }

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


            /* ============================================================================== *
             Self-involved Functions (Init)
             * ============================================================================== */

            (function init() {
                // add the host to the game
                addPlayer(socket, name);


            })();


            return {
                join: addPlayer,
                start: restartGame
            };



        };



        // expose function of GameFactory
        return {newInstance: newInstance};

    }();

    // expose function GameModule
    return {
        init: init,
        bindSocket: bindSocket,
        onDisconnect: onDisconnect,
        getRoomList: getRoomList};

}();




  module.exports = GameModule;