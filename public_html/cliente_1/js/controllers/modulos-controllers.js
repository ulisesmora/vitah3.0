/* global firebase, $routeProvider, base_url */
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

angular.module('app').controller("VerModuloCtrl", [
    '$scope',
    '$stateParams',
    function ($scope, $stateParams) {
        comprobarAuth();
        $scope.videos = [];
        const [auth, db] = firebaseInit();
        var id = $stateParams.moduloId;
        var videosVistos = new Array();
        var vistasMensuales;
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
        function getUserIdAndEmpresaId() {
            var empleadoIdAuth;
            var empresaId;
            auth.onAuthStateChanged(user => {
                if (user) {
                    user.getIdTokenResult().then(idTokenResult => {
                        empleadoIdAuth = idTokenResult.claims.user_id;
                        empresaId = idTokenResult.claims.empresaId;
                        getEmpresa(empresaId);
                        db.collection('empresas').doc(empresaId).collection('empleados').where("id", "==", empleadoIdAuth).get().then((snapshot) => {
                            qrData = snapshot.docs.map((doc) => ({
                                    empleadoId: doc.id,
                                    ...doc.data()
                                }));
                            vistasMensuales = qrData[0].videosVistosMensuales;
                            if (qrData[0].videosVistosMensuales >= 8) {
                                $scope.accesoVideos = false;
                            } else {
                                $scope.accesoVideos = true;
                            }
                            db.collection('empresas').doc(empresaId).collection('empleados').doc(qrData[0].empleadoId).collection('videosVistos').get().then(function (querySnapshot) {
                                querySnapshot.forEach(function (doc) {
                                    if (id === doc.data().moduloId) {
                                        var videoVisto = {
                                            videoId: doc.data().videoId,
                                            moduloId: doc.data().moduloId
                                        };
                                        videosVistos.push(videoVisto);
                                        $scope.empleadoId = qrData[0].empleadoId;
                                        $scope.$digest();
                                    }
                                });
                                for (var i = 0; i < $scope.videos.length; i++) {
                                    for (var k = 0; k < videosVistos.length; k++) {
                                        if ($scope.videos[i].videoId === videosVistos[k].videoId) {
                                            $scope.videos[i].icon = 'fas fa-check';
                                            $scope.$digest();
                                        } else {

                                        }
                                    }
                                }
                            });

                        });
                    });
                }
            });
        }
        function getVideos(id) {
            getUserIdAndEmpresaId();
            db.collection('modulos').doc(id).collection('videos').get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    if (doc.data().videoActivo === 1) {
                        var video = {
                            state: 'main.ver-video({videoId: "' + doc.id + '", moduloId: "' + id + '"})',
                            video: doc.data().nombre,
                            link: doc.data().link,
                            videoId: doc.id,
                            icon: ""
                        };
                        $scope.videos.push(video);
                        $scope.$digest();
                    }
                });

            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }

        getModulo(id);
        getVideos(id);
    }
]);
angular.module('app').controller("ModulosCtrl", [
    '$scope',
    '$stateParams',
    function ($scope, $stateParams) {
        comprobarAuth();
        const [auth, db] = firebaseInit();
        var empresaId = $stateParams.empresaId;
        $scope.modulos = [];
//        function getModulosContratados(empresaId) {
//            db.collection('empresas').doc(empresaId).get().then(function (doc) {
//                $scope.empresa = doc.data();
//                for (var i = 0; i < $scope.empresa.modulosContratados.length; i++) {
//                    var moduloId = $scope.empresa.modulosContratados[i].moduloId;
//                    var modulos;
//                    db.collection('modulos').doc(moduloId).get().then(function (doc) {
//                        if (doc.data().moduloActivo === 1) {
//                            modulos = {
//                                state: 'main.ver-modulo({moduloId: "' + doc.id + '"})',
//                                imageURI: doc.data().imageURI,
//                                nombre: doc.data().nombre
//                            };
//                            $scope.modulos.push(modulos);
//                            $scope.$digest();
//                        }
//                    }).catch(function (error) {
//                        console.log("Error getting cached document:", error);
//                    });
//                }
//                $scope.$digest();
//            }).catch(function (error) {
//                console.log("Error getting cached document:", error);
//            });
//        }
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
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
        getModulos();
    }
]);
