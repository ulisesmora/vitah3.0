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
                user.admin = idTokenResult.claims.adminPrimario;
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
//        $scope.eliminarCliente = function (id) {
//            var n = new Noty({
//                type: 'alert',
//                text: '<div class="row align-items-center"><div class="col-md-3 text-center"><i class="fa fa-2x fa-exclamation-triangle" style="color: #f9844a"></i></div><div class="col-md-9"><h5>&iquest;Desea eliminar esta empresa?</h5></div></div><p class="text-center"><br/></p>',
//                layout: 'center',
//                timeout: false,
//                modal: true,
//                closeWith: ['button'],
//                buttons: [
//                    Noty.button('S??', 'btn btn-primary mr-3 pr-5 pl-5', function () {
//                        db.collection("empresas").doc(id).update({
//                            clienteActivo: 2
//                        }).then(function () {
//                            new Noty({
//                                type: 'success',
//                                layout: 'center',
//                                text: '<div class="row align-items-center"><div class="col-md-3 text-center"><i class="fas fa-check-circle" style="color:white;"></i></div><div class="col-md-9"><h5>Cliente dado de baja ??xitosamente</h5></div></div>'
//                            }).show().setTimeout(2000);
//                            window.location.reload(true);
//                        }).catch(function (error) {
//                            console.error("Error adding document: ", error);
//                        });
//                        n.close();
//                    }),
//                    Noty.button('Cancelar', 'btn btn-info', function () {
//                        //simplemente cierra el modal
//                        n.close();
//                    })
//                ]
//            }).show();
//        };
        $scope.editarCliente = function (id) {
            $state.go('main.editar-cliente', {"id": id});
        };
        $scope.informacionCliente = function (id) {
            $state.go('main.informacion-cliente', {"id": id});
        };
        $scope.metricas = function (id) {
            $state.go('main.metricas-cliente', {"id": id});
        };
    }
]);
angular.module('app').controller("EditarClienteCtrl", [
    '$scope',
    '$state',
    '$stateParams',
    function ($scope, $state, $stateParams) {
        comprobarAuth();
        var id = $stateParams.id;
        var modulos = [];
        var empleados = [];
        const [auth, db] = firebaseInit();
        $scope.cliente = [];
//        $scope.cliente.modulosContratados = [];
        $scope.editarFechaInicio = false;
        $scope.editarFechaFinal = false;
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
//                $scope.cliente.modulosContratados = getModulosContratados(doc.data().modulosContratados);
                $scope.$digest();
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
                $state.go('main.error-pagina-no-encontrada');
            });
        }
        function getEmpleados(id) {
            clienteRef = db.collection('empresas').doc(id);
            clienteRef.collection('empleados').where('empleadoActivo', '==', 1).get().then((snapshot) => {
                qrData = snapshot.docs.map((doc) => ({
                        empleadoId: doc.id,
                        ...doc.data()
                    }));
                for (var i = 0; i < qrData.length; i++) {
                    empleados.push(qrData[i]);
                }
                $scope.empleados = empleados;
                $scope.$digest();
                return true;
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
                $state.go('main.error-pagina-no-encontrada');
            });
        }
//        function getModulos() {
//            db.collection("modulos").where("moduloActivo", "==", 1).get().then((snapshot) => {
//                qrData = snapshot.docs.map((doc) => ({
//                        id: doc.id,
//                        ...doc.data()
//                    }));
//                for (var i = 0; i < qrData.length; i++) {
//                    modulos.push(qrData[i]);
//                }
//                $scope.modulos = modulos;
//                return true;
//            }).catch(function (error) {
//                console.log("Error getting cached document:", error);
//            });
//        }
//        function getModulosContratados(modulosContratados) {
//            var modulosContratadosArray = [];
//            for (var i = 0; i < modulosContratados.length; i++) {
//                db.collection("modulos").doc(modulosContratados[i].moduloId).get().then(function (doc) {
//                    if (doc.data().moduloActivo === 1) {
//                        var modulo = {
//                            nombre: doc.data().nombre,
//                            moduloId: doc.id
//                        };
//                        modulosContratadosArray.push(modulo);
//                    }
//                    $scope.$digest();
//                }).catch(function (error) {
//                    console.log("Error getting cached document:", error);
//                });
//            }
//            return modulosContratadosArray;
//        }
//        getModulos();
        getCliente(id);
        getEmpleados(id);
        document.getElementById('datos-empresa').style.display = "block";
        document.getElementById('datos-contacto').style.display = "none";
        document.getElementById('datos-contrato').style.display = "none";
        document.getElementById('eliminar-empleado').style.display = "none";
        $scope.irA = function (paginaActual, paginaDesactivadaUno, paginaDesactivadaDos, paginaDesactivadaTres) {
            document.getElementById(paginaActual).style.display = "block";
            document.getElementById(paginaDesactivadaUno).style.display = "none";
            document.getElementById(paginaDesactivadaDos).style.display = "none";
            document.getElementById(paginaDesactivadaTres).style.display = "none";
        };
//        $scope.seleccionarModulos = function (modulo, moduloId) {
//            var seleccion = {nombre: modulo, moduloId: moduloId};
//            var moduloRepetido = "";
//            if ($scope.cliente.modulosContratados.length !== 0) {
//                for (var i = 0; i < $scope.cliente.modulosContratados.length; i++) {
//                    if (seleccion.moduloId === $scope.cliente.modulosContratados[i].moduloId) {
//                        moduloRepetido = seleccion.moduloId;
//                    }
//                }
//                if (moduloRepetido === seleccion.moduloId) {
//                    new Noty({
//                        type: 'error',
//                        layout: 'center',
//                        text: '<div class="row align-items-center"><div class="col-md-3 text-center"><i class="fa fa-2x fa-exclamation-triangle"></i></div><div class="col-md-9"><h5>Ya has a??adido anteriormente este m??dulo</h5></div></div>'
//                    }).show().setTimeout(3000);
//                } else {
//                    $scope.cliente.modulosContratados.push(seleccion);
//                }
//            } else {
//                $scope.cliente.modulosContratados.push(seleccion);
//            }
//        };
//        $scope.eliminarModulo = function (id) {
//            for (var i = 0; i < $scope.cliente.modulosContratados.length; i++) {
//                if ($scope.cliente.modulosContratados[i].moduloId === id) {
//                    $scope.cliente.modulosContratados.splice(i, 1);
//                }
//            }
//        };
//        $scope.eliminarEmpleado = function (empleadoId) {
//            var n = new Noty({
//                type: 'alert',
//                text: '<div class="row align-items-center"><div class="col-md-3 text-center"><i class="fa fa-2x fa-exclamation-triangle" style="color: #f9844a"></i></div><div class="col-md-9"><h5>&iquest;Desea eliminar este empleado?</h5></div></div><p class="text-center"><br/></p>',
//                layout: 'center',
//                timeout: false,
//                modal: true,
//                closeWith: ['button'],
//                buttons: [
//                    Noty.button('S??', 'btn btn-primary mr-3 pr-5 pl-5', function () {
//                        clienteRef = db.collection('empresas').doc(id);
//                        clienteRef.collection('empleados').doc(empleadoId).update({
//                            empleadoActivo: 2
//                        }).then(function () {
//                            clienteRef = db.collection('empresas').doc(id);
//                            clienteRef.get().then(function (doc) {
//                                var numeroUsuariosActualizado = doc.data().numeroUsuariosEmpresa + 1;
//                                clienteRef.update({
//                                    numeroUsuariosEmpresa: numeroUsuariosActualizado
//                                }).then(function () {
//                                    new Noty({
//                                        type: 'success',
//                                        layout: 'center',
//                                        text: '<div class="row align-items-center"><div class="col-md-3 text-center"><i class="fas fa-check-circle" style="color:white;"></i></div><div class="col-md-9"><h5>Empleado dado de baja ??xitosamente</h5></div></div>'
//                                    }).show().setTimeout(2000);
//                                    window.location.reload(false);
//                                }).catch(function (error) {
//                                    console.log("Error getting cached document:", error);
//                                    $state.go('main.error-pagina-no-encontrada');
//                                });
//                                $scope.$digest();
//                            }).catch(function (error) {
//                                console.log("Error getting cached document:", error);
//                                $state.go('main.error-pagina-no-encontrada');
//                            });
//                            $scope.$digest();
//                        }).catch(function (error) {
//                            console.log("Error getting cached document:", error);
//                        });
//                        n.close();
//                    }),
//                    Noty.button('Cancelar', 'btn btn-info', function () {
//                        //simplemente cierra el modal
//                        n.close();
//                    })
//                ]
//            }).show();
//
//
//        };
        function compararFecha(fecha_inicio, fecha_final) {
            var inicio_array = fecha_inicio.split("/");
            var final_array = fecha_final.split("/");
            if (parseInt(final_array[2]) < parseInt(inicio_array[2])) {
                new Noty({
                    type: 'error',
                    layout: 'center',
                    text: 'La fecha de inicio del contrato no puede ser mayor a la de final del contrato a??o'
                }).show().setTimeout(3000);
                return false;
            } else if (parseInt(final_array[0]) < parseInt(inicio_array[0])) {
                if (parseInt(final_array[2]) <= parseInt(inicio_array[2])) {
                    new Noty({
                        type: 'error',
                        layout: 'center',
                        text: 'La fecha de inicio del contrato no puede ser mayor a la fecha de final del contrato mes'
                    }).show().setTimeout(3000);
                    return false;
                }
            } else if (parseInt(final_array[1]) < parseInt(inicio_array[1])) {
                if ((parseInt(final_array[2]) <= parseInt(inicio_array[2])) && (parseInt(final_array[0]) <= parseInt(inicio_array[0]))) {
                    new Noty({
                        type: 'error',
                        layout: 'center',
                        text: 'La fecha de inicio del contrato no puede ser mayor a la fecha de final del contrato dia'
                    }).show().setTimeout(3000);
                    return false;
                }
            } else if ((parseInt(inicio_array[0]) === parseInt(final_array[0])) && ((parseInt(inicio_array[1]) === parseInt(final_array[1]))) && ((parseInt(inicio_array[2]) === parseInt(final_array[2])))) {
                new Noty({
                    type: 'error',
                    layout: 'center',
                    text: 'La fecha de inicio del contrato no puede ser igual a la fecha de final del contrato'
                }).show().setTimeout(3000);
                return false;
            }
            return true;
        }
        function evaluarCampo(valor, mensaje) {
            if (valor === "" || valor === undefined || valor.length === 0) {
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
        $scope.cambiarFechaInicio = function (valor) {
            $scope.editarFechaInicio = valor;
        };
        $scope.cambiarFechaFinal = function (valor) {
            $scope.editarFechaFinal = valor;
        };
        $scope.actualizarCliente = function (cliente) {
//            var diasAcceso = [
//                {dia: 'domingo', disponible: false},
//                {dia: 'lunes', disponible: false},
//                {dia: 'martes', disponible: false},
//                {dia: 'miercoles', disponible: false},
//                {dia: 'jueves', disponible: false},
//                {dia: 'viernes', disponible: false},
//                {dia: 'sabado', disponible: false}
//            ];
//            for (var i = 0; i < cliente.diasAcceso.length; i++) {
//                if (cliente.diasAcceso[i] === true) {
//                    diasAcceso[i].disponible = true;
//                } else {
//                    diasAcceso[i].disponible = false;
//                }
//            }
            if ($scope.editarFechaInicio === true) {
//                cliente.fechaInicioContrato = cambiarFormatoFecha(cliente.fechaInicioNueva);
                if ((evaluarCampo(cliente.mesInicioContrato, "mes") &&
                        evaluarCampo(cliente.diaInicioContrato, "d??a") &&
                        evaluarCampo(cliente.anioInicioContrato, "a??o")) === true) {
                    cliente.fechaInicioContrato = cliente.mesInicioContrato + "/" + cliente.diaInicioContrato + "/" + cliente.anioInicioContrato;
                }
            }
            if ($scope.editarFechaFinal === true) {
//                cliente.fechaFinalContrato = cambiarFormatoFecha(cliente.fechaFinalNueva);
                if ((evaluarCampo(cliente.mesFinContrato, "mes") &&
                        evaluarCampo(cliente.diaFinContrato, "d??a") &&
                        evaluarCampo(cliente.anioFinContrato, "a??o")) === true) {
                    cliente.fechaFinalContrato = cliente.mesFinContrato + "/" + cliente.diaFinContrato + "/" + cliente.anioFinContrato;
                }
            }
            if ((
                    compararFecha(cliente.fechaInicioContrato, cliente.fechaFinalContrato) &&
                    evaluarCampo(cliente.nombreEmpresa, "Nombre de la empresa") &&
                    evaluarCampo(cliente.nombreContacto, "Nombre de contacto") &&
                    evaluarCampo(cliente.primerApellidoContacto, "Primer apellido") &&
                    evaluarCampo(cliente.segundoApellidoContacto, "Segundo apellido") &&
                    evaluarCampo(cliente.emailContacto, "Email") &&
                    evaluarCampo(cliente.telefonoContacto, "Tel??fono contacto") &&
                    evaluarCampo(cliente.numeroUsuariosEmpresa, "N??mero de usuarios") &&
//                    evaluarCampo(cliente.modulosContratados, "Modulos contratados") &&
                    evaluarCampo(cliente.fechaInicioContrato, "Fecha inicio de contrato") &&
                    evaluarCampo(cliente.fechaFinalContrato, "Fecha final de contrato")) === true) { 
                db.collection("empresas").doc(id).update({
                    nombreEmpresa: cliente.nombreEmpresa,
                    razonSocial: cliente.razonSocial,
                    sitioWeb: cliente.sitioWeb,
                    domicilio: cliente.domicilio,
                    nombreContacto: cliente.nombreContacto,
                    primerApellidoContacto: cliente.primerApellidoContacto,
                    segundoApellidoContacto: cliente.segundoApellidoContacto,
                    emailContacto: cliente.emailContacto,
                    telefonoContacto: cliente.telefonoContacto,
                    puestoContacto: cliente.puestoContacto,
                    numeroUsuariosEmpresa: cliente.numeroUsuariosEmpresa,
//                    diasAcceso: diasAcceso,
//                    videosAcceso: cliente.videosAcceso,
                    fechaInicioContrato: cliente.fechaInicioContrato,
                    fechaFinalContrato: cliente.fechaFinalContrato,
//                    modulosContratados: angular.copy(cliente.modulosContratados)
                }).then(function (docDetailRef) {
                    new Noty({
                        type: 'success',
                        layout: 'center',
                        text: 'Cliente editado con ??xito'
                    }).show().setTimeout(3000);
                    $state.go('main.clientes-activos-list');
                }).catch(function (error) {
                    console.log("Error getting cached document:", error);
                });
            }
        };
    }
]);

angular.module('app').controller("InformacionClienteCtrl", [
    '$scope',
    '$state',
    '$stateParams',
    '$firebaseArray',
    function ($scope, $state, $stateParams) {
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
//        function getModulosContratados(modulosContratados) {
//            var modulosContratadosArray = [];
//            for (var i = 0; i < modulosContratados.length; i++) {
//                db.collection("modulos").doc(modulosContratados[i].moduloId).get().then(function (doc) {
//                    if (doc.data().moduloActivo === 1) {
//                        var modulo = {
//                            nombre: doc.data().nombre,
//                            moduloId: doc.id
//                        };
//                        modulosContratadosArray.push(modulo);
//                    }
//                    $scope.$digest();
//                }).catch(function (error) {
//                    console.log("Error getting cached document:", error);
//                });
//            }
//            return modulosContratadosArray;
//        }
        function getCliente(id) {
            clienteRef = db.collection('empresas').doc(id);
            clienteRef.get().then(function (doc) {
                $scope.cliente = doc.data();
//                for (var i = 0; i < doc.data().diasAcceso.length; i++) {
//                    $scope.cliente.diasAcceso[i] = doc.data().diasAcceso[i].disponible;
//                }
//                $scope.cliente.modulosContratados = getModulosContratados(doc.data().modulosContratados);
                $scope.$digest();
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
                $state.go('main.error-pagina-no-encontrada');
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