//ID do registo no google cloud messaging
var gcmID = "";
var app = {


    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    
    // Bind Event Listeners
    bindEvents: function() {
    	document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    
    
    /*
     * @Função executada quando a APP inicia
     */
    onDeviceReady: function() {
    	//Configurações para suporte do PhoneGap
    	//http://view.jquerymobile.com/1.3.2/dist/demos/faq/how-configure-phonegap-cordova.html
    	$.support.cors=true;
		$.mobile.buttonMarkup.hoverDelay=0;
		$.pushStateEnabled=false;
	    $.mobile.allowCrossDomainPages = true;
	    $.mobile.defaultPageTransition='none';
	    $.mobile.defaultDialogTransition='none';
	    $.mobile.loadingMessageTextVisible = true;
	    $.ajaxSetup({ 
					beforeSend: function() { $.mobile.showPageLoadingMsg(); }, //Show spinner
					complete: function() { $.mobile.hidePageLoadingMsg() }, //Hide spinner
					timeout: 15000,
					error: function(  ){
						navigator.notification.alert(
				            'Problema ao conectar com o servidor. Tente novamente.',  // message
				            null,         // callback
				            'Erro de ligação',            // title
				            'Ok'                  // buttonName
				       		 );
						return false;
						}
					});


	    //Listener da tecla de retroceder
    	document.addEventListener("backbutton", onBackKeyDown, false);
    	
    	//Listener conexão Internet
    	document.addEventListener("offline", onOffline, false);

    	//Notificação
	    var pushNotification = window.plugins.pushNotification;
		pushNotification.register(app.successHandler, app.errorHandler,{"senderID":"691270257065","ecb":"app.onNotificationGCM"});

	    /*
	     * @Declaração de variáveis globais
	     */
	    //Variável que armazena o identificador unico do telemovel
	    var uniqueID = device.uuid;
	    //URL base do webservice
	    //var rootURL = "http://10.3.1.39/mrc/api/";
	    //var rootURL = "http://192.168.1.64/mrc/api/";
	    var rootURL = "http://ec2-54-242-130-236.compute-1.amazonaws.com/mrc/api/";
	    var idSenhaPopUp = 0;
	    var detalhesSenha=[];
	    var windowWidth = $(window).width();
        var windowHeight = $(window).height();
        try{
        var directionsDisplay,directionsService = new google.maps.DirectionsService(),map;
      	}
      	catch(err)
		{
			onOffline();
		}
	    /*
	     * @Declaração de Funções
	     */
	    //Quando se carrega na tecla de retroceder a aplicação fecha
	    function onBackKeyDown() {
	    	$.mobile.showPageLoadingMsg("a", "A fechar aplicação");
	    	setTimeout(function () {navigator.app.exitApp();}, 1000);
	    	
		};

	    //Evento da ligação à internet perdida
		function onOffline(){
			$.mobile.hidePageLoadingMsg();
			navigator.notification.alert(
	            'Certifique-se de que tem ligação à Internet.',  // message
	            null,         // callback
	            'Falha de Ligação',            // title
	            'Ok'                  // buttonName
	        );
		};

		//Verificação do localStorage para verificar se o utilizador está logado
		//Adapta o botão de login de acordo com o estado
		function refreshLoginButton (){
		if (localStorage.getItem("login") == null || localStorage.getItem("login") == 0){
			$(".loginButton").attr("data-icon","gear");
			$(".loginButton").attr("data-theme","a");
			$( ".loginButton" ).buttonMarkup( "refresh" );}
		else{
			$(".loginButton").attr("data-icon","delete");
			$(".loginButton").attr("data-theme","a");
			$( ".loginButton").buttonMarkup( "refresh" );}
		}

		//Webservice - valida o email e a password do utilizador
	    function validaLogin(username,password){
		    $.ajax({
				type: 'POST',
				url: rootURL+"utilizador",
				dataType: "json",
	    		data: JSON.stringify({
	    			"username": username, 
	    			"password": password
	    			}),
				success: function(data){
					if(data==1)
					{
						navigator.notification.alert(
				            'Login efectuado com sucesso!',  // message
				            null,         // callback
				            'Sucesso',            // title
				            'Ok'                  // buttonName
				        );
				        localStorage.setItem("login", $("#loginUsername").val());
				        refreshLoginButton();
				        $( "#painelDefinicoes" ).dialog( "close" );
				    }
					else if (data==0)
					{
						navigator.notification.alert(
				            'Login incorrecto!',  // message
				            null,         // callback
				            'Erro',            // title
				            'Ok'                  // buttonName
				        );
					}
				}
			});
		    }

		    //Webservice - valida o email e a password do utilizador
	    function logout(){
	    	navigator.notification.alert(
				            'Logout efectuado com sucesso!',  // message
				            null,         // callback
				            'Sucesso',            // title
				            'Ok'                  // buttonName
				        );
		    localStorage.setItem("login", "0");
		    refreshLoginButton();
		    }
	    
	    //Webservice - carregamento dos serviços de atendimento
	    function getFrontDesk(){
		    $.ajax({
				type: 'GET',
				url: rootURL+"frontdesk",
				dataType: "json", // data type of response
				success: function(data){
					$('#frontdesk').empty();
					var list = data == null ? [] : (data.frontDesk instanceof Array ? data.frontDesk : [data.frontDesk]);
				    $('#frontdesk').append($('<option>').text(""));
					$.each(list, function(index, frontDesk) {
			            $('#frontdesk').append($('<option>').text(frontDesk.nome).attr('value', frontDesk.idFrontDesk));
					});
					$( "#frontdesk" ).selectmenu( "refresh" );
				}
			});
		    }
	    
	  //Webservice - carregamento das localizações 
	    function getLocalizacao(id){
		    $.ajax({
				type: 'GET',
				url: rootURL+"frontdesk/"+id+"/localizacao",
				dataType: "json", // data type of response
				success: function(data){
					$('#localizacao').empty();
					var list = data == null ? [] : (data.localizacao instanceof Array ? data.localizacao : [data.localizacao]);
				    $('#localizacao').append($('<option>').text(""));
					$.each(list, function(index, localizacao) {
			            $('#localizacao').append($('<option>').text(localizacao.nome).attr('value', localizacao.idLocalizacao));
					});
					$( "#localizacao" ).selectmenu( "refresh" );
				}
			});
		    }
	    
	  //Webservice - carregamento dos balcões de antedimento
	    function getBalcaoAtendimento(idFrontDesk,idLocalizacao){
		    $.ajax({
				type: 'GET',
				url: rootURL+"frontdesk/"+idFrontDesk+"/localizacao/"+idLocalizacao+"/balcaoatendimento",
				dataType: "json", // data type of response
				success: function(data){
					$('#balcaoAtendimento').empty();
					var list = data == null ? [] : (data.balcaoAtendimento instanceof Array ? data.balcaoAtendimento : [data.balcaoAtendimento]);
				    $('#balcaoAtendimento').append($('<option>').text(""));
					$.each(list, function(index, balcaoAtendimento) {
			            $('#balcaoAtendimento').append($('<option>').text(balcaoAtendimento.nome).attr('value', balcaoAtendimento.idbalcaoatendimento));
					});
					$( "#balcaoAtendimento" ).selectmenu( "refresh" );
				}
			});
		    }
	    
	  //Webservice - verificar senha actual e tempos
	    function getCurrentSenha(idFrontDesk,idLocalizacao,idBalcaoAtendimento){
		    $.ajax({
				type: 'GET',
				url: rootURL+"frontdesk/"+idFrontDesk+"/localizacao/"+idLocalizacao+"/balcaoatendimento/"+idBalcaoAtendimento,
				dataType: "json", // data type of response
				success: function(data){
					$('#tempo_espera').val(data.tempoEspera);
					$('#tempo_atendimento').val(data.tempoAtendido);
					$('#hora_prevista').val(data.horaPrevista);
					$('#senhaActual').empty();
		            $('#senhaActual').siblings('.ui-btn-inner').children('.ui-btn-text').text("Senha Actual: "+data.senha);
					$( "#senhaActual" ).buttonMarkup( "refresh" );
				}
			});
		    }
	    
		//Webservice - gerar senha
	    function addSenha(frontDesk,localizacao,balcaoAtendimento,uniqueID,email) {
	    	$.ajax({
	    		type: 'POST',
	    		contentType: 'application/json',
	    		url: rootURL+"senhas",
	    		dataType: "json",
	    		data: JSON.stringify({
	    			"frontDesk": frontDesk, 
	    			"localizacao": localizacao, 
	    			"balcaoAtendimento": balcaoAtendimento,
	    			"uniqueID": uniqueID,
	    			"gcmID": gcmID,
	    			"email":email
	    			}),
	    		success: function(data, textStatus, jqXHR){
	    			getSenhaUtilizador(data.id);
	    			$.mobile.changePage("#popupSenhaActual",{ role: "dialog" } );
	    		}
	    	});
	    }
	    
	  //Webservice - verificar senha gerada pelo utilizador
	    function getSenhaUtilizador(idsenha){
		    $.ajax({
				type: 'GET',
				url: rootURL+"senhas/"+idsenha,
				dataType: "json", // data type of response
				success: function(data){
					$('#dialog_senhaActual').empty();
		            $('#dialog_senhaActual').siblings('.ui-btn-inner').children('.ui-btn-text').text("Senha: "+data.senha);
					$( "#dialog_senhaActual" ).buttonMarkup( "refresh" );
					$('#dialog_hora_prevista').val(data.horaPrevista);
				}
			});
		    }
	    
	  //Webservice - verificar senhas do utilizador
	    function getSenhasUtilizador(uniqueID){
		    $.ajax({
				type: 'GET',
				url: rootURL+"utilizador/"+uniqueID+"/senhas",
				dataType: "json", // data type of response
				success: function(data){
					$('#listaMinhasSenhas').empty();
					var list = data == null ? [] : (data.senhas instanceof Array ? data.senhas : [data.senhas]);
					$('#minhasSenhasRefresh').empty();
		            $('#minhasSenhasRefresh').siblings('.ui-btn-inner').children('.ui-btn-text').text("Não existem senhas");
					$( "#minhasSenhasRefresh" ).buttonMarkup( "refresh" );
					var idControlo = 0;
					var lista = "";				
					$.each(list, function(index, senhas) {
						if(senhas.estado==1){
							$('#minhasSenhasRefresh').empty();
			            $('#minhasSenhasRefresh').siblings('.ui-btn-inner').children('.ui-btn-text').text("Actualizar");
						$( "#minhasSenhasRefresh" ).buttonMarkup( "refresh" );
						if(idControlo != senhas.idFrontDesk){
						lista+= '<li data-role="list-divider">'+senhas.nomeFrontDesk+'</li>';
						idControlo=senhas.idFrontDesk
						}
						lista+=('<li data-idSenha="'+senhas.idSenha+'"><a href="#popupsenha" data-rel="popup"><h2>'+senhas.nomeBalcaoAtendimento+'</h2><p><strong>'+senhas.nomeLocalizacao+'</strong></p><br>');
						if((senhas.nSenhaUtilizador-senhas.nSenhaActual)<=5)
						{
							lista+=('<p><font color="red"><strong>Senha Actual: </strong>'+senhas.nSenhaActual+'<strong> Hora Prevista: </strong>'+senhas.horaAtendimento+'</font></p>');
						}
						else
						lista+=('<p><strong>Senha Actual: </strong>'+senhas.nSenhaActual+'<strong> Hora Prevista: </strong>'+senhas.horaAtendimento+'</p>');
						
						lista+=('<p><strong>Minha Senha: </strong>'+senhas.nSenhaUtilizador+'</p></a></li>')}
					});
					$('#listaMinhasSenhas').append(lista);
					$( "#listaMinhasSenhas" ).listview( "refresh" );
				}
			});
		    }

		//Webservice - validar se o utilizador já tem uma senha no serviço em causa
	    function validaSenhaUtilizador(uniqueID){
		    $.ajax({
				type: 'GET',
				url: rootURL+"utilizador/"+uniqueID+"/senhas",
				dataType: "json", // data type of response
				success: function(data){
					var senhaExistente = false;
					var list = data == null ? [] : (data.senhas instanceof Array ? data.senhas : [data.senhas]);
					if(data.senhas.length==0)
						$.mobile.changePage("#info_gerar_senha_page");
					else 
					{
					$.each(list, function(index, senhas) {
						if(senhas.idFrontDesk==$("#frontdesk").val() && senhas.idLocalizacao==$("#localizacao").val() && senhas.idBalcaoAtendimento==$("#balcaoAtendimento").val())
						senhaExistente=true;
					});
					if(senhaExistente)
						navigator.notification.alert(
				            'Já possui uma senha para este serviço.',  // message
				            null,         // callback
				            'Inválido',            // title
				            'Ok'                  // buttonName
				        );
					else
						$.mobile.changePage("#info_gerar_senha_page");
					}
				}
			});
		    }
	    
	  //Webservice - desistir da senha
	    function giveUpSenha(idSenhaPopUp){
		    $.ajax({
				type: 'PUT',
				url: rootURL+"senhas/"+idSenhaPopUp,
				dataType: "json", // data type of response
				success: function(data){
					//$.mobile.changePage("#minhas_senhas_page" );
					$( "#popupsenha" ).popup( "close" );
					navigator.notification.alert(
			            'Senha removida!',  // message
			            null,         // callback
			            'Desistir da Senha',   // title
			            'Ok'                  // buttonName
			        );
					$("#minhasSenhasRefresh").trigger("click");
				}
			});
		    }
		

		//Webservice - verificar detalhes de uma senha
	    function getSenhaDetalhes(idsenha){
		    $.ajax({
				type: 'GET',
				url: rootURL+"senhas/"+idsenha+"/detalhes",
				dataType: "json", // data type of response
				success: function(data){
					var list = data == null ? [] : (data.senhas instanceof Array ? data.senhas : [data.senhas]);
					detalhesSenha=[];
					$.each(list, function(index, senhas) {
						detalhesSenha.push(senhas.idSenha);
						detalhesSenha.push(senhas.dataEmissao);
						detalhesSenha.push(senhas.horaEmissao);
						detalhesSenha.push(senhas.nomeFrontDesk);
						detalhesSenha.push(senhas.nomeLocalizacao);
						detalhesSenha.push(senhas.nomeBalcaoAtendimento);
     					detalhesSenha.push(senhas.googleMaps);
						detalhesSenha.push(senhas.morada);
						detalhesSenha.push(senhas.nSenhaUtilizador);
						detalhesSenha.push(senhas.nSenhaActual);
						detalhesSenha.push(senhas.mediaTempoEspera);
						detalhesSenha.push(senhas.mediaTempoAtendimento);
						detalhesSenha.push(senhas.horaAtendimento);
						detalhesSenha.push(senhas.idFrontDesk);
						detalhesSenha.push(senhas.idLocalizacao);
					});
				}
			});
		    }

		    //Webservice - validar o horário do serviço
	    	function validaHorario(idFrontDesk,idLocalizacao){
		    $.ajax({
				type: 'GET',
				url: rootURL+"frontdesk/"+idFrontDesk+"/localizacao/"+idLocalizacao+"/horario",
				dataType: "json", // data type of response
				success: function(data){
					if(data.aberto==0)
					navigator.notification.alert(
			            'O serviço encontra-se encerrado.',  // message
			            null,         // callback
			            'Horário indisponível',   // title
			            'Ok'                  // buttonName
			        );
					else
					 validaSenhaUtilizador(uniqueID);
				}
			});
		    }

		    //Webservice - carregar os horários dos serviços
		    function getHorario(idFrontDesk,idLocalizacao){
		    	$.ajax({
				type: 'GET',
				url: rootURL+"frontdesk/"+idFrontDesk+"/localizacao/"+idLocalizacao+"/horario",
				dataType: "json", // data type of response
				success: function(data){
					$("#horarioTabela tbody").html("");
					var list = data == null ? [] : (data.horario instanceof Array ? data.horario : [data.horario]);
					var conteudo = "";
					$.each(list, function(index, horario) {
						conteudo += '<tr><th>'+horario.diaSemana+'</th><td>'+horario.horaInicio+'</td><td>'+horario.horaFim+'</td></tr>';
					});
					$("#horarioTabela tbody").append(conteudo);
					$.mobile.changePage("#horarioServico",{ role: "dialog" } );
				}
			});
		    }
				

		    /*
		     * Funções associadas ao GPS do telemóvel
		     */
			function onSuccessGPS(position) {
		        $("#from").val("("+position.coords.latitude+","+position.coords.longitude+")");
                calculateRoute();
		    }

		    function onErrorGPS(error) {
		    	navigator.notification.alert(
			            'Ocorreu um erro ao tentar obter as suas coordenadas.',  // message
			            null,         // callback
			            'Erro de GPS',   // title
			            'Ok'                  // buttonName
			        );
		    }

		    /*
		     * Funções associadas ao Google Maps
		     */
		     function initialize() 
            {
            	navigator.geolocation.getCurrentPosition(onSuccessGPS, onErrorGPS,{ maximumAge: 5000, timeout: 10000, enableHighAccuracy: true });
                directionsDisplay = new google.maps.DirectionsRenderer();
                var mapCoord= detalhesSenha[6].split(",");
                var mapCenter = new google.maps.LatLng(mapCoord[0],mapCoord[1]);
                var myOptions = {
                    zoom:10,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    center: mapCenter
                }
                map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
                directionsDisplay.setMap(map);
                directionsDisplay.setPanel(document.getElementById("directions")); 
                $("#directions").empty();
				$("#to").val(mapCenter);
            }

            function calculateRoute() 
            {
            	google.maps.event.trigger(map, 'resize');
                var selectedMode = $("#mode").val(),
                    start = $("#from").val(),
                    end = $("#to").val();

                if(start == '' || end == '')
                {
                    // cannot calculate route
                    $("#results").hide();
                    return;
                }
                else
                {
                    var request = {
                        origin:start, 
                        destination:end,
                        travelMode: google.maps.DirectionsTravelMode[selectedMode]
                    };

                    directionsService.route(request, function(response, status) {
                        if (status == google.maps.DirectionsStatus.OK) {
                            directionsDisplay.setDirections(response); 
                            $("#results").show();
                        }
                        else {
                            $("#results").hide();
                        }
                  });
                }
            }


	    /* ____________
	     * |IMPORTANTE|
	     *  ----------
	     * @Ecrã inicial da APP corresponde ao menu "Gerar Senha"
	     * É necessário carregar a lista de Serviços de Atendimento assim que a APP inicia
	     */
	    getFrontDesk();

	    //Criação do botão de login dinamicamente
	    refreshLoginButton();
	    
	    /*
	     * @Declaração de Eventos
	     */   

	    //Ao submeter o e-mail e a password procede-se à validação dos mesmos
   	    $("#loginSubmit").on("click",function(){
	    	validaLogin($("#loginUsername").val(),$("#loginPassword").val());
	    	return false;
	    })

   	    //Caso o utilizador esteja logado o botão "loginButton" ao ser clicado efectua o logout
	    $(".loginButton").on("click",function(){
		if (localStorage.getItem("login") == null || localStorage.getItem("login") == 0){
	    	$.mobile.changePage("#painelDefinicoes",{ role: "dialog" } );
	    	}
	   	else {
	    	logout();
			return false;
	    	}
	    })

	    //Quando se clica no botão refreshButtonHeader a página é recarregada
	    //Útil para quando ocorrem problemas de ligação
	    $(".refreshButtonHeader").on("click",function(){
			$("#localizacao").empty();
	    	$("#localizacao").selectmenu( "disable" );
	    	$( "#localizacao" ).selectmenu( "refresh" );
	    	$('#balcaoAtendimento').empty();
	    	$('#balcaoAtendimento').selectmenu( "disable" );
	    	$( "#balcaoAtendimento" ).selectmenu( "refresh" );
	    	$("#gerar_senha_page_avancarButton").addClass( "ui-disabled" );
	    	$("#gerar_senha_page_horarioButton").addClass( "ui-disabled" );
	    	getFrontDesk();
	    });
    
	    //Quando o select "Serviço de Atendimento" for alterado o select "Localização" fica activo
	    //Após o select "Localizacao" ficar activo, são carregados os dados
	    $("#frontdesk").on("change",function(){
	    	$("#localizacao").selectmenu( "enable" );
	    	$('#balcaoAtendimento').empty();
	    	$('#balcaoAtendimento').selectmenu( "disable" );
	    	$( "#balcaoAtendimento" ).selectmenu( "refresh" );
	    	$("#gerar_senha_page_avancarButton").addClass( "ui-disabled" );
	    	$("#gerar_senha_page_horarioButton").addClass( "ui-disabled" );
	    	getLocalizacao($("#frontdesk").val());
	    });
	    
	    //Quando o select "Localização" for alterado o select "Balcao Atendimento" fica activo
	    //Após o select "Balcao Atendimento" ficar activo, são carregados os dados
	    $("#localizacao").on("change",function(){
	    	$("#balcaoAtendimento").selectmenu( "enable" );
	    	getBalcaoAtendimento($("#frontdesk").val(),$("#localizacao").val());
	    	$("#gerar_senha_page_avancarButton").addClass( "ui-disabled" );
	    	$("#gerar_senha_page_horarioButton").removeClass( "ui-disabled" );
	    });
	    
	    //Quando o select "Balcao Atendimento" for alterado o botão "Avançar" fica activo
	    $("#balcaoAtendimento").on("change",function(){
	    	$("#gerar_senha_page_avancarButton").removeClass( "ui-disabled" );
	    });

	    $("#gerar_senha_page_avancarButton").on("click",function(){
	    	validaHorario($("#frontdesk").val(),$("#localizacao").val());
	    });

	    $("#gerar_senha_page_horarioButton").on("click",function(){
	    	getHorario($("#frontdesk").val(),$("#localizacao").val());
	    });

 		$("#minha_senha_detalhes_horarioButton").on("click",function(){
	    	getHorario(detalhesSenha[13],detalhesSenha[14]);
	    });
	    
	    
	    //Quando o select "Balcao Atendimento" for alterado o botão "Avançar" fica activo
	    $("#info_gerar_senha_page").on("pagebeforeshow",function(){
	    	getCurrentSenha($("#frontdesk").val(),$("#localizacao").val(),$("#balcaoAtendimento").val());
	    });
	    
	    //Quando se clica no botão da senha actual a página é actualizada 
	    $("#senhaActual").on("click",function(){
	    	getCurrentSenha($("#frontdesk").val(),$("#localizacao").val(),$("#balcaoAtendimento").val());
	    });
	    
	    //Quando se clica no botão de gerar ticket é gerada uma nova senha
	    $("#info_gerar_senha_page_gerarTicketButton").on("click",function(){
	    	var login = localStorage.getItem("login");
	    	if (login == 0)
	    		login = "";
	    	addSenha($("#frontdesk").val(),$("#localizacao").val(),$("#balcaoAtendimento").val(),uniqueID,login);
	    });
	    
	    //Quando a página das senhas é carregada 
	    $("#minhas_senhas_page").on("pagebeforeshow",function(){
	    	getSenhasUtilizador(uniqueID);
	    });
	    
	    //Quando se clica no botão de Refresh é actualizada a página
	   $("#minhasSenhasRefresh").on("click",function(){
	    	getSenhasUtilizador(uniqueID);
	    });

		//Quando se clica numa das senhas grava-se o seu id e a sua localização do gmaps 
	    $("#listaMinhasSenhas").on("click","li",function(){
	    	idSenhaPopUp = $(this).attr("data-idSenha");
	    	getSenhaDetalhes(idSenhaPopUp);
	    });
	    
	    //Quando se confirma a desistencia de uma senha esta é removida
	    $("#desistir_minhas_senhas_page").on("click",function(){
	    	giveUpSenha(idSenhaPopUp);
	    	$( "#desistir_dataCollapsed" ).trigger('collapse');
		});

		//Quando o select "Balcao Atendimento" for alterado o botão "Avançar" fica activo
	    $("#minha_senha_detalhes_page").on("pagebeforeshow",function(){
	    	$('#detalhes_senhaActual').empty();
			$('#detalhes_senhaActual').siblings('.ui-btn-inner').children('.ui-btn-text').text("Senha Actual: "+detalhesSenha[9]);
			$( "#detalhes_senhaActual" ).buttonMarkup( "refresh" );
			$('#detalhes_minhaSenha').val(detalhesSenha[8]);
			$('#detalhes_dataEmissao').val(detalhesSenha[2]+" | "+detalhesSenha[1]);
			$('#detalhes_horaPrevista').val(detalhesSenha[12]);
			$('#detalhes_tempoEspera').val(detalhesSenha[10]);
			$('#detalhes_tempoAtendimento').val(detalhesSenha[11]);
			$('#detalhes_frontDesk').val(detalhesSenha[3]);
			$('#detalhes_localizacao').val(detalhesSenha[4]);
			$('#detalhes_balcaoAtendimento').val(detalhesSenha[5]);
			$('#detalhes_morada').val(detalhesSenha[7]);
	    });

		$("#google_maps").on("pagebeforeshow",function(){
            initialize() ;
	    });
	    
	    $("#getDirections").on("click",function(){
            calculateRoute();
	    });

	 //@end
    },

// result contains any message sent from the plugin call
successHandler: function(result) {
    alert('Callback Success! Result = '+result)
},
errorHandler:function(error) {
    alert(error);
},

onNotificationGCM: function(e) {
        switch( e.event )
        {
            case 'registered':
                if ( e.regid.length > 0 )
                {
                    console.log("Regid " + e.regid);
                    gcmID = e.regid;
                }
            break;
 
            case 'message':
              // this is the actual push notification. its format depends on the data model from the push server
              navigator.notification.alert(
			            e.message,  // message
			            null,         // callback
			            'Aviso',   // title
			            'Ok'                  // buttonName
			        );
              $("#minhasSenhasRefresh").trigger("click");
            break;
 
            case 'error':
              alert('GCM error = '+e.msg);
            break;
 
            default:
              alert('An unknown GCM event has occurred');
              break;
        }
    }



};
