//-------------------------------------------------------------------------------------
//
// Description:	Contains JavaScript specific to managing an order's 
// details (i.e. everything but the Order Items). 
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
    if (!moOrderSummary.IsSavePending()) {
        sMsg = "There are no unsaved changes pending. ";
        alert(sMsg);
        //SetStatusMsg("StatusMsg", sMsg, "", true, true, "", 4000);
        return;
    }
        
    //Verify CANCEL action.
    var sMsg = "Are you sure you want to cancel your changes? \n";
    if (!confirm(sMsg)) return;
    
    moOrderSummary.CancelChangesInit();

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
    
    AddEvt($("ContentBox"), "mouseover", CalendarPopup_Hide);
    
    var sOrderID = ($("OrderID")) ? $("OrderID").value : "0";
    
    //Create objects for Order Summary and Order Items.
    moOrderSummary = new OrderSummary();
    
    //Initiate retrieval of Order Summary.
    moOrderSummary.Init(sOrderID);
   
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
    if (moOrderSummary.IsSavePending()) {
        sMsg = "There are unsaved changes pending. Please save or cancel your changes. ";
        alert(sMsg);
        //SetStatusMsg("StatusMsg", sMsg, "", true, true, "", 4000);
        return;
    }
    
    moOrderSummary.RefreshInit();

}
 


