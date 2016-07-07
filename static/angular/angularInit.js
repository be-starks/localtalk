var app = angular.module('localtalk', ['ngRoute', 'ngAnimate']);

app.run(["$rootScope", "$http", "$location", function ($rootScope, $http, $location) {
    $rootScope.globals = { user: {} };
    $rootScope.preRedirectPath = "";
    $http.get('/user').success(function (data) {
        $rootScope.globals.user = data.user;
        if($rootScope.preRedirectPath)
            $location.path($rootScope.preRedirectPath);
    })
    .error(function (data) {
        console.log('Error: ' + data);
    });
}]);

app.config(function($locationProvider, $routeProvider) {
    var ensureUserLoggedIn = function ($q, $rootScope, $location) {
        if(!$rootScope.globals.user || !$rootScope.globals.user.username) {
            $rootScope.preRedirectPath = $location.path();
            $location.path("/login");
        }
        return true;
    };

    $locationProvider.html5Mode({enabled:true, requireBase: false});
    $routeProvider.when('/', {
       templateUrl: '/partials/main.html'
    }).when('/login', {
       templateUrl: '/partials/login.html'
    }).when('/register', {
       templateUrl: '/partials/register.html'
    }).when('/profile', {
        templateUrl: '/partials/profile.html',
        resolve: {
            factory: ensureUserLoggedIn
        }
    }).when('/listing/create', {
        templateUrl: '/partials/listing/create.html',
        resolve: {
            factory: ensureUserLoggedIn
        }
    }).otherwise({redirectTo: '/'});
 });

// app.directive('ngChildFocus', function() {
//     return {
//         restrict: 'A',
//         replace: 'false',
//         link: function(scope, elem, attrs) {
//             elem.find("input, select, textarea").bind("focus", function () {
//                 // console.log((scope.showInvalidInputMessages ? "show" : "hide") + " invalid input messages");
//                 scope.$eval(elem.attr('ng-child-focus'), {});
//             });
//         }
//     };
// });
// app.directive('ngChildBlur', function() {
//     return {
//         restrict: 'A',
//         replace: 'false',
//         link: function(scope, elem, attrs) {
//             elem.find("input, select, textarea").bind("blur", function () {
//                 // console.log((scope.showInvalidInputMessages ? "show" : "hide") + " invalid input messages");
//                 scope.$eval(elem.attr('ng-child-blur'), {});
//             });
//         }
//     };
// });

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

app.controller("UserController", ['$scope', '$http', '$location', '$rootScope', function userController($scope, $http, $location, $rootScope) {
    $scope.formData = {};

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
}]);
