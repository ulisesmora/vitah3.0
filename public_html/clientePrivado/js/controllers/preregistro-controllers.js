/* global firebase, base_url */
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
angular.module('app').controller("PreregistroCtrl", [
    '$scope',
    '$state',
    '$rootScope',
    '$sce',
    function ($scope, $state, $rootScope, $sce) {
//Llamar a la función de firebase
        const [auth, db, functions] = firebaseInit();
        var clienteUid;
        var userData;
        document.getElementById('pregunta2').style.display = "none";
        document.getElementById('pregunta3').style.display = "none";
        document.getElementById('pregunta4').style.display = "none";
        document.getElementById('pregunta5').style.display = "none";
        document.getElementById("container-preregistro").style.display = "none";
        auth.onAuthStateChanged(user => {
            if (user) {
                clienteUid = user.uid;
                userData = user;
//                 var addEmpleadoRole = functions.httpsCallable('addClienteRole');
//                addEmpleadoRole({email: user.email}).then(result => {
                user.getIdTokenResult().then(idTokenResult => {
                    console.log(clienteUid);
                    console.log(idTokenResult.claims);
                    if (idTokenResult.claims.cliente === true || idTokenResult.claims.admin === false) {
//                        $scope.empleado = true;
//                        document.getElementById("empleado-ind").style.display = "block";
//                    db.collection("customers").doc(clienteUid).get().then((snapshot) => {
//                        subscripcionData = snapshot.docs.map((doc) => ({
//                                subscripcionId: doc.id,
//                                ...doc.data()
//                            }));
//                            console.log(subscripcionData[0]);
//                            
//                        db.collection("customers").doc(clienteUid).collection("subscriptions").get().then((snapshot) => {
//                            subData = snapshot.docs.map((doc) => ({
//                                    subscripcionId: doc.id,
//                                    ...doc.data()
//                                }));
//                            console.log(subData);
//                        }).catch((error) => {
//                            console.log("Error getting document:", error);
//                        });
                        db.collection("clientesPrivados").where("id", "==", idTokenResult.claims.user_id).get().then((snapshot) => {
                            qrData = snapshot.docs.map((doc) => ({
                                    empleadoid: doc.id,
                                    ...doc.data()
                                }));
                                console.log("Entre");
                            $scope.empleadoSesion = qrData[0];
                            console.log(qrData[0]);
                            if ($scope.empleadoSesion.cuestionario === false) {
                                document.getElementById("container-preregistro").style.display = "block";
                            } else if ($scope.empleadoSesion.cuestionario === true) {
                                $state.go('main.home');
                            }

//                            idCliente = $scope.empleadoSesion.empleadoid;
//                            getVideosVistosEmpleado($scope.empleadoSesion.empleadoid);
                            $scope.$digest();
                        }).catch(function (error) {
                            console.log("Error getting cached document:", error);
                        });
                        $scope.$digest();
//                    }).catch(function (error) {
//                        console.log("Error getting cached document:", error);
//                    });

                    } else if (idTokenResult.claims.cliente === false) {
                            location.href = base_url + ('#!/error');
                        }
//                    }
                });
            } else {
//                location.href = base_url + ('#!/login');
            }
        });
        function evaluarCampo(valor, mensaje) {
            if (valor === "" || valor === undefined || valor === null || valor.length === 0) {
                new Noty({
                    type: 'error',
                    layout: 'center',
                    text: 'El campo ' + mensaje + ' no puede ir vacio'
                }).show().setTimeout(3000);
                return false;
            } else {
                return true;
            }
        }
        $scope.siguiente = function (ocultar, mostrar, edad, genero, area, puesto) {
            if ((evaluarCampo(edad, "edad") && evaluarCampo(genero, "género") && evaluarCampo(area, "área") && evaluarCampo(puesto, "puesto"))) {
                document.getElementById(ocultar).style.display = "none";
                document.getElementById(mostrar).style.display = "block";
            }
        };
        $scope.siguienteTres = function (ocultar, mostrar, buscar) {
            if (evaluarCampo(buscar, "")) {
                document.getElementById(ocultar).style.display = "none";
                document.getElementById(mostrar).style.display = "block";
            }
        };
        $scope.siguienteCuatro = function (ocultar, mostrar, buscar) {
            console.log(buscar);
            if (evaluarCampo(buscar, "")) {
                document.getElementById(ocultar).style.display = "none";
                document.getElementById(mostrar).style.display = "block";
            }
        };
        $scope.guardarDatos = function (cuestionario, areas) {
            console.log(cuestionario);
            console.log(areas);
            if (evaluarCampo(areas, "")) {
                db.collection("clientesPrivados").where("id", "==", clienteUid).get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        db.collection("clientesPrivados").doc(doc.id).collection("cuestionario").add({
                            edad: cuestionario.edad,
                            genero: cuestionario.genero,
                            area: cuestionario.area,
                            puesto: cuestionario.puesto,
                            buscasVitah: cuestionario.buscas,
                            desarrollo: cuestionario.desarrollo,
                            diezAnios: cuestionario.diezanios,
                            areas: cuestionario.areas
                        }).then(function (docDetailRef) {
                            db.collection("clientesPrivados").doc(doc.id).set({
                                status: 1,
                                cuestionario: true
                            }, {merge: true});
                            $state.go('main.home');
                        }).catch(function (error) {
                            console.log("Error getting cached document:", error);
                            $state.go('main.error-pagina-no-encontrada');
                        });
                    });
                    $scope.$digest();
                }).catch((error) => {
                    console.log("Error getting documents: ", error);
                });
            }
        };
    }
]);