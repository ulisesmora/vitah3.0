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
    return [auth, db];
}

angular.module('app').controller("HomeCtrl", [
    '$scope',
    '$state',
    '$rootScope',
    '$sce',
    function ($scope, $state, $rootScope, $sce) {
//Llamar a la función de firebase
        const [auth, db] = firebaseInit();
        $scope.modulosContratados = [];
        $scope.diezVideos = [];
//Código
        $scope.irModulos = function (empresaId) {
            $state.go('main.modulos-contratados', {'empresaId': empresaId});
        };
        $scope.getAllVideos = [];
        document.getElementById("showslide").style.display = "none";
        auth.onAuthStateChanged(user => {
            if (user) {
                user.getIdTokenResult().then(idTokenResult => {
                    if (idTokenResult.claims.empleado === true || idTokenResult.claims.admin === false) {
                        $scope.empleado = true;
                        document.getElementById("empleado-ind").style.display = "block";
                        db.collection("empresas").doc(idTokenResult.claims.empresaId).collection("empleados").where("id", "==", idTokenResult.claims.user_id).get().then((snapshot) => {
                            qrData = snapshot.docs.map((doc) => ({
                                    empleadoid: doc.id,
                                    ...doc.data()
                                }));
                            $scope.empleadoSesion = qrData[0];
                            getVideosVistosEmpleado(idTokenResult.claims.empresaId, $scope.empleadoSesion.empleadoid);
                            $scope.empleadoSesion.empresaId = idTokenResult.claims.empresaId;
                            document.getElementById("showslide").style.display = "block";
                            $(function () {
                                $('.bxslider').bxSlider({
                                    mode: 'horizontal',
                                    captions: true,
                                    slideWidth: 1900,
                                    auto: true,
                                    autoHover: true
                                });
                            });
                            $scope.$digest();
                        }).catch(function (error) {
                            console.log("Error getting cached document:", error);
                        });
                    } else if (idTokenResult.claims.empleado === false || idTokenResult.claims.admin === true) {
                        $scope.empleado = false;
                        if ($scope.empleado === false) {
                            location.href = base_url + ('#!/error');
                        }
                    }
                });
            } else {
                location.href = base_url + ('#!/login');
            }
        });
        function getVideosVistosEmpleado(empresaId, empleadoId) {
            db.collection("empresas").doc(empresaId).get().then((doc) => {
                if (doc.exists) {
                    $scope.dataEmpresa = doc.data();
                    var fechaActual = new Date();
                    var mes = parseInt(fechaActual.getMonth());
                    mes = mes + 1;
                    var fechaActualString = "0" + mes + "/" + fechaActual.getDate() + "/" + fechaActual.getFullYear();
                    if (compararFecha($scope.dataEmpresa.fechaInicioContrato, fechaActualString) === true) {
                    } else {
                        db.collection("empresas").doc(empresaId).collection("empleados").doc(empleadoId).update({
                            videosVistosMensuales: 0
                        }).then(function (docDetailRef) {
                        }).catch(function (error) {
                            console.log("Error getting cached document:", error);
                        });
                    }
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            }).catch((error) => {
                console.log("Error getting document:", error);
            });
        }
        function compararFecha(fecha_inicio, fecha_final) {
            var inicio_array = fecha_inicio.split("/");
            var final_array = fecha_final.split("/");
            if (parseInt(final_array[2]) < parseInt(inicio_array[2])) {
                return false;
            } else if (parseInt(final_array[0]) < parseInt(inicio_array[0])) {
                if (parseInt(final_array[2]) <= parseInt(inicio_array[2])) {
                    return false;
                }
            } else if (parseInt(final_array[1]) === parseInt(inicio_array[1])) {
                return false;
            }
            return true;
        }
        function vimeoLoadingThumb(id) {
            var url = "http://vimeo.com/api/v2/video/" + id + ".json?callback=showThumb";

            var id_img = "#vimeo-" + id;

            var script = document.createElement('script');
            script.src = url;

            $(id_img).before(script);
        }
        function showThumb(data) {
            var id_img = "#vimeo-" + data[0].id;
            $(id_img).attr('src', data[0].thumbnail_medium);
        }
        function getVideosMasVistos() {
            db.collection("modulos").where("moduloActivo", "==", 1).get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    // doc.data() is never undefined for query doc snapshots
                    db.collection("modulos").doc(doc.id).collection("videos").where("videoActivo", "!=", 3).get().then((querySnapshot) => {
                        querySnapshot.forEach((docVideo) => {
                            var video = docVideo.data().link.split("/");
                            $rootScope.linkVideo = $sce.trustAsResourceUrl("https://player.vimeo.com/video/" + video[3]);
                            vimeoLoadingThumb(video[3]);
                            var videoData = {
                                linkVideo: $rootScope.linkVideo,
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
                                // a must be equal to b
                                return 0;
                            });
                            $scope.getAllVideos = $scope.getAllVideos.reverse();
//                            console.log($scope.getAllVideos);
                            $scope.diezVideos = $scope.getAllVideos.slice(0, 10);
//                            $scope.diezVideos2 = $scope.getAllVideos.slice(5, 10);

                            $scope.$digest();
                        });

                    }).catch((error) => {
                        console.log("Error getting documents: ", error);
                    });

//                    db.collection("modulos").doc(doc.id).collection("videos").where("videoActivo", "!=", 3).get().then((querySnapshot) => {
//                        querySnapshot.forEach((docVideo) => {
//                            // doc.data() is never undefined for query doc snapshots
////                    console.log(docVideo.id, " => ", docVideo.data());
//                            $scope.getAllVideos.push(docVideo.data());
//                            $scope.$digest();
//                        });
//                    }).catch((error) => {
//                        console.log("Error getting documents: ", error);
//                    });
                });
                $scope.$digest();
            }).catch((error) => {
                console.log("Error getting documents: ", error);
            });
            console.log($scope.diezVideos);
        }
        getVideosMasVistos();
        $scope.irAVideo = function(){

            console.log("click")
            alert("hola");
        };
        $('#vimeoVideo').click(false);
    }
]);

