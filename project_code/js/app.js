// Create the app module.
var chromeless = angular.module('chromeless', []);

// Create the controller.
angular.module('chromeless').controller('ScreenController', function ($scope) {

   // Make sure we read the initial state as well, since the app might startup as maximized.
    $scope.isMaximized = chrome.app.window.current().isMaximized();

    $scope.handleWindowEvents = function () {
        // Happens when user uses the window bar or shortcuts to maximize.
        $scope.isMaximized = chrome.app.window.current().isMaximized();

        // This happens from an event and therefore we need to run $apply to make the UI update.
        $scope.$apply();
    };
    
    $scope.minimize = function ()
    {
        chrome.app.window.current().minimize();
    }

    $scope.maximize = function () {
        chrome.app.window.current().maximize();
    }

    $scope.restore = function () {
        chrome.app.window.current().restore();
    }

    $scope.close = function () {
        window.close();
    }

    $scope.initialize = function () {

        // Hooks up handler on the Chrome App window events.
        chrome.app.window.current().onMaximized.addListener($scope.handleWindowEvents);
        chrome.app.window.current().onMinimized.addListener($scope.handleWindowEvents);
        chrome.app.window.current().onRestored.addListener($scope.handleWindowEvents);

    }(); // Execute initialize

});