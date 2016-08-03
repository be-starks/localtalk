(function () {
    function handleError($scope, message) {
        $scope.errorMessage = message;
    }
    app.controller("CreateListingController", ["$scope","$http","$location", 'viewPassObject', function mainController($scope, $http, $location, viewPassObject) {
        $scope.formData = {};
        $scope.formControls = { pricingOption: 'standard' };

        $scope.submitListing = function () {
            $http.post("/listings/create", $scope.formData)
                .success(function (data) {
                    if(!data.error) {
                        $scope.formData = {};
                        $location.path('/profile');
                    }
                    else handleError($scope, 'Error: ', data);
                })
                .error(function (data) {
                    handleError($scope, 'Error: ', data);
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

    app.controller("EditListingController", ["$scope","$http","$location", '$routeParams', function mainController($scope, $http, $location, $routeParams) {
        $scope.formData = {};
        $scope.formControls = { pricingOption: 'standard' };

        // if(!$scope.listing) {
            $http.get('/listings/', { params: {id: $routeParams.id} }).success(function (data) {
                if(!data.error) {
                    var listingData = data.listings[$routeParams.id];
                    $scope.formData = listingData;
                    // console.log(listingData);
                    if(listingData.pricing && listingData.pricing.min && listingData.pricing.max)
                        $scope.formControls.pricingOption = 'range';
                    else if(listingData.pricing && listingData.pricing.price)
                        $scope.formControls.pricingOption = 'standard';
                    else
                        $scope.formControls.pricingOption = '';
                    // console.log("pricing option ", $scope.formControls.pricingOption);
                }
            }).error(function (data) {
                console.log('Error ', data);
            });
        // }

        $scope.submitListing = function () {
            var formDataClone = JSON.parse(JSON.stringify($scope.formData));
            if($scope.formControls.pricingOption == '' && formDataClone.pricing) {
                delete formDataClone.pricing.min; delete formDataClone.pricing.max; delete formDataClone.pricing.price;
            }
            else if($scope.formControls.pricingOption == 'range')
                delete formDataClone.pricing.price;
            else if($scope.formControls.pricingOption == 'standard') {
                delete formDataClone.pricing.min; delete formDataClone.pricing.max;
            }
            $http.post("/listings/edit/" + $routeParams.id, formDataClone)
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
    }]);

    app.controller('ViewListingController', ["$scope","$http","$routeParams", function mainController($scope, $http, $routeParams) {
        var listingCtrl = this;
        if(!listingCtrl.listing && $routeParams.id) {
            $http.get('/listings/', { params: {id: $routeParams.id} }).success(function (data) {
                console.log(data);
                if(!data.error)
                    $scope.listing = data.listings[$routeParams.id];
            }).error(function (data) {
                console.log('Error ', data);
            });
        }
        $scope.getPriceStr = function (listing) {
            if(listing && listing.pricing) {
                return listing.pricing.price ? "$" + listing.pricing.price : (listing.pricing.min ? "$" + listing.pricing.min + "-$" + listing.pricing.max : "");
            }
        }
        $scope.hasNumericPrice = function (listing) {
            if(listing && listing.pricing)
                return listing.pricing && (listing.pricing.price || (listing.pricing.min && listing.pricing.max));
        }
        $scope.newlinesToLineBreak = function (listing) {
            return listing.description ? (listing.description.replace(/\n/g, "<br>")) : "";
        }
    }]);
})();
