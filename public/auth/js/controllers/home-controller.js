/* global firebase, $routeProvider, base_url */
function firebaseInit() {
    //Credenciales de firebase
    var firebaseConfig = {
        apiKey: "AIzaSyAP_IetTRnQVh0BHVUCoS_NXyUQljtzxsw",
        authDomain: "vitahhomeoffice.firebaseapp.com",
        databaseURL: "https://vitahhomeoffice.firebaseio.com",
        projectId: "vitahhomeoffice",
        storageBucket: "vitahhomeoffice.appspot.com",
        messagingSenderId: "789018956263",
        appId: "1:789018956263:web:737fb9bb93acc8bdd62d42",
        measurementId: "G-RRY8C2Z555"
    };
// Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();
    const db = firebase.firestore();
    const functions = firebase.functions();
    return [auth, db, functions];
}

angular.module('app').controller("HomeCtrl", [
    '$scope',
    '$state',
    '$rootScope',
    '$sce',
    function ($scope, $state, $rootScope, $sce) {
        const [auth, db, functions] = firebaseInit();
        $scope.getAllVideos = [];
        $scope.diezVideos = [];
        $scope.modulos = [];
//        $(document).ready(function () {
//            var itemsMainDiv = ('.MultiCarousel');
//            var itemsDiv = ('.MultiCarousel-inner');
//            var itemWidth = "";
//            $('.leftLst, .rightLst').click(function () {
//                var condition = $(this).hasClass("leftLst");
//                if (condition)
//                    click(0, this);
//                else
//                    click(1, this)
//            });
//            ResCarouselSize();
//            $(window).resize(function () {
//                ResCarouselSize();
//            });
//            //this function define the size of the items
//            function ResCarouselSize() {
//                var incno = 0;
//                var dataItems = ("data-items");
//                var itemClass = ('.item');
//                var id = 0;
//                var btnParentSb = '';
//                var itemsSplit = '';
//                var sampwidth = $(itemsMainDiv).width();
//                var bodyWidth = $('body').width();
//                $(itemsDiv).each(function () {
//                    id = id + 1;
//                    var itemNumbers = $(this).find(itemClass).length;
//                    btnParentSb = $(this).parent().attr(dataItems);
//                    itemsSplit = btnParentSb.split(',');
//                    $(this).parent().attr("id", "MultiCarousel" + id);
//                    if (bodyWidth >= 1200) {
//                        incno = itemsSplit[3];
//                        itemWidth = sampwidth / incno;
//                    } else if (bodyWidth >= 992) {
//                        incno = itemsSplit[2];
//                        itemWidth = sampwidth / incno;
//                    } else if (bodyWidth >= 768) {
//                        incno = itemsSplit[1];
//                        itemWidth = sampwidth / incno;
//                    } else {
//                        incno = itemsSplit[0];
//                        itemWidth = sampwidth / incno;
//                    }
//                    $(this).css({'transform': 'translateX(0px)', 'width': itemWidth * itemNumbers});
//                    $(this).find(itemClass).each(function () {
//                        $(this).outerWidth(itemWidth);
//                    });
//
//                    $(".leftLst").addClass("over");
//                    $(".rightLst").removeClass("over");
//
//                });
//            }
//            //this function used to move the items
//            function ResCarousel(e, el, s) {
//                var leftBtn = ('.leftLst');
//                var rightBtn = ('.rightLst');
//                var translateXval = '';
//                var divStyle = $(el + ' ' + itemsDiv).css('transform');
//                var values = divStyle.match(/-?[\d\.]+/g);
//                var xds = Math.abs(values[4]);
//                if (e == 0) {
//                    translateXval = parseInt(xds) - parseInt(itemWidth * s);
//                    $(el + ' ' + rightBtn).removeClass("over");
//
//                    if (translateXval <= itemWidth / 2) {
//                        translateXval = 0;
//                        $(el + ' ' + leftBtn).addClass("over");
//                    }
//                } else if (e == 1) {
//                    var itemsCondition = $(el).find(itemsDiv).width() - $(el).width();
//                    translateXval = parseInt(xds) + parseInt(itemWidth * s);
//                    $(el + ' ' + leftBtn).removeClass("over");
//
//                    if (translateXval >= itemsCondition - itemWidth / 2) {
//                        translateXval = itemsCondition;
//                        $(el + ' ' + rightBtn).addClass("over");
//                    }
//                }
//                $(el + ' ' + itemsDiv).css('transform', 'translateX(' + -translateXval + 'px)');
//            }
//            //It is used to get some elements from btn
//            function click(ell, ee) {
//                var Parent = "#" + $(ee).parent().attr("id");
//                var slide = $(Parent).attr("data-slide");
//                ResCarousel(ell, Parent, slide);
//            }
//
//        });

        function getVideosMasVistos() {
            db.collection("modulos").where("moduloActivo", "==", 1).get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    db.collection("modulos").doc(doc.id).collection("videos").where("videoActivo", "!=", 3).get().then((querySnapshot) => {
                        querySnapshot.forEach((docVideo) => {
                            var video = docVideo.data().link.split("/");
                            $rootScope.linkVideo = $sce.trustAsResourceUrl("https://player.vimeo.com/video/" + video[3]);
                            var videoData = {
                                imageURI: docVideo.data().imageURI,
                                nombre: docVideo.data().nombre,
                                contadorVistas: docVideo.data().contadorVistas,
                                url: 'main.ver-video({videoId: "' + docVideo.id + '", moduloId: "' + doc.id + '"})'
                            };
                            $scope.getAllVideos.push(videoData);
                            $scope.getAllVideos.sort(function (a, b) {
                                if (a.contadorVistas > b.contadorVistas) {
                                    return 1;
                                }
                                if (a.contadorVistas < b.contadorVistas) {
                                    return -1;
                                }
                                return 0;
                            });
                            $scope.getAllVideos = $scope.getAllVideos.reverse();
                            $scope.diezVideos = $scope.getAllVideos.slice(0, 10);
                            $scope.$digest();
                        });

                    }).catch((error) => {
                        console.log("Error getting documents: ", error);
                    });
                });
                $scope.$digest();
            }).catch((error) => {
                console.log("Error getting documents: ", error);
            });
        }
        function addProximamente() {
            var modulo = {
                state: '',
                imageURI: 'https://i.ytimg.com/vi/_NJa5C6bpLo/sddefault.jpg',
                nombre: '¡Próximamente!',
                moduloId: ''
            };
            $scope.modulos.push(modulo);
                  $scope.$digest();
        }
        function getModulos() {
            db.collection('modulos').get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    if (doc.data().moduloActivo === 1) {
                        modulos = doc.data();
                        var modulos = {
                            state: 'main.ver-modulo({moduloId: "' + doc.id + '"})',
                            imageURI: doc.data().imageURI,
                            nombre: doc.data().nombre,
                            moduloId: doc.id
                        };
                        $scope.modulos.push(modulos);
//                        $scope.$digest();
                    }
                });
                setTimeout(addProximamente, 500);
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
            
//            console.log($scope.modulos.length);
        }
        $scope.irModulo = function (modulo) {
            console.log(modulo);
            $state.go('main.ver-modulo({moduloId:' + modulo.moduloId + '})');
        };
        setTimeout(function () {
            $(document).ready(function () {
                $('.one-time').slick({
                    dots: false,
//                    slidesToShow: 5,
                    slidesToScroll: 1,
                    touchMove: true,
                    infinite: false,
                    variableWidth: true,
                    waitForAnimate: true
                });
            });

        }, 0);

        getModulos();
        getVideosMasVistos();
    }
]);