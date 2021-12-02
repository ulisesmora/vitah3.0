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
    return [auth, db];
}
angular.module('app').controller("MenuCtrl", [
    '$scope',
    function ($scope) {
        const [auth, db] = firebaseInit();
        $scope.menu_elements = [
            {
                icon: 'images/menu/home.png',
                state: 'main.home'
            },
            {
                icon: 'images/menu/clientes.png',
                state: 'main.usuarios_list',
                submenu_elements: [
                    {
                        text: 'Clientes activos',
                        state: 'main.clientes-activos-list'
                    }
                ]

            },
            {
                icon: 'images/menu/modulos.png',
                submenu_elements: [
                    {
                        text: 'Módulos activos',
                        state: 'main.modulos-activos-list'
                    }
                ]
            },
//            {
//                icon_fa: 'fas fa-file-export',
//                submenu_elements: [
//                    {
//                        text: 'Descargar métricas por módulo',
//                        state: 'main.metricas-by-modulo'
//                    },
//                    {
//                        text: 'Descargar métricas por empresa',
//                        state: 'main.metricas-by-empresa'
//                    }
//                ]
//            }
           
        ];
        $scope.menu_elements_mobile = [
            {
                icon: 'images/menu/home.png',
                state: 'main.home',
                text: 'Inicio'
            },
            {
                icon: 'images/menu/clientes.png',
                state: 'main.usuarios_list',
                text: 'Clientes',
                icon_desplegable: 'fas fa-sort-down',
                submenu_elements: [
                    {
                        text: 'Clientes activos',
                        state: 'main.clientes-activos-list'
                    },
                    {
                        text: 'Agregar cliente',
                        state: 'main.agregar-cliente'
                    }
                ]

            },
            {
                icon: 'images/menu/modulos.png',
                text: 'Módulos',
                icon_desplegable: 'fas fa-sort-down',
                submenu_elements: [
                    {
                        text: 'Módulos activos',
                        state: 'main.modulos-activos-list'
                    },
                    {
                        text: 'Crear módulo',
                        state: 'main.agregar-modulo'
                    }
                ]
            }
        ];
        $scope.logOut = function () {
            auth.signOut().then(() => {
                location.href = base_url + ('/#!/login');
            });
        };
        $scope.submenuElementsShow = function (data) {
            if (data.submenu_elements === undefined) {
                $("input[type='checkbox']").prop("checked", false);
            }
        };
//        Animaciones menu
        $('nav.sidebar-navigation-back').mouseenter(function () {
            $(".sidebar-navigation-back").css("width", "200px");
            $('#logo_menu').css("width", "200px").children('img').attr("src", "images/menu/logo_vitah_white.png").css("width", "150px");
            $('.submenu').css("transform", "translateX(60px)");
        });
        $('nav.sidebar-navigation-back').mouseleave(function () {
            $(".sidebar-navigation-back").css("width", "60px");
            $('#logo_menu').css("width", "60px").children('img').attr("src", "images/menu/V_vitah_white.png").css("width", "60px");
        });
    }
]);

