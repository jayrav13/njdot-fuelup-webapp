angular.module('Locations', [])

.factory('Bridge', function($http) {

	return {
		index: function(q = null) {

			var parameters = "";

			if(q != null) {
				parameters = "?q=" + q;
			}

			return $http({
				method: 'GET',
				url: '/api/bridges' + parameters
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