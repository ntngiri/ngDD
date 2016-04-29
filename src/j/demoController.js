angular.module('dropDown',[])
.controller('demoController', ['', function(){

	$scope.options = {
		data:json,
		multiselect:true,
		maxHeight: 250,
		onClickReq:onClickFunc(obj),
		preselected:selectedIDs
	};
	$scope.data = json;
        $scope.selectedId = selectedIDs;
        $scope.onClickFunc = function(obj1) {
            //$scope.cbObj = obj;
          console.log(obj1);
        }
}])