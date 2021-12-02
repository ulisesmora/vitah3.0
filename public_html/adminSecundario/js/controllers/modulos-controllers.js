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
    const storage = firebase.storage().ref();
    return [auth, db, storage];
}
function comprobarAuth() {
    const [auth, db] = firebaseInit();
    auth.onAuthStateChanged(user => {
        if (user) {
            user.getIdTokenResult().then(idTokenResult => {
                user.admin = idTokenResult.claims.adminSecundario;
                if (user && user.admin !== true) {
                    location.href = base_url + ('#!/error');
                } else {
                    document.getElementById("admin-ind").style.display = "block";
                }
            });
        } else {
            location.href = base_url + ('#!/login');
        }
    });
}
angular.module('app').controller("ModulosActivosListCtrl", [
    '$scope',
    '$state',
    function ($scope, $state) {
        comprobarAuth();
        const [auth, db, storage] = firebaseInit();
        var modulos = [];
        db.collection("modulos").where("moduloActivo", "==", 1).get().then((snapshot) => {
            qrData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
            for (var i = 0; i < qrData.length; i++) {
                modulos.push(qrData[i]);
            }
            $scope.modulos = modulos;
            $scope.$digest();
        }).catch(function (error) {
            console.log("Error getting cached document:", error);
        });
        $scope.editarModulo = function (id) {
            $state.go('main.editar-modulo', {"id": id});
        };
        $scope.informacionModulo = function (id) {
            $state.go('main.informacion-modulo', {"id": id});
        };
    }
]);
angular.module('app').controller("InformacionModuloCtrl", [
    '$scope',
    '$state',
    '$stateParams',
    function ($scope, $state, $stateParams) {
        comprobarAuth();
        const [auth, db, storage] = firebaseInit();
        var id = $stateParams.id;
        console.log(id);
        $scope.modulo = [];
        $scope.videos = [];
        $scope.video = [];
        $scope.file_producto = {file: "", subir_archivo: true};
        var menu = document.getElementById("menuEditar");
        var seccionesMenu = menu.getElementsByClassName("menu-edicion-cliente");
        for (var i = 0; i < seccionesMenu.length; i++) {
            seccionesMenu[i].addEventListener("click", function () {
                var current = document.getElementsByClassName("active-menu");
                current[0].className = current[0].className.replace("active-menu", "");
                this.className += " active-menu";
            });
        }
        function getModulo(id) {
            moduloRef = db.collection('modulos').doc(id);
            moduloRef.get().then(function (doc) {
                $scope.modulo = doc.data();
                const image = document.querySelector('#image');
                image.src = doc.data().imageURI;
                urlSinImagen = doc.data().imageURI;
                $scope.$digest();
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
                $state.go('main.error-pagina-no-encontrada');
            });
        }
        function getVideos(id) {
            db.collection("modulos").doc(id).collection("videos").where("videoActivo", "!=", 3).get().then((snapshot) => {
                qrDataVideo = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                $scope.videos = qrDataVideo;
                $scope.$digest();
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
        getModulo(id);
        getVideos(id);
        document.getElementById("datos-modulo").style.display = "block";
        document.getElementById("datos-video").style.display = "none";
        document.getElementById("video-edit").style.display = "none";
//        document.getElementById("video-nuevo").style.display = "none";
        $scope.irA = function (mostrar, ocultar) {
            document.getElementById(mostrar).style.display = "block";
            document.getElementById(ocultar).style.display = "none";
        };
        $scope.cancelar = function (idHtml) {
//            document.getElementById("guardar-modulo").style.display = "block";
            document.getElementById("tabla-videos").style.display = "block";
//            document.getElementById("agregar-video").style.display = "block";
            document.getElementById(idHtml).style.display = "none";
        };
        $scope.videoNuevoShowForm = function () {
            document.getElementById("guardar-modulo").style.display = "none";
            document.getElementById("tabla-videos").style.display = "none";
            document.getElementById("agregar-video").style.display = "none";
            document.getElementById("video-nuevo").style.display = "block";
        };
         $scope.cancelar = function (idHtml) {
//            document.getElementById("guardar-modulo").style.display = "block";
            document.getElementById("tabla-videos").style.display = "block";
//            document.getElementById("agregar-video").style.display = "block";
            document.getElementById(idHtml).style.display = "none";
        };
        $scope.editarVideo = function (video) {
//            document.getElementById("guardar-modulo").style.display = "none";
            document.getElementById("tabla-videos").style.display = "none";
//            document.getElementById("agregar-video").style.display = "none";
            document.getElementById("video-edit").style.display = "block";
            $scope.video = angular.copy(video);
            if ($scope.video.archivoDescargable === 1) {
                db.collection("modulos").doc(id).collection("videos").doc($scope.video.id).collection("archivosDescargables").get().then((snapshot) => {
                    qrDataDescargables = snapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data()
                        }));
                    $scope.archivosDescargables = qrDataDescargables;
                    for (var i = 0; i < $scope.archivosDescargables.length; i++) {
                        var index = i + 1;
                        $scope.archivosDescargables[i].nombre = "Archivo" + index;
                    }
                    $scope.$digest();
                }).catch(function (error) {
                    console.log("Error getting cached document:", error);
                });
            }
        };
    }
]);