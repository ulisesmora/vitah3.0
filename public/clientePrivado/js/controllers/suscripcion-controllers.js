/* global firebase, $routeProvider, base_url, angular */
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
function comprobarAuth() {
    const [auth, db] = firebaseInit();
    auth.onAuthStateChanged(user => {
        if (user) {
            user.getIdTokenResult().then(idTokenResult => {
                user.empleado = idTokenResult.claims.cliente;
                if (user && user.empleado !== true) {
                    location.href = base_url + ('#!/error');
                } else {
                    document.getElementById("empleado-ind").style.display = "block";
                }
            });
        } else {
            location.href = base_url + ('#!/login');
        }
    });
}
angular.module('app').controller("cancelarSuscripcionCtrl", [
    '$scope',
    '$stateParams',
    function ($scope, $stateParams) {
        comprobarAuth();
        const [auth, db] = firebaseInit();
        const functionLocation = 'us-central1';
             document.querySelector('#my-subscription').style.display = 'block';
        // Billing portal handler
        document
                .querySelector('#billing-portal-button')
                .addEventListener('click', async (event) => {
                    document.querySelectorAll('button').forEach((b) => (b.disabled = true));
                    // Call billing portal function
                    const functionRef = firebase
                            .app()
                            .functions(functionLocation)
                            .httpsCallable('ext-firestore-stripe-subscriptions-createPortalLink');
                    const {data} = await functionRef({returnUrl: 'http://localhost/vitah3.0/public_html/#!/login'});
             //       const {data} = await functionRef({returnUrl: 'https://vitahonline.com/#!/login'});
                    window.location.assign(data.url);
                });
// Get custom claim role helper
        async function getCustomClaimRole() {
            await firebase.auth().currentUser.getIdToken(true);
            const decodedToken = await firebase.auth().currentUser.getIdTokenResult();
            return decodedToken.claims.stripeRole;
        }
    }
]);