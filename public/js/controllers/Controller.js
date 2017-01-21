angular.module('Controller', [])

.controller('HomeController', function($scope) {

})
.controller('StationsController', function($scope, Station) {

	$scope.position = false;

	$scope.error = {
		occured: false,
		class: null,
		message: null
	}

	$scope.loading = false;
	$scope.data = null;

	/**
	 *	Primary initialization function.
	 */
	$scope.init = function() {

		// Start loading bar.
		$scope.loading = true;

		// Check to see if geolocator is available.
		if(navigator.geolocation) {

			// If available, attempt to get location.
			navigator.geolocation.getCurrentPosition(function(position) {

				// Get position, make request using this position.
				$scope.position = position;

				Station.index(position)
					.then(function(data) {
						$scope.data = data;
						$scope.loading = false;
					}, function(data) {
						$scope.error.occured = true;
						$scope.error.class = "danger";
						$scope.error.message = "Stations could not be loaded. Please try again later.";
						$scope.loading = false;
					});

			}, function(error) {
				$scope.error.occured = true;
				$scope.error.class = "warning";
				$scope.error.message = "Be sure to enable permissions for Location Services on this browser. Loading all stations.";

				Station.index()
					.then(function(data) {
						$scope.data = data;
						$scope.loading = false;
					}, function(data) {
						$scope.error.occured = true;
						$scope.error.class = "danger";
						$scope.error.message = "Stations could not be loaded. Please try again later";
						$scope.loading = false;
					});
			});
		}

		// geolocator is not available.
		else {
			$scope.error.occured = true;
			$scope.error.class = "danger";
			$scope.error.message = "Location Services are not available on this browser and/or device. For best experience, please use Google Chrome.<br /><br />Loading all NJ fueling stations.";

			Station.index()
				.then(function(data) {
					$scope.data = data;
					$scope.loading = false;
				}, function(data) {
					$scope.error.occured = true;
					$scope.error.class = "danger";
					$scope.error.message = "Stations could not be loaded. Please try again later.";
					$scope.loading = false;
				});
		}

	}

	$scope.init();

})
.controller('BridgesController', function($scope, Bridge) {

	$scope.q = null;
	$scope.bridges = [];

	$scope.search = function() {
		console.log("HERE");
		Bridge.index($scope.q)
			.then(function(data) {
				$scope.bridges = data;
			}, function(data) {
				console.error("An error has occured.");
			});
	}

});