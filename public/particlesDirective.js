// angular.module('simpleControllers').directive('particles', function($window) {
// 	return {
// 		restrict: 'A',
// 		replace: true,
// 		template: '<div class="particleJs" id="particleJs"></div>',
// 		link: function(scope, element, attrs, fn) {
//
// 			$window.particlesJS('particleJs',
// 			{
// "particles": {
// "number": {
// 	"value": 5,
// 	"density": {
// 		"enable": false,
// 		"value_area": 800
// 	}
// },
// "color": {
// 	"value": "random"
// },
// "shape": {
// 	"type": "circle",
// 	"stroke": {
// 		"width": 0,
// 		"color": "#000000"
// 	},
// 	"polygon": {
// 		"nb_sides": 5
// 	},
// 	"image": {
// 		"src": "img/github.svg",
// 		"width": 100,
// 		"height": 100
// 	}
// },
// "opacity": {
// 	"value": 0.5,
// 	"random": false,
// 	"anim": {
// 		"enable": false,
// 		"speed": 1,
// 		"opacity_min": 0.1,
// 		"sync": false
// 	}
// },
// "size": {
// 	"value": 92.19591632218464,
// 	"random": true,
// 	"anim": {
// 		"enable": false,
// 		"speed": 40,
// 		"size_min": 0.1,
// 		"sync": false
// 	}
// },
// "line_linked": {
// 	"enable": true,
// 	"distance": 150,
// 	"color": "#ffffff",
// 	"opacity": 0.4,
// 	"width": 1
// },
// "move": {
// 	"enable": true,
// 	"speed": 2,
// 	"direction": "top",
// 	"random": false,
// 	"straight": false,
// 	"out_mode": "out",
// 	"bounce": false,
// 	"attract": {
// 		"enable": false,
// 		"rotateX": 600,
// 		"rotateY": 962.0443442314919
// 	}
// }
// },
// "interactivity": {
// "detect_on": "canvas",
// "events": {
// 	"onhover": {
// 		"enable": false,
// 		"mode": "repulse"
// 	},
// 	"onclick": {
// 		"enable": false,
// 		"mode": "push"
// 	},
// 	"resize": true
// },
// "modes": {
// 	"grab": {
// 		"distance": 400,
// 		"line_linked": {
// 			"opacity": 1
// 		}
// 	},
// 	"bubble": {
// 		"distance": 400,
// 		"size": 40,
// 		"duration": 2,
// 		"opacity": 8,
// 		"speed": 3
// 	},
// 	"repulse": {
// 		"distance": 200,
// 		"duration": 0.4
// 	},
// 	"push": {
// 		"particles_nb": 4
// 	},
// 	"remove": {
// 		"particles_nb": 2
// 	}
// }
// },
// "retina_detect": true
// });
//
// 		}
// 	};
// });
app.directive('particlesDrv', ['$window', '$log', particlesDrv]);

function particlesDrv($window, $log) {
  return {
    restrict: 'A',
    template: '<div class="particleJs" id="particleJs"></div>',
    link: function(scope, element, attrs, fn) {
      $log.debug('test');
      $window.particlesJS('particleJs',
			{
"particles": {
"number": {
	"value": 5,
	"density": {
		"enable": false,
		"value_area": 800
	}
},
"color": {
	"value": "random"
},
"shape": {
	"type": "circle",
	"stroke": {
		"width": 0,
		"color": "#000000"
	},
	"polygon": {
		"nb_sides": 5
	},
	"image": {
		"src": "img/github.svg",
		"width": 100,
		"height": 100
	}
},
"opacity": {
	"value": 0.5,
	"random": false,
	"anim": {
		"enable": false,
		"speed": 1,
		"opacity_min": 0.1,
		"sync": false
	}
},
"size": {
	"value": 92.19591632218464,
	"random": true,
	"anim": {
		"enable": false,
		"speed": 40,
		"size_min": 0.1,
		"sync": false
	}
},
"line_linked": {
	"enable": true,
	"distance": 150,
	"color": "#ffffff",
	"opacity": 0.4,
	"width": 1
},
"move": {
	"enable": true,
	"speed": 2,
	"direction": "top",
	"random": false,
	"straight": false,
	"out_mode": "out",
	"bounce": false,
	"attract": {
		"enable": false,
		"rotateX": 600,
		"rotateY": 962.0443442314919
	}
}
},
"interactivity": {
"detect_on": "canvas",
"events": {
	"onhover": {
		"enable": false,
		"mode": "repulse"
	},
	"onclick": {
		"enable": false,
		"mode": "push"
	},
	"resize": true
},
"modes": {
	"grab": {
		"distance": 400,
		"line_linked": {
			"opacity": 1
		}
	},
	"bubble": {
		"distance": 400,
		"size": 40,
		"duration": 2,
		"opacity": 8,
		"speed": 3
	},
	"repulse": {
		"distance": 200,
		"duration": 0.4
	},
	"push": {
		"particles_nb": 4
	},
	"remove": {
		"particles_nb": 2
	}
}
},
"retina_detect": true
});
    }
  };
}
