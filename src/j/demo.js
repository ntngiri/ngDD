angular.module('droopeDemo',['naukri.droope','naukri.listing'])
.controller('demoController', function($scope,$timeout) {
	$scope.onClickFunc = function(obj1) {
            console.log('tag func ',obj1)
           var newTag = {id:obj1.id,name:obj1.name}
          $scope.tags.push(newTag);
        }


    $timeout(function() {
      $scope.myApi.selectItem('2');
    }, 10000);
	$scope.options = {
		multiselect:true,
		maxHeight: 250,
	};
		$scope.data = json;
        $scope.selectedId = selectedIDs;
        $scope.tags= [];
           
    });