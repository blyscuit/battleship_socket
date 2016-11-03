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
    }

    var bindSocket = function (socket) {

        console.log("BattleShipSocket: a user has joined the game: "+socket.id);

        // give the new comer the current list of rooms
        io.emit('connected', {
            roomList: roomList
        });

        // delete the room associated with this socket
        socket.on('disconnect',function(){
            removeRoom(socket.id);
            console.log('user '+socket.id+' disconnected');

        });

        socket.on('createGameRoom', function (hostName) {

            // generate a unique id for this game
            var gameId = uuid.v4();

            var game = new GameFactory.newInstance(gameId,socket,hostName,socket.id);

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

        })

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
        var newInstance = function(gameId, socket, name, id) {

            /* ============================================================================== *
                Instance's Variables
             * ============================================================================== */

            const MAX_LIFE = 16;
            const SEA_WIDTH = 8; // x
            const SEA_HEIGHT = 8; // y

            const GAME_ID = gameId;

            /** Array index of the current platey */
            var playingPlayer = -1;

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
                Self-involved Functions
             * ============================================================================== */

            (function init() {
                // add the host to the game
                addPlayer(socket, name, id);
            })();

            /* ============================================================================== *
                Functions
             * ============================================================================== */

            /**
             * add a player to the room
             * @param socket
             * @param name
             * @param id
             */
            var addPlayer = function (socket, name, id) {
                players.push({
                    socket: socket,
                    name: name,
                    id: id,
                    shots: [],
                    sea: createEmptySea(SEA_WIDTH, SEA_HEIGHT),
                    life: id
                })
            };

            /**
             * Must run after both player joined
             */
            var restart = function() {
                // reset game parameters for each player
                for (var i = 0; i < players.length; i++) {

                    var player = players[i];

                    // clear players sea matrix and shots
                    player.sea = createEmptySea(SEA_WIDTH, SEA_HEIGHT);
                    player.shots = [];

                }

                // random who play first
                randomPlayingPlayer();
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









        }



        // expose function of GameFactory
        return {newInstance: newInstance};

    };

    // expose function GameModule
    return {init: init, bindSocket: bindSocket};

}();




  module.exports = GameModule;