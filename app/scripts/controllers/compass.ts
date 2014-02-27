/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />

declare var Compass;
'use strict';

angular.module('mobileMasterApp')
  .controller('CompassCtrl', function ($scope, $window : Window) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    $scope.distance = {lat:43.474894, lng: 5.97361};

    var heading = 0.0;
    // $window.navigator.geolocation.watchPosition(function(pos){
      // $scope.distance = {lat:pos.coords.latitude, lng: pos.coords.longitude};
      // $scope.$apply();
      // heading = pos.coords.heading;
    // }, function() {}, {enableHighAccuracy:true});
    
    $scope.canard = {lat:59.945043, lng: 10.713};
    $scope.direction = 56.0;

    Compass.noSupport(function() {
      alert("no support");
      }).needGPS(function() {
      alert("Need GPS");
      }).needMove(function(){
        alert("need move");
        }).init(function() {
          alert("ok")
          });
    Compass.watch(function(heading) {
      heading = heading;
    });

    var alpha, beta, gamma,
        aalpha = 0.0, abeta = 0.0, agamma = 0.0,
        smoothRatio = 0.15,
        animationRunning = false;

    function animationCallback() : void {
      console.log(abeta, beta);
      
      aalpha = aalpha + (alpha - aalpha) * smoothRatio; 
      abeta = abeta + (beta - abeta) * smoothRatio; 
      agamma = agamma + (beta - agamma) * smoothRatio; 

      var rotation = "rotate("+(-heading)+"deg) rotate3d(1,0,0,"+(-abeta)+"deg)";
      $('#compass').css("transform", rotation);

      var diff = Math.abs(aalpha-alpha) + Math.abs(abeta-beta) + Math.abs(agamma-gamma);
      if (diff > 0.01) {
        animationRunning = true;
        $window.requestAnimationFrame(animationCallback);
      }
      else {
        animationRunning = false;
      }
    }


    $window.addEventListener("deviceorientation", function(e){
      alpha = e.alpha;
      beta = e.beta;
      gamma = e.gamma;



      if (!animationRunning) {
        animationRunning = true;
        $window.requestAnimationFrame(animationCallback);
      }

    }, false);

    // if ($window.navigator salut)
    // $winldow.navigator
  });
