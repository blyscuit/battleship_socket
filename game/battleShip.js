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
            roomList[socket.id] = room;

            notifyRoomListUpdated();

            io.emit('roomCreated', room)

        });

        socket.on('joinRoom', function (room, name) {
            var _room = roomList[room.gameId];
            console.log(_room);
            _room.game.join(socket, name);
        })


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

            const MAX_LIFE = 16;
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
             * shots - array of shots (object containing x and y location) this player has made
             *
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
             *                  {x, y},
             *                  {x, y}
             *             ],
             *
             *      life: 0
             *
             * }]
             */
            var players = [];

            /* ============================================================================== *
                Self-involved Functions (Init)
             * ============================================================================== */

            (function init() {
                // add the host to the game
                addPlayer(socket, name);


            })();

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
                    sea: createEmptySea(SEA_WIDTH, SEA_HEIGHT),
                    life: MAX_LIFE
                }

                setupPlayerSocketFunctions(player);


                players.push(player);
            };

            /**
             * Must run after both player joined
             */
            var restart = function() {
                // reset game parameters for each player
                for (var i = 0; i < players.length; i++) {

                    var player = players[i];

                    // reset player
                    player.sea = createEmptySea(SEA_WIDTH, SEA_HEIGHT);
                    player.shots = [];
                    player.life = MAX_LIFE;

                }

            };

            var startGame = function() {
                // random who play first
                randomPlayingPlayer();

                // send turn state for every player
                for (var i = 0; i < players.length; i++) {
                    var player = players[i];
                    var isMyTurn = (i === playingPlayer);
                    io.to(player.socket.id).emit('gameReady', isMyTurn);
                }


            }


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

            function createEmptySea(widht, height) {
                var sea = [];
                for (var j = 0; j < height; j++) {
                    // create a zero-filled array of SEA_WIDTH length
                    sea.push(
                        Array.apply(null, Array(widht)).map(Number.prototype.valueOf, 0));
                }
                return sea;
            }

            /**
             * random the current player's turn
             */
            function randomPlayingPlayer() {
                playingPlayer = Math.random() * players.length;
            }

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

                    io.to(socket.id).emit('receivedPlan');

                    numberOfPlayerSubmittedPlan += 1;
                    if (numberOfPlayerSubmittedPlan === players.length) {
                        startGame();
                    }

                })
                
                socket.on('submitMove', function (move) {
                    console.log(move);
                })
                
            }









        }



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