app.controller("UserController", ['$scope', '$http', '$location', '$rootScope', function userController($scope, $http, $location, $rootScope) {
    $scope.formData = {};
    $scope.location = $location;
    $scope.signIn = function () {
        $http.post('/login', $scope.formData)
            .success(function (data) {
                $scope.errorMessage = data.error;
                delete $scope.formData.password;
                if(!data.error) {
                    $scope.formData = {};
                    $rootScope.globals.user = data.user;
                    $location.path('/');
                }
            })
            .error(function (data) {
                $scope.errorMessage = ('Error: ' + data);
            });
    }
    $scope.register = function () {
        $http.post('/register', $scope.formData)
            .success(function (data) {
                $scope.errorMessage = data.error;
                if(!data.error) {
                    $scope.formData = {};
                    $rootScope.globals.user = data.user;
                    $location.path('/');
                }
            })
            .error(function (data) {
                $scope.errorMessage = ('Error: ' + data);
            });
    }

    $scope.signOut = function () {
        $http.get('/logout')
            .success(function (data) {
                $rootScope.globals.user = data.user;
                $location.path('/');
            })
            .error(function (data) {
                console.log('Error: ' + data);
                $location.path('/');
            });
    };
}]);
