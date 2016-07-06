"use strict";
function DelayFlatsCtrl (Delay, $scope, Users, Clients, Statuses){
    console.log("DelayFlatsCtrl");
    $scope.filter = {};
    $scope.list = {};
    $scope.preload = {'delays': true, 'users': true, 'clients': true, 'statuses': true};

    $scope.delays = Delay.query(function(){
        $scope.preload.delays = false;
    });

    Users.query(function(data){
        $scope.list.users = data;
        $scope.list.users.unshift({id: 'all', name: 'Все'});
        $scope.filter.user = $scope.list.users[0];
        $scope.users = data.toDictionary();
        $scope.preload.users = false;

    });

    Clients().query(function(data){
        $scope.clients = data.toDictionary();
        $scope.preload.clients = false;
    });

    Statuses.query(function(data){
        $scope.filter.statuses = data['groups'].map(function(group){
            group.parent = angular.copy(group);
            group.list = group.statuses;
            delete group.parent.statuses;
            return group;
        });
        $scope.filter.detailed = true;
        $scope.states = data['states'].toDictionary();
        $scope.statuses = data['statuses'].toDictionary();
        $scope.preload.statuses = false;
    })
};
