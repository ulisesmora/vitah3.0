/* global App, app */

angular.module("app").directive('numbersOnly', numbersOnly);
function numbersOnly() {
    var directive = {
        restrict: 'A',
        scope: {
            ngModel: '=ngModel'
        },
        link: link
    };
    return directive;
    function link(scope, element, attrs) {
        var loaded = false;
        scope.$watch('ngModel', function (newVal, oldVal) {
            if (loaded) {
                var arr = (newVal) ? (String(newVal).split('')) : [];
                if (arr.length === 0)
                    return;
                if (arr.length === 1 && (arr[0] === '.'))
                    return;
                if (isNaN(newVal) || arr[arr.length - 1] === " ") {
                    arr.pop();
                    scope.ngModel = arr.join('');
                }
                if (!scope.$eval(attrs.allowdecimals)) {
                    scope.ngModel = parseInt(scope.ngModel);
                }
                if (scope.$eval(attrs.smallerthan) && scope.$eval(attrs.smallerthan) - 1 < scope.ngModel) {
                    arr.pop();
                    scope.ngModel = arr.join('');
                }
            }
            loaded = true;
        });
    }
}