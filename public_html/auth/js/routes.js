/* global auth_url */

angular.module("app").config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/home');
        $stateProvider.state('main', {
            templateUrl: auth_url + '/menu.html',
            controller: 'MenuCtrl',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'auth/js/controllers/menu-controller.js'
                        ]);
                    }]
            }
        });
        $stateProvider.state('main.home', {
            url: '/home',
            controller: 'HomeCtrl',
            templateUrl: auth_url + '/home.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'auth/js/controllers/home-controller.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.login', {
            url: '/login',
            controller: 'UsuarioLoginAndRegisterCtrl',
            templateUrl: auth_url + '/clientes/auth-cliente.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'auth/js/controllers/usuario-controller.js'
                        ]);
                    }
                ]
            }
        });

        $stateProvider.state('main.register', {
            url: '/register',
            controller: 'UsuarioLoginAndRegisterCtrl',
            templateUrl: auth_url + '/clientes/register-cliente.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'auth/js/controllers/usuario-controller.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.categorias', {
            url: '/categorias',
            controller: 'CategoriasCtrl',
            templateUrl: auth_url + '/categorias.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'auth/js/controllers/categorias-controller.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.login-admin', {
            url: '/login-admin',
            controller: 'LoginAdminCtrl',
            templateUrl: auth_url + '/admin/auth-admin.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'auth/js/controllers/auth-controller.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.registro-cliente', {
            url: '/registrate',
//            controller: 'RegistroClienteCtrl',
            controller: 'RegistroEmpleadoCtrl',
            templateUrl: auth_url + '/empresas/empleado-registro-form.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'auth/js/controllers/cliente-controller.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.registro-empresa', {
            url: '/registra-tu-empresa',
            controller: 'RegistroEmpresaCtrl',
            templateUrl: auth_url + '/empresas/empresa-registro-form.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'auth/js/controllers/cliente-controller.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.registro-persona', {
            url: '/registrate-a-vitah',
            controller: 'RegistroPersonaCtrl',
            templateUrl: auth_url + '/persona-registro-form.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'auth/js/controllers/cliente-controller.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.registro-persona-stripe', {
            url: '/registrate-a-vitah-stripe',
            controller: 'RegistroPersonaCtrlStripe',
            templateUrl: auth_url + '/persona-registro-formStripe.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'auth/js/controllers/cliente-controller.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.recuperar-password', {
            url: '/recuperar-password',
            controller: 'RecuperarPasswordCtrl',
            templateUrl: auth_url + '/recuperar-password-form.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'auth/js/controllers/auth-controller.js'
                        ]);
                    }
                ]
            }
        });
        $stateProvider.state('main.vitah', {
            onEnter: function($window) {
            $window.open('https://vitah.mx/', '_self');
        }
        });
        $stateProvider.state('main.error', {
            url: '/error',
            templateUrl: auth_url + '/error.html'
//            resolve: {
//                loadMyCtrl: ['$ocLazyLoad',
//                    function ($ocLazyLoad) {
//                        return $ocLazyLoad.load([
//                            'auth/js/controllers/cliente-controller.js'
//                        ]);
//                    }
//                ]
//            }
        });
    }
]);