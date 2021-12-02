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
                const empresaId = idTokenResult.claims.empresaId;
                const empleadoAuthId = idTokenResult.claims.user_id;
                return [empresaId, empleadoAuthId];
            });
        } else {
            location.href = base_url + ('#!/login');
        }
    });
}
angular.module('app').controller("EditarPerfilCtrl", [
    '$scope',
    '$state',
    function ($scope, $state) {
        comprobarAuth();
        const [auth, db] = firebaseInit();
        $scope.meses = [
            {mes: 'Enero', id: '01'},
            {mes: 'Febrero', id: '02'},
            {mes: 'Marzo', id: '03'},
            {mes: 'Abril', id: '04'},
            {mes: 'Mayo', id: '05'},
            {mes: 'Junio', id: '06'},
            {mes: 'Julio', id: '07'},
            {mes: 'Agosto', id: '08'},
            {mes: 'Septiembre', id: '09'},
            {mes: 'Octubre', id: '10'},
            {mes: 'Noviembre', id: '11'},
            {mes: 'Diciembre', id: '12'}
        ];
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
        function getDatosEmpleado() {
            auth.onAuthStateChanged(user => {
                if (user) {
                    user.getIdTokenResult().then(idTokenResult => {
                        var empresaId = idTokenResult.claims.empresaId;
                        var empleadoAuthId = idTokenResult.claims.user_id;
                        db.collection('empresas').doc(empresaId).collection('empleados').where("id", "==", empleadoAuthId).get().then((snapshot) => {
                            qrData = snapshot.docs.map((doc) => ({
                                    empleadoId: doc.id,
                                    ...doc.data()
                                }));
                            $scope.empleado = qrData[0];
                            $scope.empleado.empresaId = empresaId;
                            var fechaNacimiento = $scope.empleado.fechaNacimiento.split("/");
                            $scope.empleado.diaNacimiento = fechaNacimiento[1];
                            $scope.empleado.mesNacimiento = fechaNacimiento[0];
                            $scope.empleado.anioNacimiento = fechaNacimiento[2];
                            $scope.$digest();
                        });
                    });
                }
            });
        }
        getDatosEmpleado();
        function comprobarDiayMes(dia, mes, anio) {
            if (parseInt(anio) < 1900) {
                new Noty({
                    type: 'error',
                    layout: 'center',
                    text: 'Año no válido'
                }).show().setTimeout(3000);
                return false;
            } else if (mes === "02" || mes === "04" || mes === "06" || mes === "09" || mes === "11") {
                if (dia >= 31 || dia < 1) {
                    new Noty({
                        type: 'error',
                        layout: 'center',
                        text: 'Fecha inválida.'
                    }).show().setTimeout(3000);
                    return false;
                } else {
                    return true;
                }
            } else {
                if (dia > 31 || dia < 1) {
                    new Noty({
                        type: 'error',
                        layout: 'center',
                        text: 'Fecha inválida.'
                    }).show().setTimeout(3000);
                    return false;
                } else if (dia <= 31) {
                    return true;
                }
            }

        }
        $scope.editarDatos = function (empleado) {
            var fechaValida = comprobarDiayMes(empleado.diaNacimiento, empleado.mesNacimiento, empleado.anioNacimiento);
            //            if (fechaValida === true) {
            if ((evaluarCampo(empleado.nombre, "nombre") && evaluarCampo(empleado.primerApellido, "primer apellido") && evaluarCampo(empleado.segundoApellido, "segundo apellido") && evaluarCampo(empleado.diaNacimiento, "día") && evaluarCampo(empleado.mesNacimiento, "mes") && evaluarCampo(empleado.anioNacimiento, "año")
                    && evaluarCampo(empleado.telefono, "teléfono") && fechaValida) === true) {
                var fechaNacimiento = empleado.mesNacimiento + "/" + empleado.diaNacimiento + "/" + empleado.anioNacimiento;
                db.collection("empresas").doc(empleado.empresaId).collection("empleados").doc(empleado.empleadoId).update({
                    fechaNacimiento: fechaNacimiento,
                    nombre: empleado.nombre,
                    primerApellido: empleado.primerApellido,
                    segundoApellido: empleado.segundoApellido,
                    telefono: empleado.telefono
                }).then(function (docDetailRef) {
                    new Noty({
                        type: 'success',
                        layout: 'center',
                        text: 'Datos editados con éxito'
                    }).show().setTimeout(3000);
                    $state.go('main.home');
                }).catch(function (error) {
                    console.log("Error getting cached document:", error);
                });
            }
        };
    }
]);

