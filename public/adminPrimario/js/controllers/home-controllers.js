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
    return [auth, db];
}
angular.module('app').controller("HomeCtrl", [
    '$scope',
    function ($scope) {
//Llamar a la función de firebase
        const [auth, db] = firebaseInit();
//Código
        auth.onAuthStateChanged(user => {
            if (user) {
                user.getIdTokenResult().then(idTokenResult => {
                    user.admin = idTokenResult.claims.adminPrimario;
                    user.email = idTokenResult.claims.email;
                    if (user && user.admin === true) {
                        document.getElementById("admin-ind").style.display = "block";
                        db.collection("administrador").where("email", "==", user.email).get().then((snapshot) => {
                            qrData = snapshot.docs.map((doc) => ({
                                    id: doc.id,
                                    ...doc.data()
                                }));
                            $scope.nombre = qrData[0].nombre;
                            $scope.$digest();
                        }).catch(function (error) {
                            console.log("Error getting cached document:", error);
                        });
                    } else {
                        location.href = base_url + ('#!/error');
                    }
                });
            } else {
                location.href = base_url + ('#!/login');
            }
        });
    }
]);
