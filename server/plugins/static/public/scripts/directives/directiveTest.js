
angular.module('brainConnectivity')
.directive('testDir', function($routeParams,$location,clusterpost, probtrack){

function link($scope,$attrs,$filter){

	$scope.noJobSubmit = function()
    {
      if($scope.listJobs.length == 0)  return true;
      else return false;
    }

};
return {
    restrict : 'E',
/*    scope: {
    	testID : "="
    },*/
    link : link,
    templateUrl: 'views/directives/directiveTest.html'
}

});

