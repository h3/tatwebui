/*global angular*/

/**
 * @ngdoc directive
 * @name TatUi.components:messageCreateForm
 * @description
 * Component for create message form
 */
angular.module('TatUi').component('messageCreateForm',
{
  bindings: {
    issurewithnofilter: '=',
    isnofilter: '='
  },
  controllerAs: 'MessageCreateForm',
  controller: function(
    $scope,
    $rootScope,
    $state,
    TatEngineMessageRsc,
    TatEngineMessagesRsc,
    TatEngine,
    $stateParams,
    $localStorage,
    $location,
    Authentication,
    $http,
    appConfiguration
  ) {
    'use strict';

    var self = this;
    self.topic = $stateParams.topic;
    self.view = $state.current.name;
    self.currentMessage = '';
    self.config = appConfiguration.viewconfigs[self.view];

    /**
     * @ngdoc function
     * @name createMessage
     * @methodOf TatUi.components:messageCreateForm
     * @description Post a new message on the current topic
     * @param {string} msg Message to post
     */
    self.createMessage = function() {
      if (self.currentMessage.length > 0) {
        TatEngineMessageRsc.create({
          text: self.currentMessage,
          topic: self.topic
        }).$promise.then(function(data) {
          self.currentMessage = '';
          $rootScope.$broadcast('message-created', data.message);
        }, function(err) {
          TatEngine.displayReturn(err);
        });
      }
    };

  },
  templateUrl: 'app/components/message-create/message-create-form.component.html'
});
