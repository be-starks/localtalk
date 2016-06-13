var app = angular.module('localtalk', []);

function mainController($scope, $http) {
    $scope.formData = {};

    $http.get('listings/')
        .success(function(data) {
            $scope.listings = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    $scope.createListing = function() {
        $http.post('listings/', $scope.formData)
            .success(function(data) {
                $scope.formData = {};
                $scope.listings = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    $scope.deleteListing = function(id) {
        $http.delete('listings/' + id)
            .success(function(data) {
                if(!data.error)
                    delete $scope.listings[id];
                else {
                    console.log('Error: ' + data.error);
                }
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

}
