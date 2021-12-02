/* global firebase, $routeProvider, Noty, base_url, fetch */
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
angular.module('app').controller("RegistroEmpleadoCtrl", [
        '$scope',
        '$state',
        function ($scope, $state) {
//Llamar a la función de firebase
        const [auth, db, functions] = firebaseInit();
                $scope.codigoValido = false;
                $scope.codigoVitah;
                $scope.empleado = {};
                var idEmpresa = "";
                $scope.aceptoAvisoPrivacidad = true;
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
        function comprobarDiayMes(dia, mes, anio) {
        if (parseInt(anio) < 1900) {
        new Noty({
        type: 'error',
                layout: 'center',
                text: 'Año no válido'
        }).show().setTimeout(3000);
                return false;
        } else if (mes === "04" || mes === "06" || mes === "09" || mes === "11") {
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
        } else if (mes === "02") {
        if (dia > 29 || dia < 1) {
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
        $scope.reiniciarId = function () {
        $("#aviso-privacidad").remove();
        };
                $scope.aceptarAviso = function (avisoPrivacidad) {
                if (avisoPrivacidad === true) {
                document.getElementById('button-enviar').style.display = "none";
                } else if (avisoPrivacidad === false) {
                document.getElementById('button-enviar').style.display = "block";
                }
                };
                $scope.validarCodigo = function (codigo) {
                if (codigo === undefined || codigo === "") {
                new Noty({
                type: 'error',
                        layout: 'center',
                        text: '<div class="row align-items-center"><div class="col-md-9"><h5>Este campo no puede ir vacío.</h5><br></div></div>'
                }).show().setTimeout(2000);
                } else {

                db.collection("empresas").where("codigoEmpresa", "==", codigo).get().then((snapshot) => {
                qrData = snapshot.docs.map((doc) => ({
                id: doc.id,
                        ...doc.data()
                }));
                        idEmpresa = qrData[0].id;
                        db.collection("empresas").doc(qrData[0].id).collection("empleados").where("empleadoActivo", "==", 1).get().then((snapshot) => {
                empleadosData = snapshot.docs.map((doc) => ({
                id: doc.id,
                        ...doc.data()

                }));
                        if ((empleadosData.length < qrData[0].numeroUsuariosEmpresa) && (qrData[0].clienteActivo === 1)) {
                $("#aviso-privacidad").modal({
                escapeClose: false,
                        clickClose: false,
                        showClose: false
                });
                        $scope.codigoValido = true;
                        $scope.$digest();
                        return idEmpresa;
                } else if (qrData[0].clienteActivo === 2) {
                new Noty({
                type: 'error',
                        layout: 'center',
                        text: '<div class="row align-items-center"><div class="col-md-9"><h5>Este código ha expirado.</h5><br><p>Contacta a tu empresa.</p></div></div>'
                }).show().setTimeout(2000);
                } else {
                new Noty({
                type: 'error',
                        layout: 'center',
                        text: '<div class="row align-items-center"><div class="col-md-9"><h5>Este código ya ha alcanzado todos sus registros permitidos.</h5><br><p>Contacta a tu empresa.</p></div></div>'
                }).show().setTimeout(2000);
                }
                }).catch(function (error) {
                console.log("Error getting cached document:", error);
                });
                        $scope.$digest();
                }).catch(function (error) {
                new Noty({
                type: 'error',
                        layout: 'center',
                        text: '<div class="row align-items-center"><div class="col-md-9"><h5>Código inválido.</h5><br><p>Corrobora que este bien escrito y vuelve a intentarlo</p></div></div>'
                }).show().setTimeout(2000);
                });
                }
                };
                $scope.registrarEmpleado = function (empleado) {
                var fechaValida = comprobarDiayMes(empleado.diaNacimiento, empleado.mesNacimiento, empleado.anioNacimiento);
                        if (empleado.password === empleado.passwordRepeat) {
                if ((evaluarCampo(empleado.nombre, "nombre") && evaluarCampo(empleado.primerApellido, "primer apellido") && evaluarCampo(empleado.segundoApellido, "segundo apellido") && evaluarCampo(empleado.diaNacimiento, "día") && evaluarCampo(empleado.mesNacimiento, "mes") && evaluarCampo(empleado.anioNacimiento, "año")
                        && evaluarCampo(empleado.telefono, "teléfono") && evaluarCampo(empleado.email, "email") && evaluarCampo(empleado.password, "contraseña") && evaluarCampo(empleado.passwordRepeat, "confirmar contraseña") && fechaValida) === true) {
                var fechaNacimiento = empleado.mesNacimiento + "/" + empleado.diaNacimiento + "/" + empleado.anioNacimiento;
                        empresaRef = db.collection('empresas').doc(idEmpresa);
                        empresaRef.get().then(function (doc) {
                db.collection("empresas").doc(qrData[0].id).collection("empleados").where("empleadoActivo", "==", 1).get().then((snapshot) => {
                empleadosData = snapshot.docs.map((doc) => ({
                id: doc.id,
                        ...doc.data()
                }));
                        if (empleadosData.length < doc.data().numeroUsuariosEmpresa) {
                auth.createUserWithEmailAndPassword(empleado.email, empleado.password).then(cred => {
                var addEmpleadoRole = functions.httpsCallable('addEmpleadoRole');
                        addEmpleadoRole({email: empleado.email, empresaId: qrData[0].id}).then(result => {
                empresaRef.collection('empleados').add({
                id: cred.user.uid,
                        nombre: empleado.nombre,
                        primerApellido: empleado.primerApellido,
                        segundoApellido: empleado.segundoApellido,
                        empleadoActivo: 1,
                        email: empleado.email,
                        telefono: empleado.telefono,
                        fechaNacimiento: fechaNacimiento,
                        videosVistosMensuales: 0
                }).then(function (docDetailRef) {
                var numeroUsuariosActualizado = doc.data().numeroUsuariosEmpresa - 1;
                        console.log(numeroUsuariosActualizado);
                        empresaRef.update({
                        numeroUsuariosEmpresa: numeroUsuariosActualizado
                        }).then(function () {
                auth.signOut().then(() => {
                });
                        new Noty({
                        type: 'success',
                                layout: 'center',
                                text: '<div class="row align-items-center"><div class="col-md-9"><h5>¡Registro exitoso!</h5><br></div></div>'
                        }).show().setTimeout(2000);
                        location.href = base_url + ('/#!/login');
                        $scope.$digest();
                }).catch(function (error) {
                console.log("Error getting cached document:", error);
                        $state.go('main.error-pagina-no-encontrada');
                });
                });
                }).catch();
                }).catch((error) => {
                console.log(error);
                        var errorCode = error.code;
                        // ..
                        switch (errorCode) {
                case 'auth/email-already-in-use':
                        new Noty({
                        type: 'error',
                                layout: 'center',
                                text: '<div class="row align-items-center"><div class="col-md-9"><h5>Este correo electrónico ya se encuentra en uso.</h5><br><p>Si crees que se trata de un error, por favor, contacta con tu empresa</p></div></div>'
                        }).show().setTimeout(5000);
                        break;
                        case 'auth/weak-password':
                        new Noty({
                        type: 'error',
                                layout: 'center',
                                text: '<div class="row align-items-center"><div class="col-md-9"><h5>La contraseña debe tener mínimo 6 carácteres.</h5><br></div></div>'
                        }).show().setTimeout(5000);
                        break;
                }
                });
                        ;
                } else {
                new Noty({
                type: 'error',
                        layout: 'center',
                        text: '<div class="row align-items-center"><div class="col-md-9"><h5>Este código ya ha superado todos sus registros permitidos.</h5><br><p>Corrobora que este bien escrito y vuelve a intentarlo</p></div></div>'
                }).show().setTimeout(2000);
                }
                }).catch(function (error) {
                console.log("Error getting cached document:", error);
                });
                }).catch(function (error) {
                console.log("Error getting cached document:", error);
                });
                }
                } else {
                new Noty({
                type: 'error',
                        layout: 'center',
                        text: '<div class="row align-items-center"><div class="col-md-9"><h5>Las contraseñas no coinciden.</h5><br><p>Corrobora que esten bien escritos en ambos campos y vuelve a intentarlo</p></div></div>'
                }).show().setTimeout(2000);
                }
                };
        }
]);
        angular.module('app').controller("LoginClienteCtrl", [
        '$scope',
        '$state',
        function ($scope, $state) {
        const [auth, db, functions] = firebaseInit();
                $scope.cliente = {};
                function cambiarFormatoFecha(fecha) {
                var year = fecha.getFullYear();
                        var month = (1 + fecha.getMonth()).toString();
                        month = month.length > 1 ? month : '0' + month;
                        var day = fecha.getDate().toString();
                        day = day.length > 1 ? day : '0' + day;
                        return(month + '/' + day + '/' + year);
                }
        function compararFecha(fecha_inicio, fecha_final, fecha_actual, empresaId) {
        var inicio_array = fecha_inicio.split("/");
                var final_array = fecha_final.split("/");
                var actual_array = fecha_actual.split("/");
                var fechaConvertidaInicio = new Date(inicio_array[2], inicio_array[0], inicio_array[1]);
                var fechaConvertidaFinal = new Date(final_array[2], final_array[0], final_array[1]);
                var fechaConvertidaActual = new Date(actual_array[2], actual_array[0], actual_array[1]);
                if ((fechaConvertidaActual > fechaConvertidaInicio) && (fechaConvertidaActual < fechaConvertidaFinal)) {
        return true;
        } else {
        if (fechaConvertidaActual > fechaConvertidaFinal) {
        return false;
        } else {
        new Noty({
        type: 'error',
                layout: 'center',
                text: 'Aún no tienes acceso a tu cuenta. Regresa en la fecha correcta'
        }).show().setTimeout(3000);
        }
        }
        }
        $scope.loginCliente = function (email, password) {
        if (email !== undefined && password !== undefined) {
        auth.signInWithEmailAndPassword(email, password).then(user => {
        user.user.getIdTokenResult().then(idTokenResult => {
        console.log(idTokenResult.claims);
                var fecha = new Date();
                var diaActual = fecha.getDay();
                var fechaActual = cambiarFormatoFecha(fecha);
                if (idTokenResult.claims.empleado === true) {
        empresaRef = db.collection('empresas').doc(idTokenResult.claims.empresaId);
                empresaRef.get().then(function (doc) {
        empresaRef.collection("empleados").where("email", "==", idTokenResult.claims.email).get().then((snapshot) => {
        qrDataEmpleado = snapshot.docs.map((doc) => ({
        id: doc.id,
                ...doc.data()
        }));
                if (compararFecha(doc.data().fechaInicioContrato, doc.data().fechaFinalContrato, fechaActual, idTokenResult.claims.empresaId) === true) {
        if ((doc.data().diasAcceso[diaActual].disponible === true) && (doc.data().clienteActivo === 1) && (qrDataEmpleado[0].empleadoActivo === 1)) {
        new Noty({
        type: 'success',
                layout: 'topRight',
                text: 'Acceso exitoso.'
        }).show().setTimeout(3000);
                window.location.replace(base_url + 'cliente/index.html');
                location.href = base_url + ('cliente/#!/home');
        } else if ((doc.data().diasAcceso[diaActual].disponible === false)) {
        auth.signOut().then(() => {
        new Noty({
        type: 'error',
                layout: 'center',
                text: '<div class="row align-items-center"><div class="col-md-9"><h5>Hoy no tienes acceso a la plataforma.</h5><br><p>Para mayor información, contacta a tu empresa</p></div></div>'
        }).show().setTimeout(3000);
        });
        } else if (qrDataEmpleado[0].empleadoActivo === 2) {
        auth.signOut().then(() => {
        new Noty({
        type: 'error',
                layout: 'center',
                text: '<div class="row align-items-center"><div class="col-md-9"><h5>Este usuario se encuentra inactivo.</h5><br><p>Para mayor información, contacta a tu empresa</p></div></div>'
        }).show().setTimeout(3000);
        });
        }
        } else if (compararFecha(doc.data().fechaInicioContrato, doc.data().fechaFinalContrato, fechaActual, idTokenResult.claims.empresaId) === false) {
        empresaRef.update({
        clienteActivo: 2
        });
                new Noty({
                type: 'error',
                        layout: 'center',
                        text: '<div class="row align-items-center"><div class="col-md-9"><h5>Contrato expirado.</h5><br><p>Para mayor información, contacta a tu empresa</p></div></div>'
                }).show().setTimeout(3000);
        }
        $scope.$digest();
        }).catch(function (error) {
        console.log("Error getting cached document:", error);
        });
        }).catch(function (error) {
        console.log("Error getting cached document:", error);
        });
        } else if (idTokenResult.claims.cliente === true){
        db.collection('customers').doc(idTokenResult.claims.user_id).collection('subscriptions').where('status', 'in', ['trialing', 'active']).onSnapshot(async (snapshot) => {
        if (snapshot.empty) {
        new Noty({
        type: 'error',
                layout: 'center',
                text: '<div class="row align-items-center"><div class="col-md-9"><h5>Subscripcion inactiva.</h5><br><p>Verífica tu subscripcion se encuentre activa.</p></div></div>'
        }).show().setTimeout(3000);
                alert("NO hay acceso, perreque")
                return;
        }
        new Noty({
        type: 'success',
                layout: 'topRight',
                text: 'Acceso exitoso.'
        }).show().setTimeout(3000);
                window.location.replace(base_url + 'clientePrivado/index.html');
                location.href = base_url + ('clientePrivado/#!/home');
        });
        } else {
        auth.signOut().then(() => {
        new Noty({
        type: 'error',
                layout: 'center',
                text: '<div class="row align-items-center"><div class="col-md-9"><h5>Usuario no corresponde a un cliente.</h5><br><p>Verífica que el usuario corresponda a un cliente</p></div></div>'
        }).show().setTimeout(3000);
        });
        }
        }).catch(function (error) {
        new Noty({
        type: 'error',
                layout: 'center',
                text: 'Usuario y/o contraseña incorrectos. Veríficalos.'
        }).show().setTimeout(3000);
        });
        }).catch(function (error) {
        var errorCode = error.code;
                switch (errorCode) {
        case 'auth/wrong-password':
                new Noty({
                type: 'error',
                        layout: 'center',
                        text: '<div class="row align-items-center"><div class="col-md-9"><h5>Contraseña incorrecta.</h5><br><p>Por favor, verifícala.</p></div></div>'
                }).show().setTimeout(5000);
                break;
                case 'auth/user-not-found':
                new Noty({
                type: 'error',
                        layout: 'center',
                        text: '<div class="row align-items-center"><div class="col-md-9"><h5>Usuario incorrecto.</h5><br><p>Por favor, verifícalo.</p></div></div>'
                }).show().setTimeout(5000);
                break;
                case 'auth/invalid-email':
                new Noty({
                type: 'error',
                        layout: 'center',
                        text: '<div class="row align-items-center"><div class="col-md-9"><h5>El usuario no puede ir vacío</h5><br><p>Por favor, verifícalo.</p></div></div>'
                }).show().setTimeout(5000);
                break;
        }
        });
        } else {
        new Noty({
        type: 'error',
                layout: 'center',
                text: '<div class="row align-items-center"><div class="col-md-9"><h5>Todos los campos son obligatorios.</h5><br><p>Por favor, llena todos los campos.</p></div></div>'
        }).show().setTimeout(3000);
        }
        };
        }
]);
        angular.module('app').controller("RegistroEmpresaCtrl", [
        '$scope',
        '$state',
        function ($scope, $state) {
        const [auth, db, functions] = firebaseInit();
                $scope.cliente = {
                razon_social: "",
                        sitio_web: "",
                        domicilio: "",
                        puesto_contacto_principal: "",
                };
                document.getElementById("datos-contacto").style.display = "none";
                $scope.irDatosPersonales = function (nombreEmpresa, numeroEmpleados) {
                if (nombreEmpresa === "" || nombreEmpresa === undefined) {
                new Noty({
                type: 'error',
                        layout: 'center',
                        text: 'El campo "Nombre de la empresa" no puede ir vacio'
                }).show().setTimeout(3000);
                } else if (numeroEmpleados === "" || numeroEmpleados === undefined){
                new Noty({
                type: 'error',
                        layout: 'center',
                        text: 'El campo "Numero de empleados" no puede ir vacio'
                }).show().setTimeout(3000);
                } else{
                document.getElementById("datos-empresa").style.display = "none";
                        document.getElementById("datos-contacto").style.display = "block";
                }
                };
                $scope.atras = function (mostrar, ocultar) {
                document.getElementById(mostrar).style.display = "block";
                        document.getElementById(ocultar).style.display = "none";
                };
                function evaluarCampo(valor, mensaje) {
                if (valor === "" || valor === undefined) {
                new Noty({
                type: 'error',
                        layout: 'center',
                        text: 'El campo ' + mensaje + ' no puede ir vacio'
                }).show().setTimeout(3000);
                }
                }
        $scope.crearCliente = function (cliente) {
        if (((cliente.nombre_empresa && cliente.numero_empleados && cliente.nombre_contacto_principal && cliente.primer_apellido_contacto_principal
                && cliente.segundo_apellido_contacto_principal && cliente.email_contacto_principal && cliente.telefono_contacto_principal) === undefined) ||
                ((cliente.nombre_empresa && cliente.nombre_contacto_principal && cliente.primer_apellido_contacto_principal
                        && cliente.segundo_apellido_contacto_principal && cliente.email_contacto_principal && cliente.telefono_contacto_principal
                        ) === "")) {
        evaluarCampo(cliente.nombre_empresa, "nombre empresa");
                evaluarCampo(cliente.numero_empleados, "numero empleados");
                evaluarCampo(cliente.nombre_contacto_principal, "nombre contacto principal");
                evaluarCampo(cliente.primer_apellido_contacto_principal, "primer apellido");
                evaluarCampo(cliente.segundo_apellido_contacto_principal, "segundo apellido");
                evaluarCampo(cliente.email_contacto_principal, "email");
                evaluarCampo(cliente.telefono_contacto_principal, "teléfono");
        } else {
        db.collection('empresas').add({
        nombreEmpresa: cliente.nombre_empresa,
                razonSocial: cliente.razon_social,
                sitioWeb: cliente.sitio_web,
                domicilio: cliente.domicilio,
                nombreContacto: cliente.nombre_contacto_principal,
                primerApellidoContacto: cliente.primer_apellido_contacto_principal,
                segundoApellidoContacto: cliente.segundo_apellido_contacto_principal,
                emailContacto: cliente.email_contacto_principal,
                telefonoContacto: cliente.telefono_contacto_principal,
                puestoContacto: cliente.puesto_contacto_principal,
                numeroUsuariosEmpresa: cliente.numero_empleados,
                clienteActivo: 3
        }).then(function (docDetailRef) {
        $('#button-enviar').attr("disabled", true);
                var n = new Noty({
                text: '<h3>¡Preregistro éxitoso!<h3>.<br><p>En breve un ejecutivo de Vitah se pondrá en contacto para finalizar el registro</p>',
                        layout: 'center',
                        buttons: [
                                Noty.button('Aceptar', 'btn btn-success', function () {
                                $state.go('main.login');
                                        n.close();
                                })
                        ]
                });
                n.show();
        });
        }
        };
        }
]);
        angular.module('app').controller("RegistroPersonaCtrlStripe", [
        '$scope',
        '$state',
        function ($scope, $state) {
        const [auth, db, functions] = firebaseInit();
                const STRIPE_PUBLISHABLE_KEY = 'pk_live_51H0Z0yHM4zwt8VDXe4yHLLZazrvWBHLUwiKB0po4LSGpkKzQkUOVlFYQ68JVaxOsTmysbdO7f9rCyRCI3e8JjeW400JW85UqK6';
// Replace with your tax ids
// https://dashboard.stripe.com/tax-rates
//const taxRates = ['txr_1IJJtvHYgolSBA35ITTBOaew'];

                const prices = {};
// Replace with your Firebase project config.
// Replace with your cloud functions location
                const functionLocation = 'us-central1';
                const firebaseUI = new firebaseui.auth.AuthUI(firebase.auth());
                const firebaseUiConfig = {
                callbacks: {
                signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                // User successfully signed in.
                // Return type determines whether we continue the redirect automatically
                // or whether we leave that to developer to handle.
                return true;
                },
                        uiShown: () => {
                document.querySelector('#loader').style.display = 'none';
                },
                },
                        signInFlow: 'popup',
                        signInSuccessUrl: '/',
                        signInSuccessUrl: 'http://localhost/vitah/public_html/#!/registrate-a-vitah',
//                        signInSuccessUrl: 'http://vitahonline.com/#!/login',
                        signInOptions: [
                                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                                firebase.auth.EmailAuthProvider.PROVIDER_ID,
                        ],
                        credentialHelper: firebaseui.auth.CredentialHelper.NONE,
                        // Your terms of service url.
                        tosUrl: 'https://example.com/terms',
                        // Your privacy policy url.
                        privacyPolicyUrl: 'https://example.com/privacy',
                        uiShown: () => {
                document.querySelector('#loader').style.display = 'none';
                },
                };
                firebase.auth().onAuthStateChanged((firebaseUser) => {
        if (firebaseUser) {
        document.querySelector('#loader').style.display = 'none';
                document.querySelector('main').style.display = 'block';
                currentUser = firebaseUser.uid;
                startDataListeners();
        } else {
        document.querySelector('main').style.display = 'none';
                firebaseUI.start('#firebaseui-auth-container', firebaseUiConfig);
        }
        });
                /**
                 * Data listeners
                 */
                        function startDataListeners() {
                        // Get all our products and render them to the page
                        const products = document.querySelector('.products');
                                const template = document.querySelector('#product');
                                db.collection('products')
                                .where('active', '==', true)
                                .get()
                                .then(function (querySnapshot) {
                                querySnapshot.forEach(async function (doc) {
                                const priceSnap = await doc.ref
                                        .collection('prices')
                                        .where('active', '==', true)
                                        .orderBy('unit_amount')
                                        .get();
                                        if (!'content' in document.createElement('template')) {
                                console.error('Your browser doesn’t support HTML template elements.');
                                        return;
                                }

                                const product = doc.data();
                                        const container = template.content.cloneNode(true);
                                        container.querySelector('h2').innerText = product.name.toUpperCase();
                                        container.querySelector('.description').innerText =
                                        product.description?.toUpperCase() || '';
                                        // Prices dropdown
                                        priceSnap.docs.forEach((doc) => {
                                        const priceId = doc.id;
                                                const priceData = doc.data();
                                                prices[priceId] = priceData;
                                                const content = document.createTextNode(
                                                        `${new Intl.NumberFormat('en-US', {
                                                        style: 'currency',
                                                                currency: priceData.currency,
                                                        }).format((priceData.unit_amount / 100).toFixed(2))} per ${
                                                        priceData.interval ?? 'once'
                                                        }`
                                                        );
                                                const option = document.createElement('option');
                                                option.value = priceId;
                                                option.appendChild(content);
                                                container.querySelector('#price').appendChild(option);
                                        });
                                        if (product.images.length) {
                                const img = container.querySelector('img');
                                        img.src = product.images[0];
                                        img.alt = product.name;
                                }

                                const form = container.querySelector('form');
                                        form.addEventListener('submit', subscribe);
                                        products.appendChild(container);
                                });
                                });
                                // Get all subscriptions for the customer
                                db.collection('customers')
                                .doc(currentUser)
                                .collection('subscriptions')
                                .where('status', 'in', ['trialing', 'active'])
                                .onSnapshot(async (snapshot) => {
                                if (snapshot.empty) {
                                // Show products
                                document.querySelector('#subscribe').style.display = 'block';
                                        return;
                                }
                                document.querySelector('#subscribe').style.display = 'none';
                                        document.querySelector('#my-subscription').style.display = 'block';
                                        // In this implementation we only expect one Subscription to exist
                                        const subscription = snapshot.docs[0].data();
                                        const priceData = (await subscription.price.get()).data();
                                        document.querySelector(
                                                '#my-subscription p'
                                                ).textContent = `You are paying ${new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                        currency: priceData.currency,
                                }).format((priceData.unit_amount / 100).toFixed(2))} per ${
                                        priceData.interval
                                        }, giving you the role: ${await getCustomClaimRole()}. 🥳`;
                                });
                        }

                /**
                 * Event listeners
                 */

// Signout button
                document
                        .getElementById('signout')
                        .addEventListener('click', () => firebase.auth().signOut());
// Checkout handler
                        async function subscribe(event) {
                        alert("Fds");
                                event.preventDefault();
                                document.querySelectorAll('button').forEach((b) => (b.disabled = true));
                                const formData = new FormData(event.target);
                                console.log(formData);
                                const selectedPrice = {
                                price: formData.get('price'),
                                };
                                // For prices with metered billing we need to omit the quantity parameter.
                                // For all other prices we set quantity to 1.
                                if (prices[selectedPrice.price]?.recurring?.usage_type !== 'metered')
                                selectedPrice.quantity = 1;
                                const checkoutSession = {
                                collect_shipping_address: true,
//                                        tax_rates: taxRates,
                                        allow_promotion_codes: true,
                                        line_items: [selectedPrice],
                                       success_url: "http://localhost/vitah/public_html/#!/login",
//                                        success_url: "http://vitahonline.com/#!/login",
                                        cancel_url: "http://localhost/vitah/public_html/#!/login",
//                                        cancel_url: "http://vitahonline.com/#!/registrate-a-vitah",
                                        metadata: {
                                        key: 'value',
                                        },
                                };
                                // For one time payments set mode to payment.
                                if (prices[selectedPrice.price]?.type === 'one_time')
                                checkoutSession.mode = 'payment';
                                const docRef = await db
                                .collection('customers')
                                .doc(currentUser)
                                .collection('checkout_sessions')
                                .add(checkoutSession);
                                // Wait for the CheckoutSession to get attached by the extension
                                docRef.onSnapshot((snap) => {
                                const { error, sessionId } = snap.data();
                                        if (error) {
                                // Show an error to your customer and then inspect your function logs.
                                alert(`An error occured: ${error.message}`);
                                        document.querySelectorAll('button').forEach((b) => (b.disabled = false));
                                }
                                if (sessionId) {
                                // We have a session, let's redirect to Checkout
                                // Init Stripe
                                const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
                                        stripe.redirectToCheckout({ sessionId });
                                }
                                });
                        }

// Billing portal handler
                document
                        .querySelector('#billing-portal-button')
                        .addEventListener('click', async (event) => {
                        document.querySelectorAll('button').forEach((b) => (b.disabled = true));
                                // Call billing portal function
                                const functionRef = firebase
                                .app()
                                .functions(functionLocation)
                                .httpsCallable('ext-firestore-stripe-subscriptions-createPortalLink');
                                const { data } = await functionRef({ returnUrl: 'http://localhost/vitah/public_html/#!/registrate-a-vitah' });
//                                const { data } = await functionRef({ returnUrl: 'http://vitahonline.com/#!/login' });
                                window.location.assign(data.url);
                        });
// Get custom claim role helper
                        async function getCustomClaimRole() {
                        await firebase.auth().currentUser.getIdToken(true);
                                const decodedToken = await firebase.auth().currentUser.getIdTokenResult();
                                return decodedToken.claims.stripeRole;
                        }

                }
        ]);
                angular.module('app').controller("RegistroPersonaCtrl", [
                '$scope',
                '$state',
                function ($scope, $state) {
                const [auth, db, functions] = firebaseInit();
                        $scope.cliente = {};
                        const STRIPE_PUBLISHABLE_KEY = 'pk_live_51H0Z0yHM4zwt8VDXe4yHLLZazrvWBHLUwiKB0po4LSGpkKzQkUOVlFYQ68JVaxOsTmysbdO7f9rCyRCI3e8JjeW400JW85UqK6';
                        document.querySelector('#costo-subscripcion').style.display = 'none';
                        const prices = {};
                        const functionLocation = 'us-central1';
                        $scope.crearCliente = function (cliente) {
                        console.log(cliente);
                                auth.createUserWithEmailAndPassword(cliente.email, cliente.password).then(cred => {
                        var addEmpleadoRole = functions.httpsCallable('addClienteRole');
                                addEmpleadoRole({email: cliente.email}).then(result => {
                        console.log(cred.user.uid);
                                document.querySelector('#registro-persona').style.display = 'none';
                                document.querySelector('#costo-subscripcion').style.display = 'block';
                                currentUser = cred.user.uid;
                                db.collection('clientesPrivados').add({
                        id: cred.user.uid,
                                nombre: cliente.nombre,
                                primerApellido: cliente.primerApellido,
                                segundoApellido: cliente.segundoApellido,
                                email: cliente.email,
                                telefono: cliente.telefono,
                                videosVistosMensuales: 0
                        }).then(function (docDetailRef) {
                        }).catch(function (error) {
                        console.log("Error getting cached document:", error);
                                $state.go('main.error-pagina-no-encontrada');
                        });
                                startDataListeners();
                        }).catch();
                        }).catch((error) => {
                        console.log(error);
                                var errorCode = error.code;
                                // ..
                                switch (errorCode) {
                        case 'auth/email-already-in-use':
                                new Noty({
                                type: 'error',
                                        layout: 'center',
                                        text: '<div class="row align-items-center"><div class="col-md-9"><h5>Este correo electrónico ya se encuentra en uso.</h5><br><p>Si crees que se trata de un error, por favor, contacta con tu empresa</p></div></div>'
                                }).show().setTimeout(5000);
                                break;
                                case 'auth/weak-password':
                                new Noty({
                                type: 'error',
                                        layout: 'center',
                                        text: '<div class="row align-items-center"><div class="col-md-9"><h5>La contraseña debe tener mínimo 6 carácteres.</h5><br></div></div>'
                                }).show().setTimeout(5000);
                                break;
                        }
                        });
                        }
                function startDataListeners() {
                // Get all our products and render them to the page
//                const products = document.querySelector('.products');
//                        const template = document.querySelector('#product');
                db.collection('products').where('active', '==', true).get().then(function (querySnapshot) {
                querySnapshot.forEach(async function (doc) {
                const priceSnap = await doc.ref.collection('prices').where('active', '==', true).orderBy('unit_amount').get();
//                                if (!'content' in document.createElement('template')) {
//                        console.error('Your browser doesn’t support HTML template elements.');
//                                return;
//                        }

                        const product = doc.data();
//                                const container = template.content.cloneNode(true);
//                                container.querySelector('h2').innerText = product.name.toUpperCase();
//                                container.querySelector('.description').innerText =
//                                product.description?.toUpperCase() || '';
                        // Prices dropdown
                        priceSnap.docs.forEach((doc) => {
                        const priceId = doc.id;
                                const priceData = doc.data();
                                prices[priceId] = priceData;
//                                        const content = document.createTextNode(
//                                                `${new Intl.NumberFormat('en-US', {
//                                                style: 'currency',
//                                                        currency: priceData.currency,
//                                                }).format((priceData.unit_amount / 100).toFixed(2))} per ${
//                                                priceData.interval ?? 'once'
//                                                }`
//                                                );
//                                        const option = document.createElement('option');
//                                        option.value = priceId;
//                                        option.appendChild(content);
//                                        container.querySelector('#price').appendChild(option);
                        });
//                                if (product.images.length) {
//                        const img = container.querySelector('img');
//                                img.src = product.images[0];
//                                img.alt = product.name;
//                        }

                        const form = document.querySelector('#costo-subscripcion');
                        form.addEventListener('submit', subscribe);
                });
                });
                        // Get all subscriptions for the customer
                        db.collection('customers').doc(currentUser).collection('subscriptions').where('status', 'in', ['trialing', 'active']).onSnapshot(async (snapshot) => {
                if (snapshot.empty) {
                // Show products
//                        document.querySelector('#subscribe').style.display = 'block';
                return;
                }
//                        document.querySelector('#subscribe').style.display = 'none';
//                                document.querySelector('#my-subscription').style.display = 'block';
                // In this implementation we only expect one Subscription to exist
                const subscription = snapshot.docs[0].data();
                        console.log(subscription);
                        const priceData = (await subscription.price.get()).data();
                        console.log(priceData);
                        document.querySelector(
                                '#my-subscription p'
                                ).textContent = `You are paying ${new Intl.NumberFormat('en-US', {
                style: 'currency',
                        currency: priceData.currency,
                }).format((priceData.unit_amount / 100).toFixed(2))} per ${
                        priceData.interval
                        }, giving you the role: ${await getCustomClaimRole()}. 🥳`;
                });
                }
                $scope.subscribir = function(){
                        console.log("suscribir");
                subscribe();
                }
                // Checkout handler
                async function subscribe() {
//                event.preventDefault();
//                alert("Dd");
//                        document.querySelectorAll('button').forEach((b) => (b.disabled = true));
//                        const formData = new FormData(event.target);
//                        console.log(formData);
                const selectedPrice = {
                price: 'price_1Isbh4HM4zwt8VDXr3RuI0tq',
                };
                        console.log(selectedPrice);
//                        // For prices with metered billing we need to omit the quantity parameter.
//                        // For all other prices we set quantity to 1.
                        if (prices[selectedPrice.price]?.recurring?.usage_type !== 'metered')
                        selectedPrice.quantity = 1;
                        const checkoutSession = {
                        collect_shipping_address: true,
//                                        tax_rates: taxRates,
                                allow_promotion_codes: true,
                                line_items: [selectedPrice],
//                                success_url: "http://localhost/vitah/public_html/#!/login",
//                                cancel_url: "http://localhost/vitah/public_html/#!/login",
//                                success_url: "http://localhost/vitah/public_html/#!/registrate-a-vitah",
                                success_url: "http://vitahonline.com/#!/registrate-a-vitah",
//                                        cancel_url: "http://localhost/vitah/public_html/#!/registrate-a-vitah",
                                cancel_url: "http://vitahonline.com/#!/registrate-a-vitah",
                                metadata: {
                                key: 'value',
                                },
                        };
                        // For one time payments set mode to payment.
                        if (prices[selectedPrice.price]?.type === 'one_time')
                        checkoutSession.mode = 'payment';
                        const docRef = await db
                        .collection('customers')
                        .doc(currentUser)
                        .collection('checkout_sessions')
                        .add(checkoutSession);
                        // Wait for the CheckoutSession to get attached by the extension
                        docRef.onSnapshot((snap) => {
                        const { error, sessionId } = snap.data();
                                if (error) {
                        // Show an error to your customer and then inspect your function logs.
                        alert(`An error occured: ${error.message}`);
                                document.querySelectorAll('button').forEach((b) => (b.disabled = false));
                        }
                        if (sessionId) {
                        // We have a session, let's redirect to Checkout
                        // Init Stripe
                        const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
                                stripe.redirectToCheckout({ sessionId });
                        }
                        });
                }
                }
        ]);
