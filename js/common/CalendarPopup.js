var moCalendarDateField;
var moCalendarPopup;
//var msCalendarSource = "<html><head><title></title><link rel='stylesheet' type='text/css' href='Stylesheets/Common/CalendarControl.css'><script language='javascript' type='text/javascript' src='Scripts/Common/CalendarControl.js'></script></head><body><span id='CalendarControl'></span></body></html>";
var msCalendarSource = "<head><title></title><link rel='stylesheet' type='text/css' href='css/common/CalendarControl.css'><script language='javascript' type='text/javascript' src='Scripts/Common/CalendarControl.js'></script></head><body><span id='CalendarControl'></span></body>";

//-------------------------------------------------------------------------------------
// Hides the popup window object.
//-------------------------------------------------------------------------------------
function HidePopup() {

    moCalendarPopup.hide();
    
    document.body.focus();
}

//-------------------------------------------------------------------------------------
// Displays calendar control as popup object for Support Box Report Filter UI. 
//-------------------------------------------------------------------------------------
function ShowCalendar(e) {

	var evt = window.event || e;
	var oSrc = evt.srcElement || e.target;
	var sType = evt.type || e.type;

    //var oInput = document.getElementById(oSrc.Input);

    //var oInput = event.srcElement;

    //if(oInput.disabled == true) {
    //    return;
    //}

    //Save reference to date field.
    moCalendarDateField = oSrc;
    
    //Create the popup object.
    //moCalendarPopup = window.createPopup();

    //Load the calendar control into it.
    //moCalendarPopup.document.write(msCalendarSource);
    
    //Popup object/dialog.
    moCalendarPopup = (mbIE) ? $f("CalendarPopup") : $f("CalendarPopup").contentWindow;
    
    moCalendarPopup.showCalendarControl(moCalendarDateField);

}

//-------------------------------------------------------------------------------------
// Shows the popup window object.
//-------------------------------------------------------------------------------------
function ShowPopup() {
    
    //Get height and width.
    var iHeight = moCalendarPopup.document.getElementById("CalendarControl").offsetWidth;
    var iWidth = moCalendarPopup.document.getElementById("CalendarControl").offsetHeight;
    
    //Calc the position of the popup.
    if (e.pageX) {
        //FF
        var iLeft = e.pageX + window.pageXOffset - 10;
        var iTop = e.clientY + window.pageYOffset - 5;
    } 
    else if(e.clientX) {
        //Other IE
	    var iLeft = e.clientX + document.body.scrollLeft - 10;
	    var iTop = e.clientY + document.body.parentElement.scrollTop - 5;
    } 
    else {
        alert("Unable to determine position for caledar.");
    }

    var oPopup = $("CalendarPopup");

    //oPopup.setAttribute("TargetField", oSrc.parentNode);
    oPopup.setAttribute("TargetField", oSrc);
    oPopup.setAttribute("InputRowIndex",  oSrc.getAttribute("RowIndex"));
    oPopup.setAttribute("InputColIndex",  oSrc.getAttribute("ColIndex"));
    //oPopup.style.left = oSrc.parentElement.offsetLeft + oSrc.offsetLeft + 15 + "px";
    oPopup.style.left = iLeft + "px";
    oPopup.style.top = iTop + "px";
    oPopup.style.height = iHeight + "px";
    oPopup.style.width = iWidth + "px";
    oPopup.style.visibility = "visible";
    oPopup.style.display = "inline";

//    if (mbIE) {
//        oPopup.focus();
//    }
//    else {
//        setTimeout('$("BillingTypePopup").focus()', 250);
//    }
        
    //AddEvt($("DetailCurrRptDataTable"), "mouseover", BillingTypePopup_Hide);
    
    
    
    
    
}

