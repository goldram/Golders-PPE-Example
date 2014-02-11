//-------------------------------------------------------------------------------------
//
// Description:	Contains JavaScript specific to admin pages. 
//		  
//-------------------------------------------------------------------------------------

 var mbIE = (!window.addEventListener || navigator.appName.indexOf("Internet Explorer") >= 0) ? true : false;

if (mbIE) {
    window.attachEvent("onload",   InitPage);
    //window.attachEvent("onresize", ResetLayout);
} 
else {
    window.addEventListener("load",   InitPage, false);
    //window.addEventListener("resize", ResetLayout, false);
}

var mbEventHandlersAttached = false; //Ensures event handlers are not attached multiple times.

//-------------------------------------------------------------------------------------
// Attach event handlers to specific elements/objects. 
//-------------------------------------------------------------------------------------
function AttachEventHandlers() {

    //If the event handlers have already been attached, get outta here.
    if (mbEventHandlersAttached) return;
    
    //Attach standard event handlers for input fields. 
    try {
        AttachEventHandlersToFields();
    }
    catch(e) {
        //ignore error
    }
    
    //Page-specific event handlers go here.
    //AddEvt($("XXXXXX"), "mouseover", functionXXXXX);
    
    //AddEvt($("New"), "mouseover", functionXXXXX);
    
    
    
    //Set flag to indicate event handlers have been attached.
    mbEventHandlersAttached = true;
}

//-------------------------------------------------------------------------------------
// Initializes the page, fires immediately after the browser loads and renders page. 
//-------------------------------------------------------------------------------------
function InitPage() {

    SetUserInfo();
    
    //document.getElementById("SignInMenuItem").href = "../../logout.aspx";

    //Attach event handlers on specific page objects/elements.
    AttachEventHandlers();
    
    //var sMsg = "Loading department data, please wait...";
    //SetStatusMsg("StatusMsg", sMsg, "", false, false);
    
	 
}

//-------------------------------------------------------------------------------------
// Shows iframe popup for adding new user/employee.
//-------------------------------------------------------------------------------------
function ShowNewUserUI() {
  
    //Popup object/dialog.
    var oPopup = (mbIE) ? $f("NewEmployeePopup") : $f("NewEmployeePopup").contentWindow;
        
    goCloak.Show("ContentBox", GetMaxZindex(), "ContentBox");
    
    //Set the action to perform if user clicks "Run" in the popup.
    //oPopup.SetProperty("GoCallback", "window.parent.Report_Run();");  
    
    var oSrc = $("HdrUserAction");  
    
    //Calc the position of the popup.
    var iLeft = oSrc.parentNode.offsetLeft + 50;
    if (iLeft < 0) iLeft = 20;
    var iTop = oSrc.parentNode.offsetTop + oSrc.parentNode.offsetHeight + 30;
    if (iTop < 0) iTop = 20;
    
    var sEmployeeType = "admin-new-user"; 
    var sEmployeeID = 0;
    var sCompanyID = 0;
    var sCompanyName = null;

    //Position and display dialog.
    oPopup.ShowUI(iTop, iLeft, goCloak, sEmployeeType, sEmployeeID, sCompanyID, sCompanyName, this, true);

}

//-------------------------------------------------------------------------------------
// Shows ifram popup for editing an existing user/employee.
//-------------------------------------------------------------------------------------
function ShowEditUserUI(sEmployeeID, sEmployeeType, sCompanyID) {
  
    //Popup object/dialog.
    var oPopup = (mbIE) ? $f("EmployeePopup") : $f("EmployeePopup").contentWindow;
        
    goCloak.Show("ContentBox", GetMaxZindex(), "ContentBox");
    
    //Set the action to perform if user clicks "Run" in the popup.
    //oPopup.SetProperty("GoCallback", "window.parent.Report_Run();");  
    
    var oSrc = $("HdrUserAction");  
    
    //Calc the position of the popup.
    var iLeft = oSrc.parentNode.offsetLeft + 50;
    if (iLeft < 0) iLeft = 20;
    var iTop = oSrc.parentNode.offsetTop + oSrc.parentNode.offsetHeight + 30;
    if (iTop < 0) iTop = 20;
    
    var sCompanyName = "";

    //Position and display dialog.
    oPopup.ShowUI(iTop, iLeft, goCloak, sEmployeeType, sEmployeeID, sCompanyID, sCompanyName, this, true);

}


