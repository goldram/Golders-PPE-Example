//-------------------------------------------------------------------------------------
//
// Description:	Contains JavaScript specific to managing order summary information.
//		  
//-------------------------------------------------------------------------------------

function OrderSummary() {

    var mbDataLoaded = false;
    var mbSavePending = false;
    var mbSaving = false;
    var mbSaveAndClear = false;
    var mbSettingFieldValues = false;
    var mbCancellingChanges = false;
    
    var mbEventHandlersAttached = false; //Ensures event handlers are not attached multiple times.

    var mbIE = (!window.addEventListener || navigator.appName.indexOf("Internet Explorer") >= 0) ? true : false;
    
    var mbUseProxy = false;
    var msXHRResponseFormat = "XML";
    
    var moAjax = null;
    var moAjaxEmployees = null;
    var moAjaxOrderSummary = null;
    var moAjaxOrderQty = null;
    var moAjaxOrderItems = null;
    
    var moCloak = new Cloaker();
    
    var moStatusMsg = null;
    var moMainBox = $("OrderSummaryBox");
    var moOrderQtyBox = $("QtyFieldsGroup");
    var moOrderItemsBox = $("OrderItemsDataBox");
    
    var moActionBar = null;
    var moActionRefresh = null;
    var moActionSave = null;
    var moActionCancel = null;
    
    var moOrderSummary = null;
    var moOrderItemsList = null;
    var moOrderQty = null;
    var moEmployees = null;
    
    var msOrderID = null;
    var msEmployeeID = null;
    
    var mbEmployeesLoading = false;
    var mbOrderQtyLoading = false;
    
    var msModifiedSummaryValues = null;
    var msModifiedQtyValues     = null;
    var msModifiedItemValues    = null;
    
    var msUserType = $("UserType").value;
    
    //"submit" for an order that has been "authorized" but not yet submitted for processing.
    //"save" for an order that has already been submitted for processing and can be editted
    var msSaveMode = "save";
        
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
        
        //If no pending changes to the Order Summary or the Item List, get outta here.
        if (!mbSavePending && !moOrderItemsList.IsSavePending()) {
            sMsg = "There are no unsaved changes to cancel.";
            SetStatusMsg("MainStatusMsg", sMsg, "", true, true, "", 4000);
            return;
        }
        
        //Verify CANCEL action.
        var sMsg = "Are you sure you want to cancel your changes? \n";
        if (!confirm(sMsg)) return;
                
        var sMsg = "Cancelling changes and refreshing order information, please wait...";
        SetStatusMsg("MainStatusMsg", sMsg, "", false, false);
        
        //Set success message to be displayed.
        mbCancellingChanges = true;  
        
        //Reset SAVE PENDING flag.
        SetSave("off");
        
        //Reset SAVE PENDING flag in Order Items list.
        moOrderItemsList.SetSaveOff();
             
        //Initiate refresh of Order information.
        Refresh();
        
        //Initiate refresh of Order Items information.
        moOrderItemsList.RefreshInit();
       
    }  	
        
    //-------------------------------------------------------------------------------------
    // Public access to Checks the Qty Requirements against what is currently selected in the list of 
    // selected products.
    //-------------------------------------------------------------------------------------
    this.CheckQtyRequirements_public = function() 
    {
        CheckQtyRequirements();
    }
        
    //-------------------------------------------------------------------------------------
    // Checks the Qty Requirements against what is currently selected in the list of 
    // selected products.
    //-------------------------------------------------------------------------------------
    function CheckQtyRequirements() 
    {
        var oQtyBox = $("QtyFieldsGroup");
        
        for (var i=0; i < oQtyBox.childNodes.length; i++)
        {
            var oQtyItem = oQtyBox.childNodes[i];
            
            //ignore text nodes.
            if (oQtyItem.nodeType != 1) continue;
            
            if (oQtyItem.id == "DataItemBox") 
            {
                var oQtyField = $field("OrderQty",oQtyItem);
                var oQtyFlag  = $field("QtyFlag",oQtyItem);
                
                var sQtyVal  = oQtyField.value;
                var sCatID   = oQtyField.getAttribute("ProductCategoryID");
                var sGroupID = oQtyField.getAttribute("ProductGroupID");
                
                //Get the current count of selected product items.                
                var iCnt = GetSelectedProductCount(sCatID, sGroupID);
                
                //Show/hide the quantity flag based on required count vs actual count.
                if (parseInt(sQtyVal,10) == iCnt)
                    oQtyFlag.style.visibility = "hidden";
                else
                    oQtyFlag.style.visibility = "visible";
                    
            }
        }
        
        
    }
        
    //-------------------------------------------------------------------------------------
    // Resets/clears all status message objects when the user begins typing into an input 
    // field.
    //-------------------------------------------------------------------------------------
    function ClearStatusMsg() 
    {

        SetStatusMsg("MainStatusMsg", "");
        SetStatusMsg("StatusMsg", "");
    }
        
    //-------------------------------------------------------------------------------------
    // Public method to return the Save Action object for the Order Summary.
    //-------------------------------------------------------------------------------------
    this.GetSaveAction = function() 
    {
        return moActionSave;
    }

        
    //-------------------------------------------------------------------------------------
    // Public method to return the Company ID for this order.
    //-------------------------------------------------------------------------------------
    this.GetCompanyID = function() 
    {
        return $data("CompanyID", moOrderSummary[0]);
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
    // Returns field value, and whether it has been updated or not, for a FieldsGroup 
    // container.
    //-------------------------------------------------------------------------------------
    function GetFieldGroupValue(oBox, sFieldID) {
    	
        var oResult = null;
        
        var oFieldWraps = oBox.childNodes;
            
        for (var i=0; i < oFieldWraps.length; i++)
        {
            var oFieldWrap = oFieldWraps[i];
             
            //ignore text nodes.
            if (oFieldWrap.nodeType != 1) continue;
            
            var oFields = oFieldWrap.childNodes;
            
            for (var p=0; p < oFields.length; p++)
            {
                var oField = oFields[p];
                
                //ignore text nodes.
                if (oField.nodeType != 1) continue;
           
                if (oField.id === sFieldID) {
                    var sTag = oField.tagName.toLowerCase();
                    sCurrVal = (sTag === "label") ? oField.innerHTML : oField.value;
                    //sCurrVal = (oField.readOnly === true || sTag === "label") ? oField.getAttribute("LastVal") : oField.value;
                    sLastVal = oField.getAttribute("LastVal");
                    oResult = {
                        "Updated" : (sCurrVal === sLastVal) ? false : true,
                        "Value"   : sCurrVal
                    };
                    return oResult;
                    break;
                }
            }
        }   

        //Return result.
        return oResult;
        
    }
    
    //-------------------------------------------------------------------------------------
    // Returns changes to Quantity Requirements in pipe-delimited string.
    //-------------------------------------------------------------------------------------
    function GetModifiedQtyValues() {

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
            
            //Ignore the instructional message.
            if (oData[i].id == "QtyMsgFieldWrapper") continue;
            
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
    // Returns a string of pipe-delimited values containing modified field values in the 
    // Orders List.
    //-------------------------------------------------------------------------------------
    function GetModifiedSummaryValues() {

        var sVals = "";
        
        var bInvalidValuesFound = false;

        //Build pipe-delimited string of values. Each name-value pair is separated by a 
        //single pipe character, and each record is separated by two pipe-characters. 
        var bValidDate;
            
        //Get the update status and the Order ID for the row.
        var sStatus  = "update";
        var sOrderID = msOrderID;
        
        var oBox = null;
        
        //
        //Get field values.
        //
        
        oBox = $("GeneralFieldsGroup");    
        var oOrderStatus = GetFieldGroupValue(oBox,"OrderStatus");
       
        oBox = $("DateFieldsGroup");    
        if (oBox)
        {
            var oAuthorizeDate = GetFieldGroupValue(oBox,"AuthorizeDate",true);
            var oSubmitDate    = GetFieldGroupValue(oBox,"SubmitDate",  true);
            var oEstimateDate  = GetFieldGroupValue(oBox,"EstimateDate",true);
            var oProcessDate   = GetFieldGroupValue(oBox,"ProcessDate", true);
            var oShipDate      = GetFieldGroupValue(oBox,"ShipDate",    true);
            var oDeliverDate   = GetFieldGroupValue(oBox,"DeliverDate", true);
            var oHoldDate      = GetFieldGroupValue(oBox,"HoldDate",    true);
            var oCancelDate    = GetFieldGroupValue(oBox,"CancelDate",  true);
            var oCloseDate     = GetFieldGroupValue(oBox,"CloseDate",   true);
        } 
       
        oBox = $("CustomFieldsGroup");    
        if (oBox)
        {
            var oCustom1 = GetFieldGroupValue(oBox,"Custom1");
            var oCustom2 = GetFieldGroupValue(oBox,"Custom2");
            var oCustom3 = GetFieldGroupValue(oBox,"Custom3");
            var oCustom4 = GetFieldGroupValue(oBox,"Custom4");
            var oCustom5 = GetFieldGroupValue(oBox,"Custom5");
        }
               
        oBox = $("CommentsFieldsGroup");    
        if (oBox)
        {
            var oComments = GetFieldGroupValue(oBox,"Comments");
        }
               
        oBox = $("DeliveryFieldsGroup");    
        if (oBox)
        {
            var oDeliverMethod = GetFieldGroupValue(oBox,"DeliverMethod");
            var oDeliverAddrLine1 = GetFieldGroupValue(oBox,"DeliverAddrLine1");
            var oDeliverAddrLine2 = GetFieldGroupValue(oBox,"DeliverAddrLine2");
            var oDeliverAddrLine3 = GetFieldGroupValue(oBox,"DeliverAddrLine3");
        }
              
        //
        //Build pipe-delimited string of values.
        //
       
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
            
            //Hold onto the initial length so we can dertermine is any fields were actually updated.
            var iInitValsLen = sVals.length;
            
            //If a new Order is being submitted, override the Order Status and the Submitted Date.
            if (msSaveMode == "submit") 
            {
                oOrderStatus.Updated = true;
                oOrderStatus.Value = "Submitted";
                oSubmitDate.Updated = true;
                var dDate = new Date();
                var iMonth = dDate.getMonth() + 1;
                var iYear = dDate.getFullYear();
                var iDay = dDate.getDate();
                var sDate = iYear.toString() + "/" + iMonth.toString() + "/" + iDay.toString();
                oSubmitDate.Value = sDate;
            }
            
            //OrderStatus field updated?
            if (oOrderStatus.Updated) sVals += "OrderStatus=" + oOrderStatus.Value + "|";
            
            //Check each Date field for changes.
            if (oAuthorizeDate && oAuthorizeDate.Updated) sVals += "AuthorizeDate=" + oAuthorizeDate.Value + "|";
            if (oSubmitDate && oSubmitDate.Updated) sVals += "SubmitDate=" + oSubmitDate.Value + "|";
            if (oEstimateDate && oEstimateDate.Updated) sVals += "EstimateDate=" + oEstimateDate.Value + "|";
            if (oProcessDate && oProcessDate.Updated) sVals += "ProcessDate=" + oProcessDate.Value + "|";
            if (oShipDate && oShipDate.Updated) sVals += "ShipDate=" + oShipDate.Value + "|";
            if (oDeliverDate && oDeliverDate.Updated) sVals += "DeliverDate=" + oDeliverDate.Value + "|";
            if (oHoldDate && oHoldDate.Updated) sVals += "HoldDate=" + oHoldDate.Value + "|";
            if (oCancelDate && oCancelDate.Updated) sVals += "CancelDate=" + oCancelDate.Value + "|";
            if (oCloseDate && oCloseDate.Updated)  sVals += "CloseDate=" + oCloseDate.Value + "|";
            
            //Check Delivery fields for changes.
            if (oDeliverMethod && oDeliverMethod.Updated) sVals += "DeliverMethod=" + oDeliverMethod.Value + "|";
            if (oDeliverAddrLine1 && oDeliverAddrLine1.Updated) sVals += "DeliverAddrLine1=" + oDeliverAddrLine1.Value + "|";
            if (oDeliverAddrLine2 && oDeliverAddrLine2.Updated) sVals += "DeliverAddrLine2=" + oDeliverAddrLine2.Value + "|";
            if (oDeliverAddrLine3 && oDeliverAddrLine3.Updated) sVals += "DeliverAddrLine3=" + oDeliverAddrLine3.Value + "|";
            
            //Check Comments field for changes.
            if (oComments && oComments.Updated) sVals += "Comments=" + oComments.Value + "|";
            
            //Check each Custom Field for changes.
            if (oCustom1 && oCustom1.Updated) sVals += "Custom1=" + oCustom1.Value + "|";
            if (oCustom2 && oCustom2.Updated) sVals += "Custom2=" + oCustom2.Value + "|";
            if (oCustom3 && oCustom3.Updated) sVals += "Custom3=" + oCustom3.Value + "|";
            if (oCustom4 && oCustom4.Updated) sVals += "Custom4=" + oCustom4.Value + "|";
            if (oCustom5 && oCustom5.Updated) sVals += "Custom5=" + oCustom5.Value + "|";
                 
            //Double-up pipe character for record delimiter.        
            sVals += "|";
        }
        
        //If the initial lenght of the string is the same as the final length, then that means
        //no changes were made to any Summary fields, so clear the string so we don't think 
        //an update made and send an incomplete update (no data) to the database.
        if ((iInitValsLen + 1) == sVals.length) sVals = "";

        //Return string to caller.
        return (bInvalidValuesFound) ? "ERROR: Invalid values found." : sVals;
    }
        
    //-------------------------------------------------------------------------------------
    // Return Qty Requirement for the specified product category and product group. 
    //-------------------------------------------------------------------------------------
    this.GetQtyRequirement = function(sSearchCategoryID, sSearchGroupID) 
    {
        var iQty = 0;
      
        //Display data.
        for (var i=0; i < moOrderQty.length; i++) 
        {
            var oRecord = moOrderQty[i];
            
            var sCategoryID = $data("ProductCategoryID", oRecord);
            var sGroupID = $data("ProductGroupID", oRecord);
            var sQty = $data("Qty", oRecord);
            
            if (sSearchCategoryID == sCategoryID && sSearchGroupID == sGroupID)
            {
                iQty = parseInt(sQty,10);
                break;
            }
        }
        
        return iQty;
            
    }
        
    //-------------------------------------------------------------------------------------
    // Returns the count of currently selected products for the specified product category
    // and product group. 
    //-------------------------------------------------------------------------------------
    function GetSelectedProductCount(sSearchCatID, sSearchGroupID) 
    {
        var oBox = $("OrderItemsDataBox");
        
        var iCnt = 0;
        
        for (var i=0; i < oBox.childNodes.length; i++)
        {
            var oItem = oBox.childNodes[i];
            
            //ignore text nodes.
            if (oItem.nodeType != 1) continue;
            
            if (oItem.id == "DataItemBox") 
            {
                var oQtyField = $field("ItemQty", oItem);
                
                var sQtyVal  = oQtyField.value;
                var sCatID   = oQtyField.getAttribute("ProductCategoryID");
                var sGroupID = oQtyField.getAttribute("ProductGroupID");
                
                if (sCatID == sSearchCatID && sGroupID == sSearchGroupID) iCnt += parseInt(sQtyVal,10);
            }
        }
        
        return iCnt;
    }
        
    //-------------------------------------------------------------------------------------
    // Retrieves all data required by the user interface.
    //-------------------------------------------------------------------------------------
    this.Init = function(sOrderID, oOrderItemsList) {
    
        msOrderID = sOrderID;
        
        moOrderItemsList = oOrderItemsList;
    
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
        var oItems = $("OrderActionBox").getElementsByTagName("DIV");
        for (var i=0; i<oItems.length; i++)
        {
            if (oItems[i].className.indexOf("ActionBar") >= 0) 
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
        
        //If order number is missing or invalid, display error message and get outta here.
        if (!msOrderID || msOrderID == "0") 
        {
            var sMsg = "No order information available (invalid order serial number).";
            var sDetails = "Invalid or missing order serial number.";
            SetStatusMsg("MainStatusMsg", sMsg, sDetails, true, false);
            return;
        }
        
        //Initiate retrieval of Qty Requirements. Also triggers retrieval of the Order Summary.
        RetrieveQtyRequirements();
        
        //RetrieveOrderSummary();  
  
        //RetrieveOrderItems();
    
    }
 
    //-------------------------------------------------------------------------------------
    // Returns status of SAVE PENDING flag.
    //-------------------------------------------------------------------------------------
    this.IsSavePending = function() {
    
        return mbSavePending;
    
    }
         
    //-------------------------------------------------------------------------------------
    // Populates the fields in the Custom Fields container.
    //-------------------------------------------------------------------------------------
    function PopulateCustomFieldsBox(oData) {
   
        var oBox = $("CustomFieldsGroup");
        
        try {
            //Only display for admin users.
            if (msUserType != "admin") 
            {
    	        oBox.parentNode.style.display = "none";
    	        return;
    	    }
    	}
    	catch(e) {return;}
        
        oBox.innerHTML = "";
        
        for (var i=1; i<=5; i++) 
        {
            //Insert container for all columns/fields.
	        var oItemBox = document.createElement("DIV");
	        oItemBox.id = "Custom" + i + "FieldWrapper";
	        oItemBox.className = "FieldWrapper";
	        oItemBox.style.margin = "5px 0px 5px 0px";
            oItemBox.setAttribute("UpdateStatus", "existing");
            oItemBox.setAttribute("OrderID", oData.OrderID);
	        oBox.appendChild(oItemBox);

            //Insert field header.
            var oItem = document.createElement("LABEL");
            oItem.id = "Custom" + i + "Hdr";
            //oItem.readOnly = true; //do not allow editting
            oItem.tabIndex = -1; //prevent tab stop
            oItem.className = "FieldHdr";
            oItem.style.marginLeft  = "15px";
            //oItem.style.width = "300px";
            oItem.innerHTML = "Custom Field " + i + ": "; 
            oItemBox.appendChild(oItem);
            
            //Insert field value.
            var oItem = document.createElement("INPUT");
            oItem.type = "text";	
            oItem.id = "Custom" + i;
            oItem.className = "FieldVal2";
            oItem.style.borderWidth = "1px";
	        oItem.style.padding = "2px 0px 3px 2px";
            oItem.maxLength = "60";
            oItem.style.left  = "105px";
            oItem.style.width = "270px";	
            oItem.value = eval("oData.Custom" + i);
            oItem.setAttribute("LastVal", eval("oData.Custom" + i));
            oItem.setAttribute("OrderID", oData.OrderID);
            AddEvt(oItem, "keydown", SetSave);
            oItemBox.appendChild(oItem);
        
        }
    }
    
    //-------------------------------------------------------------------------------------
    // Populates the fields in the Comments container.
    //-------------------------------------------------------------------------------------
    function PopulateCommentsBox(oData) {
   
        var oBox = $("CommentsFieldsGroup");
        
        try {
            //Only display for admin users.
            if (msUserType != "admin") 
            {
    	        oBox.parentNode.style.display = "none";
    	        return;
    	    }
    	}
    	catch(e) {return;}
        
        oBox.innerHTML = "";
        
        //Insert container for all columns/fields.
        var oItemBox = document.createElement("DIV");
        oItemBox.id = "CommentsFieldWrapper";
        oItemBox.className = "FieldWrapper";
        oItemBox.style.width = "395px";
        oItemBox.style.margin = "5px 0px 5px 0px";
        oItemBox.setAttribute("UpdateStatus", "existing");
        oItemBox.setAttribute("OrderID", oData.OrderID);
        oBox.appendChild(oItemBox);

        //Insert field header.
        var oItem = document.createElement("LABEL");
        oItem.id = "CommentsFieldHdr";
        //oItem.readOnly = true; //do not allow editting
        oItem.tabIndex = -1; //prevent tab stop
        oItem.className = "FieldHdr Right";
        oItem.style.width = "370px";
        oItem.style.margin  = "0px 0px 2px 0px";
        oItem.innerHTML = "(800 characters max)"; 
        oItemBox.appendChild(oItem);
        
        //Insert field value.
        var oItem = document.createElement("TEXTAREA");
        //oItem.type = "text";	
        oItem.id = "Comments";
        oItem.className = "FieldVal2";
        oItem.style.borderWidth = "1px";
        oItem.style.padding = "3px 3px 3px 3px";
        oItem.maxLength = "800";
        oItem.style.margin = "20px 0px 8px 8px";
        //oItem.style.top  = "10px";
        //oItem.style.left  = "10px";
        oItem.style.width = "375px";	
        oItem.style.height = "100px";	
        oItem.value = oData.Comments;
        oItem.setAttribute("LastVal", oData.Comments);
        oItem.setAttribute("OrderID", oData.OrderID);
        AddEvt(oItem, "keydown", SetSave);
        oItemBox.appendChild(oItem);
        
    }
    
    //-------------------------------------------------------------------------------------
    // Populates the fields in the Dates container.
    //-------------------------------------------------------------------------------------
    function PopulateDatesBox(oData) {
   
        var oBox = $("DateFieldsGroup");
         
        oBox.innerHTML = "";
        
        var bAllowEdit = (msUserType == "admin") ? true : false;
         
        //var bAllowEdit_Hold   = (msUserType == "purchaser") ? true : bAllowEdit;
        //var bAllowEdit_Cancel = (msUserType == "purchaser") ? true : bAllowEdit;
       
        var sUpdateStatus = "existing";
       
        PopulateDatesBoxItem(oBox, "Authorized Date", oData, "AuthorizeDate", bAllowEdit, sUpdateStatus);
        PopulateDatesBoxItem(oBox, "Submitted Date",  oData, "SubmitDate",    bAllowEdit, sUpdateStatus);
        PopulateDatesBoxItem(oBox, "Estimated Date",  oData, "EstimateDate",  bAllowEdit, sUpdateStatus);
        PopulateDatesBoxItem(oBox, "Processing Date", oData, "ProcessDate",   bAllowEdit, sUpdateStatus);
        PopulateDatesBoxItem(oBox, "Shipped Date",    oData, "ShipDate",      bAllowEdit, sUpdateStatus);
        PopulateDatesBoxItem(oBox, "Delivered Date",  oData, "DeliverDate",   bAllowEdit, sUpdateStatus);
        PopulateDatesBoxItem(oBox, "Hold Date",       oData, "HoldDate",      bAllowEdit, sUpdateStatus);
        PopulateDatesBoxItem(oBox, "Cancel Date",     oData, "CancelDate",    bAllowEdit, sUpdateStatus);
        PopulateDatesBoxItem(oBox, "Close Date",      oData, "CloseDate",     bAllowEdit, sUpdateStatus);
    	
    }

    //-------------------------------------------------------------------------------------
    // Inserts a new Date-specific objects/elements into the Dates box.
    //-------------------------------------------------------------------------------------
    function PopulateDatesBoxItem(oBox, sName, oData, sField, bAllowEdit, sUpdateStatus) {

        //example: PopulateOrderBoxItemDate(oItemBox, "AuthDate", oData, "AuthorizedDate", "existing")

        //Adjustment for field padding and/or border width.
        var iAdjust = 0;
        var iWidthAdjust = -2;
        var iCalAdjust = 0;
        
        //Insert container for all the field header and the field value.
        var oItemBox = document.createElement("DIV");
        oItemBox.id = sField + "FieldWrapper";
        oItemBox.className = "FieldWrapper";
        oItemBox.style.width = "395px";
        oItemBox.style.margin = "5px 0px 5px 0px";
        oItemBox.setAttribute("UpdateStatus", "existing");
        oItemBox.setAttribute("OrderID", oData.OrderID);
        oBox.appendChild(oItemBox);

        //Insert field header.
        var oItem = document.createElement("LABEL");
        oItem.id = sField + "Hdr";
        //oItem.readOnly = true; //do not allow editting
        oItem.tabIndex = -1; //prevent tab stop
        oItem.className = "FieldHdr Right";
        oItem.style.marginLeft  = "5px";
        oItem.style.width = "120px";
        oItem.innerHTML = sName + ": "; 
        oItemBox.appendChild(oItem);
        
        //Insert field value.
        var oItem = document.createElement("INPUT");
        oItem.type = "text";	
        oItem.id = sField;
        oItem.className = "FieldVal2";
        oItem.style.borderWidth = "1px";
        //oItem.style.padding = "2px 0px 3px 2px";
        oItem.maxLength = "60";
        oItem.style.left  = "130px";
        oItem.style.width = "110px";	
        var sDateVal = eval("oData." + sField);
        var sDateDetailVal = eval("oData." + sField + "Detail");
        var sSetBy = eval("oData." + sField + "ByName");
        oItem.value = sDateVal;
        oItem.title = "Set by " + sSetBy + " on " + sDateDetailVal;
        oItem.setAttribute("LastVal", sDateVal);
        oItem.setAttribute("OrderID", oData.OrderID);
        AddEvt(oItem, "keydown", SetSave);
        AddEvt(oItem, "change", SetSave);
        oItemBox.appendChild(oItem);
       
        //Additional tweaks - if not edittable.
        if (!bAllowEdit)
        {
            oItem.readOnly = true;
            oItem.className += " ReadOnly";
            oItem.style.borderWidth = "1px";
        }
        
        //Insert Exam Date calendar image.
	    //if (sUpdateStatus == "insert") {
	        var oItem = document.createElement("IMG");
	        oItem.id = sField + "Cal";
	        oItem.className = "FieldCal2";
	        if (!bAllowEdit) oItem.style.cursor = "default";
	        oItem.src = "img/calendar.jpg";
            oItem.style.top  = "2px";
            oItem.style.left = "250px";
            //oItem.style.left = oItemBox.lastChild.offsetLeft + oItemBox.lastChild.offsetWidth - iCalAdjust + "px";
            if (bAllowEdit === true) AddEvt(oItem, "click", CalendarPopup_Show);
	        oItemBox.appendChild(oItem);
        //}
               
    }  
      
    //-------------------------------------------------------------------------------------
    // Populates the fields in the Delivery container.
    //-------------------------------------------------------------------------------------
    function PopulateDeliveryBox(oData) {
   
        var oBox = $("DeliveryFieldsGroup");
         
        oBox.innerHTML = "";
        
        var bAllowEdit = (msUserType == "admin") ? true : false;
        
        if (msSaveMode == "submit") bAllowEdit = true;
       
        //Insert container for all columns/fields.
        var oItemBox = document.createElement("DIV");
        oItemBox.id = "DeliveryFieldWrapper" + oData.OrderID;
        oItemBox.className = "FieldWrapper";
        oItemBox.style.width = "395px";
        //oItemBox.style.border = "solid 1px red";
        oItemBox.style.margin = "5px 0px 5px 0px";
        oItemBox.style.height = "30px";
        oItemBox.setAttribute("UpdateStatus", "existing");
        oItemBox.setAttribute("OrderID", oData.OrderID);
        oBox.appendChild(oItemBox);

        //Insert field header.
        var oItem = document.createElement("LABEL");
        //oItem.id = "DeliverMethodHdr";
        //oItem.readOnly = true; //do not allow editting
        oItem.tabIndex = -1; //prevent tab stop
        oItem.className = "FieldHdr2";
        oItem.style.left = "10px";
        //oItem.style.width = "100px";
        oItem.style.margin  = "0px 0px 2px 0px";
        oItem.innerHTML = "Delivery Method: "; 
        oItemBox.appendChild(oItem);
        
	    //Insert Delivery Method dropdown.
//        var oItem = document.createElement("SELECT");
//        oItem.id = "DeliverMethod";
//        oItem.className = (mbIE)? "FieldValDropdown2IE" : "FieldValDropdown2";
//        oItem.style.marginLeft  = "10px";
//        //oItem.style.width = "100px";	
//        PopulateDeliverMethodDropdown(oItem, oData.DeliverMethod);
//        oItem.setAttribute("LastVal", oData.DeliverMethod);
//        AddEvt(oItem, "change", SetSave);
//        AddEvt(oItem, "change", SetChangeToDeliverMethod);
//        //AddEvt(oItem, "blur",    SetChangeToOrderStatus);
//        oItemBox.appendChild(oItem);
//        
        
        if (bAllowEdit == true) 
        {
            var oItem = document.createElement("SELECT");
            oItem.id = "DeliverMethod";
            oItem.className = (mbIE)? "FieldValDropdown2IE" : "FieldValDropdown2";
            oItem.style.marginLeft  = "10px";
            //oItem.style.width = "100px";	
            PopulateDeliverMethodDropdown(oItem, oData.DeliverMethod);
            oItem.setAttribute("LastVal", oData.DeliverMethod);
            AddEvt(oItem, "change", SetSave);
            AddEvt(oItem, "change", SetChangeToDeliverMethod);
            //AddEvt(oItem, "blur",    SetChangeToOrderStatus);
            oItemBox.appendChild(oItem);
        }
        else
        {
            var oItem = document.createElement("INPUT");
            oItem.type = "text";	
            oItem.id = "DeliverMethod";
            oItem.className = "FieldVal2 ReadOnly";
            oItem.readOnly = true;
            oItem.style.borderWidth = "1px";
            //oItem.style.padding = "2px 0px 3px 2px";
            //oItem.maxLength = "60";
            oItem.style.marginLeft = "10px";
            oItem.style.width = "120px";	
            var sVal = oData.DeliverMethod;
            oItem.value = sVal;
            //oItem.title = "Details: blah, blah, blah ";
            oItem.setAttribute("LastVal", sVal);
            //oItem.setAttribute("OrderID", oData.OrderID);
            //AddEvt(oItem, "keydown", SetSave);
            oItemBox.appendChild(oItem);
        }
 
        //Insert link to tracking information.
        var oItem = document.createElement("LABEL");
        //oItem.id = "ViewTrackingInfo";
        //oItem.readOnly = true; //do not allow editting
        oItem.tabIndex = -1; //prevent tab stop
        oItem.className = "FieldHdr2";
        oItem.style.left = "20px";
        oItem.style.color = "rgb(0,0,255)";
        //oItem.style.width = "100px";
        oItem.style.margin  = "0px 0px 2px 0px";
        oItem.style.cursor = "pointer";
        oItem.innerHTML = "view tracking information"; 
        AddEvt(oItem, "click", ShowTrackingInfo);
        oItemBox.appendChild(oItem);
               
        //Insert Delivery Address Lines.
        for (var i=1; i<=3; i++) 
        {
            //Insert container for all columns/fields.
	        var oItemBox = document.createElement("DIV");
	        oItemBox.id = "DeliverAddrLine" + i + "FieldWrapper";
	        oItemBox.className = "FieldWrapper";
	        oItemBox.style.margin = "5px 0px 5px 0px";
            oItemBox.setAttribute("UpdateStatus", "existing");
            oItemBox.setAttribute("OrderID", oData.OrderID);
	        oBox.appendChild(oItemBox);

            //Insert field header.
            var oItem = document.createElement("LABEL");
            oItem.id = "DeliverAddrLine" + i + "Hdr";
            //oItem.readOnly = true; //do not allow editting
            oItem.tabIndex = -1; //prevent tab stop
            oItem.className = "FieldHdr2";
            oItem.style.marginLeft = "10px";
            oItem.style.width = "120px";
            oItem.innerHTML = "Address Line " + i + ": "; 
            oItemBox.appendChild(oItem);
            
            //Insert field value.
            var oItem = document.createElement("INPUT");
            oItem.type = "text";	
            oItem.id = "DeliverAddrLine" + i;
            oItem.className = "FieldVal2";
            oItem.style.borderWidth = "1px";
	        oItem.style.padding = "2px 0px 3px 2px";
            oItem.maxLength = "50";
            oItem.style.marginLeft = "10px";
            oItem.style.width = "250px";	
            oItem.value = eval("oData.DeliverAddrLine" + i);
            var bReadOnly = (oData.DeliverMethod.toLowerCase().indexOf("other") >= 0) ? false : true;
            oItem.readOnly = bReadOnly;
            oItem.style.backgroundColor = (bReadOnly) ? "rgb(240,240,240)" : "rgb(255,255,255)";
            oItem.setAttribute("LastVal", eval("oData.DeliverAddrLine" + i));
            oItem.setAttribute("OrderID", oData.OrderID);
            AddEvt(oItem, "keydown", SetSave);
            oItemBox.appendChild(oItem);
                   
            //Additional tweaks - if not edittable.
            if (!bAllowEdit)
            {
                oItem.readOnly = true;
                oItem.className += " ReadOnly";
                oItem.style.borderWidth = "1px";
                oItem.style.backgroundColor = "transparent";
            }

        
        }
    }
    
    //-------------------------------------------------------------------------------------
    // Populates dropdown with Delivery Method options and sets the initial value.
    //-------------------------------------------------------------------------------------
    function PopulateDeliverMethodDropdown(oDropdown, sInitialValue) {
    	    
        //Get reference to XMLDOMNodeList.
        //var oResults = dbExamTypes.DataNodeList();

        //Populate dropdown.
        //AddSelectOption(document, oDropdown, " ", 0, 0);
        AddSelectOption(document, oDropdown, "Employee Site", "Employee Site", 0);
        AddSelectOption(document, oDropdown, "Pick Up", "Pick Up", 1);
        AddSelectOption(document, oDropdown, "Other Address", "Other Address", 2);
        
        if (sInitialValue != null) SetSelectValue(oDropdown, sInitialValue);

    }      
              
    //-------------------------------------------------------------------------------------
    // Populates the fields in the General Fields container.
    //-------------------------------------------------------------------------------------
    function PopulateGeneralBox(oData) {
     
        var oBox = $("GeneralFieldsGroup");
         
        oBox.innerHTML = "";
  	
    	//Display the employee name in the box title.
        var sName = oData.FirstName + " " + oData.LastName;
        $("OrderActionBoxTitle").innerHTML = "Order for " + sName;
        $("OrderActionBoxTitle").setAttribute("OrderID", oData.OrderID);
       
        //Insert a new field objects for each General field to be displayed.
        
        PopulateGeneralBoxItem(oBox, "Serial Number",   oData, "OrderNumber",   false,  "existing");
        PopulateGeneralBoxItem(oBox, "Authorized By",   oData, "AuthorizeDateByName",   false,  "existing");
        
        if (msUserType == "admin" || msUserType == "purchaser") 
        {
            PopulateGeneralBoxItem(oBox, "Order Status",    oData, "OrderStatus",   true,  "existing");
            //PopulateGeneralBoxItem(oBox, "Payment Method",  oData, "PaymentMethod", false,  "existing");
            //PopulateGeneralBoxItem(oBox, "CC/PO Number",    oData, "PaymentNumber", false,  "existing");
        }
        else {
            PopulateGeneralBoxItem(oBox, "Order Status",    oData, "OrderStatus",   false,  "existing");
        }
        
        PopulateGeneralBoxItem(oBox, "Company Name",    oData, "CompanyName",       false,  "existing");
        PopulateGeneralBoxItem(oBox, "Company Site",    oData, "CompanySiteName",   false,  "existing");
        PopulateGeneralBoxItem(oBox, "Employee Name",   oData, "FullName",          false,  "existing");
        PopulateGeneralBoxItem(oBox, "Employee Email",  oData, "EmailAddr",         false,  "existing");
        PopulateGeneralBoxItem(oBox, "Employee Phone",  oData, "Phone1",            false,  "existing");
        
    }
  
    //-------------------------------------------------------------------------------------
    // Inserts a General Summary field object/element into the container.
    //-------------------------------------------------------------------------------------
    function PopulateGeneralBoxItem(oBox, sName, oData, sField, bAllowEdit, UpdateStatus) 
    {
        //Insert container for the field header and field value.
        var oItemBox = document.createElement("DIV");
        oItemBox.id = sField + "FieldWrapper";
        oItemBox.className = "FieldWrapper";
        oItemBox.style.width = "395px";
        oItemBox.style.margin = "5px 0px 5px 0px";
        oItemBox.setAttribute("UpdateStatus", "existing");
        oItemBox.setAttribute("OrderID", oData.OrderID);
        oBox.appendChild(oItemBox);

        //Insert field header.
        var oItem = document.createElement("LABEL");
        oItem.id = sField + "Hdr";
        //oItem.readOnly = true; //do not allow editting
        oItem.tabIndex = -1; //prevent tab stop
        oItem.className = "FieldHdr2 Right";
        oItem.style.marginLeft  = "5px";
        oItem.style.width = "120px";
        oItem.innerHTML = sName + ": "; 
        oItemBox.appendChild(oItem);
        
        //Insert field value.
        if (sField == "OrderStatus" && bAllowEdit == true) 
        {
            var oItem = document.createElement("SELECT");
            oItem.id = sField; //+ oData.OrderID;
            oItem.className = (mbIE)? "FieldValDropdown2IE" : "FieldValDropdown2";
            oItem.style.marginLeft  = "10px";
            //oItem.style.width = "100px";	
            PopulateOrderStatusDropdown("all", oItem, oData.OrderStatus);
            oItem.setAttribute("LastVal", oData.OrderStatus);
            oItem.setAttribute("OrderID", oData.OrderID);
            AddEvt(oItem, "change", SetSave);
            AddEvt(oItem, "change", SetChangeToOrderStatus);
           //AddEvt(oItem, "blur",    SetChangeToOrderStatus);
            oItemBox.appendChild(oItem);
        }
        else
        {
            var oItem = document.createElement("INPUT");
            oItem.type = "text";	
            oItem.id = sField; //+ oData.OrderID;
            oItem.className = "FieldVal2";
            oItem.style.borderWidth = "1px";
            //oItem.style.padding = "2px 0px 3px 2px";
            //oItem.maxLength = "60";
            oItem.style.marginLeft  = "10px";
            oItem.style.width = "200px";	
            var sVal = eval("oData." + sField);
            oItem.value = sVal;
            //oItem.title = "Details: blah, blah, blah ";
            oItem.setAttribute("LastVal", sVal);
            oItem.setAttribute("OrderID", oData.OrderID);
            //AddEvt(oItem, "keydown", SetSave);
            oItemBox.appendChild(oItem);
        }
        
        //
        //Additional tweaks... 
        //
        
        //If Order Number make bold.
        if (sField == "OrderNumber") oItem.style.fontWeight = "bold";
        
        //If Order Status and read only, then make bold.
        if ((sField == "OrderStatus") && !bAllowEdit) oItem.style.fontWeight = "bold";
       
        //Additional tweaks - if not edittable.
        if (!bAllowEdit)
        {
            oItem.readOnly = true;
            oItem.className = "FieldVal2 ReadOnly";
            oItem.style.borderWidth = "0px";
       }

    } 
              
    //-------------------------------------------------------------------------------------
    // Populates the fields in the Payment Fields container.
    //-------------------------------------------------------------------------------------
    function PopulatePaymentMethodBox(oData) {
     
        var oBox = $("PaymentFieldsGroup");
         
        oBox.innerHTML = "";
  	
 
        //Insert a new field objects for each Payment field to be displayed.
        
        PopulatePaymentMethodBoxItem(oBox, "Authorized By",   oData, "AuthorizeDateByName",   false,  "existing");
        
        if (msUserType == "admin" || msUserType == "purchaser") 
        {
            PopulatePaymentMethodBoxItem(oBox, "Payment Method",    oData, "PaymentMethod",     false,  "existing");
            PopulatePaymentMethodBoxItem(oBox, "PO Number",         oData, "PaymentPO",         false,  "existing");
            PopulatePaymentMethodBoxItem(oBox, "CC Type",           oData, "PaymentCCType",     false,  "existing");
            PopulatePaymentMethodBoxItem(oBox, "CC Name",           oData, "PaymentCCName",     false,  "existing");
            PopulatePaymentMethodBoxItem(oBox, "CC Number",         oData, "PaymentCCNumber",   false,  "existing");
            PopulatePaymentMethodBoxItem(oBox, "CC Expire Month",   oData, "PaymentCCExpMonth", false,  "existing");
            PopulatePaymentMethodBoxItem(oBox, "CC Expire Year",    oData, "PaymentCCExpYear",  false,  "existing");
        }
        
    } 
  
    //-------------------------------------------------------------------------------------
    // Inserts a Payment Method field object/element into the container.
    //-------------------------------------------------------------------------------------
    function PopulatePaymentMethodBoxItem(oBox, sName, oData, sField, bAllowEdit, UpdateStatus) 
    {
        //Insert container for the field header and field value.
        var oItemBox = document.createElement("DIV");
        oItemBox.id = sField + "FieldWrapper";
        oItemBox.className = "FieldWrapper";
        oItemBox.style.width = "395px";
        oItemBox.style.margin = "5px 0px 5px 0px";
        oItemBox.setAttribute("UpdateStatus", "existing");
        oItemBox.setAttribute("OrderID", oData.OrderID);
        oBox.appendChild(oItemBox);

        //Insert field header.
        var oItem = document.createElement("LABEL");
        oItem.id = sField + "Hdr";
        //oItem.readOnly = true; //do not allow editting
        oItem.tabIndex = -1; //prevent tab stop
        oItem.className = "FieldHdr2 Right";
        oItem.style.marginLeft  = "5px";
        oItem.style.width = "120px";
        oItem.innerHTML = sName + ": "; 
        oItemBox.appendChild(oItem);
        
        //Insert field value.
        var oItem = document.createElement("INPUT");
        oItem.type = "text";	
        oItem.id = sField; //+ oData.OrderID;
        oItem.className = "FieldVal2";
        oItem.style.borderWidth = "1px";
        //oItem.style.padding = "2px 0px 3px 2px";
        //oItem.maxLength = "60";
        oItem.style.marginLeft  = "10px";
        oItem.style.width = "200px";	
        var sVal = eval("oData." + sField);
        oItem.value = sVal;
        //oItem.title = "Details: blah, blah, blah ";
        oItem.setAttribute("LastVal", sVal);
        oItem.setAttribute("OrderID", oData.OrderID);
        //AddEvt(oItem, "keydown", SetSave);
        oItemBox.appendChild(oItem);
        
        //
        //Additional tweaks... 
        //
               
        //Additional tweaks - if not edittable.
        if (!bAllowEdit)
        {
            oItem.readOnly = true;
            oItem.className = "FieldVal2 ReadOnly";
            oItem.style.borderWidth = "0px";
       }

    } 
                   
    //-------------------------------------------------------------------------------------
    // Inserts a new data item into the Order Qty data box.
    //-------------------------------------------------------------------------------------
    function PopulateQtyBoxItem(oBox, oData, sUpdateStatus) {

        var bAllowEdit = (msUserType == "admin" || msUserType == "purchaser") ? true : false;
    
        //Adjustment for field padding and/or border width.
        var iAdjust = 1;
        var iCalAdjust = 23;
        
        //Insert container for all columns/fields.
	    var oItemBox = document.createElement("DIV");
	    oItemBox.id = "DataItemBox";
	    oItemBox.className = "FieldWrapper";
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
	    //oItem.className = "FieldVal Center";
	    oItem.className = "FieldVal2 Center";
	    oItem.maxLength = "3";
        oItem.style.left  = "10px";
        oItem.style.width = "30px";	
        //oItem.style.width = $("OrderQtyHdr").offsetWidth + "px";	
	    oItem.value = oData.Qty;
        oItem.setAttribute("LastVal", oData.Qty);
        oItem.setAttribute("OrderID", oData.OrderID);
        oItem.setAttribute("ProductCategoryID", oData.ProductCategoryID);
        oItem.setAttribute("ProductGroupID", oData.ProductGroupID);
        AddEvt(oItem, "keydown", SetSave);
	    oItemBox.appendChild(oItem);
	    	           
        //Additional tweaks - if not edittable.
        if (!bAllowEdit)
        {
            oItem.readOnly = true;
            oItem.className += " ReadOnly";
        }


        //Insert field for Order Category and Group.
        var oItem = document.createElement("LABEL");
        //oItem.type = "text";
        oItem.id = "OrderQtyHdr";
        //oItem.readOnly = true; //do not allow editting
        oItem.tabIndex = -1; //prevent tab stop
        oItem.className = "FieldHdr2";
        oItem.style.marginLeft  = "15px";
        //oItem.style.width = "300px";
        var sCat = (oData.ProductCategory === oData.ProductGroup) ? oData.ProductCategory : oData.ProductCategory += " - " + oData.ProductGroup;
        oItem.innerHTML = sCat; 
        oItem.setAttribute("ProductCategoryID", oData.ProductCategoryID);
        oItem.setAttribute("ProductGroupID", oData.ProductGroupID);
        oItemBox.appendChild(oItem);
            
        //Insert field for Qty flag.
        var oItem = document.createElement("LABEL");
        //oItem.type = "text";
        oItem.id = "QtyFlag";
        //oItem.readOnly = true; //do not allow editting
        oItem.tabIndex = -1; //prevent tab stop
        oItem.className = "FieldHdr2";
        oItem.style.display = "inline-block";
        oItem.style.width = "10px";
        oItem.style.marginLeft  = "10px";
        //oItem.style.textAlign = "left";
        oItem.innerHTML = "<b style='color:red;'>*</b>"; 
        oItemBox.appendChild(oItem);
        
        if (oData.Qty == "0") oItem.style.visibility = "hidden";

    }   
     
    //-------------------------------------------------------------------------------------
    // Inserts a note into Qty Requirements box for items whose quantity requirement has
    // not been met.
    //-------------------------------------------------------------------------------------
    function PopulateQtyBoxReqMsg() {
    
        var oBox = $("QtyFieldsGroup");
        
         //Insert container for the message objects.
        var oItemBox = document.createElement("DIV");
        oItemBox.id = "QtyMsgFieldWrapper";
        oItemBox.className = "FieldWrapper";
        oItemBox.style.width = "380px";
        oItemBox.style.margin = "10px 0px 5px 10px";
        oItemBox.setAttribute("UpdateStatus", "existing");
        //oItemBox.setAttribute("OrderID", oData.OrderID);
        oBox.appendChild(oItemBox);
            
        //Insert field for message.
        var oItem = document.createElement("LABEL");
        //oItem.type = "text";
        oItem.id = "QtyMsg";
        //oItem.readOnly = true; //do not allow editting
        oItem.tabIndex = -1; //prevent tab stop
        oItem.className = "FieldHdr2";
        oItem.style.display = "inline-block";
        oItem.style.left = "5px";
        oItem.style.width = "370px";
        oItem.style.marginTop = "10px";
        oItem.style.padding = "3px 0px 3px 2px";
        oItem.style.border = "solid 0px rgb(40,40,40)";
        oItem.style.borderWidth = "1px 0px 0px 0px";
        oItem.style.height = "30px";
        //oItem.style.textAlign = "left";
        var sMsg = "Items flagged with a red asterisk (<b style='color:red;'>*</b>) are ";
        sMsg += "under or over the specified quantity requirement.";
        oItem.innerHTML = sMsg; 
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
        //if (mbSavePending && bForce == false) {
        if (mbSavePending) {
            sMsg = "There are unsaved changes pending. Please save or cancel your changes. ";
            alert(sMsg);
            //SetStatusMsg("StatusMsg", sMsg, "", true, true, "", 4000);
            return;
        }
            
        var sMsg = "Refreshing order information, please wait...";
        SetStatusMsg("MainStatusMsg", sMsg, "", false, false);
        
        RetrieveQtyRequirements();
        
    }    
    
    //-------------------------------------------------------------------------------------
    // Submits AJAX request to retrieve order summary information.
    //-------------------------------------------------------------------------------------
    function RetrieveOrderSummary() {

	    //Display status message.   
	    //ClearStatusMsg("main"); 
	    SetStatusMsg("StatusMsg", "Retrieving order summary information...", "", false);
 	    
	    //Create XmlHttpRequest object.
	    moAjax = AjaxCreate("Order Summary");
	    if (!moAjax) return;
            
	    //Build parms string.
        var sParms	= "";
	    sParms += "&Action=" + encodeURI("GetOrder");
	    sParms += "&OrderID=" + encodeURI(msOrderID);
    	
	    //Initiate call to database.
	    var bSuccess = AjaxSend(moAjax, sParms, RetrieveOrderSummaryCallback);
    	
	    //If not initiated, clear all status messages. 
	    if (!bSuccess) ClearStatusMsg();

    }

    //-------------------------------------------------------------------------------------
    // Callback for RetrieveOrderSummary method. 
    //-------------------------------------------------------------------------------------
    function RetrieveOrderSummaryCallback() 
    {  
	    var bKeepTrying = ((moAjax.readyState == 4) && (moAjax.status == 200)) ? false : true;
	    
	    if (bKeepTrying) return; 
    
		var sResult = moAjax.responseText;
		
		var sError = AjaxError(sResult);
		if (sError.length > 0)  
		{
		    alert("Unable to retrieve order summary information. \n\n\ Error details:" + sError);
		    mbCancellingChanges = false;
		    moAjax = null;
		    return;
		}
		
		var oXml = (mbIE) ? moAjax.responseXML.childNodes[0] : moAjax.responseXML.documentElement; 
        
        //Display appropriate message if no orders remaining.
        if (!oXml || oXml.getElementsByTagName("Table").length == 0)  
        {  
            //moOrderItemsList.innerHTML = '<p id="NoItemsMsg">There are no order items available.</p>';
            var sMsg = "No order data available.";
            SetStatusMsg("MainStatusMsg", sMsg, "", false, true);
            SetStatusMsg("StatusMsg", "");
		    moAjax = null;
            return;
        }
		    
		moOrderSummary = oXml.getElementsByTagName("Table");
		
		//Release memory for AJAX object.
		moAjax = null;
		
		//Clear the data box contents.
		//moOrderDataBox.innerHTML = "";
		
        //Pull data from XML returned.
        var oRecord = moOrderSummary[0];
        
        var oAuthorizeDateParts = ParseOrderDate($data("AuthorizeDate", oRecord));
        var oEstimateDateParts  = ParseOrderDate($data("EstimateDate",  oRecord));
        var oSubmitDateParts    = ParseOrderDate($data("SubmitDate",    oRecord));
        var oProcessDateParts   = ParseOrderDate($data("ProcessDate",   oRecord));
        var oShipDateParts      = ParseOrderDate($data("ShipDate",      oRecord));
        var oDeliverDateParts   = ParseOrderDate($data("DeliverDate",   oRecord));
        var oHoldDateParts      = ParseOrderDate($data("HoldDate",      oRecord));
        var oCancelDateParts    = ParseOrderDate($data("CancelDate",    oRecord));
        var oCloseDateParts     = ParseOrderDate($data("CloseDate",     oRecord));
           
        var oData = 
        {
            "OrderID"           : $data("OrderID",      oRecord), 
            "OrderNumber"       : $data("OrderNumber",  oRecord), 
            "OrderStatus"       : $data("OrderStatus",  oRecord), 
            
            "CompanyID"         : $data("CompanyID",    oRecord), 
            "CompanyName"       : $data("CompanyName",  oRecord), 
            "CompanySiteID"     : $data("CompanySiteID",   oRecord), 
            "CompanySiteName"   : $data("CompanySiteName", oRecord), 
            "EmployeeID"        : $data("EmployeeID",   oRecord), 
            "FirstName"         : $data("FirstName",    oRecord), 
            "LastName"          : $data("LastName",     oRecord), 
            "FullName"          : $data("FirstName",    oRecord) + " " + $data("LastName", oRecord), 
            "Gender"            : $data("Gender",       oRecord), 
            "EmailAddr"         : $data("EmailAddr",    oRecord), 
            "Phone1"            : $data("Phone1",       oRecord), 
            "Phone2"            : $data("Phone2",       oRecord), 
            
            "PaymentMethod"     : IsNull($data("PaymentMethod",oRecord), ''), 
            "PaymentPO"         : IsNull($data("PaymentPO",oRecord), ''), 
            "PaymentCCType"     : IsNull($data("PaymentCCType",oRecord), ''), 
            "PaymentCCName"     : IsNull($data("PaymentCCName",oRecord), ''), 
            "PaymentCCNumber"   : IsNull($data("PaymentCCNumber",oRecord), ''), 
            "PaymentCCExpMonth" : IsNull($data("PaymentCCExpMonth",oRecord), ''), 
            "PaymentCCExpYear"  : IsNull($data("PaymentCCExpYear",oRecord), ''), 
            
            "AuthorizeDate"     : oAuthorizeDateParts.Date, 
            "AuthorizeDateDetail": oAuthorizeDateParts.DateTime, 
            "EstimateDate"      : oEstimateDateParts.Date, 
            "EstimateDateDetail": oEstimateDateParts.DateTime, 
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
            
            "AuthorizeDateBy"       : $data("AuthorizeDateBy",oRecord), 
            "AuthorizeDateByName"   : $data("AuthorizeDateByName",oRecord), 
            "EstimateDateBy"        : $data("EstimateDateBy",oRecord), 
            "EstimateDateByName"    : $data("EstimateDateByName",oRecord), 
            "SubmitDateBy"          : $data("SubmitDateBy",oRecord), 
            "SubmitDateByName"      : $data("SubmitDateByName",oRecord), 
            "ProcessDateBy"         : $data("ProcessDateBy",oRecord), 
            "ProcessDateByName"     : $data("ProcessDateByName",oRecord), 
            "ShipDateBy"            : $data("ShipDateBy",oRecord), 
            "ShipDateByName"        : $data("ShipDateByName",oRecord), 
            "DeliverDateBy"         : $data("DeliverDateBy",oRecord), 
            "DeliverDateByName"     : $data("DeliverDateByName",oRecord), 
            "CloseDateBy"           : $data("CloseDateBy",oRecord), 
            "CloseDateByName"       : $data("CloseDateByName",oRecord), 
            "HoldDateBy"            : $data("HoldDateBy",oRecord), 
            "HoldDateByName"        : $data("HoldDateByName",oRecord), 
            "CancelDateBy"          : $data("CancelDateBy",oRecord), 
            "CancelDateByName"      : $data("CancelDateByName",oRecord), 
            
            "DeliverMethod"     : $data("DeliverMethod", oRecord),
            "DeliverAddrLine1"  : IsNull($data("DeliverAddrLine1", oRecord),""),
            "DeliverAddrLine2"  : IsNull($data("DeliverAddrLine2", oRecord),""),
            "DeliverAddrLine3"  : IsNull($data("DeliverAddrLine3", oRecord),""),
        
            "Custom1"           : IsNull($data("Custom1", oRecord),""),
            "Custom2"           : IsNull($data("Custom2", oRecord),""),
            "Custom3"           : IsNull($data("Custom3", oRecord),""),
            "Custom4"           : IsNull($data("Custom4", oRecord),""),
            "Custom5"           : IsNull($data("Custom5", oRecord),""),
            
            "Comments"          : IsNull($data("Comments", oRecord),"")
        }
        
        //Get Employee ID.        
        msEmployeeID = oData.EmployeeID;
                        
        //If not an admin user and this is a Closed or Cancelled order, hide all actions on the Action Bar.
        if (msUserType != "admin" && (oData.OrderStatus == "Cancelled" || oData.OrderStatus == "Closed"))
        {
            moActionBar.style.visibility = "hidden";
            moOrderItemsList.DisableActionBar();
        }
        else 
        if ((msUserType == "general" || msUserType == "general") && oData.OrderStatus != "Authorized")
        {
            moActionBar.style.visibility = "hidden";
            moOrderItemsList.DisableActionBar();
        }
	    
	    //Display General info.    
	    PopulateGeneralBox(oData);
	    
	    //Display Payment Method info.
	    if ($("PaymentFieldsGroupBox")) PopulatePaymentMethodBox(oData);
	    
	    //Display Dates info.     
	    PopulateDatesBox(oData);
	    
	    //Display Dates info.     
	    PopulateCustomFieldsBox(oData);
	    
	    //Display Comments info.     
	    PopulateCommentsBox(oData);
	    
	    //Display Delivery info.     
	    PopulateDeliveryBox(oData);
	    
	    //Set the mode for changes to the order.
	    SetSaveMode();
        
        //Adjust layout of the data box and its container.
        //AdjustDataBoxLayout(moMainBox, moOrderDataBox, $("OrderColHdr"));
        //Display success message.
        var sMsg = (mbCancellingChanges) ? "Changes cancelled. Order data refreshed." : "Order retrieved successfully.";
        SetStatusMsg("MainStatusMsg", sMsg, "", false, true);
       
        var sMsg = (mbCancellingChanges) ? "Changes cancelled. Order summary data refreshed." : "Order summary data retrieved successfully.";
        SetStatusMsg("StatusMsg", sMsg, "", false, true);
        
        mbCancellingChanges = false;
     
        SetSave("off");
         
        //Flag quantity requirements that have not been met.       
        try {
            CheckQtyRequirements();
        }
        catch(e) {}
        
        //If this is an employee (general user) and the order has not been submitted, display the 
        //Current Sizes popup to capture any helpful information about sizes the user is currently 
        //wearing.
        if (msUserType == "general" && oData.OrderStatus == "Authorized") ShowCurrentSizesUI(oData.EmployeeID);

    }
    
    //-------------------------------------------------------------------------------------
    // Submits AJAX request to retrieve order quantity requirements.
    //-------------------------------------------------------------------------------------
    function RetrieveQtyRequirements() {

	    //Display status message.   
	    //ClearStatusMsg("main"); 
	    SetStatusMsg("StatusMsg", "Retrieving quantity requirements...", "", false);
 	    
	    //Create XmlHttpRequest object.
	    moAjaxOrderQty = AjaxCreate("Order Quantities");
	    if (!moAjaxOrderQty) return;
            
	    //Build parms string.
        var sParms	= "";
	    sParms += "&Action=" + encodeURI("GetOrderQtySpecs");
	    sParms += "&OrderID=" + encodeURI(msOrderID);
    	
	    //Initiate call to database.
	    var bSuccess = AjaxSend(moAjaxOrderQty, sParms, RetrieveQtyRequirementsCallback);
    	
	    //If not initiated, clear all status messages. 
	    if (!bSuccess) ClearStatusMsg();

    }

    //-------------------------------------------------------------------------------------
    // Callback for RetrieveQtyRequirements method. 
    //-------------------------------------------------------------------------------------
    function RetrieveQtyRequirementsCallback() 
    {  
	    if ((moAjaxOrderQty.readyState == 4) && (moAjaxOrderQty.status == 200))  
	    {  
			var sResult = moAjaxOrderQty.responseText;
			
			var sError = AjaxError(sResult);
			if (sError.length > 0)  
			{
			    alert("Unable to retrieve Quantity Requirements. \n\n\ Error details:" + sError);
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
		            "Qty"               : $data("Qty", oRecord) 
		        }
		        
		        PopulateQtyBoxItem(moOrderQtyBox, oData, "existing");
		    }

            PopulateQtyBoxReqMsg();
            
            //Adjust height of popup.
            //moMainBox.style.height = moOrderQtyBox.offsetTop + (moOrderQty.length * 30) + "px"; 
               		
		    SetStatusMsg("StatusMsg", "");
		    		            
            //Initiate refresh of the Order Summary information.
            RetrieveOrderSummary();  

	    } 
    }

    //-------------------------------------------------------------------------------------
    // Saves Order changes to the database.
    //-------------------------------------------------------------------------------------
    this.SaveChanges = function() {
        
        //If processing another action don't allow save action.
        //if (IsBusy()) return;
        if (mbSaving) return;
        
        if (!ValidateChanges()) return; 
                    
        msModifiedSummaryValues = GetModifiedSummaryValues();
        msModifiedQtyValues     = GetModifiedQtyValues();
        msModifiedItemValues    = moOrderItemsList.GetModifiedValuesInit();
                
        //testing...        
        //alert("Modified Values: \n\n" + msModifiedValues);
        //return;
        
        //Make sure there are changes to be saved.
        if (msModifiedSummaryValues.length == 0 && 
            msModifiedQtyValues.length == 0 && 
            msModifiedItemValues.length == 0  
        ) 
        {
            var sMsg = "There are no changes pending, save action cancelled.";
            SetStatusMsg("MainStatusMsg", sMsg, "", false, true, "red");
            return;
        }
       
        mbSaving = true;
        
        var sMsg = (msSaveMode == "submit") ? "Submitting new order for processing..." : "Saving order changes, please wait...";
        SetStatusMsg("MainStatusMsg", sMsg, "", false, false);
        
	    //Create XmlHttpRequest object.
	    moAjax = AjaxCreate("Order Changes");
	    if (!moAjax) return;
          
	    //Build parms string.
        var sParms	= "";
	    sParms += "&Action=" + encodeURI("SaveOrder");
	    sParms += "&UserID="        + encodeURI($("UserID").value);
	    sParms += "&OrderID="       + encodeURI($data("OrderID",    moOrderSummary[0]));
	    sParms += "&OrderNumber="   + encodeURI($data("OrderNumber", moOrderSummary[0]));
	    sParms += "&FirstName="     + encodeURI($data("FirstName",  moOrderSummary[0]));
	    sParms += "&LastName="      + encodeURI($data("LastName",   moOrderSummary[0]));
	    sParms += "&EmailAddr="     + encodeURI($data("EmailAddr",  moOrderSummary[0]));
	    sParms += "&OrderStatus="   + encodeURI($("OrderStatus").value);
	    
	    var sSendOrderConfirmation = (msSaveMode == "submit") ? "yes" : "no";
	    sParms += "&SendOrderConfirmation=" + encodeURI(sSendOrderConfirmation);
	    
	    if (msModifiedSummaryValues.length > 0)
	        sParms += "&SummaryValues=" + encodeURI(msModifiedSummaryValues);
	    
	    if (msModifiedQtyValues.length > 0)
	        sParms += "&QtyValues=" + encodeURI(msModifiedQtyValues);
	    
	    if (msModifiedItemValues.length > 0)
	        sParms += "&OrderItemValues=" + encodeURI(msModifiedItemValues);
    	
	    //Initiate call to database.
	    var bSuccess = AjaxSend(moAjax, sParms, SaveOrderChangesCallback);
    	
	    //If not initiated, clear all status messages. 
	    if (!bSuccess) {
	        ClearStatusMsg();    
	        mbSaving = false;
	    }    
	    
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
            SetStatusMsg("MainStatusMsg", sMsg, sMsgDetail, true, false);
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
        if (msSaveMode == "submit")
        {
            var sMsg = "New order submitted successfully. Thank you!";
            SetStatusMsg("MainStatusMsg", sMsg, "", false, false);
        }
        else 
        {
            var sMsg = "Order changes saved successfully";
            SetStatusMsg("MainStatusMsg", sMsg, "", false, true);
        }
        
        //Apply changes to status if the order was just submitted.
        if (msSaveMode == "submit")
        {
            if (msUserType == "general") 
            {
                $("OrderStatus").value = "Submitted";
                moActionBar.style.visibility = "hidden";
                moOrderItemsList.DisableActionBar();
            }
            else 
            {
                PopulateOrderStatusDropdown(msUserType, $("OrderStatus"), "Submitted");
            }
            
            //Set the mode based on the status change.
            SetSaveMode();
        }
        
        SetSave("off")
        
        moOrderItemsList.SetSaveOff();
        
        //Refresh the orders list.
        //Refresh();
            
    }
       
    //-------------------------------------------------------------------------------------
    // Called when a change to the Delivery Method is made by the user.
    //-------------------------------------------------------------------------------------
    function SetChangeToDeliverMethod(e) {

	    var evt = window.event || e;
	    var oSrc = evt.srcElement || e.target;
	    var sType = evt.type || e.type;

        //If old value and new value are the same, get outta here.
        var sNewVal = oSrc.value;
        var sLastVal = oSrc.getAttribute("LastVal");
        
        //***DAN TEMPORARY*** if (sNewVal == sLastVal) return;
                        
	    var oDataItemBox = oSrc.parentNode;
        //oDataItemBox.setAttribute("DeptID", sNewVal);
        
        //Enable/disable the Address Lines.
        for (var i=1; i<=3; i++) 
        {
            if (sNewVal === "Other Address") 
            {
                $("DeliverAddrLine" + i).readOnly = false;
                $("DeliverAddrLine" + i).style.backgroundColor = "rgb(255,255,255)";
            }
            else 
            {
                $("DeliverAddrLine" + i).value = "";
                $("DeliverAddrLine" + i).readOnly = true;
                $("DeliverAddrLine" + i).style.backgroundColor = "rgb(240,240,240)";
           }
        }
 
        
        //Set SAVE PENDING flags on.
        SetSave("on");
        
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
        
        //Update the appropriate date field.
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
                return;
        }
        
        //Change the color of the dropdown value.
        //oSrc.style.color = "red";
                        
	    var oBox = $("DateFieldsGroup");
	    
	    for (var i=0; i < oBox.childNodes.length; i++)
        {
            var oWrap = oBox.childNodes[i];
            
            //ignore text nodes.
            if (oWrap.nodeType != 1) continue;
            
            if (oWrap.className.indexOf("FieldWrapper") >= 0)  
            {
                var oDateField = oWrap.getElementsByTagName("INPUT")[0];
            
                //Revert any existing change back to its original value and color.
                if (oDateField.value != oDateField.getAttribute("LastVal"))
                {
                    oDateField.value = oDateField.getAttribute("LastVal");
                    oDateField.style.color = oDateField.getAttribute("LastColor");
                }
                
                //Set the date value to the current date and set the color to red.
                if (oDateField.id == sID) 
                {
                    var dDate = new Date();
                    var iMonth = dDate.getMonth() + 1;
                    var iYear = dDate.getFullYear();
                    var iDay = dDate.getDate();
                    
                    var sDate = iYear.toString() + "/" + iMonth.toString() + "/" + iDay.toString();

                    oDateField.value = sDate;
                    oDateField.setAttribute("LastColor", oDateField.style.color);
                    //oDateField.style.color = "red";
                    oDateField.style.fontWeight = "normal";
                }
            }
        }
        
        SetSaveMode();
    
        SetSave("on");
        
    }
        
    //-------------------------------------------------------------------------------------
    // Public access to the SetDataBoxItemStatus method. 
    //-------------------------------------------------------------------------------------
    this.SetDataBoxItemStatusInit = function(oDataField) {
    
        SetDataBoxItemStatus(oDataField);
    
    }
        
    //-------------------------------------------------------------------------------------
    // Set the Update Status of a data box item (record/row). 
    //-------------------------------------------------------------------------------------
    function SetDataBoxItemStatus(oDataField) {
        
        try {
            var oParent = oDataField.parentNode;
            if (oParent.id == "DataItemBox" || oParent.className.indexOf("FieldWrapper") >= 0) {
                var sStatus = oParent.getAttribute("UpdateStatus").toLowerCase();
                if (sStatus == "existing") oParent.setAttribute("UpdateStatus", "update");
            }
        }
        catch(e) {
            //do nothing, it might not apply
        }
        
    }  
      
    //-------------------------------------------------------------------------------------
    // Access to private function for setting SAVE PENDING flags.
    //-------------------------------------------------------------------------------------
    this.SetSaveInit = function(sSwitch) {
        
        SetSave(sSwitch);
        
    }
               
    //-------------------------------------------------------------------------------------
    // Set SAVE PENDING flags.
    //-------------------------------------------------------------------------------------
    function SetSave(arg1, arg2) {
    //this.SetSave = function(arg1, arg2) {

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
    // Set the mode based on Order Status. If this is a new order that has been "authorized" 
    // but not yet submitted for processing by the employee, then the submit mode is "submit".
    // Otherwise, the submit mode is "save" to indicate the order has been submitted for 
    // processing and changes are allowed. In some cases, based on permissions, no changes
    // are allowed and the order information is effectively "read only".
    //-------------------------------------------------------------------------------------
    function SetSaveMode() {
        
        try 
        {
            if ($("OrderStatus").value == "Authorized")
            {
                $("ActionSave").innerHTML = "Submit Order";
                msSaveMode = "submit";
            
            }
            else
            {
                $("ActionSave").innerHTML = "Save Changes";
                 msSaveMode = "save";
            
            }
        }
        catch(e){}
        
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
    // Initiate the Current Sizes user interface.
    //-------------------------------------------------------------------------------------
    this.ShowCurrentSizes = function() {
                
        ShowCurrentSizesUI(msEmployeeID, true);
    
    }
    
    //-------------------------------------------------------------------------------------
    // Show the Current Sizes user interface.
    //-------------------------------------------------------------------------------------
    function ShowCurrentSizesUI(sEmployeeID, bLightCloak) {
      
        //Popup object/dialog.
        var oPopup = (mbIE) ? $f("CurrentSizesPopup") : $f("CurrentSizesPopup").contentWindow;
            
        goCloak.Show("ContentBox", GetMaxZindex(), "ContentBox");
        
        if (bLightCloak) 
            goCloak.Lighter();
        else 
            goCloak.Darker();
        
        //Set the action to perform if user clicks "Run" in the popup.
        //oPopup.SetProperty("GoCallback", "window.parent.Report_Run();");  
        
        var oSrc = $("OrderSummaryBox");  
        
        //Calc the position of the popup.
        var iLeft = oSrc.parentNode.offsetLeft + 0;
        if (iLeft < 0) iLeft = 20;
        //var iTop = oSrc.parentNode.offsetTop + oSrc.parentNode.offsetHeight + 30;
        var iTop = 200;
        if (iTop < 0) iTop = 20;
        
        //if using a lighter cloak that means the link was clicked, so show the default title, not 
        //the Welcome to Golders title.
        var bUseDefaultTitle = (bLightCloak) ? true : false;

        //Position and display dialog.
        oPopup.ShowUI(iTop, iLeft, goCloak, sEmployeeID, this, bUseDefaultTitle);
      
    }

    //-------------------------------------------------------------------------------------
    // Display tracking information. 
    //-------------------------------------------------------------------------------------
    function ShowTrackingInfo() 
    {
        alert("Tracking information not available.");
    }

    //-------------------------------------------------------------------------------------
    // Validates data. 
    //-------------------------------------------------------------------------------------
    function ValidateChanges() 
    {
    
        //If no products have been selected, get outta here.
        if (msSaveMode == "submit" && moOrderItemsList.GetItemCount() == 0)
        {
            var sMsg = "No product items have been selected for this order. Submit cancelled.";
            SetStatusMsg("MainStatusMsg", sMsg, "", false, true, "red", 4000);
            return false;
        }
    
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
