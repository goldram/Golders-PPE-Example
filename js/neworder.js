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
    var moPurchasers = null;
    
    var mbEmployeesLoading = false;
    var mbOrderQtyLoading = false;
    
    var msCompanyID = null;
    var msCompanyName = null;
    
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
    // Resets/clears all status message objects when the user begins typing into an input 
    // field.
    //-------------------------------------------------------------------------------------
    function ClearStatusMsg() 
    {

        SetStatusMsg("StatusMsg", "");
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
	    moMainBox.style.display = "none";
    }

    //-------------------------------------------------------------------------------------
    // Retrieves all data required by the user interface.
    //-------------------------------------------------------------------------------------
    this.InitUI = function(sCompanyID, sCompanyName) {
    
        msCompanyID = sCompanyID;
        msCompanyName = sCompanyName;
        
        $field("Gender").value = "";
    
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
        
        //Add event handlers.
        if (mbEventHandlersAttached == false) 
        {
            AddEvt($field("Employee"), "change", SetChangeToEmployee);
            
            AddEvt($field("AuthorizedBy"), "change", SetChangeToAuthorizedBy);
            
            mbEventHandlersAttached = true;
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
	    oItemBox.className = "Row";
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
        oItem.setAttribute("Gender", oData.Gender);
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
    this.RefreshEmployees = function() {
    
        RetrieveEmployees();
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
	    sParms += "&CompanyID=" + encodeURI(msCompanyID);
	    sParms += "&IncludePurchasers=" + encodeURI(1);
    	
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
			    alert("Unable to retrieve employee list. \n\n\ Error details:" + sError);
			    moAjaxEmployees = null;
			    return;
			}
			
			var oXml = (mbIE) ? moAjaxEmployees.responseXML.childNodes[0] : moAjaxEmployees.responseXML.documentElement; 
			
			//Store the data in local object.    
			moEmployees = oXml.getElementsByTagName("Table");
			
			//Release memory for AJAX object.
			moAjaxEmployees = null;
			
			//Clear the Employee dropdown.
			var oDropdown = $("Employee");
			oDropdown.innerHTML = "";
        
            //Add blank option.
            AddSelectOption(document, oDropdown, " ", 0, 0);
			
            //Populate dropdown with Employees.
            for (var i=0; i < moEmployees.length; i++) 
            {
                var oRecord = moEmployees[i];
                
                var sUserType = $data("UserType", oRecord);
                
                if (sUserType == "general") 
                {
                    var sID = $data("EmployeeID", oRecord);
                    var sFirstName = $data("FirstName", oRecord);
                    var sLastName = $data("LastName", oRecord);
                    var sSite = $data("CompanySiteName", oRecord);
                    
                    var sName = sFirstName + " " + sLastName + "  (" + sSite + ")";
                    
                    AddSelectOption(document, oDropdown, sName, sID, i + 1);
                }
		    }
			
			//Clear the Purchasers dropdown.
			oDropdown = $("AuthorizedBy");
			oDropdown.innerHTML = "";
        
            //Add blank option.
            AddSelectOption(document, oDropdown, "", 0, 0);
			
            //Populate dropdown with Employees.
            for (var i=0; i < moEmployees.length; i++) 
            {
                var oRecord = moEmployees[i];
                
                var sUserType = $data("UserType", oRecord);
                
                if (sUserType == "purchaser") 
                {
                    var sID = $data("EmployeeID", oRecord);
                    var sFirstName = $data("FirstName", oRecord);
                    var sLastName = $data("LastName", oRecord);
                    var sSite = $data("CompanySiteName", oRecord);
                    
                    var sName = sFirstName + " " + sLastName + "  (" + sSite + ")";
                    
                    AddSelectOption(document, oDropdown, sName, sID, i + 1);
                }
		    }
            		
		    //SetStatusMsg(sResult, "main");
		    SetStatusMsg("StatusMsg", "Employee list refreshed.", "", false, true)
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
	    sParms += "&CompanyID=" + encodeURI(msCompanyID);
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
		            "DefaultQty"        : $data("DefaultQty", oRecord),
		            "Gender"            : $data("Gender", oRecord) 
		        }
		        
		   
		        PopulateQtyBoxItem(moOrderQtyBox, oData, "insert");
		    }
            
            //Adjust height of popup.
            moMainBox.style.height = moOrderQtyBox.offsetTop + (moOrderQty.length * 30) + "px"; 
                        
            //Adjust top position if it extends past the bottom of the page.       
            var iContentHeight = $("ContentBox").offsetTop + $("ContentBox").offsetHeight;
            while ((moMainBox.offsetTop + moMainBox.offsetHeight) > iContentHeight){
                moMainBox.style.top = (moMainBox.offsetTop - 100) + "px";
            }   
               	
		    SetStatusMsg("StatusMsg", "");
	    } 
    }

    //-------------------------------------------------------------------------------------
    // Called when a change to the Employee dropdown is made by the user.
    //-------------------------------------------------------------------------------------
    function SetChangeToEmployee(e) {

	    var evt = window.event || e;
	    var oSrc = evt.srcElement || e.target;
	    var sType = evt.type || e.type;
	    
	    var sEmployeeID = $fieldVal("Employee", moMainBox);
	    
	    var sGenderCode = "";
	    
	    //Get the gender of the selected employee.
	    for (var i=0; i<moEmployees.length; i++)
	    {
	        if ($data("EmployeeID", moEmployees[i]) === sEmployeeID) 
	        {
	            sGenderCode = $data("Gender", moEmployees[i]);
	            sEmail = $data("EmailAddr", moEmployees[i]);
	            break;
	        }
	    }
	    
	    //Save the employee's email address as an attribute on the dropdown so we don't have 
	    //to round it up later.
	    $field("Employee").setAttribute("EmployeeEmail", sEmail);
	    
	    //Display gender.
	    $field("Gender").value = (sGenderCode == "") ? "" : FormatGenderCode(sGenderCode);
    
        //***DAN COMMENTED-OUT*** Not sure we want this and needs more work if we do.
        //Set Qty to zero for the opposite gender, so those products will not be 
        //displayed in the Available Products list.
        //var sOppositeGender = (sGenderCode.toLowerCase() == "f") ? "M" : "F";
        //SetQtyToZero(sOppositeGender);
        
    }
    
    //-------------------------------------------------------------------------------------
    // Called when a change to the Authorized dropdown is made by the user.
    //-------------------------------------------------------------------------------------
    function SetChangeToAuthorizedBy(e) {

	    var evt = window.event || e;
	    var oSrc = evt.srcElement || e.target;
	    var sType = evt.type || e.type;
	    
	    var sAuthorizedByID = $fieldVal("AuthorizedBy", moMainBox);
	    
	    var sPaymentMethod = "";
	    
	    //Get the PaymentMethod of the selected employee/purchaser.
	    for (var i=0; i<moEmployees.length; i++)
	    {
	        if ($data("EmployeeID", moEmployees[i]) === sAuthorizedByID) 
	        {
	            sPaymentMethod = $data("PaymentMethod", moEmployees[i]);
	            try {
	                SetSelectText($field("OrderPayMethod"), sPaymentMethod);
	            }
	            catch(e) {}
	            break;
	        }
	    }
    
        //***DAN COMMENTED-OUT*** Not sure we want this and needs more work if we do.
        //Set Qty to zero for the opposite gender, so those products will not be 
        //displayed in the Available Products list.
        //var sOppositeGender = (sGenderCode.toLowerCase() == "f") ? "M" : "F";
        //SetQtyToZero(sOppositeGender);
        
    }
        
    //-------------------------------------------------------------------------------------
    // Sets Qty to zero for all gender-based product categories for the opposite gender 
    // since they will not be displayed in the product list for the selected employee.
    //-------------------------------------------------------------------------------------
    function SetQtyToZero(sGenderToFind) 
    {
        var oRows = moOrderQtyBox.childNodes;

        //Spin through Qty fields and set value to zero for the specified Gender Code. 
        for (var i=0; i<oRows.length; i++)
        {
            var oField = $field("OrderQty",oRows[i]); 
            
            var sGender = oField.getAttribute("Gender");
            
            if (sGender === sGenderToFind) oField.value = "0"; 
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
    // Shows dialog/popup for adding new employee or editing an existing employee from the
    // New Order UI. 
    //-------------------------------------------------------------------------------------
    this.ShowEmployeeUI = function(sEmployeeID, sEmployeeType) {
      
        //Popup object/dialog.
        var oPopup = (mbIE) ? $f("NewEmployeePopup") : $f("NewEmployeePopup").contentWindow;
        
        var oCloak = new Cloaker();
        
        var zIndex = parseInt(moMainBox.style.zIndex, 10) + 1;
                    
        oCloak.Show("ContentBox", zIndex, "ContentBox");
        
        //Set the action to perform if user clicks "Run" in the popup.
        //oPopup.SetProperty("GoCallback", "window.parent.Report_Run();");  
        
        var oSrc = $("HdrUserAction");  
        
        //Calc the position of the popup.
        var iLeft = oSrc.parentNode.offsetLeft + 50;
        if (iLeft < 0) iLeft = 20;
        var iTop = oSrc.parentNode.offsetTop + oSrc.parentNode.offsetHeight + 30;
        if (iTop < 0) iTop = 20;

        //Position and display dialog.
        oPopup.ShowUI(iTop, iLeft, oCloak, sEmployeeType, sEmployeeID, msCompanyID, msCompanyName, this);

    }
    
    //-------------------------------------------------------------------------------------
    // Show the main user interface.
    //-------------------------------------------------------------------------------------
    this.ShowUI = function(iTop, iLeft) {
        
        if (!iTop)  iTop  = 250;
        if (!iLeft) iLeft = 100;
                    
        //Throw a cloak over all elements on the page.
        moCloak.Show("ContentBox", GetMaxZindex(), "ContentBox");
        
        //SetFieldDefaults(sFirstName, sLastName, sZipCode);
        
        moMainBox.style.zIndex = parseInt(moCloak.GetZindex(), 10) + 1;
        
        //alert("Cloak zindex=" + moCloak.GetZindex() + ", moMainBox zIndex=" + moMainBox.style.zIndex);
        
        //moMainBox.style.left = iLeft + "px";
        //moMainBox.style.top  = iTop + "px";
        moMainBox.style.marginLeft = "auto";
        moMainBox.style.marginRight = "auto";
        moMainBox.style.top = iTop + "px";
        
        //Adjust top position if it extends past the bottom of the page.       
        var iContentHeight = $("ContentBox").offsetTop + $("ContentBox").offsetHeight;
        while ((moMainBox.offsetTop + moMainBox.offsetHeight) > iContentHeight){
            moMainBox.style.top = (moMainBox.offsetTop - 100) + "px";
        }   
        
        moMainBox.style.visibility = "visible";
        moMainBox.style.display = "inline";
        
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
            var sMsg = "There are no changes pending. Order authorization cancelled.";
            SetStatusMsg("StatusMsg", sMsg, "", false, true, "red");
            return;
        }
     
        var sMsg = "Authorizing order, please wait...";
        SetStatusMsg("StatusMsg", sMsg, "", false, false);
       
        mbSaving = true;
        
	    //Create XmlHttpRequest object.
	    moAjax = AjaxCreate("Order information");
	    if (!moAjax) return;
	    
	    var sEmailAddr = $field("Employee").getAttribute("EmployeeEmail");
          
	    //Build parms string.
        var sParms	= "";
	    sParms += "&Action="            + encodeURI("SaveAuthorizedOrder");
	    sParms += "&UserID="            + encodeURI($("UserID").value);
	    sParms += "&EmployeeID="        + encodeURI($("Employee").value);
    	sParms += "&EmployeeEmail="     + encodeURI(sEmailAddr);
	    sParms += "&CompanyID="         + encodeURI(msCompanyID);
	    sParms += "&PaymentMethod="     + encodeURI($("OrderPayMethod").value);
	    sParms += "&DeliverMethod="     + encodeURI($("DeliverTo").value);
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
        var bValid = true;
        
        var oField;
        var sMsg;
        
        //Employee. 
        oField = $("Employee");
        if (oField.value.length == 0 || oField.value == "0") {
            sMsg = "You must select an employee.";
            SetStatusMsg("StatusMsg", sMsg, "", true, true);
            return false;
        }
        
        //Delivery option. 
        oField = $("DeliverTo");
        if (oField.value.length == 0) {
            sMsg = "You must select a delivery option.";
            SetStatusMsg("StatusMsg", sMsg, "", true, true);
            return false;
        }
        
        //Authorized By/Purchaser. 
        oField = $("AuthorizedBy");
        if (oField.value.length == 0|| oField.value == "0") {
            sMsg = "You must select the Authorizer/Purchaser.";
            SetStatusMsg("StatusMsg", sMsg, "", true, true);
            return false;
        }
        
        //Payment method. 
        oField = $("OrderPayMethod");
        if (oField.value.length == 0) {
            sMsg = "You must select a payment method.";
            SetStatusMsg("StatusMsg", sMsg, "", true, true);
            return false;
        }
        
        return true;
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
