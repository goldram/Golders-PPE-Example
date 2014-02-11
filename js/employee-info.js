//-------------------------------------------------------------------------------------
//
// Description:	Contains JavaScript specific to managing a user (i.e. employee, admin, etc.).
//		  
//-------------------------------------------------------------------------------------
    
 var mbIE = (!window.addEventListener || navigator.appName.indexOf("Internet Explorer") >= 0) ? true : false;

if (mbIE) {
    window.attachEvent("onload", InitUI);
    //window.attachEvent("onresize", ResetLayout);
} 
else {
    window.addEventListener("load", InitUI, false);
    //window.addEventListener("resize", ResetLayout, false);
}
try 
{
    var moThisDialog = parent.document.getElementById("EmployeePopup");
}
catch(e) {}
    

//function EmployeeInfo() {

    var mbDataLoaded = false;
    var mbSavePending = false;
    var mbSaving = false;
    var mbSaveAndClear = false;
    var mbSettingFieldValues = false;
    var mbCancellingChanges = false;
    
    var mbEventHandlersAttached = false; //Ensures event handlers are not attached multiple times.
    
    var mbUseProxy = false;
    var msXHRResponseFormat = "XML";
    
    var moAjax = null;
    var moAjaxEmployee = null;
    var moAjaxCompanySites = null;
    
    var moCloak = null;
    
    var moActionBar = null;
    var moActionRefresh = null;
    var moActionSave = null;
    var moActionCancel = null;
    
    var moStatusMsg = null;
    var moMainBox = null;
    
    var moEmployee = null;
    var moCompanies = null;
    var moCompanySites = null;
        
    var mbNewEmployee = false;
    var msEmployeeID = null;
    var msEmployeeType = null;
    var msCompanyID = null;
    var msCompanyName = null;
    
    var moCaller = null;
    
    var mbAdminNewUser = false;
    var mbAdminMode = false;
    
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
    // Returns a string of pipe-delimited values containing modified field values.
    //-------------------------------------------------------------------------------------
    function GetModifiedValues() {

        var sVals = "";
        
        var bInvalidValuesFound = false;

        //Build pipe-delimited string of values. Each name-value pair is separated by a 
        //single pipe character, and each record is separated by two pipe-characters. 
        var bValidDate;
            
        //Get the update status and the Employee ID.
        var sStatus  = (msEmployeeID == "0") ? "insert" : "update";
      
        var oBox = null;
        
        //
        //Get field values.
        //
        
        oBox = $("GeneralFieldsGroup"); 
        var oUserType  = GetFieldGroupValue(oBox,"EmployeeType");
        var oCompanySite = GetFieldGroupValue(oBox,"CompanySiteName");
        var oFirstName = GetFieldGroupValue(oBox,"FirstName");
        var oLastName  = GetFieldGroupValue(oBox,"LastName");
        var oGender    = GetFieldGroupValue(oBox,"Gender");
       
        oBox = $("ContactFieldsGroup");    
        var oPhone1 = GetFieldGroupValue(oBox,"Phone1");
        var oPhone2 = GetFieldGroupValue(oBox,"Phone2");
        var oEmail  = GetFieldGroupValue(oBox,"EmailAddr");
       
        oBox = $("PaymentFieldsGroup");    
        if (oBox)
        {
            var oPaymentMethod      = GetFieldGroupValue(oBox,"PaymentMethod");
            var oPaymentPO          = GetFieldGroupValue(oBox,"PaymentPO");
            var oPaymentCCType      = GetFieldGroupValue(oBox,"PaymentCCType");
            var oPaymentCCName      = GetFieldGroupValue(oBox,"PaymentCCName");
            var oPaymentCCNumber    = GetFieldGroupValue(oBox,"PaymentCCNumber");
            var oPaymentCCExpMonth  = GetFieldGroupValue(oBox,"PaymentCCExpMonth");
            var oPaymentCCExpYear   = GetFieldGroupValue(oBox,"PaymentCCExpYear");
        }
               
        oBox = $("CommentsFieldsGroup");    
        if (oBox)
        {
            var oComments = GetFieldGroupValue(oBox,"Comments");
        }
                            
        //
        //Build pipe-delimited string of values.
        //
       
        if (sStatus == "delete") 
        {
            sVals += "UpdateStatus=" + sStatus + "|";
            sVals += "EmployeeID=" + msEmployeeID + "|";
                    
            sVals += "|"; //Double-up pipe character for record delimiter.
        }
        else
        if (sStatus == "update" || sStatus == "insert") 
        {
            //Set the type of database update that will be done.
            sVals += "UpdateStatus=" + sStatus + "|";
            
            sVals += "UserType="   + msEmployeeType  + "|";
            sVals += "EmployeeID=" + msEmployeeID + "|";
            sVals += "CompanyID="  + msCompanyID  + "|";
            
            //if (oUserType.Updated)    sVals += "UserType="      + oUserType.Value    + "|";
            
            if (oCompanySite.Updated) sVals += "CompanySiteID=" + oCompanySite.Value + "|";
            if (oFirstName.Updated)   sVals += "FirstName="     + oFirstName.Value   + "|";
            if (oLastName.Updated)    sVals += "LastName="      + oLastName.Value    + "|";
            if (oGender.Updated)      sVals += "Gender="        + oGender.Value      + "|";
            
            if (oPhone1.Updated) sVals += "Phone1=" + oPhone1.Value + "|";
            if (oPhone2.Updated) sVals += "Phone2=" + oPhone2.Value + "|";
            if (oEmail.Updated)  sVals += "EmailAddr="  + oEmail.Value  + "|";
            
            //Check each Payment Method field for changes.
            if (oPaymentMethod  && oPaymentMethod.Updated)          sVals += "PaymentMethod="       + oPaymentMethod.Value      + "|";
            if (oPaymentPO      && oPaymentPO.Updated)              sVals += "PaymentPO="           + oPaymentPO.Value          + "|";
            if (oPaymentCCType  && oPaymentCCType.Updated)          sVals += "PaymentCCType="       + oPaymentCCType.Value      + "|";
            if (oPaymentCCName  && oPaymentCCName.Updated)          sVals += "PaymentCCName="       + oPaymentCCName.Value      + "|";
            if (oPaymentCCNumber && oPaymentCCNumber.Updated)       sVals += "PaymentCCNumber="     + oPaymentCCNumber.Value    + "|";
            if (oPaymentCCExpMonth && oPaymentCCExpMonth.Updated)   sVals += "PaymentCCExpMonth="   + oPaymentCCExpMonth.Value  + "|";
            if (oPaymentCCExpYear && oPaymentCCExpYear.Updated)     sVals += "PaymentCCExpYear="    + oPaymentCCExpYear.Value   + "|";
                 
            //Double-up pipe character for record delimiter.        
            sVals += "|";
        }

        //Return string to caller.
        return (bInvalidValuesFound) ? "ERROR: Invalid values found." : sVals;
    }

    //-------------------------------------------------------------------------------------
    // Hide the main user interface. 
    //-------------------------------------------------------------------------------------
    function HideUI() {
    
        ClearStatusMsg();
    
        //Hide the cloak.
        moCloak.Hide();
        
        //Hide the inline frame.
	    moThisDialog.style.visibility = "hidden";
	    moThisDialog.style.display = "none";
	    
	    try {
            if (moCaller) 
            {
                var sCallerPage = moCaller.window.location.pathname;
                if (sCallerPage.indexOf("/admin/") > 0) moCaller.window.location.reload();
            }
        }
        catch(e) {}
	    
    }
    
    //-------------------------------------------------------------------------------------
    // Retrieves all data required by the user interface.
    //-------------------------------------------------------------------------------------
    function InitUI() {
    
        //msCompanyID = $("UserCompanyID").value;
        //msEmployeeID = $("EmployeeID").value;
    
        moMainBox = $("EmployeeBox");
    
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
        var oItems = $("EmployeeBox").getElementsByTagName("DIV");
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
    
    }
              
    //-------------------------------------------------------------------------------------
    // Populates the fields in the General Fields group container.
    //-------------------------------------------------------------------------------------
    function PopulateGeneralBox(oData) {
     
        var oBox = $("GeneralFieldsGroup");
         
        oBox.innerHTML = "";
  	
    	//Display the employee name in the box title.
        var sTitle = "";
        if (msEmployeeType == "" || msEmployeeType == null)
            sTitle = "New User";
        else if (msEmployeeID != "0" && msEmployeeID != null) 
            sTitle = oData.FirstName + " " + oData.LastName;
        else 
            sTitle = "New Employee";
            
        $("EmployeeBoxTitle").innerHTML = sTitle;
        $("EmployeeBoxTitle").setAttribute("EmployeeID", oData.EmployeeID);
       
        //Insert a new field objects for each General field to be displayed.
        
        sUpdate = (msEmployeeID == "0") ? "insert" : "existing";
        
        var bAllowEdit = (msEmployeeType == "" || mbAdminMode) ? true : false;
        PopulateGeneralBoxItem(oBox, "User Type", oData, "EmployeeType", bAllowEdit, sUpdate);
        
        var bAllowEdit = (msCompanyName == "" || mbAdminMode) ? true : false;
        PopulateGeneralBoxItem(oBox, "Company Name", oData, "CompanyName", bAllowEdit, sUpdate);
        
        PopulateGeneralBoxItem(oBox, "Site Name",    oData, "CompanySiteName",  true,  sUpdate);
        PopulateGeneralBoxItem(oBox, "First Name",   oData, "FirstName",        true,  sUpdate);
        PopulateGeneralBoxItem(oBox, "Last Name",    oData, "LastName",         true,  sUpdate);
        PopulateGeneralBoxItem(oBox, "Gender",       oData, "Gender",           true,  sUpdate);
        
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
        oItemBox.style.width = "355px";
        oItemBox.style.margin = "5px 0px 5px 0px";
        oItemBox.setAttribute("UpdateStatus", "existing");
        oItemBox.setAttribute("EmployeeID", oData.EmployeeID);
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
        if (sField == "EmployeeType" && bAllowEdit == true) 
        {
	        //Insert dropdown.
            var oItem = document.createElement("SELECT");
            oItem.id = sField; //+ oData.EmployeeID;
            oItem.className = (mbIE)? "FieldValDropdown2IE" : "FieldValDropdown2";
            oItem.style.marginLeft  = "10px";
            //oItem.style.width = "100px";	
            PopulateEmployeeTypeDropdown(oItem, oData.EmployeeType);
            oItem.setAttribute("LastVal", oData.EmployeeType);
            oItem.setAttribute("EmployeeID", oData.EmployeeID);
            AddEvt(oItem, "change", SetSave);
            AddEvt(oItem, "change", SetChangeToEmployeeType);
            oItemBox.appendChild(oItem);
        }
        else
        if (sField == "CompanyName" && bAllowEdit == true) 
        {
	        //Insert dropdown.
            var oItem = document.createElement("SELECT");
            oItem.id = sField; //+ oData.EmployeeID;
            oItem.className = (mbIE)? "FieldValDropdown2IE" : "FieldValDropdown2";
            oItem.style.marginLeft  = "10px";
            //oItem.style.width = "100px";	
            PopulateCompanyDropdown(oItem, oData.CompanyID);
            oItem.setAttribute("LastVal", oData.CompanyID);
            oItem.setAttribute("EmployeeID", oData.EmployeeID);
            AddEvt(oItem, "change", SetSave);
            AddEvt(oItem, "change", SetChangeToCompany);
            oItemBox.appendChild(oItem);
        }
        else
        if (sField == "CompanySiteName" && bAllowEdit == true) 
        {
	        //Insert dropdown.
            var oItem = document.createElement("SELECT");
            oItem.id = sField; //+ oData.OrderID;
            oItem.className = (mbIE)? "FieldValDropdown2IE" : "FieldValDropdown2";
            oItem.style.marginLeft  = "10px";
            //oItem.style.width = "100px";	
            PopulateCompanySiteDropdown(oItem, oData.CompanySiteID, oData.CompanyID);
            oItem.setAttribute("LastVal", oData.CompanySiteID);
            oItem.setAttribute("EmployeeID", oData.EmployeeID);
            AddEvt(oItem, "change", SetSave);
            //AddEvt(oItem, "change", SetChangeToCompanySite);
            oItemBox.appendChild(oItem);
        }
        else
        if (sField == "Gender" && bAllowEdit == true) 
        {
	        //Insert Gender dropdown.
            var oItem = document.createElement("SELECT");
            oItem.id = sField; //+ oData.OrderID;
            oItem.className = (mbIE)? "FieldValDropdown2IE" : "FieldValDropdown2";
            oItem.style.marginLeft  = "10px";
            //oItem.style.width = "100px";	
            PopulateGenderDropdown(oItem, oData.Gender);
            oItem.setAttribute("LastVal", oData.Gender);
            oItem.setAttribute("EmployeeID", oData.EmployeeID);
            AddEvt(oItem, "change", SetSave);
            //AddEvt(oItem, "change", SetChangeToGender);
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
            oItem.setAttribute("EmployeeID", oData.EmployeeID);
            AddEvt(oItem, "keydown", SetSave);
            oItemBox.appendChild(oItem);
        }
        
        //
        //Additional tweaks... 
        //
        
        //If Order Number make bold.
        //if (sField == "OrderNumber") oItem.style.fontWeight = "bold";
        
        //If Order Status and read only, then make bold.
        //if ((sField == "OrderStatus") && !bAllowEdit) oItem.style.fontWeight = "bold";
       
        //Additional tweaks - if not edittable.
        if (!bAllowEdit)
        {
            oItem.readOnly = true;
            oItem.className = "FieldVal2 ReadOnly";
            oItem.style.borderWidth = "0px";
       }

    } 
    
                  
    //-------------------------------------------------------------------------------------
    // Populates the fields in the Contact Info group container.
    //-------------------------------------------------------------------------------------
    function PopulateContactInfoBox(oData) {
     
        var oBox = $("ContactFieldsGroup");
         
        oBox.innerHTML = "";
       
        //Insert a new field objects for each General field to be displayed.
        
        var sUpdate = (msEmployeeID == "0") ? "insert" : "existing";
        
        PopulateContactInfoBoxItem(oBox, "Phone 1",      oData, "Phone1",           true, sUpdate);
        PopulateContactInfoBoxItem(oBox, "Phone 2",      oData, "Phone2",           true, sUpdate);
        
        //Only allow editing the Email Address if creating a new employee, since the email address 
        //becomes the user's login username.
        var bAllowEdit = (sUpdate == "insert") ? true : false;
        PopulateContactInfoBoxItem(oBox, "Email Address",oData, "EmailAddr", bAllowEdit, sUpdate);

        //Insert message stating user's email will be used a their login.
        var oItem = document.createElement("P");
        oItem.id = "EmailNote";
        //oItem.readOnly = true; //do not allow editting
        oItem.tabIndex = -1; //prevent tab stop
        oItem.innerHTML = "<b>NOTE:</b> The email address entered here is used to sign into this site. Please ensure it is correct."; 
        oBox.appendChild(oItem);

        //If not a new user, insert link to page to change password.
        if (sUpdate == "existing") {
            var oItem = document.createElement("P");
            oItem.id = "PasswordLink";
            //oItem.readOnly = true; //do not allow editting
            //oItem.tabIndex = -1; //prevent tab stop
            oItem.innerHTML = 'To change your password click <a target="_parent" href="login-change-pw.aspx">here.</a>'; 
            oBox.appendChild(oItem);
        }
        
    }
  
    //-------------------------------------------------------------------------------------
    // Inserts a General Summary field object/element into the container.
    //-------------------------------------------------------------------------------------
    function PopulateContactInfoBoxItem(oBox, sName, oData, sField, bAllowEdit, UpdateStatus) 
    {
        //Insert container for the field header and field value.
        var oItemBox = document.createElement("DIV");
        oItemBox.id = sField + "FieldWrapper";
        oItemBox.className = "FieldWrapper";
        oItemBox.style.width = "355px";
        oItemBox.style.margin = "5px 0px 5px 0px";
        oItemBox.setAttribute("UpdateStatus", "existing");
        oItemBox.setAttribute("EmployeeID", oData.EmployeeID);
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
        oItem.setAttribute("EmployeeID", oData.EmployeeID);
        AddEvt(oItem, "keydown", SetSave);
        oItemBox.appendChild(oItem);
        
        //
        //Additional tweaks... 
        //
        
        //If Order Number make bold.
        //if (sField == "OrderNumber") oItem.style.fontWeight = "bold";
        
        //If Order Status and read only, then make bold.
        //if ((sField == "OrderStatus") && !bAllowEdit) oItem.style.fontWeight = "bold";
       
        //Additional tweaks - if not edittable.
        if (!bAllowEdit)
        {
            oItem.readOnly = true;
            oItem.className = "FieldVal2 ReadOnly";
            oItem.style.borderWidth = "0px";
       }

    } 
     
                  
    //-------------------------------------------------------------------------------------
    // Populates the fields in the Payment Method group container.
    //-------------------------------------------------------------------------------------
    function PopulatePaymentMethodBox(oData) {
     
        var oBox = $("PaymentFieldsGroup");
         
        oBox.innerHTML = "";
       
        //Insert a new field objects for each General field to be displayed.
        
        sUpdate = (msEmployeeID == "0") ? "insert" : "existing";
        
        PopulatePaymentMethodBoxItem(oBox, "Payment Method",        oData, "PaymentMethod",     true,   sUpdate);
        PopulatePaymentMethodBoxItem(oBox, "Purchase Order Number", oData, "PaymentPO",         true,   sUpdate);
        PopulatePaymentMethodBoxItem(oBox, "Credit Card Type",      oData, "PaymentCCType",     true,   sUpdate);
        PopulatePaymentMethodBoxItem(oBox, "Name on Credit Card",   oData, "PaymentCCName",     true,   sUpdate);
        PopulatePaymentMethodBoxItem(oBox, "Credit Card Number",    oData, "PaymentCCNumber",   true,   sUpdate);
        PopulatePaymentMethodBoxItem(oBox, "Expiration Month",      oData, "PaymentCCExpMonth", true,   sUpdate);
        PopulatePaymentMethodBoxItem(oBox, "Expiration Year",       oData, "PaymentCCExpYear",  true,   sUpdate);
        
        SetPaymentMethodFields(oData.PaymentMethod);
        
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
        oItemBox.style.width = "355px";
        oItemBox.style.margin = "5px 0px 5px 0px";
        oItemBox.setAttribute("UpdateStatus", "existing");
        oItemBox.setAttribute("EmployeeID", oData.EmployeeID);
        oBox.appendChild(oItemBox);

        //Insert field header.
        var oItem = document.createElement("LABEL");
        oItem.id = sField + "Hdr";
        //oItem.readOnly = true; //do not allow editting
        oItem.tabIndex = -1; //prevent tab stop
        oItem.className = "FieldHdr2 Right";
        oItem.style.marginLeft  = "5px";
        oItem.style.width = "135px";
        oItem.innerHTML = sName + ": "; 
        oItemBox.appendChild(oItem);
        
        //Insert input field.
        
        if (sField == "PaymentMethod" && bAllowEdit == true) 
        {
	        //Insert Payment Method dropdown.
            var oItem = document.createElement("SELECT");
            oItem.id = sField; //+ oData.OrderID;
            oItem.className = (mbIE)? "FieldValDropdown2IE" : "FieldValDropdown2";
            oItem.style.marginLeft  = "10px";
            //oItem.style.width = "100px";	
            PopulatePaymentMethodDropdown(oItem, oData.PaymentMethod);
            oItem.setAttribute("LastVal", oData.PaymentMethod);
            oItem.setAttribute("EmployeeID", oData.EmployeeID);
            AddEvt(oItem, "change", SetSave);
            AddEvt(oItem, "change", SetChangeToPaymentMethod);
            oItemBox.appendChild(oItem);
        }
        else
        if (sField == "PaymentCCType" && bAllowEdit == true) 
        {
	        //Insert Payment Method dropdown.
            var oItem = document.createElement("SELECT");
            oItem.id = sField; //+ oData.OrderID;
            oItem.className = (mbIE)? "FieldValDropdown2IE" : "FieldValDropdown2";
            oItem.style.marginLeft  = "10px";
            //oItem.style.width = "100px";	
            PopulatePaymentCCTypeDropdown(oItem, oData.PaymentCCType);
            oItem.setAttribute("LastVal", oData.PaymentCCType);
            oItem.setAttribute("EmployeeID", oData.EmployeeID);
            AddEvt(oItem, "change", SetSave);
            oItemBox.appendChild(oItem);
        }
        else
        if (sField == "PaymentCCExpMonth" && bAllowEdit == true) 
        {
	        //Insert Payment Method dropdown.
            var oItem = document.createElement("SELECT");
            oItem.id = sField; //+ oData.OrderID;
            oItem.className = (mbIE)? "FieldValDropdown2IE" : "FieldValDropdown2";
            oItem.style.marginLeft  = "10px";
            //oItem.style.width = "100px";	
            PopulatePaymentCCExpMonthDropdown(oItem, oData.PaymentCCExpMonth);
            oItem.setAttribute("LastVal", oData.PaymentCCExpMonth);
            oItem.setAttribute("EmployeeID", oData.EmployeeID);
            AddEvt(oItem, "change", SetSave);
            oItemBox.appendChild(oItem);
        }
        else
        if (sField == "PaymentCCExpYear" && bAllowEdit == true) 
        {
	        //Insert Payment Method dropdown.
            var oItem = document.createElement("SELECT");
            oItem.id = sField; //+ oData.OrderID;
            oItem.className = (mbIE)? "FieldValDropdown2IE" : "FieldValDropdown2";
            oItem.style.marginLeft  = "10px";
            //oItem.style.width = "100px";	
            PopulatePaymentCCExpYearDropdown(oItem, oData.PaymentCCExpYear);
            oItem.setAttribute("LastVal", oData.PaymentCCExpYear);
            oItem.setAttribute("EmployeeID", oData.EmployeeID);
            AddEvt(oItem, "change", SetSave);
            oItemBox.appendChild(oItem);
        }
        else {               
            //Insert field value.
            var oItem = document.createElement("INPUT");
            oItem.type = "text";	
            oItem.id = sField; //+ oData.OrderID;
            oItem.className = "FieldVal2";
            oItem.style.borderWidth = "1px";
            //oItem.style.padding = "2px 0px 3px 2px";
            //oItem.maxLength = "60";
            oItem.style.marginLeft  = "10px";
            oItem.style.width = "190px";	
            var sVal = eval("oData." + sField);
            oItem.value = sVal;
            //oItem.title = "Details: blah, blah, blah ";
            oItem.setAttribute("LastVal", sVal);
            oItem.setAttribute("EmployeeID", oData.EmployeeID);
            AddEvt(oItem, "keydown", SetSave);
            oItemBox.appendChild(oItem);
        }
        
        //
        //Additional tweaks... 
        //
        
        //If Order Number make bold.
        //if (sField == "OrderNumber") oItem.style.fontWeight = "bold";
        
        //If Order Status and read only, then make bold.
        //if ((sField == "OrderStatus") && !bAllowEdit) oItem.style.fontWeight = "bold";
       
        //Additional tweaks - if not edittable.
        if (!bAllowEdit)
        {
            oItem.readOnly = true;
            oItem.className = "FieldVal2 ReadOnly";
            oItem.style.borderWidth = "0px";
       }

    } 
         
    //-------------------------------------------------------------------------------------
    // Populates dropdown with Company values retrieved from the database and sets the 
    // initial value.
    //-------------------------------------------------------------------------------------
    function PopulateCompanyDropdown(oDropdown, sCompanyID) {
			
		//Clear the dropdown.
		oDropdown.innerHTML = "";
    
        //Add blank option.
        AddSelectOption(document, oDropdown, "", "", 0);
		
        //Populate dropdown.
        for (var i=0; i < moCompanies.length; i++) 
        {
            var oRecord = moCompanies[i];
            
            var sID = $data("CompanyID", oRecord);
            var sText = $data("CompanyName", oRecord);
            
            AddSelectOption(document, oDropdown, sText, sID, i + 1);
	    }
        
        if (sCompanyID != null) SetSelectValue(oDropdown, sCompanyID);

    }                    
         
    //-------------------------------------------------------------------------------------
    // Populates dropdown with Company Site values retrieved from the database and sets the 
    // initial value.
    //-------------------------------------------------------------------------------------
    function PopulateCompanySiteDropdown(oDropdown, sSiteID, sSearchCompanyID) {
			
		//Clear the dropdown.
		oDropdown.innerHTML = "";
    
        //Add blank option.
        AddSelectOption(document, oDropdown, "", "", 0);
		
        //Populate dropdown.
        for (var i=0; i < moCompanySites.length; i++) 
        {
            var oRecord = moCompanySites[i];
            
            var sCompanyID = $data("CompanyID", oRecord);
            
            if (sCompanyID === sSearchCompanyID)
            {
                var sID = $data("CompanySiteID", oRecord);
                var sSite = $data("CompanySiteName", oRecord);
            
                AddSelectOption(document, oDropdown, sSite, sID, i + 1);
            }
	    }
        
        if (sSiteID != null) SetSelectValue(oDropdown, sSiteID);

    }            
        
    //-------------------------------------------------------------------------------------
    // Populates dropdown with User/Employee Types and sets the initial value.
    //-------------------------------------------------------------------------------------
    function PopulateEmployeeTypeDropdown(oDropdown, sInitialValue) {
    	    
        //Get reference to XMLDOMNodeList.
        //var oResults = dbExamTypes.DataNodeList();

        //Populate dropdown.
        AddSelectOption(document, oDropdown, "", "", 0);
        AddSelectOption(document, oDropdown, "general",   "general",    1);
        AddSelectOption(document, oDropdown, "purchaser", "purchaser",  2);
        AddSelectOption(document, oDropdown, "admin",     "admin",      3);
        
        if (sInitialValue != null) SetSelectValue(oDropdown, sInitialValue);

    }      
        
    //-------------------------------------------------------------------------------------
    // Populates dropdown with Gender options and sets the initial value.
    //-------------------------------------------------------------------------------------
    function PopulateGenderDropdown(oDropdown, sInitialValue) {
    	    
        //Get reference to XMLDOMNodeList.
        //var oResults = dbExamTypes.DataNodeList();

        //Populate dropdown.
        AddSelectOption(document, oDropdown, "", "", 0);
        AddSelectOption(document, oDropdown, "Male",   "M", 1);
        AddSelectOption(document, oDropdown, "Female", "F", 2);
        
        if (sInitialValue != null) SetSelectValue(oDropdown, sInitialValue);

    }      
        
    //-------------------------------------------------------------------------------------
    // Populates dropdown with Payment Method options and sets the initial value.
    //-------------------------------------------------------------------------------------
    function PopulatePaymentMethodDropdown(oDropdown, sInitialValue) {
    	    
        //Get reference to XMLDOMNodeList.
        //var oResults = dbExamTypes.DataNodeList();

        //Populate dropdown.
        AddSelectOption(document, oDropdown, "", "", 0);
        AddSelectOption(document, oDropdown, "Credit Card",    "Credit Card",    1);
        AddSelectOption(document, oDropdown, "Purchase Order", "Purchase Order", 2);
        
        if (sInitialValue != null) SetSelectValue(oDropdown, sInitialValue);

    }      
        
    //-------------------------------------------------------------------------------------
    // Populates dropdown with Payment Credit Card Type options and sets the initial value.
    //-------------------------------------------------------------------------------------
    function PopulatePaymentCCTypeDropdown(oDropdown, sInitialValue) {
    	    
        //Get reference to XMLDOMNodeList.
        //var oResults = dbExamTypes.DataNodeList();

        //Populate dropdown.
        AddSelectOption(document, oDropdown, "", "", 0);
        AddSelectOption(document, oDropdown, "Visa", "Visa",    1);
        AddSelectOption(document, oDropdown, "MasterCard", "MasterCard", 2);
        AddSelectOption(document, oDropdown, "American Express", "American Express", 3);
        AddSelectOption(document, oDropdown, "Discover", "Discover", 4);
        
        if (sInitialValue != null) SetSelectValue(oDropdown, sInitialValue);

    }      
        
    //-------------------------------------------------------------------------------------
    // Populates dropdown with Payment Credit Card Expiration Month options and sets the initial value.
    //-------------------------------------------------------------------------------------
    function PopulatePaymentCCExpMonthDropdown(oDropdown, sInitialValue) {
    	    
        //Get reference to XMLDOMNodeList.
        //var oResults = dbExamTypes.DataNodeList();

        //Populate dropdown.
        AddSelectOption(document, oDropdown, "", "", 0);
        AddSelectOption(document, oDropdown, "01", "01",    1);
        AddSelectOption(document, oDropdown, "02", "02",    2);
        AddSelectOption(document, oDropdown, "03", "03",    3);
        AddSelectOption(document, oDropdown, "04", "04",    4);
        AddSelectOption(document, oDropdown, "05", "05",    5);
        AddSelectOption(document, oDropdown, "06", "06",    6);
        AddSelectOption(document, oDropdown, "07", "07",    7);
        AddSelectOption(document, oDropdown, "08", "08",    8);
        AddSelectOption(document, oDropdown, "09", "09",    9);
        AddSelectOption(document, oDropdown, "10", "10",    10);
        AddSelectOption(document, oDropdown, "11", "11",    11);
        AddSelectOption(document, oDropdown, "12", "12",    12);
        
        if (sInitialValue != null) SetSelectValue(oDropdown, sInitialValue);

    }      
        
    //-------------------------------------------------------------------------------------
    // Populates dropdown with Payment Credit Card Expiration Year options and sets the initial value.
    //-------------------------------------------------------------------------------------
    function PopulatePaymentCCExpYearDropdown(oDropdown, sInitialValue) {
    	    
        //Get reference to XMLDOMNodeList.
        //var oResults = dbExamTypes.DataNodeList();

        //Populate dropdown.
        AddSelectOption(document, oDropdown, "", "", 0);
        AddSelectOption(document, oDropdown, "2012", "2012",    1);
        AddSelectOption(document, oDropdown, "2013", "2013",    2);
        AddSelectOption(document, oDropdown, "2014", "2014",    3);
        AddSelectOption(document, oDropdown, "2015", "2015",    4);
        AddSelectOption(document, oDropdown, "2016", "2016",    5);
        AddSelectOption(document, oDropdown, "2017", "2017",    6);
        AddSelectOption(document, oDropdown, "2018", "2018",    7);
        AddSelectOption(document, oDropdown, "2019", "2019",    8);
        AddSelectOption(document, oDropdown, "2020", "2020",    9);
        AddSelectOption(document, oDropdown, "2021", "2021",    10);
        AddSelectOption(document, oDropdown, "2022", "2022",    11);
        AddSelectOption(document, oDropdown, "2023", "2023",    12);
        AddSelectOption(document, oDropdown, "2024", "2024",    13);
        AddSelectOption(document, oDropdown, "2025", "2025",    14);
        
        if (sInitialValue != null) SetSelectValue(oDropdown, sInitialValue);

    }      
        
    //-------------------------------------------------------------------------------------
    // Submits AJAX request to retrieve Companies.
    //-------------------------------------------------------------------------------------
    function RetrieveCompanies() {

	    //Display status message.   
	    //ClearStatusMsg("main"); 
	    SetStatusMsg("StatusMsg", "Retrieving companies...", "", false);
 	    
	    //Create XmlHttpRequest object.
	    moAjaxCompanies = AjaxCreate("Companies");
	    if (!moAjaxCompanies) return;
          
	    //Build parms string.
        var sParms	= "";
	    sParms += "&Action=" + encodeURI("GetCompanies");
	    //sParms += "&CompanyID=" + encodeURI(msCompanyID);
    	
	    //Initiate call to database.
	    var bSuccess = AjaxSend(moAjaxCompanies, sParms, RetrieveCompaniesCallback);
    	
	    //If not initiated, clear all status messages. 
	    if (!bSuccess) ClearStatusMsg();

    }

    //-------------------------------------------------------------------------------------
    // Callback for RetrieveCompanies method. 
    //-------------------------------------------------------------------------------------
    function RetrieveCompaniesCallback() 
    {  
	    var bKeepTrying = ((moAjaxCompanies.readyState == 4) && (moAjaxCompanies.status == 200)) ? false : true;
	    
	    if (bKeepTrying) return; 
	    
		var sResult = moAjaxCompanies.responseText;
		
		var sError = AjaxError(sResult);
		if (sError.length > 0)  
		{
		    alert("Unable to retrieve list of company sites. \n\n\ Error details:" + sError);
		    moAjaxCompanies = null;
		    return;
		}
		
		var oXml = (mbIE) ? moAjaxCompanies.responseXML.childNodes[0] : moAjaxCompanies.responseXML.documentElement; 
		
		//Store the data in local object.    
		moCompanies = oXml.getElementsByTagName("Table");
		
		//Release memory for AJAX object.
		moAjaxCompanies = null;
        		
	    //SetStatusMsg(sResult, "main");
	    
	   RetrieveCompanySites(); 
			    
    }
       
    //-------------------------------------------------------------------------------------
    // Submits AJAX request to retrieve Company Sites.
    //-------------------------------------------------------------------------------------
    function RetrieveCompanySites() {

	    //Display status message.   
	    //ClearStatusMsg("main"); 
	    SetStatusMsg("StatusMsg", "Retrieving company sites...", "", false);
 	    
	    //Create XmlHttpRequest object.
	    moAjaxCompanySites = AjaxCreate("CompanySites");
	    if (!moAjaxCompanySites) return;
          
	    //Build parms string.
        var sParms	= "";
	    sParms += "&Action=" + encodeURI("GetCompanySites");
	    if (msCompanyID != "0") sParms += "&CompanyID=" + encodeURI(msCompanyID);
    	
	    //Initiate call to database.
	    var bSuccess = AjaxSend(moAjaxCompanySites, sParms, RetrieveCompanySitesCallback);
    	
	    //If not initiated, clear all status messages. 
	    if (!bSuccess) ClearStatusMsg();

    }

    //-------------------------------------------------------------------------------------
    // Callback for RetrieveCompanySites method. 
    //-------------------------------------------------------------------------------------
    function RetrieveCompanySitesCallback() 
    {  
	    var bKeepTrying = ((moAjaxCompanySites.readyState == 4) && (moAjaxCompanySites.status == 200)) ? false : true;
	    
	    if (bKeepTrying) return; 
	    
		var sResult = moAjaxCompanySites.responseText;
		
		var sError = AjaxError(sResult);
		if (sError.length > 0)  
		{
		    alert("Unable to retrieve list of company sites. \n\n\ Error details:" + sError);
		    moAjaxCompanySites = null;
		    return;
		}
		
		var oXml = (mbIE) ? moAjaxCompanySites.responseXML.childNodes[0] : moAjaxCompanySites.responseXML.documentElement; 
		
		//Store the data in local object.    
		moCompanySites = oXml.getElementsByTagName("Table");
		
		//Release memory for AJAX object.
		moAjaxCompanySites = null;
        		
	    //SetStatusMsg(sResult, "main");
	    
	    if (msEmployeeID == "0")
	    {
	        SetNewEmployee();
	    }
	    else {
	        RetrieveEmployee(); 
	    }
			    
    }
                                                  
    //-------------------------------------------------------------------------------------
    // Submits AJAX request to retrieve Employee info.
    //-------------------------------------------------------------------------------------
    function RetrieveEmployee() {

	    //Display status message.   
	    //ClearStatusMsg("main"); 
	    SetStatusMsg("StatusMsg", "Retrieving employee information...", "", false);
 	    
	    //Create XmlHttpRequest object.
	    moAjaxEmployee = AjaxCreate("Employee");
	    if (!moAjaxEmployee) return;
          
	    //Build parms string.
        var sParms	= "";
	    sParms += "&Action=" + encodeURI("GetEmployee");
	    sParms += "&UserID=" + encodeURI($("UserID").value);
	    sParms += "&EmployeeID=" + encodeURI(msEmployeeID);
    	
	    //Initiate call to database.
	    var bSuccess = AjaxSend(moAjaxEmployee, sParms, RetrieveEmployeeCallback);
    	
	    //If not initiated, clear all status messages. 
	    if (!bSuccess) ClearStatusMsg();

    }

    //-------------------------------------------------------------------------------------
    // Callback for RetrieveEmployee method. 
    //-------------------------------------------------------------------------------------
    function RetrieveEmployeeCallback() 
    {  
	    var bKeepTrying = ((moAjaxEmployee.readyState == 4) && (moAjaxEmployee.status == 200)) ? false : true;
	    
	    if (bKeepTrying) return; 
    
		var sResult = moAjaxEmployee.responseText;
		
		var sError = AjaxError(sResult);
		if (sError.length > 0)  
		{
		    alert("Unable to retrieve data. \n\n\ Error details:" + sError);
		    mbCancellingChanges = false;
		    moAjaxEmployee = null;
		    return;
		}
		
		var oXml = (mbIE) ? moAjaxEmployee.responseXML.childNodes[0] : moAjaxEmployee.responseXML.documentElement; 
        
        //Display appropriate message if no orders remaining.
        if (!oXml || oXml.getElementsByTagName("Table").length == 0)  
        {  
            var sMsg = "No data available.";
            SetStatusMsg("StatusMsg", sMsg, "", false, true);
		    moAjax = null;
            return;
        }
		    
		moEmployee = oXml.getElementsByTagName("Table");
		
		//Release memory for AJAX object.
		moAjaxEmployee = null;
		
		//Clear the data box contents.
		//moOrderDataBox.innerHTML = "";
		
        //Pull data from XML returned.
        var oRecord = moEmployee[0];
           
        var oData = 
        {
            "CompanyID"         : $data("CompanyID",        oRecord), 
            "CompanyName"       : $data("CompanyName",      oRecord), 
            "CompanySiteID"     : $data("CompanySiteID",    oRecord), 
            "CompanySiteName"   : $data("CompanySiteName",  oRecord), 
            
            "EmployeeType"      : $data("UserType",     oRecord), 
            "EmployeeID"        : $data("EmployeeID",   oRecord), 
            "FirstName"         : $data("FirstName",    oRecord), 
            "LastName"          : $data("LastName",     oRecord), 
            "Gender"            : $data("Gender",       oRecord), 
            "EmailAddr"         : $data("EmailAddr",    oRecord), 
            "Phone1"            : $data("Phone1",       oRecord), 
            "Phone2"            : $data("Phone2",       oRecord), 
            
            "PaymentMethod"     : $data("PaymentMethod",oRecord), 
            "PaymentPO"         : $data("PaymentPO",oRecord), 
            "PaymentCCType"     : $data("PaymentCCType",oRecord), 
            "PaymentCCName"     : $data("PaymentCCName",oRecord), 
            "PaymentCCNumber"   : $data("PaymentCCNumber",oRecord), 
            "PaymentCCExpMonth" : $data("PaymentCCExpMonth",oRecord), 
            "PaymentCCExpYear"  : $data("PaymentCCExpYear",oRecord), 
            
            "Active"            : $data("Active", oRecord)
        }
                        
	    //Display General info.    
	    PopulateGeneralBox(oData);
	    
	    //Display Contact info.     
	    PopulateContactInfoBox(oData);
	    
	    //Display Payment Method info. 
	    if ($("PaymentFieldsGroupBox")) PopulatePaymentMethodBox(oData);
	    
	    //Display Employee Status info.     
	    //PopulateEmployeeStatusBox(oData);
        
        //Adjust layout of the data box and its container.
        //AdjustDataBoxLayout(moMainBox, moOrderDataBox, $("OrderColHdr"));
        
        //Adjust height of iframe container.
        moThisDialog.style.height = $("EmployeeBox").offsetHeight + 50 + "px";
        
        //Display success message.
        var sMsg = (mbCancellingChanges) ? "Changes cancelled, data refreshed." : "Data retrieved successfully.";
        SetStatusMsg("StatusMsg", sMsg, "", false, true);
        
        mbCancellingChanges = false;
     
        SetSave("off");

    }
    
    //-------------------------------------------------------------------------------------
    // Saves changes to the database.
    //-------------------------------------------------------------------------------------
    function SaveChanges() {
        
        //If processing another action don't allow save action.
        //if (IsBusy()) return;
        if (mbSaving) return;
        
        if (!ValidateChanges()) return; 
                    
        msModifiedValues = GetModifiedValues();
                
        //testing...        
        //alert("Modified Values: \n\n" + msModifiedValues);
        //return;
        
        //Make sure there are changes to be saved.
        if (msModifiedValues.length == 0) 
        {
            var sMsg = "There are no changes pending, save action cancelled.";
            SetStatusMsg("StatusMsg", sMsg, "", false, true, "red");
            return;
        }
       
        mbSaving = true;
        
        var sMsg = "Saving changes, please wait...";
        SetStatusMsg("StatusMsg", sMsg, "", false, false);
        
	    //Create XmlHttpRequest object.
	    moAjax = AjaxCreate("User Changes");
	    if (!moAjax) return;
	    
	    //if (mbAdminEditUser || mbAdminNewUser) msEmployeeType = document.getElementById("EmployeeType").value;
	    //var sEmployeeType = document.getElementById("EmployeeType").value;
	
	    //Build parms string.
        var sParms	= "";
	    sParms += "&Action="     + encodeURI("SaveEmployee");
	    sParms += "&UserID="     + encodeURI($("UserID").value);
	    sParms += "&EmployeeID=" + encodeURI(msEmployeeID);
	    sParms += "&UserType="   + encodeURI(msEmployeeType);
	    sParms += "&EmailAddr="  + encodeURI($("EmailAddr").value);
	    sParms += "&CreateUser=" + encodeURI(mbNewEmployee);
	    sParms += "&ModifiedValues=" + encodeURI(msModifiedValues);
	    
	    //if (msModifiedValues.length > 0) sParms += "&EmployeeValues=" + encodeURI(msModifiedValues);
    	
	    //Initiate call to database.
	    var bSuccess = AjaxSend(moAjax, sParms, SaveChangesCallback);
    	
	    //If not initiated, clear all status messages. 
	    if (!bSuccess) {
	        ClearStatusMsg();    
	        mbSaving = false;
	    }    
    }    

    //-------------------------------------------------------------------------------------
    // Callback for SaveChanges method. 
    //-------------------------------------------------------------------------------------
    function SaveChangesCallback() 
    {  
	    var bKeepTrying = ((moAjax.readyState == 4) && (moAjax.status == 200)) ? false : true;
	    
	    if (bKeepTrying) return; 
	    
		var sResult = moAjax.responseText;
		
		//Check for error.
		var sError = AjaxError(sResult);
		if (sError.length > 0)  
		{
            var sMsg = "Unable to save changes.";
            if (sError.length <= 200) sMsg += " " + sError;
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
        var sMsg = "Changes saved successfully.";
        SetStatusMsg("StatusMsg", sMsg, "", false, true);
        
        //Reset SAVE PENDING status.
        SetSave("off")
 		       
        if (mbNewEmployee) {
            var i = sResult.indexOf('pw=');
		    var sPW = (i > 0) ? sResult.substr(i+3) : null;
		    if (sPW) 
		    {
                var sMsg = "The following temporary password has been generated\n";
                sMsg += "for this new user:\n\n";
                sMsg += sPW + "\n\n";
                sMsg += "The user will be prompted to change this password when logging\n";
                sMsg += "into the site for the first time.";
                alert(sMsg);
            }
        }
        
        //Refresh the orders list.
        //Refresh();

        //Refresh the Employee list in the calling window or object.
        try {
            if (moCaller) 
            {
                if (moCaller.RefreshEmployees) moCaller.RefreshEmployees();
            }
        }
        catch(e) {}
            
    }
       
    //-------------------------------------------------------------------------------------
    // Called when a change to the Company is made by the user.
    //-------------------------------------------------------------------------------------
    function SetChangeToCompany(e) {

	    var evt = window.event || e;
	    var oSrc = evt.srcElement || e.target;
	    var sType = evt.type || e.type;

        //If old value and new value are the same, get outta here.
        //var sNewVal = oSrc.value;
        //var sLastVal = oSrc.getAttribute("LastVal");
        
        //***DAN TEMPORARY*** if (sNewVal == sLastVal) return;
                        
	    var oDataItemBox = oSrc.parentNode;
        //oDataItemBox.setAttribute("DeptID", sNewVal);
        
        //Populate the Company Sites dropdown with sites for the selected Company.
        msCompanyID = oSrc.value;
        PopulateCompanySiteDropdown(document.getElementById("CompanySiteName"), null, msCompanyID);
        
        //Set SAVE PENDING flags on.
        SetSave("on");
        
    }    
       
    //-------------------------------------------------------------------------------------
    // Called when a change to the Company is made by the user.
    //-------------------------------------------------------------------------------------
    function SetChangeToEmployeeType(e) {

	    var evt = window.event || e;
	    var oSrc = evt.srcElement || e.target;
	    var sType = evt.type || e.type;

        //If old value and new value are the same, get outta here.
        //var sNewVal = oSrc.value;
        //var sLastVal = oSrc.getAttribute("LastVal");
        
        //***DAN TEMPORARY*** if (sNewVal == sLastVal) return;
                        
	    var oDataItemBox = oSrc.parentNode;
        //oDataItemBox.setAttribute("DeptID", sNewVal);
        
        //Populate the Company Sites dropdown with sites for the selected Company.
        msEmployeeType = oSrc.value;
        
        //Set SAVE PENDING flags on.
        SetSave("on");
        
    }    
               
    //-------------------------------------------------------------------------------------
    // Called when a change to the Payment Method is made by the user.
    //-------------------------------------------------------------------------------------
    function SetChangeToPaymentMethod(e) {

	    var evt = window.event || e;
	    var oSrc = evt.srcElement || e.target;
	    var sType = evt.type || e.type;

        //If old value and new value are the same, get outta here.
        var sNewVal = oSrc.value;
        var sLastVal = oSrc.getAttribute("LastVal");
        
        //***DAN TEMPORARY*** if (sNewVal == sLastVal) return;
                        
	    var oDataItemBox = oSrc.parentNode;
        //oDataItemBox.setAttribute("DeptID", sNewVal);
        
        SetPaymentMethodFields(sNewVal);
        
        //Set SAVE PENDING flags on.
        SetSave("on");
        
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
    // Initialize new employee. 
    //-------------------------------------------------------------------------------------
    function SetNewEmployee() 
    {  
        var oData = 
        {
            "CompanyID"         : msCompanyID, 
            "CompanyName"       : msCompanyName, 
            "CompanySiteID"     : "", 
            "CompanySiteName"   : "", 
            
            "EmployeeID"        : "0", 
            "EmployeeType"      : msEmployeeType, 
            "FirstName"         : "", 
            "LastName"          : "", 
            "Gender"            : "", 
            "EmailAddr"         : "", 
            "Phone1"            : "", 
            "Phone2"            : "", 
            
            "PaymentMethod"     : "", 
            "PaymentPO"         : "", 
            "PaymentCCType"     : "", 
            "PaymentCCName"     : "", 
            "PaymentCCNumber"   : "", 
            "PaymentCCExpMonth" : "", 
            "PaymentCCExpYear"  : "", 
            
            "Active"            : "1"
        }
                        
	    //Display General info.    
	    PopulateGeneralBox(oData);
	    
	    //Display Contact info.     
	    PopulateContactInfoBox(oData);
	    
	    //Display Payment Method info. 
	    //if ($("PaymentFieldsGroupBox")) PopulatePaymentMethodBox(oData);
	    try 
	    {
	        $("PaymentFieldsGroupBox").style.display = "none";
	    }
	    catch(e) {}
	    
	    //Display Employee Status info.     
	    //PopulateEmployeeStatusBox(oData);
        
        //Adjust layout of the data box and its container.
        //AdjustDataBoxLayout(moMainBox, moOrderDataBox, $("OrderColHdr"));
        
        //Adjust height of iframe container.
        moThisDialog.style.height = $("EmployeeBox").offsetHeight + 50 + "px";
        
        //Display success message.
        var sMsg = "Enter new employee information, then click SAVE.";
        SetStatusMsg("StatusMsg", sMsg, "", false, true);
        
        mbCancellingChanges = false;
     
        SetSave("off");

    }
           
    //-------------------------------------------------------------------------------------
    // Hides/shows the appropriate Payment Method fields based on the selected Payment Method.
    //-------------------------------------------------------------------------------------
    function SetPaymentMethodFields(sMethod) {
                        
	    //var oDataItemBox = oWrapper.parentNode;
        //oDataItemBox.setAttribute("DeptID", sNewVal);
        
        var bCC = (sMethod === "Credit Card") ? true : false;
            
        $("PaymentPOFieldWrapper").style.display = bCC ? "none" : "block";
        
        $("PaymentCCTypeFieldWrapper").style.display = bCC ? "block" : "none";
        $("PaymentCCNameFieldWrapper").style.display = bCC ? "block" : "none";
        $("PaymentCCNumberFieldWrapper").style.display  = bCC ? "block" : "none";
        $("PaymentCCExpMonthFieldWrapper").style.display = bCC ? "block" : "none";
        $("PaymentCCExpYearFieldWrapper").style.display  = bCC ? "block" : "none";
        
        if (bCC) 
        {
            $("PaymentPO").value = "";
        }
        else {
            $("PaymentCCType").value = "";
            $("PaymentCCName").value = "";
            $("PaymentCCNumber").value = "";
            $("PaymentCCExpMonth").value = "";
            $("PaymentCCExpYear").value = "";
        }
        
        //Adjust the height of the iframe container.
        moThisDialog.style.height = $("EmployeeBox").offsetHeight + 50 + "px";
        
        //Set SAVE PENDING flags on.
        SetSave("on");
        
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
    // Show the main user interface.
    //-------------------------------------------------------------------------------------
    function ShowUI(iTop, iLeft, oCloak, sEmployeeType, sEmployeeID, sCompanyID, sCompanyName, oCaller, bAdminMode) {
        
        if (!iTop)  iTop  = 200;
        if (!iLeft) iLeft = 10;
        
        //Save the cloak passed to the global cloak used in the iframe, since it's context/scope is limited to
        //the iframe, where there should only ever be one cloak instance at a time.
        moCloak = oCloak;
            
        moCloak.Darker();
        
        if (oCaller) moCaller = oCaller;
        
        msEmployeeType = sEmployeeType;
        msEmployeeID   = sEmployeeID;
        msCompanyID    = sCompanyID;
        msCompanyName  = (!sCompanyName) ? "" : sCompanyName;
        
        //Check to see if we're in admin mode.
        if (msEmployeeType == "admin-new-user") 
        {
            mbAdminNewUser = true;
            msEmployeeType = "";
        }
        
        //Check for admin mode (edit or new).
        mbAdminMode = (bAdminMode === true) ? true : false; 

        //If EmployeeID is 0, then reference the appropriate iFrame object.
        if (msEmployeeID == "0") 
        {
            moThisDialog = parent.document.getElementById("NewEmployeePopup");
            mbNewEmployee = true;
        }
                    
        //Throw a cloak over all elements on the page.
        //moCloak.Show("ContentBox", 90000, "ContentBox");
        
        //SetFieldDefaults(sFirstName, sLastName, sZipCode);
        
//        moMainBox.style.zIndex = 91000;
//        
        //moMainBox.style.left = iLeft + "px";
        //moMainBox.style.top  = iTop + "px";
//        moMainBox.style.marginLeft = "auto";
//        moMainBox.style.marginRight = "auto";
//        moMainBox.style.top = iTop + "px";
        
        //Adjust top position if it extends past the bottom of the page.       
//        var iContentHeight = $("ContentBox").offsetTop + $("ContentBox").offsetHeight;
//        while ((moMainBox.offsetTop + moMainBox.offsetHeight) > iContentHeight){
//            moMainBox.style.top = (moMainBox.offsetTop - 100) + "px";
//        }   
//        
        
//        moMainBox.style.visibility = "visible";
//         //moMainBox.style.display = "inline";
        
        //moMainBox.style.width  = $("PopupContent").offsetWidth + "px";
        //moMainBox.style.height = $("PopupContent").offsetHeight + "px";
        
        
        moThisDialog.style.zIndex = parseInt(moCloak.GetZindex(), 10) + 1;

        /*********
        try{
            var iZindex = parseInt(moCloak.style.zIndex,10) + 1;
            iZindex = (iZindex > 0) ? iZindex + 1 : GetMaxZindex();
            moThisDialog.style.zIndex = zIndex;
        }
        catch(e)
        {
            moThisDialog.style.zIndex = GetMaxZindex();
        }
        **************/
                    
        moThisDialog.style.left = iLeft + "px";
        moThisDialog.style.top  = iTop + "px";
        
        moThisDialog.style.visibility = "visible";
        moThisDialog.style.display = "inline";
        
        moThisDialog.style.width  = $("EmployeeBox").offsetWidth  + 50 + "px";
        moThisDialog.style.height = $("EmployeeBox").offsetHeight + 50 + "px";
        
        //if (sCompanyID == "0")
            RetrieveCompanies();
        //else                     
        //    RetrieveCompanySites();                     
       
    }
     
    //-------------------------------------------------------------------------------------
    // Validates data. 
    //-------------------------------------------------------------------------------------
    function ValidateChanges() 
    {
    
        var bValid = true;
        
        var oField;
        var sMsg;
        
        //Company Site. 
        oField = $("CompanyName");
        if (oField.value.length == 0) {
            sMsg = "You must select the company";
            SetStatusMsg("StatusMsg", sMsg, "", true, true);
            return false;
        }
        
        //Company Site. 
        oField = $("CompanySiteName");
        if (oField.value.length == 0) {
            sMsg = "You must select the company site";
            SetStatusMsg("StatusMsg", sMsg, "", true, true);
            return false;
        }
        
        //First Name. 
        oField = $("FirstName");
        if (oField.value.length == 0) {
            sMsg = "You must enter a first name.";
            SetStatusMsg("StatusMsg", sMsg, "", true, true);
            return false;
        }
        
        //Last Name. 
        oField = $("LastName");
        if (oField.value.length == 0) {
            sMsg = "You must enter a last name.";
            SetStatusMsg("StatusMsg", sMsg, "", true, true);
            return false;
        }
        
        //Gender. 
        oField = $("Gender");
        if (oField.value.length == 0) {
            sMsg = "You must select a gender.";
            SetStatusMsg("StatusMsg", sMsg, "", true, true);
            return false;
        }
        
        //Phone1. 
        oField = $("Phone1");
        if (oField.value.length == 0) {
            sMsg = "You must enter a primary phone number.";
            SetStatusMsg("StatusMsg", sMsg, "", true, true);
            return false;
        }
        
        //Email address. 
        oField = $("EmailAddr");
        if (oField.value.length == 0) {
            sMsg = "You must enter an email address.";
            SetStatusMsg("StatusMsg", sMsg, "", true, true);
            return false;
        }
        
        //Email.
        oField = $("EmailAddr");
        //var oRegExp = new RegExp(/^[_a-zA-Z0-9_][.a-zA-Z0-9]*@[a-zA-Z0-9-]+(\.[.a-zA-Z0-9]+)*\.(com|edu|info|gov|int|mil|net|org|biz|name|museum|coop|aero|pro|[a-zA-Z]{2})$/);
        var oRegExp = new RegExp(/^[_a-zA-Z0-9!#'_][_.a-zA-Z0-9!#'_]*@[a-zA-Z0-9-]+(\.[.a-zA-Z0-9]+)*\.(com|edu|info|gov|int|mil|net|org|biz|name|museum|coop|aero|pro|[a-zA-Z]{2})$/);
        if (!oRegExp.test(oField.value.toLowerCase())) {
            sMsg = "You must enter a valid email address";
            SetStatusMsg("StatusMsg", sMsg, "", true, true);
            return false;
        }
        
        
        if ($("PaymentFieldsGroup") && $("PaymentFieldsGroup").getElementsByTagName("input").length > 0) 
        {
        
            //Payment Method. 
            oField = $("PaymentMethod");
            if (oField.value.length == 0) {
                sMsg = "You must choose a payment method.";
                SetStatusMsg("StatusMsg", sMsg, "", true, true);
                return false;
            }
        
            //Purchase Order Number. 
            oField = $("PaymentPO");
            if (oField.value.length == 0 && $("PaymentMethod").value == "Purchase Order") {
                sMsg = "You must enter the Purchase Order Number.";
                SetStatusMsg("StatusMsg", sMsg, "", true, true);
                return false;
            }
        
            //Credit Card Type. 
            oField = $("PaymentCCType");
            if (oField.value.length == 0 && $("PaymentMethod").value == "Credit Card") {
                sMsg = "You must select the type of credit card.";
                SetStatusMsg("StatusMsg", sMsg, "", true, true);
                return false;
            }
        
            //Credit Card Name. 
            oField = $("PaymentCCName");
            if (oField.value.length == 0 && $("PaymentMethod").value == "Credit Card") {
                sMsg = "You must enter the name on the credit card.";
                SetStatusMsg("StatusMsg", sMsg, "", true, true);
                return false;
            }
        
            //Credit Card Number. 
            oField = $("PaymentCCNumber");
            if (oField.value.length == 0 && $("PaymentMethod").value == "Credit Card") {
                sMsg = "You must enter the credit card number.";
                SetStatusMsg("StatusMsg", sMsg, "", true, true);
                return false;
            }
        
            //Credit Card Expiration Month. 
            oField = $("PaymentCCExpMonth");
            if (oField.value.length == 0 && $("PaymentMethod").value == "Credit Card") {
                sMsg = "You must enter the credit card expiration month.";
                SetStatusMsg("StatusMsg", sMsg, "", true, true);
                return false;
            }
        
            //Credit Card Expiration Year. 
            oField = $("PaymentCCExpYear");
            if (oField.value.length == 0 && $("PaymentMethod").value == "Credit Card") {
                sMsg = "You must enter the credit card expiration year.";
                SetStatusMsg("StatusMsg", sMsg, "", true, true);
                return false;
            }
            
            
        };
        
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

//}
