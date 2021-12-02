/* global firebase, $routeProvider, base_url, path, Vimeo*/
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
                user.empleado = idTokenResult.claims.empleado;
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
angular.module('app').controller("VerVideoCtrl", [
    '$scope',
    '$state',
    '$stateParams',
    '$rootScope',
    '$sce',
    '$location',
    function ($scope, $state, $stateParams, $rootScope, $sce, $location) {
        comprobarAuth();
        const [auth, db] = firebaseInit();
        var videoId = $stateParams.videoId;
        var moduloId = $stateParams.moduloId;
        $scope.videos = [];
        $scope.descargables = [];
        $scope.empresa = [];
        $scope.entradaVideo;
        function getEmpresa(empresaId) {
            db.collection('empresas').doc(empresaId).get().then(function (doc) {
                $scope.empresa = doc.data();
                $scope.empresa.fechaInicioContratoDia = $scope.empresa.fechaInicioContrato.split("/");
                var fechaActual = new Date();
                var mes = parseInt(fechaActual.getMonth());
                mes = mes + 2;
                $scope.empresa.fechaActualString = $scope.empresa.fechaInicioContratoDia[1] + "/" + "0" + mes + "/" + fechaActual.getFullYear();
                $scope.$digest();
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
        auth.onAuthStateChanged(user => {
            if (user) {
                user.getIdTokenResult().then(idTokenResult => {
                    db.collection("empresas").doc(idTokenResult.claims.empresaId).collection("empleados").where("id", "==", idTokenResult.claims.user_id).get().then((snapshot) => {
                        qrData = snapshot.docs.map((doc) => ({
                                idCliente: doc.id,
                                ...doc.data()
                            }));
                        if (qrData[0].videosVistosMensuales < 8) {
                            $scope.entradaVideo = true;
                            db.collection('modulos').doc(moduloId).collection('videos').where('videoActivo', '==', 1).get().then(function (querySnapshot) {
                                querySnapshot.forEach(function (doc) {
                                    var video = {
                                        videoId: doc.id
                                    };
                                    $scope.videos.push(video);
                                    $scope.$digest();
                                });
                                for (var i = 0; i < $scope.videos.length; i++) {
                                    if ($scope.videos[i].videoId === videoId) {
                                        if (i === 0) {
                                            document.getElementById("btnAtras").style.display = "none";
                                        } else if (i === $scope.videos.length - 1) {
                                            document.getElementById("btnSiguiente").style.display = "none";
                                        }
                                    }
                                }
                            }).catch(function (error) {
                                console.log("Error getting cached document:", error);
                            });
                            getVideo(moduloId, videoId);
                        } else {
                            getEmpresa(idTokenResult.claims.empresaId);
                            $scope.entradaVideo = false;
                        }
                        $scope.$digest();
                    }).catch((error) => {
                        console.log("Error getting document:", error);
                    });

                });
            }
        });
        function addReproduccionToVideo() {
            var contadorActualizado = $scope.video.contadorVistas + 1;
            db.collection('modulos').doc(moduloId).collection('videos').doc(videoId).update({
                contadorVistas: contadorActualizado
            });
        }
        function addReproduccionToCliente(moduloId) {
            auth.onAuthStateChanged(user => {
                if (user) {
                    user.getIdTokenResult().then(idTokenResult => {
                        db.collection("empresas").doc(idTokenResult.claims.empresaId).collection("empleados").where("id", "==", idTokenResult.claims.user_id).get().then((snapshot) => {
                            qrData = snapshot.docs.map((doc) => ({
                                    idCliente: doc.id,
                                    ...doc.data()

                                }));
                            db.collection("empresas").doc(idTokenResult.claims.empresaId).collection("empleados").doc(qrData[0].idCliente).collection("videosVistos").where("videoId", "==", videoId).get().then((snapshot) => {
                                videoData = snapshot.docs.map((doc) => ({
                                        id: doc.id,
                                        ...doc.data()
                                    }));
                                if (videoData.length === 0) {
                                    db.collection("empresas").doc(idTokenResult.claims.empresaId).collection("empleados").doc(qrData[0].idCliente).collection("videosVistos").add({
                                        videoId: videoId,
                                        vistas: 1,
                                        moduloId: moduloId
                                    }).then(function (docDetailRef) {
                                    });
                                } else {
                                    var vistas = videoData[0].vistas;
                                    db.collection("empresas").doc(idTokenResult.claims.empresaId).collection("empleados").doc(qrData[0].idCliente).collection("videosVistos").doc(videoData[0].id).update({
                                        vistas: vistas + 1
                                    });
                                }
                            }).catch(function (error) {
                                console.log("Error getting cached document:", error);
                            });
                            db.collection("empresas").doc(idTokenResult.claims.empresaId).collection("empleados").doc(qrData[0].idCliente).update({
                                videosVistosMensuales: qrData[0].videosVistosMensuales + 1
                            });
                        }).catch((error) => {
                            console.log("Error getting document:", error);
                        });

                    });
                } else {
                }
            });
        }
        function getReproduccionVideo(player, moduloId) {
            player.getDuration().then(function (duration) {
                var duracionVideo = duration / 60;
                var videoVisto = (duracionVideo * 50) / 100;
                player.on('timeupdate', function () {
                    player.getCurrentTime().then(function (seconds) {
                        var videoTranscurrido = seconds / 60;
                        if (videoTranscurrido >= videoVisto) {
                            player.off('timeupdate');
                            addReproduccionToVideo();
                            addReproduccionToCliente(moduloId);
                        }
                    }).catch(function (error) {
                        // an error occurred
                    });
                });
                // duration = the duration of the video in seconds
            }).catch(function (error) {
                // an error occurred
            });
        }

        function getVideo(moduloId, videoId) {
            videoRef = db.collection('modulos').doc(moduloId).collection('videos').doc(videoId);
            videoRef.get().then(function (doc) {
                $scope.video = doc.data();
                var video = doc.data().link.split("/");
                $rootScope.linkVideo = $sce.trustAsResourceUrl("https://player.vimeo.com/video/" + video[3]);
                $scope.$digest();
                var iframe = document.querySelector('iframe');
//                var iframe = {
//                    url: $rootScope.linkVideo,
//                    responsive: true,
//                    color: 'd5da48'
//                };
                var player = new Vimeo.Player(iframe);
                getReproduccionVideo(player, moduloId);
                if (doc.data().archivoDescargable === 1) {
                    db.collection('modulos').doc(moduloId).collection('videos').doc(videoId).collection("archivosDescargables").get().then(function (querySnapshot) {
                        querySnapshot.forEach(function (doc) {
                            var index = $scope.descargables.length + 1;
                            var descargable = {
                                archivoDescargable: doc.data().archivoDescargable,
                                nombreArchivo: doc.data().nombreArchivo
                            };
                            $scope.descargables.push(descargable);
                            $scope.$digest();
                        });
                    }).catch(function (error) {
                        console.log("Error getting cached document:", error);
                    });
                } else {

                }
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
        $scope.irASiguienteVideo = function () {
//            var contador = 0;
            db.collection('modulos').doc(moduloId).collection('videos').where('videoActivo', '==', 1).get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    var video = {
                        videoId: doc.id
                    };
                    $scope.videos.push(video);
                    $scope.$digest();
                });
                for (var i = 0; i < $scope.videos.length; i++) {
                    if ($scope.videos[i].videoId === videoId) {
                        contador = i + 1;
                        if (contador !== $scope.videos.length) {
//                            console.log(contador);
//                            console.log($scope.videos.length);
//                            document.getElementById("btnSiguiente").style.display = "none";
//                            aqui debo de bloquear el botón para que no pueda seguir siendo presionado
                            var url = base_url + '/cliente/#!/video/' + $scope.videos[contador].videoId + '&' + moduloId;
                            location.replace(url);
                        }
                        if (contador === $scope.videos.length - 1) {
                            document.getElementById("btnSiguiente").style.display = "none";
                        } else {
                            document.getElementById("btnSiguiente").style.display = "block";
                        }
                    }
                }
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        };
        $scope.irAAnteriorVideo = function () {
            var contador = 0;
            db.collection('modulos').doc(moduloId).collection('videos').where('videoActivo', '==', 1).get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    var video = {
                        videoId: doc.id
                    };
                    $scope.videos.push(video);
                    $scope.$digest();
                });
                for (var i = 0; i < $scope.videos.length; i++) {
                    if ($scope.videos[i].videoId === videoId) {
                        contador = i - 1;
                        var url = base_url + '/cliente/#!/video/' + $scope.videos[contador].videoId + '&' + moduloId;
                        location.replace(url);
                    }
                    if (contador === 0) {
                        document.getElementById("btnAtras").style.display = "none";
                    } else {
                        document.getElementById("btnAtras").style.display = "block";
                    }
                }
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        };
//        getVideo(moduloId, videoId);
    }
]);