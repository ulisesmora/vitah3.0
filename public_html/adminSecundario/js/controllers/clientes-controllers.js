/* global firebase, $routeProvider, base_url, app, by, element, expect */
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

angular.module('app').controller("ClientesActivosListCtrl", [
    '$scope',
    '$firebaseArray',
    '$state',
    function ($scope, $firebaseArray, $state) {
        comprobarAuth();
        const [auth, db] = firebaseInit();
        $scope.clientes = new Array();
        var clientes = new Array();
        var ref = firebase.database().ref().child("clientes");
        $scope.messages = $firebaseArray(ref);
        $scope.verIconos = false;
        db.collection("empresas").where("clienteActivo", "==", 1).get().then((snapshot) => {
            qrData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
            for (var i = 0; i < qrData.length; i++) {
                clientes.push(qrData[i]);
            }
            $scope.clientes = clientes;
            $scope.$digest();
        }).catch(function (error) {
            console.log("Error getting cached document:", error);
        });
        $scope.informacionCliente = function (id) {
            $state.go('main.informacion-cliente', {"id": id});
        };
        $scope.metricas = function (id) {
            $state.go('main.metricas-cliente', {"id": id});
        };
    }
]);
angular.module('app').controller("InformacionClienteCtrl", [
    '$scope',
    '$state',
    '$stateParams',
    '$firebaseArray',
    function ($scope, $state, $stateParams, $firebaseArray) {
        comprobarAuth();
        var id = $stateParams.id;
        const [auth, db] = firebaseInit();
        var menu = document.getElementById("menuEditar");
        var seccionesMenu = menu.getElementsByClassName("menu-edicion-cliente");
        for (var i = 0; i < seccionesMenu.length; i++) {
            seccionesMenu[i].addEventListener("click", function () {
                var current = document.getElementsByClassName("active-menu");
                current[0].className = current[0].className.replace("active-menu", "");
                this.className += " active-menu";
            });
        }
        function getCliente(id) {
            clienteRef = db.collection('empresas').doc(id);
            clienteRef.get().then(function (doc) {
                $scope.cliente = doc.data();
//                for (var i = 0; i < doc.data().diasAcceso.length; i++) {
//                    $scope.cliente.diasAcceso[i] = doc.data().diasAcceso[i].disponible;
//                }
                $scope.$digest();
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
        getCliente(id);
        document.getElementById('datos-empresa').style.display = "block";
        document.getElementById('datos-contacto').style.display = "none";
        document.getElementById('datos-contrato').style.display = "none";
        $scope.irA = function (paginaActual, paginaDesactivadaUno, paginaDesactivadaDos) {
            document.getElementById(paginaActual).style.display = "block";
            document.getElementById(paginaDesactivadaUno).style.display = "none";
            document.getElementById(paginaDesactivadaDos).style.display = "none";
        };
        $scope.editarCliente = function () {
            $state.go('main.editar-cliente', {"id": id});
        };
    }]);