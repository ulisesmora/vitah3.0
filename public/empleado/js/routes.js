/* global firebase, base_url, angular */
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
        var cliente_url = "http://localhost/vitah3.0/public_html/empleado/templates";
      //  var cliente_url = "https://vitahonline.com/empleado/templates";
        $urlRouterProvider.otherwise('/home');
        $stateProvider.state('main', {
            templateUrl: cliente_url + '/menu.html',
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
            templateUrl: cliente_url + '/home.html',
            controller: "HomeCtrl",
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'js/controllers/home-controllers.js'
                        ]);
                    }]
            }
        });
        $stateProvider.state('main.preregistro', {
            url: '/queremos-conocerte',
            templateUrl: cliente_url + '/preregistro/preregistro-form.html',
            controller: "PreregistroCtrl",
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'js/controllers/preregistro-controllers.js'
                        ]);
                    }]
            }
        });
                    $stateProvider.state('main.agregar-cliente', {
                        url: '/agregar-cliente',
                        templateUrl: cliente_url + '/clientes/agregar-cliente.html',
                        controller: "AgregarClienteCtrl",
                        resolve: {
                            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                                    return $ocLazyLoad.load([
                                        'js/controllers/clientes-controllers.js'
                                    ]);
                                }]
                        }
                    });
                    $stateProvider.state('main.ver-modulo', {
                        url: '/modulo/{moduloId}',
                        controller: 'VerModuloCtrl',
                        templateUrl: cliente_url + '/modulos/ver-modulo.html',
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
                    $stateProvider.state('main.ver-video', {
                        url: '/video/{videoId}&{moduloId}',
                        controller: 'VerVideoCtrl',
                        templateUrl: cliente_url + '/videos/ver-video.html',
                        resolve: {
                            loadMyCtrl: ['$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load([
                                        'js/controllers/videos-controllers.js'
                                    ]);
                                }
                            ]
                        }
                    });
                    $stateProvider.state('main.modulos-contratados', {
                        url: '/modulos',
                        controller: 'ModulosCtrl',
                        templateUrl: cliente_url + '/modulos/modulos-list.html',
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
                    $stateProvider.state('main.editar-perfil', {
                        url: '/editar-perfil',
                        controller: 'EditarPerfilCtrl',
                        templateUrl: cliente_url + '/cliente/editar-perfil.html',
                        resolve: {
                            loadMyCtrl: ['$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load([
                                        'js/controllers/cliente-controllers.js'
                                    ]);
                                }
                            ]
                        }
                    });
                    $stateProvider.state('main.cancelar-suscripcion', {
                        url: '/cancelar-suscripcion',
                        controller: 'cancelarSuscripcionCtrl',
                        templateUrl: cliente_url + '/cliente/cancelar-suscripcion.html',
                        resolve: {
                            loadMyCtrl: ['$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load([
                                        'js/controllers/suscripcion-controllers.js'
                                    ]);
                                }
                            ]
                        }
                    });
                    $stateProvider.state('main.cerrar-sesion', {
//                        url: '/cancelar-suscripcion',
                        controller: 'cerrarSesionCtrl',
//                        templateUrl: cliente_url + '/cliente/cancelar-suscripcion.html',
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