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
     * @Fun��o executada assim que a APP inicia
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

	    /*
	     * @Declara��o de vari�veis globais
	     */
	    //Vari�vel que armazena o identificador unico do telemovel
	    var uniqueID = device.uuid;
	    //URL base do webservice
	    var rootURL = "http://10.3.3.126/mrc/api/";
	    
	    /*
	     * @Declara��o de Fun��es
	     */
	    //Webservice - carregamento da lista de servi�os de atendimento
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
	    
	  //Webservice - carregamento da localiza��o do servi�o de atendimento
	    function getLocalizacao(id){
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
	    $("#gerar_senha_page").on( "pageshow", getFrontDesk());
	    
	    //Quando o valor do select "Servi�o de Atendimento" for alterado, o select "Localiza��o" fica activo
	    $("#frontdesk").on("change",function(){
	    	$("#localizacao").selectmenu( "enable" );
	    	getLocalizacao(id)
	    })
	    
	    
	    
    }
};
