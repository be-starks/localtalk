
app.controller("MainController", function mainController($scope, $http) {
    $scope.searchDistanceOptions = [10,20,40,80,160,320].map(function (distance) {
        return {value: distance, name: distance + " miles"};
    });

    $scope.formData = {radius: $scope.searchDistanceOptions[2]};
    $scope.waitingForQueryResult = false;

    function handleError(message) {
        $scope.errorMessage = message;
        $scope.waitingForQueryResult = false;
    }

    $scope.submitQuery = function() {
        var formDataClone = JSON.parse(JSON.stringify($scope.formData));
        if(formDataClone.radius && formDataClone.radius.value) formDataClone.radius = formDataClone.radius.value;

        $scope.listings = {};
        $scope.datedListings = {};
        $scope.waitingForQueryResult = true;
        $http.get('listings/', { params : formDataClone } )
            .success(function(data) {
                if(!data.error) {
                    $scope.listings = data.listings;
                    $scope.datedListings = {};
                    for (var id in data.listings) {
                        if (data.listings.hasOwnProperty(id)) {
                            var dateKey = $scope.formatDate(new Date(data.listings[id].submitted));
                            if(!$scope.datedListings[dateKey]) $scope.datedListings[dateKey] = {};
                            $scope.datedListings[dateKey][id] = data.listings[id];
                        }
                    }

                    setTimeout(function () {
                        $scope.$apply(function () {
                            $scope.waitingForQueryResult = false;
                        });
                    }, 150);
                    delete $scope.errorMessage;
                }
                else handleError(data.error.message);
            })
            .error(handleError);
    }

    $scope.searchFormChanged = function () {
        if($scope.searchForm && $scope.searchForm.$valid)
            $scope.submitQuery();
    }

    $scope.formatDate = function (date) {
        return typeof(moment) == "function" ? ((new Date(Date.now()).getYear()) == (new Date(date)).getYear() ? moment(date).format("MMM Do") : moment(date).format("MMM Do YY")) : "";
    }
});

function logError(data) {
    console.log('Error: ' + data);
}
