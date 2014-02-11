
//-------------------------------------------------------------------------------------
//
// Description:	Contains JavaScript functions specific to user interface "fields" which
//              are elements/objects that display data or accept user input.
//
//------------------------------------------------------------------------------------- 

//Default and highlight colors for input fields and action fields/links.
var msFieldValueDefaultColor  = "rgb(30,103,168)";
var msFieldBorderDefaultColor = null;          
var msFieldBorderHiliteColor  = "orange";          
var msActionDefaultColor      = "blue";          
var msActionHiliteColor       = "orange"; 

//Object used for field-level messages.
function UIFieldMsg(sFieldID, bShow, oRef, sLocation, sMsgType, sMsgText) {
    
    this.FieldID    = sFieldID;
    this.Show       = bShow;
    this.Ref        = oRef;
    this.Location   = sLocation;
    this.MsgType    = sMsgType;
    this.MsgText    = sMsgText;

}         

//-------------------------------------------------------------------------------------
// Automatically enable or disable tabbing for specific UI elements/objects based on the
// order they appear in the page in conjunction with the element's class name. 
//
// Note: This function assumes a fairly basic top-to-bottom page layout using the CSS
// rules identified in the UIFields stylesheet. Furthermore, this function relies on the 
// page elements to be rendered in the same order in which they appear on the page.
// In some cases the browser may not render the items in the same order in which the 
// elements occur in the file. As a result, you may need to bypass use of this 
// function and assign tab indexes explicitly.
//-------------------------------------------------------------------------------------
function AssignTabIndexes() {

    var iTab = 0;
    var oFields = document.getElementsByTagName("*");

    for (var i=0; i<oFields.length; i++) {
        var sClass = oFields[i].className;
        if (sClass == "FieldValReadOnly") continue;
        if (sClass.substr(0,8) == "FieldVal" || 
            sClass == "FieldAction" || 
            sClass == "ActionLink") 
        {
            iTab++;
            oFields[i].tabIndex = iTab;
        }    
    }

}

//-------------------------------------------------------------------------------------
// Attach event handlers to specific elements/objects. 
//-------------------------------------------------------------------------------------
function AttachEventHandlersToFields(bForce) {

    //If the event handlers have already been attached, get outta here.
    if (mbEventHandlersAttached && !bForce) return;

    mbEventHandlersAttached = true;
    
    //Set-up input field highlighting and SAVE PENDING trigger.
    var aTags = new Array("INPUT", "SELECT", "TEXTAREA", "DIV");
    for (var t=0; t<aTags.length; t++) {
        var oFields = document.getElementsByTagName(aTags[t]);
        for (var i=0; i<oFields.length; i++) {
            var oField = oFields[i];
            //if (oField.className.substr(0,8) == "FieldVal") {
            if (oField.className.indexOf("FieldVal") >= 0) {
                if (oField.type == "select-one") {
                    //alert("SetSave set for SELECT onchange on: " + oField.id);
                    oField.onchange = SetSave;
                    oField.onchange = ClearStatusMsg;
                    oField.onfocus = SetInputFieldHilite;
                    oField.onblur = SetInputFieldHilite;
                    //NOTE: Next line prevents inadvertant scrolling by the user. Use caution 
                    //when enabling this functionality since it will disrupt normal tabbing 
                    //sequence.
                    //oField.onchange =  RemoveElementFocus;
                }
                else if ((oField.type == "text") || (oField.type == "textarea")) {
                    //alert("SetSave set for TEXTAREA or INPUT onkeydown on: " + oField.id);
                    oField.onkeydown = SetSave;
                    oField.onkeydown = ClearStatusMsg;
                    oField.onfocus = SetInputFieldHilite;
                    oField.onblur = SetInputFieldHilite;
                    //Check for numeric, date, or money input formats.
                    if (oField.className == "FieldValNumeric") {
                        oField.onkeypress = KeyNumericOnly;
                    }
                    else if (oField.className == "FieldValDate") {
                        oField.onkeypress = KeyDateOnly;
                    }
                    else if (oField.className == "FieldValMoney") {
                        oField.onkeypress = KeyMoneyOnly;
                    }
                }
                else if (oField.type == "checkbox") {
                   // alert("SetSave set for checkbox onclick on: " + oField.id);
                    oField.onclick = SetSave;
                    oField.onclick = ClearStatusMsg;
                }
                else if (oField.tagName == "DIV") { //Div containers
                    oField.onfocus = SetInputFieldHilite;
                    oField.onblur = SetInputFieldHilite;
                    oField.hideFocus = true;
                }
                else {
                    alert("Unable to set event handlers on input field type: " + oField.type);
                }
            }
        }
    }
}

//-------------------------------------------------------------------------------------
// Unchecks all checkboxes in the specified parent element. 
//-------------------------------------------------------------------------------------
function ClearAllCheckboxes(oParent) {
    
    for (var i=0; i<oParent.children.length; i++) {
        var oChild = oParent.children(i);
        if ((oChild.type == "checkbox") && (oChild.checked)) {
            oChild.checked = false; 
        } 
    }
}

//-------------------------------------------------------------------------------------
// Returns the number of checkboxes checked for the specified group/box of checkboxes. 
//-------------------------------------------------------------------------------------
function GetCheckedCount(oParent) {

    var iCnt = 0;
    
    for (var i=0; i<oParent.childNodes.length; i++) {
        var oChild = oParent.childNodes[i];
        if ((oChild.type == "checkbox") && (oChild.checked)) iCnt++;  
    }
    
    return iCnt;
}

//-------------------------------------------------------------------------------------
// Allows only date-oriented characters (numbers and forward slash "/"). 
//-------------------------------------------------------------------------------------
function KeyDateOnly(e) {

	var evt = window.event || e;
	var oSrc = evt.srcElement || e.target;
	var sType = evt.type || e.type;

    var iKeyCode = evt.keyCode || evt.which;  
    
    //$("PageHdrTitle").innerHTML = "keycode = " + iKeyCode + ", charcode = " + evt.charCode;      
    
    //alert("keycode = " + iKeyCode );

    if (iKeyCode >= 48 && iKeyCode <= 57) {
        //Allow numbers
    }
    else if (iKeyCode == 47) {
        //Allow forward slash ("/")
    }
    else if (iKeyCode == 8) {
        //Allow backspace key in Firefox
    }
    else if (iKeyCode == 9) {
        //Allow tab key in Firefox
    }
    else if (iKeyCode == 46 && evt.charCode == 0) {
        //Allow delete key in Firefox
    }
    else if (iKeyCode == 37 && evt.charCode == 0) {
        //Allow left arrow key in Firefox
    }
    else if (iKeyCode == 39 && evt.charCode == 0) {
        //Allow right arryow key in Firefox
    }
    else {
        //alert("Cancelling keystroke! keyCode = " + iKeyCode);
        if (window.event) {
            evt.keyCode = "";
        }
        else {
            evt.preventDefault();
        }
    } 
}

//-------------------------------------------------------------------------------------
// Allows only money-oriented characters (numbers and decimal "."). 
//-------------------------------------------------------------------------------------
function KeyMoneyOnly(e) {

	var evt = window.event || e;
	var oSrc = evt.srcElement || e.target;
	var sType = evt.type || e.type;
    var iKeyCode = evt.keyCode || evt.which;  
        
    //$("PageHdrTitle").innerHTML = "keycode = " + iKeyCode + ", charCode = " + evt.charCode;

    if (iKeyCode == 8) {
        //Allow backspace key in Firefox
    }
    else if (iKeyCode == 9) {
        //Allow tab key in Firefox
    }
    else if (iKeyCode == 37 && evt.charCode == 0) {
        //Allow left arryow key in Firefox
    }
    else if (iKeyCode == 39 && evt.charCode == 0) {
        //Allow right arryow key in Firefox
    }
    else if (iKeyCode == 44) {
        //Allow comma
    }
    else if (iKeyCode == 45) {
        //Allow negative sign
    }
    else if (iKeyCode == 46) {
        //Allow decimal/period (".") and delete key
    }
    else if (iKeyCode >= 48 && iKeyCode <= 57) {
        //Allow numbers
    }
    else {
        //alert("Cancelling keystroke! keyCode = " + iKeyCode);
        if (window.event) {
            evt.keyCode = "";
        }
        else {
            evt.preventDefault();
        }
    } 
}

//-------------------------------------------------------------------------------------
// Allows only numeric characters and commas (",") for thousands separator.
//-------------------------------------------------------------------------------------
function KeyNumericOnly(e) {

	var evt = window.event || e;
	var oSrc = evt.srcElement || e.target;
	var sType = evt.type || e.type;
    var iKeyCode = evt.keyCode || evt.which;  
    
    if (iKeyCode >= 48 && iKeyCode <= 57) {
        //Allow numbers
    }
    else if (iKeyCode == 44) {
        //Allow comma
    }
    else if (iKeyCode == 8) {
        //Allow backspace key in Firefox
    }
    else if (iKeyCode == 9) {
        //Allow tab key in Firefox
    }
    else if (iKeyCode == 46 && evt.charCode == 0 ) {
        //Allow delete key in Firefox
    }
    else if (iKeyCode == 37 && evt.charCode == 0) {
        //Allow left arryow key in Firefox
    }
    else if (iKeyCode == 39 && evt.charCode == 0) {
        //Allow right arryow key in Firefox
    }
    else {
        if (window.event) {
            evt.keyCode = "";
        }
        else {
            evt.preventDefault();
        }
    } 
}

//-------------------------------------------------------------------------------------
// Adds or removes highlighting for an input field element.
//-------------------------------------------------------------------------------------
function SetInputFieldHilite(e) {

	var evt = window.event || e;
	var oSrc = evt.srcElement || e.target;
	var sType = evt.type || e.type;
	
    if (sType == "focus") {
        if (msFieldBorderDefaultColor == null) msFieldBorderDefaultColor = oSrc.style.borderColor; 
        oSrc.style.borderColor = msFieldBorderHiliteColor;
    }
    else {
        try {
            oSrc.style.borderColor = msFieldBorderDefaultColor;
        }
        catch(e) {
            //ignore error
        }
    }      
}

//-------------------------------------------------------------------------------------
// Cancel user update action.
//-------------------------------------------------------------------------------------
function UserInputCancel() {
	
	//Cancel keystroke.
	event.returnValue = false;
}

//-------------------------------------------------------------------------------------
// Disable editting for the specified input element.
//-------------------------------------------------------------------------------------
function UserInputDisable(oThat) {

	//Get the current height of the object so we can reset it later. Changing the 
	//className property will cause the height attribute to be lost.  
	var iHeight = oThat.offsetHeight;
	
    oThat.attachEvent('onkeydown', UserInputCancel);
    oThat.style.height = "18px";
    oThat.style.cursor = "default";
    oThat.style.color = "black";
    oThat.tabIndex = -1;
    oThat.hideFocus = true;
        
    oThat.detachEvent('onmouseover', UserInputHilite);
    oThat.detachEvent('onmouseout',  UserInputHilite);
    oThat.detachEvent('onclick',     UserInputShow);
	
    var oThatInput = $(oThat.id + "Input");
    oThatInput.detachEvent("onblur", UserInputSave); 
}

//-------------------------------------------------------------------------------------
// Enables user editting for the specified object.
//-------------------------------------------------------------------------------------
function UserInputEnable(oThat, sCustomHandler) {
	
	if (oThat.getAttribute("InputEnabled") == "Y") return; 
	
	oThat.attachEvent('onmouseover', UserInputHilite);
	oThat.attachEvent('onmouseout',  UserInputHilite); 
	oThat.attachEvent('onclick',     UserInputShow); 
	
	if (sCustomHandler) oThat.setAttribute("CustomHandler", sCustomHandler);
	
    var oThatInput = $(oThat.id + "Input");
    
    //Attach event handler to save/store the changed value and make any needed UI change(s).
    if (oThatInput.tagName == "SELECT") {
        oThatInput.attachEvent("onchange", UserInputSave); 
        oThatInput.attachEvent("onblur", UserInputHide);
    }
    else { 
        oThatInput.attachEvent("onblur", UserInputSave); 
    }
    
    oThat.setAttribute("InputEnabled","Y");
}

//-------------------------------------------------------------------------------------
// Hides a dynamic user input field.
//-------------------------------------------------------------------------------------
function UserInputHide(e) {

	var evt = window.event || e;
	var oSrc = evt.srcElement || e.target;
	var sType = evt.type || e.type;
    
	//Hide the shadow object.
    with (oSrc) {	
	    style.visibility = "hidden";
	    style.display = "none";
    }
}

//-------------------------------------------------------------------------------------
// Highlights a dynamic user input field.
//-------------------------------------------------------------------------------------
function UserInputHilite(e) {

	//Cancel user action?
	//if (!mbAllowUserActions) return;
	
	var evt = window.event || e;
	var oSrc = evt.srcElement || e.target;
	var sType = evt.type || e.type;

	with (oSrc) {
		if (sType == "mouseover") {
		    style.color = msActionHiliteColor;
		}    
		else if (sType == "mouseout") {
		    style.color = msActionDefaultColor;
		}    
    }		    
}

//-------------------------------------------------------------------------------------
// Transfers user input from the "shadow" object to the "display" object.
//-------------------------------------------------------------------------------------
function UserInputSave(e) {

	//Get the name of the object that triggered the event.
	var evt = window.event || e;
	var oSrc = evt.srcElement || e.target;
	var sType = evt.type || e.type;
	
	//Get the name of the source object. This assumes the name of the source object is 
	//the name of the shadow object with the "Input" suffix stripped off.
	var sName = oSrc.id;
	var i = sName.indexOf("Input");
	if (i >= 0) sName = sName.substr(0,i);
	
	//Get the new value.
	oDisplayed = document.all(sName);
	var sNewValue = "";
	var sNewID = "";
	if (oSrc.tagName == "SELECT") {
		if (oSrc.selectedIndex >= 0) {
		    sNewValue = oSrc.item(oSrc.selectedIndex).text;
		    sNewID = oSrc.value;
		}
	}
	else {
		sNewValue = oSrc.value;
		sNewID = "";
	}

	//Determine if the user input is different from the original value.
	if (oDisplayed.innerText != sNewValue) {
	    if (oDisplayed.getAttribute("CustomHandler")) {
	        eval(oDisplayed.getAttribute("CustomHandler"));
	    }
	    else {
	        oDisplayed.innerText = sNewValue;
		}
		if (oDisplayed.innerText == "") oDisplayed.innerText = "(enter value)";	
	}

	//Hide the shadow object.
	oSrc.style.visibility = "hidden";
	oSrc.style.display = "none";
}

//-------------------------------------------------------------------------------------
// Displays an object for user input.
//-------------------------------------------------------------------------------------
function UserInputShow(e) {

	//Get the name of the object that triggered the event.
	var evt = window.event || e;
	var oSrc = evt.srcElement || e.target;
	var sType = evt.type || e.type;
	
	//Determine the user input object. This assumes the name of the user input object 
	//is the name of the source object with the text "Input" appended to it.
	var sName = oSrc.id + "Input";
	var oInput = document.all(sName) || document.getElementsByTagName("*")[sName];
	
	//Transfer value of the source object to the user input object and allow the user 
	//to see it.
	if (oInput.tagName == "SELECT") {
        SetSelectText(oInput, oSrc.innerText);
		oInput.style.left = oSrc.offsetLeft;
		oInput.style.top  = oSrc.offsetTop;	
		oInput.style.width = oSrc.offsetWidth + 45;
		oInput.style.visibility = "visible";
		oInput.style.display = "inline";
		oInput.focus(); 
	}
	else {
		oInput.value = oSrc.innerText;
		oInput.style.left = oSrc.offsetLeft;
		oInput.style.top  = oSrc.offsetTop;	
		//oInput.style.height = oSrc.offsetHeight;
		oInput.style.width = oSrc.offsetWidth;
		oInput.style.visibility = "visible";
		oInput.style.display = "inline";
		oInput.focus(); 
		oInput.select(); 
	}
}
