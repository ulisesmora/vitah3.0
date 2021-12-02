/* global firebase, $routeProvider, base_url, Vimeo */
//
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
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();
    const db = firebase.firestore();
    return [auth, db];
}
function comprobarAuth() {
    const [auth, db] = firebaseInit();
    auth.onAuthStateChanged(user => {
        if (user) {
            user.getIdTokenResult().then(idTokenResult => {
                user.empleado = idTokenResult.claims.cliente;
                if (user && user.empleado !== true) {
                    location.href = base_url + ('#!/error');
                } else {
                    document.getElementById("empleado-ind").style.display = "block";
                }
            });
        } else {
            location.href = base_url + ('#!/login');
        }
    });
}

angular.module('app').controller("VerModuloCtrl", [
    '$scope',
    '$state',
    '$stateParams',
    '$rootScope',
    '$sce',
    function ($scope, $state, $stateParams, $rootScope, $sce) {
        comprobarAuth();
        $scope.videos = [];
        $scope.secciones = [];
        $scope.videosVistos = [];
        const [auth, db] = firebaseInit();
        var moduloId = $stateParams.moduloId;
        var vistasMensuales;
        var clienteIdAuth;
        $scope.id;
        $scope.open = false;
        function getModulo(id) {
            moduloRef = db.collection('modulos').doc(id);
            moduloRef.get().then(function (doc) {
                if (doc.data().moduloActivo === 1) {
                    $scope.modulo = doc.data();
                }
                $scope.$digest();
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
        function getVideosVistosByUser() {
            auth.onAuthStateChanged(user => {
                if (user) {
                    user.getIdTokenResult().then(idTokenResult => {
                        clienteIdAuth = idTokenResult.claims.user_id;
                        db.collection('clientesPrivados').where("id", "==", clienteIdAuth).get().then((snapshot) => {
                            qrData = snapshot.docs.map((doc) => ({
                                    empleadoId: doc.id,
                                    ...doc.data()
                                }));
                            $scope.id = qrData[0].empleadoId;
                            db.collection('clientesPrivados').doc(qrData[0].empleadoId).collection('videosVistos').get().then(function (querySnapshot) {
                                querySnapshot.forEach(function (doc) {
                                    if (moduloId === doc.data().moduloId) {
                                        var like;
                                        if (doc.data().like !== undefined) {
                                            like = doc.data().like;
                                        }
                                        var videoVisto = {
                                            videoId: doc.data().videoId,
                                            moduloId: doc.data().moduloId,
                                            like: like,
                                            videoVistoId: doc.id
                                        };
                                        $scope.videosVistos.push(videoVisto);
                                        $scope.empleadoId = qrData[0].empleadoId;
                                        $scope.$digest();
                                    }
                                });
//                                for (var i = 0; i < $scope.videos.length; i++) {
//                                    for (var k = 0; k < videosVistos.length; k++) {
//                                        if ($scope.videos[i].videoId === videosVistos[k].videoId) {
//                                            $scope.videos[i].icon = 'fas fa-check';
//                                            $scope.$digest();
//                                        } else {
//
//                                        }
//                                    }
//                                }
                            });

                        });
                    });
                }
            });
        }
//        function getUserId() {
//            var clienteIdAuth;
//            auth.onAuthStateChanged(user => {
//                if (user) {
//                    user.getIdTokenResult().then(idTokenResult => {
//                        clienteIdAuth = idTokenResult.claims.user_id;
//                        db.collection('clientesPrivados').where("id", "==", clienteIdAuth).get().then((snapshot) => {
//                            qrData = snapshot.docs.map((doc) => ({
//                                    empleadoId: doc.id,
//                                    ...doc.data()
//                                }));
//                            vistasMensuales = qrData[0].videosVistosMensuales;
//                            if (qrData[0].videosVistosMensuales >= 8) {
//                                $scope.accesoVideos = false;
//                            } else {
//                                $scope.accesoVideos = true;
//                                $scope.$digest();
//                            }
//                            db.collection('clientesPrivados').doc(qrData[0].empleadoId).collection('videosVistos').get().then(function (querySnapshot) {
//                                querySnapshot.forEach(function (doc) {
//                                    if (id === doc.data().moduloId) {
//                                        var videoVisto = {
//                                            videoId: doc.data().videoId,
//                                            moduloId: doc.data().moduloId
//                                        };
//                                        videosVistos.push(videoVisto);
//                                        $scope.empleadoId = qrData[0].empleadoId;
//                                        $scope.$digest();
//                                    }
//                                });
//                                for (var i = 0; i < $scope.videos.length; i++) {
//                                    for (var k = 0; k < videosVistos.length; k++) {
//                                        if ($scope.videos[i].videoId === videosVistos[k].videoId) {
//                                            $scope.videos[i].icon = 'fas fa-check';
//                                            $scope.$digest();
//                                        } else {
//
//                                        }
//                                    }
//                                }
//                            });
//
//                        });
//                    });
//                }
//            });
//        }
        function getVideos(id) {
//            getUserId();
            db.collection('modulos').doc(id).collection('videos').get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    if (doc.data().videoActivo === 1) {
                        if (doc.data().duracion !== undefined) {
                            var tiempo = doc.data().duracion.toFixed(2);
                        }
                        var video = {
                            state: 'main.ver-video({videoId: "' + doc.id + '", moduloId: "' + id + '"})',
                            video: doc.data().nombre,
                            link: doc.data().link,
                            videoId: doc.id,
                            imageURI: doc.data().imageURI,
                            descripcion: doc.data().descripcion,
                            duracion: tiempo
                        };
//                        var video = doc.data().link.split("/");
//                        $rootScope.linkVideo = $sce.trustAsResourceUrl("https://player.vimeo.com/video/" + video[3]);
                        $scope.videos.push(video);
                        $scope.$digest();
                    }
                });
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
        function getSecciones() {
            for (var i = ($scope.videos.length / 4); i > 0; i--) {
                $scope.secciones.push($scope.videos.splice(0, (($scope.videos.length / i))));
            }
            for (var k = 0; k < $scope.secciones.length; k++) {
                if (k === 0) {
                    $scope.secciones[k].visto = true;
                } else {
                    $scope.secciones[k].visto = false;
                }
            }
            $scope.$digest();
        }
        function getSeccionesDesbloqueadas() {
            for (var i = 0; i < $scope.secciones.length; i++) {
                var contador = 0;
                for (var k = 0; k < $scope.secciones[i].length; k++) {
                    for (var x = 0; x < $scope.videosVistos.length; x++) {
                        if ($scope.videosVistos[x].videoId === $scope.secciones[i][k].videoId) {
                            $scope.secciones[i][k].see = true;
                            $scope.secciones[i][k].like = $scope.videosVistos[x].like;
                            $scope.secciones[i][k].videoVistoId = $scope.videosVistos[x].videoVistoId;
                            contador++;
                        }
                    }
                    if (contador === 4) {
                        $scope.secciones[i + 1].visto = true;
                    }

                }
            }
            $scope.$digest();
        }
        function likeAVideoByUser(videoVistoId, like) {
            db.collection("clientesPrivados").doc($scope.id).collection("videosVistos").doc(videoVistoId).set({
                like: like
            }, {merge: true});
        }
        $scope.clickLike = function (video) {
            likeAVideoByUser(video.videoVistoId, true);
        };
        $scope.clickDislike = function (video) {
            likeAVideoByUser(video.videoVistoId, false);
        };
        $scope.irAVideo = function (video) {
            console.log("clickmmm")
            $state.go('main.ver-video', {"videoId": video.videoId, "moduloId": moduloId});
        };
        getModulo(moduloId);
        getVideos(moduloId);
        setTimeout(getVideosVistosByUser, 1000);
        setTimeout(getSecciones, 1000);
        setTimeout(getSeccionesDesbloqueadas, 3000);
    }
]);
angular.module('app').controller("ModulosCtrl", [
    '$scope',
    '$stateParams',
    function ($scope, $stateParams) {
        comprobarAuth();
        const [auth, db] = firebaseInit();
        $scope.modulos = [];
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
                            nombre: doc.data().nombre
                        };
                        $scope.modulos.push(modulos);
                        $scope.$digest();
                    }
                });
                setTimeout(addProximamente, 500);
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
        getModulos();
    }
]);