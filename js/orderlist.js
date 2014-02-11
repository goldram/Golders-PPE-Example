//-------------------------------------------------------------------------------------
//
// Description:	Contains JavaScript for managing a list of orders. 
//		  
//-------------------------------------------------------------------------------------

function OrderList() {

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
    
    var msUserType = null;
    var msModifiedValues = null;
    
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
    // Returns a string of pipe-delimited values containing modified field values in the 
    // Orders List.
    //-------------------------------------------------------------------------------------
    function GetModifiedValues() {

        var sVals = "";
        
        var bInvalidValuesFound = false;
            
        var oData = moOrderDataBox.childNodes;

        //Build pipe-delimited string of values. Each name-value pair is separated by a 
        //single pipe character, and each record is separated by two pipe-characters. 
        var bValidDate;
        for (var i=0; i<oData.length; i++)
        {
            var oRow = oData[i];
            
            //ignore text nodes.
            if (oRow.nodeType != 1) continue; 
            
            //Get the update status and the Order ID for the row.
            var sStatus  = oRow.getAttribute("UpdateStatus");
            var sOrderID = oRow.getAttribute("OrderID");
            
            var oOrderStatus = GetFieldValue(oRow,"OrderStatus");

            var oAuthorizeDate = (!$field("AuthorizeDate",oRow)) ? null : GetFieldValue(oRow,"AuthorizeDate",true);
            var oSubmitDate    = (!$field("SubmitDate",oRow))    ? null : GetFieldValue(oRow,"SubmitDate",  true);
            var oEstimateDate  = (!$field("EstimateDate",oRow))  ? null : GetFieldValue(oRow,"EstimateDate",true);
            var oProcessDate   = (!$field("ProcessDate",oRow))   ? null : GetFieldValue(oRow,"ProcessDate", true);
            var oShipDate      = (!$field("ShipDate",oRow))      ? null : GetFieldValue(oRow,"ShipDate",    true);
            var oDeliverDate   = (!$field("DeliverDate",oRow))   ? null : GetFieldValue(oRow,"DeliverDate", true);
            var oHoldDate      = (!$field("HoldDate",oRow))      ? null : GetFieldValue(oRow,"HoldDate",    true);
            var oCancelDate    = (!$field("CancelDate",oRow))    ? null : GetFieldValue(oRow,"CancelDate",  true);
            var oCloseDate     = (!$field("CloseDate",oRow))     ? null : GetFieldValue(oRow,"CloseDate",   true);
             
            var oCustom1 = (!$field("Custom1",oRow)) ? null : GetFieldValue(oRow,"Custom1");
            var oCustom2 = (!$field("Custom2",oRow)) ? null : GetFieldValue(oRow,"Custom2");
            var oCustom3 = (!$field("Custom3",oRow)) ? null : GetFieldValue(oRow,"Custom3");
            var oCustom4 = (!$field("Custom4",oRow)) ? null : GetFieldValue(oRow,"Custom4");
            var oCustom5 = (!$field("Custom5",oRow)) ? null : GetFieldValue(oRow,"Custom5");
           
            if (sStatus == "delete") 
            {
                sVals += "UpdateStatus=" + sStatus + "|";
                sVals += "OrderID=" + sOrderID + "|";
                        
                sVals += "|"; //Double-up pipe character for record delimiter.
            }
            else
            if (sStatus == "update" || sStatus == "insert") 
            {
                //Set the type of database update that will be done.
                sVals += "UpdateStatus=" + sStatus + "|";
                sVals += "OrderID=" + sOrderID + "|";
                
                //OrderStatus field updated?
                if (oOrderStatus.Updated) sVals += "OrderStatus=" + oOrderStatus.Value + "|";
                
                //
                //Check each date to see if it was updated.
                //
                
                if (oAuthorizeDate && oAuthorizeDate.Updated) 
                    sVals += "AuthorizeDate=" + oAuthorizeDate.Value + "|";
                
                if (oSubmitDate && oSubmitDate.Updated) 
                    sVals += "SubmitDate=" + oSubmitDate.Value + "|";
                
                if (oEstimateDate && oEstimateDate.Updated) 
                    sVals += "EstimateDate=" + oEstimateDate.Value + "|";
                
                if (oProcessDate && oProcessDate.Updated) 
                    sVals += "ProcessDate=" + oProcessDate.Value + "|";
                
                if (oShipDate && oShipDate.Updated) 
                    sVals += "ShipDate=" + oShipDate.Value + "|";
                
                if (oDeliverDate && oDeliverDate.Updated) 
                    sVals += "DeliverDate=" + oDeliverDate.Value + "|";
                
                if (oHoldDate && oHoldDate.Updated) 
                    sVals += "HoldDate=" + oHoldDate.Value + "|";
                
                if (oCancelDate && oCancelDate.Updated) 
                    sVals += "CancelDate=" + oCancelDate.Value + "|";
                
                if (oCloseDate && oCloseDate.Updated) 
                    sVals += "CloseDate=" + oCloseDate.Value + "|";
                
                //
                //Check each Custom Field to see if it was updated.
                //
                
                if (oCustom1 && oCustom1.Updated) sVals += "Custom1=" + oCustom1.Value + "|";
                if (oCustom2 && oCustom2.Updated) sVals += "Custom2=" + oCustom2.Value + "|";
                if (oCustom3 && oCustom3.Updated) sVals += "Custom3=" + oCustom3.Value + "|";
                if (oCustom4 && oCustom4.Updated) sVals += "Custom4=" + oCustom4.Value + "|";
                if (oCustom5 && oCustom5.Updated) sVals += "Custom5=" + oCustom5.Value + "|";
                
                //here's a streamlined version of the above. Probably more complicated than it
                //needs to be for only 5 custom fields.
//                for (var s=1; s<=5; i++)
//                {
//                    var bFieldUpdated = eval("(oCustom" + s + "&& oCustom" + s + ".Updated)");
//                    if (bFieldUpdated) sVals += "Custom" + s + "=" + eval("oCustom" + s + ".Value") + "|";
//                }
                 
                 
                //Double-up pipe character for record delimiter.        
                sVals += "|";
                 
            }
            
        }

        //alert("Modified Exam Time values: " + sVals);

        //Return string to caller.
        return (bInvalidValuesFound) ? "ERROR: Invalid values found." : sVals;
    }
    
    //-------------------------------------------------------------------------------------
    // Retrieves all data required by the user interface.
    //-------------------------------------------------------------------------------------
    this.InitUI = function(sUserType) {
    
        msUserType = sUserType;
    
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
        
        //Set up scolling for data box column header.
        AddEvt($("OrderListViewPort"), "scroll", ScrollFixedColHdr);	
        
        //Add handler for changes to the Company filter.
        if ($("CompanyFilter")) 
        {
            AddEvt($("CompanyFilter"), "change", SetChangeToCompanyFilter);
        }
        //else {
        //    $("OrdersFilterBar").style.display = "none";
        //}	
        
        //Add handler for changes to the Order Status filter.
        if ($("StatusFilter")) 
        {
            AddEvt($("StatusFilter"), "change", SetChangeToStatusFilter);
        }
        //else {
        //    $("OrdersFilterBar").style.display = "none";
        //}	
        
        //Get orders.
        RetrieveOrders(); 
    }        
                  
    //-------------------------------------------------------------------------------------
    // Inserts a new data item into the orders data box.
    //-------------------------------------------------------------------------------------
    function PopulateOrderBoxItem(oBox, oData, sUpdateStatus) {
    
        //Adjustment for field padding and/or border width.
        var iAdjust = 0;
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
        oItem.style.borderWidth = "1px 0px 1px 1px";;
        oItem.readOnly = true; //do not allow editting
        oItem.tabIndex = -1; //prevent tab stop
	    //oItem.maxLength = "3";
        oItem.style.left  = "20px"; //$("OrderNumHdr").offsetLeft + "px";
        oItem.style.width = $("OrderNumHdr").offsetWidth - 2 + "px";	
	    oItem.value = oData.OrderNumber;
        oItem.setAttribute("LastVal", oData.OrderNumber);
        oItem.setAttribute("OrderID", oData.OrderID);
        //AddEvt(oItem, "keydown", SetSave);
	    oItemBox.appendChild(oItem);
	    
        //Insert input field for Company name.
	    if ($("CompanyHdr"))
	    {	                
	        var oItem = document.createElement("INPUT");
	        oItem.type = "text";	
	        oItem.id = "Site";
            //oItem.className = "FieldVal ReadOnly";
            oItem.className = "FieldValReadOnly";
            oItem.style.borderWidth = "1px 0px 1px 1px";
            oItem.readOnly = true; //do not allow editting
            oItem.tabIndex = -1; //prevent tab stop
	        //oItem.maxLength = "3";
            //oItem.style.left  = $("OrderNameHdr").offsetLeft + "px";
            oItem.style.width = $("SiteHdr").offsetWidth - 2 + "px";	
            oItem.style.left  = oItemBox.lastChild.offsetLeft + oItemBox.lastChild.offsetWidth - iAdjust + "px";
	        oItem.value = oData.CompanyName;
            oItem.setAttribute("LastVal", oData.CompanyName);
            oItem.setAttribute("OrderID", oData.OrderID);
            oItem.setAttribute("CompanyID", oData.CompanyID);
            //AddEvt(oItem, "keydown", SetSave);
	        oItemBox.appendChild(oItem);
	    }
	    	                
        //Insert input field for Company Site name.
	    var oItem = document.createElement("INPUT");
	    oItem.type = "text";	
	    oItem.id = "Site";
        //oItem.className = "FieldVal ReadOnly";
        oItem.className = "FieldValReadOnly";
        oItem.style.borderWidth = "1px 0px 1px 1px";
        oItem.readOnly = true; //do not allow editting
        oItem.tabIndex = -1; //prevent tab stop
	    //oItem.maxLength = "3";
        //oItem.style.left  = $("OrderNameHdr").offsetLeft + "px";
        oItem.style.width = $("SiteHdr").offsetWidth - 2 + "px";	
        oItem.style.left  = oItemBox.lastChild.offsetLeft + oItemBox.lastChild.offsetWidth - iAdjust + "px";
	    oItem.value = oData.CompanySiteName;
        oItem.setAttribute("LastVal", oData.CompanySiteName);
        oItem.setAttribute("OrderID", oData.OrderID);
        oItem.setAttribute("CompanyID", oData.CompanyID);
        oItem.setAttribute("CompanySiteID", oData.CompanySiteID);
        //AddEvt(oItem, "keydown", SetSave);
	    oItemBox.appendChild(oItem);
            
        //Insert input field for employee name.
	    var oItem = document.createElement("INPUT");
	    oItem.type = "text";	
	    oItem.id = "EmployeeName";
        //oItem.className = "FieldVal ReadOnly";
        oItem.className = "FieldValReadOnly";
        oItem.style.borderWidth = "1px 0px 1px 1px";
        oItem.readOnly = true; //do not allow editting
        oItem.tabIndex = -1; //prevent tab stop
	    //oItem.maxLength = "3";
        //oItem.style.left  = $("OrderNameHdr").offsetLeft + "px";
        oItem.style.width = $("EmployeeNameHdr").offsetWidth - 2 + "px";	
        oItem.style.left  = oItemBox.lastChild.offsetLeft + oItemBox.lastChild.offsetWidth - iAdjust + "px";
	    oItem.value = oData.FirstName + " " + oData.LastName;
        oItem.setAttribute("LastVal", oData.FirstName + " " + oData.LastName);
        oItem.setAttribute("OrderID", oData.OrderID);
        //AddEvt(oItem, "keydown", SetSave);
	    oItemBox.appendChild(oItem);
	    
	    //Insert field for Order Status.
	    if (oData.OrderStatus == "Closed" || oData.OrderStatus == "Cancelled") 
	    {
            //Order Status read-only field.
	        var oItem = document.createElement("INPUT");
	        oItem.type = "text";	
	        oItem.id = "OrderStatus";
            //oItem.className = "FieldVal ReadOnly";
            oItem.className = "FieldValReadOnly";
            oItem.style.borderWidth = "1px 0px 1px 1px";
            oItem.readOnly = true; //do not allow editting
            oItem.tabIndex = -1; //prevent tab stop
	        //oItem.maxLength = "3";
            //oItem.style.left  = $("OrderNameHdr").offsetLeft + "px";
            oItem.style.width = $("OrderStatusHdr").offsetWidth - 5 + "px";	
            oItem.style.left  = oItemBox.lastChild.offsetLeft + oItemBox.lastChild.offsetWidth - iAdjust + "px";
	        oItem.value = oData.OrderStatus;
            oItem.setAttribute("LastVal", oData.CompanySiteName);
            oItem.setAttribute("OrderID", oData.OrderID);
            oItem.setAttribute("CompanyID", oData.CompanyID);
            oItem.setAttribute("CompanySiteID", oData.CompanySiteID);
            //AddEvt(oItem, "keydown", SetSave);
	        oItemBox.appendChild(oItem);
        }
        else 
        {
	        //Order Status dropdown.
            var oItem = document.createElement("SELECT");
            oItem.id = "OrderStatus";
            oItem.className = (mbIE)? "FieldValDropdownIE" : "FieldValDropdown";
            oItem.style.borderWidth = "1px 0px 1px 1px";
            //oItem.style.left  = $("OrderStatusHdr").offsetLeft  + "px";
            oItem.style.left  = oItemBox.lastChild.offsetLeft + oItemBox.lastChild.offsetWidth - iAdjust + "px";
            oItem.style.width = $("OrderStatusHdr").offsetWidth - 2 + "px";	
            PopulateOrderStatusDropdown(msUserType, oItem, oData.OrderStatus);
            AddEvt(oItem, "change", SetSave);
            AddEvt(oItem, "change", SetChangeToOrderStatus);
            oItem.setAttribute("LastVal", oData.OrderStatus);
            //AddEvt(oItem, "blur",    SetChangeToOrderStatus);
            oItemBox.appendChild(oItem);
	    }
        
        //All date items.
        oItem = PopulateOrderBoxItemDate(oItemBox, "AuthorizeDate", oData, "AuthorizeDate",  "existing");
        oItem = PopulateOrderBoxItemDate(oItemBox, "SubmitDate",    oData, "SubmitDate",     "existing");
        if (msUserType == "admin")
        {
            oItem = PopulateOrderBoxItemDate(oItemBox, "ProcessDate",   oData, "ProcessDate",    "existing");
            oItem = PopulateOrderBoxItemDate(oItemBox, "ShipDate",      oData, "ShipDate",       "existing");
        }
        oItem = PopulateOrderBoxItemDate(oItemBox, "DeliverDate",   oData, "DeliverDate",    "existing");
        oItem = PopulateOrderBoxItemDate(oItemBox, "HoldDate",      oData, "HoldDate",       "existing");
        oItem = PopulateOrderBoxItemDate(oItemBox, "CancelDate",    oData, "CancelDate",     "existing");
        oItem = PopulateOrderBoxItemDate(oItemBox, "CloseDate",     oData, "CloseDate",      "existing");
        
        //Custom Fields.
	    if ($("Custom1Hdr")) PopulateOrderBoxCustomField(oItemBox, "1", oData, "existing");
	    if ($("Custom2Hdr")) PopulateOrderBoxCustomField(oItemBox, "2", oData, "existing");
	    if ($("Custom3Hdr")) PopulateOrderBoxCustomField(oItemBox, "3", oData, "existing");
	    if ($("Custom4Hdr")) PopulateOrderBoxCustomField(oItemBox, "4", oData, "existing");
	    if ($("Custom5Hdr")) PopulateOrderBoxCustomField(oItemBox, "5", oData, "existing");
        
        return;
        
    }    
 
    //-------------------------------------------------------------------------------------
    // Inserts a Custom Field object/element into the Orders box row container.
    //-------------------------------------------------------------------------------------
    function PopulateOrderBoxCustomField(oItemBox, sNum, oData, sUpdateStatus) 
    {
        var iAdjust = (sNum == "1") ? 2 : 0;
        var iWidthAdjust = 0;
        
        var oItem = document.createElement("INPUT");
        oItem.type = "text";	
        oItem.id = "Custom" + sNum;
        oItem.className = "FieldVal";
        oItem.style.borderWidth = "1px 0px 1px 1px";
	    oItem.style.padding = "2px 0px 3px 2px";
        oItem.maxLength = "60";
        oItem.style.left  = oItemBox.lastChild.offsetLeft + oItemBox.lastChild.offsetWidth - iAdjust + "px";
        oItem.style.width = "150px";
        oItem.title = "Serial Number: " + oData.OrderNumber + ", Employee: " + oData.FirstName + " " + oData.LastName;	
        //oItem.style.width = $("CustomField" + sNum + "Hdr").offsetWidth + iWidthAdjust + "px";	
        oItem.value = eval("oData.Custom" + sNum);
        oItem.setAttribute("LastVal", eval("oData.Custom" + sNum));
        oItem.setAttribute("OrderID", oData.OrderID);
        oItem.setAttribute("CompanyID", oData.CompanyID);
        AddEvt(oItem, "keydown", SetSave);
        oItemBox.appendChild(oItem);
    }
    
    //-------------------------------------------------------------------------------------
    // Initiate refreshing the data. 
    //-------------------------------------------------------------------------------------
    this.RefreshInit = function() {
    
        Refresh();
    
    }
    
    //-------------------------------------------------------------------------------------
    // Refreshes the data. 
    //-------------------------------------------------------------------------------------
    function Refresh() {

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
	        sParms += "&CompanyID=" + encodeURI($("CompanyFilter").value);
	    }
	    else if (msUserType == "purchaser") 
	    {
	        //sParms += "&PurchaserID=" + encodeURI($("UserID").value);
	        sParms += "&CompanyID=" + encodeURI($("UserCompanyID").value);
	    }
	    else 
	    {
	        sParms += "&EmployeeID=" + encodeURI($("UserID").value);
	    }
	    
	    //Apply Order Status filter.
	    sParms += "&StatusFilter=" + encodeURI($("StatusFilter").value);
    	
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
		
		//Release memory for AJAX object.
		moAjax = null;
		
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
	            "OrderStatus"       : $data("OrderStatus",  oRecord), 
	            
                "CompanyID"         : $data("CompanyID",    oRecord), 
                "CompanyName"       : $data("CompanyName",  oRecord), 
                "CompanySiteID"     : $data("CompanySiteID",   oRecord), 
                "CompanySiteName"   : $data("CompanySiteName", oRecord),
                 
	            "FirstName"         : $data("FirstName",    oRecord), 
	            "LastName"          : $data("LastName",     oRecord), 
	            
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
	            "CancelDateDetail"  : oCancelDateParts.DateTime, 
            
                "Custom1"           : IsNull($data("Custom1", oRecord),""),
                "Custom2"           : IsNull($data("Custom2", oRecord),""),
                "Custom3"           : IsNull($data("Custom3", oRecord),""),
                "Custom4"           : IsNull($data("Custom4", oRecord),""),
                "Custom5"           : IsNull($data("Custom5", oRecord),"")
	        }
	        
	        PopulateOrderBoxItem(moOrderDataBox, oData, "existing");
	    }
        
        //Adjust layout of the data box and its container.
        AdjustDataBoxLayout(moMainBox, moOrderDataBox, $("OrderColHdr"));

        //Display success message.
        var sMsg = (mbCancellingChanges) ? "Changes cancelled. Order list refreshed." : "Orders retrieved successfully.";
        SetStatusMsg("StatusMsg", sMsg, "", false, true);
        
        mbCancellingChanges = false;
     
        SetSave("off");
    }

    //-------------------------------------------------------------------------------------
    // Saves changes to Orders to the database.
    //-------------------------------------------------------------------------------------
    this.SaveChanges = function() {
        
        //If processing another action don't allow save action.
        //if (IsBusy()) return;
        
        if (!ValidateChanges()) return; 
                    
        msModifiedValues = GetModifiedValues();
                
        //testing...        
        //alert("Modified Values: \n\n" + msModifiedValues);
        //return;
        
        if (msModifiedValues.length == 0) 
        {
            var sMsg = "There are no changes pending, save action cancelled.";
            SetStatusMsg("StatusMsg", sMsg, "", false, true, "red");
            return;
        }
        
        var sMsg = "Saving order changes, please wait...";
        SetStatusMsg("StatusMsg", sMsg, "", false, false);
       
        mbSaving = true;
        
	    //Create XmlHttpRequest object.
	    moAjax = AjaxCreate("Order changes");
	    if (!moAjax) return;
          
	    //Build parms string.
        var sParms	= "";
	    sParms += "&Action=" + encodeURI("SaveOrder");
	    sParms += "&UserID=" + encodeURI($("UserID").value);
	    sParms += "&SummaryValues="  + encodeURI(msModifiedValues);
    	
	    //Initiate call to database.
	    var bSuccess = AjaxSend(moAjax, sParms, SaveOrderChangesCallback);
    	
	    //If not initiated, clear all status messages. 
	    if (!bSuccess) ClearStatusMsg();        
    }    

    //-------------------------------------------------------------------------------------
    // Callback for SaveOrderChanges method. 
    //-------------------------------------------------------------------------------------
    function SaveOrderChangesCallback() 
    {  
	    var bKeepTrying = ((moAjax.readyState == 4) && (moAjax.status == 200)) ? false : true;
	    
	    if (bKeepTrying) return; 
	    
		var sResult = moAjax.responseText;
		
		//Check for error.
		var sError = AjaxError(sResult);
		if (sError.length > 0)  
		{
            var sMsg = "Unable to save order changes.";
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
        var sMsg = "Order changes saved successfully";
        SetStatusMsg("StatusMsg", sMsg, "", false, true);
        
        SetSave("off")
        
        //Refresh the orders list.
        Refresh();
            
    }
    
    //-------------------------------------------------------------------------------------
    // Scrolls data box column header.
    //-------------------------------------------------------------------------------------
    function ScrollFixedColHdr(e) {   

        var evt = window.event || e;
        var oSrc = evt.srcElement || e.target;
        var sType = evt.type || e.type;

        $("OrderListViewPortHdr").scrollLeft = oSrc.scrollLeft; 
        
        return;
    }
    
    //-------------------------------------------------------------------------------------
    // Refreshes order list when the Company Filter is changed. 
    //-------------------------------------------------------------------------------------
    function SetChangeToCompanyFilter() {

        //if (IsBusy()) return;
        
        //If changes have not been saved, display message and get outta here.
        if (mbSavePending) {
            sMsg = "There are unsaved changes pending. Please save or cancel your changes. ";
            alert(sMsg);
            //SetStatusMsg("StatusMsg", sMsg, "", true, true, "", 4000);
            return;
        }
        
        var sCompany = GetSelectText($("CompanyFilter"));
            
        var sMsg = "Retrieving orders for " + sCompany + ", please wait...";
        SetStatusMsg("StatusMsg", sMsg, "", false, false);
        
        //Initiate refresh.
        RetrieveOrders();
        
    } 
    
    //-------------------------------------------------------------------------------------
    // Refreshes order list when the Order Status Filter is changed. 
    //-------------------------------------------------------------------------------------
    function SetChangeToStatusFilter() {

        //if (IsBusy()) return;
        
        //If changes have not been saved, display message and get outta here.
        if (mbSavePending) {
            sMsg = "There are unsaved changes pending. Please save or cancel your changes. ";
            alert(sMsg);
            //SetStatusMsg("StatusMsg", sMsg, "", true, true, "", 4000);
            return;
        }
        
        var sStatus = GetSelectText($("StatusFilter"));
            
        var sMsg = "Retrieving orders with selected status, please wait...";
        SetStatusMsg("StatusMsg", sMsg, "", false, false);
        
        //Initiate refresh.
        RetrieveOrders();
        
    } 
           
    //-------------------------------------------------------------------------------------
    // Called when a change to the Order Status is made by the user.
    //-------------------------------------------------------------------------------------
    function SetChangeToOrderStatus(e) {

	    var evt = window.event || e;
	    var oSrc = evt.srcElement || e.target;
	    var sType = evt.type || e.type;

        //If old value and new value are the same, get outta here.
        var sNewVal = oSrc.value;
        var sLastVal = oSrc.getAttribute("LastVal");
        if (sNewVal == sLastVal) return;
        
        //If the change is not valid, get outta here.
        if (!ValidateChangeToOrderStatus(sNewVal, sLastVal)) 
        {
            SetSelectText(oSrc, sLastVal);
            return false;
        }
        
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
        
            //Revert any existing change back to its original value and color.
            if (oItems[i].id.indexOf("Date") > 0 && oItems[i].style.color == "red")
            {
                oItems[i].value = oItems[i].getAttribute("LastVal");
                oItems[i].style.color = oItems[i].getAttribute("LastColor");
            }
            
            //Set the date value to the current date and set the color to red.
            if (oItems[i].id == sID) 
            {
                var dDate = new Date();
                var iMonth = dDate.getMonth() + 1;
                var iYear = dDate.getFullYear();
                var iDay = dDate.getDate();
                
                var sDate = iYear.toString() + "/" + iMonth.toString() + "/" + iDay.toString();

                oItems[i].value = sDate;
                oItems[i].setAttribute("LastColor", oItems[i].style.color);
                oItems[i].style.color = "red";
                oItems[i].style.fontWeight = "normal";
            }
        }
        
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
                var sStatus = oParent.getAttribute("UpdateStatus").toLowerCase();
                if (sStatus == "existing") oParent.setAttribute("UpdateStatus", "update");
            }
        }
        catch(e) {
            //do nothing, it might not apply
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
	    
	    //var url = "orderdetail.aspx?oid=" + oid;
	    var url = "order.aspx?oid=" + oid;
	    
        //NewWindow = window.open(url,"_parent","toolbar=yes,menubar=1,status=0,copyhistory=0,scrollbars=yes,resizable=1,location=0,Width=1100,Height=760");    
        //NewWindow.location = url;
	    
	    window.location = url;
    
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
