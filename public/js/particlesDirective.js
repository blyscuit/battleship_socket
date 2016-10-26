angular.module('controller').directive('particles', function($window) {
	return {
		restrict: 'A',
		replace: true,
		template: '<div class="particleJs" id="particleJs"></div>',
		link: function(scope, element, attrs, fn) {

			$window.particlesJS('particleJs',
					{
				"particles": {
					"number": {
						"value": 1000,
						"density": {
							"enable": true,
							"value_area": 800
						}
					},
					"color": {
						"value": "#ffffff"
					},
					"shape": {
						"type": "edge",
						"stroke": {
							"width": 0,
							"color": "#FF6382"
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
						"random": true,
						"anim": {
							"enable": true,
							"speed": 1,
							"opacity_min": 0.1,
							"sync": false
						}
					},
					"size": {
						"value": 3,
						"random": true,
						"anim": {
							"enable": true,
							"speed": 3,
							"size_min": 0.1,
							"sync": false
						}
					},
					"line_linked": {
						"enable": true,
						"distance": 40,
						"color": "#FF6382",
						"opacity": 0.32,
						"width": 0.5
					},
					"move": {
						"enable": true,
						"speed": Math.cos(scope.coordx)+Math.sin(scope.coordy),
						"direction": "right",
						"random": false,
						"straight": false,
						"out_mode": "out",
						"bounce": false,
						"attract": {
							"enable": false,
							"rotateX": 600,
							"rotateY": 1200
						}
					}
				},
				"interactivity": {
					"detect_on": "canvas",
					"events": {
						"onhover": {
							"enable": true,
							"mode": "grab"
						},
						"onclick": {
							"enable": true,
							"mode": "repulse"
						},
						"resize": true
					},
					"modes": {
						"grab": {
							"distance": 150,
							"line_linked": {
								"enable": true,
								"distance": 150,
								"opacity": 0.2,
								"width": 0.5,
								"color": "#FF6382"
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
							"distance": 80,
							"duration": 0.4
						},
						"push": {
							"particles_nb": 2
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
});
