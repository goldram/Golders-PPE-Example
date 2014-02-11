//-------------------------------------------------------------------------------------
//
// Description:	Contains JavaScript specific to displaying and managing a list of orders 
//              for a Purchasing Officer. 
//		  
//-------------------------------------------------------------------------------------

function PurchaserOrderList() {

    var mbDataLoaded = false;
    var mbSavePending = false;
    var mbSaving = false;
    var mbSaveAndClear = false;
    var mbCancellingChanges = false;
    var mbSettingFieldValues = false;
    
    var mbEventHandlersAttached = false; //Ensures event handlers are not attached multiple times.
        
     var mbIE = (!window.addEventListener || navigator.appName.indexOf("Internet Explorer") >= 0) ? true : false;
    var mbUseProxy = false;
    var msXHRResponseFormat = "XML";
    
    var moAjax = null;
    
    var moCloak = new Cloaker();
    
    var moStatusMsg = null;
    
    var moMainBox = $("OrderBox");
    var moOrderDataBox = $("OrderDataBox");
    
    var moActionBar = null;
    var moActionNewOrder = null;
    var moActionRefresh = null;
    var moActionSave = null;
    var moActionCancel = null;
    
    var moOrders = null;

    //-------------------------------------------------------------------------------------
    // Cancel pending changes. 
    //-------------------------------------------------------------------------------------
    this.CancelChanges = function() {

        //if (IsBusy()) return;
        
        //If no pending changes, get outta here.
        if (!mbSavePending) {
            sMsg = "There are no unsaved changes to cancel.";
            SetStatusMsg("StatusMsg", sMsg, "", true, true, "", 4000);
            return;
        }
        
        //Verify CANCEL action.
        var sMsg = "Are you sure you want to cancel your order changes? \n\n";
        if (!confirm(sMsg)) return;
        
        //Reset SAVE PENDING flag.
        SetSave("off");
        
        var sMsg = "Canceling changes and refreshing order list, please wait...";
        SetStatusMsg("StatusMsg", sMsg, "", false, false);
        
        //Set success message to be displayed.
        mbCancellingChanges = true;  
        
        //Initiate refresh.
        RetrieveOrders();
        
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
        
        //Get reference to the action bar object.
        var oItems = moMainBox.getElementsByTagName("DIV");
        for (var i=0; i<oItems.length; i++)
        {
            if (oItems[i].className == "ActionBar") 
            {
                moActionBar = oItems[i];
                break;
            }
        }
   
        //Get reference to each action.
        var oItems = moActionBar.getElementsByTagName("a");
        for (var i=0; i<oItems.length; i++)
        {
            switch (oItems[i].id)
            {
                case "ActionNewOrder":
                    moActionNewOrder = oItems[i];
                    break;
                case "ActionRefresh":
                    moActionRefresh = oItems[i];
                    break;
                case "ActionSave":
                    moActionSave = oItems[i];
                    break;
                case "ActionCancel":
                    moActionCancel = oItems[i];
                    break;
            }
        }
        
        RetrieveOrders(); 
    }     

    
    //-------------------------------------------------------------------------------------
    // Inserts a new data item into the orders data box.
    //-------------------------------------------------------------------------------------
    function PopulateOrderBoxItem(oBox, oData, sUpdateStatus) {
    
        //Adjustment for field padding and/or border width.
        var iAdjust = 1;
        var iCalAdjust = 23;
        
        //Insert container for all columns/fields.
	    var oItemBox = document.createElement("DIV");
	    oItemBox.id = "DataItemBox";
	    oItemBox.className = "Row";  
	    oItemBox.style.marginTop = "0px";
	    oItemBox.style.marginBottom = "0px";
        oItemBox.setAttribute("UpdateStatus", sUpdateStatus);
        oItemBox.setAttribute("OrderID", IsNull(oData.OrderID, "0"));
	    oBox.appendChild(oItemBox);
	    
        //Insert edit image.
	    var oItem = document.createElement("IMG");
	    //oItem.type = "text";	
	    oItem.id = "OrderEdit";
	    oItem.title = "Edit/View Order Details";
        //oItem.className = "FieldVal ReadOnly";
        //oItem.className = "FieldValReadOnly";
        //oItem.readOnly = true; //do not allow editting
        //oItem.tabIndex = -1; //prevent tab stop
	    //oItem.maxLength = "3";
        //oItem.style.left  = $("OrderEditHdr").offsetLeft + "px";
	    oItem.src = "img/edit.png";
        //oItem.setAttribute("LastVal", oData.OrderNumber);
        oItem.setAttribute("OrderID", oData.OrderID);
        AddEvt(oItem, "click", ShowOrderDetails);
	    oItemBox.appendChild(oItem);   
	             
        //Insert input field for Order Number.
	    var oItem = document.createElement("INPUT");
	    oItem.type = "text";	
	    oItem.id = "OrderNum";
        //oItem.className = "FieldVal ReadOnly";
        oItem.className = "FieldValReadOnly";
        oItem.readOnly = true; //do not allow editting
        oItem.tabIndex = -1; //prevent tab stop
	    //oItem.maxLength = "3";
        oItem.style.left  = $("OrderNumHdr").offsetLeft + "px";
        oItem.style.width = $("OrderNumHdr").offsetWidth - 0 + "px";	
	    oItem.value = oData.OrderNumber;
        oItem.setAttribute("LastVal", oData.OrderNumber);
        oItem.setAttribute("OrderID", oData.OrderID);
        //AddEvt(oItem, "keydown", SetSave);
	    oItemBox.appendChild(oItem);
            
        //Insert input field for employee name.
	    var oItem = document.createElement("INPUT");
	    oItem.type = "text";	
	    oItem.id = "OrderName";
        //oItem.className = "FieldVal ReadOnly";
        oItem.className = "FieldValReadOnly";
        oItem.readOnly = true; //do not allow editting
        oItem.tabIndex = -1; //prevent tab stop
	    //oItem.maxLength = "3";
        oItem.style.left  = $("OrderNameHdr").offsetLeft + "px";
        oItem.style.width = $("OrderNameHdr").offsetWidth - 0 + "px";	
        oItem.style.left  = oItemBox.lastChild.offsetLeft + oItemBox.lastChild.offsetWidth - iAdjust + "px";
	    oItem.value = oData.FirstName + " " + oData.LastName;
        oItem.setAttribute("LastVal", oData.OrderNumber);
        oItem.setAttribute("OrderID", oData.OrderID);
        //AddEvt(oItem, "keydown", SetSave);
	    oItemBox.appendChild(oItem);
	    
	    //Order Status dropdown.
        var oItem = document.createElement("SELECT");
        oItem.id = "OrderStatus";
        oItem.className = (mbIE)? "FieldValDropdownIE" : "FieldValDropdown";
        oItem.style.left  = $("OrderStatusHdr").offsetLeft  + "px";
        oItem.style.width = $("OrderStatusHdr").offsetWidth + "px";	
        PopulateOrderStatusDropdown(oItem, oData.OrderStatus);
        AddEvt(oItem, "change", SetSave);
        AddEvt(oItem, "change", SetChangeToStatus);
        oItem.setAttribute("LastVal", oData.OrderStatus);
        //AddEvt(oItem, "blur",    SetChangeToStatus);
        oItemBox.appendChild(oItem);
        
        //All date items.
        oItem = PopulateOrderBoxItemDate(oItemBox, "AuthorizeDate", oData, "AuthorizeDate",  "existing");
        oItem = PopulateOrderBoxItemDate(oItemBox, "SubmitDate",    oData, "SubmitDate",     "existing");
        //oItem = PopulateOrderBoxItemDate(oItemBox, "ProcessDate",   oData, "ProcessDate",    "existing");
        //oItem = PopulateOrderBoxItemDate(oItemBox, "ShipDate",      oData, "ShipDate",       "existing");
        oItem = PopulateOrderBoxItemDate(oItemBox, "DeliverDate",   oData, "DeliverDate",    "existing");
        oItem = PopulateOrderBoxItemDate(oItemBox, "HoldDate",      oData, "HoldDate",       "existing");
        oItem = PopulateOrderBoxItemDate(oItemBox, "CancelDate",    oData, "CancelDate",     "existing");
        oItem = PopulateOrderBoxItemDate(oItemBox, "CloseDate",     oData, "CloseDate",      "existing");
        
        return;
        
    }    

    //-------------------------------------------------------------------------------------
    // Refreshes the data. 
    //-------------------------------------------------------------------------------------
    this.Refresh = function() {

        //if (IsBusy()) return;
        
        //If changes have not been saved, display message and get outta here.
        if (mbSavePending) {
            sMsg = "There are unsaved changes pending. Please save or cancel your changes. ";
            alert(sMsg);
            //SetStatusMsg("StatusMsg", sMsg, "", true, true, "", 4000);
            return;
        }
            
        var sMsg = "Refreshing order list, please wait...";
        SetStatusMsg("StatusMsg", sMsg, "", false, false);
        
        //Initiate refresh.
        RetrieveOrders();
        
    }    
    
    //-------------------------------------------------------------------------------------
    // Submits AJAX request to retrieve orders for Purchaser.
    //-------------------------------------------------------------------------------------
    function RetrieveOrders() {

	    //Display status message.   
	    //ClearStatusMsg("main"); 
	    SetStatusMsg("StatusMsg", "Retrieving orders...", "", false);
 	    
	    //Create XmlHttpRequest object.
	    moAjax = AjaxCreate("Order List");
	    if (!moAjax) return;
            
	    //Build parms string.
        var sParms	= "";
	    sParms += "&Action=" + encodeURI("GetOrder");
	    if (msUserType == "admin") 
	    {
	    }
	    else 
	    {
	        sParms += "&PurchaserID=" + encodeURI($("UserID").value);
	    }
	    
	    alert("PurchaserID/UserID = " + $("UserID").value);
    	
	    //Initiate call to database.
	    var bSuccess = AjaxSend(moAjax, sParms, RetrieveOrdersCallback);
    	
	    //If not initiated, clear all status messages. 
	    if (!bSuccess) ClearStatusMsg();

    }

    //-------------------------------------------------------------------------------------
    // Callback for RetrieveOrders method. 
    //-------------------------------------------------------------------------------------
    function RetrieveOrdersCallback() 
    {  
	    var bKeepTrying = ((moAjax.readyState == 4) && (moAjax.status == 200)) ? false : true;
	    
	    if (bKeepTrying) return; 
    
		var sResult = moAjax.responseText;
		
		var sError = AjaxError(sResult);
		if (sError.length > 0)  
		{
		    alert("Unable to retrieve order list. \n\n\ Error details:" + sError);
		    mbCancellingChanges = false;
		    moAjax = null;
		    return;
		}
		
		var oXml = (mbIE) ? moAjax.responseXML.childNodes[0] : moAjax.responseXML.documentElement; 
        
        //Display appropriate message if no orders remaining.
        if (!oXml || oXml.getElementsByTagName("Table").length == 0)  
        {  
            moOrderDataBox.innerHTML = '<p id="NoItemsMsg">There are no orders available.</p>';
            var sMsg = "No orders available at this time.";
            SetStatusMsg("StatusMsg", sMsg, "", false, true);
		    moAjax = null;
            return;
        }
		    
		moOrders = oXml.getElementsByTagName("Table");
		
		//Clear the data box contents.
		moOrderDataBox.innerHTML = "";
		
        //Display data.
        for (var i=0; i < moOrders.length; i++) 
        {
            var oRecord = moOrders[i];
            
            var oAuthorizeDateParts = ParseOrderDate($data("AuthorizeDate", oRecord));
            var oSubmitDateParts    = ParseOrderDate($data("SubmitDate",    oRecord));
            var oProcessDateParts   = ParseOrderDate($data("ProcessDate",   oRecord));
            var oShipDateParts      = ParseOrderDate($data("ShipDate",      oRecord));
            var oDeliverDateParts   = ParseOrderDate($data("DeliverDate",   oRecord));
            var oHoldDateParts      = ParseOrderDate($data("HoldDate",      oRecord));
            var oCancelDateParts    = ParseOrderDate($data("CancelDate",    oRecord));
            var oCloseDateParts     = ParseOrderDate($data("CloseDate",     oRecord));
           
            var oData = {
	            "OrderID"           : $data("OrderID",      oRecord), 
	            "OrderNumber"       : $data("OrderNumber",  oRecord), 
	            "FirstName"         : $data("FirstName",    oRecord), 
	            "LastName"          : $data("LastName",     oRecord), 
	            "OrderStatus"       : $data("OrderStatus",  oRecord), 
	            "AuthorizeDate"     : oAuthorizeDateParts.Date, 
	            "AuthorizeDateDetail": oAuthorizeDateParts.DateTime, 
	            "SubmitDate"        : oSubmitDateParts.Date,
	            "SubmitDateDetail"  : oSubmitDateParts.DateTime,
	            "ProcessDate"       : oProcessDateParts.Date,
	            "ProcessDateDetail" : oProcessDateParts.DateTime,
	            "ShipDate"          : oShipDateParts.Date,
	            "ShipDateDetail"    : oShipDateParts.DateTime,
	            "DeliverDate"       : oDeliverDateParts.Date,
	            "DeliverDateDetail" : oDeliverDateParts.DateTime,
	            "CloseDate"         : oCloseDateParts.Date,
	            "CloseDateDetail"   : oCloseDateParts.DateTime,
	            "HoldDate"          : oHoldDateParts.Date, 
	            "HoldDateDetail"    : oHoldDateParts.DateTime, 
	            "CancelDate"        : oCancelDateParts.Date, 
	            "CancelDateDetail"  : oCancelDateParts.DateTime 
	        }
	        
	        PopulateOrderBoxItem(moOrderDataBox, oData, "existing");
	    }
        
        //Adjust height of popup.
        moMainBox.style.height = moOrderDataBox.offsetTop + (moOrders.length * 22) + "px"; 
        
        //Display success message.
        var sMsg = (mbCancellingChanges) ? "Changes cancelled. Order list refreshed." : "Orders retrieved successfully.";
        SetStatusMsg("StatusMsg", sMsg, "", false, true);
        
        mbCancellingChanges = false;
     
        SetSave("off");
    }

    //-------------------------------------------------------------------------------------
    // Saves changes to the database.
    //-------------------------------------------------------------------------------------
    this.SaveChanges = function() {
    
    alert("Coming soon!");
    return;
        
        //If processing another action don't allow save action.
        //if (IsBusy()) return;
        
        if (!ValidateChanges()) return; 
                    
        msModifiedExamTimeValues  = Exam_GetModifiedTimeValues();
        msModifiedExamCountValues = Exam_GetModifiedCountValues();
        msModifiedExamMaxValues   = ExamLocation_GetModifiedMaxValues();
        
        if (msModifiedExamTimeValues.length == 0 && 
            msModifiedExamCountValues.length == 0 &&
            msModifiedExamMaxValues.length == 0) 
        {
            var sMsg = "There are no changes pending, save action cancelled.";
            SetStatusMsg("StatusMsg", sMsg, "", false, true, "red");
            return;
        }
        
        //Determine which update to perform first.
        if (msModifiedExamTimeValues.length > 0) {
            var sType = "ExamTime";
        }
        else
        if (msModifiedExamCountValues.length > 0) {
            var sType = "ExamCount";
        }
        else
        if (msModifiedExamMaxValues.length > 0) {
            var sType = "ExamMax";
        }
        
        mbSaving = true;
        
        //Initiate the first save action.
        SaveChangesToDB(sType);
        
    }    

    //-------------------------------------------------------------------------------------
    // Called when a change to the Order Status is made by the user.
    //-------------------------------------------------------------------------------------
    function SetChangeToStatus(e) {

	    var evt = window.event || e;
	    var oSrc = evt.srcElement || e.target;
	    var sType = evt.type || e.type;

        //If old value and new value are the same, get outta here.
        var sNewVal = oSrc.value;
        var sLastVal = oSrc.getAttribute("LastVal");
        if (sNewVal == sLastVal) return;
        
        //Change the color of the dropdown value.
        oSrc.style.color = "red";
        
        //Add "pending" to the appropriate field.
        switch (oSrc.value.toLowerCase()) 
        {
            case "authorized":
                var sID = "AuthorizeDate";
                break;
            case "submitted":
                var sID = "SubmitDate";
                break;
            case "processing":
                var sID = "ProcessDate";
                break;
            case "shipped":
                var sID = "ShipDate";
                break;
            case "delivered":
                var sID = "DeliverDate";
                break;
            case "closed":
                var sID = "CloseDate";
                break;
            case "hold":
                var sID = "HoldDate";
                break;
            case "cancelled":
                var sID = "CancelDate";
                break;
            default:
                alert("Status not recognized");
                break;
        }
                        
	    var oDataItemBox = oSrc.parentNode;
        //oDataItemBox.setAttribute("DeptID", sNewVal);
        
        var oItems = oDataItemBox.childNodes;
        for (var i = 0; i < oItems.length; i++) {
            if (oItems[i].id == sID) 
            {
                oItems[i].value = "pending";
                oItems[i].style.color = "red";
                //oItems[i].style.fontStyle = "italic";
                oItems[i].style.fontWeight = "normal";
                break;
            }
        }
        
    }
        
    //-------------------------------------------------------------------------------------
    // Set SAVE PENDING flags.
    //-------------------------------------------------------------------------------------
    function SetSave(arg1, arg2) {

	    var sSwitch = "";
    		
	    //alert("Typeof arg1 = " + typeof(arg1));
	    //alert("Typeof arg2 = " + typeof(arg2));
    	
	    //If running FireFox browser.
	    if (typeof(arg1) == "object") 
	    {
		    sSwitch = arg2;
		    var evt = window.event || arg1;
		    var oSrc = evt.srcElement || arg1.target;
		    var sType = evt.type || arg1.type;
            var oSave = moActionSave;
	    }
	    else
	    {
		    sSwitch = arg1;
		    var oSave = moActionSave;
		    //alert("oSave object = " + oSave.id);
	    }

        if (sSwitch == "off") {
            oSave.style.color = oSave.setAttribute("DefaultColor", "blue");
            oSave.style.color = "blue";
            mbSavePending = false;
            return;
        }
        
        //If tabkey, ignore.
        if (oSrc) {
            if (evt.keyCode == 9) return;
        }
            
        oSave.style.color = "red";
        mbSavePending = true;
        
        //Clear field-level messages, if any.
        if (oSrc) {
            var sFieldMsgID = oSrc.id + "Msg";
            if ($(sFieldMsgID)) $(sFieldMsgID).style.display = "none"; 
        }
        
        //Make sure Update Status of the data fields wrapper is set to indicate an update 
        //occurred.
        SetDataBoxItemStatus(oSrc);  
          
    }    
  
    //-------------------------------------------------------------------------------------
    // Set the Update Status of a data box item (i.e. "record"). Note: If the field that was
    // modified is the Registration Count, do not change the Update Status, since the 
    // Registration Counts are handled differently.
    //-------------------------------------------------------------------------------------
    function SetDataBoxItemStatus(oDataField) {
        
        try {
            var oParent = oDataField.parentNode;
            if (oParent.id == "DataItemBox") {
                if (oDataField.id != "RegCount") {
                    var sStatus = oParent.getAttribute("UpdateStatus").toLowerCase();
                    if (sStatus == "existing") oParent.setAttribute("UpdateStatus", "update");
                }
            }
        }
        catch(e) {
            //do nothing, it might not apply
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
    // Open a separate browser window (or tab) to show the order details.
    //-------------------------------------------------------------------------------------
    function ShowOrderDetails(e) {
    	
    	var evt = window.event || e;
	    var oSrc = evt.srcElement || e.target;
	    var sType = evt.type || e.type;
	    
	    var oid = oSrc.getAttribute("OrderID");
	    
	    var url = "orderdetail-employee.aspx?oid=" + oid;

        //window.open("/orderdetail-employee.aspx?oid=" + oid, "_blank", "height=800, width=600"); 
        //window.open(url, "_blank", "height=800, width=800"); 
        
        NewWindow = window.open(url,"_blank","toolbar=no,menubar=0,status=0,copyhistory=0,scrollbars=yes,resizable=1,location=0,Width=1100,Height=760");    
        NewWindow.location = url;
    
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
		    //***DAN COMMENTED OUT NEXT LINE*** CHROME WILL NOT ALLOW IT 
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
