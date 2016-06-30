var app = angular.module('localtalk', ['ngRoute', 'ngAnimate']);

app.config(function($locationProvider, $routeProvider) {
    $locationProvider.html5Mode({enabled:true, requireBase: false});
    $routeProvider.when('/', {
       templateUrl: '/main.html'
    });
    $routeProvider.when('/login', {
       templateUrl: '/login.html'
    });
    $routeProvider.when('/register', {
       templateUrl: '/register.html'
    });
    $routeProvider.when('/profile', {
        templateUrl: '/profile.html'
    });
    //$routeProvider.otherwise({redirectTo: '/home', controller: HomeCtrl});
 });

app.directive('ngChildFocus', function() {
    return {
        restrict: 'A',
        replace: 'false',
        link: function(scope, elem, attrs) {
            elem.find("input, select, textarea").bind("focus", function () {
                // console.log((scope.showInvalidInputMessages ? "show" : "hide") + " invalid input messages");
                scope.$eval(elem.attr('ng-child-focus'), {});
            });
        }
    };
});
app.directive('ngChildBlur', function() {
    return {
        restrict: 'A',
        replace: 'false',
        link: function(scope, elem, attrs) {
            elem.find("input, select, textarea").bind("blur", function () {
                // console.log((scope.showInvalidInputMessages ? "show" : "hide") + " invalid input messages");
                scope.$eval(elem.attr('ng-child-blur'), {});
            });
        }
    };
});

app.controller("MainController", function mainController($scope, $http) {
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
});

app.controller("GlobalController", function ($scope, $http) {
    $scope.globals = { user: {} };
    $http.get('/user').success(function (data) {
        console.log(data);
        $scope.globals.user = data.user;
    })
    .error(function (data) {
        console.log('Error: ' + data);
    });
});

app.controller("UserController", ['$scope', '$http', '$location', function userController($scope, $http, $location) {
    $scope.formData = {};

    $scope.signIn = function () {
        $http.post('/login', $scope.formData)
            .success(function (data) {
                $scope.errorMessage = data.error;
                delete $scope.formData.password;
                if(!data.error) {
                    $scope.formData = {};
                    $scope.globals.user = data.user;
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
                    $scope.globals.user = data.user;
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
                $scope.globals.user = data.user;
                $location.path('/');
            })
            .error(function (data) {
                console.log('Error: ' + data);
                $location.path('/');
            });
    };

    $scope.formFocused = function () {
        $scope.$apply(function () {
            $scope.showInvalidInputMessages = true;
        });
    };
    $scope.formBlurred = function () {
        $scope.$apply(function () {
            $scope.showInvalidInputMessages = false;
        });
    };
}]);
