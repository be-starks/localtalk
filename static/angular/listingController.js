app.directive('gte', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$validators.gte = function(modelValue, viewValue) {
                if (ctrl.$isEmpty(modelValue))
                    return true;
                if(isFinite(modelValue)) {
                    var min = document.getElementById(attrs['gte']).value;
                    return min.length == 0 || isFinite(min) && parseFloat(min) <= parseFloat(modelValue);
                }
                return false;
            };
        }
    };
});
app.directive('lte', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$validators.lte = function(modelValue, viewValue) {
                if (ctrl.$isEmpty(modelValue))
                    return true;
                if(isFinite(modelValue)) {
                    var max = document.getElementById(attrs['lte']).value;
                    return max.length == 0 || isFinite(max) && parseFloat(max) >= parseFloat(modelValue);
                }
                return false;
            };
        }
    };
});

app.controller("ListingController", ["$scope","$http","$location", function mainController($scope, $http, $location) {
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
}]);
