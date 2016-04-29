angular.module('naukri.tagit', [])
    .directive('tagIt', function() {
        return {
            restrict: 'EA',
            transclude: true,
            scope: {
                tags: "=",
                remove: "&",
                tagClick: "&"
            },
            template: '<div><ul class="tags"><li  class="tagit" ng-class="{selected:tag.selected}" ng-click="tagClick({idx:tag.id})" ng-repeat="tag in tags | orderBy:id "><span class="tagText">{{::tag.text}}</span><a  ng-click="removeTmp(tag.id)" class="dCross" href="javascript:;"></a></li><li ng-transclude></li></ul></div>',

            link: function($scope, $element, $attrs, $ctrl) {
                //console.log($scope,$attrs);
                var isStrArr = (typeof $scope.tags[0] == "string");
                //$scope.tags = [];
                if (isStrArr) {
                    //var tagArr = $scope.tags;
                    for (var i = 0; i < $scope.tags.length; i++) {
                        var tmp = {
                            id: i,
                            text: $scope.tags[i]
                        };
                        $scope.tags.push(tmp);
                    }
                } else {
                    //$scope.tags = $scope.tags;
                }
                $scope.removeTmp = function(id) {
                    var index;
                    if (isStrArr) {
                        $scope.tags.splice(parseInt(id), 1);
                        $scope.remove.call(this, {
                            ID: null,
                            idx: id
                        });
                    } else {
                        for (var i = 0; i < $scope.tags.length; i++) {
                            if (id == $scope.tags[i].id) {
                                index = i;
                                break;
                            }
                        }
                        $scope.tags.splice(parseInt(index), 1);
                        $scope.remove.call(this, {
                            ID: id,
                            idx: index
                        });
                    }

                };

            }
        };
    });


angular.module('naukri.listing', [])
    .directive('ngRepeatDoneNotification', function() {
        return function(scope, element, attrs) {

            if (!scope.$parent.multiSelect) {

                if (scope.selectedId && scope.selectedId.length != 0 && scope.idHash.indexOf(scope.selectedId[0]) != -1 && scope.$last && !scope.$parent.firstReapet) {
                    console.log(scope.$parent.firstReapet)
                    scope.$parent.firstReapet = 1;
                    scope.callback({
                        'item': {
                            id: scope.selectedId[0],
                            name: scope.data[scope.idHash.indexOf(scope.selectedId[0])].name,
                            allSelected: scope.selectedId,
                            checked: null,
                            first: true
                        }
                    });
                }
            }
            //console.log(scope.$parent.idHash);
        };
    }).directive('listing', function($compile) {
        return {
            restrict: 'E',
            transclude: true,
            require: '?^listing',
            replace: true,
            scope: {
                'data': '=',
                'tupleCount': '=',
                'selectedId': '=',
                'maxHeight': '@',
                'callback': '&listingCallback',
                'multiSelect': '=',
                'filterName': "=",
                'active': '=',
                'parent': '=',
                'callbackRef': '='
            },

            //template: '<ul><li ng-repeat="item in data|limitTo:tupleCount|filter:{$:filterName}" ng-repeat-done-notification={{item.id}} ng-click="checkItem(this)"><input ng-if="multiSelect" type="checkbox" ng-model=item.checked><div style="display:inline-block;" ng-transclude></div></li></ul>',
            template: '<ul class="listing">' +
                '<li ng-repeat="item in data|limitTo:tupleCount|filter:{$:filterName}" ng-repeat-done-notification={{item.id}} ng-click="checkItem(this.item,$event)">' +
                '<div class="tuple" ng-class="{notSelectable:item.notSelectable}"><input ng-if="multiSelect && !item.notSelectable" type="checkbox" ng-checked=isChecked(item)><div class="transcluded" ng-transclude></div></div>' +
                '<listing filter-name="filterName" tuple-count="tupleCount" multi-select="multiSelect" parent="item" ng-if="item.list" selected-id ="selectedId" listing-callback="callbackRef(item)" callback-ref="callbackRef" data="item.list"><div><span>{{$parent.item.name}}</span></div></listing>' +
                '</li>' +
                '</ul>',
            compile: function(tElement, tAttr, trans) {
                var contents = tElement.contents().remove();
                var compiledContents;

                return function(scope, iElement, iAttr, controllers) {

                    if (!compiledContents) {
                        compiledContents = $compile(contents, trans);
                    }
                    var foo = compiledContents(scope, function(clone) {
                        return clone;
                    });
                    iElement.append(foo);

                    scope.selObj = {};
                    scope.idHash = [];
                    scope.selectedId = scope.selectedId || [];
                    if (scope.selectedId.length) {
                        scope.firstReapet = 0;
                    } else {
                        scope.firstReapet = 1;
                    }
                    if (scope.data) {
                        scope.data.forEach(function(x) {
                            scope.idHash.push(x.id);
                        });
                        scope.$watch('data', function(newValue, oldValue) {
                            scope.idHash = newValue.map(function(value, index) {
                                return value.id;
                            })
                        })

                    }


                    scope.$on('select', function(event, someData, flag) {
                        if (scope.multiSelect) {
                            var indexOfItem = scope.selectedId.indexOf(flag);
                            if (indexOfItem == -1) {
                                scope.selectedId.push(flag);
                            } else {
                                scope.selectedId.splice(indexOfItem, 1);
                            }
                        } else {
                            var elemToSel;
                            if (flag) {
                                elemToSel = scope.data[scope.idHash.indexOf(flag)];
                            } else {
                                elemToSel = scope.data[scope.active];
                            }


                            scope.checkItem(elemToSel);
                        }
                    });



                    scope.isActive = function(matchIdx) {
                        if (scope.active < iElement.find('li').length) {
                            return scope.active === matchIdx;
                        } else {
                            scope.active = 0;
                            //  return scope.active === matchIdx;
                        }
                    };


                    scope.isChecked = function(item) {
                        /*
                        for selecting parent and child on initial load
                         */
                        /*(scope.selectedId.indexOf(item.id) > -1) && item.list ? checkChild(item, item.list) : angular.noop();

                        scope.$parent.data ? checkParent(scope) : angular.noop();*/

                        if (scope.selectedId.indexOf(item.id) > -1) {
                            item.checked = false;
                            return true;
                        } else {
                            item.checked = true;
                            return false;
                        }
                        // return scope.selectedId.indexOf(item.id) > -1 ? true : false;
                    };


                    scope.checkItem = function(item, $event) {

                        var arr = [];
                        scope.attr = iAttr;

                        if (item.notSelectable) {
                            //iElement.addClass('notSelectable');
                            return;
                        }

                        // $event.stopPropagation();

                        scope.checkSelection(item);

                        //for selecting child elements
                        item.list ? checkChild(item, item.list) : angular.noop();

                        //for selecting parent elements
                        scope.parent ? checkParent(scope) : angular.noop();

                        scope.callback({
                            'item': {
                                id: item.id,
                                name: item.name,
                                allSelected: scope.selectedId,
                                checked: item.checked
                            }
                        });
                        //     if(scope.multiSelect){
                        //     $event.stopPropagation();
                        // }
                    };

                    /**
                     * [checkChild description]
                     * @param  {[obj]} item [selected item]
                     * @param  {[arr]} list [child list of selected item]
                     * @return {[]}      [end recursion]
                     */
                    function checkChild(item, list) {
                        if (scope.selectedId.indexOf(item.id) > -1) {
                            for (var i = list.length - 1; i >= 0; i--) {
                                if (scope.selectedId.indexOf(list[i].id) < 0) {
                                    scope.checkSelection(list[i]);
                                }
                            }
                        } else {
                            for (var i = list.length - 1; i >= 0; i--) {
                                if (scope.selectedId.indexOf(list[i].id) > -1) {
                                    scope.selectedId.splice(scope.selectedId.indexOf(list[i].id), 1);
                                }
                            }
                        }

                        if (list) {
                            for (var i = list.length - 1; i >= 0; i--) {
                                if (list[i].list) {
                                    checkChild(list[i], list[i].list);
                                }
                            }
                        } else {
                            return;
                        }
                    }

                    /**
                     * [checkParent description]
                     * @param  {[obj]} sc [selected item scope obj]
                     * @return {[]}    [end recursion]
                     */
                    function checkParent(sc) {
                        if (!sc.parent) {
                            return;
                        }

                        var flag = 1;

                        for (var i = sc.parent.list.length - 1; i >= 0; i--) {
                            if (sc.selectedId.indexOf(sc.parent.list[i].id) < 0) {
                                flag = 0;
                                break;
                            }
                        }

                        if (flag) {
                            if (sc.selectedId.indexOf(sc.parent.id) < 0 && !sc.parent.notSelectable) sc.selectedId.push(sc.parent.id);
                        } else {
                            if (sc.selectedId.indexOf(sc.parent.id) > -1) sc.selectedId.splice(sc.selectedId.indexOf(sc.parent.id), 1);
                        }

                        checkParent(sc.$parent);
                    }

                    scope.checkSelection = function(item) { // array and selectedId will be the same after this, 
                        var id = item.id;
                        scope.selectedId = scope.selectedId || [];
                        if (scope.multiSelect) {
                            var index = scope.selectedId.indexOf(id);
                            if (index == -1 && !item.notSelectable) {
                                scope.selectedId.push(id);
                                // scope.selObj[id] = item.name;
                                // item.checked = true;
                            } else {
                                scope.selectedId.splice(index, 1);
                                // delete scope.selObj[id];
                                // item.checked = false;
                            }

                        } else {
                            scope.selectedId = [];
                            scope.selectedId.push(id);
                            //item.checked = true;
                        }
                    };

                };
            }
        };
    });









angular.module('naukri.droope', ['naukri.listing', 'naukri.tagit'])

.directive('droope', ["$document",
    function($document) {
        // Runs during compile
        return {
            scope: {
                option: "=",
                callback: "&droopeCallback",
                data: "=",
                selectedId: "=",
                api: "=",
                disabled: '='
            },
            // controller: function($scope, $element, $attrs, $transclude) {},
            restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
            template: '<div class="ddwn">' +
                '<div class="DDwrap">' +
                '<ul class="DDsearch">' +
                '<li class="frst" style="float: none;">' +
                '<div class="DDinputWrap">' +
                '<span class="ddIcon srchTxt" ng-click="showDrop()"></span>' +
                '<input type="text" ng-click="showDrop()" id="" class="srchTxt" autocomplete="off" style="color: rgb(68, 68, 68);" ng-model="selectedName" ng-disabled="disabled">' +
                '</div>' +
                '</li>' +
                '</ul>' +
                '</div>' +
                '<div class="dd_dwn" ng-show="show">' +
                '<listing tuplecount="10" multi-select="option.multiselect" active="activeIndex" selected-id ="selectedId" listing-callback="listingCallback(item)" callback-ref="listingCallback" data="data" filter-name="selectedName">' +
                '{{$parent.item.name}}' +
                '</listing>' +
                '</div>' +
                '</div>',
            replace: true,
            transclude: true,
            compile: function(tElement, tAttrs) {
                /**
                 * { Default Options}
                 */
                var __options__ = {
                    fieldAttr: {
                        placeholder: 'Enter your Values'
                    }

                };
                return function linking(scope, iElm, iAttrs, controller) {

                    scope.activeIndex = 0;

                    /**
                     * {Keyboard Events Handling block}
                     */
                    iElm.find('input').on('keydown', function(evt) {
                        var target;
                        switch (evt.which) {
                            case 8:
                                if (scope.selectedName == "") {
                                    scope.show = true;
                                }
                                scope.$digest();
                                break;
                            case 9:
                                scope.blurOut();
                                break;
                            case 13:
                                evt.stopPropagation();
                                scope.$broadcast('select', this);
                                scope.$digest();
                                break;
                            case 38:
                                scope.data[scope.activeIndex].active = false;
                                scope.activeIndex--;
                                scope.data[scope.activeIndex].active = true;
                                scope.$digest();
                                break;
                            case 40:
                                scope.data[scope.activeIndex].active = false;
                                scope.activeIndex++;
                                scope.data[scope.activeIndex].active = true;
                                scope.$digest();
                                break;
                        }
                    });

                    iElm.find('input').on('focusout', function(evt) {
                        evt.stopPropagation();
                    });
                    scope.options = angular.merge(__options__, scope.option);
                    // scope.tags = [];
                    iElm.find('input').attr(scope.options.fieldAttr)

                    /**
                     * { api's exposed for module controllers to communicate with droope }
                     */
                    scope.api = {
                        resetDroope: function() {
                            //scope.active = -1;
                            scope.selectedName = "",
                            scope.selectedId = [];
                        },
                        selectItem: function(id) {
                            if (Object.prototype.toString.call(id) === '[object Array]') {
                                scope.$broadcast('select', this, id);
                            } else {
                                scope.$broadcast('select', this, id)
                            }
                        },
                        deselectItem: function(id) {
                            if (Object.prototype.toString.call(id) === '[object Array]') {
                                scope.$broadcast('select', this, id);
                            } else {
                                scope.$broadcast('select', this, id)
                            }
                        }
                    }


                    /**
                     * [function called on list click- after listing callback]
                     * @param  {[type]} retObj [object from listing callback]
                     * @return {[type]}      [tags object updated]
                     */

                    scope.listingCallback = function(retObj) {
                        var newTag = {
                            id: retObj.id,
                            name: retObj.name,
                            checked: retObj.checked
                        };
                        scope.tagUpdate(newTag, retObj.checked);
                    }

                    scope.tagUpdate = function(tagObj, checked) {
                        if (scope.option.multiselect) {
                            // if (checked) {
                            //     scope.tags.push(tagObj);
                            // } else {
                            //     var index = scope.tags.indexOf(tagObj);
                            //     scope.tags.splice(index, 1);
                            // }
                        } else {
                            scope.selectedName = tagObj.name;
                            scope.show = false;
                        }
                        scope.callback({
                            "item": tagObj
                        })


                        if (event) {
                            event.stopPropagation();
                        }
                    }
                    /**
                     * [called on input focus - will show the list]
                     */
                    scope.showDrop = function() {
                        // if (scope.option.multiselect) {

                        // } else {
                        scope.lastSelected = scope.selectedName;
                        scope.selectedName = '';
                        scope.show = true;
                        //}
                        // var parElm = document.getElementById('meraDD');
                        // var scrollCont = document.getElementById('dd_dwn');
                        // var fstElm = document.getElementById('dd_dwn').getElementsByTagName("li")[0];
                        // scope.scrollHandler(parElm, scrollCont, fstElm, fstElm);
                    }



                    /**
                     * [removing all tags]
                     */
                    // scope.removeAllTags = function() {
                    //     scope.tags = [];
                    //     if (scope.option.multiselect) {
                    //         for (i = 0; i < scope.selectedId.length; i++) {
                    //             var index = scope.data.indexOf(scope.selectedId[i]);
                    //             scope.data[index].checked = false;
                    //         }
                    //     } else {
                    //         scope.selectedName = '';
                    //     }
                    // }
                    scope.hideLayer = function() {
                        //   scope.show = false;
                    }

                    scope.blurOut = function() {
                        if (scope.selectedName != "") {
                            var blurObj = {
                                id: "",
                                name: scope.selectedName,
                                checked: 'no'
                                //  scope.show = true;
                            }
                            scope.listingCallback(blurObj);
                        }
                    }
                    /**
                     * [hide list drop on document click]
                     */
                    $document.on("click", function(event) {
                        if (!angular.element(event.target).hasClass('srchTxt')) {
                            scope.show = false;
                            if (scope.selectedName == "" || !scope.selectedName) {
                                scope.selectedName = scope.lastSelected;
                            }else{
                              scope.blurOut();
                            }

                        } else {

                        }
                        scope.$apply();
                    })
                }
            }
        };
    }
]);