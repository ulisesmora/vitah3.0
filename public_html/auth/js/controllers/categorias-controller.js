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

angular.module('app').controller("CategoriasCtrl", [
    '$scope',
    '$state',
    '$rootScope',
    '$sce',
    function ($scope, $state, $rootScope, $sce) {
        const [auth, db, functions] = firebaseInit();
        $scope.getAllVideos = [];
        $scope.diezVideos = [];
        $scope.modulos = [];
        function addProximamente() {
            var modulo = {
                state: '',
                imageURI: 'https://i.ytimg.com/vi/_NJa5C6bpLo/sddefault.jpg',
                nombre: '¡Próximamente!',
                moduloId: ''
            };
            $scope.modulos.push(modulo);
            $scope.$digest();
        }
        function getModulos() {
            db.collection('modulos').get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    if (doc.data().moduloActivo === 1) {
                        modulos = doc.data();
                        var modulos = {
                            state: 'main.ver-modulo({moduloId: "' + doc.id + '"})',
                            imageURI: doc.data().imageURI,
                            nombre: doc.data().nombre,
                            moduloId: doc.id
                        };
                        $scope.modulos.push(modulos);
//                        $scope.$digest();
                    }
                });
                setTimeout(addProximamente, 500);
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });

        }
        getModulos();
    }
]);