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

angular.module('app').controller("MenuCtrl", [
    '$scope',
    '$state',
    '$location',
    '$anchorScroll',
    function ($scope, $state, $location, $anchorScroll) {
//Llamar a la función de firebase
        const [auth, db, functions] = firebaseInit();
        $scope.modulos = [];
        $scope.menu_elements = [
//            {
//                text: '',
//                state: 'main.home',
//                
//            },
            {
                text: 'Empresas',
                submenu_elements: [
                    {
                        text: 'Registra tu empresa',
                        state: 'main.registro-empresa'
                    },
                    {
                        text: 'Registra tu código',
                        state: 'main.registro-cliente'
                    }
                ]

            },
            {
                text: 'Categorías',
//                argumento: 'categoria'
                state: 'main.categorias'
//                submenu_elements: [
//                ]
            },
            {
                text: '',
                icon: 'fas fa-user-circle',
                submenu_elements: [{
                        text: 'Inicia sesión',
                        state: 'main.login'
                    },
                    {
                        text: 'Crea una cuenta',
                        state: 'main.login'
                    }
                ]
            }
        ];
        $scope.submenuElementsShow = function (data) {
            if (data.submenu_elements === undefined) {
                $("input[type='checkbox']").prop("checked", false);
            }
        };
//        function getModulos() {
//            db.collection('modulos').get().then(function (querySnapshot) {
//                querySnapshot.forEach(function (doc) {
//                    if (doc.data().moduloActivo === 1) {
//                        modulos = doc.data();
//                        var modulos = {
//                            text: doc.data().nombre,
//                            state: 'main.login'
//                        };
//                        $scope.modulos.push(modulos);
//                        $scope.menu_elements[2].submenu_elements.push(modulos);
//                        $scope.$digest();
//                    }
//                });
//            }).catch(function (error) {
//                console.log("Error getting cached document:", error);
//            });
//        }
//        getModulos();
        $scope.irCategoria = function (argumento) {
            if (argumento === 'categoria') {
                $location.hash('modulo');
                $anchorScroll();
            }
        };
    }
]);