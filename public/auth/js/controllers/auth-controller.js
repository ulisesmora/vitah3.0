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
    const functions = firebase.functions();
    return [auth, db, functions];
}
angular.module('app').controller("LoginAdminCtrl", [
    '$scope',
    function ($scope) {
//Llamar a la función de firebase
        const [auth, db, functions] = firebaseInit();
//Código del formulario
        $scope.user;
        function addAdmin(email, password, rol) {
            auth.createUserWithEmailAndPassword(email, password).then(cred => {
                var addAdminRole = functions.httpsCallable(rol);
                addAdminRole({email: email}).then(result => {
                    auth.signOut().then(() => {
                        accesoAdmin(email, password);
                    });
                }).catch();
            }).catch((error) => {
                var errorCode = error.code;
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
                            text: '<div class="row align-items-center"><div class="col-md-9"><h5>Contraseña inválida.</h5><br><p>La contraseña debe tener mínimo 6 carácteres</p></div></div>'
                        }).show().setTimeout(5000);
                        break;
                }
            });
        }
        function accesoAdmin(email, password) {
            if ($scope.user !== undefined) {
                auth.signInWithEmailAndPassword(email, password).then(user => {
                    user.user.getIdTokenResult().then(idTokenResult => {
                        if (idTokenResult.claims.admin === true) {
                            new Noty({
                                type: 'success',
                                layout: 'topRight',
                                text: 'Acceso exitoso.'
                            }).show().setTimeout(3000);
                            window.location.replace(base_url + 'admin/index.html');
                            location.href = base_url + ('admin/#!/home');
                        } else if (idTokenResult.claims.admin === false && idTokenResult.claims.adminPrimario === true) {
                            new Noty({
                                type: 'success',
                                layout: 'topRight',
                                text: 'Acceso exitoso.'
                            }).show().setTimeout(3000);
                            window.location.replace(base_url + 'adminPrimario/index.html');
                            location.href = base_url + ('adminPrimario/#!/home');
                        } else if (idTokenResult.claims.admin === false && idTokenResult.claims.adminSecundario === true) {
                            new Noty({
                                type: 'success',
                                layout: 'topRight',
                                text: 'Acceso exitoso.'
                            }).show().setTimeout(3000);
                            window.location.replace(base_url + 'adminSecundario/index.html');
                            location.href = base_url + ('adminSecundario/#!/home');
                        } else {
                            auth.signOut().then(() => {
                                new Noty({
                                    type: 'error',
                                    layout: 'center',
                                    text: 'Verífica que el usuario corresponda a un administrador'
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
                    }
                });
            } else if ($scope.user === undefined) {
                new Noty({
                    type: 'error',
                    layout: 'center',
                    text: 'Por favor, llena todos los campos.'
                }).show().setTimeout(3000);
            }
        }
        $scope.login = function (email, password) {
            if ($scope.user !== undefined) {
                db.collection("administrador").where("email", "==", email).get().then((snapshot) => {
                    qrData = snapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data()
                        }));
                    if (qrData.length === 0) {
                        new Noty({
                            type: 'error',
                            layout: 'center',
                            text: '<div class="row align-items-center"><div class="col-md-9"><h5>Este usuario no está dado de alta.</h5><br><p>Si crees que se trata de un error, por favor, contacta a tu administrador</p></div></div>'
                        }).show().setTimeout(5000);
                    } else {
                        if (qrData[0].adminActivo === 3) {
                            if (password === qrData[0].password) {
                                addAdmin(email, password, qrData[0].rol);
                                var adminRef = db.collection('administrador').doc(qrData[0].id);
                                adminRef.update({
                                    password: firebase.firestore.FieldValue.delete(),
                                    rol: firebase.firestore.FieldValue.delete(),
                                    adminActivo: 1
                                });
                            } else {
                                new Noty({
                                    type: 'error',
                                    layout: 'center',
                                    text: 'Contraseña incorrecta. Veríficala.'
                                }).show().setTimeout(3000);
                            }
                        } else if (qrData[0].adminActivo === 1) {
                            accesoAdmin(email, password);
                        } else if (qrData[0].adminActivo === 2) {
                            new Noty({
                                type: 'error',
                                layout: 'center',
                                text: 'Cuenta inactiva'
                            }).show().setTimeout(3000);
                        }
                    }
                }).catch(function (error) {
                    console.log("Error getting cached document:", error);
                });
            } else if ($scope.user === undefined) {
                new Noty({
                    type: 'error',
                    layout: 'center',
                    text: 'Por favor, llena todos los campos.'
                }).show().setTimeout(3000);
            }
        };
    }
]);
angular.module('app').controller("RecuperarPasswordCtrl", [
    '$scope',
    '$state',
    function ($scope, $state) {
//Llamar a la función de firebase
        const [auth, db, functions] = firebaseInit();
        $scope.email = "";
        $scope.recuperarPassword = function (email) {
            auth.sendPasswordResetEmail(email).then(function () {
                $scope.cambiarPassword = true;
                $scope.$digest();
            }).catch(function (error) {
                // An error happened.
                console.log(error);
                var errorCode = error.code;
                // ..
                switch (errorCode) {
                    case 'auth/user-not-found':
                        new Noty({
                            type: 'error',
                            layout: 'center',
                            text: '<div class="row align-items-center"><div class="col-md-9"><h5>Este correo electrónico no se encuentra registrado.</h5><br><p>Por favor, verificalo.</p></div></div>'
                        }).show().setTimeout(5000);
                        break;
                    case 'auth/invalid-email':
                        new Noty({
                            type: 'error',
                            layout: 'center',
                            text: '<div class="row align-items-center"><div class="col-md-9"><h5>Correo electrónico inválido.</h5><br><p>Por favor, verificalo.</p></div></div>'
                        }).show().setTimeout(5000);
                        break;
                }
            });

        };
    }
]);