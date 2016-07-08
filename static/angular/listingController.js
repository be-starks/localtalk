app.controller("ListingController", ["$scope","$http","$location", 'viewPassObject', function mainController($scope, $http, $location, viewPassObject) {
    $scope.formData = {};

    $scope.submitListing = function () {
        $http.post("/listings/create", $scope.formData)
            .success(function (data) {
                if(!data.error) {
                    $scope.formData = {};
                    $location.path('/profile');
                }
                else console.log('Error: ', data);
            })
            .error(function (data) {
                console.log('Error: ', data);
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
}]);

app.controller('ViewListingController', ["$scope","$http","$routeParams", function mainController($scope, $http, $routeParams) {
    $scope.listing = null;
    if(!$scope.listing) {
        $http.get('/listings/', { params: {id: $routeParams.id} }).success(function (data) {
            console.log(data);
            if(!data.error)
                $scope.listing = data[$routeParams.id];
        }).error(function (data) {
            console.log('Error ', data);
        });
    }
    $scope.getPriceStr = function (listing) {
        if(listing.pricing) {
            return listing.pricing.price ? "$" + listing.pricing.price : (listing.pricing.min ? "$" + listing.pricing.min + "-$" + listing.pricing.max : "");
        }
    }
    $scope.hasNumericPrice = function (listing) {
        return listing.pricing && (listing.pricing.price || (listing.pricing.min && listing.pricing.max));
    }
}]);
