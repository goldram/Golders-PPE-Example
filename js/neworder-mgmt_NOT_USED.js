//-------------------------------------------------------------------------------------
//
// Description:	Contains JavaScript specific to authorizing a new order.
//		  
//-------------------------------------------------------------------------------------

function AuthorizeNewOrder() {

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
    var moAjaxEmployees = null;
    var moAjaxOrderQty = null;
    
    var moCloak = new Cloaker();
    
    var moStatusMsg = null;
    var moMainBox = $("NewOrderBox");
    var moOrderQtyBox = $("OrderQtyDataBox");
    
    var moOrderQty = null;
    var moEmployees = null;
    
    var mbEmployeesLoading = false;
    var mbOrderQtyLoading = false;
    
    //-------------------------------------------------------------------------------------
    // Function to return a reference to an element in the main container.
    //-------------------------------------------------------------------------------------
    function $field(sID) {
    
        var oItem = null;
        
        try {
		    for (var i=0; i < moMainBox.childNodes.length; i++)
		    {
		        var oItem = moMainBox.childNodes[i];
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
    // Function to return data from an XML node.
    //-------------------------------------------------------------------------------------
    function $data(sID, oRecord) {
        
        try {
		    if (mbIE) 
		        return oRecord.getElementsByTagName(sID)[0].text;
		    else
		        return oRecord.getElementsByTagName(sID)[0].textContent;
        }
        catch(e) {
            return null;
        }
        
        //If we get here, element/field item was not found.
        return null;
    }
  	
    //-------------------------------------------------------------------------------------
    // Resets/clears all status message objects when the user begins typing into an input 
    // field.
    //-------------------------------------------------------------------------------------
    function ClearStatusMsg() 
    {

        SetStatusMsg("StatusMsg", "");
    }
    
    //-------------------------------------------------------------------------------------
    // Returns object containing field value and whether it has been updated or not.
    //-------------------------------------------------------------------------------------
    function GetFieldValue(oData, sFieldID) {
    	
        var oResult = null;
        
        var oFields = oData.childNodes;
            
        for (var i=0; i < oFields.length; i++){
            var oField = oFields[i];
            if (oField.id === sFieldID) {
                var sTag = oField.tagName.toLowerCase();
                //sCurrVal = (sTag === "label") ? oField.innerHTML : oField.value;
                sCurrVal = (oField.readOnly === true || sTag === "label") ? oField.getAttribute("LastVal") : oField.value;
                sLastVal = oField.getAttribute("LastVal");
                oResult = {
                    "Updated" : (sCurrVal === sLastVal) ? false : true,
                    "Value"   : sCurrVal
                };
                break;
            }
        }   

        //Return result.
        return oResult;
    }

    //-------------------------------------------------------------------------------------
    // Returns a string of pipe-delimited values containing the Order Quantity values.
    //-------------------------------------------------------------------------------------
    function GetOrderQtyValues() {

        var sVals = "";
        
        var bInvalidValuesFound = false;
            
        var oData = moOrderQtyBox.childNodes;

        //Build pipe-delimited string of values. Each name-value pair is separated by a 
        //single pipe character, and each record is separated by two pipe-characters. 
        var bValidDate;
        for (var i=0; i<oData.length; i++)
        {
            //ignore text nodes.
            if (oData[i].nodeType != 1) continue; 
            
            var sStatus = oData[i].getAttribute("UpdateStatus");
            
            var sOrderID = oData[i].getAttribute("OrderID");
            var sProductGroupID = oData[i].getAttribute("ProductGroupID");
            var sQty = GetFieldValue(oData[i],"OrderQty").Value;
           
            if (sStatus == "delete") 
            {
                sVals += "UpdateStatus="    + sStatus  + "|";
                sVals += "OrderID="         + sOrderID + "|";
                sVals += "ProductGroupID="  + sProductGroupID + "|";
                       
                sVals += "|"; //Double-up pipe character for record delimiter.
            }
            else
            if (sStatus == "update" || sStatus == "insert") 
            {
                sVals += "UpdateStatus="    + sStatus           + "|";
                sVals += "OrderID="         + sOrderID          + "|";
                sVals += "ProductGroupID="  + sProductGroupID   + "|";
                sVals += "Qty="             + sQty              + "|";
                 
                //var oField = GetFieldValue("RegCount");
                //if (oDateField.Updated) sVals += "RegCount=" + oField.Value + "|";
                        
                sVals += "|"; //Double-up pipe character for record delimiter.
            }
            
        }

        //alert("Modified Exam Time values: " + sVals);

        //Return string to caller.
        return (bInvalidValuesFound) ? "ERROR: Invalid values found." : sVals;
    }

    //-------------------------------------------------------------------------------------
    // Hide the main user interface. 
    //-------------------------------------------------------------------------------------
    this.HideUI = function() {
    
        ClearStatusMsg();
    
        //Hide the cloak.
        moCloak.Hide();

        //Hide the popup.
	    moMainBox.style.visibility = "hidden";
	    //moMainBox.style.display = "none";
    }

    //-------------------------------------------------------------------------------------
    // Retrieves all data required by the user interface.
    //-------------------------------------------------------------------------------------
    this.InitUI = function() {
    
        //Set the status message object.
        var oLabels = moMainBox.getElementsByTagName("LABEL");
        for (var i=0; i<oLabels.length; i++)
        {
            if (oLabels[i].className == "StatusMsg") 
            {
                moStatusMsg = oLabels[i];
                break;
            }
        }
        
        RetrieveEmployees(); 
        
        RetrieveQtyDefaults();  
    }
        
    //-------------------------------------------------------------------------------------
    // Inserts a new data item into the Order Qty data box.
    //-------------------------------------------------------------------------------------
    function PopulateQtyBoxItem(oBox, oData, sUpdateStatus) {
    
        //Adjustment for field padding and/or border width.
        var iAdjust = 1;
        var iCalAdjust = 23;
        
        //Insert container for all columns/fields.
	    var oItemBox = document.createElement("DIV");
	    oItemBox.id = "DataItemBox";
	    oItemBox.style.margin = "5px 0px 5px 0px";
        oItemBox.setAttribute("UpdateStatus", sUpdateStatus);
        oItemBox.setAttribute("OrderID", IsNull(oData.OrderID, "0"));
        oItemBox.setAttribute("ProductCategoryID", oData.ProductCategoryID);
        oItemBox.setAttribute("ProductGroupID", oData.ProductGroupID);
	    oBox.appendChild(oItemBox);
            
        //Insert input field for Order Quantity.
	    var oItem = document.createElement("INPUT");
	    oItem.type = "text";	
	    oItem.id = "OrderQty";
	    oItem.className = "FieldVal Center";
	    oItem.maxLength = "3";
        oItem.style.left  = "5px";
        oItem.style.width = "30px";	
        //oItem.style.width = $("OrderQtyHdr").offsetWidth + "px";	
	    oItem.value = oData.DefaultQty;
        oItem.setAttribute("LastVal", oData.DefaultQty);
        oItem.setAttribute("OrderID", oData.OrderID);
        oItem.setAttribute("ProductCategoryID", oData.ProductCategoryID);
        oItem.setAttribute("ProductGroupID", oData.ProductGroupID);
        //AddEvt(oItem, "keydown", SetSave);
	    oItemBox.appendChild(oItem);

        //Insert field for Order Category and Group.
        var oItem = document.createElement("INPUT");
        oItem.type = "text";
        oItem.id = "OrderCategory";
        oItem.readOnly = true; //do not allow editting
        oItem.tabIndex = -1; //prevent tab stop
        oItem.className = "FieldVal ReadOnly NoBorder";
        oItem.style.left  = "50px";
        oItem.style.width = "300px";	
        oItem.value = oData.ProductCategory 
        if (oData.ProductCategory != oData.ProductGroup) oItem.value += " - " + oData.ProductGroup;
        oItem.setAttribute("LastVal", oData.ProductCategory);
        oItem.setAttribute("ProductCategoryID", oData.ProductCategoryID);
        oItem.setAttribute("ProductGroupID", oData.ProductGroupID);
        oItemBox.appendChild(oItem);

        //Insert field for Order Group.
//        var oItem = document.createElement("INPUT");
//        oItem.type = "text";
//        oItem.id = "OrderGroup";
//        oItem.readOnly = true;
//        oItem.className = "FieldVal ReadOnly NoBorder";
//        oItem.style.left  = $("OrderGroupHdr").offsetLeft + "px";
//        oItem.style.width = $("OrderGroupHdr").offsetWidth - 6 + "px";	
//        oItem.value = oData.ProductGroup;
//        oItem.setAttribute("LastVal", oData.ProductGroup);
//        oItem.setAttribute("ProductGroupID", oData.ProductGroupID);
//        oItemBox.appendChild(oItem);
//        
    }    
    
    //-------------------------------------------------------------------------------------
    // Submits AJAX request to retrieve Employees.
    //-------------------------------------------------------------------------------------
    function RetrieveEmployees() {

	    //Display status message.   
	    //ClearStatusMsg("main"); 
	    SetStatusMsg("StatusMsg", "Retrieving employee list...", "", false);
 	    
	    //Create XmlHttpRequest object.
	    moAjaxEmployees = AjaxCreate("Employees");
	    if (!moAjaxEmployees) return;
          
	    //Build parms string.
        var sParms	= "";
	    sParms += "&Action=" + encodeURI("GetEmployee");
	    sParms += "&UserID=" + encodeURI($("UserID").value);
	    //Get the Company ID from the Company filter.
	    sParms += "&CompanyID=" + encodeURI(IsNull($("CompanyID").value, 0));
    	
	    //Initiate call to database.
	    var bSuccess = AjaxSend(moAjaxEmployees, sParms, RetrieveEmployeesCallback);
    	
	    //If not initiated, clear all status messages. 
	    if (!bSuccess) ClearStatusMsg();

    }

    //-------------------------------------------------------------------------------------
    // Callback for RetrieveEmployees method. 
    //-------------------------------------------------------------------------------------
    function RetrieveEmployeesCallback() 
    {  
	    if ((moAjaxEmployees.readyState == 4) && (moAjaxEmployees.status == 200))  
	    {  
			var sResult = moAjaxEmployees.responseText;
			
			var sError = AjaxError(sResult);
			if (sError.length > 0)  
			{
			    alert("Unable to retrieve quantity defaults. \n\n\ Error details:" + sError);
			    moAjaxEmployees = null;
			    return;
			}
			
			var oXml = (mbIE) ? moAjaxEmployees.responseXML.childNodes[0] : moAjaxEmployees.responseXML.documentElement; 
			
			//Store the data in local object.    
			moEmployees = oXml.getElementsByTagName("Table");
			
			//Release memory for AJAX object.
			moAjaxEmployees = null;
			
			//Clear the dropdown.
			var oDropdown = $("Employee");
			oDropdown.innerHTML = "";
        
            //Add blank option.
            AddSelectOption(document, oDropdown, " ", 0, 0);
			
            //Populate dropdown.
            for (var i=0; i < moEmployees.length; i++) 
            {
                var oRecord = moEmployees[i];
                
                var sID = $data("EmployeeID", oRecord);
                var sFirstName = $data("FirstName", oRecord);
                var sLastName = $data("LastName", oRecord);
                var sSite = $data("CompanySiteName", oRecord);
                
                var sName = sFirstName + " " + sLastName + "  (" + sSite + ")";
                
                AddSelectOption(document, oDropdown, sName, sID, i + 1);
		    }
            		
		    //SetStatusMsg(sResult, "main");
	    } 
			    
    }
        
    //-------------------------------------------------------------------------------------
    // Submits AJAX request to retrieve order quantity defaults.
    //-------------------------------------------------------------------------------------
    function RetrieveQtyDefaults() {

	    //Display status message.   
	    //ClearStatusMsg("main"); 
	    SetStatusMsg("StatusMsg", "Retrieving quantity requirements...", "", false);
 	    
	    //Create XmlHttpRequest object.
	    moAjaxOrderQty = AjaxCreate("Order Quantities");
	    if (!moAjaxOrderQty) return;
            
	    //Build parms string.
        var sParms	= "";
	    sParms += "&Action=" + encodeURI("GetOrderQtySpecs");
	    sParms += "&CompanyID=" + encodeURI(IsNull($("CompanyID").value, 0));
	    sParms += "&OrderID=0";
    	
	    //Initiate call to database.
	    var bSuccess = AjaxSend(moAjaxOrderQty, sParms, RetrieveQtyDefaultsCallback);
    	
	    //If not initiated, clear all status messages. 
	    if (!bSuccess) ClearStatusMsg();

    }

    //-------------------------------------------------------------------------------------
    // Callback for RetrieveQtyDefaults method. 
    //-------------------------------------------------------------------------------------
    function RetrieveQtyDefaultsCallback() 
    {  
	    if ((moAjaxOrderQty.readyState == 4) && (moAjaxOrderQty.status == 200))  
	    {  
			var sResult = moAjaxOrderQty.responseText;
			
			var sError = AjaxError(sResult);
			if (sError.length > 0)  
			{
			    alert("Unable to retrieve quantity defaults. \n\n\ Error details:" + sError);
			    moAjaxOrderQty = null;
			    return;
			}
			
			var oXml = (mbIE) ? moAjaxOrderQty.responseXML.childNodes[0] : moAjaxOrderQty.responseXML.documentElement; 
			    
			moOrderQty = oXml.getElementsByTagName("Table");
			
			//Release memory for AJAX object.
			moAjaxOrderQty = null;
			
			//Clear the data box contents.
			moOrderQtyBox.innerHTML = "";
			
            //Display data.
            for (var i=0; i < moOrderQty.length; i++) 
            {
                var oRecord = moOrderQty[i];
                
                var oData = {
		            "OrderID"           : $data("OrderID", oRecord), 
		            "ProductCategoryID" : $data("ProductCategoryID", oRecord), 
		            "ProductCategory"   : $data("ProductCategory", oRecord), 
		            "ProductGroupID"    : $data("ProductGroupID", oRecord), 
		            "ProductGroup"      : $data("ProductGroup", oRecord), 
		            "DefaultQty"        : $data("DefaultQty", oRecord) 
		        }
		        
		        PopulateQtyBoxItem(moOrderQtyBox, oData, "insert");
		    }
            
            //Adjust height of popup.
            moMainBox.style.height = moOrderQtyBox.offsetTop + (moOrderQty.length * 27) + "px"; 
               		
		    SetStatusMsg("StatusMsg", "");
	    } 
    }
    
    //-------------------------------------------------------------------------------------
    // Sets status message. 
    //-------------------------------------------------------------------------------------
    function SetStatusMsg(sMsgID, sMsg, sDetails, bError, bTimeout, sColor, iTimeoutLength) 
    {
	    var oMsg = (sMsgID == "StatusMsg") ? moStatusMsg : $(sMsgID);
    	
	    if (bError) 
	    {
		    oMsg.style.color = "red";
		    oMsg.innerHTML = sMsg;
		    oMsg.title = sDetails;
		    oMsg.style.visibility = "visible";
	    }
	    else if ((sMsg.length > 0) && (!bError))
	    {
		    oMsg.style.color = (sColor) ? sColor : "rgb(0,192,30)";  //darker green by default
		    oMsg.innerHTML = sMsg;
		    if (sDetails) oMsg.title = sDetails;
		    oMsg.style.visibility = "visible";
	    }
	    else 
	    {
		    oMsg.style.color = "green";
		    oMsg.innerHTML = "";
		    oMsg.title = "";
		    oMsg.style.visibility = "hidden";
	    }		
         
	    //Clear message after a delay, if requested.
	    if (bTimeout) {
	        iTimeoutLength = (iTimeoutLength == null) ? 2000 : iTimeoutLength;
	        //setTimeout("SetStatusMsg('" + sMsgID + "','')", iTimeoutLength); 
	        //setTimeout("ClearStatusMsg()", iTimeoutLength); 
	        setTimeout(function() {SetStatusMsg(sMsgID,"");}, iTimeoutLength); 
	    }  

    }

    //-------------------------------------------------------------------------------------
    // Show the main user interface.
    //-------------------------------------------------------------------------------------
    this.ShowUI = function() {
        
        var iLeft = 100;
        var iTop = 470;
        var bModal = true;
                    
        //Throw a cloak over all elements on the page.
        moCloak.Show("ContentBox", GetMaxZindex(), "ContentBox");
        
        //SetFieldDefaults(sFirstName, sLastName, sZipCode);
        
        moMainBox.style.zIndex = GetMaxZindex();
        
        moMainBox.style.left = iLeft + "px";
        moMainBox.style.top  = iTop + "px";
        
        moMainBox.style.visibility = "visible";
        //moMainBox.style.display = "inline";
        
        //moMainBox.style.width  = $("PopupContent").offsetWidth + "px";
        //moMainBox.style.height = $("PopupContent").offsetHeight + "px";
       
    }

    //-------------------------------------------------------------------------------------
    // Submits authorized order data to the database.
    //-------------------------------------------------------------------------------------
    this.SubmitAuthorizedOrder = function() {
        
        //If processing another action don't allow save action.
        //if (IsBusy()) return;
        
        if (!ValidateChanges()) return; 
        
        var sQtyValues = GetOrderQtyValues();
        
        if (sQtyValues.length == 0) 
        {
            var sMsg = "There are no order quantities no changes pending. Order authorization cancelled.";
            SetStatusMsg("StatusMsg", sMsg, "", false, true, "red");
            return;
        }
     
        var sMsg = "Authorizing order, please wait...";
        SetStatusMsg("StatusMsg", sMsg, "", false, false);
       
        mbSaving = true;
        
	    //Create XmlHttpRequest object.
	    moAjax = AjaxCreate("Order information");
	    if (!moAjax) return;
          
	    //Build parms string.
        var sParms	= "";
	    sParms += "&Action="            + encodeURI("SaveAuthorizedOrder");
	    sParms += "&PurchaserID="       + encodeURI($("UserID").value);
	    sParms += "&EmployeeID="        + encodeURI($("Employee").value);
	    sParms += "&CompanyID="         + encodeURI($("CompanyID").value);
	    sParms += "&PaymentMethod="     + encodeURI($("OrderPayMethod").value);
	    sParms += "&DeliverMethod="    + encodeURI($("DeliverTo").value);
	    sParms += "&QtyValues="         + encodeURI(sQtyValues);
    	
	    //Initiate call to database.
	    var bSuccess = AjaxSend(moAjax, sParms, SubmitAuthorizedOrderCallback);
    	
	    //If not initiated, clear all status messages. 
	    if (!bSuccess) ClearStatusMsg();
        
    }

    //-------------------------------------------------------------------------------------
    // Callback for SubmitOrderAuth method. 
    //-------------------------------------------------------------------------------------
    function SubmitAuthorizedOrderCallback() 
    {  
	    var bKeepTrying = ((moAjax.readyState == 4) && (moAjax.status == 200)) ? false : true;
	    
	    if (bKeepTrying) return; 
	    
		var sResult = moAjax.responseText;
		
		//Check for error.
		var sError = AjaxError(sResult);
		if (sError.length > 0)  
		{
            var sMsg = "Unable to submit order authorization.";
            var sMsgDetail = "Error details: " + sError;
            SetStatusMsg("StatusMsg", sMsg, sMsgDetail, true, false);
	        moAjax = null;
	        mbSaving = false;
	        return;
		}
		
		//var oXml = (mbIE) ? moAjax.responseXML.childNodes[0] : moAjax.responseXML.documentElement; 
		    
		//moOrderQty = oXml.getElementsByTagName("Table");
		
		//Release memory for AJAX object.
		moAjax = null;
        
        //Clear flag.
        mbSaving = false;
        
        //Display success message.
        var sMsg = "Order authorization submitted successfully";
        SetStatusMsg("StatusMsg", sMsg, "", false, true);
        
        //Refresh the orders list so it shows the new order.
        //RefreshOrdersList();???????????
            
    }
    
    //-------------------------------------------------------------------------------------
    // Validates data. 
    //-------------------------------------------------------------------------------------
    function ValidateChanges() 
    {
    
    
    return true;
    
    
    
    
        var bValid = true;
        
        //Validate field values.
        var oRows = $("DeptDataBox").childNodes;
        
        //Make sure no duplicates for Department Name or Department Code.
        for (var i=0; i<oRows.length; i++) 
        {
            var sDeptName = GetFieldValue(oRows[i],"DeptName").Value;
            var sDeptCode = GetFieldValue(oRows[i],"DeptCode").Value;
            
            if (!ValidateForDuplicates("DeptName", sDeptName, i))
            {
                var sMsg = "Department " + sDeptName + " is a duplicate.";
                SetStatusMsg("StatusMsg", sMsg, "", false, true, "red", 4000);
                return false;
            };
            
            if (!ValidateForDuplicates("DeptCode", sDeptCode, i))
            {
                var sMsg = "Department Code " + sDeptCode + " is a duplicate.";
                SetStatusMsg("StatusMsg", sMsg, "", false, true, "red", 4000);
                return false;
            };
        } 
        
    //    if (!bValid) 
    //    {  
    //        var sMsg = "The xxxx value is invalid.";
    //        SetStatusMsg("StatusMsg", sMsg, "", false, true, "red", 4000);
    //        return false;
    //    }
        
        return bValid;
    }  
      
    //-------------------------------------------------------------------------------------
    // Returns new XMLHttpRequest object. 
    //-------------------------------------------------------------------------------------
    function AjaxCreate(sDataType) 
    {
        var xhr;
        
	    try 
	    {
	        if (window.XMLHttpRequest)         
	        {      
		        xhr = new XMLHttpRequest();
	        }       
	        else if (window.ActiveXObject) 
	        {   
		        xhr = new ActiveXObject("Microsoft.XMLHTTP");
	        }
	    }
	    catch(e) 
	    {
	        var sMsg = "Error: Unable to create data access object for " + sDataType + " data. \n\n";
	        sMsg += "Error Details: " + e.message; 
		    alert(sMsg);
	    }
	    
	    //Make sure the XHR object is really created.
	    if (!xhr)
	    {
	        var sMsg = "Error: Unable to create data access object for " + sDataType + " data. \n\n";
	        sMsg += "Error Details: Unknown error."; 
		    alert(sMsg);
	    } 
	    
	    return xhr;  
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
    function AjaxSend(oAjax, sParms, oCallback, bUseXdp){ 
    
        var sType = "POST";   

	    //Set URL/URI. 
	    var sURL = "db.aspx";
	    
	    //If using a server-side cross-domain proxy, modify the URL and establish the
	    //URL/URI for the server-side proxy.
	    if (bUseXdp) 
	    {
		    //Set URL for remote URL and server-side proxy.
		    var sRemoteURL = $("XXXXXX").value + sURL;
		    sURL  = "xdp.aspx";
    	
	        //Modify parms string for use by server-side proxy. Replace equal signs and ampersands so proxy 
	        //ignores the fieldname-value pairs and passes them on to the remote URL.
	        sParms = sParms.replace(/=/g,"||");
	        sParms = sParms.replace(/&/g,"|*|");
    		
	        sParms  = "Parms="		+ sParms;
	        sParms += "&RemoteURL=" + sRemoteURL;
	        sParms += "&Format="	+ msXHRResponseFormat;
        }
    	
	    if (sType == "POST") 
	    {	
		    //Set POST properties and send HTTP request.
		    //moAjax.onreadystatechange = OnAjaxStateChange;    
		    oAjax.onreadystatechange = oCallback;    
		    oAjax.open("POST", sURL, true);  
		    oAjax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		    //oAjax.setRequestHeader("Content-length", sParms.length);
		    oAjax.send(sParms);
	    }
	    else if (sType == "GET") 
	    {
		    alert("AJAX GET-style call not implemented. Request cancelled.");
		    return false;
	    }
    	
	    return true;
    }

}
