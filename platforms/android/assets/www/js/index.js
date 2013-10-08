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

	    /*
	     * @Declaração de variáveis globais
	     */
	    //Variável que armazena o identificador unico do telemovel
	    var uniqueID = device.uuid;
	    //URL base do webservice
	    var rootURL = "http://10.3.3.126/mrc/api/";
	    //var rootURL = "http://192.168.1.64/mrc/api/";
	    
	    /*
	     * @Declaração de Funções
	     */
	    
	    //Quando se carrega na tecla de retroceder a aplicação fecha
	    function onBackKeyDown() {
			navigator.app.exitApp();
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
	    
	    function addSenha(frontDesk, localizacao,balcaoAtendimento,uniqueID) {
	    	alert("entrou");
	    	$.ajax({
	    		type: 'POST',
	    		contentType: 'application/json',
	    		url: rootURL+"senha",
	    		dataType: "json",
	    		data: JSON.stringify({
	    			"frontDesk": frontDesk, 
	    			"localizacao": localizacao, 
	    			"balcaoAtendimento": balcaoAtendimento,
	    			"uniqueID": uniqueID
	    			}),
	    		success: function(data, textStatus, jqXHR){
	    			alert("sucesso");
	    		},
	    		error: function(jqXHR, textStatus, errorThrown){
	    			alert('Erro: ' + textStatus);
	    		}
	    	});
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
	    })
	    
	    //Quando o select "Localização" for alterado o select "Balcao Atendimento" fica activo
	    //Após o select "Balcao Atendimento" ficar activo, são carregados os dados
	    $("#localizacao").on("change",function(){
	    	$("#balcaoAtendimento").selectmenu( "enable" );
	    	getBalcaoAtendimento($("#frontdesk").val(),$("#localizacao").val());
	    })
	    
	    //Quando o select "Balcao Atendimento" for alterado o botão "Avançar" fica activo
	    $("#balcaoAtendimento").on("change",function(){
	    	$("#gerar_senha_page_avancarButton").removeClass( "ui-disabled" );
	    })
	    
	    //Quando o select "Balcao Atendimento" for alterado o botão "Avançar" fica activo
	    $("#info_gerar_senha_page").on("pagebeforeshow",function(){
	    	getCurrentSenha($("#frontdesk").val(),$("#localizacao").val(),$("#balcaoAtendimento").val());
	    })
	    
	    $("#senhaActual").on("click",function(){
	    	getCurrentSenha($("#frontdesk").val(),$("#localizacao").val(),$("#balcaoAtendimento").val());
	    })
	    
	    $("#info_gerar_senha_page_gerarTicketButton").on("click",function(){
	    	addSenha($("#frontdesk").val(),$("#localizacao").val(),$("#balcaoAtendimento").val(),uniqueID);
	    })
    }
};
