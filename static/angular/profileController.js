
app.controller("ProfileController", ['$scope', '$http', '$location', '$rootScope', function profileController($scope, $http, $location, $rootScope) {
    $scope.listings = {};
    $scope.loadUserListings = function () {
        if($rootScope.globals.user) {
            $http.get('listings/', { params: { userId: $rootScope.globals.user._id } })
                .success(function(data) {
                    $scope.listings = data;
                    console.log(data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }
    };
    $scope.loadUserListings();

    $scope.getPriceStr = function (listing) {
        if(listing.pricing) {
            return listing.pricing.price ? "$" + listing.pricing.price : (listing.pricing.min ? "$" + listing.pricing.min + "-$" + listing.pricing.max : "");
        }
    }
    $scope.hasNumericPrice = function (listing) {
        return listing.pricing && (listing.pricing.price || (listing.pricing.min && listing.pricing.max));
    }
}]);
