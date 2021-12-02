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
//angular.module('app').controller("VerVideoCtrl", [
//    '$scope',
//    '$state',
//    '$stateParams',
//    '$rootScope',
//    '$sce',
//    '$location',
//    function ($scope, $state, $stateParams, $rootScope, $sce, $location) {
//        comprobarAuth();
//        const [auth, db] = firebaseInit();
//        var videoId = $stateParams.videoId;
//        var moduloId = $stateParams.moduloId;
//        $scope.videos = [];
//        $scope.descargables = [];
//        $scope.empresa = [];
//        $scope.entradaVideo;
//        auth.onAuthStateChanged(user => {
//            if (user) {
//                user.getIdTokenResult().then(idTokenResult => {
//                    db.collection("clientesPrivados").where("id", "==", idTokenResult.claims.user_id).get().then((snapshot) => {
//                        Data = snapshot.docs.map((doc) => ({
//                                idCliente: doc.id,
//                                ...doc.data()
//
//                            }));
//            alert("");
//                        if (Data[0].videosVistosMensuales < 8) {
//                            $scope.entradaVideo = true;
//                            db.collection('modulos').doc(moduloId).collection('videos').where('videoActivo', '==', 1).get().then(function (querySnapshot) {
//                                querySnapshot.forEach(function (doc) {
//                                    var video = {
//                                        videoId: doc.id
//                                    };
//                                    $scope.videos.push(video);
//                                    $scope.$digest();
//                                });
//                                for (var i = 0; i < $scope.videos.length; i++) {
//                                    if ($scope.videos[i].videoId === videoId) {
//                                        if (i === 0) {
//                                            document.getElementById("btnAtras").style.display = "none";
//                                        } else if (i === $scope.videos.length - 1) {
//                                            document.getElementById("btnSiguiente").style.display = "none";
//                                        }
//                                    }
//                                }
//                            }).catch(function (error) {
//                                console.log("Error getting cached document:", error);
//                            });
//                            getVideo(moduloId, videoId);
//                        } else {
////                            getEmpresa(idTokenResult.claims.empresaId);
//                            $scope.entradaVideo = false;
//                        }
//                        $scope.$digest();
//                    }).catch((error) => {
//                        console.log("Error getting document:", error);
//                    });
//
//                });
//            }
//        });
//        function addReproduccionToVideo() {
//            var contadorActualizado = $scope.video.contadorVistas + 1;
//            db.collection('modulos').doc(moduloId).collection('videos').doc(videoId).update({
//                contadorVistas: contadorActualizado
//            });
//        }
//        function addReproduccionToCliente(moduloId) {
//            auth.onAuthStateChanged(user => {
//                if (user) {
//                    user.getIdTokenResult().then(idTokenResult => {
//                        console.log(idTokenResult.claims.user_id);
//                        db.collection("clientesPrivados").where("id", "==", idTokenResult.claims.user_id).get().then((snapshot) => {
//                            qrData = snapshot.docs.map((doc) => ({
//                                    idCliente: doc.id,
//                                    ...doc.data()
//
//                                }));
//                            db.collection("clientesPrivados").doc(qrData[0].idCliente).collection("videosVistos").where("videoId", "==", videoId).get().then((snapshot) => {
//                                videoData = snapshot.docs.map((doc) => ({
//                                        id: doc.id,
//                                        ...doc.data()
//                                    }));
//                                    alert("dd");
//                                    console.log(videoData);
//                                if (videoData.length === 0) {
//                                   db.collection("clientesPrivados").doc(qrData[0].idCliente).collection("videosVistos").add({
//                                        videoId: videoId,
//                                        vistas: 1,
//                                        moduloId: moduloId
//                                    }).then(function (docDetailRef) {
//                                    });
//                                } else {
//                                    var vistas = videoData[0].vistas;
//                                    db.collection("empresas").doc(idTokenResult.claims.empresaId).collection("empleados").doc(qrData[0].idCliente).collection("videosVistos").doc(videoData[0].id).update({
//                                        vistas: vistas + 1
//                                    });
//                                }
//                            }).catch(function (error) {
//                                console.log("Error getting cached document:", error);
//                            });
//                            db.collection("clientesPrivados").doc(qrData[0].idCliente).update({
//                                videosVistosMensuales: qrData[0].videosVistosMensuales + 1
//                            });
//                        }).catch((error) => {
//                            console.log("Error getting document:", error);
//                        });
//
//                    });
//                } else {
//                }
//            });
//        }
//        function getReproduccionVideo(player, moduloId) {
//            player.getDuration().then(function (duration) {
//                var duracionVideo = duration / 60;
//                console.log(duracionVideo);
//                var videoVisto = (duracionVideo * 50) / 100;
//                player.on('timeupdate', function () {
//                    player.getCurrentTime().then(function (seconds) {
//                        var videoTranscurrido = seconds / 60;
//                        if (videoTranscurrido >= videoVisto) {
//                            player.off('timeupdate');
//                            addReproduccionToVideo();
//                            addReproduccionToCliente(moduloId);
//                        }
//                    }).catch(function (error) {
//                        // an error occurred
//                    });
//                });
//                // duration = the duration of the video in seconds
//            }).catch(function (error) {
//                // an error occurred
//            });
//        }
//
//        function getVideo(moduloId, videoId) {
//            videoRef = db.collection('modulos').doc(moduloId).collection('videos').doc(videoId);
//            videoRef.get().then(function (doc) {
//                $scope.video = doc.data();
//                var video = doc.data().link.split("/");
//                $rootScope.linkVideo = $sce.trustAsResourceUrl("https://player.vimeo.com/video/" + video[3]);
//                $scope.$digest();
//                var iframe = document.querySelector('iframe');
////                var iframe = {
////                    url: $rootScope.linkVideo,
////                    responsive: true,
////                    color: 'd5da48'
////                };
//                var player = new Vimeo.Player(iframe);
//                getReproduccionVideo(player, moduloId);
//                if (doc.data().archivoDescargable === 1) {
//                    db.collection('modulos').doc(moduloId).collection('videos').doc(videoId).collection("archivosDescargables").get().then(function (querySnapshot) {
//                        querySnapshot.forEach(function (doc) {
//                            var index = $scope.descargables.length + 1;
//                            var descargable = {
//                                archivoDescargable: doc.data().archivoDescargable,
//                                nombreArchivo: doc.data().nombreArchivo
//                            };
//                            $scope.descargables.push(descargable);
//                            $scope.$digest();
//                        });
//                    }).catch(function (error) {
//                        console.log("Error getting cached document:", error);
//                    });
//                } else {
//
//                }
//            }).catch(function (error) {
//                console.log("Error getting cached document:", error);
//            });
//        }
//        $scope.irASiguienteVideo = function () {
////            var contador = 0;
//            db.collection('modulos').doc(moduloId).collection('videos').where('videoActivo', '==', 1).get().then(function (querySnapshot) {
//                querySnapshot.forEach(function (doc) {
//                    var video = {
//                        videoId: doc.id
//                    };
//                    $scope.videos.push(video);
//                    $scope.$digest();
//                });
//                for (var i = 0; i < $scope.videos.length; i++) {
//                    if ($scope.videos[i].videoId === videoId) {
//                        contador = i + 1;
//                        if (contador !== $scope.videos.length) {
////                            console.log(contador);
////                            console.log($scope.videos.length);
////                            document.getElementById("btnSiguiente").style.display = "none";
////                            aqui debo de bloquear el botón para que no pueda seguir siendo presionado
//                            var url = base_url + '/clientePrivado/#!/video/' + $scope.videos[contador].videoId + '&' + moduloId;
//                            location.replace(url);
//                        }
//                        if (contador === $scope.videos.length - 1) {
//                            document.getElementById("btnSiguiente").style.display = "none";
//                        } else {
//                            document.getElementById("btnSiguiente").style.display = "block";
//                        }
//                    }
//                }
//            }).catch(function (error) {
//                console.log("Error getting cached document:", error);
//            });
//        };
//        $scope.irAAnteriorVideo = function () {
//            var contador = 0;
//            db.collection('modulos').doc(moduloId).collection('videos').where('videoActivo', '==', 1).get().then(function (querySnapshot) {
//                querySnapshot.forEach(function (doc) {
//                    var video = {
//                        videoId: doc.id
//                    };
//                    $scope.videos.push(video);
//                    $scope.$digest();
//                });
//                for (var i = 0; i < $scope.videos.length; i++) {
//                    if ($scope.videos[i].videoId === videoId) {
//                        contador = i - 1;
//                        var url = base_url + '/clientePrivado/#!/video/' + $scope.videos[contador].videoId + '&' + moduloId;
//                        location.replace(url);
//                    }
//                    if (contador === 0) {
//                        document.getElementById("btnAtras").style.display = "none";
//                    } else {
//                        document.getElementById("btnAtras").style.display = "block";
//                    }
//                }
//            }).catch(function (error) {
//                console.log("Error getting cached document:", error);
//            });
//        };
////        getVideo(moduloId, videoId);
//    }
//]);

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
        const videoId = $stateParams.videoId;
        const moduloId = $stateParams.moduloId;
        var idCliente;
        var idEmpresa;
        var idClientePrivado;
        var idVideoVisto;
        $scope.descargables = [];
        $scope.video = [];
        $scope.videos = [];
        $scope.ejercicios = [];
        auth.onAuthStateChanged(user => {
            if (user) {
                user.getIdTokenResult().then(idTokenResult => {
                    db.collection("clientesPrivados").where("id", "==", idTokenResult.claims.user_id).get().then((snapshot) => {
                        Data = snapshot.docs.map((doc) => ({
                                idCliente: doc.id,
                                ...doc.data()
                            }));
                        idCliente = idTokenResult.claims.user_id;
                        idClientePrivado = Data[0].idCliente;
//                        idEmpresa = idTokenResult.claims.empresaId;

                        if (Data[0].videosVistosMensuales < 8) {
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
                            setTimeout(getVideo, 1000);
                            setTimeout(getVideoByUser, 2000);
                            setTimeout(getRespuestas, 2200);
                        } else {
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
        function addTimeToVideo(duracion) {
            db.collection('modulos').doc(moduloId).collection('videos').doc(videoId).update({
                duracion: duracion
            });
        }
        function getReproduccionVideo(player) {
            player.getDuration().then(function (duration) {
                var duracionVideo = duration / 60;
                var videoVisto = (duracionVideo * 50) / 100;
                addTimeToVideo(duracionVideo);
                player.on('timeupdate', function () {
                    player.getCurrentTime().then(function (seconds) {
                        var videoTranscurrido = seconds / 60;
                        if (videoTranscurrido >= videoVisto) {
                            player.off('timeupdate');
                            addReproduccionToVideo();
                            addReproduccionToCliente(moduloId);
                        }
                    }).catch(function (error) {
                    });
                });
            }).catch(function (error) {
            });
        }
        function addReproduccionToCliente() {
            db.collection("clientesPrivados").where("id", "==", idCliente).get().then((snapshot) => {
                qrData = snapshot.docs.map((doc) => ({
                        idCliente: doc.id,
                        ...doc.data()

                    }));
                db.collection("clientesPrivados").doc(qrData[0].idCliente).collection("videosVistos").where("videoId", "==", videoId).get().then((snapshot) => {
                    videoData = snapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data()
                        }));
                    if (videoData.length === 0) {
                        db.collection("clientesPrivados").doc(qrData[0].idCliente).collection("videosVistos").add({
                            videoId: videoId,
                            vistas: 1,
                            moduloId: moduloId
                        }).then(function (docDetailRef) {
                        });
                    } else {
                        var vistas = videoData[0].vistas;
                        db.collection("clientesPrivados").doc(qrData[0].idCliente).collection("videosVistos").doc(videoData[0].id).update({
                            vistas: vistas + 1
                        });
                    }
                }).catch(function (error) {
                    console.log("Error getting cached document:", error);
                });
                db.collection("clientesPrivados").doc(qrData[0].idCliente).update({
                    videosVistosMensuales: qrData[0].videosVistosMensuales + 1
                });
            }).catch((error) => {
                console.log("Error getting document:", error);
            });
        }
        function getVideo() {
            videoRef = db.collection('modulos').doc(moduloId).collection('videos').doc(videoId);
            videoRef.get().then(function (doc) {
                $scope.video = doc.data();
                var video = doc.data().link.split("/");
                $rootScope.linkVideo = $sce.trustAsResourceUrl("https://player.vimeo.com/video/" + video[3]);
                $scope.$digest();
                var iframe = document.querySelector('iframe');
                var player = new Vimeo.Player(iframe);
                getReproduccionVideo(player);
                getArchivosDescargables(doc.data().archivoDescargable);
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
        function getEjercicios() {
            videoRef = db.collection('modulos').doc(moduloId).collection('videos').doc(videoId).collection('ejercicios');
            videoRef.get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    var ejercicio = {
                        ejercicioId: doc.id,
                        instrucciones: doc.data().instrucciones,
                        preguntas: doc.data().preguntas,
                        respuestas: []
                    };
                    $scope.ejercicios.push(ejercicio);
                    $scope.$digest();
                });
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
        function getRespuestas() {
            db.collection("clientesPrivados").doc(idClientePrivado).collection("videosVistos").doc(idVideoVisto).collection('ejercicios').get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    console.log(doc.data());

//                    var arrayObject = Object.keys(doc.data().respuestas);
//                    for (var i = 0; i < arrayObject.length; i++) {
//                        $scope.ejercicios[i].respuestas = doc.data().respuestas;
//                    }
                    for (var i = 0; i < $scope.ejercicios.length; i++) {
                        if ($scope.ejercicios[i].ejercicioId === doc.data().ejercicioId) {
                            $scope.ejercicios[i].respuestas = doc.data().respuestas;
                        }
                    }
                });
                $scope.$digest();
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
        function getVideoByUser() {
            db.collection("clientesPrivados").doc(idClientePrivado).collection("videosVistos").where("videoId", "==", videoId).get().then((snapshot) => {
                videoData = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                if (videoData[0] === undefined) {
                    $scope.video.see = false;

                    document.getElementById("likes").style.display = "none";

        setTimeout(() => {
            console.log("loteria");

            document.getElementById("likes").style.display = "block";
    }, 1000*60*10 );
                } else {
                    $scope.video.see = true;
                    $scope.video.like = videoData[0].like;
                    idVideoVisto = videoData[0].id;
                }
                $scope.$digest();
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
        $scope.irASiguienteVideo = function () {
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
                            var url = base_url + '/clientePrivado/#!/video/' + $scope.videos[contador].videoId + '&' + moduloId;
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
                        var url = base_url + '/clientePrivado/#!/video/' + $scope.videos[contador].videoId + '&' + moduloId;
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
        function getArchivosDescargables(archivoDescargable) {
            if (archivoDescargable === 1) {
                db.collection('modulos').doc(moduloId).collection('videos').doc(videoId).collection("archivosDescargables").get().then(function (querySnapshot) {
                    querySnapshot.forEach(function (doc) {
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
            }
        }
        async function likeAVideoByUser(like,election) {
            console.log("yoooo",idClientePrivado,videoId,idVideoVisto,like,"mlmlñmlñ");

            const result = await db.collection("clientesPrivados").doc(idClientePrivado).collection("videosVistos").doc(idVideoVisto).get();
            console.log(result.data(),"ek resukt");
            if(result.data().moduloId != undefined && (result.data().like != undefined || result.data().dislike != undefined  )  ){
            if(result.data().like == election){
                return;
            }else{
                if(election){
                    console.log("uno");
                    const vis = await db.collection("modulos").doc(result.data().moduloId).collection("videos").doc(result.data().videoId).get();
                    let likes = vis.data().likes == undefined ? 0 : vis.data().likes;
                    likes += 1;
                    let dislikes = vis.data().dislikes == undefined ? 0 : vis.data().likes;
                    if(dislikes > 0){
                        dislikes -= 1;
                    }
                    await db.collection("modulos").doc(result.data().moduloId).collection("videos").doc(result.data().videoId).update({likes:likes})
                }else{
                    console.log("otro");
                    const vis = await db.collection("modulos").doc(result.data().moduloId).collection("videos").doc(result.data().videoId).get();
                    let likes = vis.data().likes == undefined ? 0 : vis.data().likes;
                    if(likes > 0){
                        likes -= 1;
                    }
                    let dislikes = vis.data().dislikes == undefined ? 0 : vis.data().likes;
                    dislikes += 1;
                    await db.collection("modulos").doc(result.data().moduloId).collection("videos").doc(result.data().videoId).update({likes:likes,dislikes:dislikes})
                }
            }
            
          
            }else{

              const vis = await db.collection("modulos").doc(result.data().moduloId).collection("videos").doc(result.data().videoId).get();
                if(like){
              let likes = vis.data().likes == undefined ? 0 : vis.data().likes;
              likes += 1;
              await db.collection("modulos").doc(result.data().moduloId).collection("videos").doc(result.data().videoId).update({likes:likes})
                }else{

                    let dislikes = vis.data().dislikes == undefined ? 0 : vis.data().likes;
                    dislikes += 1;
                    await db.collection("modulos").doc(result.data().moduloId).collection("videos").doc(result.data().videoId).update({dislikes:dislikes})
                }


            }

            
            await db.collection("clientesPrivados").doc(idClientePrivado).collection("videosVistos").doc(idVideoVisto).update({
                like: election,
                vistas: 1
            });


        }
        $scope.clickLike = function () {
//            console.log(video);
            likeAVideoByUser(video.videoVistoId, true);
        };
        $scope.clickDislike = function () {
            likeAVideoByUser(video.videoVistoId, false);
        };

        $scope.guardarPreguntas = function (preguntas) {
            console.log(preguntas);
            for (var i = 0; i < preguntas.length; i++) {
//                 db.collection('modulos').doc(moduloId).collection('videos').where('videoActivo', '==', 1).get().then(function (querySnapshot) {
//                                querySnapshot.forEach(function (doc) {
//                                    var video = {
//                                        videoId: doc.id
//                                    };
//                                    $scope.videos.push(video);
//                                    $scope.$digest();
//                                });
//                            }).catch(function (error) {
//                                console.log("Error getting cached document:", error);
//                            });



//                console.log(preguntas[i].ejercicioId);
//                db.collection("clientesPrivados").doc(idClientePrivado).collection("videosVistos").doc(idVideoVisto).collection('ejercicios').where('ejercicioId', '==', preguntas[i].ejercicioId).get().then(function (querySnapshot) {
//                    querySnapshot.forEach(function (doc) {
//                        console.log(doc.data());
//                        console.log(doc.id);
//                        $scope.$digest();
//                    });
//
//                }).catch(function (error) {
//                    console.log("Error getting cached document:", error);
//                });




                db.collection("clientesPrivados").doc(idClientePrivado).collection("videosVistos").doc(idVideoVisto).collection('ejercicios').doc(preguntas[i].ejercicioId).set({
                    ejercicioId: preguntas[i].ejercicioId,
                    respuestas: preguntas[i].respuestas
                }).then(function (docDetailRef) {
                    alert("List");
                });
            }
        };
        getEjercicios();
    }
]);