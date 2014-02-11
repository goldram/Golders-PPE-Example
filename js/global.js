//-------------------------------------------------------------------------------------
//
// Description:	Contains JavaScript used specific to this web app and used globally
//              thoughout the application.
//		  
// Maintenance:
//
// Date			Developer			Modification
// --------   	------------------	----------------------------------------------
// 01/01/12		Dan Carlson			Initial version created.
//
//-------------------------------------------------------------------------------------

//function grToolkit() {

 var mbIE = (!window.addEventListener || navigator.appName.indexOf("Internet Explorer") >= 0) ? true : false;
    
var goCloak = new Cloaker();

var miMaxZindex = 90000;
    
//-------------------------------------------------------------------------------------
// Function to return a data from an XML node.
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
// Function to return the first child node of element type = 1.
//-------------------------------------------------------------------------------------
function $firstChild(oParent) {

    try {
        for (var i=0; i<oParent.childNodes.length; i++)
        {
            if (oParent.childNodes[i].nodeType == 1) return oParent.childNodes[i];
        }
    }
    catch(e){};
    
    
    //If we get here, element/field item was not found, so return an empty object.
    return {};
}
        
//-------------------------------------------------------------------------------------
// Adjust layout of the data list/grid. 
//-------------------------------------------------------------------------------------
function AdjustDataBoxLayout(oMainBox, oDataBox, oDataBoxColHdr) {
    
    //Don't allow data box to get too tall or too short.
    if (oDataBox.offsetHeight > 500) 
    {
        oDataBox.style.height = "500px";
        oMainBox.style.height = "630px";
    }
    else if (oDataBox.childNodes.length == 1)
    {
        oDataBox.style.height = "40px";
    }
    else 
    {
        oDataBox.style.height = ""; //let it set its own height.
    }    
     
    //testing....
    //oDataBox.style.height = "500px";
    //oMainBox.style.height = "630px";
    
    //Make sure the width of the data box's column header is correct.
    //oDataBoxColHdr.style.width = (mbIE) ? oDataBox.scrollWidth + "px" : oDataBox.childNodes[0].offsetWidth + "px";     
    oDataBoxColHdr.style.width = oDataBox.parentNode.scrollWidth + 30 + "px";     

    //Adjust height of the main container.
    //moMainBox.style.height = moOrderItemsDataBox.parentNode.offsetTop + (moOrders.length * 27) + "px"; 
    //moMainBox.style.height = moOrderItemsDataBox.parentNode.offsetTop + (moOrderItemsDataBox.childNodes.length * 27) + "px"; 
    oMainBox.style.height = oDataBox.parentNode.offsetTop + oDataBox.parentNode.offsetHeight + 30 + "px"; 
}

//-------------------------------------------------------------------------------------
// Formats the Gender Code from the database.
//-------------------------------------------------------------------------------------
function FormatGenderCode(sGenderCode) {

    switch (sGenderCode.toLowerCase()) 
    {
        case "m":
            return "Male";
            break;
        case "f":
            return "Female";
            break;
        default:
            return "Male/Female";
            break;
    }

}
                   
//-------------------------------------------------------------------------------------
// Returns object containing field value and whether it has been updated or not.
//-------------------------------------------------------------------------------------
function GetFieldValue(oData, sFieldID, bGetDisplayed) {
	
    var oResult = null;
    
    var oFields = oData.childNodes;
        
    for (var i=0; i < oFields.length; i++){
        var oField = oFields[i];
        if (oField.id === sFieldID) {
            var sTag = oField.tagName.toLowerCase();
            //sCurrVal = (sTag === "label") ? oField.innerHTML : oField.value;
            sCurrVal = ((oField.readOnly === true || sTag === "label") && !bGetDisplayed) ? oField.getAttribute("LastVal") : oField.value;
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
// Returns the max/next zIndex value to ensure an object appears correctly.
//-------------------------------------------------------------------------------------
function GetMaxZindex() {
	
    //Always skip a few to better account for objects that might not have used this function.
    
    return miNextZindex = miMaxZindex + 5;
}

//-------------------------------------------------------------------------------------
// Hide the cloak. 
//-------------------------------------------------------------------------------------
function HideCloak() {

    try 
    {
        //Hide the cloak.
        goCloak.Hide();
    }
    catch(e) {}

}

//-------------------------------------------------------------------------------------
// Parses the date and time value from a SQL date value (mm/dd/yyyy hh:mm:ss).
//-------------------------------------------------------------------------------------
function ParseOrderDate(sDateVal) {

    oResult = {"Date" : "", "Time" : "", "DateTime" : ""};

    if (sDateVal == null) return oResult;
	
    //Split value into date part (mm/dd/yyyy) and time part (hh:mm:ss).    
    var aDateParts = sDateVal.split("T");
    
    //Date.
    var sDate = aDateParts[0];
    
    //Time.
    var aTimeParts = aDateParts[1].split(":");
    var iHr = parseInt(aTimeParts[0],10);
    var iMin = parseInt(aTimeParts[1],10);
    var sMin = (iMin < 10) ? "0" + iMin : iMin;
    var sHr = (iHr > 12) ? iHr - 12 :  iHr;
    var sAmPm = (iHr < 12) ? "am" : "pm";
    var sTime = sHr + ":" + sMin + " " + sAmPm;
    
    //Result object.
    var oResult = 
    {
        "Date" : sDate, 
        "Time" : sTime, 
        "DateTime" : sDate + " " + sTime
    };

    //Return result.
    return oResult;

}   
 
//-------------------------------------------------------------------------------------
// Inserts a new Date-specific data item into the Orders box.
//-------------------------------------------------------------------------------------
function PopulateOrderBoxItemDate(oItemBox, sBoxField, oData, sDataField, sUpdateStatus) {

    //example: PopulateOrderBoxItemDate(oItemBox, "AuthDate", oData, "AuthorizedDate", "existing")

    //Adjustment for field padding and/or border width.
    var iAdjust = 0;
    var iWidthAdjust = -2;
    var iCalAdjust = 23;
    
    //Authorized Date.
    var oItem = document.createElement("INPUT");
    oItem.type = "text";	
    oItem.id = sBoxField;
    if (sUpdateStatus == "insert") {
        oItem.className = "FieldVal";
        AddEvt(oItem, "keydown", SetSave);
        AddEvt(oItem, "blur",    SetChangeToStartDate);
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
    oItem.style.left  = oItemBox.lastChild.offsetLeft + oItemBox.lastChild.offsetWidth - iAdjust + "px";
    oItem.style.width = $(sBoxField + "Hdr").offsetWidth + iWidthAdjust + "px";	
    oItemBox.appendChild(oItem);
            
}
    
//-------------------------------------------------------------------------------------
// Inserts a new Date-specific data item into the Orders box.
//-------------------------------------------------------------------------------------
function PopulateOrderBoxItemDate_OLD(oItemBox, sBoxField, oData, sDataField, sUpdateStatus) {

    //example: PopulateOrderBoxItemDate(oItemBox, "AuthDate", oData, "AuthorizedDate", "existing")

    //Adjustment for field padding and/or border width.
    var iAdjust = 1;
    var iCalAdjust = 23;
    
    //Authorized Date.
    var oItem = document.createElement("INPUT");
    oItem.type = "text";	
    oItem.id = sBoxField;
    if (sUpdateStatus == "insert") {
        oItem.className = "FieldVal";
        AddEvt(oItem, "keydown", SetSave);
        AddEvt(oItem, "blur",    SetChangeToDate);
    }
    else {
        oItem.readOnly = true;
        oItem.className = "FieldValReadOnly Center";
        oItem.tabIndex = -1; //prevent tab stop
    }
    
    var sDateVal = eval("oData." + sDataField);
    var sDateDetailVal = eval("oData." + sDataField + "Detail");
    
    oItem.value = sDateVal;
    oItem.title = sDateDetailVal;
    oItem.setAttribute("LastVal", sDateVal);
    oItem.style.left  = oItemBox.lastChild.offsetLeft + oItemBox.lastChild.offsetWidth - iAdjust + "px";
    oItem.style.width = $(sBoxField + "Hdr").offsetWidth + "px";	
    oItemBox.appendChild(oItem);
            
}    

//-------------------------------------------------------------------------------------
// Populates a Order Status dropdown with valid status values based on pre-determined
// business rules. 
//-------------------------------------------------------------------------------------
function PopulateOrderStatusDropdown(sUserType, oDropdown, sCurrStatus) {

    //alert("sUserType=" + sUserType + ", oDropdown=" + oDropdown.id + ", sCurrStatus=" + sCurrStatus);

    oDropdown.innerHTML = "";
	    
    AddSelectOption(document, oDropdown, " ", 0, 0);
    if (sCurrStatus == "Authorized")
    {
        AddSelectOption(document, oDropdown, "Authorized", "Authorized", 1);
        AddSelectOption(document, oDropdown, "Hold",       "Hold",       2);
        AddSelectOption(document, oDropdown, "Cancelled",  "Cancelled",  3);
    }
    else
    {        
        AddSelectOption(document, oDropdown, "Authorized", "Authorized", 1);
        if (sCurrStatus == "Submitted") AddSelectOption(document, oDropdown, "Submitted",  "Submitted",  2);
        AddSelectOption(document, oDropdown, "Processing", "Processing", 3);
        AddSelectOption(document, oDropdown, "Shipped",    "Shipped",    4);
        AddSelectOption(document, oDropdown, "Delivered",  "Delivered",  5);
        AddSelectOption(document, oDropdown, "Closed",     "Closed",     6);
        AddSelectOption(document, oDropdown, "Hold",       "Hold",       7);
        AddSelectOption(document, oDropdown, "Cancelled",  "Cancelled",  8);
    }
   
    if (sCurrStatus != null) SetSelectValue(oDropdown, sCurrStatus);

}  

//-------------------------------------------------------------------------------------
// Validates change to Order Status.
//-------------------------------------------------------------------------------------
function ValidateChangeToOrderStatus(sNewStatus, sOldStatus) {
    
    var sUserType = $("UserType").value;
    
    if (sUserType == "admin")
    {
        //Admin users can change status to anything.
        return true;
    }
    if (sUserType == "purchaser")
    {
        if (sNewStatus != "Authorized" && sNewStatus != "Hold" && sNewStatus != "Cancelled") 
        {
            var sMsg = "You do not have permission to change the status of an \n";
            sMsg += "order to " + sNewStatus + ". The following status changes are \n";
            sMsg += "allowed by a Purchasing Officer: Hold, Cancelled \n"; 
            alert(sMsg);
            return false;
        }
    }
    else
    {
        var sMsg = "You do not have permission to change the status \n";
        sMsg += "of an order.";
        alert(sMsg);
        return false;
    }
         
    return true;

}  

//-------------------------------------------------------------------------------------
// Displays user info in the header. 
//-------------------------------------------------------------------------------------
function SetUserInfo() {

    var sUserLoginID = $("UserLoginID").value;
    
    if (sUserLoginID == null || sUserLoginID.length == 0)
    {
        $("HdrUserAction").innerHTML = "Sign In";
        //$("HdrUserAction").title = "Click to Sign In";
        //$("HdrUserAction").href = "login.aspx";
        $("HdrUserAction").href = "login.aspx";
    }
    else {
        var sFirstName = $("UserFirstName").value;
        var sLastName  = $("UserLastName").value;
        //$("HdrUserAction").style.width = "160px";
        //$("HdrUserAction").style.height = "20px";
        $("HdrUserAction").innerHTML = "Signed In: " + sFirstName + " " + sLastName;
        //$("HdrUserAction").title = "Click to Sign Out";
        //$("HdrUserAction").href = "logout.aspx";
        $("HdrUserAction").href = "";
    }
    
    AddEvt($("HdrUserAction"), "mouseover", ShowUserInfoMenu);
    
}

//-------------------------------------------------------------------------------------
// Hides menu used for the signed-in user. 
//-------------------------------------------------------------------------------------
function HideUserInfoMenu(e) {

    var evt = window.event || e;
    var oSrc = evt.srcElement || e.target;
    var sType = evt.type || e.type;

    try 
    {
        $("HdrUserAction").style.border = $("HdrUserAction").getAttribute("Border");
        
        var oMenu = $("UserInfoMenu");
        
        var iMaxHeight = parseInt(oMenu.getAttribute("MaxHeight"),10);
        if (oMenu.offsetHeight < iMaxHeight) oMenu.style.height = iMaxHeight + "px";
        
        oMenu.style.visibility = "hidden";
    }
    catch(e) {}
        
}

//-------------------------------------------------------------------------------------
// Animation object for sliding a menu downward. 
//-------------------------------------------------------------------------------------
function MenuSlider(oMenu, iMaxHeight, iStartHeight) 
{
    var Menu = oMenu;
    
    var Max = iMaxHeight;
    var Curr = iStartHeight;  
     
    var IncrementBy = 5;    
    
    //Menu.setAttribute("MaxHeight", Max);
    Menu.style.height = Curr + "px";
    Menu.style.visibility = "visible";
        
    //-------------------------------------------------------------------------------------
    // Initiate the effect.
    //-------------------------------------------------------------------------------------
    this.Init = function() {
        
        Slide();
    }
        
    //-------------------------------------------------------------------------------------
    // Shows content of specified element using sliding effect.
    //-------------------------------------------------------------------------------------
    function Slide() {

        if (Curr >= Max) return;
        
        var iIncr = (Curr + IncrementBy > Max) ? Max - Curr : IncrementBy;
        
        Curr += iIncr;
        
        Menu.style.height = Curr + "px";
        
        //setTimeout(SlideContentDownSlowly, 50);
	    setTimeout(function() {Slide();}, 10); 
    }
    
}

//-------------------------------------------------------------------------------------
// Shows menu for the signed-in user. 
//-------------------------------------------------------------------------------------
function ShowUserInfoMenu(e) {

    var evt = window.event || e;
    var oSrc = evt.srcElement || e.target;
    var sType = evt.type || e.type;

    var oMenu = $("UserInfoMenu");

    //Create the menu, if necessary.
    if (!oMenu) 
    {
        //Hold onto the current border css for the menu bar object.
        oSrc.setAttribute("Border", oSrc.style.border); 
        
        //Create the container for the dropdown menu.
        var oMenu = document.createElement("DIV");
        oMenu.id = "UserInfoMenu";
        oMenu.className = "HdrMenu";
        //oMenu.style.width = "250px";
        //oItemBox.style.border = "solid 1px red";
        oMenu.setAttribute("UserID", $("UserID").value);
        oMenu.setAttribute("UserType", $("UserType").value);
        oMenu.setAttribute("UserFirstName", $("UserFirstName").value);
        oMenu.setAttribute("UserLastName",  $("UserLastName").value);
        $("ContentBox").appendChild(oMenu);
                
        //Insert menu item for signing in/out.
        var oItem = document.createElement("a");
        oItem.id = "SignInMenuItem";
        oItem.tabIndex = -1; //prevent tab stop
        //oItem.className = "HdrMenuItem";
        //oItem.style.width = "100px";
        oItem.innerHTML = "Sign Out"; 
        var sLoc = window.location.href;
        oItem.href = (sLoc.indexOf("admin/") >= 0 ) ? "../../logout.aspx" : "logout.aspx";
        //oItem.title = "Click to Sign Out";
        oMenu.appendChild(oItem);
                
        //Insert menu item for viewing/editting user info.
        var oItem = document.createElement("a");
        oItem.id = "UserInfoMenuItem";
        oItem.tabIndex = -1; //prevent tab stop
        //oItem.className = "HdrMenuItem";
        oItem.innerHTML = "My Profile"; 
        oItem.href = "javascript:ShowUserInfo();";
        oMenu.appendChild(oItem);

        //Add event handler to hide this menu
        AddEvt($("PageHdrBox"), "mouseover", HideUserInfoMenu);
        
        //Save the current height of the menu as an attribute.
        oMenu.setAttribute("MaxHeight", oMenu.offsetHeight);

    }
    
    var iLeft = oSrc.offsetLeft + 50;
    var iTop = oSrc.parentNode.offsetTop + oSrc.offsetTop + oSrc.offsetHeight - ((mbIE) ? 8 : 5);

    oMenu.style.left = iLeft + "px";;
    oMenu.style.top = iTop + "px";

    var iMaxHeight = parseInt(oMenu.getAttribute("MaxHeight"),10);
    var iStartHeight = 1;
    
    //Use slider if this is not IE. 
    if (!mbIE) {
        var oSlider = new MenuSlider(oMenu, iMaxHeight, iStartHeight); 
        oSlider.Init();
    }  
    else {      
        oMenu.style.visibility = "visible";
    }
    
}

//-------------------------------------------------------------------------------------
// Shows dialog/popup for managing the logged-in user's info. 
//-------------------------------------------------------------------------------------
function ShowUserInfo() {
  
    //Popup object/dialog.
    var oPopup = (mbIE) ? $f("EmployeePopup") : $f("EmployeePopup").contentWindow;
        
    goCloak.Show("ContentBox", GetMaxZindex(), "ContentBox");
    
    goCloak.Lighter();
    
    //Set the action to perform if user clicks "Run" in the popup.
    //oPopup.SetProperty("GoCallback", "window.parent.Report_Run();");  
    
    var oSrc = $("HdrUserAction");  
    
    //Calc the position of the popup.
    var iLeft = oSrc.parentNode.offsetLeft + 100;
    if (iLeft < 0) iLeft = 20;
    var iTop = oSrc.parentNode.offsetTop + oSrc.parentNode.offsetHeight + 30;
    if (iTop < 0) iTop = 20;

    //Position and display dialog.
    oPopup.ShowUI(iTop, iLeft, goCloak, $("UserType").value, $("UserID").value, $("UserCompanyID").value, $("UserCompanyName").value, null);

}
   
//} 
//End of grToolkit   