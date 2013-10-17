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
	        
	    //Listener da tecla de retroceder
    	document.addEventListener("backbutton", onBackKeyDown, false);
    	
    	document.addEventListener("offline", onOffline, false);

	    /*
	     * @Declaração de variáveis globais
	     */
	    //Variável que armazena o identificador unico do telemovel
	    var uniqueID = device.uuid;
	    //URL base do webservice
	    //var rootURL = "http://10.3.3.126/mrc/api/";
	    var rootURL = "http://10.3.1.39/mrc/api/";
	    var idSenhaPopUp = 0;
	    var detalhesSenha=[];
	    var windowWidth = $(window).width();
        var windowHeight = $(window).height();
        var directionDisplay,directionsService = new google.maps.DirectionsService(),map;
	    //var rootURL = "http://192.168.1.64/mrc/api/";
	    
	    /*
	     * @Declaração de Funções
	     */
	    
	    //Quando se carrega na tecla de retroceder a aplicação fecha
	    function onBackKeyDown() {
	    	//playBeep()
	    	//vibrate()
	    	navigator.app.exitApp();
		};
		        
	    //Evento da ligação à internet perdida
		function onOffline(){
			alert("Sem ligação à internet!");
		};
		
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
				},
				error: function(jqXHR, textStatus, errorThrown){
					alert('Erro: ' + textStatus);
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
				},
				error: function(jqXHR, textStatus, errorThrown){
					alert('Erro: ' + textStatus);
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
				},
				error: function(jqXHR, textStatus, errorThrown){
					alert('Erro: ' + textStatus);
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
				},
				error: function(jqXHR, textStatus, errorThrown){
					alert('Erro: ' + textStatus);
				}
			});
		    }
	    
		//Webservice - gerar senha
	    function addSenha(frontDesk, localizacao,balcaoAtendimento,uniqueID) {
	    	$.ajax({
	    		type: 'POST',
	    		contentType: 'application/json',
	    		url: rootURL+"senhas",
	    		dataType: "json",
	    		data: JSON.stringify({
	    			"frontDesk": frontDesk, 
	    			"localizacao": localizacao, 
	    			"balcaoAtendimento": balcaoAtendimento,
	    			"uniqueID": uniqueID
	    			}),
	    		success: function(data, textStatus, jqXHR){
	    			getSenhaUtilizador(data.id);
	    			$.mobile.changePage("#popupSenhaActual",{ role: "dialog" } );
	    		},
	    		error: function(jqXHR, textStatus, errorThrown){
	    			alert('Erro: ' + textStatus);
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
				},
				error: function(jqXHR, textStatus, errorThrown){
					alert('Erro: ' + textStatus);
				}
			});
		    }
	    
	  //Webservice - verificar senhas do utilizador
	    function getSenhasUtilizador(uniqueID){
		    $.ajax({
				type: 'GET',
				url: rootURL+"utilizador/"+uniqueID,
				dataType: "json", // data type of response
				success: function(data){
					$('#listaMinhasSenhas').empty();
					var list = data == null ? [] : (data.senhas instanceof Array ? data.senhas : [data.senhas]);
					if(data.senhas.length==0)
						{
						$('#minhasSenhasRefresh').empty();
			            $('#minhasSenhasRefresh').siblings('.ui-btn-inner').children('.ui-btn-text').text("Não existem senhas");
						$( "#minhasSenhasRefresh" ).buttonMarkup( "refresh" );
						}
					else 
					{
						$('#minhasSenhasRefresh').empty();
			            $('#minhasSenhasRefresh').siblings('.ui-btn-inner').children('.ui-btn-text').text("Actualizar");
						$( "#minhasSenhasRefresh" ).buttonMarkup( "refresh" );
						}
					var idControlo = 0;
					var lista = "";				
					$.each(list, function(index, senhas) {
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
						
						lista+=('<p><strong>Minha Senha: </strong>'+senhas.nSenhaUtilizador+'</p></a></li>')
					});
					$('#listaMinhasSenhas').append(lista);
					$( "#listaMinhasSenhas" ).listview( "refresh" );
				},
				error: function(jqXHR, textStatus, errorThrown){
					alert('Erro: ' + textStatus);
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
					$("#minhas_senhas_page").trigger("pageshow");
				},
				error: function(jqXHR, textStatus, errorThrown){
					alert('Erro: ' + textStatus);
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
					});
				},
				error: function(jqXHR, textStatus, errorThrown){
					alert('Erro: ' + textStatus);
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
            	navigator.geolocation.getCurrentPosition(onSuccessGPS, onErrorGPS);
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
				$("#to").val(mapCenter);
            }

            function calculateRoute() 
            {
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
	    
	    /*
	     * @Declaração de Eventos
	     */   
	    //Cada acesso à página "Gerar Ticket" requer uma chamada ao webservice correspondente
	    //Isto permite ter os dados actualizados
	    $("#gerar_senha_page").on( "pageshow", function(){
	    	$("#localizacao").empty();
	    	$("#localizacao").selectmenu( "disable" );
	    	$( "#localizacao" ).selectmenu( "refresh" );
	    	$('#balcaoAtendimento').empty();
	    	$('#balcaoAtendimento').selectmenu( "disable" );
	    	$( "#balcaoAtendimento" ).selectmenu( "refresh" );
	    	$("#gerar_senha_page_avancarButton").addClass( "ui-disabled" );
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
	    	getLocalizacao($("#frontdesk").val());
	    });
	    
	    //Quando o select "Localização" for alterado o select "Balcao Atendimento" fica activo
	    //Após o select "Balcao Atendimento" ficar activo, são carregados os dados
	    $("#localizacao").on("change",function(){
	    	$("#balcaoAtendimento").selectmenu( "enable" );
	    	getBalcaoAtendimento($("#frontdesk").val(),$("#localizacao").val());
	    });
	    
	    //Quando o select "Balcao Atendimento" for alterado o botão "Avançar" fica activo
	    $("#balcaoAtendimento").on("change",function(){
	    	$("#gerar_senha_page_avancarButton").removeClass( "ui-disabled" );
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
	    	addSenha($("#frontdesk").val(),$("#localizacao").val(),$("#balcaoAtendimento").val(),uniqueID);
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
		});

		//Quando o select "Balcao Atendimento" for alterado o botão "Avançar" fica activo
	    $("#minha_senha_detalhes_page").on("pagebeforeshow",function(){
	    	$('#detalhes_senhaActual').empty();
			$('#detalhes_senhaActual').siblings('.ui-btn-inner').children('.ui-btn-text').text("Senha Actual: "+detalhesSenha[9]);
			$( "#detalhes_senhaActual" ).buttonMarkup( "refresh" );
			$('#detalhes_minhaSenha').val(detalhesSenha[8]);
			$('#detalhes_dataEmissao').val(detalhesSenha[2]+" na data "+detalhesSenha[1]);
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
    }
};
