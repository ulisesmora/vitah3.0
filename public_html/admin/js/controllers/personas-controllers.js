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
                user.admin = idTokenResult.claims.admin;
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

angular.module('app').controller("PersonasListCtrl", [
    '$scope',
    '$state',
    function ($scope, $firebaseArray, $state) {
        comprobarAuth();
        const [auth, db] = firebaseInit();
        $scope.personas = new Array();
        var persona = new Array();

//        var ref = firebase.database().ref().child("clientes");
//        $scope.messages = $firebaseArray(ref);
//        $scope.verIconos = false;
        db.collection("clientesPrivados").get().then((snapshot) => {
            qrData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
            for (var i = 0; i < qrData.length; i++) {
//                personas.push(qrData[i]);
                getSubscripcion(qrData[i]);
            }
//            $scope.personas = personas;
            $scope.$digest();
        }).catch(function (error) {
            console.log("Error getting cached document:", error);
        });
        function getSubscripcion(personas) {
//            for (var i = 0; i < personas.length; i++) {
            var cuentaActiva;
            db.collection("customers").where("email", "==", personas.email).get().then((snapshot) => {
                customerData = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                if (customerData[0] !== undefined) {
                    db.collection("customers").doc(customerData[0].id).collection("subscriptions").where("status", "==", "active").get().then((snapshot) => {
                        subsData = snapshot.docs.map((doc) => ({
                                id: doc.id,
                                ...doc.data()
                            }));
                        if (subsData[0].cancel_at_period_end === true) {
                            cuentaActiva = "No";
                        } else {
                            cuentaActiva = "Si";
                        }
                        var timestamp = subsData[0].created.seconds;
                        var date = new Date(timestamp*1000);
                        var dataPersona = {
                            nombre: personas.nombre,
                            primerApellido: personas.primerApellido,
                            segundoApellido: personas.segundoApellido,
                            email: personas.email,
                            cuentaActiva: cuentaActiva,
                            fechaInicio: date
                        };
                        persona.push(dataPersona);
                        $scope.personas = persona;
                        $scope.$digest();
                    }).catch(function (error) {
                        console.log("Error getting cached document:", error);
                    });

                }

//            for (var i = 0; i < customerData.length; i++) {
//                personas.push(customerData[i]);
//            }
//            $scope.personas = personas;
//            $scope.$digest();
//            getSubscripcion($scope.personas);
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
//            }
        }
//        $scope.aceptarCliente = function (id) {
//            $state.go('main.aceptar-cliente-form', {"id": id});
//        };
    }
]);

