app.controller("ProfileController", ['$http', '$location', '$rootScope', function profileController($http, $location, $rootScope) {
    var this_ = this;
    this.listings = {};
    this.selectedListing = null;
    this.loadUserListings = function () {
        if($rootScope.globals.user) {
            $http.get('listings/', { params: { userId: $rootScope.globals.user._id } })
                .success(function(data) {
                    console.log(data);
                    this_.listings = data.listings;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }
    };
    this.loadUserListings();

    this.deleteListing = function () {
        if(!this_.selectedListing._id) {
            console.log("no listing appears to be selected");
            return;
        }
        var id = this_.selectedListing._id;
        $http.post('listings/delete/' + id)
            .success(function (data) {
                if(!data.error) {
                    delete this_.listings[id];
                }
                else {
                    console.log('Error: ' + data);
                }
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    }

    this.showModal = function (listing) {
        this_.selectedListing = listing;
        angular.element(document.getElementById('confirmDelete')).modal('show');
    }
}]);
