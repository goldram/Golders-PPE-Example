//----------------------------------------------------------------------------------
//
// Author: GoldRam Systems (Dan Carlson)
//
// Description:	Contains various functions used to manipulate DHTML elements.
//
//--------------------------------------------------------------------------------- -->

//-------------------------------------------------------------------------------------
// Helper/refactored function to return a reference to a HTML/DOM element based on the
// elements ID property. Assumes the current DOM document is the parent/container; if 
// this is not the case, pass the parent/container using the second argument.
//-------------------------------------------------------------------------------------
function $(sID, oParent, bIFrame) {

    try {
		if (bIFrame == true) {
			return oParent.frames(sID);	
		}
		else {
			return (oParent) ? oParent.children(sID) : document.getElementById(sID);
		}
    }
    catch(e) {
        return null;
    }
}

//-------------------------------------------------------------------------------------
// Browser compatible function for using XML attribute names. Firefox converts all
// attribute names in XML data to lowercase.	
//-------------------------------------------------------------------------------------
function $attr (sAttributeName) {

	if (window.addEventListener) 
    {
        //Firefox, Mozilla
        return sAttributeName.toLowerCase();
    } 
    else 
    {
       //IE
       return sAttributeName;
    }
}

//-------------------------------------------------------------------------------------
// Browser independent (IE, FF) helper function to return a reference to the specified 
// iFrame element. 
//-------------------------------------------------------------------------------------
function $f(sFrame, bParent) {

    try 
    {
		if (bParent)
		{
			return parent.document.frames[sFrame];
		}
		else
		{
			return document.frames[sFrame];
		}
	}
	catch(e)
	{
		if (bParent)
		{
			return parent.document.getElementById(sFrame);
		}
		else
		{
			return document.getElementById(sFrame);
		}
	}
}

//-------------------------------------------------------------------------------------
// Browser independent (IE, FF) helper function to return a reference to the specified 
// iFrame element. 
//-------------------------------------------------------------------------------------
function $fxxxxxxxxxxxxxxxxxx(sFrame) {

    try 
    {
		return document.frames[sFrame];
	}
	catch(e)
	{
		return $(sFrame);    
	}
}

//-------------------------------------------------------------------------------------
// Browser independent (IE, FF) helper function to return a reference to an object 
// contained within the specified iFrame element. 
//-------------------------------------------------------------------------------------
function $fo(sFrame, sChild) {

    try 
    {
		return document.frames[sFrame][sChild];
	}
	catch(e)
	{
		return $(sFrame).contentDocument.getElementById(sChild);    
	}
}

//-------------------------------------------------------------------------------------
// Function:	AddSelectOption
//
// Synopsis:	Adds a option element to a select element	
//
// Arguments:	oDocument	Reference to a HTML document in a given browser window. 
//					oSelect		Reference to a list box or drop-down list.
//					sText			Text to be displayed.	
//					sValue		Value associated with text.
//
// Returns:		none
//
// Notes:		none
//
//-------------------------------------------------------------------------------------
function AddSelectOption (oDocument, oSelect, sText, sValue, lIndex) {
	
	var oNewOp;

	if (lIndex == null) lIndex = 0; 	
	
	oNewOp = oDocument.createElement("OPTION");
	oSelect.options.add(oNewOp, lIndex);
	oNewOp.text  = sText;
	oNewOp.value = sValue;
}

//-------------------------------------------------------------------------------------
// Browser compatible function for attaching an event handler to an object.	
//-------------------------------------------------------------------------------------
function AddEvt (oObj, sEvent, oHandler) {

	if (window.addEventListener) 
    {
        //Firefox/Mozilla
        oObj.addEventListener(sEvent, oHandler, false);
    } 
    else 
    {
       //IE
       oObj.attachEvent("on"+sEvent, oHandler);
    }
}

//-------------------------------------------------------------------------------------
// Function:	CalcPercentage
//
// Synopsis:	Calculates a percentage.	
//
// Arguments:	fNumerator
//				fDenominator
//
// Returns:		Pecentage.
//
// Notes:		none
//
//-------------------------------------------------------------------------------------
function CalcPercentage(fNumerator, fDenominator) {

	fNumerator = parseFloat(fNumerator);
	fDenominator = parseFloat(fDenominator);

	if (fDenominator == 0) {
		return 0;
	}
	else {
		return (fNumerator / fDenominator) * 100;
	}
}

//-------------------------------------------------------------------------------------
// Function:	DeleteArrayElement
//
// Synopsis:	Deletes an item from an array.	
//
// Arguments:	oArray		Array of items.
//				iElement	Element to be deleted.
//
// Returns:		none
//
// Notes:		none
//
//-------------------------------------------------------------------------------------
function DeleteArrayElement(oArray, iElement) {

	//Determine last index in the array.
	var iLastIdx = parseInt(oArray.length) - 1;
	
	//If no elements in array, get outta here.
	if (oArray.length == 0) return;

	//Shift elements so element being deleted is the last one.
	if (iElement < iLastIdx) {
		for (var i=iElement;i<oArray.length;i++) {
			oArray[i] = oArray[i+1];
		}
	}
	
	//Remove the last item.
	oArray.length--;
}

//-------------------------------------------------------------------------------------
// Function:	GetSelectText
//
// Synopsis:	Retrieves the text of the seleted item in a single select element.	
//
// Arguments:	oSelect			Reference to a list box or drop-down list.
//
// Returns:		none
//
// Notes:		none
//
//-------------------------------------------------------------------------------------
function GetSelectText(oSelect) {

	if (oSelect.selectedIndex == -1)
		return "";
	else
		return oSelect.item(oSelect.selectedIndex).text;
}

//-------------------------------------------------------------------------------------
// Function:	GetSelectValuesList
//
// Synopsis:	Creates a comma delimited list of values based on selected values in
//					select object.	
//
// Arguments:	oSelect			Reference to a list box or drop-down list.
//					bQuoteValues	Indicates if values should be enclosed in quotes.
//
// Returns:		Comma delimited list of values.
//
// Notes:		The list is typically used as the IN clause in a SQL statement.
//
//-------------------------------------------------------------------------------------
function GetSelectedValuesList(oSelect, bQuoteValues) {

	var sList = "";
	
	if (bQuoteValues == null) bQuoteValues = false; 	

	if(oSelect.multiple) {
		if (bQuoteValues == true) {
			for (var i=0;i<oSelect.options.length;i++) {
				if (oSelect.options(i).selected == true) sList += "'" + oSelect.options(i).value + "', "
			}	
		}
		else {
			for (var i=0;i<oSelect.options.length;i++) {
				if (oSelect.options(i).selected == true) sList += oSelect.options(i).value + ", "
			}	
		}
	}
	else {
		//Single select listbox.
		if (bQuoteValues == true) {
			for (var i=0;i<oSelect.options.length;i++) {
				sList += "'" + oSelect.options(i).value + "', "
			}	
		}
		else {
			for (var i=0;i<oSelect.options.length;i++) {
				sList += oSelect.options(i).value + ", "
			}	
		}
	}
	
	//Trim the last comma from the string.
	if (sList.length != 0) sList = sList.substr(0, sList.length - 2); 
	
	return sList;
}

//-------------------------------------------------------------------------------------
// Function:	GetSelectedValuesListFromBottom
//
// Synopsis:	Creates a comma delimited list of values based on selected values in
//					select object, starting at the bottom of the object (reverse order).	
//
// Arguments:	oSelect			Reference to a list box or drop-down list.
//					bQuoteValues	Indicates if values should be enclosed in quotes.
//
// Returns:		Comma delimited list of values.
//
// Notes:		The list is typically used as the IN clause in a SQL statement.
//
//-------------------------------------------------------------------------------------
function GetSelectedValuesListFromBottom(oSelect, bQuoteValues) {

	var sList = "";
	var iStart = oSelect.options.length - 1;
	var i = 0;
	
	if (bQuoteValues == null) bQuoteValues = false; 	

	if(oSelect.multiple) {
		if (bQuoteValues == true) {
			for (var i=iStart; i>=0; i--) {
				if (oSelect.options(i).selected == true) sList += "'" + oSelect.options(i).value + "', "
			}	
		}
		else {
			for (var i=iStart; i>=0; i--) {
				if (oSelect.options(i).selected == true) sList += oSelect.options(i).value + ", "
			}	
		}
	}
	else {
		//Single select listbox.
		if (bQuoteValues == true) {
			for (var i=0;i<oSelect.options.length;i++) {
				sList += "'" + oSelect.options(i).value + "', "
			}	
		}
		else {
			for (var i=0;i<oSelect.options.length;i++) {
				sList += oSelect.options(i).value + ", "
			}	
		}
	}
	
	//Trim the last comma from the string.
	if (sList.length != 0) sList = sList.substr(0, sList.length - 2); 
	
	return sList;
}

//-------------------------------------------------------------------------------------
// Function:	GetSelectOptionText
//
// Synopsis:	Returns the text for the specified select option value.	
//
// Arguments:	oSelect			Reference to a list box or drop-down list.
//
// Returns:		oSelect.option(x).text
//
//-------------------------------------------------------------------------------------
function GetSelectOptionText(oSelect, sValue) {

	var sText = "";
	
	for (var i=0;i<oSelect.options.length;i++) {
		if (oSelect.options(i).value == sValue) {
			sText = oSelect.options(i).text;
			break;
		}
	}	
	
	return sText;
}

//-------------------------------------------------------------------------------------
// Checks for vValue for null, and if null, returns the specified default value, else
// returns the original value.	
//-------------------------------------------------------------------------------------
function IsNull(vValue, vDefault) {

	return (vValue == null) ? vDefault : vValue;
}

//-------------------------------------------------------------------------------------
// Converts a key code to lower case.	
//-------------------------------------------------------------------------------------
function KeyLower(iKeyCode) {

	// Convert ascii to string.
	var s = String.fromCharCode(iKeyCode);
	
	// Convert to lower case.
	s = s.toLowerCase();
	
	// Set key code to lower case ascii value.
	return s.charCodeAt(0);
}

//-------------------------------------------------------------------------------------
// Function:	KeyUpper
//
// Synopsis:	Converts a key code to upper case.	
//
// Arguments:	iKeyCode	Specifies the Unicode key code associated with the key that
//							 caused the event.  
//
// Returns:		Key code after converting to upper case.
//
// Notes:		Attach to a onkeypress event.
//
//-------------------------------------------------------------------------------------
function KeyUpper(iKeyCode) {

	// Convert ascii to string.
	var s = String.fromCharCode(iKeyCode);
	
	// Convert to upper case.
	s = s.toUpperCase();
	
	// Set key code to upper case ascii value.
	return s.charCodeAt(0);
}

//-------------------------------------------------------------------------------------
// Loads a SELECT element with data contained in XML document.
//-------------------------------------------------------------------------------------
function LoadSelect(oDocument, oSelect, oNodeList, sTextName, sValueName) {
	
	//Clear existing.
	oSelect.options.length = 0;

	for (var i=0;i<oNodeList.length;i++) {
		with (oNodeList.item(i)) {
			var oNewOp = oDocument.createElement("OPTION");
			oSelect.options.add(oNewOp);
			oNewOp.text = getAttribute(sTextName);
			oNewOp.value = getAttribute(sValueName);
		}	
	}
}

//-------------------------------------------------------------------------------------
// Function:	MoveSelectOption
//
// Synopsis:	Moves the selected item from source list to the destinaiton list.
//
// Arguments:	oDocument		Reference to a HTML document in a given browser window. 
//				oSource			Reference to a list box or drop-down list.
//				oDestination	Text to be displayed.
//				iDestIdx		Index where item is to be added.		
//
// Returns:		none
//
// Notes:		none
//
//-------------------------------------------------------------------------------------
function MoveSelectOption (oDocument, oSource, oDestination, iDestIdx) {
	
	var iIndex;
	var sText;
	var sValue;
	var oNewOp;
		
	//Save item attrbiutes.
	iIndex = oSource.selectedIndex;
	sText = oSource.item(iIndex).text;
	sValue = oSource.item(iIndex).value;

	//Remove from source.
	oSource.remove(iIndex);

	//Hilite next item.
	if (oSource.options.length) {
		if (oSource.options.length > iIndex) {
			oSource.selectedIndex = iIndex;
		}
		else {
			oSource.selectedIndex = oSource.options.length - 1;
		}
	}

	//Add to destination list.	
	oNewOp = oDocument.createElement("OPTION");
	
	if (iDestIdx == null) {
		oDestination.options.add(oNewOp);
		oDestination.selectedIndex = oDestination.options.length - 1;
	}
	else {
		oDestination.options.add(oNewOp, iDestIdx);
		oDestination.selectedIndex = iDestIdx;
	}
		
	oNewOp.text  = sText;
	oNewOp.value = sValue;
}

//-------------------------------------------------------------------------------------
// Function:	PopulateSelectFromArray
//
// Synopsis:	Populates select element with data from a XML document.	
//
// Arguments:	oDocument		Reference to a HTML document in a given browser window. 
//					oSelect			Reference to a list box or drop-down list. 
//					oArray			Reference to a array containing an 'ID' and 'Name'
//										properties or and array of strings.
//					iStartingAt		Optional array element to start at.
//
// Returns:		none
//
// Notes:		The specified array must contain an 'ID' and 'Name' property.
//
//-------------------------------------------------------------------------------------
function PopulateSelectFromArray (oDocument, oSelect, oArray, iStartingAt) {
	
	var oNewOp;
	
	//Clear existing.
	oSelect.options.length = 0;
	
	if (iStartingAt == null) iStartingAt = 0; 	
	
	//Determine type of array.
	try {
		var bStringArray = oArray[0].ID;
		
		if (bStringArray == undefined) {
			bStringArray = true;
		}
		else {
			bStringArray = false;
		}	
	}
	catch (bStringArray) {
		bStingArray = true;
	}
		
	if (bStringArray) {
		for (var i=iStartingAt;i<oArray.length;i++) {
			oNewOp = oDocument.createElement("OPTION");
			oSelect.options.add(oNewOp);
			oNewOp.value = oArray[i];
			oNewOp.text  = oArray[i];
		}
	}
	else {
		for (var i=iStartingAt;i<oArray.length;i++) {
			oNewOp = oDocument.createElement("OPTION");
			oSelect.options.add(oNewOp);
			oNewOp.value = oArray[i].ID;
			oNewOp.text  = oArray[i].Name;
		}
	}
	
	//Select 1st item as default.
	//if(oSelect.options.length > 0) oSelect.options[0].selected = true;
}

//-------------------------------------------------------------------------------------
// Populates select element with data from a XML document.	
//-------------------------------------------------------------------------------------
function PopulateSelectFromXML (oDocument, oSelect, oNodeList, sValueAttribute, sTextAttribute, sTitleAttribute) {
	
	var oNewOp;

	//Clear existing.
	oSelect.options.length = 0;

	//Get outta here if list is empty.
	if (oNodeList.length == 0) return;

	//Load select element with data from XML document.
    if (sValueAttribute != null && sTextAttribute != null) {
    	for (var i=0;i<oNodeList.length;i++) {
    	    with (oNodeList.item(i)) {
    	    	oNewOp = oDocument.createElement("OPTION");
    	    	oSelect.options.add(oNewOp);
    	    	oNewOp.value = getAttribute(sValueAttribute);
    	    	oNewOp.text = getAttribute(sTextAttribute);
    	    	if (sTitleAttribute != null) oNewOp.title = getAttribute(sTitleAttribute);
    	    }	
        }
    }        
    else {
	    switch (oNodeList.item(0).attributes.length) {
	    	case 1:
	    		//Set value and text to the same value.
	    		for (var i=0;i<oNodeList.length;i++) {
	    			with (oNodeList.item(i)) {
	    				oNewOp = oDocument.createElement("OPTION");
	    				oSelect.options.add(oNewOp);
	    				oNewOp.value = attributes(0).nodeValue;
	    				oNewOp.text  = attributes(0).nodeValue;
	    			}	
	    		}
	    		break;
	    	
	    	case 2:
	    		//Set value to 1st attribute and text to the 2nd attribute.
	    		for (var i=0;i<oNodeList.length;i++) {
	    			with (oNodeList.item(i)) {
	    				oNewOp = oDocument.createElement("OPTION");
	    				oSelect.options.add(oNewOp);
	    				oNewOp.value = attributes(0).nodeValue;
	    				oNewOp.text  = attributes(1).nodeValue;
	    			}	
	    		}
	    		break;
	    		
	    	case 3:
	    		//Set value to 1st attribute and text to the 2nd attribute.
	    		//Use the 3rd attribute to determine if item is selected (must be "1" or "0").
	    		for (var i=0;i<oNodeList.length;i++) {
	    			with (oNodeList.item(i)) {
	    				oNewOp = oDocument.createElement("OPTION");
	    				oSelect.options.add(oNewOp);
	    				oNewOp.value = attributes(0).nodeValue;
	    				oNewOp.text  = attributes(1).nodeValue;
	    				oNewOp.selected = (attributes(2).nodeValue == "1" | (attributes(2).nodeValue == "True")) ? true : false;
	    			}	
	    		}
	    		break;
	    		
	    	default:
	    		//Set value to 1st attribute and text to the 2nd attribute.
	    		for (var i=0;i<oNodeList.length;i++) {
	    			with (oNodeList.item(i)) {
	    				oNewOp = oDocument.createElement("OPTION");
	    				oSelect.options.add(oNewOp);
	    				oNewOp.value = attributes(0).nodeValue;
	    				oNewOp.text  = attributes(1).nodeValue;
	    			}	
	    		}
	    		break;
	    				
	    }
    }	    
}

//-------------------------------------------------------------------------------------
// Function:	ReadCookie
//
// Synopsis:	Parses out the value of the specified cookie.	
//
// Arguments:	sCookies		String of cookies.	
//					sName			Name of cookie to get value for.
//					sDefault		Default value if no value is found.
//
// Returns:		The cookie value.
//
// Notes:		none
//
//-------------------------------------------------------------------------------------
function ReadCookie(sCookies, sName, sDefault) {
	
	if (sCookies == null) return sDefault;

	var iStart = sCookies.indexOf(sName + "=");
	var iEnd;

	if (iStart == -1) {
		// Cookie name not found.
		return sDefault;
	}
	else {
		// Parse out the cookie value.
		iStart = sCookies.indexOf("=", iStart) + 1;
		iEnd   = sCookies.indexOf(";", iStart);
		
		if (iEnd == -1) iEnd = sCookies.length;
		
		return sCookies.substring(iStart, iEnd);
	}		
}

//-------------------------------------------------------------------------------------
// Removes extra spaces from a string. 
//-------------------------------------------------------------------------------------
function RemoveExtraSpaces(sString) {
	
	if (sString.indexOf("  ") >= 0) {
		var i = sString.indexOf("  ");
		do {
			var sPart1 = sString.substr(0, i);
			var sPart2 = sString.substr(i+1);
			sString = sPart1 + sPart2;
			i = sString.indexOf("  ");
		} while (i >= 0)
	}
	
	//Make sure string does not begin with a space.
	if (sString.indexOf(" ") == 0) sString = sString.substr(1);
	
	//Make sure string does not end with a space.
	var sLastChar = sString.substr(sString.length - 1);
	if (sLastChar == " ") sString = sString.substr(0, sString.length - 1);
	
	return sString;
}

//-------------------------------------------------------------------------------------
// Function:	SaveCookie
//
// Synopsis:	Saves a cookie that will expire in a year.	
//
// Arguments:	doc		Reference to document object.
//					sName	Name of cookie to set value for.
//					sValue	Value to assign to cookie.
//
// Returns:		none
//
// Notes:		none
//
//-------------------------------------------------------------------------------------
function SaveCookie(doc, sName, sValue) {

	var oDate = new Date();
	
	//Set expiration date to a year from now.
	oDate.setYear(oDate.getYear() + 1);
	
	// Save cookie.
	doc.cookie = sName + "=" + sValue + ";expires=" + oDate;
}

//-------------------------------------------------------------------------------------
// Function:	SetSelected
//
// Synopsis:	Sets the selected items in a multiple select element.	
//
// Arguments:	oSelect			Reference to a list box or drop-down list.
//					bValue			True/False.
//
// Returns:		none
//
// Notes:		none
//
//-------------------------------------------------------------------------------------
function SetSelected(oSelect, bValue) {
	
	//Set the OPTION element's SELECTED attribute to the specified value.
	for (var i=0;i<oSelect.options.length;i++) {
		oSelect.options(i).selected = bValue;
	}
}

//-------------------------------------------------------------------------------------
// Function:	SetSelectText
//
// Synopsis:	Sets the selected text in a single select element.	
//
// Arguments:	oSelect			Reference to a list box or drop-down list.
//					sText				Text to be selected.
//
// Returns:		True if value found, otherwise false.
//
// Notes:		none
//
//-------------------------------------------------------------------------------------
function SetSelectText(oSelect, sText) {
	
	var bFound = false;
	
	//Set the OPTION element's SELECTED attribute for the specified text.
	for (var i=0;i<oSelect.options.length;i++) {
		var oOp = oSelect.options[i];
		if (oOp.text == sText) { 
			oOp.selected = true;
			bFound = true;
		}
		if (bFound) break;
	}
	
	return bFound;
}

//-------------------------------------------------------------------------------------
// Function:	SetSelectValue
//
// Synopsis:	Sets the selected item in a single select element.	
//
// Arguments:	oSelect			Reference to a list box or drop-down list.
//					sValue			Value to be selected.
//
// Returns:		True if value found, otherwise false.
//
// Notes:		none
//
//-------------------------------------------------------------------------------------
function SetSelectValue(oSelect, sValue) {
	
	var oOp = null;
	var bFound = false;
	
	//Set the SELECT element value.
	oSelect.value = sValue;
	
	//Set the OPTION element's SELECTED attribute for the specified value.
	for (var i=0;i<oSelect.options.length;i++) {
		oOp = oSelect.options[i];
		if (oOp.value == sValue) { 
			oOp.selected = true;
			bFound = true;
		}
		if (bFound) break;
	}
	
	return bFound;
}

//-------------------------------------------------------------------------------------
// Strip the path from the filename.
//-------------------------------------------------------------------------------------
function StripPathFromFileName(sFileName) {

	var iLoops;
		
	while (sFileName.indexOf("\\") >= 0) {
		var i = sFileName.indexOf("\\");
		sFileName = sFileName.substr(i+1);
		
		//Prevent endless looping.
		iLoops++;
		if (iLoops > 50) break;
	}
	
	return sFileName;
}

//-------------------------------------------------------------------------------------
// Swaps the items in the list.
//-------------------------------------------------------------------------------------
function SwapSelectOption (oDocument, oSelect, sDirection) {
	
	var iIndex;
	var sText;
	var sValue;
	var oNewOp;
		
	//Save item attrbiutes.
	iIndex = oSelect.selectedIndex;
	sText = oSelect.item(iIndex).text;
	sValue = oSelect.item(iIndex).value;

	//Remove from current position.
	oSelect.remove(iIndex);

	//Determine new position.
	if (sDirection == "U") {
		iIndex -= 1;
	}
	else {
		iIndex += 1;
	}

	//Add item at new position.
	oNewOp = oDocument.createElement("OPTION");
	oSelect.options.add(oNewOp, iIndex);
	oNewOp.text  = sText;
	oNewOp.value = sValue;

	//Hilite item.
	oSelect.selectedIndex = iIndex;
}


//-------------------------------------------------------------------------------------
// Function:	ValueExists.
//
// Synopsis:	Determines if value already exists in array.
//
// Arguments:	aValues		Array of values.			
//				sValue		Value to test for existance of.
//
// Returns:		True if values already exists in array, otherwise false.
//
// Notes:		none
//
//-------------------------------------------------------------------------------------
function ValueExists(aValues, sValue) {

	sValues = "|" + aValues.join("|") + "|";
	
	return (sValues.indexOf("|" + sValue + "|") == -1) ? false : true;
}


//define hex chars for conversion
var h="0123456789ABCDEF";
var Fullrgb = "#000000";

//Build string that will display a gradient color.
function GradientString(string, startcolor, endcolor) {

	//get length of string
	var len = string.length;
	var color;
	var s="";

	var start_red = startcolor >> 16;
	var start_green = (startcolor & 0x00FF00) >> 8;
	var start_blue = startcolor & 0x0000FF;

	var end_red = endcolor >> 16;
	var end_green= (endcolor & 0x00FF00) >> 8;
	var end_blue = endcolor & 0x0000FF;

	//calculate how much to update hue of each character
	var incRed = Math.floor((end_red - start_red) / len);
	var incGreen = Math.floor((end_green - start_green) / len);
	var incBlue = Math.floor((end_blue - start_blue) / len);

	//While there are still elements in the string
	for(var x=0; x < len; x++) {
		//Stay within color range!
		if(start_red + incRed >= 0x00 && start_red + incRed <= 0xFF) start_red += incRed;
				
		if(start_green + incGreen >= 0x00 && start_green + incGreen <= 0xFF) start_green += incGreen;
				
		if(start_blue + incBlue >= 0x00 && start_blue + incBlue <= 0xFF) start_blue += incBlue;

		color = hex(merge(start_red, start_green, start_blue));

		//Since the computer interprets #A0A0A as #A0A0A0 and NOT #0A0A0A
		//we MUST make sure that no misinterpretations are made by the
		//processor!
		color = Fullrgb.substring(0, 6 - color.length + 1) + color;

		//Build gradient string.
		s += "<font color = " + color + ">" + string.charAt(x) + "</font>";
	}
	
	return s;	
}

//Build gradient bar.
function GradientBar(oTable, startcolor, endcolor) {

	//number of pixels between colors
	var gap = 2;
	var direction = null;
	var len = null;
	var oRow = null;
	
	if (oTable.parentElement.offsetWidth > oTable.parentElement.offsetHeight) {
		//horizontal
		direction = 0;
		len = oTable.parentElement.offsetWidth / gap;
	}
	else {
		//vertical
		direction = 1;
		len = oTable.parentElement.offsetHeight / gap;
	}
	
	var color;

	var start_red = startcolor >> 16;
	var start_green = (startcolor & 0x00FF00) >> 8;
	var start_blue = startcolor & 0x0000FF;

	var end_red = endcolor >> 16;
	var end_green= (endcolor & 0x00FF00) >> 8;
	var end_blue = endcolor & 0x0000FF;

	//calculate how much to update hue of each character
	var incRed = Math.floor((end_red - start_red) / len);
	var incGreen = Math.floor((end_green - start_green) / len);
	var incBlue = Math.floor((end_blue - start_blue) / len);
	
	if (direction == 0)	{
		oRow = oTable.insertRow();
		oRow.height = oTable.parentElement.offsetHeight;
	}	

	//Fill table 
	for(var x=0; x < len; x++) {
		//Stay within color range!
		if(start_red + incRed >= 0x00 && start_red + incRed <= 0xFF) start_red += incRed;
				
		if(start_green + incGreen >= 0x00 && start_green + incGreen <= 0xFF) start_green += incGreen;
				
		if(start_blue + incBlue >= 0x00 && start_blue + incBlue <= 0xFF) start_blue += incBlue;

		color = hex(merge(start_red, start_green, start_blue));

		//Since the computer interprets #A0A0A as #A0A0A0 and NOT #0A0A0A
		//we MUST make sure that no misinterpretations are made by the
		//processor!
		color = Fullrgb.substring(0, 6 - color.length + 1) + color;

		if (direction == 1)	{
			oRow = oTable.insertRow();
			oRow.height = gap;
			oRow.width = oTable.parentElement.offsetWidth;
		}
		
		var oCell = oRow.insertCell();
		if (direction == 0) {
			oCell.width = gap;
		}
		else {
			oCell.height = gap;
		}
		
		oCell.bgColor = color;
	}
}

function merge(r, g, b){

	//take all three bytes and merge them into a 3 byte RGB triplet
    return (r << 16 | g << 8 | b);
}

function hex(c){

	var temp = "";
	var hexStr = "";
	var remainder, i;

	//this is how you convert to hex
	for( ; c != 0; c >>= 4)	{
	    remainder = c % 16;
		hexStr += h.charAt(remainder);
	}

	//only thing with a conversion is that it does it backwards
	//so this makes it right
	//you could have also used recursion but that
	// would have been more complicated
	for(i=5 ; i >= 0; i--)
		temp += hexStr.charAt(i);

	//return the converted hex number
	return temp;
}

