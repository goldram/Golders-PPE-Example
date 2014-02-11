//-------------------------------------------------------------------------------------
//
// Description:	Contains JavaScript specific to displaying and managing a list of order
// items for an order. 
//		  
//-------------------------------------------------------------------------------------

function OrderItemList() {

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
    
    var moMainBox = $("OrderItemsBox");
    var moOrderItemsDataBox = $("OrderItemsDataBox");
    
    var msOrderID = null;
    var moOrderSummary = null;
    var moOrderItems = null;
    var moProducts = null;
    
    var moActionBar = null;
    var moActionNewOrderItem = null;
    var moActionRefresh = null;
    var moActionSave = null;
    var moActionCancel = null;
    
    var mbAllowEdit = false;
    
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
    // Insert new item into Order Item list. 
    //-------------------------------------------------------------------------------------
    this.AddOrderItem = function(oData, bCustom) {
    
        //if no existing order items, clear the data box.
        if ($firstChild(moOrderItemsDataBox).id == "NoItemsMsg") moOrderItemsDataBox.innerHTML = "";
    
        //Add product to list/cart.
        PopulateOrderBoxItem(moOrderItemsDataBox, oData, "insert");
        
        if (bCustom != true) moOrderSummary.CheckQtyRequirements_public();
        
        moOrderSummary.SetSaveInit("on");
        
        AdjustDataBoxLayout(moMainBox, moOrderItemsDataBox, $("OrderItemsColHdr"));
        
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
        var sMsg = "Are you sure you want to cancel your changes? \n";
        if (!confirm(sMsg)) return;
        
        //Reset SAVE PENDING flag.
        SetSave("off");
        
        var sMsg = "Canceling changes and refreshing order items list, please wait...";
        SetStatusMsg("StatusMsg", sMsg, "", false, false);
        
        //Set success message to be displayed.
        mbCancellingChanges = true;  
        
        //Initiate refresh.
        RetrieveOrderItems();
        
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
    // Deletes/removes an Order Item. Only order items that have not been saved to the 
    // database can be deleted.
    //-------------------------------------------------------------------------------------
    function DeleteOrderItem(e) {

	    var evt = window.event || e;
	    var oSrc = evt.srcElement || e.target;
	    var sType = evt.type || e.type;
    	
	    var oDataRow = oSrc.parentNode;
	    var sStatus = oDataRow.getAttribute("UpdateStatus").toLowerCase();
    	
	    //Make sure the user really wants to delete it.
        var sMsg = 'Remove item from this order?  \n\n';
        if (!confirm(sMsg)) {
            //sMsg = "Delete action cancelled";
            //SetStatusMsg("StatusMsg",sMsg, "", false, true, "blue");
            return;
        }
    	
	    //Hide the row/item and set the status.
	    if (sStatus == "insert") {
            moOrderItemsDataBox.removeChild(oDataRow);
        }
        else {
            oDataRow.setAttribute("UpdateStatus", "delete");
            oDataRow.style.display = "none";
        }
	    
	    SetSave();
    	
	    //Set SAVE PENDING flag and visual queues.
	    moOrderSummary.SetSaveInit("on");
        
        //Display appropriate message if no orders remaining.    
        if (moOrderItemsDataBox.childNodes.length == 0) {
            moOrderItemsDataBox.innerHTML = '<p id="NoItemsMsg">There are no items selected for this order.</p>';
        }
    	
	    //Set the "update status" attribute in the XML.
	    //var i = oSrc.getAttribute("XmlIndex");
	    //var oExamDates = dbExamDates.DataNodeList();
	    //oExamDates.item(i).setAttribute($attr("UpdateStatus"), "delete");
        
        //Flag Quantity Requirement values that are under or over what's currently selected.
        moOrderSummary.CheckQtyRequirements_public();
        
    }    
        
    //-------------------------------------------------------------------------------------
    // Returns object containing field value and whether it has been updated or not.
    //-------------------------------------------------------------------------------------
    this.DisableActionBar = function() {
    
        moActionBar.style.visibility = "hidden";
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
    // Returns changes to Order Item/Product values in pipe-delimited string.
    //-------------------------------------------------------------------------------------
    this.GetItemCount = function() {

        try 
        {
            return moOrderItemsDataBox.getElementsByTagName("DIV").length;
        }
        catch(e)
        {
            return 0;
        }
    }
        
    //-------------------------------------------------------------------------------------
    // Public access to method to return changes to Order Item/Product values in a 
    // pipe-delimited string.
    //-------------------------------------------------------------------------------------
    this.GetModifiedValuesInit = function() {
    
        return GetModifiedValues();

    }
    
    //-------------------------------------------------------------------------------------
    // Returns changes to Order Item/Product values in pipe-delimited string.
    //-------------------------------------------------------------------------------------
    function GetModifiedValues() {

        var sVals = "";
        
        var bInvalidValuesFound = false;
            
        var oData = moOrderItemsDataBox.childNodes;

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
            
            var sOrderID     = oRow.getAttribute("OrderID");
            var sOrderItemID = oRow.getAttribute("OrderItemID");
            var sProductID   = oRow.getAttribute("ProductID");
            
            var sProductCategoryID  = oRow.getAttribute("ProductCategoryID");
            var sProductGroupID     = oRow.getAttribute("ProductGroupID");
            
            var oProductType = (!$field("ItemType",oRow)) ? null : GetFieldValue(oRow,"ItemType",  true);
            var oProductName = (!$field("ItemDesc",oRow)) ? null : GetFieldValue(oRow,"ItemDesc",  true);
            
            var oItemStatus = (!$field("ItemStatus",oRow)) ? null : GetFieldValue(oRow,"ItemStatus",  true);
            
            var oQty   = (!$field("ItemQty",oRow))   ? null : GetFieldValue(oRow,"ItemQty",  true);
            var oColor = (!$field("ItemColor",oRow)) ? null : GetFieldValue(oRow,"ItemColor",true);
            var oSize  = (!$field("ItemSize",oRow))  ? null : GetFieldValue(oRow,"ItemSize", true);
            
            var oDeliverMethod  = (!$field("ItemDeliverMethod",oRow))  ? null : GetFieldValue(oRow,"ItemDeliverMethod",  true);
            var oTrackingNumber = (!$field("ItemTrackingNumber",oRow)) ? null : GetFieldValue(oRow,"TrackingNumber",  true);
            
            var oComments = (!$field("ItemComments",oRow))  ? null : GetFieldValue(oRow,"ItemComments",  true);

            var oShipDate     = (!$field("ItemShipDate",oRow))    ? null : GetFieldValue(oRow,"ItemShipDate",    true);
            var oDeliverDate  = (!$field("ItemDeliverDate",oRow)) ? null : GetFieldValue(oRow,"ItemDeliverDate", true);
            var oHoldDate     = (!$field("ItemHoldDate",oRow))    ? null : GetFieldValue(oRow,"ItemHoldDate",    true);
            var oCancelDate   = (!$field("ItemCancelDate",oRow))  ? null : GetFieldValue(oRow,"ItemCancelDate",  true);
           
            if (sStatus == "delete") 
            {
                sVals += "UpdateStatus=" + sStatus + "|";
                sVals += "OrderID=" + sOrderID + "|";
                sVals += "OrderItemID=" + sOrderItemID + "|";
                        
                sVals += "|"; //Double-up pipe character for record delimiter.
            }
            else
            if (sStatus == "update" || sStatus == "insert") 
            {
                //Set the type of database update that will be done.
                sVals += "UpdateStatus=" + sStatus      + "|";
                
                //Add the key fields to the string.
                sVals += "OrderID="      + sOrderID     + "|";
                sVals += "OrderItemID="  + sOrderItemID + "|";
                sVals += "ProductID="    + sProductID   + "|";
                sVals += "ProductCategoryID=" + sProductCategoryID + "|";
                
                //Custom order item?
                if (sProductID == "99999") 
                {
                    if (oProductType.Updated || sStatus == "insert") sVals += "CustomProductCategory=" + oProductType.Value + "|";
                    if (oProductName.Updated || sStatus == "insert") sVals += "CustomProductName=" + oProductName.Value + "|";
                }
                
                //Item Status field.
                if (oItemStatus.Updated || sStatus == "insert") sVals += "ItemStatus=" + oItemStatus.Value + "|";
                
                if (oQty   && (oQty.Updated || sStatus == "insert"))    sVals += "Qty=" + oQty.Value + "|";
                if (oColor && (oColor.Updated || sStatus == "insert"))  sVals += "Color=" + oColor.Value + "|";
                if (oSize  && (oSize.Updated || sStatus == "insert"))   sVals += "Size=" + oSize.Value + "|";
                
                if (oDeliverMethod && oDeliverMethod.Updated) sVals += "DeliverMethod=" + oDeliverMethod.Value + "|";
                if (oTrackingNumber && oTrackingNumber.Updated) sVals += "TrackingNumber=" + oTrackingNumber.Value + "|";
                
                if (oComments && oComments.Updated) sVals += "Comments=" + oComments.Value + "|";
                
                //Check each date to see if it was updated.
                if (oShipDate && oShipDate.Updated) sVals += "ShipDate=" + oShipDate.Value + "|";
                if (oDeliverDate && oDeliverDate.Updated) sVals += "DeliverDate=" + oDeliverDate.Value + "|";
                if (oHoldDate && oHoldDate.Updated) sVals += "HoldDate=" + oHoldDate.Value + "|";
                if (oCancelDate && oCancelDate.Updated) sVals += "CancelDate=" + oCancelDate.Value + "|";
                 
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
    this.Init = function(sOrderID, oOrderSummary) {
    
        msOrderID = sOrderID;
        
        moOrderSummary = oOrderSummary;
    
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
                case "ActionNewItem":
                    moActionNewOrder = oItems[i];
                    break;
            }
        }
        
        //The action for saving data is accessed via the Order Summary object.
        moActionSave = moOrderSummary.GetSaveAction();
        
        //Set up scolling for data box column header.
        AddEvt($("OrderListViewPort"), "scroll", ScrollFixedColHdr);	
        
        RetrieveOrderItems(); 
    }     
    
    //-------------------------------------------------------------------------------------
    // Returns status of SAVE PENDING flag.
    //-------------------------------------------------------------------------------------
    this.IsSavePending = function() {
    
        return mbSavePending;
    
    }
    
    //-------------------------------------------------------------------------------------
    // Inserts a new data item into the Order Items data box.
    //-------------------------------------------------------------------------------------
    function PopulateOrderBoxItem(oBox, oData, sUpdateStatus) {
    
        //Adjustment for field padding and/or border width.
        var iAdjust = 2;
        var iCalAdjust = 23;
        
        var bAllowEdit = ($("UserType").value == "admin") ? true : false;
        
        var bCustomItem = (oData.ProductID == "99999") ? true : false;
        
        //Insert container for all columns/fields.
	    var oItemBox = document.createElement("DIV");
	    oItemBox.id = "DataItemBox";
	    oItemBox.className = "Row";  
	    oItemBox.style.marginTop = "0px";
	    oItemBox.style.marginBottom = "0px";
        oItemBox.setAttribute("UpdateStatus", sUpdateStatus);
        oItemBox.setAttribute("OrderID", msOrderID);
        oItemBox.setAttribute("OrderItemID", oData.OrderItemID);
        oItemBox.setAttribute("ProductID", oData.ProductID);
        oItemBox.setAttribute("ProductCategoryID", oData.ProductCategoryID);
        oItemBox.setAttribute("ProductGroupID", oData.ProductGroupID);
	    oBox.appendChild(oItemBox);
	    
	    if (bAllowEdit || sUpdateStatus == "insert")
	    {
            //Insert delete image.
	        var oItem = document.createElement("IMG");
	        //oItem.type = "text";	
	        oItem.id = "ItemDelete";
	        oItem.title = "Remove Item from Order";
            //oItem.className = "FieldVal ReadOnly";
            //oItem.className = "FieldValReadOnly";
            //oItem.readOnly = true; //do not allow editting
            //oItem.tabIndex = -1; //prevent tab stop
	        //oItem.maxLength = "3";
            //oItem.style.left  = $("OrderEditHdr").offsetLeft + "px";
	        oItem.src = "img/delete.png";
            //oItem.setAttribute("LastVal", oData.OrderNumber);
            oItem.setAttribute("OrderItemID", oData.OrderItemID);
            AddEvt(oItem, "click", DeleteOrderItem);
	        oItemBox.appendChild(oItem);
  	    }
 	    else 
 	    {  
            //Insert edit image.
            var oItem = document.createElement("IMG");
	        //oItem.type = "text";	
	        oItem.id = "OrderItemEdit";
	        oItem.title = ""; //"Edit/View Details";
            //oItem.className = "FieldVal ReadOnly";
            //oItem.className = "FieldValReadOnly";
            //oItem.readOnly = true; //do not allow editting
            //oItem.tabIndex = -1; //prevent tab stop
	        //oItem.maxLength = "3";
            //oItem.style.left  = $("OrderEditHdr").offsetLeft + "px";
	        oItem.src = "img/noedit.png"; //"img/edit.png";
            //oItem.setAttribute("LastVal", oData.OrderNumber);
            oItem.setAttribute("OrderID", oData.OrderID);
            oItem.setAttribute("OrderItemID", oData.OrderItemID);
            //AddEvt(oItem, "click", EditOrderItem);
	        oItemBox.appendChild(oItem);
	   }   
            
        //Insert input field for Item Type.
	    var oItem = document.createElement("INPUT");
	    oItem.type = "text";	
	    oItem.id = "ItemType";
        //oItem.className = "FieldVal ReadOnly";
        oItem.className = (bAllowEdit && bCustomItem) ? "FieldVal" : "FieldValReadOnly";
        oItem.style.borderWidth = "1px 0px 1px 1px";
        if (bAllowEdit && bCustomItem) oItem.style.backgroundColor = "white";
        oItem.style.fontSize = "8pt";
        oItem.style.paddingBottom = "4px";
        oItem.readOnly = (bAllowEdit && bCustomItem) ? false : true; 
        oItem.tabIndex = (bAllowEdit && bCustomItem) ? "" : -1; //-1 to prevent tab stop
	    if (bAllowEdit && bCustomItem) oItem.maxLength = "100";
        oItem.style.left  = "20px"; //$("ItemTypeHdr").offsetLeft + "px";
        var iTweak = (bAllowEdit && bCustomItem) ? 6 : 2;
        oItem.style.width = $("ItemTypeHdr").offsetWidth - iTweak + "px";
	    var sType = oData.ProductCategory;
	    oItem.value = sType;
	    oItem.title = sType;
        oItem.setAttribute("LastVal", sType);
        oItem.setAttribute("OrderItemID", oData.OrderItemID);
        if (bAllowEdit && bCustomItem) AddEvt(oItem, "keydown", SetSave);
	    oItemBox.appendChild(oItem);
	    	    
        //Insert input field for Item Description.
	    var oItem = document.createElement("INPUT");
	    oItem.type = "text";	
	    oItem.id = "ItemDesc";
        oItem.className = (bAllowEdit && bCustomItem) ? "FieldVal" : "FieldValReadOnly";
        oItem.style.borderWidth = "1px 0px 1px 1px";
        if (bAllowEdit && bCustomItem) oItem.style.backgroundColor = "white";
        oItem.style.fontSize = "8pt";
        oItem.style.paddingBottom = "4px";
        oItem.readOnly = (bAllowEdit && bCustomItem) ? false : true; 
        oItem.tabIndex = (bAllowEdit && bCustomItem) ? "" : -1; //-1 to prevent tab stop
	    if (bAllowEdit && bCustomItem) oItem.maxLength = "100";
        oItem.style.left  = "20px"; //$("ItemTypeHdr").offsetLeft + "px";
        var iTweak = (bAllowEdit && bCustomItem) ? 6 : 2;
        oItem.style.width = $("ItemDescHdr").offsetWidth - iTweak + "px";
        oItem.style.left  = oItemBox.lastChild.offsetLeft + oItemBox.lastChild.offsetWidth - iAdjust + "px";
	    var sDesc = oData.ProductDesc
	    oItem.value = sDesc;
 	    oItem.title = sDesc;
        oItem.setAttribute("LastVal", sDesc);
        oItem.setAttribute("OrderItemID", oData.OrderItemID);
        if (bAllowEdit && bCustomItem) AddEvt(oItem, "keydown", SetSave);
	    oItemBox.appendChild(oItem);
            
        //Insert input field for Item Qty.
	    var oItem = document.createElement("INPUT");
	    oItem.type = "text";	
	    oItem.id = "ItemQty";
        oItem.className = (bAllowEdit) ? "FieldVal Center" : "FieldValReadOnly Center";
        oItem.style.borderWidth = "1px 0px 1px 1px";
        oItem.style.fontSize = "8pt";
        oItem.style.paddingBottom = "4px";
        if (bAllowEdit) oItem.style.backgroundColor = "white";
        if (!bAllowEdit) oItem.readOnly = true; 
        if (!bAllowEdit) oItem.tabIndex = -1; //prevent tab stop?
	    oItem.maxLength = "4";
        oItem.style.width = $("ItemQtyHdr").offsetWidth - 4 + "px";	
        oItem.style.left  = oItemBox.lastChild.offsetLeft + oItemBox.lastChild.offsetWidth - iAdjust + "px";
	    oItem.value = oData.Qty;
        oItem.setAttribute("LastVal", oData.Qty);
        oItem.setAttribute("ProductCategoryID", oData.ProductCategoryID);
        oItem.setAttribute("ProductGroupID", oData.ProductGroupID);
        AddEvt(oItem, "keydown", SetSave);
        AddEvt(oItem, "blur", moOrderSummary.CheckQtyRequirements_public);
	    oItemBox.appendChild(oItem);
            
        //Insert input field for Item Size.
	    var oItem = document.createElement("INPUT");
	    oItem.type = "text";	
	    oItem.id = "ItemSize";
        oItem.className = (bAllowEdit) ? "FieldVal Center" : "FieldValReadOnly Center";
        oItem.style.borderWidth = "1px 0px 1px 1px";
        oItem.style.fontSize = "8pt";
        oItem.style.paddingBottom = "4px";
        if (bAllowEdit) oItem.style.backgroundColor = "white";
        if (!bAllowEdit) oItem.readOnly = true; 
        if (!bAllowEdit) oItem.tabIndex = -1; //prevent tab stop?
	    oItem.maxLength = "20";
        oItem.style.width = $("ItemSizeHdr").offsetWidth - 4 + "px";	
        oItem.style.left  = oItemBox.lastChild.offsetLeft + oItemBox.lastChild.offsetWidth - iAdjust + "px";
	    oItem.value = oData.Size;
        oItem.setAttribute("LastVal", oData.Size);
        oItem.setAttribute("OrderItemID", oData.OrderItemID);
        AddEvt(oItem, "keydown", SetSave);
	    oItemBox.appendChild(oItem);
            
        //Insert input field for Item Color.
	    var oItem = document.createElement("INPUT");
	    oItem.type = "text";	
	    oItem.id = "ItemColor";
        oItem.className = (bAllowEdit) ? "FieldVal Center" : "FieldValReadOnly Center";
        oItem.style.borderWidth = "1px 0px 1px 1px";
        oItem.style.fontSize = "8pt";
        oItem.style.paddingBottom = "4px";
        if (bAllowEdit) oItem.style.backgroundColor = "white";
        if (!bAllowEdit) oItem.readOnly = true; 
        if (!bAllowEdit) oItem.tabIndex = -1; //prevent tab stop?
	    oItem.maxLength = "20";
        oItem.style.width = $("ItemColorHdr").offsetWidth - 4 + "px";	
        oItem.style.left  = oItemBox.lastChild.offsetLeft + oItemBox.lastChild.offsetWidth - iAdjust + "px";
	    oItem.value = oData.Color;
        oItem.setAttribute("LastVal", oData.Color);
        oItem.setAttribute("OrderItemID", oData.OrderItemID);
        AddEvt(oItem, "keydown", SetSave);
	    oItemBox.appendChild(oItem);
            
        //Insert input field for Status.
	    var oItem = document.createElement("INPUT");
	    oItem.type = "text";	
	    oItem.id = "ItemStatus";
        oItem.className = (bAllowEdit) ? "FieldVal Center" : "FieldValReadOnly Center";
        oItem.style.borderWidth = "1px 0px 1px 1px";
        oItem.style.paddingBottom = "4px";
        oItem.style.fontSize = "8pt";
        if (bAllowEdit) oItem.style.backgroundColor = "white";
        if (!bAllowEdit) oItem.readOnly = true; 
        if (!bAllowEdit) oItem.tabIndex = -1; //prevent tab stop?
	    oItem.maxLength = "30";
        oItem.style.width = $("ItemStatusHdr").offsetWidth - 4 + "px";	
        oItem.style.left  = oItemBox.lastChild.offsetLeft + oItemBox.lastChild.offsetWidth - iAdjust + "px";
	    oItem.value = oData.ItemStatus;
        oItem.setAttribute("LastVal", oData.ItemStatus);
        oItem.setAttribute("OrderItemID", oData.OrderItemID);
        AddEvt(oItem, "keydown", SetSave);
	    oItemBox.appendChild(oItem);
        
        //All date columns.
        oItem = PopulateOrderBoxItemDate(oItemBox, "ItemDeliverDate", oData, "DeliverDate", "existing", bAllowEdit);
            
        //Deliver Method.
	    var oItem = document.createElement("INPUT");
	    oItem.type = "text";	
	    oItem.id = "ItemDeliverMethod";
        oItem.className = (bAllowEdit) ? "FieldVal" : "FieldValReadOnly";
        oItem.style.borderWidth = "1px 0px 1px 1px";
        oItem.style.fontSize = "8pt";
        oItem.style.paddingBottom = "4px";
        if (bAllowEdit) oItem.style.backgroundColor = "white";
        if (!bAllowEdit) oItem.readOnly = true; 
        if (!bAllowEdit) oItem.tabIndex = -1; //prevent tab stop?
	    oItem.maxLength = "20";
        oItem.style.width = $("ItemDeliverMethodHdr").offsetWidth - 4 + "px";	
        oItem.style.left  = oItemBox.lastChild.offsetLeft + oItemBox.lastChild.offsetWidth - iAdjust + "px";
	    oItem.value = IsNull(oData.DeliverMethod, "");
        oItem.setAttribute("LastVal", IsNull(oData.DeliverMethod, ""));
        oItem.setAttribute("OrderItemID", oData.OrderItemID);
        AddEvt(oItem, "keydown", SetSave);
	    oItemBox.appendChild(oItem);
            
        //Comments.
	    var oItem = document.createElement("INPUT");
	    oItem.type = "text";	
	    oItem.id = "ItemComments";
        oItem.className = (bAllowEdit) ? "FieldVal" : "FieldValReadOnly";
        oItem.style.borderWidth = "1px 0px 1px 1px";
        oItem.style.fontSize = "8pt";
        oItem.style.paddingBottom = "4px";
        if (bAllowEdit) oItem.style.backgroundColor = "white";
        if (!bAllowEdit) oItem.readOnly = true; 
        if (!bAllowEdit) oItem.tabIndex = -1; //prevent tab stop?
	    oItem.maxLength = "255";
        oItem.style.width = $("ItemCommentsHdr").offsetWidth - 4 + "px";	
        oItem.style.left  = oItemBox.lastChild.offsetLeft + oItemBox.lastChild.offsetWidth - iAdjust + "px";
	    oItem.value = IsNull(oData.Comments, "");
        oItem.setAttribute("LastVal", IsNull(oData.Comments, ""));
        oItem.setAttribute("OrderItemID", oData.OrderItemID);
        AddEvt(oItem, "keydown", SetSave);
	    oItemBox.appendChild(oItem);
        
        return;
        
    }    
    
    //-------------------------------------------------------------------------------------
    // Inserts a new Date-specific data item into the Orders box.
    //-------------------------------------------------------------------------------------
    function PopulateOrderBoxItemDate(oItemBox, sBoxField, oData, sDataField, sUpdateStatus, bAllowEdit) 
    {

        //example: PopulateOrderBoxItemDate(oItemBox, "AuthDate", oData, "AuthorizedDate", "existing")
    
        //Adjustment for field padding and/or border width.
        var iAdjust = 2;
        var iWidthAdjust = 4;
        var iCalAdjust = 23;
        
	    //Authorized Date.
	    var oItem = document.createElement("INPUT");
	    oItem.type = "text";	
	    oItem.id = sBoxField;
	    //if (sUpdateStatus == "insert") {
	    if (bAllowEdit) {
	        oItem.className = "FieldVal";
            oItem.style.backgroundColor = "white";
            AddEvt(oItem, "keydown", SetSave);
            //AddEvt(oItem, "blur",    SetChangeToStartDate);
	    }
	    else {
	        oItem.readOnly = true;
	        oItem.className = "FieldValReadOnly Center";
            oItem.tabIndex = -1; //prevent tab stop
        }
       
        oItem.style.borderWidth = "1px 0px 1px 1px";
        
        var sDateVal = eval("oData." + sDataField);
        var sDateDetailVal = eval("oData." + sDataField + "Detail");
        
	    oItem.value = sDateVal;
	    oItem.title = sDateDetailVal;
        oItem.setAttribute("LastVal", sDateVal);
        oItem.style.width = $(sBoxField + "Hdr").offsetWidth - iWidthAdjust + "px";	
        oItem.style.left  = oItemBox.lastChild.offsetLeft + oItemBox.lastChild.offsetWidth - iAdjust + "px";
	    oItemBox.appendChild(oItem);
	            
    }

    //-------------------------------------------------------------------------------------
    // Populates dropdown with Order Status values retrieved from the database and sets the 
    // initial value.
    //-------------------------------------------------------------------------------------
    function PopulateOrderStatusDropdown(oDropdown, sStatusID) {
    	    
        //Get reference to XMLDOMNodeList.
        //var oResults = dbExamTypes.DataNodeList();

        //Populate dropdown.
        AddSelectOption(document, oDropdown, " ", 0, 0);
        AddSelectOption(document, oDropdown, "Authorized", "Authorized", 1);
        //AddSelectOption(document, oDropdown, "Submitted",  "Submitted", 2);
        //AddSelectOption(document, oDropdown, "Processing", "Processing", 3);
        //AddSelectOption(document, oDropdown, "Shipped",    "Shipped", 4);
        //AddSelectOption(document, oDropdown, "Delivered",  "Delivered", 5);
        //AddSelectOption(document, oDropdown, "Closed",     "Closed", 6);
        AddSelectOption(document, oDropdown, "Hold",       "Hold", 7);
        AddSelectOption(document, oDropdown, "Cancelled",  "Cancelled", 8);
        
//        if (oResults.length > 0) {
//        
//            var aID   = $attr("ExamTypeID");
//            var aName = $attr("ExamType");
//            
//            AddSelectOption(document, oDropdown, " ", 0, 0);
//            for (var i = 0; i < oResults.length; i++) {
//                var sID = oResults.item(i).getAttribute(aID);
//                var sName = oResults.item(i).getAttribute(aName);
//                AddSelectOption(document, oDropdown, sName, sID, i + 1);
//            }
//        }
        
        if (sStatusID != null) SetSelectValue(oDropdown, sStatusID);

    }            

    //-------------------------------------------------------------------------------------
    // Populates dropdown with Order Status values retrieved from the database and sets the 
    // initial value.
    //-------------------------------------------------------------------------------------
    function PopulateOrderItemStatusDropdown(oDropdown, sStatusID) {
    	    
        //Get reference to XMLDOMNodeList.
        //var oResults = dbExamTypes.DataNodeList();

        //Populate dropdown.
        //AddSelectOption(document, oDropdown, " ", 0, 0);
        AddSelectOption(document, oDropdown, "PENDING", "PENDING", 0);
        //AddSelectOption(document, oDropdown, "Submitted",  "Submitted", 2);
        //AddSelectOption(document, oDropdown, "Processing", "Processing", 3);
        //AddSelectOption(document, oDropdown, "Shipped",    "Shipped", 4);
        //AddSelectOption(document, oDropdown, "Delivered",  "Delivered", 5);
        //AddSelectOption(document, oDropdown, "Closed",     "Closed", 6);
        //AddSelectOption(document, oDropdown, "Hold",       "Hold", 7);
        //AddSelectOption(document, oDropdown, "Cancelled",  "Cancelled", 8);
        
//        if (oResults.length > 0) {
//        
//            var aID   = $attr("ExamTypeID");
//            var aName = $attr("ExamType");
//            
//            AddSelectOption(document, oDropdown, " ", 0, 0);
//            for (var i = 0; i < oResults.length; i++) {
//                var sID = oResults.item(i).getAttribute(aID);
//                var sName = oResults.item(i).getAttribute(aName);
//                AddSelectOption(document, oDropdown, sName, sID, i + 1);
//            }
//        }
        
        if (sStatusID != null) SetSelectValue(oDropdown, sStatusID);

    }   
           
    //-------------------------------------------------------------------------------------
    // External access to method for refreshing the data. 
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
            
        var sMsg = "Refreshing order items, please wait...";
        SetStatusMsg("StatusMsg", sMsg, "", false, false);
        
        //Initiate refresh.
        RetrieveOrderItems();
        
    }    
    
    //-------------------------------------------------------------------------------------
    // Submits AJAX request to retrieve order items.
    //-------------------------------------------------------------------------------------
    function RetrieveOrderItems() {

	    //Display status message.   
	    //ClearStatusMsg("main"); 
	    SetStatusMsg("StatusMsg", "Retrieving order items...", "", false);
 	    
	    //Create XmlHttpRequest object.
	    moAjax = AjaxCreate("Order Item List");
	    if (!moAjax) return;
            
	    //Build parms string.
        var sParms	= "";
	    sParms += "&Action=" + encodeURI("GetOrderItems");
	    sParms += "&OrderID=" + encodeURI(msOrderID);
    	
	    //Initiate call to database.
	    var bSuccess = AjaxSend(moAjax, sParms, RetrieveOrderItemsCallback);
    	
	    //If not initiated, clear all status messages. 
	    if (!bSuccess) ClearStatusMsg();

    }

    //-------------------------------------------------------------------------------------
    // Callback for RetrieveOrderItems method. 
    //-------------------------------------------------------------------------------------
    function RetrieveOrderItemsCallback() 
    {  
	    var bKeepTrying = ((moAjax.readyState == 4) && (moAjax.status == 200)) ? false : true;
	    
	    if (bKeepTrying) return; 
    
		var sResult = moAjax.responseText;
		
		var sError = AjaxError(sResult);
		if (sError.length > 0)  
		{
		    alert("Unable to retrieve order items for this order. \n\n\ Error details:" + sError);
		    mbCancellingChanges = false;
		    moAjax = null;
		    return;
		}
		
		var oXml = (mbIE) ? moAjax.responseXML.childNodes[0] : moAjax.responseXML.documentElement; 
		
		//If no items exist for this order, get outta here.
		if (!oXml || oXml.getElementsByTagName("Table").length == 0) 
		{
		    //Clear the data box contents.
		    moOrderItemsDataBox.innerHTML = "";
		    
            moOrderItemsDataBox.innerHTML = '<p id="NoItemsMsg">There are no products selected for this order.</p>';
            var sMsg = "No items have been selected for this order.";
            SetStatusMsg("StatusMsg", sMsg, "", false, true);
		    moAjax = null;
		    return;
		}
		    
		moOrderItems = oXml.getElementsByTagName("Table");
		
		//Release memory for AJAX object.
		moAjax = null;
		
		//Clear the data box contents.
		moOrderItemsDataBox.innerHTML = "";
		
		//Make sure the container has layout when tring to fill it with data or we'll get an error.
		var bResetDisplay = false;
		if (moMainBox.style.display == "none") {
		    moMainBox.style.display = "block";
		    //moMainBox.style.visibility = "hidden";
		    bResetDisplay = true;
		}
		       
		
        //Display data.
        for (var i=0; i < moOrderItems.length; i++) 
        {
            var oRecord = moOrderItems[i];
            
            var oShipDateParts      = ParseOrderDate($data("ShipDate",      oRecord));
            var oDeliverDateParts   = ParseOrderDate($data("DeliverDate",   oRecord));
            var oHoldDateParts      = ParseOrderDate($data("HoldDate",      oRecord));
            var oCancelDateParts    = ParseOrderDate($data("CancelDate",    oRecord));
           
            var oData = {
	            "OrderItemID"       : $data("OrderItemID",          oRecord), 
	            "OrderID"           : $data("OrderID",              oRecord), 
	            "ProductID"         : $data("ProductID",            oRecord), 
	            "Brand"             : $data("Brand",                oRecord), 
	            "ProductName"       : $data("ProductName",          oRecord), 
	            "ProductDesc"       : $data("ProductDesc",          oRecord), 
	            "ProductCategoryID" : $data("ProductCategoryID",    oRecord), 
	            "ProductCategory"   : $data("ProductCategory",      oRecord), 
	            "ProductGroupID"    : $data("ProductGroupID",       oRecord), 
	            "ProductGroup"      : $data("ProductGroup",         oRecord), 
	            "ItemStatus"        : $data("ItemStatus",           oRecord), 
	            "Qty"               : $data("Qty",                  oRecord), 
	            "Color"             : $data("Color",                oRecord), 
	            "Size"              : $data("Size",                 oRecord), 
	            "DeliverMethod"     : $data("DeliverMethod",        oRecord),  
	            "TrackingNumber"    : $data("TrackingNumber",       oRecord), 
	            "Comments"          : $data("Comments",             oRecord), 
	            "ShipDate"          : oShipDateParts.Date,
	            "ShipDateDetail"    : oShipDateParts.DateTime,
	            "DeliverDate"       : oDeliverDateParts.Date,
	            "DeliverDateDetail" : oDeliverDateParts.DateTime,
	            "HoldDate"          : oHoldDateParts.Date, 
	            "HoldDateDetail"    : oHoldDateParts.DateTime, 
	            "CancelDate"        : oCancelDateParts.Date, 
	            "CancelDateDetail"  : oCancelDateParts.DateTime 
	        }
	        
	        PopulateOrderBoxItem(moOrderItemsDataBox, oData, "existing");
	    }
        
        //Adjust layout of the data box and its container.
        AdjustDataBoxLayout(moMainBox, moOrderItemsDataBox, $("OrderItemsColHdr"));
	    
		//Make sure the container has layout when tring to fill it with data or we'll get an error.
		if (bResetDisplay) {
		    moMainBox.style.display = "none";
		    //moMainBox.style.visibility = "";
		}
        
        //Display success message.
        var sMsg = (mbCancellingChanges) ? "Changes cancelled. Order items refreshed." : "Order items retrieved successfully.";
        SetStatusMsg("StatusMsg", sMsg, "", false, true);
        
        mbCancellingChanges = false;
     
        SetSave("off");
        
        try {
            moOrderSummary.CheckQtyRequirements_public();
        }
        catch(e) {}
    }

    //-------------------------------------------------------------------------------------
    // Saves changes to the database.
    //-------------------------------------------------------------------------------------
    this.SaveChanges = function() {
    
    alert("not functional");
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
                oItems[i].style.fontWeight = "bold";
                break;
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
    // Returns status of SAVE PENDING flag.
    //-------------------------------------------------------------------------------------
    this.SetSaveOff = function() {
    
        SetSave("off");
    
    }    
    
    //-------------------------------------------------------------------------------------
    // Externally accessed method to allow Summary object to set the status message
    // during a SAVE action. 
    //-------------------------------------------------------------------------------------
    this.SetSaveStatusMsg = function(sMsgID, sMsg, sDetails, bError, bTimeout, sColor, iTimeoutLength) 
    {
        
    
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
    // Display a message while the Products Available popup is loaded and populated with
    // data.
    //-------------------------------------------------------------------------------------
    this.SetStatusMsgForProductsLoading = function(bDone) {

        if (!bDone)
        {
	        SetStatusMsg("StatusMsg", "Loading products available, please wait...", "", false, false);
	    }
	    else if (bDone)
        {
	        SetStatusMsg("StatusMsg", "Products loaded successfully.", "", false, true);
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
        //NewWindow.location = url;
    
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
