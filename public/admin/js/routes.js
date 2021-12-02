/* global firebase, base_url, admin_url */

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
angular.module("app").config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        const [auth, db] = firebaseInit();
        var admin_url = "http://localhost/vitah3.0/public_html/admin/templates";
        //var admin_url = "https://vitahonline.com/admin/templates";
        $urlRouterProvider.otherwise('/home');
        $stateProvider.state('main', {
            templateUrl: admin_url + '/menu.html',
            controller: 'MenuCtrl',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'js/controllers/menu-controllers.js'
                        ]);
                    }]
            }
        });
        $stateProvider.state('main.home', {
            url: '/home',
            templateUrl: admin_url + '/home.html',
            controller: "HomeCtrl",
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'js/controllers/home-controllers.js'
                        ]);
                    }]
            }
        });
        $stateProvider.state('main.agregar-cliente', {
            url: '/agregar-cliente',
            templateUrl: admin_url + '/clientes/agregar-cliente.html',
            controller: "AgregarClienteCtrl",
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'js/controllers/clientes-controllers.js'
                        ]);
                    }]
            }
        });
        $stateProvider.state('main.clientes-preregistro-list', {
            url: '/clientes-preregistro',
            controller: 'ClientesPreregistroListCtrl',
            templateUrl: admin_url + '/clientes/clientes-preregistro-list.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'js/controllers/clientes-controllers.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.aceptar-cliente-form', {
            url: '/cliente-preregistro/{id}',
            controller: 'ClientesPreregistroFormCtrl',
            templateUrl: admin_url + '/clientes/clientes-preregistro-form.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'js/controllers/clientes-controllers.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.clientes-activos-list', {
            url: '/clientes-activos',
            controller: 'ClientesActivosListCtrl',
            templateUrl: admin_url + '/clientes/clientes-activos-list.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'js/controllers/clientes-controllers.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.editar-cliente', {
            url: '/editar-cliente/{id}',
            controller: 'EditarClienteCtrl',
            templateUrl: admin_url + '/clientes/editar-cliente.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'js/controllers/clientes-controllers.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.informacion-cliente', {
            url: '/informacion-cliente/{id}',
            controller: 'InformacionClienteCtrl',
            templateUrl: admin_url + '/clientes/informacion-cliente.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'js/controllers/clientes-controllers.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.metricas-cliente', {
            url: '/metricas-cliente/{id}',
            controller: 'MetricasGeneralesClienteCtrl',
            templateUrl: admin_url + '/clientes/metricas/metricas-cliente.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'js/controllers/metricas-controllers.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.personas-list', {
            url: '/personas',
            controller: 'PersonasListCtrl',
            templateUrl: admin_url + '/personas/personas-list.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'js/controllers/personas-controllers.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.metricas-videos', {
            url: '/metricas-videos/{moduloId}&{empresaId}',
            controller: 'MetricasVideosCtrl',
            templateUrl: admin_url + '/clientes/metricas/metricas-videos.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'js/controllers/metricas-controllers.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.metricas-empleados', {
            url: '/metricas-empleados/{moduloId}&{empresaId}',
            controller: 'MetricasVideosEmpleadosCtrl',
            templateUrl: admin_url + '/clientes/metricas/metricas-empleados.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'js/controllers/metricas-controllers.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.metricas-empleado-modulo', {
            url: '/metricas-empleado-by-modulo/{moduloId}&{empresaId}&{empleadoId}',
            controller: 'MetricasByEmpleadoCtrl',
            templateUrl: admin_url + '/clientes/metricas/metricas-by-empleado.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'js/controllers/metricas-controllers.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.modulos-activos-list', {
            url: '/modulos-activos',
            controller: 'ModulosActivosListCtrl',
            templateUrl: admin_url + '/modulos/modulos-activos-list.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'js/controllers/modulos-controllers.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.agregar-modulo', {
            url: '/agregar-modulo',
            controller: 'AgregarModuloCtrl',
            templateUrl: admin_url + '/modulos/agregar-modulo.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'js/controllers/modulos-controllers.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.editar-modulo', {
            url: '/editar-modulo/{id}',
            controller: 'EditarModuloCtrl',
            templateUrl: admin_url + '/modulos/editar-modulo.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'js/controllers/modulos-controllers.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.informacion-modulo', {
            url: '/informacion-modulo/{id}',
            controller: 'InformacionModuloCtrl',
            templateUrl: admin_url + '/modulos/informacion-modulo.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'js/controllers/modulos-controllers.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.metricas-by-modulo', {
            url: '/descarga-metricas-modulos',
            controller: 'MetricasDescargaByModuloCtrl',
            templateUrl: admin_url + '/clientes/metricas/descarga/descargar-metricas-by-modulo.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'js/controllers/metricas-controllers.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.agregar-admin', {
            url: '/crear-admin',
            controller: 'AgregarAdminCtrl',
            templateUrl: admin_url + '/admins/create-admin.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'js/controllers/admins-controllers.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.ver-admin-list', {
            url: '/lista-admin-activos',
            controller: 'AdminListCtrl',
            templateUrl: admin_url + '/admins/admin-activos-list.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'js/controllers/admins-controllers.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.editar-admin', {
            url: '/editar-administrador/{id}',
            controller: 'EditAdminCtrl',
            templateUrl: admin_url + '/admins/edit-admin.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'js/controllers/admins-controllers.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.error-pagina-no-encontrada', {
            url: '/error',
//            controller: 'InformacionModuloCtrl',
            templateUrl: admin_url + '/error/error.html'
//            resolve: {
//                loadMyCtrl: ['$ocLazyLoad',
//                    function ($ocLazyLoad) {
//                        return $ocLazyLoad.load([
//                            'js/controllers/modulos-controllers.js'
//                        ]);
//                    }
//                ]
//            }
        });
        $stateProvider.state('main.cerrar-sesion', {
            controller: 'cerrarSesionCtrl',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'js/controllers/menu-controllers.js'
                        ]);
                    }
                ]
            }
        });
    }
]);