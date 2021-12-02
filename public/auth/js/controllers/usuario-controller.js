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
angular.module('app').controller("UsuarioLoginAndRegisterCtrl", [
    '$scope',
    '$state',
    '$location',
    '$anchorScroll',
    function ($scope, $state, $location, $anchorScroll) {
        const [auth, db, functions] = firebaseInit();
        $scope.cliente = {};
        $scope.clienteRegistro = {};
        $scope.currentId;
        document.querySelector('#datos-personales').style.display = 'none';
//        const STRIPE_PUBLISHABLE_KEY = 'pk_live_51H0Z0yHM4zwt8VDXe4yHLLZazrvWBHLUwiKB0po4LSGpkKzQkUOVlFYQ68JVaxOsTmysbdO7f9rCyRCI3e8JjeW400JW85UqK6';
//        const STRIPE_PUBLISHABLE_KEY = 'pk_test_51Iu18lGtt7a1STY102DDdae1IbeYdZ5KaHJmnOrQ1WrOu3blGSCuqYP7o8una1Jv4hjus3Gj8aBCMiGMOgBuD3Yj00LNK3kuS7';
        $location.hash('main');
        $anchorScroll();
        const STRIPE_PUBLISHABLE_KEY = 'pk_live_51Iu18lGtt7a1STY1o6X1629ciQ7WjWYEjqRXdihZtbYTiVWAjFbXTwkTTGuq0LWgncb12vKUY5cvXBli4p1Jtgqb00ZKsBr3ky';
        function cambiarFormatoFecha(fecha) {
            var year = fecha.getFullYear();
            var month = (1 + fecha.getMonth()).toString();
            month = month.length > 1 ? month : '0' + month;
            var day = fecha.getDate().toString();
            day = day.length > 1 ? day : '0' + day;
            return(month + '/' + day + '/' + year);
        }
        function compararFecha(fecha_inicio, fecha_final, fecha_actual, empresaId) {
            if (fecha_inicio !== "") {
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
            } else {
                var final_array = fecha_final.split("/");
                var actual_array = fecha_actual.split("/");
                var fechaConvertidaFinal = new Date(final_array[2], final_array[0], final_array[1]);
                var fechaConvertidaActual = new Date(actual_array[2], actual_array[0], actual_array[1]);
                if (fechaConvertidaActual < fechaConvertidaFinal) {
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
        }
        function empleadoAcceso(empresaId, email, fechaActual, diaActual) {
            empresaRef = db.collection('empresas').doc(empresaId);
            empresaRef.get().then(function (doc) {
                empresaRef.collection("empleados").where("email", "==", email).get().then((snapshot) => {
                    qrDataEmpleado = snapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data()
                        }));
                    if (compararFecha(doc.data().fechaInicioContrato, doc.data().fechaFinalContrato, fechaActual, empresaId) === true) {
                        if ((doc.data().diasAcceso[diaActual].disponible === true) && (doc.data().clienteActivo === 1) && (qrDataEmpleado[0].empleadoActivo === 1)) {
                            new Noty({
                                type: 'success',
                                layout: 'topRight',
                                text: 'Acceso exitoso.'
                            }).show().setTimeout(3000);
                            window.location.replace(base_url + 'empleado/index.html');
                            location.href = base_url + ('empleado/#!/home');
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
                    } else if (compararFecha(doc.data().fechaInicioContrato, doc.data().fechaFinalContrato, fechaActual, empresaId) === false) {
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
        }
        function verificarFechaAcceso(fechaVencimiento, fechaActual, email, customerId, subId) {
//            var fechaVencimientoParse = cambiarFormatoFecha(fechaVencimiento);
            var timestamp = fechaVencimiento.seconds;
            var date = new Date(timestamp * 1000);
            var fechaVencimiento = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
            if (compararFecha("", fechaVencimiento, fechaActual) === true) {
                new Noty({
                    type: 'success',
                    layout: 'topRight',
                    text: 'Acceso exitoso.'
                }).show().setTimeout(3000);
                window.location.replace(base_url + 'clientePrivado/index.html');
                location.href = base_url + ('clientePrivado/#!/home');
            } else if (compararFecha("", fechaVencimiento, fechaActual) === false) {
                db.collection("clientesPrivados").where("email", "==", email).get().then((snapshot) => {
                    dataCliente = snapshot.docs.map((doc) => ({
                            clienteId: doc.id,
                            ...doc.data()
                        }));
                    db.collection('clientesPrivados').doc(dataCliente[0].clienteId).set({
                        status: 2
                    }, {merge: true});
                    db.collection("customers").doc(customerId).collection('subscriptions').doc(subId).delete().then(() => {
                        console.log("Document successfully deleted!");
                    }).catch((error) => {
                        console.error("Error removing document: ", error);
                    });
                }).catch(function (error) {
                    console.log("Error getting cached document:", error);
                });
            }
        }
        function clienteAcceso(data, fechaActual) {
//            db.collection("customers").where(typeData, "==", data).get().then((snapshot) => {
//                dataCliente = snapshot.docs.map((doc) => ({
//                        id: doc.id,
//                        ...doc.data()
//                    }));
            db.collection("customers").doc(data).collection("subscriptions").get().then((snapshot) => {
                dataSub = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                if (dataSub.length < 1) {
                    auth.signOut().then(() => {
                        console.log(localStorage.getItem("id"))
                        subscribeId(localStorage.getItem("id"));
                     /*   new Noty({
                            type: 'error',
                            layout: 'center',
                            text: '<div class="row align-items-center"><div class="col-md-9"><h5>No tienes activa una subscripción.</h5></div></div>'
                        }).show().setTimeout(3000);*/
                    });
                } else if (dataSub[0].cancel_at_period_end === false) {
                    new Noty({
                        type: 'success',
                        layout: 'topRight',
                        text: 'Acceso exitoso.'
                    }).show().setTimeout(3000);
                    window.location.replace(base_url + 'clientePrivado/index.html');
                    location.href = base_url + ('clientePrivado/#!/home');
                } else if (dataSub[0].cancel_at_period_end === true) {
                    verificarFechaAcceso(dataSub[0].current_period_end, fechaActual, email, dataCliente[0].id, dataSub[0].id);
                }
                $scope.$digest();
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
//            }).catch(function (error) {
//                console.log("Error getting cached document:", error);
//            });
        }
        $scope.loginCliente = async function (email, password) {
            $("#loader").addClass("show");
            console.log("gmndklgmldkgmdflk");
            if (email !== undefined && password !== undefined) {
            db.collection("clientesPrivados").where("email", "==", email)
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data().id);
             localStorage.setItem("id",doc.data().id);
        });
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });

                auth.signInWithEmailAndPassword(email, password).then(user => {
                    user.user.getIdTokenResult().then(idTokenResult => {
                        var fecha = new Date();
                        var diaActual = fecha.getDay();
                        var fechaActual = cambiarFormatoFecha(fecha);
                        if (idTokenResult.claims.empleado === true) {
                            console.log("aqui")
                            setTimeout(() => {
                                
                            empleadoAcceso(idTokenResult.claims.empresaId, idTokenResult.claims.email, fechaActual, diaActual);
                            }, 2000);
                        } else if (idTokenResult.claims.cliente === true) {
                            console.log("aca")
                            setTimeout(() => {
                                
                            clienteAcceso(user.user.uid, fechaActual);
                            }, 2000);
                        }
//                        if (idTokenResult.claims.empleado === true) {
//                            empresaRef = db.collection('empresas').doc(idTokenResult.claims.empresaId);
//                            empresaRef.get().then(function (doc) {
//                                empresaRef.collection("empleados").where("email", "==", idTokenResult.claims.email).get().then((snapshot) => {
//                                    qrDataEmpleado = snapshot.docs.map((doc) => ({
//                                            id: doc.id,
//                                            ...doc.data()
//                                        }));
//                                    if (compararFecha(doc.data().fechaInicioContrato, doc.data().fechaFinalContrato, fechaActual, idTokenResult.claims.empresaId) === true) {
//                                        if ((doc.data().diasAcceso[diaActual].disponible === true) && (doc.data().clienteActivo === 1) && (qrDataEmpleado[0].empleadoActivo === 1)) {
//                                            new Noty({
//                                                type: 'success',
//                                                layout: 'topRight',
//                                                text: 'Acceso exitoso.'
//                                            }).show().setTimeout(3000);
//                                            window.location.replace(base_url + 'empleado/index.html');
//                                            location.href = base_url + ('empleado/#!/home');
//                                        } else if ((doc.data().diasAcceso[diaActual].disponible === false)) {
//                                            auth.signOut().then(() => {
//                                                new Noty({
//                                                    type: 'error',
//                                                    layout: 'center',
//                                                    text: '<div class="row align-items-center"><div class="col-md-9"><h5>Hoy no tienes acceso a la plataforma.</h5><br><p>Para mayor información, contacta a tu empresa</p></div></div>'
//                                                }).show().setTimeout(3000);
//                                            });
//                                        } else if (qrDataEmpleado[0].empleadoActivo === 2) {
//                                            auth.signOut().then(() => {
//                                                new Noty({
//                                                    type: 'error',
//                                                    layout: 'center',
//                                                    text: '<div class="row align-items-center"><div class="col-md-9"><h5>Este usuario se encuentra inactivo.</h5><br><p>Para mayor información, contacta a tu empresa</p></div></div>'
//                                                }).show().setTimeout(3000);
//                                            });
//                                        }
//                                    } else if (compararFecha(doc.data().fechaInicioContrato, doc.data().fechaFinalContrato, fechaActual, idTokenResult.claims.empresaId) === false) {
//                                        empresaRef.update({
//                                            clienteActivo: 2
//                                        });
//                                        new Noty({
//                                            type: 'error',
//                                            layout: 'center',
//                                            text: '<div class="row align-items-center"><div class="col-md-9"><h5>Contrato expirado.</h5><br><p>Para mayor información, contacta a tu empresa</p></div></div>'
//                                        }).show().setTimeout(3000);
//                                    }
//                                    $scope.$digest();
//                                }).catch(function (error) {
//                                    console.log("Error getting cached document:", error);
//                                });
//                            }).catch(function (error) {
//                                console.log("Error getting cached document:", error);
//                            });
//                        } else if (idTokenResult.claims.cliente === true) {
//                            db.collection('customers').doc(idTokenResult.claims.user_id).collection('subscriptions').where('status', 'in', ['trialing', 'active']).onSnapshot(async (snapshot) => {
//                                if (snapshot.empty) {
//                                    new Noty({
//                                        type: 'error',
//                                        layout: 'center',
//                                        text: '<div class="row align-items-center"><div class="col-md-9"><h5>Subscripcion inactiva.</h5><br><p>Verífica tu subscripcion se encuentre activa.</p></div></div>'
//                                    }).show().setTimeout(3000);
//                                    alert("NO hay acceso, perreque")
//                                    return;
//                                }
//                                new Noty({
//                                    type: 'success',
//                                    layout: 'topRight',
//                                    text: 'Acceso exitoso.'
//                                }).show().setTimeout(3000);
//                                window.location.replace(base_url + 'clientePrivado/index.html');
//                                location.href = base_url + ('clientePrivado/#!/home');
//                            });
//                        } else {
//                            auth.signOut().then(() => {
//                                new Noty({
//                                    type: 'error',
//                                    layout: 'center',
//                                    text: '<div class="row align-items-center"><div class="col-md-9"><h5>Usuario no corresponde a un cliente.</h5><br><p>Verífica que el usuario corresponda a un cliente</p></div></div>'
//                                }).show().setTimeout(3000);
//                            });
//                        }
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
            $("#loader").removeClass("show");
        };
        document.querySelector('#costo-subscripcion').style.display = 'none';
        const prices = {};
        const functionLocation = 'us-central1';
        $scope.crearCliente = function (cliente) {
            const auth = firebase.auth();
    const db = firebase.firestore();
    const functions = firebase.functions();
            console.log("clienteeee3epdojsdpofjsp")
            $("#loader").addClass("show");
            $scope.dataUser = cliente;
            console.log($scope);
            const result = auth.createUserWithEmailAndPassword(cliente.email, cliente.password).then(cred => {
                var addEmpleadoRole = functions.httpsCallable('addClienteRole');
                addEmpleadoRole({email: cliente.email}).then(result => {
                    $scope.currentId = cred.user.uid;
//                    document.querySelector('#registro-persona').style.display = 'none';
//                    document.querySelector('#costo-subscripcion').style.display = 'block';
                    document.querySelector('.register-user').style.display = 'none';
                    document.querySelector('.login-user').style.display = 'none';
                    document.querySelector('#costo-subscripcion').style.display = 'none';
                    document.querySelector('#datos-personales').style.display = 'block';
                    currentUser = cred.user.uid;
                    db.collection('clientesPrivados').add({
                        id: cred.user.uid,
//                        nombre: cliente.nombre,
//                        primerApellido: cliente.primerApellido,
//                        segundoApellido: cliente.segundoApellido,
                        email: cliente.email,
//                        telefono: cliente.telefono,
                        status: 3,
                        cuestionario: false,
                        videosVistosMensuales: 0,
                        reinicioContador: 1
                    }).then(function (docDetailRef) {
                        console.log(docDetailRef.id);
                        $("#loader").removeClass("show");
                        $scope.dataUser.id = docDetailRef.id;
                    }).catch(function (error) {
                        console.log("Error getting cached document:", error);
                        $state.go('main.error-pagina-no-encontrada');
                    });
//                    startDataListeners();

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
        };
        $scope.crearCuentaFacebook = function () {
            const provider = new firebase.auth.FacebookAuthProvider();
            auth.signInWithPopup(provider).then((result) => {
                currentUser = result.user.uid;
                var credential = result.credential;
                // The signed-in user info.
                currentUser = result.user.uid;
                // This gives you a Facebook Access Token. You can use it to access the Facebook API.
                document.querySelector('.register-user').style.display = 'none';
                document.querySelector('.login-user').style.display = 'none';
                document.querySelector('#costo-subscripcion').style.display = 'block';
//                var email = result.additionalUserInfo.profile.email;
                var apellido = result.user.displayName.split(" ");
                if (apellido[1] === null || apellido[1] === undefined) {
                    apellido[1] = "";
                } else if (apellido[2] === null || apellido[2] === undefined) {
                    apellido[2] = "";
                }
                var data = {
                    nombre: apellido[0],
                    primerApellido: apellido[1],
                    segundoApellido: apellido[2]
                };
                $scope.dataUser = data;
                var addClienteRoleFacebook = functions.httpsCallable('addClienteRoleFacebook');
                addClienteRoleFacebook({id: currentUser}).then(resulte => {
                    db.collection('clientesPrivados').add({
                        id: currentUser,
                        nombre: $scope.dataUser.nombre,
                        primerApellido: $scope.dataUser.primerApellido,
                        segundoApellido: $scope.dataUser.segundoApellido,
                        status: 3,
                        cuestionario: false,
                        videosVistosMensuales: 0,
                        reinicioContador: 1
                    }).then(function (docDetailRef) {
                        document.querySelector('.register-user').style.display = 'none';
                        document.querySelector('.login-user').style.display = 'none';
                        document.querySelector('#costo-subscripcion').style.display = 'block';
                    }).catch(function (error) {
                        console.log("Error getting cached document:", error);
                        $state.go('main.error-pagina-no-encontrada');
                    });
                    startDataListeners();
                    $scope.$digest();
                }).catch();
//                $scope.dataUser = data;
//                document.querySelector('.register-user').style.display = 'none';
//                document.querySelector('.login-user').style.display = 'none';
//                document.querySelector('#costo-subscripcion').style.display = 'none';
//                document.querySelector('#datos-personales').style.display = 'block';
                $scope.$digest();
            }).catch(err => {
                console.log(err);
            })
        };
        $scope.crearCuentaGmail = function () {
            const provider = new firebase.auth.GoogleAuthProvider();
            auth.signInWithPopup(provider).then((result) => {
                currentUser = result.user.uid;
                console.log(result.user.uid);
                var email = result.additionalUserInfo.profile.email;
                var apellido = result.additionalUserInfo.profile.family_name.split(" ");
                var data = {
                    email: result.additionalUserInfo.profile.email,
                    nombre: result.additionalUserInfo.profile.given_name,
                    primerApellido: apellido[0],
                    segundoApellido: apellido[1]
                };
                $scope.dataUser = data;
                var addEmpleadoRole = functions.httpsCallable('addClienteRole');
                addEmpleadoRole({email: email}).then(resulte => {
                    db.collection('clientesPrivados').add({
                        id: currentUser,
                        nombre: $scope.dataUser.nombre,
                        primerApellido: $scope.dataUser.primerApellido,
                        segundoApellido: $scope.dataUser.segundoApellido,
                        email: $scope.dataUser.email,
                        status: 3,
                        cuestionario: false,
                        videosVistosMensuales: 0,
                        reinicioContador: 1
                    }).then(function (docDetailRef) {
                        document.querySelector('.register-user').style.display = 'none';
                        document.querySelector('.login-user').style.display = 'none';
                        document.querySelector('#costo-subscripcion').style.display = 'block';
                    }).catch(function (error) {
                        console.log("Error getting cached document:", error);
                        $state.go('main.error-pagina-no-encontrada');
                    });
                    startDataListeners();
                    $scope.$digest();
                }).catch();
            }).catch(err => {
                console.log(err);
            });
        };
        function startDataListeners() {
            // Get all our products and render them to the page
            db.collection('products').where('active', '==', true).get().then(function (querySnapshot) {
                querySnapshot.forEach(async function (doc) {
                    const priceSnap = await doc.ref.collection('prices').where('active', '==', true).orderBy('unit_amount').get();
                    const product = doc.data();
                    // Prices dropdown
                    priceSnap.docs.forEach((doc) => {
                        const priceId = doc.id;
                        const priceData = doc.data();
                        prices[priceId] = priceData;
                    });
                    const form = document.querySelector('#costo-subscripcion');
                    form.addEventListener('submit', subscribe);
                });
            });
            // Get all subscriptions for the customer
            db.collection('customers').doc(currentUser).collection('subscriptions').where('status', 'in', ['trialing', 'active']).onSnapshot(async (snapshot) => {
                if (snapshot.empty) {
                    // Show products
                    return;
                }
                const subscription = snapshot.docs[0].data();
                console.log(subscription);
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
        $scope.subscribir = function () {
            $("#loader").addClass("show");
            console.log("start data");
            startDataListeners();
            subscribe();
            $("#loader").removeClass("show");
        };
        // Checkout handler
        async function subscribe() {
            if(currentUser == undefined){
                currentUser = localStorage.getItem("id");
            }
            const selectedPrice = {
                price: 'price_1J9kLyGtt7a1STY1ZPinNSrM',
            };
            if (prices[selectedPrice.price]?.recurring?.usage_type !== 'metered')
            selectedPrice.quantity = 1;
            const checkoutSession = {
                collect_shipping_address: true,
                allow_promotion_codes: true,
                line_items: [selectedPrice],
                success_url: "http://localhost/vitah3.0/public_html/#!/login",
            //    success_url: "https://vitahonline.com/#!/login",
                cancel_url: "http://localhost/vitah3.0/public_html/#!/registrate-a-vitah",
          //      cancel_url: "https://vitahonline.com/#!/login",
                metadata: {
                    key: 'value'
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
                const {error, sessionId} = snap.data();
                if (error) {
                    // Show an error to your customer and then inspect your function logs.
                    alert(`An error occured: ${error.message}`);
                    document.querySelectorAll('button').forEach((b) => (b.disabled = false));
                }
                if (sessionId) {
                    // We have a session, let's redirect to Checkout
                    // Init Stripe
                    const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
                    stripe.redirectToCheckout({sessionId});
                }
            });
        }

        async function subscribeId(id) {
        
            const selectedPrice = {
                price: 'price_1J9kLyGtt7a1STY1ZPinNSrM',
            };
            if (prices[selectedPrice.price]?.recurring?.usage_type !== 'metered')
            selectedPrice.quantity = 1;
            const checkoutSession = {
                collect_shipping_address: true,
                allow_promotion_codes: true,
                line_items: [selectedPrice],
                success_url: "http://localhost/vitah3.0/public_html/#!/login",
             //   success_url: "https://vitahonline.com/#!/login",
                cancel_url: "http://localhost/vitah3.0/public_html/#!/registrate-a-vitah",
             //   cancel_url: "https://vitahonline.com/#!/login",
                metadata: {
                    key: 'value'
                },
            };
            // For one time payments set mode to payment.
            if (prices[selectedPrice.price]?.type === 'one_time')
            checkoutSession.mode = 'payment';
            const docRef = await db
                    .collection('customers')
                    .doc(id)
                    .collection('checkout_sessions')
                    .add(checkoutSession);
            // Wait for the CheckoutSession to get attached by the extension
            docRef.onSnapshot((snap) => {
                const {error, sessionId} = snap.data();
                if (error) {
                    // Show an error to your customer and then inspect your function logs.
                    alert(`An error occured: ${error.message}`);
                    document.querySelectorAll('button').forEach((b) => (b.disabled = false));
                }
                if (sessionId) {
                    // We have a session, let's redirect to Checkout
                    // Init Stripe
                    const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
                    stripe.redirectToCheckout({sessionId});
                }
            });
            $("#loader").removeClass("show");
        }
        function evaluarCampo(valor, mensaje) {
            if (valor === "" || valor === undefined || valor.length === 0 || valor === null) {
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
        $scope.iniciarSesionGmail = function () {
            var provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth()
                    .signInWithPopup(provider)
                    .then((result) => {
                        auth.onAuthStateChanged(user => {
                            if (user) {
                                user.getIdTokenResult().then(idTokenResult => {
                                    console.log(user.uid);
                                    var fecha = new Date();
                                    var diaActual = fecha.getDay();
                                    var fechaActual = cambiarFormatoFecha(fecha);
                                    if (idTokenResult.claims.empleado === true) {
                                        empleadoAcceso(idTokenResult.claims.empresaId, idTokenResult.claims.email, fechaActual, diaActual);
                                    } else if (idTokenResult.claims.cliente === true) {
                                        clienteAcceso(user.uid, fechaActual);
                                    }
                                });
                            } else {
                                new Noty({
                                    type: 'error',
                                    layout: 'center',
                                    text: '<div class="row align-items-center"><div class="col-md-9"><h5>No tienes activa una subscripción.</h5></div></div>'
                                }).show().setTimeout(3000);
                            }
                        });
                    }).catch((error) => {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // The email of the user's account used.
                var email = error.email;
                // The firebase.auth.AuthCredential type that was used.
                var credential = error.credential;
//                auth.signOut().then(() => {

//                        });
                // ...
            });
        };
        $scope.iniciarSesionFacebook = function () {
            var provider = new firebase.auth.FacebookAuthProvider();
            firebase.auth()
                    .signInWithPopup(provider)
                    .then((result) => {
                        auth.onAuthStateChanged(user => {
                            if (user) {
                                user.getIdTokenResult().then(idTokenResult => {
                                    var fecha = new Date();
                                    var diaActual = fecha.getDay();
                                    var fechaActual = cambiarFormatoFecha(fecha);
                                    if (idTokenResult.claims.empleado === true) {
                                        empleadoAcceso(idTokenResult.claims.empresaId, idTokenResult.claims.email, fechaActual, diaActual);
                                    } else if (idTokenResult.claims.cliente === true) {
                                        clienteAcceso(user.uid, fechaActual);
                                    }
                                });
                            } else {
                                new Noty({
                                    type: 'error',
                                    layout: 'center',
                                    text: '<div class="row align-items-center"><div class="col-md-9"><h5>No tienes activa una subscripción.</h5></div></div>'
                                }).show().setTimeout(3000);
                            }
                        });
                    }).catch((error) => {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // The email of the user's account used.
                var email = error.email;
                // The firebase.auth.AuthCredential type that was used.
                var credential = error.credential;
//                auth.signOut().then(() => {

//                        });
                // ...
            });
        };
        $scope.siguientePaso = function (dataUser) {
            console.log("siguiente paso ");
            $("#loader").removeClass("show");
            if ((evaluarCampo(dataUser.nombre, "nombre") && evaluarCampo(dataUser.primerApellido, "primer apellido") && evaluarCampo(dataUser.email, "email"))) {
                document.querySelector('.register-user').style.display = 'none';
                document.querySelector('.login-user').style.display = 'none';
                document.querySelector('#costo-subscripcion').style.display = 'block';
                document.querySelector('#datos-personales').style.display = 'none';
                currentUser = $scope.currentId;
//                var addEmpleadoRole = functions.httpsCallable('addClienteRole');
//                addEmpleadoRole({email: dataUser.email}).then(resulte => {
//                
//                
                db.collection('clientesPrivados').doc(dataUser.id).set({
                    nombre: dataUser.nombre,
                    primerApellido: dataUser.primerApellido,
                    segundoApellido: dataUser.segundoApellido,
                    telefono: dataUser.telefono
                }, {merge: true});
                startDataListeners();
            }
        };
    }
]);