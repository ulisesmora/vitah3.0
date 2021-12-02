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
    '$state',
    '$rootScope',
    '$sce',
    function ($scope, $state, $rootScope, $sce) {
//Llamar a la función de firebase
        const [auth, db] = firebaseInit();
        $scope.modulosContratados = [];
        $scope.diezVideos = [];
        $scope.videosUsuario = [];
        $scope.modulos = [];
//Código
        $scope.getAllVideos = [];
        var idCliente;
        var status;
//        document.getElementById("showslide").style.display = "none";
//        $(document).ready(function () {
//            var itemsMainDiv = ('.MultiCarousel');
//            var itemsDiv = ('.MultiCarousel-inner');
//            var itemWidth = "";
//            $('.leftLst, .rightLst').click(function () {
//                var condition = $(this).hasClass("leftLst");
//                if (condition)
//                    click(0, this);
//                else
//                    click(1, this)
//            });
//            ResCarouselSize();
//            $(window).resize(function () {
//                ResCarouselSize();
//            });
//            //this function define the size of the items
//            function ResCarouselSize() {
//                var incno = 0;
//                var dataItems = ("data-items");
//                var itemClass = ('.item');
//                var id = 0;
//                var btnParentSb = '';
//                var itemsSplit = '';
//                var sampwidth = $(itemsMainDiv).width();
//                var bodyWidth = $('body').width();
//                $(itemsDiv).each(function () {
//                    id = id + 1;
//                    var itemNumbers = $(this).find(itemClass).length;
//                    btnParentSb = $(this).parent().attr(dataItems);
//                    itemsSplit = btnParentSb.split(',');
//                    $(this).parent().attr("id", "MultiCarousel" + id);
//                    if (bodyWidth >= 1200) {
//                        incno = itemsSplit[3];
//                        itemWidth = sampwidth / incno;
//                    } else if (bodyWidth >= 992) {
//                        incno = itemsSplit[2];
//                        itemWidth = sampwidth / incno;
//                    } else if (bodyWidth >= 768) {
//                        incno = itemsSplit[1];
//                        itemWidth = sampwidth / incno;
//                    } else {
//                        incno = itemsSplit[0];
//                        itemWidth = sampwidth / incno;
//                    }
//                    $(this).css({'transform': 'translateX(0px)', 'width': itemWidth * itemNumbers});
//                    $(this).find(itemClass).each(function () {
//                        $(this).outerWidth(itemWidth);
//                    });
//
//                    $(".leftLst").addClass("over");
//                    $(".rightLst").removeClass("over");
//
//                });
//            }
//            //this function used to move the items
//            function ResCarousel(e, el, s) {
//                var leftBtn = ('.leftLst');
//                var rightBtn = ('.rightLst');
//                var translateXval = '';
//                var divStyle = $(el + ' ' + itemsDiv).css('transform');
//                var values = divStyle.match(/-?[\d\.]+/g);
//                var xds = Math.abs(values[4]);
//                if (e == 0) {
//                    translateXval = parseInt(xds) - parseInt(itemWidth * s);
//                    $(el + ' ' + rightBtn).removeClass("over");
//
//                    if (translateXval <= itemWidth / 2) {
//                        translateXval = 0;
//                        $(el + ' ' + leftBtn).addClass("over");
//                    }
//                } else if (e == 1) {
//                    var itemsCondition = $(el).find(itemsDiv).width() - $(el).width();
//                    translateXval = parseInt(xds) + parseInt(itemWidth * s);
//                    $(el + ' ' + leftBtn).removeClass("over");
//
//                    if (translateXval >= itemsCondition - itemWidth / 2) {
//                        translateXval = itemsCondition;
//                        $(el + ' ' + rightBtn).addClass("over");
//                    }
//                }
//                $(el + ' ' + itemsDiv).css('transform', 'translateX(' + -translateXval + 'px)');
//            }
//            //It is used to get some elements from btn
//            function click(ell, ee) {
//                var Parent = "#" + $(ee).parent().attr("id");
//                var slide = $(Parent).attr("data-slide");
//                ResCarousel(ell, Parent, slide);
//            }
//
//        });
        auth.onAuthStateChanged(user => {
            if (user) {
                user.getIdTokenResult().then(idTokenResult => {
//                    console.log(idTokenResult);
                    if (idTokenResult.claims.cliente === true || idTokenResult.claims.admin === false) {
                        $scope.empleado = true;
                        document.getElementById("empleado-ind").style.display = "block";
                        db.collection("clientesPrivados").where("id", "==", idTokenResult.claims.user_id).get().then((snapshot) => {
                            qrData = snapshot.docs.map((doc) => ({
                                    empleadoid: doc.id,
                                    ...doc.data()
                                }));
                            $scope.empleadoSesion = qrData[0];
                            idCliente = $scope.empleadoSesion.empleadoid;
                             setTimeout(guardarUltimoInicioSesion(qrData[0], user.metadata.lastSignInTime), 2000);
                            if ($scope.empleadoSesion.cuestionario === false && $scope.empleadoSesion.status !== 1) {
                                $state.go('main.preregistro');
                            } else if ($scope.empleadoSesion.cuestionario === true && $scope.empleadoSesion.status === 1) {
                                getVideosVistosEmpleado($scope.empleadoSesion.empleadoid);
                            }
                            if ($scope.empleadoSesion.reinicioContador === 1) {
                                reiniciarContador(qrData[0]);
                            }
                            $scope.$digest();
                        }).catch(function (error) {
//                            location.href = base_url + ('#!/queremos-conocerte');
//                            $state.go('main.preregistro');
                            console.log("Error getting cached document:", error);
                        });
//                        
                    } else if (idTokenResult.claims.cliente === false || idTokenResult.claims.admin === true) {
                        $scope.empleado = false;
                        if ($scope.empleado === false) {
                            location.href = base_url + ('#!/error');
                        }
                    }
                });
            } else {
                location.href = base_url + ('#!/login');
            }
        });
        function guardarUltimoInicioSesion(data, lastSession) {
            db.collection("clientesPrivados").doc(data.empleadoid).update({
                ultimoInicioSesion: lastSession
            }).then(function (docDetailRef) {
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
        function reiniciarContador(data) {
            db.collection("customers").doc(data.id).collection("subscriptions").get().then((snapshot) => {
                qrData = snapshot.docs.map((doc) => ({
                        videoVistoId: doc.id,
                        ...doc.data()
                    }));
                var fecha = new Date();
                var diaActual = fecha.getDay();
                var fechaActual = cambiarFormatoFecha(fecha);
                var ultimoInicioSesionParse = new Date(data.ultimoInicioSesion);
                var fechaUltimoInicioSesion = cambiarFormatoFecha(ultimoInicioSesionParse);
                verificarFechaAcceso(qrData[0].current_period_end, qrData[0].current_period_start, fechaUltimoInicioSesion, fechaActual);
                $scope.$digest();
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
        function verificarFechaAcceso(fechaVencimiento, fechaInicio, ultimoInicioSesion, fechaActual) {
            console.log(fechaVencimiento);
            console.log(fechaInicio);
            console.log(ultimoInicioSesion);
            console.log(fechaActual);
            var timestamp = fechaVencimiento.seconds;
            var timestampFechaInicio = fechaInicio.seconds;
            var date = new Date(timestamp * 1000);
            var datefechaInicio = new Date(timestampFechaInicio * 1000);
            var fechaVencimiento = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
            var fechaInicio = (datefechaInicio.getMonth() + 1) + "/" + datefechaInicio.getDate() + "/" + datefechaInicio.getFullYear();
            compararFecha(fechaVencimiento, fechaInicio, ultimoInicioSesion, fechaActual);
        }
        function cambiarFormatoFecha(fecha) {
            var year = fecha.getFullYear();
            var month = (1 + fecha.getMonth()).toString();
            month = month.length > 1 ? month : '0' + month;
            var day = fecha.getDate().toString();
            day = day.length > 1 ? day : '0' + day;
            return(month + '/' + day + '/' + year);
        }
        function compararFecha(fecha_final, fecha_inicio, fecha_inicio_sesion, fecha_actual) {
            var final_array = fecha_final.split("/");
            var inicio_array = fecha_inicio.split("/");
            var inicio_sesion_array = fecha_inicio_sesion.split("/");
            var actual_array = fecha_actual.split("/");
            var fechaConvertidaFinal = new Date(final_array[2], final_array[0], final_array[1]);
            var fechaConvertidaActual = new Date(actual_array[2], actual_array[0], actual_array[1]);
            if (fechaConvertidaActual < fechaConvertidaFinal) {
                return true;
            } else {
                if (fechaConvertidaActual > fechaConvertidaFinal) {
                    return false;
                } else {
                    new Noty({
                        type: 'error',
                        layout: 'center',
                        text: 'Aún no tienes acceso a tu cuenta. Regresa en la fecha correcta'
                    }).show().setTimeout(3000);
                }
            }
        }
        function getVideosVistosEmpleado(empleadoId) {
//            db.collection("clientesPrivados").doc(empleadoId).update({
//                videosVistosMensuales: 0
//            }).then(function (docDetailRef) {
//            }).catch(function (error) {
//                console.log("Error getting cached document:", error);
//            });
        }
        function getVideosMasVistos() {
            console.log("teeeelmme")
            db.collection("modulos").where("moduloActivo", "==", 1).get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    db.collection("modulos").doc(doc.id).collection("videos").where("videoActivo", "==", 1).get().then((querySnapshot) => {
                        querySnapshot.forEach((docVideo) => {
//                            var video = docVideo.data().link.split("/");
//                            $rootScope.linkVideo = $sce.trustAsResourceUrl("https://player.vimeo.com/video/" + video[3]);
                            var videoData = {
                                imageURI: docVideo.data().imageURI,
//                                linkVideo: $rootScope.linkVideo,
                                nombre: docVideo.data().nombre,
                                contadorVistas: docVideo.data().contadorVistas,
                                videoId: docVideo.id,
                                moduloId: doc.id,
                                url: 'main.ver-video({videoId: "' + docVideo.id + '", moduloId: "' + doc.id + '"})'
                            };
                            $scope.getAllVideos.push(videoData);
                            $scope.getAllVideos.sort(function (a, b) {
                                if (a.contadorVistas > b.contadorVistas) {
                                    return 1;
                                }
                                if (a.contadorVistas < b.contadorVistas) {
                                    return -1;
                                }
                                // a must be equal to b
                                return 0;
                            });
                            $scope.getAllVideos = $scope.getAllVideos.reverse();
                            $scope.diezVideos = $scope.getAllVideos.slice(0, 10);
                            $scope.$digest();
                        });
                    }).catch((error) => {
                        console.log("Error getting documents: ", error);
                    });
                });
                $scope.$digest();
            }).catch((error) => {
                console.log("Error getting documents: ", error);
            });
            setTimeout(getVideosVistosByUser, 1000);
            setTimeout(getLikes, 2000);
        }
        setTimeout(function () {
            $(document).ready(function () {
                $('.one-time').slick({
                    dots: false,
//                    slidesToShow: 5,
                    slidesToScroll: 1,
                    touchMove: true,
                    infinite: false,
                    variableWidth: true,
                    waitForAnimate: true
                });
            });
        }, 0);
        getVideosMasVistos();
        function getVideosVistosByUser() {
            db.collection("clientesPrivados").doc($scope.empleadoSesion.empleadoid).collection("videosVistos").get().then((snapshot) => {
                qrData = snapshot.docs.map((doc) => ({
                        videoVistoId: doc.id,
                        ...doc.data()
                    }));
                $scope.videosUsuario = qrData;
                $scope.$digest();
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
        function getLikes() {
            for (var i = 0; i < $scope.diezVideos.length; i++) {
                for (var k = 0; k < $scope.videosUsuario.length; k++) {
                    if ($scope.diezVideos[i].videoId === $scope.videosUsuario[k].videoId) {
                        $scope.diezVideos[i].see = true;
                        $scope.diezVideos[i].videoVistoId = $scope.videosUsuario[k].videoVistoId;
                        if ($scope.videosUsuario[k].like === true) {
                            $scope.diezVideos[i].like = true;
//                        }else if($scope.videosUsuario[k].like === false){
                        } else if ($scope.videosUsuario[k].like === false) {
//                            $scope.diezVideos[i].videoVistoId = $scope.videosUsuario[k].videoVistoId;
//                            $scope.diezVideos[i].see = true;
                            $scope.diezVideos[i].like = false;
                        }
                    }
                }
                $scope.$digest();
            }
        }
        async function likeAVideoByUser(like,election) {
            console.log("yoooo",like,election,"mlmlñmlñ");

            const result = await db.collection("clientesPrivados").doc($scope.empleadoSesion.empleadoid).collection("videosVistos").doc(like).get();
            console.log(result.data(),"ek resukt");
            if(result.data().moduloId != undefined && (result.data().like != undefined || result.data().dislike != undefined  )  ){
            if(result.data().like == election){
                return;
            }else{
                if(election){
                    console.log("uno");
                    const vis = await db.collection("modulos").doc(result.data().moduloId).collection("videos").doc(result.data().videoId).get();
                    let likes = vis.data().likes == undefined ? 0 : vis.data().likes;
                    likes += 1;
                    let dislikes = vis.data().dislikes == undefined ? 0 : vis.data().likes;
                    if(dislikes > 0){
                        dislikes -= 1;
                    }
                    await db.collection("modulos").doc(result.data().moduloId).collection("videos").doc(result.data().videoId).update({likes:likes})
                }else{
                    console.log("otro");
                    const vis = await db.collection("modulos").doc(result.data().moduloId).collection("videos").doc(result.data().videoId).get();
                    let likes = vis.data().likes == undefined ? 0 : vis.data().likes;
                    if(likes > 0){
                        likes -= 1;
                    }
                    let dislikes = vis.data().dislikes == undefined ? 0 : vis.data().likes;
                    dislikes += 1;
                    await db.collection("modulos").doc(result.data().moduloId).collection("videos").doc(result.data().videoId).update({likes:likes,dislikes:dislikes})
                }
            }
            
          
            }else{

              const vis = await db.collection("modulos").doc(result.data().moduloId).collection("videos").doc(result.data().videoId).get();
                if(like){
              let likes = vis.data().likes == undefined ? 0 : vis.data().likes;
              likes += 1;
              await db.collection("modulos").doc(result.data().moduloId).collection("videos").doc(result.data().videoId).update({likes:likes})
                }else{

                    let dislikes = vis.data().dislikes == undefined ? 0 : vis.data().likes;
                    dislikes += 1;
                    await db.collection("modulos").doc(result.data().moduloId).collection("videos").doc(result.data().videoId).update({dislikes:dislikes})
                }


            }

            db.collection("clientesPrivados").doc($scope.empleadoSesion.empleadoid).collection("videosVistos").doc(like).set({
                like: election
            }, {merge: true});


        }
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
                            nombre: doc.data().nombre
                        };
                        $scope.modulos.push(modulos);
                        $scope.$digest();
                    }
                });
                setTimeout(addProximamente, 500);
            }).catch(function (error) {
                console.log("Error getting cached document:", error);
            });
        }
        getModulos();
        $scope.clickLike = function (video) {
            likeAVideoByUser(video.videoVistoId, true);
        };
        $scope.clickDislike = function (video) {
            likeAVideoByUser(video.videoVistoId, false);
        };
        $scope.irAVideo = function (video) {
            console.log(video.target)
            let num = video.target.children[0].attributes.id.value;
            num = num.split("-");

            console.log(num);

            console.log(video,$scope.diezVideos[0])

            const destino = $scope.diezVideos[Number.parseInt(num[1])];

            $state.go('main.ver-video', {"videoId": destino.videoId, "moduloId": destino.moduloId});
        };



//        $('#vimeoVideo').click(false);
    }
]);

