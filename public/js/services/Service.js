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
		index: function() {
			return $http({
				method: 'GET',
				url: '/api/stations'
			})
		}
	}

});