
/* global firebase, $routeProvider, base_url, app, by, element, expect, XLSX, ExcelJS */
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
                user.admin = idTokenResult.claims.adminSecundario;
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
angular.module('app').controller("MetricasGeneralesClienteCtrl", [
    '$scope',
    '$state',
    '$stateParams',
    function ($scope, $state, $stateParams) {
        comprobarAuth();
        const [auth, db] = firebaseInit();
        var empresaId = $stateParams.id;
        $scope.cliente = [];
        $scope.modulos = [];
        $scope.sumavistas;
        $scope.arrayVistas = [];
        function getCliente(empresaId) {
            clienteRef = db.collection('empresas').doc(empresaId);
            clienteRef.get().then(function (doc) {
                $scope.cliente = doc.data();
                getModulosContratados($scope.cliente.modulosContratados);
                $scope.$digest();
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
                $state.go('main.error-pagina-no-encontrada');
            });
        }
        function getVistasEmpleados(moduloId) {
            empleadosRef = db.collection('empresas').doc(empresaId).collection('empleados');
//            var sumavistas;
//            var vistasTotalesVideo = 0;
            for (var i = 0; i < $scope.modulos.length; i++) {
                var suma = 0;
                $scope.modulos[i].vistas = suma;
                $scope.$digest();
            }
            db.collection('empresas').doc(empresaId).collection('empleados').where("empleadoActivo", "==", 1).get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    db.collection('empresas').doc(empresaId).collection('empleados').doc(doc.id).collection("videosVistos").where("moduloId", "==", moduloId).get().then(function (querySnapshot) {
                        querySnapshot.forEach(function (docVideo) {
                            if (moduloId === docVideo.data().moduloId) {
                                $scope.arrayVistas.push(docVideo.data());
                            }
                            $scope.$digest();
                        });
                        for (var i = 0; i < $scope.modulos.length; i++) {
                            var suma = 0;
                            for (var k = 0; k < $scope.arrayVistas.length; k++) {
                                if ($scope.modulos[i].moduloId === $scope.arrayVistas[k].moduloId) {
                                    suma = suma + $scope.arrayVistas[k].vistas;
                                    $scope.modulos[i].vistas = suma;
                                    $scope.$digest();
                                } else {
                                    $scope.modulos[i].vistas = suma;
                                }
                            }
                        }
                    });
                });
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
//        function getModulosContratados(moduloArray) {
//            for (var i = 0; i < moduloArray.length; i++) {
//                var moduloId = moduloArray[i].moduloId;
//                var modulos;
//                moduloRef = db.collection('modulos').doc(moduloId);
//                moduloRef.get().then(function (doc) {
//                    var imagen;
//                    if (doc.data().imageURI === undefined) {
//                        imagen = "";
//                    } else {
//                        imagen = doc.data().imageURI;
//                    }
//                    modulos = {
//                        imageURI: imagen,
//                        nombre: doc.data().nombre,
//                        moduloId: doc.id
//                    };
//                    $scope.modulos.push(modulos);
//                    $scope.$digest();
//                }).catch(function (error) {
//                    console.log(error);
////                    $state.go('main.error-pagina-no-encontrada');
//                });
//                getVistasEmpleados(moduloId);
//                $scope.$digest();
//            }
//        }
        function getModulosContratados() {
            moduloRef = db.collection('modulos').where('moduloActivo', '==', 1);
            moduloRef.get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    var imagen;
                    if (doc.data().imageURI === undefined) {
                        imagen = "";
                    } else {
                        imagen = doc.data().imageURI;
                    }
                    modulos = {
                        imageURI: imagen,
                        nombre: doc.data().nombre,
                        moduloId: doc.id
                    };
                    $scope.modulos.push(modulos);
                    $scope.$digest();
                    getVistasEmpleados(doc.id);
                });
            });
            $scope.$digest();
        }
        getCliente(empresaId);
        $scope.irADetallePorVideo = function (moduloId) {
            $state.go('main.metricas-videos', {"empresaId": empresaId, "moduloId": moduloId});
        };
        $scope.irADetallePorEmpleado = function (moduloId) {
            $state.go('main.metricas-empleados', {"empresaId": empresaId, "moduloId": moduloId});
        };
    }
]);
angular.module('app').controller("MetricasVideosCtrl", [
    '$scope',
    '$state',
    '$stateParams',
    function ($scope, $state, $stateParams) {
        comprobarAuth();
        const [auth, db] = firebaseInit();
        var moduloId = $stateParams.moduloId;
        var empresaId = $stateParams.empresaId;
        $scope.videos = [];
        $scope.temporal = [];
        function getEmpresa(empresaId) {
            empresaRef = db.collection('empresas').doc(empresaId);
            empresaRef.get().then(function (doc) {
                $scope.empresa = doc.data();
                $scope.$digest();
                return true;
            }).catch(function (error) {
                console.log(error);
                $state.go('main.error-pagina-no-encontrada');
            });
        }
        function getModulo(moduloId) {
            moduloRef = db.collection('modulos').doc(moduloId);
            moduloRef.get().then(function (doc) {
                $scope.modulo = doc.data();
                $scope.$digest();
            }).catch(function (error) {
                $state.go('main.error-pagina-no-encontrada');
            });
        }
        function getVistasEmpleados(moduloId, empresaId) {
            var arrayVideosVistos;
            var empleadoId;
            empleadosRef = db.collection('empresas').doc(empresaId).collection('empleados');
            db.collection('empresas').doc(empresaId).collection('empleados').where("empleadoActivo", "==", 1).get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    empleadoId = doc.id;
                    db.collection('empresas').doc(empresaId).collection('empleados').doc(empleadoId).collection("videosVistos").where("moduloId", "==", moduloId).get().then(function (querySnapshot) {
                        querySnapshot.forEach(function (docVideo) {
                            arrayVideosVistos = {
                                vistas: docVideo.data().vistas,
                                videoId: docVideo.data().videoId,
                                moduloId: docVideo.data().moduloId
                            };
                            $scope.temporal.push(arrayVideosVistos);
                            $scope.$digest();
                        });
                        for (var i = 0; i < $scope.videos.length; i++) {
                            var vistasTotalesVideo = 0;
                            if ($scope.videos[i].vistas === undefined) {
                                $scope.videos[i].vistas = 0;
                            } else {
                                for (var k = 0; k < $scope.temporal.length; k++) {
                                    if ($scope.videos[i].videoId === $scope.temporal[k].videoId) {
                                        vistasTotalesVideo = vistasTotalesVideo + $scope.temporal[k].vistas;
                                        $scope.videos[i].vistas = vistasTotalesVideo;
                                        $scope.$digest();
                                    } else {
                                        $scope.videos[i].vistas = vistasTotalesVideo;
                                    }
                                }
                            }
                        }
                    });
                });
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
                $state.go('main.error-pagina-no-encontrada');
            });
        }
        function getVideosByModulo(moduloId) {
            var videos;
            db.collection('modulos').doc(moduloId).collection('videos').get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    videos = {
                        nombre: doc.data().nombre,
                        videoId: doc.id
                    };
                    $scope.videos.push(videos);
                    $scope.$digest();
                });
                for (var i = 0; i < $scope.videos.length; i++) {
                    if ($scope.videos[i].vistas === undefined) {
                        $scope.videos[i].vistas = 0;
                    }
                }
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
                $state.go('main.error-pagina-no-encontrada');
            });
        }
        getModulo(moduloId);
        getEmpresa(empresaId);
        getVideosByModulo(moduloId);
        getVistasEmpleados(moduloId, empresaId);
    }
]);
angular.module('app').controller("MetricasVideosEmpleadosCtrl", [
    '$scope',
    '$state',
    '$stateParams',
    function ($scope, $state, $stateParams) {
        comprobarAuth();
        const [auth, db] = firebaseInit();
        var moduloId = $stateParams.moduloId;
        var empresaId = $stateParams.empresaId;
        $scope.empleados = [];
        $scope.empresa = [];
        $scope.modulo = [];
        var empleado = [];
        function getEmpresaModulo(empresaId, moduloId) {
            db.collection('empresas').doc(empresaId).get().then(function (doc) {
                $scope.empresa = doc.data();
                $scope.$digest();
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
            db.collection('modulos').doc(moduloId).get().then(function (doc) {
                $scope.modulo = doc.data();
                $scope.$digest();
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
        function getEmpleadosEmpresa(empresaId) {
            db.collection('empresas').doc(empresaId).collection('empleados').where("empleadoActivo", "==", 1).get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    empleado = {
                        empleadoId: doc.id,
                        segundoApellido: doc.data().segundoApellido,
                        email: doc.data().email,
                        nombre: doc.data().nombre,
                        empleadoActivo: doc.data().empleadoActivo,
                        primerApellido: doc.data().primerApellido
                    };
                    $scope.empleados.push(empleado);
                    $scope.$digest();
                });
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
        getEmpresaModulo(empresaId, moduloId);
        getEmpleadosEmpresa(empresaId);
        $scope.verDetalleByEmpleado = function (empleadoId) {
            $state.go('main.metricas-empleado-modulo', {"empresaId": empresaId, "moduloId": moduloId, "empleadoId": empleadoId});
        };
    }
]);
angular.module('app').controller("MetricasByEmpleadoCtrl", [
    '$scope',
    '$state',
    '$stateParams',
    function ($scope, $state, $stateParams) {
        comprobarAuth();
        const [auth, db] = firebaseInit();
        var moduloId = $stateParams.moduloId;
        var empresaId = $stateParams.empresaId;
        var empleadoId = $stateParams.empleadoId;
        $scope.empleados = [];
        $scope.empresa = [];
        $scope.modulo = [];
        $scope.empleado = [];
        $scope.videos = [];
        function getEmpresaModulo(empresaId, moduloId) {
            db.collection('empresas').doc(empresaId).get().then(function (doc) {
                $scope.empresa = doc.data();
                $scope.$digest();
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
            db.collection('modulos').doc(moduloId).get().then(function (doc) {
                $scope.modulo = doc.data();
                $scope.$digest();
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
        function getEmpleado(empresaId, empleadoId) {
            db.collection('empresas').doc(empresaId).collection("empleados").doc(empleadoId).get().then(function (doc) {
                $scope.empleado = doc.data();
                $scope.$digest();
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
        function getVideosEmpleadoByModulo(empresaId, empleadoId, moduloId) {
            var video = [];
            db.collection('empresas').doc(empresaId).collection('empleados').doc(empleadoId).collection("videosVistos").get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    if (doc.data().moduloId === moduloId) {
                        db.collection('modulos').doc(moduloId).collection("videos").doc(doc.data().videoId).get().then(function (docVideo) {
                            if (docVideo.data().videoActivo === 1) {
                                video = {
                                    nombre: docVideo.data().nombre,
                                    videoId: doc.data().videoId,
                                    vistas: doc.data().vistas
                                };
                                $scope.videos.push(video);
                                $scope.$digest();
                            }

                        }).catch(function (error) {
                            console.log("Error getting cached document:", error);
                        });
                    }
                    $scope.$digest();
                });
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
        getEmpresaModulo(empresaId, moduloId);
        getEmpleado(empresaId, empleadoId);
        getVideosEmpleadoByModulo(empresaId, empleadoId, moduloId);
    }
]);
angular.module('app').controller("MetricasDescargaByModuloCtrl", [
    '$scope',
    '$state',
    '$stateParams',
    function ($scope, $state, $stateParams, SheetJSImportDirective) {
        comprobarAuth();
        const [auth, db] = firebaseInit();
        $scope.addModulo = [];
        $scope.addEmpresa = [];
//        var videosArray = [];
//        $scope.videosModulos = [];
        $scope.moduloAndVideo = [];
        var cabeceraModulos = [{Cabecera: "Metricas globales por módulos"}];
        var ws = XLSX.utils.json_to_sheet(cabeceraModulos, {header: ["Cabecera"], skipHeader: true, raw: true});
        var workbookModulos = XLSX.utils.book_new();
        var cabeceraEmpresas = [{Cabecera: "Metricas globales por empresas"}];
        var worksheetEmpresas = XLSX.utils.json_to_sheet(cabeceraEmpresas, {header: ["Cabecera"], skipHeader: true, raw: true});
        var workbookEmpresas = XLSX.utils.book_new();
        var contador = 0;
        var contadorEmpresas = 0;
        document.getElementById("button-descarga").style.display = "none";
        db.collection("modulos").where("moduloActivo", "==", 1).get().then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                contador++;
                var modulo = [{
                        nombre: doc.data().nombre,
                        vistas: 'Vistas',
                        likes: 'Likes',
                        dislikes: 'Dislikes'
                    }];
                var moduloAndVideo = [{
                        nombre: doc.data().nombre,
                        moduloId: doc.id
                    }];
                $scope.addModulo.push(modulo);
                $scope.moduloAndVideo.push(moduloAndVideo);
                addVideos(doc.id, contador);
            });
        }).catch(function (error) {
            console.log("Error getting documents: ", error);
        });
        function addVideos(moduloId, contador) {
            var suma = 0;
            db.collection("modulos").doc(moduloId).collection("videos").where("videoActivo", "!=", 3).get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    var video = {
                        nombre: doc.data().nombre,
                        vistas: doc.data().contadorVistas,
                        likes: doc.data().likes != undefined ? doc.data().likes : 0 ,
                        dislikes: doc.data().dislikes != undefined ? doc.data().dislikes : 0
                    };
                    var videoWithId = {
                        nombreVideo: doc.data().nombre,
                    };
                    suma = doc.data().contadorVistas + suma;
                    $scope.addModulo[contador - 1].push(video);
                    $scope.moduloAndVideo[contador - 1].push(videoWithId);
                });
                var totalVistas = {
                    nombre: "Total Vistas",
                    vistas: suma
                };
                $scope.addModulo[contador - 1].push(totalVistas);
            }).catch(function (error) {
                console.log("Error getting documents: ", error);
            });
        }
        function getModulosAndVideos() {
            db.collection("modulos").where("moduloActivo", "==", 1).get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                });
                $scope.$digest();
            }).catch(function (error) {
                console.log("Error getting documents: ", error);
            });
        }
        db.collection("empresas").where("clienteActivo", "==", 1).get().then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                contadorEmpresas++;
                var nombresModulos = [];
                var empresa = [[{nombre: doc.data().nombreEmpresa}]];
                var modulosContratados = doc.data().modulosContratados;
                $scope.addEmpresa.push(empresa);
                for (var i = 0; i < doc.data().modulosContratados.length; i++) {
                    nombresModulos.push([{moduloId: doc.data().modulosContratados[i].moduloId}]);
                    for (var k = 0; k < $scope.moduloAndVideo.length; k++) {
                        if (doc.data().modulosContratados[i].moduloId === $scope.moduloAndVideo[k][0].moduloId) {
                            for (var j = 0; j < nombresModulos.length; j++) {
                                if (nombresModulos[j][0].moduloId === $scope.moduloAndVideo[k][0].moduloId) {
//                                    delete nombresModulos[j][0].moduloId;
                                    nombresModulos[j].shift();
                                    nombresModulos[j].push([$scope.moduloAndVideo[k]]);
                                }
                            }
                        }
                    }
//                    addModulos(doc.data().modulosContratados[i].id, contadorEmpresas, modulosContratados);
                }
                empresa.splice(1, 0, nombresModulos);
//                console.log(empresa);
                $scope.$digest();
            });
        }).catch(function (error) {
            console.log("Error getting documents: ", error);
        });
        workbookModulos.Props = {
            Title: "METRICAS MODULOS VITAH",
            Subject: "METRICAS MODULOS VITAH"
        };
        workbookModulos.SheetNames.push("MODULOS");
        workbookEmpresas.Props = {
            Title: "METRICAS EMPRESAS VITAH",
            Subject: "METRICAS EMPRESAS VITAH"
        };
        workbookEmpresas.SheetNames.push("EMPRESAS");
//        var ws = XLSX.utils.json_to_sheet(ws_data);
//        wb.Sheets["Test Sheet"] = ws;
//        var wbout = XLSX.write(wb, {bookType: 'xlsx', type: 'binary'});
        function s2ab(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i < s.length; i++)
                view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }
        $scope.descargarMetricasModulos = function () {
//            var ws = XLSX.utils.json_to_sheet(ws_data);
            /* Initial row */

            /* Write data starting at A2 */
//            XLSX.utils.sheet_add_json(ws, json2, {skipHeader: true, origin: "A2"});
//            /* Write data starting at E2 */
//            XLSX.utils.sheet_add_json(ws, json3, {skipHeader: true, origin: {r: 1, c: 4}, header: ["A", "B", "C"]});
//            /* Append row */
//            XLSX.utils.sheet_add_json(ws, json4, {header: ["A", "B", "C", "D", "E", "F", "G"], skipHeader: true, origin: -1});
            if (!ws['!cols'])
                ws['!cols'] = [];
//            if (!ws['!cols'][1])
//                ws['!cols'][1] = {};
            for (var i = 0; i < $scope.addModulo.length; i++) {
                var n = i;
                var recorrer = 0 + n + n;
                XLSX.utils.sheet_add_json(ws, $scope.addModulo[i], {skipHeader: true, origin: {r: 3, c: recorrer + i}});
//            ws['!cols'][1].hidden = true;
                ws["!cols"].push({wpx: 300, s: {font: {bold: true}}}, {wpx: 100}, {wpx: 50}, );
            }
            workbookModulos.Sheets["MODULOS"] = ws;
            var wbout = XLSX.write(workbookModulos, {bookType: 'xlsx', type: 'binary', cellStyles: true});
            saveAs(new Blob([s2ab(wbout)], {type: "application/octet-stream"}), 'METRICAS MODULOS VHO.xlsx');
        };
//        var jsonForExcel = [];
//        function crearJSON(empresas) {
//            for (var i = 0; i < empresas.length; i++) {
//                var empresa = {
//                    nombreEmpresa: empresas[i].nombreEmpresa,
//                    empleados: []
//                };
//                jsonForExcel.push(empresa);
//                for (var k = 0; k < empresas[i].empleado.length; k++) {
//                    var empleado = {
//                        nombre: empresas[i].empleado[k].nombreEmpleado,
//                        primerApellido: empresas[i].empleado[k].primerApellido,
//                        segundoApellido: empresas[i].empleado[k].segundoApellido,
//                        email: empresas[i].empleado[k].email,
//                        videosVistos: []
//                    };
//                    jsonForExcel[i].empleados.push(empleado);
//                    for (var q = 0; q < empresas[i].empleado[k].videos.length; q++) {
////                        var videosVistos = getVideos(empresas[i].empleado[k].videos[q], empresa[i].modulos);
//                        getVideos(empresas[i].empleado[k].videos[q], empresas[i].modulos, jsonForExcel[i].empleados[k].videosVistos);
//                    }
//                }
//            }
//            console.log(jsonForExcel);
//        }
//        function getVideos(video, modulos, array) {
//            for (var i = 0; i < modulos.length; i++) {
//                if (video.moduloId === modulos[i].moduloId) {
//                    for (var k = 0; k < modulos[i].videos.length; k++) {
//                        if (video.videoId === modulos[i].videos[k].videoId) {
//                            var videoVisto = {
//                                nombreModulo: modulos[i].nombreModulo,
//                                nombreVideo: modulos[i].videos[k].nombreVideo,
//                                vistas: video.vistas
//                            };
//                            array.push(videoVisto);
//                        }
//                    }
//                }
////                console.log(modulos[i]);
//
//            }
//        }

//        var json_vitah = [];
        // Le mando un objeto empresa para recuperar unos datos de los empleados
        function get_arreglo_para_excel(objeto_empresa) {
            var datos_excel = []; // arreglo que almacenara los objetos con los datos de los empleado
            var empleados = get_empleados_data(objeto_empresa);
            var modulosContratadosByEmpresa = get_modulos_data(objeto_empresa);
            var empresa = {};
            empresa.nombreEmpresa = objeto_empresa.nombreEmpresa;
            var modulos = {};
            datos_excel.push(empresa);
            var modulosContratados = [];
            for (var k = 0; k < modulosContratadosByEmpresa.length; k++) {
                var moduloContratado = {};
                moduloContratado.nombreModulo = modulosContratadosByEmpresa[k].nombreModulo;
                moduloContratado.videos = [];
                for (var q = 0; q < modulosContratadosByEmpresa[k].videos.length; q++) {
                    var video = {};
                    video.nombreVideo = modulosContratadosByEmpresa[k].videos[q].nombreVideo;
                    moduloContratado.videos.push(video);
//                    for (var m = 0; m < empleados.length; m++) {
//                        var visto = getVideosVistos(modulosContratadosByEmpresa[k].moduloId, modulosContratadosByEmpresa[k].videos[q].videoId, empleados[m]);
//                        if (visto !== false) {
//                            moduloVistoByEmpleado.vista = visto;
//                        }
//                    }
                }
                modulosContratados.push(moduloContratado);
//                modulosVistosByEmpleado.push(moduloVistoByEmpleado);
            }
            modulos.modulosContratados = modulosContratados;
            datos_excel.push(modulos);
            for (var i = 0; i < empleados.length; i++) {
                var empleado = {};
                empleado.nombreEmpleado = empleados[i].nombreEmpleado;
                empleado.primerApellido = empleados[i].primerApellido;
                empleado.segundoApellido = empleados[i].segundoApellido;
                empleado.email = empleados[i].email;
                empleado.videosVistas = getvideosVistosByEmpleado(empleados[i], modulosContratadosByEmpresa);
                datos_excel.push(empleado);
            }
            getContadorVideosVistosByEmpleado(empleados, modulosContratadosByEmpresa);
//                empresa.totalVistas = getContadorVideosVistosByEmpleado(empleados, modulosContratadosByEmpresa);
            return datos_excel;
        }
        function getvideosVistosByEmpleado(empleado, modulosContratadosByEmpresa) {
            var videosVistos = [];
            for (var i = 0; i < modulosContratadosByEmpresa.length; i++) {
                var modulos = {};
                modulos.videos = [];
                for (var k = 0; k < modulosContratadosByEmpresa[i].videos.length; k++) {
                    let obj = empleado.videos.find(o => o.videoId === modulosContratadosByEmpresa[i].videos[k].videoId);
                    if (obj === undefined) {
                        obj = 0;
                        video = {
                            vistas: obj
                        };
                        modulos.videos.push(video);
                    } else {
                        video = {
                            vistas: obj.vistas
                        };
                        modulos.videos.push(video);
                    }
                }
                videosVistos.push(modulos);
            }
            return videosVistos;
        }

        // esta funcion devuelve solo los empleados de un objeto empresa

        // aqui es el arreglo que se manda para hacer el excel en tu caso seria $scope.data
        var dataEmpleadosMetricas = [];
        $scope.descargarTable = function () {
            var d = 2;
            var val = 2;
            for (var k = 0; k < $scope.empresas.length; k++) {
                dataEmpleadosMetricas.push(get_arreglo_para_excel($scope.empresas[k]));
            }
            console.log(dataEmpleadosMetricas);
            var row = 0;
            var rowVistas = 2;
            for (var i = 0; i < dataEmpleadosMetricas.length; i++) {
                var colVideos = 6;
                if (i === 0) {
//                    var nombreSheet = data[i].nombreEmpresa;
                    var ws = XLSX.utils.json_to_sheet(dataEmpleadosMetricas[0], {skipHeader: true, origin: {r: 0, c: 0}});
                    XLSX.utils.json_to_sheet(dataEmpleadosMetricas[0], {skipHeader: true, origin: {r: 0, c: 0}});
                } else {
                    XLSX.utils.sheet_add_json(ws, dataEmpleadosMetricas[i], {skipHeader: true, origin: {r: row, c: 0}});
//                    for (var m = 0; m < data[i].length; m++) {
//                        console.log(data[i][m].videosVistas);
//                    }
                }
                for (var m = 0; m < dataEmpleadosMetricas[i].length; m++) {
                    if (dataEmpleadosMetricas[i][m].videosVistas !== undefined) {
                        var videosVistas = 6;
                        for (var t = 0; t < dataEmpleadosMetricas[i][m].videosVistas.length; t++) {
                            var sumaVistas = 0;
                            for (var y = 0; y < dataEmpleadosMetricas[i][m].videosVistas[t].videos.length; y++) {
                                vistas = dataEmpleadosMetricas[i][m].videosVistas[t].videos[y].vistas;
                                sumaVistas = sumaVistas + vistas;
                                XLSX.utils.sheet_add_aoa(ws, [[vistas]], {skipHeader: true, origin: {r: rowVistas, c: videosVistas}});
                                videosVistas = videosVistas + 1;
                            }
                            XLSX.utils.sheet_add_aoa(ws, [[sumaVistas]], {skipHeader: true, origin: {r: rowVistas, c: videosVistas}});
                            videosVistas = videosVistas + 1;
                        }
                        rowVistas = rowVistas + 1;
                        console.log("fin empleado");
                    }
                }
                for (var j = 0; j < dataEmpleadosMetricas[i].length; j++) {
                    if (dataEmpleadosMetricas[i][j].modulosContratados !== undefined) {
                        for (var h = 0; h < dataEmpleadosMetricas[i][j].modulosContratados.length; h++) {
                            var nombreModulo = dataEmpleadosMetricas[i][j].modulosContratados[h].nombreModulo;
                            XLSX.utils.sheet_add_aoa(ws, [[nombreModulo]], {skipHeader: true, origin: {r: row, c: colVideos}});
                            for (var n = 0; n < dataEmpleadosMetricas[i][j].modulosContratados[h].videos.length; n++) {
                                nombreVideo = dataEmpleadosMetricas[i][j].modulosContratados[h].videos[n].nombreVideo;
                                XLSX.utils.sheet_add_aoa(ws, [[nombreVideo]], {skipHeader: true, origin: {r: row + 1, c: colVideos}});
                                if (dataEmpleadosMetricas[i][j].modulosContratados[h].videos.length - 1 === n) {
                                    colVideos = colVideos + 2;
                                } else {
                                    colVideos = colVideos + 1;
                                }
                            }
                            XLSX.utils.sheet_add_aoa(ws, [["Total Vistas"]], {skipHeader: true, origin: {r: row + 1, c: colVideos - 1}});
                        }
                    }
                }
                row = row + dataEmpleadosMetricas[i].length + 5;
                rowVistas = rowVistas + 7;
                d = dataEmpleadosMetricas[i].length - 2 + d;
                for (var p = val; p < d; p++) {
                    if (!ws['!rows'])
                        ws['!rows'] = [];
                    if (!ws['!rows'][p])
                        ws['!rows'][p] = {};
                    ws['!rows'][p].level = 1;
                }
                val = d + 7;
                d = d + 7;
            }


            /* generate a worksheet */

            /* add to workbook */
//            if (!ws['!rows'])
//                ws['!rows'] = [];
//            if (!ws['!rows'][1])
//                ws['!rows'][1] = {};
//            if (!ws['!rows'][2])
//                ws['!rows'][2] = {};
//            if (!ws['!rows'][3])
//                ws['!rows'][3] = {};
//            if (!ws['!rows'][4])
//                ws['!rows'][4] = {};
//            if (!ws['!rows'][5])
//                ws['!rows'][5] = {};
//            ws['!rows'][1].level = 1;
//            ws['!rows'][2].level = 1;
//            ws['!rows'][3].level = 1;
//            ws['!rows'][4].level = 1;
//            ws['!rows'][5].level = 1;
//            
//            
//            var range = {s: {c: 0, r: 0}, e: {c: 0, r: 4}};//A1:A5
//            var dataRange = [];
//            /* Iterate through each element in the structure */
//            for (var R = range.s.r; R <= range.e.r; ++R) {
//                for (var C = range.s.c; C <= range.e.c; ++C) {
//                    var cell_address = {c: C, r: R};
//                    var data = XLSX.utils.encode_cell(cell_address);
//                    dataRange.push(ws[data]);
//                }
//            }
//            
//            cell123 = ws[colName(6) + 3].v + ws[colName(6) + 4].v + ws[colName(6) + 5].v;
////            cell = {t: 'n', v: ws[colName(6) + 3].v + ws[colName(6) + 4].v + ws[colName(6) + 5].v, f: {s: {c: 6, r: 3}, e: {c: 6, r: 6}}};
//            cell = {t: 'n', v: cell123, f: {s: {c: 6, r: 3}, e: {c: 6, r: 6}}};
//            cellRef = XLSX.utils.encode_cell({
//                c: 6,
//                r: 16
//            });
//            ws[cellRef] = cell;
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "EMPRESAS");
            /* write workbook and force a download */
            XLSX.writeFile(wb, "METRICAS EMPRESAS VHO.xlsx");
        };

        var dataEmpleadosMetricas = [];
        $scope.descargarMetricas = function () {
//            var row = 0;
            for (var k = 0; k < $scope.empresas.length; k++) {
                dataEmpleadosMetricas.push(get_arreglo_para_excel_metricas_empresas($scope.empresas[k]));
            }
            var columnaEncabezado = 0;
            var columnaModulo = 6;
            var columnaModuloVideo = 6;
            var rowListaEmpleados = 3;
            var rowVistas = 3;
            var encabezado = ["Empresa", "Nombre", "Apellido paterno", "Apellido materno", "Email"];
            for (var r = 0; r < encabezado.length; r++) {
                if (r === 0) {
                    var ws = XLSX.utils.aoa_to_sheet([[encabezado[0]]], {origin: {r: 2, c: columnaEncabezado}});
                } else {
                    XLSX.utils.sheet_add_aoa(ws, [[encabezado[r]]], {origin: {r: 2, c: columnaEncabezado}});
                }
                columnaEncabezado = columnaEncabezado + 1;
            }
            var modulos = [];
//            for (var f = 0; f < dataEmpleados.length; f++) {
//            XLSX.utils.sheet_add_json(ws, dataEmpleados[0], {skipHeader: true, origin: {r: rowListaEmpleados, c: 0}});
//            rowListaEmpleados = rowListaEmpleados + dataEmpleados[0].length;
            for (var b = 0; b < dataEmpleadosMetricas[0].length; b++) {
                if (b === dataEmpleadosMetricas[0].length - 1) {
                    for (var v = 0; v < dataEmpleadosMetricas[0][b].modulosContratados.length; v++) {
                        modulos.push(dataEmpleadosMetricas[0][b].modulosContratados[v]);
                    }
                }
            }
            for (var x = 0; x < modulos.length; x++) {
                XLSX.utils.sheet_add_aoa(ws, [[modulos[x].nombreModulo]], {origin: {r: 1, c: columnaModulo}});
                console.log(modulos[x]);
                for (var m = 0; m < modulos[x].videos.length; m++) {
                    XLSX.utils.sheet_add_aoa(ws, [[modulos[x].videos[m].nombreVideo]], {origin: {r: 2, c: columnaModuloVideo}});
                    columnaModuloVideo = columnaModuloVideo + 1;

                }
                XLSX.utils.sheet_add_aoa(ws, [["Total Vistas"]], {skipHeader: true, origin: {r: 2, c: columnaModuloVideo}});
                if (m === modulos[x].videos.length - 1) {
                    columnaModuloVideo = columnaModuloVideo + 2;
                } else {
                    columnaModuloVideo = columnaModuloVideo + 1;
                }
                columnaModulo = columnaModulo + modulos[x].videos.length + 1;
            }
//            }
//            for (var n = 0; n < $scope.addModulo.length; n++) {
//                modulos.push($scope.addModulo[n][0].nombre);
//                XLSX.utils.sheet_add_aoa(ws, [[$scope.addModulo[n][0].nombre]], {origin: {r: 1, c: columnaModulo}});
//                for (var m = 1; m < $scope.addModulo[n].length; m++) {
//                    XLSX.utils.sheet_add_aoa(ws, [[$scope.addModulo[n][m].nombre]], {origin: {r: 2, c: columnaModuloVideo}});
//                    columnaModuloVideo = columnaModuloVideo + 1;
//                }
//                columnaModulo = columnaModulo + $scope.addModulo[n].length - 1;
//            }
//            for (var n = 0; n < $scope.addModulo.length; n++) {
//                modulos.push($scope.addModulo[n][0].nombre);
//                XLSX.utils.sheet_add_aoa(ws, [[$scope.addModulo[n][0].nombre]], {origin: {r: 1, c: columnaModulo}});
//                for (var m = 1; m < $scope.addModulo[n].length; m++) {
//                    XLSX.utils.sheet_add_aoa(ws, [[$scope.addModulo[n][m].nombre]], {origin: {r: 2, c: columnaModuloVideo}});
//                    columnaModuloVideo = columnaModuloVideo + 1;
//                }
//                columnaModulo = columnaModulo + $scope.addModulo[n].length - 1;
//            }
            for (var i = 0; i < dataEmpleadosMetricas.length; i++) {
                XLSX.utils.sheet_add_json(ws, dataEmpleadosMetricas[i], {skipHeader: true, origin: {r: rowListaEmpleados, c: 0}});
                rowListaEmpleados = rowListaEmpleados + dataEmpleadosMetricas[i].length - 1;
                for (var g = 0; g < dataEmpleadosMetricas[i].length; g++) {
                    if (dataEmpleadosMetricas[i][g].videosVistas !== undefined) {
                        var videosVistas = 6;
                        for (var t = 0; t < dataEmpleadosMetricas[i][g].videosVistas.length; t++) {
                            var sumaVistas = 0;
                            for (var y = 0; y < dataEmpleadosMetricas[i][g].videosVistas[t].videos.length; y++) {
                                vistas = dataEmpleadosMetricas[i][g].videosVistas[t].videos[y].vistas;
                                sumaVistas = sumaVistas + vistas;
                                XLSX.utils.sheet_add_aoa(ws, [[vistas]], {skipHeader: true, origin: {r: rowVistas, c: videosVistas}});
                                videosVistas = videosVistas + 1;
                            }
                            XLSX.utils.sheet_add_aoa(ws, [[sumaVistas]], {skipHeader: true, origin: {r: rowVistas, c: videosVistas}});
                            videosVistas = videosVistas + 1;
                        }
                        rowVistas = rowVistas + 1;
                    }
                }

            }
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "EMPRESAS");
            /* write workbook and force a download */
            XLSX.writeFile(wb, "METRICAS EMPRESAS VHO.xlsx");
            dataEmpleadosMetricas = [];
        };
        var dataEmpleados = [];
        $scope.descargarInformacionEmpleados = function () {
            for (var k = 0; k < $scope.empresas.length; k++) {
                dataEmpleados.push(get_arreglo_para_excel_datos_empleados($scope.empleadosDatos[k]));
            }
            var columnaEncabezado = 0;
            var rowListaEmpleados = 1;
            var encabezado = ["Empresa", "Nombre", "Apellido paterno", "Apellido materno", "Email", "Teléfono", "Fecha Nacimiento"];
            for (var r = 0; r < encabezado.length; r++) {
                if (r === 0) {
                    var ws = XLSX.utils.aoa_to_sheet([[encabezado[0]]], {origin: {r: 0, c: columnaEncabezado}});

                } else {
                    XLSX.utils.sheet_add_aoa(ws, [[encabezado[r]]], {origin: {r: 0, c: columnaEncabezado}});
                }
                if (!ws['!cols'])
                    ws['!cols'] = [];
                ws["!cols"].push({wpx: 200});
                columnaEncabezado = columnaEncabezado + 1;
            }
            for (var i = 0; i < dataEmpleados.length; i++) {
                XLSX.utils.sheet_add_json(ws, dataEmpleados[i], {skipHeader: true, origin: {r: rowListaEmpleados, c: 0}});
                rowListaEmpleados = rowListaEmpleados + dataEmpleados[i].length;
            }

            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "EMPLEADOS");
            /* write workbook and force a download */
            XLSX.writeFile(wb, "DATOS EMPLEADOS VHO.xlsx");
            dataEmpleados = [];
        };
        function getContadorVideosVistosByEmpleado(empleado, modulosContratados) {
            var videosVistos = [];
            for (var n = 0; n < $scope.addModulo.length; n++) {
                var ModulosContratadosArray = modulosContratados.find(o => o.nombreModulo === $scope.addModulo[n][0].nombre);
                if (ModulosContratadosArray === undefined) {
                    var modulo = {};
                    modulo.nombreModulo = $scope.addModulo[n][0].nombre;
                    modulo.videos = [];
                    for (var l = 1; l < $scope.addModulo[n].length; l++) {
                        if (l < $scope.addModulo[n].length - 1) {
                            var video = {
                                nombreVideo: $scope.addModulo[n][l].nombre
                            };
                            modulo.videos.push(video);
                        }
                    }
                    modulosContratados.push(modulo);
                }
            }
            for (var i = 0; i < modulosContratados.length; i++) {
                var modulos = {};
                modulos.videos = [];
                for (var k = 0; k < modulosContratados[i].videos.length; k++) {
                    let obj = empleado.videos.find(o => o.videoId === modulosContratados[i].videos[k].videoId);
//                        let obj = empleado.videos.find(o => o.videoId === $scope.addModulo[n][k].videoId);
                    if (obj === undefined) {
                        obj = 0;
                        video = {
                            vistas: obj
                        };
                        modulos.videos.push(video);
                    } else {
                        video = {
                            vistas: obj.vistas
                        };
                        modulos.videos.push(video);
                    }
                }
                videosVistos.push(modulos);
            }
            var videosVistosA = videosVistos;
            var modulos = modulosContratados;
            return [videosVistosA, modulos];
        }
        function get_arreglo_para_excel_metricas_empresas(objeto_empresa) {
            var datos_excel = []; // arreglo que almacenara los objetos con los datos de los empleado
            var empleados = get_empleados_data(objeto_empresa);
            var modulosContratadosByEmpresa = get_modulos_data(objeto_empresa);
            var modulos = {};
            var modulosContratados = [];
            for (var k = 0; k < modulosContratadosByEmpresa.length; k++) {
                var moduloContratado = {};
                moduloContratado.nombreModulo = modulosContratadosByEmpresa[k].nombreModulo;
                moduloContratado.videos = [];
                for (var q = 0; q < modulosContratadosByEmpresa[k].videos.length; q++) {
                    var video = {};
                    video.nombreVideo = modulosContratadosByEmpresa[k].videos[q].nombreVideo;
                    moduloContratado.videos.push(video);
                }
                modulosContratados.push(moduloContratado);
            }
            for (var i = 0; i < empleados.length; i++) {
                var empleado = {};
                empleado.empresa = objeto_empresa.nombreEmpresa;
                empleado.nombreEmpleado = empleados[i].nombreEmpleado;
                empleado.primerApellido = empleados[i].primerApellido;
                empleado.segundoApellido = empleados[i].segundoApellido;
                empleado.email = empleados[i].email;
                var [videosVistas, modulosContratados] = getContadorVideosVistosByEmpleado(empleados[i], modulosContratadosByEmpresa);
                empleado.videosVistas = videosVistas;
                modulos.modulosContratados = modulosContratados;
                datos_excel.push(empleado);
            }
            datos_excel.push(modulos);
            return datos_excel;
        }
        function getvideosVistosByEmpleado(empleado, modulosContratadosByEmpresa) {
            var videosVistos = [];
            for (var i = 0; i < modulosContratadosByEmpresa.length; i++) {
                var modulos = {};
                modulos.videos = [];
                for (var k = 0; k < modulosContratadosByEmpresa[i].videos.length; k++) {
                    let obj = empleado.videos.find(o => o.videoId === modulosContratadosByEmpresa[i].videos[k].videoId);
                    if (obj === undefined) {
                        obj = 0;
                        video = {
                            vistas: obj
                        };
                        modulos.videos.push(video);
                    } else {
                        video = {
                            vistas: obj.vistas
                        };
                        modulos.videos.push(video);
                    }
                }
                videosVistos.push(modulos);
            }
            return videosVistos;
        }
        function get_arreglo_para_excel_datos_empleados(objeto_empresa) {
            var datos_excel = []; // arreglo que almacenara los objetos con los datos de los empleado
            var empleados = get_empleados_data(objeto_empresa);
            for (var i = 0; i < empleados.length; i++) {
                var empleado = {};
                empleado.empresa = objeto_empresa.nombreEmpresa;
                empleado.nombreEmpleado = empleados[i].nombreEmpleado;
                empleado.primerApellido = empleados[i].primerApellido;
                empleado.segundoApellido = empleados[i].segundoApellido;
                empleado.email = empleados[i].email;
                empleado.telefono = empleados[i].telefono;
                empleado.fechaNacimiento = empleados[i].fechaNacimiento;
                datos_excel.push(empleado);
            }
            return datos_excel;
        }
        function getvideosVistosByEmpleado(empleado, modulosContratadosByEmpresa) {
            var videosVistos = [];
            for (var i = 0; i < modulosContratadosByEmpresa.length; i++) {
                var modulos = {};
                modulos.videos = [];
                for (var k = 0; k < modulosContratadosByEmpresa[i].videos.length; k++) {
                    let obj = empleado.videos.find(o => o.videoId === modulosContratadosByEmpresa[i].videos[k].videoId);
                    if (obj === undefined) {
                        obj = 0;
                        video = {
                            vistas: obj
                        };
                        modulos.videos.push(video);
                    } else {
                        video = {
                            vistas: obj.vistas
                        };
                        modulos.videos.push(video);
                    }
                }
                videosVistos.push(modulos);
            }
            return videosVistos;
        }
        function get_empleados_data(objeto_empresa) {
            return objeto_empresa.empleado;
        }
        function get_modulos_data(objeto_empresa) {
            return objeto_empresa.modulos;
        }
        function colName(n) {
            var ordA = 'A'.charCodeAt(0);
            var ordZ = 'Z'.charCodeAt(0);
            var len = ordZ - ordA + 1;

            var s = "";
            while (n >= 0) {
                s = String.fromCharCode(n % len + ordA) + s;
                n = Math.floor(n / len) - 1;
            }
            return s;
        }

        $scope.empresas = [];
        $scope.empleadosDatos = [];
        $scope.empleados = [];
        db.collection("empresas").where("clienteActivo", "==", 1).get().then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                var empresa = {
                    nombreEmpresa: doc.data().nombreEmpresa,
                    empresaId: doc.id,
                    modulosContratados: doc.data().modulosContratados,
                    empleado: [],
                    modulos: [
                    ]
                };
                var empresaEmpleados = {
                    nombreEmpresa: doc.data().nombreEmpresa,
                    empresaId: doc.id,
                    empleado: []
                };
                $scope.empresas.push(empresa);
                $scope.empleadosDatos.push(empresaEmpleados);
                $scope.$digest();
            });
            for (var i = 0; i < $scope.empresas.length; i++) {
                getEmpleados($scope.empresas[i], $scope.empleadosDatos[i]);
                getModulosAndVideos($scope.empresas[i], i);
//                getVideosByEmpleado($scope.empresas[i]);
            }
            document.getElementById("button-descarga").style.display = "block";
            $scope.$digest();
        }).catch(function (error) {
            console.log("Error getting documents: ", error);
        });
        function getEmpleados(empresa, empleadosDatos) {
            db.collection("empresas").doc(empresa.empresaId).collection("empleados").where("empleadoActivo", "==", 1).get().then(function (querySnapshot) {
                querySnapshot.forEach(function (docEmpleado) {
                    var dataEmpleado = {
                        empleadoId: docEmpleado.id,
                        nombreEmpleado: docEmpleado.data().nombre,
                        primerApellido: docEmpleado.data().primerApellido,
                        segundoApellido: docEmpleado.data().segundoApellido,
                        email: docEmpleado.data().email,
                        videos: []
                    };
                    var dataEmpleadoExcel = {
                        empleadoId: docEmpleado.id,
                        nombreEmpleado: docEmpleado.data().nombre,
                        primerApellido: docEmpleado.data().primerApellido,
                        segundoApellido: docEmpleado.data().segundoApellido,
                        email: docEmpleado.data().email,
                        fechaNacimiento: docEmpleado.data().fechaNacimiento,
                        telefono: docEmpleado.data().telefono,
                        videos: []
                    };
                    empleadosDatos.empleado.push(dataEmpleadoExcel);
                    empresa.empleado.push(dataEmpleado);
//                    empresasExcel.empleado.push(dataEmpleadoExcel);
                    $scope.$digest();
                    db.collection("empresas").doc(empresa.empresaId).collection("empleados").doc(docEmpleado.id).collection("videosVistos").get().then(function (querySnapshot) {
                        querySnapshot.forEach(function (docEmpleadoVideos) {
                            var videoVisto = {
                                moduloId: docEmpleadoVideos.data().moduloId,
                                videoId: docEmpleadoVideos.data().videoId,
                                vistas: docEmpleadoVideos.data().vistas
                            };
                            for (var k = 0; k < empresa.empleado.length; k++) {
                                if (docEmpleado.id === empresa.empleado[k].empleadoId) {
                                    empresa.empleado[k].videos.push(videoVisto);
                                }
                            }
                            $scope.$digest();
                        });
                    }).catch(function (error) {
                        console.log("Error getting documents: ", error);
                    });
                });
            }).catch(function (error) {
                console.log("Error getting documents: ", error);
            });
        }
        function getModulosAndVideos(empresa, contador) {
            for (var i = 0; i < empresa.modulosContratados.length; i++) {
                db.collection("modulos").doc(empresa.modulosContratados[i].moduloId).get().then(function (docModulo) {
                    if (docModulo.data().moduloActivo === 1) {
                        var nombreModulo = {
                            nombreModulo: docModulo.data().nombre,
                            moduloId: docModulo.id,
                            videos: []
                        };
                        empresa.modulos.push(nombreModulo);
                    }
                    $scope.$digest();
                    var video = [];
                    db.collection("modulos").doc(docModulo.id).collection("videos").where("videoActivo", "!=", 3).get().then(function (querySnapshot) {
                        querySnapshot.forEach(function (docVideo) {
                            video = {
                                nombreVideo: docVideo.data().nombre,
                                videoId: docVideo.id
                            };
                            for (var k = 0; k < empresa.modulos.length; k++) {
                                if (docModulo.id === empresa.modulos[k].moduloId) {
                                    empresa.modulos[k].videos.push(video);
                                }
                            }
                            $scope.$digest();
                        });
                    }).catch(function (error) {
                        console.log("Error getting documents: ", error);
                    });
                }).catch(function (error) {
                    console.log("Error getting documents: ", error);
                });
            }
        }
    }
]);
