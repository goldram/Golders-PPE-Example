//-------------------------------------------------------------------------------------
//
// Description:	Contains JavaScript specific to Order Details (order summary and item
// list). 
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

var moOrderSummary = null;
var moOrderItemsList = null;
        
//-------------------------------------------------------------------------------------
// Add new custom product to the Order.
//-------------------------------------------------------------------------------------
function AddCustomProductToOrder(e) 
{
    //	var evt = window.event || e;
    //  var oSrc = evt.srcElement || e.target;
    //  var sType = evt.type || e.type;
    
    //SetStatusMsg("StatusMsg", "Adding item to order...", "", false);
    
    var sProductID = "99999";
    var sProductCategoryID = "99999";
    
    //Build the Order Item record based on the selected Product.
    var sCategory = "custom";
    var sGroup    = "custom";
        
    var sType = (sCategory == sGroup) ? sCategory : sCategory + " - " + sGroup;
    		        
    var oData = {
        "OrderItemID"       : "0",
        "ProductID"         : "99999", 
        "ProductCategoryID" : "99999", 
        "ProductCategory"   : "enter product type", 
        "ProductGroupID"    : "99999", 
        "ProductGroup"      : "custom", 
        "SKU"               : "99999", 
        "Brand"             : "custom brand", 
        "ProductName"       : "enter product name", 
        "ProductDesc"       : "enter product description", 
        "Gender"            : "B", 
        "ItemStatus"        : "pending", 
        "DeliverDate"       : "",
        "DeliverDateDetail" : "",
        "DeliverMethod"     : "",
        "Qty"               : "1", 
        "Size"              : "enter size", 
        "Color"             : "enter color"
        //,
        //"Comments"          : $field("Comments",oProductBox).value 
    }
        
    moOrderItemsList.AddOrderItem(oData, true);
            
    //var sMsg = "Custom product added to the order.";
    //SetStatusMsg("StatusMsg", sMsg, "", false, true);
}
    
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
// Hide calendar popup.
//-------------------------------------------------------------------------------------
function CalendarPopup_ApplyChange() {

    var sNewDate = moCalendarDateField.value;
    var sOldDate = moCalendarDateField.getAttribute("LastVal");
    
    //If the new date is the same as the old date, do nothing.
    if (sNewDate == sOldDate) {
        CalendarPopup_Hide();    
        return;
    }
    
    //Set Exam Retire date and time to defaults.
    //if (moCalendarDateField.id == "ExamDate") Exam_SetExpireDateDefault(moCalendarDateField);

    //Set the correct color code for the new date.
    //moCalendarDateField.style.color = GetDateColorCode(moCalendarDateField.innerHTML);
    
    //Change color of cell.
    //moCalendarDateField.style.backgroundColor = msModifiedCellColor;
    
    //Tweak forecolor for "overdue" dates.
    //if (moCalendarDateField.style.color == "white") moCalendarDateField.style.color = "red";
    
    //Turn SAVE PENDING indicators on.
    moOrderSummary.SetSaveInit();
    
    //Set data item status to "update".
    moOrderSummary.SetDataBoxItemStatusInit(moCalendarDateField);
        
    CalendarPopup_Hide();    
}

//-------------------------------------------------------------------------------------
// Hide calendar popup.
//-------------------------------------------------------------------------------------
function CalendarPopup_Hide() {

    try {
        //alert("Hiding calendar...");
        $("CalendarPopup").style.visibility = "hidden";
        $("CalendarPopup").style.display = "none";
    }
    catch (e) {
        //ignore error
        //alert("Calendar could not be hidden");
    }
}
   
//-------------------------------------------------------------------------------------
// Shows the calendar popup.
//-------------------------------------------------------------------------------------
function CalendarPopup_Show(e) {

    var evt = window.event || e;
    var oSrc = evt.srcElement || e.target;
    var sType = evt.type || e.type;
    
    //Calc the position of the popup.
    if (e.pageX) {
        //FF
        var iLeft = e.pageX + window.pageXOffset - 5;
        var iTop = e.clientY + window.pageYOffset - 5;
    } 
    else 
    if (e.clientX) {
        //Other IE
        var iLeft = e.clientX + document.body.scrollLeft - 5;
        var iTop = e.clientY + document.body.parentElement.scrollTop - 5;
    } 
    else {
        alert("Unable to determine position for caledar.");
    }
	
    //Save reference to date field.
    moCalendarDateField = oSrc.previousSibling;	  
        
    //iHeight = 260;
    //iWidth = 200;

    //Get reference to the iframe container for the calendar object.
    var oPopup = $("CalendarPopup");

    //Set some custom properties so we can retain some info about the source.
    //oPopup.setAttribute("TargetField", oSrc.parentNode);
    oPopup.setAttribute("TargetField", oSrc);
    oPopup.setAttribute("InputRowIndex",  oSrc.getAttribute("RowIndex"));
    oPopup.setAttribute("InputColIndex",  oSrc.getAttribute("ColIndex"));
    //oPopup.style.left = oSrc.parentElement.offsetLeft + oSrc.offsetLeft + 15 + "px";
    
    //Get reference to the calendar object.
    oCalendar = (mbIE) ? $f("CalendarPopup") : $f("CalendarPopup").contentWindow;
    
    //Create/build the calendar object.
    oCalendar.showCalendarControl(moCalendarDateField);
      
    //Get height and width of the calendar object so we know how to size the popup 
    //(note: popup "display" style must not be "none" at this point).
    oPopup.style.display = "inline";
    var iWidth = oCalendar.document.getElementById("CalendarControlTable").offsetWidth;
    var iHeight = oCalendar.document.getElementById("CalendarControlTable").offsetHeight;
    
    //Set the position and size of the popup container for the calendar object.
    oPopup.style.left = iLeft + "px";
    oPopup.style.top = iTop + "px";
    oPopup.style.height = iHeight + "px";
    oPopup.style.width = iWidth + "px";
    
    //Show the calendar.
    oPopup.style.visibility = "visible";

//    if (mbIE) {
//        oPopup.focus();
//    }
//    else {
//        setTimeout('$("CalendarPopup").focus()', 250);
//    }
        
    //AddEvt(oSrc.parentNode, "mouseover", CalendarPopup_Hide);
   
    
}     
   
//-------------------------------------------------------------------------------------
// Cancels change to either the Order Summary or the Order Items. 
//-------------------------------------------------------------------------------------
function CancelChanges_NOT_USED() {

    //If no changes pending, display message and get outta here.
    if (!moOrderSummary.IsSavePending() && !moOrderItemsList.IsSavePending()) {
        sMsg = "There are no unsaved changes pending. ";
        alert(sMsg);
        //SetStatusMsg("StatusMsg", sMsg, "", true, true, "", 4000);
        return;
    }
        
    //Verify CANCEL action.
    var sMsg = "Are you sure you want to cancel your changes? \n";
    if (!confirm(sMsg)) return;
    
    moOrderSummary.CancelChangesInit();
    
    moOrderItemsList.CancelChangesInit();

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
    
    AddEvt($("ContentBox"), "mouseover", CalendarPopup_Hide);
    
    var sOrderID = ($("OrderID")) ? $("OrderID").value : "0";
    
    //Create objects for Order Summary and Order Items.
    moOrderSummary = new OrderSummary();
    moOrderItemsList = new OrderItemList();
    
    //Initiate retrieval of Order Summary.
    moOrderSummary.Init(sOrderID, moOrderItemsList);
        
    //Initiate retrieval of Orders Items.
    moOrderItemsList.Init(sOrderID, moOrderSummary);
 	    
   
    setTimeout('ShowTab("TabSummary")', 3000);
}

//-------------------------------------------------------------------------------------
// Initializes proecess for selecting products to add to the order. A timer is used 
// here to allow the message to be displayed.
//-------------------------------------------------------------------------------------
function InitProductsUI(e) {
    
    moOrderItemsList.SetStatusMsgForProductsLoading(false);
    
    setTimeout(ShowProductsUI, 1000);

}
   
//-------------------------------------------------------------------------------------
// Refreshes the Order Summary and Order Items list. 
//-------------------------------------------------------------------------------------
function RefreshOrder() {

    var sOrderID = ($("OrderID")) ? $("OrderID").value : "0";
    
	if (!sOrderID || sOrderID == 0)  
	{
	    alert("Order ID is missing or unknown. Action cancelled.");
	    return;
	}
        
    //If changes have not been saved, display message and get outta here.
    if (moOrderSummary.IsSavePending() || moOrderItemsList.IsSavePending()) {
        sMsg = "There are unsaved changes pending. Please save or cancel your changes. ";
        alert(sMsg);
        //SetStatusMsg("StatusMsg", sMsg, "", true, true, "", 4000);
        return;
    }
    
    moOrderSummary.RefreshInit();
    
    moOrderItemsList.RefreshInit();

}
   
//-------------------------------------------------------------------------------------
// Displays user interface for selecting products to add to the order. 
//-------------------------------------------------------------------------------------
function ShowProductsUI() {

    var oBox = $("OrderItemsBox");
    
    var iLeft = 0;
    var iTop = oBox.offsetTop + $("ContentBox").scrollTop - oBox.offsetHeight + 100;
    
    moProducts = new ProductsAvail();
    
    //Initialize the user interface (could take some time to load all the items).
    moProducts.InitUI(moOrderSummary, moOrderItemsList);
    
    //Show user interface.
    moProducts.ShowUI(iLeft, iTop);

}
 
//-------------------------------------------------------------------------------------
// Displays the appropriate content based on the tab clicked.
//-------------------------------------------------------------------------------------
function ShowTab(sClickedTab) {

//    var evt = window.event || e;
//    var oSrc = evt.srcElement || e.target;
//    var sType = evt.type || e.type;

//    var sClickedTab = oSrc.id;
   
    //alert(sClickedTab);
    
    $("OrderSummaryBox").style.display = (sClickedTab == "TabSummary") ? "block" : "none";
    $("OrderItemsBox").style.display   = (sClickedTab == "TabItems")   ? "block" : "none";
    
    $("TabSummary").className = (sClickedTab == "TabSummary") ? "TabActive" : "TabInactive";
    $("TabItems").className   = (sClickedTab == "TabItems")   ? "TabActive" : "TabInactive";
   
}


