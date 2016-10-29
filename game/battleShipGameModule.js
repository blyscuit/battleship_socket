/**
 * Created by Woods on 29/10/16.
 */

var Timer = require('timer.js');

var battleShipGameFactory = (function () {

    // all games instances share the same io
    var io;

    var init = function init(_io) {
        io = _io;
    }

    var create = function (socket, name, id) {
        /** instance variable, keep track of all players in current game */
        var gamePlayers = {
            host: {},
            guest: {}
        };

        var gameState = {
            sea: {
                host: [],
                guest: []
            }
        }
        
        function initGameState() {
        }

        var joinGame = function (_socket, _name, _id) {
            gamePlayers.guest = createPlayer(_socket, _name, _id);

            // setup games logic here


        };


        var shot = function (move) {
            var x = move.x;
            var y = move.y;

        };

        function createPlayer(_socket, _name, _id) {
           return {
               socket: _socket,
               name: _name,
               id: _id,
               stat: {
                   won: 0,
                   lost: 0
               }
           }
        }

        function bindSocketFunctions(socket, name, id) {


        }

        // setup for host (first player)
        gamePlayers.host = createPlayer(socket, name, id);

        // setup server listener
        (function bindIOFunctions() {
            io.on("")
        })();



    }

    // expose function
    return {init:init, create:create}
    
})();