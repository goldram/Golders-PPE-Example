//-------------------------------------------------------------------------------------
//
// Description:	Contains JavaScript specific to managing current sizes information.
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
    var moThisDialog = parent.document.getElementById("CurrentSizesPopup");
}
catch(e) {}


//function CurrentSizes() {
    
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
    
    var moCloak = null;
    
    var moActionBar = null;
    var moActionRefresh = null;
    var moActionSave = null;
    var moActionCancel = null;
    
    var moStatusMsg = null;
    var moMainBox = null;
    
    var moEmployee = null;
    var moCurrentSizes = null;
        
    var msEmployeeID = null;
    var msCompanyID = null;
    var msCompanyName = null;
    
    var moCaller = null;
    var mbUseDefaultTitle = false;
    
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
            
        var oData = $("SizesDataBox").childNodes;

        //Build pipe-delimited string of values. Each name-value pair is separated by a 
        //single pipe character, and each record is separated by two pipe-characters. 
        var bValidDate;
        for (var i=0; i<oData.length; i++)
        {
            var oRow = oData[i];
            
            //ignore text nodes.
            if (oRow.nodeType != 1) continue; 
            
            //Get the update status and the Employee ID for the row.
            //var sStatus  = oRow.getAttribute("UpdateStatus");
            //var sEmployeeID = oRow.getAttribute("EmployeeID");
            var sStatus = "insert";
            
            var oItemType  = GetFieldValue(oRow,"ItemType");
            var oItemBrand = GetFieldValue(oRow,"ItemBrand");
            var oItemSize  = GetFieldValue(oRow,"ItemSize");
            
            //if (oItemType.Value != "" && oItemType.Value.length != 0)
            //{
                sVals += "ItemType="  + oItemType.Value  + "|";
                sVals += "ItemBrand=" + oItemBrand.Value + "|"; 
                sVals += "ItemSize="  + oItemSize.Value  + "|"; 
                 
                //Double-up pipe character for record delimiter.        
                sVals += "|";
            //}
            
        }

        //alert("Modified Exam Time values: " + sVals);

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
	    
    }
    
    //-------------------------------------------------------------------------------------
    // Retrieves all data required by the user interface.
    //-------------------------------------------------------------------------------------
    function InitUI() {
    
        //msCompanyID = $("UserCompanyID").value;
        //msEmployeeID = $("EmployeeID").value;
    
        moMainBox = $("CurrentSizesBox");
    
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
    // Inserts a sizes box field object/element into the container.
    //-------------------------------------------------------------------------------------
    function PopulateSizesBoxItem(oBox, oData, bAllowEdit, sUpdateStatus) 
    {
        //Insert container for the field header and field value.
        var oItemBox = document.createElement("DIV");
        oItemBox.id = oData.ItemNum + "FieldWrapper";
        oItemBox.className = "FieldWrapper";
        oItemBox.style.width = "500px";
        oItemBox.style.margin = "2px 0px 5px 0px";
        oItemBox.setAttribute("UpdateStatus", sUpdateStatus);
        oItemBox.setAttribute("EmployeeID", oData.EmployeeID);
        oItemBox.setAttribute("CurrentSizeID", oData.CurrentSizeID);
        oBox.appendChild(oItemBox);

        //Insert field header.
        var oItem = document.createElement("LABEL");
        oItem.id = "ItemNum";
        //oItem.readOnly = true; //do not allow editting
        oItem.tabIndex = -1; //prevent tab stop
        oItem.className = "FieldHdr2 Left";
        oItem.style.marginRight = "0px";
        oItem.style.width = "80px";
        oItem.innerHTML = "Item " + oData.ItemNum; 
        oItemBox.appendChild(oItem);
        
        //Insert Item Type field.
        if (bAllowEdit == true) 
        {
	        //Insert dropdown.
            var oItem = document.createElement("SELECT");
            oItem.id = "ItemType"; //+ oData.OrderID;
            oItem.className = (mbIE)? "FieldValDropdown2IE" : "FieldValDropdown2";
            oItem.style.marginLeft  = "5px";
            oItem.style.width = "120px";	
            PopulateItemTypeDropdown(oItem, oData.ItemType);
            oItem.setAttribute("LastVal", oData.ItemType);
            oItem.setAttribute("CurrentSizeID", oData.CurrentSizeID);
            AddEvt(oItem, "change", SetSave);
            AddEvt(oItem, "change", SetChangeToItemType);
            oItemBox.appendChild(oItem);
        }
        else
        {
            var oItem = document.createElement("INPUT");
            oItem.type = "text";	
            oItem.id = "ItemType"; //+ oData.OrderID;
            oItem.className = "FieldVal2 ReadOnly";
            oItem.readOnly = true;            
            oItem.style.borderWidth = "1px";
            //oItem.style.padding = "2px 0px 3px 2px";
            //oItem.maxLength = "60";
            oItem.style.marginLeft  = "5px";
            oItem.style.width = "120px";	
            oItem.value = oData.ItemType;
            //oItem.title = "Details: blah, blah, blah ";
            oItem.setAttribute("LastVal", oData.ItemType);
            oItem.setAttribute("CurrentSizeID", oData.CurrentSizeID);
            //AddEvt(oItem, "keydown", SetSave);
            oItemBox.appendChild(oItem);
        }
        
        //Insert Item Brand field.
        if (bAllowEdit == true) 
        {
	        //Insert dropdown.
            var oItem = document.createElement("SELECT");
            oItem.id = "ItemBrand"; //+ oData.OrderID;
            oItem.className = (mbIE)? "FieldValDropdown2IE" : "FieldValDropdown2";
            oItem.style.marginLeft  = "5px";
            oItem.style.width = "140px";	
            PopulateItemBrandDropdown(oItem, oData.ItemType, oData.ItemBrand);
            oItem.setAttribute("LastVal", oData.ItemBrand);
            oItem.setAttribute("CurrentSizeID", oData.CurrentSizeID);
            AddEvt(oItem, "change", SetSave);
            AddEvt(oItem, "change", SetChangeToItemBrand);
            oItemBox.appendChild(oItem);
            
            var oLastItem = oItem;
            
            var oItem = document.createElement("INPUT");
            oItem.type = "text";	
            oItem.id = "ItemBrand2"; //+ oData.OrderID;
            oItem.className = "FieldVal2";
            //oItem.readOnly = fl;
            oItem.style.borderWidth = "1px";
            //oItem.style.padding = "2px 0px 3px 2px";
            //oItem.maxLength = "60";
            oItem.style.visibility = "hidden";
            oItem.style.position = "absolute";
            oItem.style.width = (oLastItem.offsetWidth - 5) + "px";
            oItem.style.left = oLastItem.offsetLeft + "px";	
            oItem.style.top = oLastItem.offsetTop + "px";	
            oItem.value = oData.ItemBrand;
            //oItem.title = "Details: blah, blah, blah ";
            oItem.setAttribute("LastVal", oData.ItemBrand);
            oItem.setAttribute("CurrentSizeID", oData.CurrentSizeID);
            AddEvt(oItem, "blur", SetChangeToItemBrandInput);
            AddEvt(oItem, "keydown", SetSave);
            oItemBox.appendChild(oItem);

            
        }
        else
        {
            var oItem = document.createElement("INPUT");
            oItem.type = "text";	
            oItem.id = "ItemBrand"; //+ oData.OrderID;
            oItem.className = "FieldVal2 ReadOnly";
            oItem.readOnly = true;
            oItem.style.borderWidth = "1px";
            //oItem.style.padding = "2px 0px 3px 2px";
            //oItem.maxLength = "60";
            oItem.style.marginLeft  = "5px";
            oItem.style.width = "140px";	
            oItem.value = oData.ItemBrand;
            //oItem.title = "Details: blah, blah, blah ";
            oItem.setAttribute("LastVal", oData.ItemBrand);
            oItem.setAttribute("CurrentSizeID", oData.CurrentSizeID);
            //AddEvt(oItem, "keydown", SetSave);
            oItemBox.appendChild(oItem);
        }
        
        //Insert Item Size field.
        var oItem = document.createElement("INPUT");
        oItem.type = "text";	
        oItem.id = "ItemSize"; //+ oData.OrderID;
        oItem.className = (bAllowEdit == true) ? "FieldVal2" : "FieldVal2 ReadOnly";
        oItem.readOnly = (bAllowEdit == true) ? false : true;
        oItem.style.borderWidth = "1px";
        //oItem.style.padding = "2px 0px 3px 2px";
        //oItem.maxLength = "60";
        oItem.style.marginLeft  = "5px";
        oItem.style.width = "140px";	
        oItem.value = oData.ItemSize;
        //oItem.title = "Details: blah, blah, blah ";
        oItem.setAttribute("LastVal", oData.ItemSize);
        oItem.setAttribute("CurrentSizeID", oData.CurrentSizeID);
        //AddEvt(oItem, "keydown", SetSave);
        oItemBox.appendChild(oItem);

    } 
         
    //-------------------------------------------------------------------------------------
    // Populates dropdown with Item Type options and sets the initial value.
    //-------------------------------------------------------------------------------------
    function PopulateItemTypeDropdown(oDropdown, sItemType) {
			
		//Clear the dropdown.
		oDropdown.innerHTML = "";
    
        //Add blank option.
        AddSelectOption(document, oDropdown, "", "", 0);
		
        //Populate dropdown.
        AddSelectOption(document, oDropdown, "Boots",   "Boots",    1);
        AddSelectOption(document, oDropdown, "Hats",    "Hats",     2);
        AddSelectOption(document, oDropdown, "Jackets", "Jackets",  3);
        AddSelectOption(document, oDropdown, "Jumpers", "Jumpers",  4);
        AddSelectOption(document, oDropdown, "Pants",   "Pants",    5);
        AddSelectOption(document, oDropdown, "Shirts",  "Shirts",   6);
        AddSelectOption(document, oDropdown, "Socks",   "Socks",    7);
        
        //Set initial value (if passed).
        if (sItemType != null) SetSelectValue(oDropdown, sItemType);

    }            
         
    //-------------------------------------------------------------------------------------
    // Populates dropdown with Item Brand options and sets the initial value.
    //-------------------------------------------------------------------------------------
    function SetChangeToItemType(e) {
    
	    var evt = window.event || e;
	    var oSrc = evt.srcElement || e.target;
	    var sType = evt.type || e.type;
	    
	    var sType = oSrc.value;
	    
        PopulateItemBrandDropdown(oSrc.nextSibling, sType, null);
    
    }
         
    //-------------------------------------------------------------------------------------
    // Populates dropdown with Item Brand options and sets the initial value.
    //-------------------------------------------------------------------------------------
    function SetChangeToItemBrand(e) {
    
	    var evt = window.event || e;
	    var oSrc = evt.srcElement || e.target;
	    var sType = evt.type || e.type;
	    
	    var sBrand = oSrc.value;
	    
	    if (sBrand == "Other") 
	    {
	        var oTextbox = oSrc.nextSibling;
	        
	        oTextbox.style.visibility = "visible";
	        oTextbox.focus();
	    }
	    else {
	        var oTextbox = oSrc.nextSibling;
	        
	        oTextbox.value = "";
	        oTextbox.style.visibility = "hidden";
	    }     
	    
    }
         
    //-------------------------------------------------------------------------------------
    // Processes Brand entered into textbox, used when the user selects "Other" from the
    // Brand dropdown.
    //-------------------------------------------------------------------------------------
    function SetChangeToItemBrandInput(e) {
    
	    var evt = window.event || e;
	    var oSrc = evt.srcElement || e.target;
	    var sType = evt.type || e.type;
	    
	    var sBrand = oSrc.value;
	    
	    var oBrandDropdown = null;
	    var oTypeDropdown  = null;
	    
	    for (var i=0; i<oSrc.parentNode.childNodes.length; i++)
	    {
	        var oThat = oSrc.parentNode.childNodes[i];
	        
	        if (oThat.id == "ItemType")  oTypeDropdown  = oThat;
	        if (oThat.id == "ItemBrand") oBrandDropdown = oThat;
	    }
	    
	    if (sBrand == "" || sBrand.length == 0) 
	    {
	        oSrc.value = "";
	        oSrc.style.visibility = "hidden";
	    }
	    else 
	    {
	        oSrc.value = "";
	        oSrc.style.visibility = "hidden";
	        PopulateItemBrandDropdown(oBrandDropdown, oTypeDropdown.value, sBrand)
	    }
	    
    }
             
    //-------------------------------------------------------------------------------------
    // Populates dropdown with Item Brand options and sets the initial value.
    //-------------------------------------------------------------------------------------
    function PopulateItemBrandDropdown(oDropdown, sType, sBrand) {
    
        var oOptionsAvail = {
            "Boots"     : ["Bata", "Dawgs", "Mack", "Mongrel", "Oliver", "Steel Blue", "Other"],
            "Hats"      : ["Akubra", "Other"],
            "Jackets"   : ["Stanley", "Other"],
            "Jumpers"   : ["Elegant Knitwear", "Other"],
            "Pants"     : ["Bisley", "Can't Tear 'Em", "King Gee", "Levi", "Wrangler", "Yakka", "Other"],
            "Shirts"    : ["Elegant Knitting", "King Gee", "Yakka", "Other"],
            "Socks"     : ["Bamboo", "Other"]
        }    
        			
		//Clear the dropdown.
		oDropdown.innerHTML = "";
    
        //Add blank option.
        AddSelectOption(document, oDropdown, "", "", 0);
        
        if (!sType) return;
        
        //Set options array to use.
        var oOptions = eval("oOptionsAvail." + sType);
        
        //Populate dropdown.
        for (var i=0; i < oOptions.length; i++) 
        {
            AddSelectOption(document, oDropdown, oOptions[i], oOptions[i], i + 1);
	    }
        
        //If the Brand was passed, make sure it already exists in the dropdown, and then set it.
        if (sBrand != null)
        {
            //Add it if it doesn't already exist.
            if (!contains(oOptions, sBrand)) AddSelectOption(document, oDropdown, sBrand, sBrand, 99);
            
            //Set initial value.
            if (sBrand != null) SetSelectValue(oDropdown, sBrand);
        }
                      
        
        //Function to search array for Brand passed.
        function contains(a, val) 
        {     
            for (var i=0; i < a.length; i++) 
            {         
                if (a[i] === val) return true;
            }
            return false; 
        } 

    }            
    
    //-------------------------------------------------------------------------------------
    // Submits AJAX request to retrieve Company Sites.
    //-------------------------------------------------------------------------------------
    function RetrieveCurrentSizes() {

	    //Display status message.   
	    //ClearStatusMsg("main"); 
	    SetStatusMsg("StatusMsg", "Retrieving clothing size profile...", "", false);
 	    
	    //Create XmlHttpRequest object.
	    moAjax = AjaxCreate("CurrentSizes");
	    if (!moAjax) return;
          
	    //Build parms string.
        var sParms	= "";
	    sParms += "&Action=" + encodeURI("GetEmployeeCurrentSizes");
	    sParms += "&EmployeeID=" + encodeURI(msEmployeeID);
    	
	    //Initiate call to database.
	    var bSuccess = AjaxSend(moAjax, sParms, RetrieveCurrentSizesCallback);
    	
	    //If not initiated, clear all status messages. 
	    if (!bSuccess) ClearStatusMsg();

    }
 
    //-------------------------------------------------------------------------------------
    // Callback for RetrieveCurrentSizes method. 
    //-------------------------------------------------------------------------------------
    function RetrieveCurrentSizesCallback() 
    {  
	    var bKeepTrying = ((moAjax.readyState == 4) && (moAjax.status == 200)) ? false : true;
	    
	    if (bKeepTrying) return; 
    
		var sResult = moAjax.responseText;
		
		var sError = AjaxError(sResult);
		if (sError.length > 0)  
		{
		    alert("Unable to retrieve data. \n\n\ Error details:" + sError);
		    mbCancellingChanges = false;
		    moAjax = null;
		    return;
		}
		
		var oXml = (mbIE) ? moAjax.responseXML.childNodes[0] : moAjax.responseXML.documentElement; 
        
        //Display appropriate message if no orders remaining.
//        if (!oXml || oXml.getElementsByTagName("Table").length == 0)  
//        {  
//            var sMsg = "No data available.";
//            SetStatusMsg("StatusMsg", sMsg, "", false, true);
//		      moAjax = null;
//            return;
//        }
//		    
		moCurrentSizes = oXml.getElementsByTagName("Table");
		
		//Release memory for AJAX object.
		moAjax = null;
		
		//Clear the data box contents.
		$("SizesDataBox").innerHTML = "";
			
        //Display data.
        if (!moCurrentSizes || moCurrentSizes.length == 0)
        {
        
            $("BoxTitle").innerHTML = (mbUseDefaultTitle == true) ? "Clothing Size Profile" : "Welcome to Golders!";
            
            for (var i=1; i<=6; i++) 
            {
                var oData = 
                {
                    "EmployeeID"     : msEmployeeID,
                    "ItemNum"        : i,
                    "CurrentSizesID" : 0, 
                    "ItemType"       : "", 
                    "ItemBrand"      : "", 
                    "ItemSize"       : ""
                }
                
	            PopulateSizesBoxItem($("SizesDataBox"), oData, true, "insert");
            }
        }
        else {
        
            $("BoxTitle").innerHTML = "Clothing Size Profile";
            
            //for (var i=0; i < moCurrentSizes.length; i++) 
            for (var i=0; i <= 5; i++) 
            {
                if (i < moCurrentSizes.length) {
                    var oRecord = moCurrentSizes[i];
                    var oData = {
                        "EmployeeID"    : $data("EmployeeID", oRecord),
                        "ItemNum"       : i+1,
	                    "CurrentSizeID" : $data("CurrentSizeID", oRecord), 
	                    "ItemType"      : $data("ItemType", oRecord), 
	                    "ItemBrand"     : $data("ItemBrand", oRecord), 
	                    "ItemSize"      : $data("ItemSize", oRecord) 
	                }
	            }
	            else {
                    var oData = {
                        "EmployeeID"     : msEmployeeID,
                        "ItemNum"        : i+1,
                        "CurrentSizesID" : 0, 
                        "ItemType"       : "", 
                        "ItemBrand"      : "", 
                        "ItemSize"       : ""
	                }
	            }
    	        
	            PopulateSizesBoxItem($("SizesDataBox"), oData, true, "existing");
	        }
	    }
        
        //Adjust height of iframe container.
        moThisDialog.style.height = $("CurrentSizesBox").offsetHeight + 50 + "px";
        
        //Display success message.
        var sMsg = (mbCancellingChanges) ? "Changes cancelled, data refreshed." : "Data retrieved successfully.";
        SetStatusMsg("StatusMsg", sMsg, "", false, true);
        
        mbCancellingChanges = false;
     
        SetSave("off");

    }

    //-------------------------------------------------------------------------------------
    // Initialize item list. 
    //-------------------------------------------------------------------------------------
    function SetNewCurrentSizesList() 
    {  
    
        for (var i=1; i<=6; i++) 
        {
            var oData = 
            {
                "EmployeeID"     : msEmployeeID,
                "ItemNum"        : i,
                "CurrentSizesID" : 0, 
                "ItemType"       : "", 
                "ItemBrand"      : "", 
                "ItemSize"       : ""
            }
        }
                        
	    PopulateSizesBoxItem($("SizesDataBox"), oData, true, "insert");

        //Adjust height of iframe container.
        moThisDialog.style.height = $("CurrentSizesBox").offsetHeight + 50 + "px";
        
        //Display success message.
        //var sMsg = "Enter new employee information, then click SAVE.";
        SetStatusMsg("StatusMsg", "", "", false, true);
        
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
          
	    //Build parms string.
        var sParms	= "";
	    sParms += "&Action=" + encodeURI("SaveEmployeeCurrentSizes");
	    sParms += "&EmployeeID=" + encodeURI(msEmployeeID);
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
        
        //if (moCaller) moCaller.RefreshEmployees();
        
        //Refresh the orders list.
        //Refresh();
            
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
    function ShowUI(iTop, iLeft, oCloak, sEmployeeID, oCaller, bUseDefaultTitle) {
        
        if (!iTop)  iTop  = 200;
        if (!iLeft) iLeft = 10;
        
        moCloak = oCloak;
        
        moCloak.Darker();
        
        mbUseDefaultTitle = (bUseDefaultTitle == true) ? true : false; 
        
        if (oCaller) moCaller = oCaller;
        
        msEmployeeID  = sEmployeeID;
        //msCompanyID   = sCompanyID;
        //msCompanyName = (!sCompanyName) ? "" : sCompanyName;
        
        moThisDialog = parent.document.getElementById("CurrentSizesPopup");
                    
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
            
        //moThisDialog.style.zIndex = (msEmployeeID == "0") ? 96000 : 91000;
        //moThisDialog.style.zIndex = 96000;
        
        moThisDialog.style.zIndex = parseInt(moCloak.GetZindex(),10) + 1;
        
        /*************
        try{
            var iZindex = parseInt(moCloak.style.zIndex,10) + 1;
            iZindex = (iZindex > 0) ? iZindex + 1 : GetMaxZindex();
            moThisDialog.style.zIndex = zIndex;
        }
        catch(e)
        {
            moThisDialog.style.zIndex = GetMaxZindex();
        }  
        *************/
              
        moThisDialog.style.left = iLeft + "px";
        moThisDialog.style.top  = iTop + "px";
        
        moThisDialog.style.visibility = "visible";
        moThisDialog.style.display = "inline";
        
        moThisDialog.style.width  = $("CurrentSizesBox").offsetWidth  + 50 + "px";
        moThisDialog.style.height = $("CurrentSizesBox").offsetHeight + 50 + "px";
        
        RetrieveCurrentSizes();                     
       
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
//        oField = $("CompanySiteName");
//        if (oField.value.length == 0) {
//            sMsg = "You must select the company site";
//            SetStatusMsg("StatusMsg", sMsg, "", true, true);
//            return false;
//        }
//        
        
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
