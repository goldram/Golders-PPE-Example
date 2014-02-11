//-------------------------------------------------------------------------------------
//
// Description:	Contains JavaScript specific to displaying and managing information
//              about a Purchasing Officer. 
//		  
//-------------------------------------------------------------------------------------

function Purchaser() {

    var mbDataLoaded = false;
    var mbSavePending = false;
    var mbSaving = false;
    var mbSaveAndClear = false;
    var mbSettingFieldValues = false;
    
    var mbEventHandlersAttached = false; //Ensures event handlers are not attached multiple times.
        
     var mbIE = (!window.addEventListener || navigator.appName.indexOf("Internet Explorer") >= 0) ? true : false;
    var mbUseProxy = false;
    var msXHRResponseFormat = "XML";
    
    var moAjax = null;
    
    var moStatusMsg = null;
    
    var moMainBox = $("EmpBox");
    var moDataBox = null;
    
    var moPurchasers = null;
    
    //-------------------------------------------------------------------------------------
    // Function to return a reference to the specified element/object in the specified container.
    //-------------------------------------------------------------------------------------
    function $field(sID, oBox) {

        if (!oBox) oBox = moMainBox;

        var oItem = null;
        
        try {
	        for (var i=0; i < oBox.childNodes.length; i++)
	        {
	            var oItem = oBox.childNodes[i];
	            if (oItem.id == sID) return oItem;
	        }
        }
        catch(e) {
            return null;
        }
        
        //If we get here, element/field item was not found.
        return null;
    }
     
    //-------------------------------------------------------------------------------------
    // Function to return the value for the specified element/object in the specified container.
    //-------------------------------------------------------------------------------------
    function $fieldVal(sID, oBox) {
            
        if (!oBox) oBox = moMainBox;

        var oItem = null;
        
        try {
	        for (var i=0; i < oBox.childNodes.length; i++)
	        {
	            var oItem = oBox.childNodes[i];
	            if (oItem.id == sID) return oItem.value;
	        }
        }
        catch(e) {
            return null;
        }
        
        //If we get here, element/field item was not found.
        return null;
    }
    
    //-------------------------------------------------------------------------------------
    // Populates the main box.
    //-------------------------------------------------------------------------------------
    function PopulateBox() {
    	
//        var oCompany = $field("Company");
//        var oLocation = $field("Location");
//        var oEmail = $field("Location");
//        var oLocation = $field("Location");
//        var oLocation = $field("Location");
//                       
        //If no Exams, insert a message telling the user.
//        if (oExams.length == 0) {
//            $("ExamDatesActionAdd").innerHTML = "[+] Click here to begin adding new exam dates";
//		    return;
//        }
        
        //Adjustment for field padding and/or border width
        var oRecord = moPurchasers[0];
        
        var sName = $data("FirstName", oRecord) + " " + $data("LastName", oRecord);
        $field("EmpBoxTitle").innerHTML = "Purchase Officer " + sName;
        
        $field("Company").value = $data("CompanyName", oRecord);
        $field("Company").setAttribute("CompanyID", $data("CompanyID", oRecord));
        
        $field("Location").value = $data("CompanySiteName", oRecord);
        $field("Location").setAttribute("CompanySiteID", $data("CompanySiteID", oRecord));
        
        $field("Email").value = $data("EmailAddr", oRecord);
        $field("Email").setAttribute("EmployeeID", $data("EmployeeID", oRecord));
        
        $field("PayMethod").value = $data("PaymentMethod", oRecord);
        $field("PayMethod").setAttribute("EmployeeID", $data("EmployeeID", oRecord));
        
        $field("PayNumber").value = $data("PaymentDetail", oRecord);
        $field("PayNumber").setAttribute("EmployeeID", $data("EmployeeID", oRecord));
        
    }
    
    //-------------------------------------------------------------------------------------
    // Submits AJAX request to retrieve Purchaser info.
    //-------------------------------------------------------------------------------------
    this.Retrieve = function(sUserID) {

	    //Display status message.   
	    //ClearStatusMsg("main"); 
	    //SetMainStatusMsg("Deleting Lead Source...", "", false);
            
	    //Build parms string.
        var sParms	= "";
	    sParms += "&Action=" + encodeURI("GetPurchaser");
	    sParms += "&EmployeeID="   + encodeURI(sUserID);
	    //sParms += "&PurchaserID="   + encodeURI(IsNull($("UserID").value, 2));
	    //sParms += "&LeadSourceName=" + encodeURI(sName);
	    //sParms += "&LeadSourceCode=" + encodeURI(sCode);

	    //Set URL/URI. If using a cross-domain server-side proxy, modify the URL and establish the
	    //URL/URI for the server-side proxy.
	    var sURL = "db.aspx";
	    if (mbUseProxy) 
	    {
		    //Set URL for remote URL and server-side proxy.
		    var sRemoteURL = $("XXXXXX").value + sURL;
		    sURL  = "XDomainProxy.aspx";
        }
    	
	    //Modify parms string for use by server-side proxy. Replace equal signs and ampersands so proxy 
	    //ignores the fieldname-value pairs and passes them on to the remote URL.
	    if (mbUseProxy)
	    { 
		    sParms = sParms.replace(/=/g,"||");
		    sParms = sParms.replace(/&/g,"|*|");
    		
		    sParms  = "Parms="		+ sParms;
		    sParms += "&RemoteURL=" + sRemoteURL;
		    sParms += "&Format="	+ msXHRResponseFormat;
	    }
    	
	    //Initiate XMLHttpRequest call to local remote call proxy.
	    var bSuccess = AjaxSend("POST", sURL, sParms, RetrieveCallback);
    	
	    //If not initiated, clear all status messages. 
	    if (!bSuccess) ClearStatusMsg();

    }

    //-------------------------------------------------------------------------------------
    // Callback for Retrieve method. 
    //-------------------------------------------------------------------------------------
    function RetrieveCallback() 
    {  
	    if ((moAjax.readyState == 4) && (moAjax.status == 200))  
	    {  
			var sResult = moAjax.responseText;
			
			var sError = AjaxError(sResult);
			if (sError.length > 0)  
			{
			    var sMsg = "Unable to retrieve Purchaser info. \n\nError details: " + sError;
			    alert(sMsg);
			    return;
			}
			
			var oXml = (mbIE) ? moAjax.responseXML.childNodes[0] : moAjax.responseXML.documentElement; 
			    
			moPurchasers = oXml.getElementsByTagName("Table");
			
			//Release memory for AJAX object.
			moAjax = null;
			
			PopulateBox();
    		
		    //SetStatusMsg(sResult, "main");
	    } 
    }

    //-------------------------------------------------------------------------------------
    // Returns new XMLHttpRequest object. 
    //-------------------------------------------------------------------------------------
    function AjaxCreate() 
    {        
	    if (window.XMLHttpRequest)         
	    {      
		    return new XMLHttpRequest();         
	    }       
	    else if (window.ActiveXObject) 
	    {   
		    return new ActiveXObject("Microsoft.XMLHTTP");       
	    } 
    }

    //-------------------------------------------------------------------------------------
    // Returns Ajax error (if any). 
    //-------------------------------------------------------------------------------------
    function AjaxError(sResults) 
    { 
        var sError = "";
        
        try 
        {
            var oResults = sResults.split("|");
	        var sStatus = oResults[0].split("=")[1];
	        if (sStatus.toLowerCase() == "error")
	        {
	            sError = oResults[1].split("=")[1];
	        }
	    }
	    catch(e) {}
	    
	    return sError;
    }

    //-------------------------------------------------------------------------------------
    // Initiate XMLHttpRequest call to specified URL/URI. 
    //-------------------------------------------------------------------------------------
    function AjaxSend(sType, sURL, sParms, oCallback){    

	    //Create XmlHttpRequest object.
	    moAjax = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    	
	    //If error creating XHR object, get outta here.
	    if (!moAjax)
	    {
		    alert("Error: Unable to create AJAX object.");
		    return false;
	    }   
    	
	    if (sType == "POST") 
	    {	
		    //Set POST properties and send HTTP request.
		    //moAjax.onreadystatechange = OnAjaxStateChange;    
		    moAjax.onreadystatechange = oCallback;    
		    moAjax.open("POST", sURL, true);  
		    moAjax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		    //moAjax.setRequestHeader("Content-length", sParms.length);
		    moAjax.send(sParms);
	    }
	    else
	    {
		    alert("AJAX get-style call not implemented. Request cancelled.");
		    return false;
	    }
    	
	    return true;
    }

}
