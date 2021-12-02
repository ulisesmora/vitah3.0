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
    const storage = firebase.storage().ref();
    return [auth, db, storage];
}
function comprobarAuth() {
    const [auth, db] = firebaseInit();
    auth.onAuthStateChanged(user => {
        if (user) {
            user.getIdTokenResult().then(idTokenResult => {
                user.admin = idTokenResult.claims.adminPrimario;
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
angular.module('app').controller("AgregarModuloCtrl", [
    '$scope',
    '$state',
    'Upload',
    '$timeout',
    function ($scope, $state, Upload, $timeout) {
        comprobarAuth();
        const [auth, db, storage] = firebaseInit();
        $scope.modulo;
//        $scope.video = {files:""};
        $scope.video;
        $scope.videosAgregados = [];
        document.getElementById("datos-modulo").style.display = "block";
        document.getElementById("datos-video").style.display = "none";
        $scope.file_producto = {file: "", subir_archivo: true};
        function evaluarCampo(valor, mensaje) {
            if (valor === "" || valor === undefined || valor.length === 0 || valor === null) {
                new Noty({
                    type: 'error',
                    layout: 'center',
                    text: 'El campo ' + mensaje + ' no puede ir vacio'
                }).show().setTimeout(3000);
                return false;
            } else {
                return true;
            }
        }
        function agregarImagen(idImagen, direccionBD, moduloId) {
            var file = document.querySelector(idImagen).files[0];
            if (file === undefined) {
                imageURL = "";
                direccionBD.set({
                    imageURI: imageURL
                }, {merge: true});
            } else if (file !== undefined) {
                const metadata = {
                    contentType: file.type
                };
                const task = storage.child("modulos/" + moduloId + "/perfil/" + moduloId).put(file, metadata);
                task.then(snapshot => snapshot.ref.getDownloadURL()).then(url => {
                    const image = document.querySelector('#image');
                    imageURL = url;
                    direccionBD.set({
                        imageURI: imageURL
                    }, {merge: true});
                    $scope.$digest();
                }).catch(function (error) {
                    console.error("Error adding document: ", error);
                });
            }
        }
        function addURL(archivoId, task, videoId, direccionBD) {
            console.log(archivoId);
            task.then(snapshot => snapshot.ref.getDownloadURL()).then(url => {
                imageURL = url;
                direccionBD.collection('videos').doc(videoId).collection('archivosDescargables').doc(archivoId).set({
                    archivoDescargable: imageURL
                }, {merge: true});
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
        function agregarArchivo(arrayVideos, direccionBD, moduloId, videoDB, videoId) {
            for (var i = 0; i < arrayVideos.length; i++) {
                if ((videoDB.nombre === arrayVideos[i].nombreVideo) && (videoDB.link === arrayVideos[i].linkVideo)) {
                    if (arrayVideos[i].files === undefined) {
                        imageURL = "";
                        direccionBD.collection('videos').doc(videoId).set({
                            archivoDescargable: 2
                        }, {merge: true});
                    } else if (arrayVideos[i].files !== undefined) {
                        for (var k = 0; k < arrayVideos[i].files.length; k++) {
                            var nombreArray = arrayVideos[i].files[k].name.split(".");
                            const metadata = {
                                contentType: arrayVideos[i].files[k].type
                            };
                            const task = storage.child("modulos/" + moduloId + "/archivos_descargables/" + videoId + "/" + nombreArray[0]).put(arrayVideos[i].files[k], metadata);
                            var nombre = nombreArray[0];
                            direccionBD.collection('videos').doc(videoId).collection('archivosDescargables').add({
                                nombreArchivo: nombre
                            }).then(function (docVideoRef) {
                                direccionBD.collection('videos').doc(videoId).collection('archivosDescargables').doc(docVideoRef.id).set({
                                    id: docVideoRef.id
                                }, {merge: true});
                                addURL(docVideoRef.id, task, videoId, direccionBD);
                            }).catch(function (error) {
                                console.error("Error adding document: ", error);
                            });
                            $scope.$digest();
                        }
                        direccionBD.collection('videos').doc(videoId).set({
                            archivoDescargable: 1
                        }, {merge: true});
//                        var n = new Noty({
//                            text: 'Archivos agregados con éxito',
//                            layout: 'center',
//                            buttons: [
//                                Noty.button('Aceptar', 'btn btn-primary', function () {
//                                    window.location.reload(false);
//                                    n.close();
//                                })
//                            ]
//                        });
//                        n.show();
                    }
                }
            }
        }
        $scope.fileProductoUpload = function (files) {
            $scope.files = files;
        };
        $scope.irAVideos = function (nombreModulo) {
            if (evaluarCampo(nombreModulo, 'Nombre del módulo') === true) {
                document.getElementById("datos-modulo").style.display = "none";
                document.getElementById("datos-video").style.display = "block";
            }
        };
        $scope.atras = function (mostrar, ocultar) {
            document.getElementById(mostrar).style.display = "block";
            document.getElementById(ocultar).style.display = "none";
        };
        $scope.agregarVideo = function (video, files) {
            if (video === undefined) {
                new Noty({
                    type: 'error',
                    layout: 'center',
                    text: 'Debes agregar todos los campos obligatorios'
                }).show().setTimeout(3000);
            } else if (((evaluarCampo(video.nombreVideo, 'Nombre del video') && evaluarCampo(video.linkVideo, 'link del video')) === true)) {
                $scope.videosAgregados.push(angular.copy(video));
                var index = $scope.videosAgregados.length - 1;
                $scope.videosAgregados[index].files = files;
                $scope.video = undefined;
                $scope.files = undefined;
            }
        };
        $scope.eliminarVideo = function (video) {
            for (var i = 0; i < $scope.videosAgregados.length; i++) {
                if (video.nombreVideo === $scope.videosAgregados[i].nombreVideo) {
                    $scope.videosAgregados.splice(i, 1);
                }
            }
        };

        $scope.activeVideo = function(video) {
            console.log("el video",video)
        }


        $scope.crearModulo = function (modulo, videos) {
            if (modulo.descripcionModulo === undefined) {
                modulo.descripcionModulo = "";
            }
            if ((evaluarCampo(modulo.nombreModulo, 'Nombre del módulo') && evaluarCampo(videos, 'la lista de videos')) === true) {
                db.collection('modulos').add({
                    nombre: modulo.nombreModulo,
                    descripcion: modulo.descripcionModulo,
                    moduloActivo: 1
                }).then(function (docDetailRef) {
                    var detailModuloRef = db.collection('modulos').doc(docDetailRef.id);
                    agregarImagen("#moduloImagen", detailModuloRef, docDetailRef.id);
                    for (var k = 0; k < videos.length; k++) {
                        if (videos[k].descripcion === undefined) {
                            videos[k].descripcion = "";
                        }
                        detailModuloRef.collection('videos').add({
                            nombre: videos[k].nombreVideo,
                            link: videos[k].linkVideo,
                            descripcion: videos[k].descripcion,
                            videoActivo: 1,
                            contadorVistas: 0
                        }).then(function (docVideoRef) {
                        }).catch(function (error) {
                            console.log("Error getting cached document:", error);
                        });
                    }
                    db.collection("modulos").doc(docDetailRef.id).collection("videos").where("videoActivo", "!=", 3).get().then(function (querySnapshot) {
                        querySnapshot.forEach(function (doc) {
                            agregarArchivo(videos, detailModuloRef, docDetailRef.id, doc.data(), doc.id);
                        });
                        $scope.$digest();
                    }).catch(function (error) {
                        console.log("Error getting cached document:", error);
                    });
                    new Noty({
                        type: 'success',
                        layout: 'center',
                        text: '<div class="row align-items-center"><div class="col-md-3 text-center"><i class="fas fa-check-circle" style="color:white;"></i></div><div class="col-md-9"><h5>Módulo creado con éxito.</h5></div></div>'
                    }).show().setTimeout(2000);
                    $state.go('main.modulos-activos-list');
                }).catch(function (error) {
                    console.log("Error getting cached document:", error);
                });
            }
        };
    }
]);
angular.module('app').controller("ModulosActivosListCtrl", [
    '$scope',
    '$state',
    function ($scope, $state) {
        comprobarAuth();
        const [auth, db, storage] = firebaseInit();
        var modulos = [];
        db.collection("modulos").where("moduloActivo", "==", 1).get().then((snapshot) => {
            qrData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
            for (var i = 0; i < qrData.length; i++) {
                modulos.push(qrData[i]);
            }
            $scope.modulos = modulos;
            $scope.$digest();
        }).catch(function (error) {
            console.log("Error getting cached document:", error);
        });
        $scope.eliminarModulo = function (id) {
            var n = new Noty({
                type: 'alert',
                text: '<div class="row align-items-center"><div class="col-md-3 text-center"><i class="fa fa-2x fa-exclamation-triangle" style="color: #f9844a"></i></div><div class="col-md-9"><h5>&iquest;Desea eliminar este modulo?</h5></div></div><p class="text-center"><br/></p>',
                layout: 'center',
                timeout: false,
                modal: true,
                closeWith: ['button'],
                buttons: [
                    Noty.button('Sí', 'btn btn-primary mr-3 pr-5 pl-5', function () {
                        db.collection("modulos").doc(id).update({
                            moduloActivo: 2
                        }).then(function () {
                            if (storage !== undefined) {
                                var imagenModulo = storage.child("modulos/" + id + "/");
                                imagenModulo.delete().then(function () {
                                }).catch(function (error) {
                                    console.log("no se borro la imagen");
                                });
                            }
                            window.location.reload(false);
                        }).catch(function (error) {
                            console.error("Error adding document: ", error);
                        });
                        n.close();
                    }),
                    Noty.button('Cancelar', 'btn btn-info', function () {
                        //simplemente cierra el modal
                        n.close();
                    })
                ]
            }).show();
        };
        $scope.editarModulo = function (id) {
            $state.go('main.editar-modulo', {"id": id});
        };
        $scope.informacionModulo = function (id) {
            $state.go('main.informacion-modulo', {"id": id});
        };
    }
]);
angular.module('app').controller("EditarModuloCtrl", [
    '$scope',
    '$state',
    '$stateParams',
    function ($scope, $state, $stateParams) {
        comprobarAuth();
        const [auth, db, storage] = firebaseInit();
        var id = $stateParams.id;
        $scope.modulo = [];
        $scope.videos = [];
        $scope.video = [];
        $scope.file_producto = {file: "", subir_archivo: true};
        var menu = document.getElementById("menuEditar");
        var seccionesMenu = menu.getElementsByClassName("menu-edicion-cliente");
        for (var i = 0; i < seccionesMenu.length; i++) {
            seccionesMenu[i].addEventListener("click", function () {
                var current = document.getElementsByClassName("active-menu");
                current[0].className = current[0].className.replace("active-menu", "");
                this.className += " active-menu";
            });
        }
//        function addURL(archivoId, task, videoId, direccionBD) {
//            task.then(snapshot => snapshot.ref.getDownloadURL()).then(url => {
//                imageURL = url;
//                direccionBD.collection('archivosDescargables').doc(archivoId).set({
//                    archivoDescargable: imageURL
//                }, {merge: true});
//            }).catch(function (error) {
//                console.log("Error getting cached document:", error);
//            });
//        }
        function agregarImagen(idImagen, direccionBD, moduloId) {
            var file = document.querySelector(idImagen).files[0];
            if (file !== undefined) {
                const metadata = {
                    contentType: file.type
                };
                const task = storage.child("modulos/" + moduloId).put(file, metadata);
                task.then(snapshot => snapshot.ref.getDownloadURL()).then(url => {
                    const image = document.querySelector('#image');
                    imageURL = url;
                    direccionBD.set({
                        imageURI: imageURL
                    }, {merge: true});
                    $scope.$digest();
                }).catch(function (error) {
                    console.error("Error adding document: ", error);
                });
            }
        }
        function addURL(archivoId, task, videoId, direccionBD) {
            task.then(snapshot => snapshot.ref.getDownloadURL()).then(url => {
                imageURL = url;
                direccionBD.collection('archivosDescargables').doc(archivoId).set({
                    archivoDescargable: imageURL
                }, {merge: true});
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
        function agregarArchivo(arrayVideos, direccionBD, moduloId, videoId) {
//            for (var i = 0; i < arrayVideos.length; i++) {
////                if ((videoDB.nombre === arrayVideos[i].nombreVideo) && (videoDB.link === arrayVideos[i].linkVideo)) {
            if (arrayVideos === undefined) {
                imageURL = "";
                direccionBD.set({
                    archivoDescargable: 2
                }, {merge: true});
            } else if (arrayVideos !== undefined) {
                for (var k = 0; k < arrayVideos.length; k++) {
                    console.log(arrayVideos[k]);
                    var nombreArray = arrayVideos[k].name.split(".");
                    const metadata = {
                        contentType: arrayVideos[k].type
                    };
                    const task = storage.child("modulos/" + moduloId + "/archivos_descargables/" + videoId + "/" + nombreArray[0]).put(arrayVideos[k], metadata);
                    var nombre = nombreArray[0];
                    direccionBD.collection('archivosDescargables').add({
                        nombreArchivo: nombre
                    }).then(function (docVideoRef) {
                        direccionBD.collection('archivosDescargables').doc(docVideoRef.id).set({
                            id: docVideoRef.id
                        }, {merge: true});
                        addURL(docVideoRef.id, task, videoId, direccionBD);
                    }).catch(function (error) {
                        console.error("Error adding document: ", error);
                    });
                    $scope.$digest();
                    direccionBD.set({
                        archivoDescargable: 1
                    }, {merge: true});
                }
            }
        }
        $scope.eliminarArchivo = function (archivo, video) {
            db.collection("modulos").doc(id).collection("videos").doc(video.id).collection("archivosDescargables").doc(archivo.id).delete().then(function () {
                const task = storage.child("modulos/" + id + "/archivos_descargables/" + video.id + "/" + archivo.nombreArchivo);
                task.delete().then(function () {
                    // File deleted successfully
                    new Noty({
                        type: 'success',
                        layout: 'center',
                        text: '<div class="row align-items-center"><div class="col-md-3 text-center"><i class="fas fa-check-circle" style="color:white;"></i></div><div class="col-md-9"><h5>Archivo eliminado</h5></div></div>'
                    }).show().setTimeout(2000);
                    window.location.reload(false);
                }).catch(function (error) {
                    // Uh-oh, an error occurred!
                });

            }).catch(function (error) {
                console.error("Error removing document: ", error);
            });
        };
        $scope.fileProductoUpload = function (files) {
            $scope.files = files;
        };
        function getModulo(id) {
            moduloRef = db.collection('modulos').doc(id);
            moduloRef.get().then(function (doc) {
                $scope.modulo = doc.data();
                const image = document.querySelector('#image');
                image.src = doc.data().imageURI;
                urlSinImagen = doc.data().imageURI;
                $scope.$digest();
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
                $state.go('main.error-pagina-no-encontrada');
            });
        }
        function getVideos(id) {
            db.collection("modulos").doc(id).collection("videos".get().then((snapshot) => {
                qrDataVideo = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                $scope.videos = qrDataVideo;
                $scope.$digest();
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
        function evaluarCampo(valor, mensaje) {
            if (valor === "" || valor === undefined || valor.length === 0 || valor === null) {
                new Noty({
                    type: 'error',
                    layout: 'center',
                    text: 'El campo ' + mensaje + ' no puede ir vacio'
                }).show().setTimeout(3000);
                return false;
            } else {
                return true;
            }
        }
        getModulo(id);
        getVideos(id);
        document.getElementById("datos-modulo").style.display = "block";
        document.getElementById("datos-video").style.display = "none";
        document.getElementById("video-edit").style.display = "none";
        document.getElementById("video-nuevo").style.display = "none";
        $scope.irA = function (mostrar, ocultar) {
            document.getElementById(mostrar).style.display = "block";
            document.getElementById(ocultar).style.display = "none";
        };
        $scope.editarVideo = function (video) {
            document.getElementById("guardar-modulo").style.display = "none";
            document.getElementById("tabla-videos").style.display = "none";
            document.getElementById("agregar-video").style.display = "none";
            document.getElementById("video-edit").style.display = "block";
            $scope.video = angular.copy(video);
            if ($scope.video.archivoDescargable === 1) {
                db.collection("modulos").doc(id).collection("videos").doc($scope.video.id).collection("archivosDescargables").get().then((snapshot) => {
                    qrDataDescargables = snapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data()
                        }));
                    $scope.archivosDescargables = qrDataDescargables;
                    for (var i = 0; i < $scope.archivosDescargables.length; i++) {
                        var index = i + 1;
                        $scope.archivosDescargables[i].nombre = "Archivo" + index;
                    }
                    $scope.$digest();
                }).catch(function (error) {
                    console.log("Error getting cached document:", error);
                });
            }
        };
        $scope.eliminarVideo = function (video) {
            var n = new Noty({
                type: 'alert',
                text: '<div class="row align-items-center"><div class="col-md-3 text-center"><i class="fa fa-2x fa-exclamation-triangle" style="color: #f9844a"></i></div><div class="col-md-9"><h5>&iquest;Desea eliminar este video?</h5></div></div><p class="text-center">' + video.nombre + '<br/></p>',
                layout: 'center',
                timeout: false,
                modal: true,
                closeWith: ['button'],
                buttons: [
                    Noty.button('Sí', 'btn btn-primary mr-3 pr-5 pl-5', function () {
                        db.collection("modulos").doc(id).collection("videos").doc(video.id).update({
                            videoActivo: 2
                        }).then(function () {
                            window.location.reload(false);
                        }).catch(function (error) {
                            console.error("Error adding document: ", error);
                        });
                        n.close();
                    }),
                    Noty.button('Cancelar', 'btn btn-info', function () {
                        //simplemente cierra el modal
                        n.close();
                    })
                ]
            }).show();
        };

        $scope.activeVideo = function(video) {
            console.log("el video",video)
        };
        $scope.guardarVideoEditado = function (video, files) {
            console.log(files);
            if ($scope.video.id === video.id) {
                if ((evaluarCampo(video.nombre, "el nombre del video") && evaluarCampo(video.link, "link del video")) === true) {
                    if (video.descripcion === undefined) {
                        video.descripcion = "";
                    }
                    db.collection("modulos").doc(id).collection("videos").doc(video.id).update({
                        nombre: video.nombre,
                        link: video.link,
                        descripcion: video.descripcion
                    }).then(function () {
                        if (files !== undefined) {
                            var detailVideoRef = db.collection('modulos').doc(id).collection("videos").doc(video.id);
                            agregarArchivo(files, detailVideoRef, id, video.id);
                        }
//                        var n = new Noty({
//                            text: '<h1>Archivos agregados con éxito</h1>',
//                            layout: 'center',
//                            buttons: [
//                                Noty.button('Aceptar', 'btn btn-success', function () {
//                                    window.location.reload(false);
//                                    n.close();
//                                })
//                            ]
//                        });
//                        n.show();
                        var n = new Noty({
                            type: 'alert',
                            text: '<div class="row align-items-center"><div class="col-md-9"><h5>Video guardado con éxito</h5></div></div><p class="text-center"><br/></p>',
                            layout: 'center',
                            timeout: false,
                            modal: true,
                            buttons: [
                                Noty.button('Aceptar', 'btn btn-primary mr-3 pr-5 pl-5', function () {
                                    window.location.reload(false);
                                    n.close();
                                })
                            ]
                        }).show();
                        $scope.$digest();
//                        window.location.reload(false).setTimeout(5000);
                    }).catch(function (error) {
                        console.error("Error adding document: ", error);
                    });
                }
            }
        };
        $scope.cancelar = function (idHtml) {
            document.getElementById("guardar-modulo").style.display = "block";
            document.getElementById("tabla-videos").style.display = "block";
            document.getElementById("agregar-video").style.display = "block";
            document.getElementById(idHtml).style.display = "none";
        };
        $scope.videoNuevoShowForm = function () {
            document.getElementById("guardar-modulo").style.display = "none";
            document.getElementById("tabla-videos").style.display = "none";
            document.getElementById("agregar-video").style.display = "none";
            document.getElementById("video-nuevo").style.display = "block";
        };
        $scope.guardarVideoNuevo = function (video, files) {
            if ((evaluarCampo(video.nombre, "nombre del video") && evaluarCampo(video.link, "link del video")) === true) {
                if (video.descripcion === undefined) {
                    video.descripcion = "";
                }
                db.collection("modulos").doc(id).collection('videos').add({
                    nombre: video.nombre,
                    link: video.link,
                    descripcion: video.descripcion,
                    videoActivo: 1,
                    contadorVistas: 0
                }).then(function (docVideoRef) {
                    var detailVideoRef = db.collection('modulos').doc(id).collection("videos").doc(docVideoRef.id);
                    agregarArchivo(files, detailVideoRef, id, docVideoRef.id);
//                    var n = new Noty({
//                        text: '<h1>Video guardado con éxito</h1>',
//                        layout: 'center',
//                        buttons: [
//                            Noty.button('Aceptar', 'btn btn-success', function () {
//                                window.location.reload(false);
//                                n.close();
//                            })
//                        ]
//                    });
//                    n.show();
                    var n = new Noty({
                        type: 'alert',
                        text: '<div class="row align-items-center"><div class="col-md-9"><h5>Video guardado con éxito</h5></div></div><p class="text-center"><br/></p>',
                        layout: 'center',
                        timeout: false,
                        modal: true,
                        buttons: [
                            Noty.button('Aceptar', 'btn btn-primary mr-3 pr-5 pl-5', function () {
                                window.location.reload(false);
                                n.close();
                            })
                        ]
                    }).show();
                    $scope.video = [];
                }).catch(function (error) {
                    console.log("Error getting cached document:", error);
                });
            }
        };
        $scope.guardarModulo = function (modulo, videos) {
            if (evaluarCampo(modulo.nombre, "nombre del módulo") === true) {
                db.collection("modulos").doc(id).update({
                    nombre: modulo.nombre,
                    descripcion: modulo.descripcion
                }).then(function (docModuloRef) {
//                    console.log(docModuloRef.data());
                    agregarImagen("#moduloImagen", db.collection("modulos").doc(id), id);
                    new Noty({
                        type: 'success',
                        layout: 'center',
                        text: '<div class="row align-items-center"><div class="col-md-3 text-center"><i class="fas fa-check-circle" style="color:white;"></i></div><div class="col-md-9"><h5>Módulo editado éxitosamente</h5></div></div>'
                    }).show().setTimeout(2000);
                    $state.go('main.modulos-activos-list');
                }).catch(function (error) {
                    console.log("Error getting cached document:", error);
                });
            }
        };
    }
]);
angular.module('app').controller("InformacionModuloCtrl", [
    '$scope',
    '$state',
    '$stateParams',
    function ($scope, $state, $stateParams) {
        comprobarAuth();
        const [auth, db, storage] = firebaseInit();
        var id = $stateParams.id;
        console.log(id);
        $scope.modulo = [];
        $scope.videos = [];
        $scope.video = [];
        $scope.file_producto = {file: "", subir_archivo: true};
        var menu = document.getElementById("menuEditar");
        var seccionesMenu = menu.getElementsByClassName("menu-edicion-cliente");
        for (var i = 0; i < seccionesMenu.length; i++) {
            seccionesMenu[i].addEventListener("click", function () {
                var current = document.getElementsByClassName("active-menu");
                current[0].className = current[0].className.replace("active-menu", "");
                this.className += " active-menu";
            });
        }
        function getModulo(id) {
            moduloRef = db.collection('modulos').doc(id);
            moduloRef.get().then(function (doc) {
                $scope.modulo = doc.data();
                const image = document.querySelector('#image');
                image.src = doc.data().imageURI;
                urlSinImagen = doc.data().imageURI;
                $scope.$digest();
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
                $state.go('main.error-pagina-no-encontrada');
            });
        }
        function getVideos(id) {
            db.collection("modulos").doc(id).collection("videos").where("videoActivo", "!=", 3).get().then((snapshot) => {
                qrDataVideo = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                $scope.videos = qrDataVideo;
                $scope.$digest();
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
        getModulo(id);
        getVideos(id);
        document.getElementById("datos-modulo").style.display = "block";
        document.getElementById("datos-video").style.display = "none";
        document.getElementById("video-edit").style.display = "none";
//        document.getElementById("video-nuevo").style.display = "none";
        $scope.irA = function (mostrar, ocultar) {
            document.getElementById(mostrar).style.display = "block";
            document.getElementById(ocultar).style.display = "none";
        };
        $scope.cancelar = function (idHtml) {
//            document.getElementById("guardar-modulo").style.display = "block";
            document.getElementById("tabla-videos").style.display = "block";
//            document.getElementById("agregar-video").style.display = "block";
            document.getElementById(idHtml).style.display = "none";
        };
        $scope.videoNuevoShowForm = function () {
            $scope.video = [];
            document.getElementById("guardar-modulo").style.display = "none";
            document.getElementById("tabla-videos").style.display = "none";
            document.getElementById("agregar-video").style.display = "none";
            document.getElementById("video-nuevo").style.display = "block";
        };
        $scope.cancelar = function (idHtml) {
//            document.getElementById("guardar-modulo").style.display = "block";
            document.getElementById("tabla-videos").style.display = "block";
//            document.getElementById("agregar-video").style.display = "block";
            document.getElementById(idHtml).style.display = "none";
        };
        $scope.editarVideo = function (video) {
//            document.getElementById("guardar-modulo").style.display = "none";
            document.getElementById("tabla-videos").style.display = "none";
//            document.getElementById("agregar-video").style.display = "none";
            document.getElementById("video-edit").style.display = "block";
            $scope.video = angular.copy(video);
            if ($scope.video.archivoDescargable === 1) {
                db.collection("modulos").doc(id).collection("videos").doc($scope.video.id).collection("archivosDescargables").get().then((snapshot) => {
                    qrDataDescargables = snapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data()
                        }));
                    $scope.archivosDescargables = qrDataDescargables;
                    for (var i = 0; i < $scope.archivosDescargables.length; i++) {
                        var index = i + 1;
                        $scope.archivosDescargables[i].nombre = "Archivo" + index;
                    }
                    $scope.$digest();
                }).catch(function (error) {
                    console.log("Error getting cached document:", error);
                });
            }
        };
    }
]);