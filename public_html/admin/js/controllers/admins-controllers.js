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
    const functions = firebase.functions();
    return [auth, db, storage, functions];
}
function comprobarAuth() {
    const [auth, db, storeage, functions] = firebaseInit();
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
angular.module('app').controller("AgregarAdminCtrl", [
    '$scope',
    '$state',
    '$stateParams',
    function ($scope, $state) {
        comprobarAuth();
        const [auth, db, storage, functions] = firebaseInit();
        $scope.admin = {tipo: '01'};
        $scope.tiposAdmins = [
            {admin: 'Maestra', id: '01'},
            {admin: 'Lectura y edición', id: '02'},
            {admin: 'Sólo lectura', id: '03'}
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
        function addAdmin(admin) {
            if ((evaluarCampo(admin.nombre, "nombre") && evaluarCampo(admin.primerApellido, "primer apellido") && evaluarCampo(admin.segundoApellido, "segundo apellido") && evaluarCampo(admin.email, "email") && evaluarCampo(admin.password, "contraseña")) === true) {
                switch (admin.tipo) {
                    case'01':
                        var rol = 'addAdminRole';
                        var tipoAdmin = 'Maestro';
                        break;
                    case'02':
                        var rol = 'addAdminPrimarioRole';
                        var tipoAdmin = 'LecturaEdicion';
                        break;
                    case'03':
                        var rol = 'addAdminSecundarioRole';
                        var tipoAdmin = 'Lectura';
                        break;
                }
                db.collection('administrador').add({
                    nombre: admin.nombre,
                    primerApellido: admin.primerApellido,
                    segundoApellido: admin.segundoApellido,
                    adminActivo: 3, //admin aun sin estar en auth
                    email: admin.email,
                    tipoAdmin: tipoAdmin,
                    rol: rol,
                    password: admin.password
                }).then(function (docDetailRef) {
                    var n = new Noty({
                        type: 'alert',
                        text: '<div class="row align-items-center"><div class="col-md-3 text-center"><i class="fa fa-2x fa-exclamation-triangle" style="color: #f9844a"></i></div><div class="col-md-9"><h5><strong>¡Importante!</strong><br><br> Recuerda que el administrador aparecerá como un administrador activo una vez que haya iniciado sesión por primera vez</h5></div></div><p class="text-center"><br/></p>',
                        layout: 'center',
                        timeout: false,
                        modal: true,
                        closeWith: ['button'],
                        buttons: [
                            Noty.button('Entendido', 'btn btn-primary mr-3 pr-5 pl-5', function () {
                                $state.go('main.ver-admin-list');
                                n.close();
                            }),
                        ]
                    }).show();
                    $scope.$digest();
                }).catch(function (error) {
                    console.log("Error getting cached document:", error);
                });
            }
        }
        $scope.crearAdmin = function (admin) {
            if ((evaluarCampo(admin.nombre, "nombre") && evaluarCampo(admin.primerApellido, "primer apellido") && evaluarCampo(admin.segundoApellido, "segundo apellido") && evaluarCampo(admin.email, "email") && evaluarCampo(admin.password, "contraseña")) === true) {
                db.collection("administrador").where("email", "==", admin.email).get().then((snapshot) => {
                    qrData = snapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data()
                        }));
                    if (qrData.length > 0) {
                        new Noty({
                            type: 'error',
                            layout: 'center',
                            text: '<div class="row align-items-center"><div class="col-md-9"><h5>Este correo electrónico ya se encuentra en uso.</h5><br><p>Si crees que se trata de un error, por favor, contacta con tu empresa</p></div></div>'
                        }).show().setTimeout(5000);
                    } else {
                        addAdmin(admin);
                    }
                }).catch(function (error) {
                    console.log("Error getting cached document:", error);
                });
            }
        };
    }
]);
angular.module('app').controller("AdminListCtrl", [
    '$scope',
    '$state',
    '$stateParams',
    function ($scope, $state) {
        comprobarAuth();
        const [auth, db, storage, functions] = firebaseInit();
        $scope.administradores = [];
        db.collection("administrador").where("adminActivo", "==", 1).get().then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                var tipoAdmin;
                if (doc.data().tipoAdmin === "LecturaEdicion") {
                    $scope.administradores.tipoAdministrador = "Edición y lectura";
                    tipoAdmin = "Edición y Lectura";
                } else if (doc.data().tipoAdmin === "Lectura") {
                    tipoAdmin = "Sólo lectura";
                } else if (doc.data().tipoAdmin === "Maestro") {
                    tipoAdmin = "Maestra";
                }
                var administradorInfo = {
                    nombre: doc.data().nombre,
                    tipoAdmin: tipoAdmin,
                    email: doc.data().email,
                    id: doc.id
                };
                $scope.administradores.push(administradorInfo);

            });
            $scope.$digest();
        }).catch(function (error) {
            console.log("Error getting cached document:", error);
        });

        $scope.eliminarAdmin = function (id) {
            var n = new Noty({
                type: 'alert',
                text: '<div class="row align-items-center"><div class="col-md-3 text-center"><i class="fa fa-2x fa-exclamation-triangle" style="color: #f9844a"></i></div><div class="col-md-9"><h5>&iquest;Desea eliminar este administrador?</h5></div></div><p class="text-center"><br/></p>',
                layout: 'center',
                timeout: false,
                modal: true,
                closeWith: ['button'],
                buttons: [
                    Noty.button('Sí', 'btn btn-primary mr-3 pr-5 pl-5', function () {
                        db.collection("administrador").doc(id).update({
                            adminActivo: 2
                        }).then(function () {
                            new Noty({
                                type: 'success',
                                layout: 'center',
                                text: '<div class="row align-items-center"><div class="col-md-3 text-center"><i class="fas fa-check-circle" style="color:white;"></i></div><div class="col-md-9"><h5>Administrador dado de baja éxitosamente</h5></div></div>'
                            }).show().setTimeout(2000);
                            window.location.reload(false);
                        }).catch(function (error) {
                            console.error("Error adding document: ", error);
                        });
                        n.close();
                    }),
                    Noty.button('Cancelar', 'btn btn-info', function () {
                        //simplemente cierra el modal
                        n.close();
                    })
                ]
            }).show();
        };
        $scope.editarAdmin = function (id) {
            console.log(id);
            $state.go('main.editar-admin', {"id": id});
        };
    }
]);
angular.module('app').controller("EditAdminCtrl", [
    '$scope',
    '$state',
    '$stateParams',
    function ($scope, $state, $stateParams) {
        comprobarAuth();
        const [auth, db, storage, functions] = firebaseInit();
        var adminId = $stateParams.id;
        $scope.administradores = [];
        adminRef = db.collection('administrador').doc(adminId);
        adminRef.get().then(function (doc) {
            $scope.admin = doc.data();
            $scope.$digest();
        }).catch(function (error) {
            console.log("Error getting cached document:", error);
            $state.go('main.error-pagina-no-encontrada');
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
        $scope.editarAdmin = function (admin) {
            if ((evaluarCampo(admin.nombre, "nombre") && evaluarCampo(admin.primerApellido, "primer apellido") && evaluarCampo(admin.segundoApellido, "segundo apellido")) === true) {
                db.collection("administrador").doc(adminId).update({
                    nombre: admin.nombre,
                    primerApellido: admin.primerApellido,
                    segundoApellido: admin.segundoApellido
                }).then(function (docModuloRef) {
                    new Noty({
                        type: 'success',
                        layout: 'center',
                        text: '<div class="row align-items-center"><div class="col-md-3 text-center"><i class="fas fa-check-circle" style="color:white;"></i></div><div class="col-md-9"><h5>Administrador editado éxitosamente</h5></div></div>'
                    }).show().setTimeout(2000);
                    $state.go('main.ver-admin-list');
                }).catch(function (error) {
                    console.log("Error getting cached document:", error);
                });
            }
        };
    }
]);