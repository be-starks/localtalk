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
    }).when('/listings/:id', {
        templateUrl: '/partials/listing/view.html'
    }).otherwise({redirectTo: '/'});
 });

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

 app.factory('viewPassObject', function() {
    var savedData = {};
    function set(data) {
        savedData = data;
    }
    function get() {
        return savedData;
    }

    return {
        set: set,
        get: get
    }

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
});
