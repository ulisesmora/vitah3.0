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
    '$state',
    function ($scope, $state) {
//        $scope.show_subelements = false;
        const [auth, db] = firebaseInit();
        function getVideos(id, arrayAgregar) {
            var videos = {};
            db.collection('modulos').doc(id).collection('videos').get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    videos = {
                        nombre: doc.data().nombre,
                        link: doc.data().link,
                        state: 'main.ver-video({videoId: "' + doc.id + '", moduloId: "' + id + '"})'
                    };
                    if (id === arrayAgregar.moduloId) {
                        arrayAgregar.videos.push(videos);
                    }
                });
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
            $scope.$digest();
        }
//        function getModulos(id, arrayAgregar, arrayAgregarMobile, empresaId) {
//            db.collection('modulos').doc(id).get().then(function (doc) {
//                if (doc.data().moduloActivo === 1) {
//                    modulos = doc.data();
//                    var modulos = {
//                        text: modulos.nombre,
//                        state: 'main.ver-modulo({moduloId: "' + doc.id + '"})',
//                        moduloId: doc.id,
//                        videos: [
//                        ]
//                    };
//                    arrayAgregar[2].submenu_elements.push(modulos);
//                    arrayAgregarMobile[1].submenu_elements.push(modulos);
////                    var todosModulos = {
////                        text: 'Todos los módulos',
////                        state: 'main.modulos-contratados({empresaId: "' + empresaId + '"})'
////                    };
////                    arrayAgregarMobile[1].submenu_elements.splice(1, 0, todosModulos);
//                    for (var i = 0; i < arrayAgregar[2].submenu_elements.length; i++) {
//                        getVideos(id, arrayAgregar[2].submenu_elements[i]);
//                    }
//                }
//            }).catch(function (error) {
//                console.log("Error getting cached document:", error);
//            });
//            $scope.$digest();
//        }
        function getModulos(arrayAgregar, arrayAgregarMobile, empresaId) {
            db.collection('modulos').get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    if (doc.data().moduloActivo === 1) {
                        modulos = doc.data();
                        var modulos = {
                            text: modulos.nombre,
                            state: 'main.ver-modulo({moduloId: "' + doc.id + '"})',
                            moduloId: doc.id,
                            videos: [
                            ]
                        };
                        arrayAgregar[2].submenu_elements.push(modulos);
                        arrayAgregarMobile[1].submenu_elements.push(modulos);
//                    var todosModulos = {
//                        text: 'Todos los módulos',
//                        state: 'main.modulos-contratados({empresaId: "' + empresaId + '"})'
//                    };
//                    arrayAgregarMobile[1].submenu_elements.splice(1, 0, todosModulos);
                        for (var i = 0; i < arrayAgregar[2].submenu_elements.length; i++) {
                            getVideos(doc.id, arrayAgregar[2].submenu_elements[i]);
                        }
                    }
                });
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }

        $scope.videos = [];
        $scope.menu_elements = [
            {
                icon: 'images/menu/home.png',
                state: 'main.home',
                text: 'Inicio'
            },
            {
                icon: 'images/menu/modulos.png',
                text: 'Módulos contratados',
                submenu_elements: [
//                        state: 'main.modulos-contratados',
//                        text: 'Modulos contratados'
                ]
            },
            {
                icon: 'images/menu/modulos_cliente.png',
                text: 'Modulos',
                submenu_elements: [
                ]
            },
            {
                icon: 'images/menu/clientes.png',
                text: 'Editar Perfil',
                submenu_elements: [{
                        state: 'main.editar-perfil',
                        text: 'Editar perfil'
                    }]
            }
        ];
        $scope.menu_elements_mobile = [
            {
                icon: 'images/menu/home.png',
                state: 'main.home',
                text: 'Inicio'
            },
            {
                icon: 'images/menu/clientes.png',
                text: 'Editar Perfil',
                state: 'main.editar-perfil'
            }
        ];
        auth.onAuthStateChanged(user => {
            if (user) {
                user.getIdTokenResult().then(idTokenResult => {
                    db.collection("empresas").doc(idTokenResult.claims.empresaId).get().then(function (doc) {
                        var submenu = {
                            state: 'main.modulos-contratados({empresaId: "' + idTokenResult.claims.empresaId + '"})',
                            text: 'Módulos contratados'
                        };
                        var state =
                                {
                                    icon: 'images/menu/modulos_cliente.png',
                                    text: 'Modulos',
                                    subicon: 'fas fa-sort-down',
                                    submenu_elements: [{
                                            text: 'Todos los módulos',
                                            state: 'main.modulos-contratados({empresaId: "' + idTokenResult.claims.empresaId + '"})'
                                        }]
                                };

                        $scope.menu_elements[1].submenu_elements.push(submenu);
                        $scope.menu_elements_mobile.splice(1, 0, state);
                        var empresa = doc.data();
//                        for (var i = 0; i < empresa.modulosContratados.length; i++) {
//                            var modulosId = empresa.modulosContratados[i].moduloId;
//                            getModulos(modulosId, $scope.menu_elements, $scope.menu_elements_mobile, idTokenResult.claims.empresaId);
//                        }
                        getModulos($scope.menu_elements, $scope.menu_elements_mobile, idTokenResult.claims.empresaId);
                    }).catch(function (error) {
                        console.log("Error getting cached document:", error);
                    });
                });
            } else {
            }
        });
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

