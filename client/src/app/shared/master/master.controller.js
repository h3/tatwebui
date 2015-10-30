/*global angular */
angular.module('TatUi')
    .controller('MasterCtrl', function MasterCtrl($scope, $rootScope, Authentication, $cookieStore, $state, appConfiguration, TatEngineUserRsc, TatEngineTopicsRsc, Plugin, $localStorage, $stateParams) {
    'use strict';
    /**
     * Sidebar Toggle & Cookie Control
     */
    var mobileView = 992;

    var self = this;

    this.loading = false;
    this.data = {
        isFavoriteTopic: false,
        isNotificationsOffTopic: false
    };

    var views = [];

    var viewsPlugins = Plugin.getPluginsMessagesViews();
    if (viewsPlugins) {
      for (var i = 0; i < viewsPlugins.length; i++) {
        views.push(viewsPlugins[i]);
      }
    }

    $scope.getTitle = function(route) {
      var p = Plugin.getPluginByRoute(route);
      if (p) {
        return p.name;
      }
      return "";
    };

    $scope.isMessagesView = function(route) {
      return Plugin.getPluginByRoute(route);
    };

    $scope.bottomMenu = [];
    if (appConfiguration.links && appConfiguration.links.menu) {
      $scope.bottomMenu = appConfiguration.links.menu;
    }

    $scope.getWidth = function() {
        return window.innerWidth;
    };

    $scope.$watch($scope.getWidth, function(newValue) {
        if (newValue >= mobileView) {
            if (angular.isDefined($cookieStore.get('toggle'))) {
                $scope.toggle = ! $cookieStore.get('toggle') ? false : true;
            } else {
                $scope.toggle = true;
            }
        } else {
            $scope.toggle = false;
        }

    });

    $scope.toggleSidebar = function() {
        $scope.toggle = !$scope.toggle;
        $cookieStore.put('toggle', $scope.toggle);
    };

    $scope.getViews = function() {
      return views;
    };

    $scope.switchView = function(route) {
        if (!$localStorage.views) {
          $localStorage.views = {};
        }
        $localStorage.views[$stateParams.topic] = route;
        $rootScope.$broadcast('topic-change', {topic:$stateParams.topic});
    };

    $scope.isConnected = function() {
        return Authentication.isConnected();
    };

    window.onresize = function() {
        $scope.$apply();
    };

    $scope.getUser = function(field) {
        var identity = Authentication.getIdentity();
        return identity[field] ? identity[field] : '';
    };

    $scope.isAdmin = function() {
      if (Authentication.isConnected()) {
        return Authentication.getIdentity().isAdmin;
      }
      return false;
    };

    this.toggleTopicFavorite = function () {
        if (self.data.isFavoriteTopic) {
            TatEngineUserRsc.removeFavoriteTopic({
                'topic': '/' + self.topic
            }).$promise.then(function () {
                    self.data.isFavoriteTopic = false;
                    // TODO Call refresh user/me
                });
        } else {
            TatEngineUserRsc.addFavoriteTopic({
                'topic': '/' + self.topic
            }).$promise.then(function () {
                    self.data.isFavoriteTopic = true;
                    // TODO Call refresh user/me
                });
        }
    };

    this.toggleNotificationsTopic = function () {
        if (self.data.isNotificationsOffTopic) {
            TatEngineUserRsc.enableNotificationsTopic({
                'topic': '/' + self.topic
            }).$promise.then(function () {
                    self.data.isNotificationsOffTopic = false;
                    // TODO Call refresh user/me
                });
        } else {
            TatEngineUserRsc.disableNotificationsTopic({
                'topic': '/' + self.topic
            }).$promise.then(function () {
                    self.data.isNotificationsOffTopic = true;
                    // TODO Call refresh user/me
                });
        }
    };

    this.isPluginViewRoute = function(route) {
        for (var i = 0; i < views.length; i++) {
          if (views[i].route == route) {
            return true;
          }
        }
        return false;
    };

    $rootScope.$on('$stateChangeSuccess',
      function(event, toState, params) {
        $scope.path = toState.name.split('-');
        self.data.state = toState.name;
        if (self.isPluginViewRoute(toState.name)) {
              $rootScope.$broadcast('topic', params.topic);
              self.topic = params.topic;
              $scope.title = params.topic.split('/');
              self.data.favoriteTopics = Authentication.getIdentity().favoritesTopics;
              self.data.offNotificationsTopics = Authentication.getIdentity().offNotificationsTopics;
              self.data.isFavoriteTopic = false;
              self.data.isNotificationsOffTopic = false;
              if (!self.data.favoriteTopics) {
                self.data.favoriteTopics = [];
              }
              if (!self.data.offNotificationsTopics) {
                self.data.offNotificationsTopics = [];
              }
              for (var i=0; i<self.data.favoriteTopics.length; i++) {
                  if (self.data.favoriteTopics[i] === '/' + params.topic) {
                      self.data.isFavoriteTopic = true;
                  }
              }
              for (i=0; i<self.data.offNotificationsTopics.length; i++) {
                  if (self.data.offNotificationsTopics[i] === '/' + params.topic) {
                      self.data.isNotificationsOffTopic = true;
                  }
              }
        } else {
          $scope.title = toState.name;
        }
      }
    );

    $scope.$on('topic-change', function(event, meta) {
        var topic = meta.topic.replace(/^\//, '');
        var idMessage = meta.idMessage;
        var reload = false;
        if (meta.reload) {
          reload = true;
        }
        if ($localStorage && $localStorage.views && $localStorage.views[topic]) {
          if ($localStorage.views[topic] == "messages-list" || !Plugin.getPluginByRoute($localStorage.views[topic])) {
            $localStorage.views[topic] = "standardview-list";
          }
          $state.go($localStorage.views[topic], {topic: topic, idMessage:idMessage}, {inherit:false, reload:reload});
        } else {
          $state.go('standardview-list', {topic: topic, idMessage:idMessage}, {inherit:false, reload:reload});
        }
    });

    $scope.$on('loading', function(event, status) {
        self.loading = status;
    });
});
