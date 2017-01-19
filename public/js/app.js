
var fuelApp = angular.module("fuelApp", [
	"ngRoute",
	"Controller",
	"Locations"
]);

fuelApp.config(function($routeProvider, $locationProvider) {
	$routeProvider
	.when("/", {
		templateUrl: "/js/views/home.html",
		controller: "HomeController"
	})
	.when("/stations", {
		templateUrl: "/js/views/stations.html",
		controller: "StationsController"
	})
	.when("/bridges", {
		templateUrl: "/js/views/bridges.html",
		controller: "BridgesController"
	});

});

fuelApp.run(function($rootScope, $location, $window) {

});