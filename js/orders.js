//-------------------------------------------------------------------------------------
//
// Description:	Contains JavaScript specific to Purchase Officer order management. 
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

var mbSaveUsingProxy = false;
var mbSavePending = false;
var mbSaving = false;
var mbSaveAndClear = false;
var mbSettingFieldValues = false;

var mbEventHandlersAttached = false; //Ensures event handlers are not attached multiple times.

var mbPurchaserInfoLoaded = false;

var moPurchaser = null;
var moOrderList = null;
var moNewOrder = null;

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

    //Automatically assign tab indexes.
    //AssignTabIndexes();
	
    //Attach event handlers on specific page objects/elements.
    AttachEventHandlers();
    
    //var sMsg = "Loading department data, please wait...";
    //SetStatusMsg("StatusMsg", sMsg, "", false, false);
    
    //Add event handler to primary box to make sure calendar object is hidden if 
    //the user moves off the calendar.
    //AddEvt($("AdminBox"),   "mouseover", CalendarPopup_Hide);
    //AddEvt($("DeptBox"),    "mouseover", CalendarPopup_Hide);
    
    //Retrieve Authorizer's information.
    //moPurchaser = new Purchaser();
    //moPurchaser.Retrieve($("UserID").value);
    
    //Retrieve Orders list for the Purchaser.
    moOrderList = new OrderList();
    moOrderList.InitUI($("UserType").value);
  
    //Retrieve Purchaser info.
    //PurchaserInfo_DBGet();
	 
}

//-------------------------------------------------------------------------------------
// Displays user interface for authorizing a new order. 
//-------------------------------------------------------------------------------------
function InitNewOrder() {
    
    //New object.
    if (!moNewOrder) moNewOrder = new AuthorizeNewOrder();
    
    //Initialize user interface with data and initial settings.
    var sCompanyID   = ($("UserType").value == "admin") ? $("CompanyFilter").value : $("UserCompanyID").value;
    var sCompanyName = ($("UserType").value == "admin") ? GetSelectText($("CompanyFilter")) : $("UserCompanyName").value;
    moNewOrder.InitUI(sCompanyID, sCompanyName);

    //Popup position.
    var oBox = $("ActionNewOrder").parentNode.parentNode;
    var iTop  = oBox.offsetTop + 10;
    var iLeft = oBox.offsetLeft + 200;

    //Show user interface.
    moNewOrder.ShowUI(iTop, iLeft);

}

//-------------------------------------------------------------------------------------
// Refreshes the order list. 
//-------------------------------------------------------------------------------------
function RefreshOrderList() {
    
    moOrderList.RefreshInit();

}

