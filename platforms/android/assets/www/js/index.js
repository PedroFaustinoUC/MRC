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
     * @Fun��o executada quando a APP inicia
     */
    onDeviceReady: function() {
    	//Configura��es para suporte do PhoneGap
    	//http://view.jquerymobile.com/1.3.2/dist/demos/faq/how-configure-phonegap-cordova.html
    	$.support.cors=true;
		$.mobile.buttonMarkup.hoverDelay=0;
		$.pushStateEnabled=false;
	    $.mobile.allowCrossDomainPages = true;
	    $.mobile.defaultPageTransition='none';
	    $.mobile.defaultDialogTransition='none';
	    
	    var pushNotification = window.plugins.pushNotification;
	    pushNotification.register(app.successHandler, app.errorHandler,{"senderID":"497143846050","ecb":"app.onNotificationGCM"});
	    
	    //Listener da tecla de retroceder
    	document.addEventListener("backbutton", onBackKeyDown, false);
    	
    	document.addEventListener("offline", onOffline, false);

	    /*
	     * @Declara��o de vari�veis globais
	     */
	    //Vari�vel que armazena o identificador unico do telemovel
	    var uniqueID = device.uuid;
	    //URL base do webservice
	    //var rootURL = "http://10.3.3.126/mrc/api/";
	    var rootURL = "http://10.3.1.39/mrc/api/";
	    var gmaps ="";
	    var idSenhaPopUp = 0;
	    //var rootURL = "http://192.168.1.64/mrc/api/";
	    
	    /*
	     * @Declara��o de Fun��es
	     */
	    
	    //Quando se carrega na tecla de retroceder a aplica��o fecha
	    function onBackKeyDown() {
	    	//playBeep()
	    	//vibrate()
	    	//navigator.app.exitApp();
		};
		
		//Alerta que surge quando se desiste de uma senha
		function showAlertDesistir() {
	        navigator.notification.alert(
	            'Senha removida!',  // message
	            null,         // callback
	            'Desistir da Senha',   // title
	            'Ok'                  // buttonName
	        );};
	        
	    //Evento da liga��o � internet perdida
		function onOffline(){
			alert("Sem liga��o � internet!");
		};
		
	    //Webservice - carregamento dos servi�os de atendimento
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
	    
	  //Webservice - carregamento das localiza��es 
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
	    
	  //Webservice - carregamento dos balc�es de antedimento
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
			            $('#minhasSenhasRefresh').siblings('.ui-btn-inner').children('.ui-btn-text').text("N�o existem senhas");
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
						lista+=('<li data-gmaps="'+senhas.googleMaps+'" data-idSenha="'+senhas.idSenha+'"><a href="#popupsenha" data-rel="popup"><h2>'+senhas.nomeBalcaoAtendimento+'</h2><p><strong>'+senhas.nomeLocalizacao+'</strong></p><br>');
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
					showAlertDesistir();
					$("#minhas_senhas_page").trigger("pageshow");
				},
				error: function(jqXHR, textStatus, errorThrown){
					alert('Erro: ' + textStatus);
				}
			});
		    }
		
				

	    /* ____________
	     * |IMPORTANTE|
	     *  ----------
	     * @Ecr� inicial da APP corresponde ao menu "Gerar Senha"
	     * � necess�rio carregar a lista de Servi�os de Atendimento assim que a APP inicia
	     */
	    getFrontDesk();
	    
	    /*
	     * @Declara��o de Eventos
	     */   
	    //Cada acesso � p�gina "Gerar Ticket" requer uma chamada ao webservice correspondente
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
	    
	    //Quando o select "Servi�o de Atendimento" for alterado o select "Localiza��o" fica activo
	    //Ap�s o select "Localizacao" ficar activo, s�o carregados os dados
	    $("#frontdesk").on("change",function(){
	    	$("#localizacao").selectmenu( "enable" );
	    	$('#balcaoAtendimento').empty();
	    	$('#balcaoAtendimento').selectmenu( "disable" );
	    	$( "#balcaoAtendimento" ).selectmenu( "refresh" );
	    	$("#gerar_senha_page_avancarButton").addClass( "ui-disabled" );
	    	getLocalizacao($("#frontdesk").val());
	    })
	    
	    //Quando o select "Localiza��o" for alterado o select "Balcao Atendimento" fica activo
	    //Ap�s o select "Balcao Atendimento" ficar activo, s�o carregados os dados
	    $("#localizacao").on("change",function(){
	    	$("#balcaoAtendimento").selectmenu( "enable" );
	    	getBalcaoAtendimento($("#frontdesk").val(),$("#localizacao").val());
	    })
	    
	    //Quando o select "Balcao Atendimento" for alterado o bot�o "Avan�ar" fica activo
	    $("#balcaoAtendimento").on("change",function(){
	    	$("#gerar_senha_page_avancarButton").removeClass( "ui-disabled" );
	    })
	    
	    //Quando o select "Balcao Atendimento" for alterado o bot�o "Avan�ar" fica activo
	    $("#info_gerar_senha_page").on("pagebeforeshow",function(){
	    	getCurrentSenha($("#frontdesk").val(),$("#localizacao").val(),$("#balcaoAtendimento").val());
	    })
	    
	    //Quando se clica no bot�o da senha actual a p�gina � actualizada 
	    $("#senhaActual").on("click",function(){
	    	getCurrentSenha($("#frontdesk").val(),$("#localizacao").val(),$("#balcaoAtendimento").val());
	    })
	    
	    //Quando se clica no bot�o de gerar ticket � gerada uma nova senha
	    $("#info_gerar_senha_page_gerarTicketButton").on("click",function(){
	    	addSenha($("#frontdesk").val(),$("#localizacao").val(),$("#balcaoAtendimento").val(),uniqueID);
	    })
	    
	    //Quando a p�gina das senhas � carregada 
	    $("#minhas_senhas_page").on("pageshow",function(){
	    	getSenhasUtilizador(uniqueID);
	    })
	    
	   $("#minhasSenhasRefresh").on("click",function(){
	    	getSenhasUtilizador(uniqueID);
	    })
	    
	    $("#listaMinhasSenhas").on("click","li",function(){
	    	gmaps = $(this).attr("data-gmaps");
	    	idSenhaPopUp = $(this).attr("data-idSenha");
	    })
	    
	    $("#desistir_minhas_senhas_page").on("click",function(){
	    	giveUpSenha(idSenhaPopUp);
		})
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
                    alert('registration id = '+e.regid);
                }
            break;
 
            case 'message':
              // this is the actual push notification. its format depends on the data model from the push server
              alert('message = '+e.message+' msgcnt = '+e.msgcnt);
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
