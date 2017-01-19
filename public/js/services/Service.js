angular.module('Locations', [])

.factory('Bridge', function($http) {

	return {
		index: function() {
			return $http({
				method: 'GET',
				url: '/api/bridges'
			})
		}
	}

})
.factory('Station', function($http) {

	return {
		index: function(position = null) {

			var parameters = "";

			if(position != null) {
				parameters = "?lat=" + (position.coords.latitude) + "&lng=" + (position.coords.longitude)
			}

			return $http({
				method: 'GET',
				url: '/api/stations' + parameters
			})
		}
	}

});