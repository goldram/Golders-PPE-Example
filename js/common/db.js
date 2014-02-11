//-------------------------------------------------------------------------------------
//
//	Author: Dan Carlson
//
//	Description: General routines for marshalling data between client and database 
//				 asynchronously. Data retrieved from the database is stored in an 
//				 XML document, which can be manipulated via the routines in this file. 
//
// Date			Developer			Modification
// --------   	------------------	----------------------------------------------
// 10/01/06		Dan Carlson			Initial version created.
//
//-------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------
// Attach events.
//-------------------------------------------------------------------------------------

//window.onload = InitPage;

if (window.addEventListener) 
{
    //Firefox
    window.addEventListener("load", InitPage, false);
    var mbIE = false;
} 
else 
{
   //IE
   window.attachEvent("onload", InitPage);
   var mbIE = true;
}
    
//-------------------------------------------------------------------------------------
// Module level variables.
//-------------------------------------------------------------------------------------
var moDOMDocument;	//Reference to W3C-DOM XML Document.//var moXSL = new ActiveXObject("Microsoft.XMLDOM");

try {
    var moXSL = this.parent.moMain.moXSL;
}
catch(e) {
}    

//Load sorting module here, so sorting can be non-asynchronous.
//moXSL.async = true;
//moXSL.load("stylesheets/Sort.xsl");
var msOrderBy;var mbDescending;var mbIsSorted = true;var mbError = false;var mbIsBusy = false;

var mbUseBigXML = false;

function FilterCriteria(sAttribute, sValue) {

	//Convert to string.
	sValue += "";
    
    this.Attribute = sAttribute;
    this.Value = sValue;
}

//-------------------------------------------------------------------------------------
// Applies the XSL sorting template to the XML document data.
//-------------------------------------------------------------------------------------
function ApplySort() {

	//If XSL document is not completely loaded, get outta here.
	if (moXSL.readyState != 4) {
    	moXSL.onreadystatechange = ApplySort;
	    return;
	}    
	
    moXSL.onreadystatechange = new Function();
	
	//Set the XSL order-by value.
	if (mbDescending) {
		moXSL.selectSingleNode("//@order-by").nodeValue = "-@" + msOrderBy;
	}
	else {
		moXSL.selectSingleNode("//@order-by").nodeValue = "@" + msOrderBy;
	}	

	//Create a new XML document to hold the sorted records.
	//*** DAN TESTING *** var oXMLDocument = new ActiveXObject("Microsoft.XMLDOM");
	var oXMLDocument = new ActiveXObject("XMLDOM");

	//Assign data type to attribute before sorting.
	AssignDataType(msOrderBy);
		
	//Apply the stylesheet to the document.
	moDOMDocument.transformNodeToObject(moXSL, oXMLDocument);
	
	//Assign sorted records to original document.
	moDOMDocument = oXMLDocument;
	mbIsSorted = true;
}

//-------------------------------------------------------------------------------------
// Assigns the data type of the node. Required before sorting.
//-------------------------------------------------------------------------------------
function AssignDataType(sFieldName) {

	var sDataType = GetDataType(sFieldName);
	var oDataList = DataNodeList();
	
	for (var i=0; i<oDataList.length; i++) {
		try {
			var oAttribute = oDataList.item(i).getAttributeNode(sFieldName)
			oAttribute.dataType = sDataType;
		}
		catch (oAttribute) {
			//Attributes with NULL values are missing from data.
		}	
	}
}

//-------------------------------------------------------------------------------------
// Returns an array of attributes from the schema.
//-------------------------------------------------------------------------------------
function Attributes(sAttribute) {


    if (mbIE) {
        var oAttributeTypes = SchemaNodeList().item(0).childNodes;
	}
	else {
        var oAttributeTypes = SchemaNodeList();
	    //var oAttributeTypes = oSchemaNodeList.item(1).childNodes;
	}	
	
	var aAttributes = new Array();	
	    	
    for(i=0; i<oAttributeTypes.length-1; i++) {
	    aAttributes.push(oAttributeTypes.item(i).getAttribute(sAttribute));
    }

	return aAttributes;
}

//-------------------------------------------------------------------------------------
// Detects whether or not the XML was placed in a textarea (for very large datasets) 
// and, if so, ignores the lowercase conversion of the attribute name. 
//
// Background: Firefox and some other web browsers convert all attribute names in XML 
// data to lowercase, unless the XML is placed in a textarea element which is used by 
// this library for larger XML strings (20k+). 
//-------------------------------------------------------------------------------------
function AttrName(sAttributeName) {

	if (window.addEventListener) 
    {
        //Firefox, Mozilla
        return (mbUseBigXML) ? sAttributeName : sAttributeName.toLowerCase();
        //return sAttributeName;
   } 
    else 
    {
       //IE
       return sAttributeName;
    }
}

//-------------------------------------------------------------------------------------
// 	Determine if an error occurred.
//-------------------------------------------------------------------------------------
function CheckForError() {

	var oErrorDetail = document.getElementById("ErrorDetail");
	var oErrorMsg = document.forms["frmDB"]["ErrorMsg"];
	
   	mbError = false;
   	
   	//Set to true to display errors in an alert dialog. If set to false, the client UI
   	//will handle how errors are displayed/communicated to the user.
   	bDisplayErrors = false;
   	
	if (oErrorDetail.innerHTML.length) {
	
		//Set error flag.
        mbError = true;
        
        if (oErrorMsg.value.length) {
			var sMsg = oErrorDetail.innerHTML;
			
			//Strip-off SQL Server error number prefix if present.
			if ((sMsg.indexOf("-") == 0) && (sMsg.indexOf(":") == 11)) sMsg = sMsg.substring(13);
			
			//Strip-off SQL Server error number suffix if present.
			if (sMsg.indexOf("(Error=") > 0) sMsg = sMsg.substring(0, sMsg.indexOf("(Error=") - 1);
			
			//Append generic error message to error details.
			var sMsg = oErrorMsg.value + "\r\r" + "Details: " + sMsg;
				
			//Display error message.
			if (bDisplayErrors) alert(sMsg);
				
			//Display the error in the custom error dialog. If it fails, use the built-in
			//alert dialog provided by the scripting interface.
	        try {
				var oErrorDialog = eval(frmDB.ErrorDialog.value);
				var sLeft = frmDB.ErrorDialogLeft.value;
				var sTop = frmDB.ErrorDialogTop.value;
				
				var sHeight = parseInt((sMsg.length/35) * 20);
				var sWidth = "240";
				//var sWidth = (sMsg.length > 200) ? 260 : 200;
				//var sHeight = (sMsg.length > 200) ? 150 : 100;
				
				oErrorDialog.ShowError(sMsg, sLeft, sTop, sWidth, sHeight);
			}
			catch (e) {
			    if (bDisplayErrors) alert(sMsg);
			}
		}
	}

}

//-------------------------------------------------------------------------------------
// 	Creates a new node element in the data node list.
//-------------------------------------------------------------------------------------
function CreateRow() {

	var NODE_ELEMENT = 1;
	var sValue;
	
	//Create node element to hold record.
	if (mbIE) {
	    var oNode = moDOMDocument.createNode(NODE_ELEMENT, "z:row", "#RowsetSchema");
	}
	else {
	    var oNode = moDOMDocument.createElement("z:row");
	}

	//Get array of attributes this node will need to have.
	var aryAttributeNames = Attributes("name");

	//Create the attributes.
	for (var i=0; i<aryAttributeNames.length; i++) {
		oNode.setAttribute(aryAttributeNames[i], "");
	}
	
	//Append the node to the document.
	var oDataNode = DataNode();
	if (mbIE) {
	    oDataNode.appendChild(oNode);
	}
	else {
	    oDataNode[0].appendChild(oNode);
	}
	
	//Return reference to node just created.
	return oNode;
}

//-------------------------------------------------------------------------------------
// Gets a reference to the data node. 
//-------------------------------------------------------------------------------------
function DataNode() {

	var oDataNode = null;

	if (moDOMDocument.childNodes.length == 0) return oDataNode;
	
	try {
	    if (mbIE) {
		    oDataNode = moDOMDocument.documentElement.childNodes.item(1);
		}
		else {
		    oDataNode = moDOMDocument.documentElement.getElementsByTagName("rs:data");
		}
	}
	catch (e) {
		//Return empty node.
		oDataNode = moDOMDocument.createNode(NODE_ELEMENT, "z:row", "#RowsetSchema");
	}	
	finally {
		return oDataNode;
	}
}

//-------------------------------------------------------------------------------------
// Gets a reference to the data child nodes. 
//-------------------------------------------------------------------------------------
function DataNodeList() {

	try {
	    if (mbIE) {
		    var oDataNodeList = moDOMDocument.documentElement.childNodes.item(1).childNodes;
		}
		else {
		    var oDataNodeList = moDOMDocument.documentElement.getElementsByTagName("z:row");
		}
	}
	catch (e) {
		//Return empty array, so length property will be equal to zero.
		var oDataNodeList = new Array();			
	}	
	finally {
		return oDataNodeList;
	}
}

//-------------------------------------------------------------------------------------
// Indicates if an error occurred while loading data from the database.
//-------------------------------------------------------------------------------------
function Error() {

	return mbError;
}

//-------------------------------------------------------------------------------------
// Filters the data rows by the specified attributes and values.
//-------------------------------------------------------------------------------------
function FilterByCriteria(aFilters) {
    
    var sCriteria = "";

    for (var i=0; i<aFilters.length; i++) {
        //sCriteria += "@" + aFilters[i].Attribute + " = '" + aFilters[i].Value + "' and ";
        sCriteria += "@" + aFilters[i].Attribute + ' = "' + aFilters[i].Value + '" and ';
    }
    
    //Trim off excess.
    sCriteria = sCriteria.substr(0, sCriteria.length - 4);
    
	//Get all rows matching the criteria.
	var oNode = DataNode();
	try {
	    if (mbIE) {
	        var sCriteria = "z:row[" + sCriteria + "]";
	        var oNodeList = oNode.selectNodes(sCriteria);
	    }
	    else {
	        //sCriteria = "/" + sCriteria;
	        //XPath for Mozilla-based browsers does not like colon in node ID so have to use *.
	        sCriteria = "//*[" + sCriteria + "]";
	        var oNodeList = moDOMDocument.evaluate(sCriteria, moDOMDocument, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	        //alert("Node item count in FilterByCriteria = " + oNodeList.snapshotLength + "\n\n" + "Criteria: " + sCriteria);
	    }
	}
	catch (e) {
		//Return empty array, so length property will be equal to zero.
		oNodeList = new Array();
		alert("Error in FilterByCriteria!!! \n\n Criteria=" + sCriteria + "\n\n" + " Error: " + e);	
				
	}	
	finally {
		return oNodeList;
	}

}

//-------------------------------------------------------------------------------------
// Filters the data rows by the specified attribute and value.
//-------------------------------------------------------------------------------------
function FilterRows(sAttribute, sValue) {

	var oNodeList;
	
	//Convert to string.
	sValue += "";
	
	if (sValue.length > 0) {		//Get all rows where the attribute has this value.
		var oDataNode = DataNode();
		var sCriteria = "z:row[@" + sAttribute + " = '" + sValue + "']";
	    if (mbIE) {
		    oNodeList = oDataNode.selectNodes(sCriteria);
	    }
	    else {
	        oNodeList = moDOMDocument.evaluate(sCriteria, oDataNode, null, XPathResult.ANY_TYPE, null);
	        alert("Node items found by FilterRows = " + oNodeList.length);
	    }
	}	
	else {
		//Get all rows.
		oNodeList = DataNodeList();
		alert("Error in FilterRows!");			
	}	
	
	return oNodeList;
}

//-------------------------------------------------------------------------------------
// Gets the data type of the specified field from the schema. 
//-------------------------------------------------------------------------------------
function GetDataType(sFieldName) {

	var oElementType = SchemaNodeList().item(0);

	var oAttributeType = oElementType.selectSingleNode("s:AttributeType[@name='" + sFieldName + "']");

	try {
		return oAttributeType.childNodes.item(0).getAttribute("dt:type");
	}
	catch(e) {
		return "number";
	}
}

//-------------------------------------------------------------------------------------
// Applies the specified filter/pattern to the data node's context and returns the first 
// matching node. If no filter is specified, the first node is returned.
//-------------------------------------------------------------------------------------
function GetRow(sAttribute, sValue) {

	try {
		if (sAttribute == null) {
		    var oDataNode = DataNode();
			var oNode = oDataNode.firstChild;
		}
		else {
		    var oDataNode = DataNode();
			var oNode = oDataNode.selectSingleNode("z:row[@" + sAttribute + " = '" + sValue + "']");
		}
	}
	catch(e) {
	}

	return oNode;
}

//-------------------------------------------------------------------------------------
// Gets the string of XML from the document. 
//-------------------------------------------------------------------------------------
function GetXML() {

    if (moDOMDocument == null) {
        return "";
    }
    else
    if (mbIE) {
        return moDOMDocument.xml;
	}
	else {
	    var oSerializer = new XMLSerializer();
        var xml = oSerializer.serializeToString(moDOMDocument);
	    return xml;
	}

}

//-------------------------------------------------------------------------------------
// Initializes the page, fires immediately after the browser loads page. 
//-------------------------------------------------------------------------------------
function InitPage() {

    //alert("db.js InitPage BEGIN");

    //alert("Tracking Msg = " + TrackingMsg.innerText);
	
	if (document.readyState != "complete" && document.readyState != undefined) {
		//Wait until document is completely loaded.
		setTimeout(InitPage, 500);
	}	
	
    //alert("db.js InitPage PAST readyState check");
	
	//Load results into XML DOM object.	
	var oReturnData  = document.forms["frmDB"]["ReturnData"];
	if (oReturnData.value == "Y") {
			
		//Create XML document to hold data retrieved from server.
        if (window.ActiveXObject) { //IE
        
            //alert("Loading XML in IE...");
        
            moDOMDocument=new ActiveXObject("Microsoft.XMLDOM");
	        moDOMDocument.async = false;
	        
	        try 
	        {
			    //alert("IE: SQL= " + document.getElementById("SQL").value + ", \n\n Length XML=" + document.getElementById("XML").innerHTML.length + "\n\n" + document.getElementById("XML").innerHTML);
			    
			    var sXmlString = document.getElementById("XML").innerHTML;
			    //var sXmlString = document.getElementById("XML").value;
			    
			    //sXmlString = sXmlString.replace(/&/g,"&amp;");
			    ////sXmlString = sXmlString.replace(/'/g,"&apos;");
			    ////sXmlString = sXmlString.replace(/"/g,"&quot;");
			    ////sXmlString = sXmlString.replace(/>/g,"&gt;");
			    ////sXmlString = sXmlString.replace(/</g,"&lt;");
			    
			    var bRC = moDOMDocument.loadXML(sXmlString);
		        
		        document.getElementById("XML").innerHTML = "";
		        //document.getElementById("XML").value = "";
			}
			catch(e) {
			    //do nothing
			}
        }
        else 
        if (document.implementation.createDocument) { //Mozilla, Firefox, Opera, etc.
            
			try {
                //alert("Loading XML in FF...");
			    
			    //Assume the amount of XML returned does not exceed any browser-specific limits
			    //on the node size.
			    mbUseBigXML = false;
			    
			    //Get the XML from the label element created by the server, or if the size 
			    //of the XML exceeds the limit for a single node (some non-IE browsers), 
			    //then get the XML from the textarea element created specifically for large
			    //XML datasets. 
			    try {
			        var sXmlString = document.getElementById("BigXML").value; 
			        if (sXmlString != null && sXmlString.length > 0) {
			            //XML was loaded into a textarea rather than a label due to 
			            //browser-specific limit on the size of a single node
			            //(e.g. Firefox 10.x limit is approx. 32k).
			            mbUseBigXML = true; 
			            //alert("Going big!"); 
			        }
			        else {
			            var sXmlString = document.getElementById("XML").innerHTML;
			            //alert("Going normal!");
			        }     
			        //document.getElementById("XML").innerHTML = document.getElementById("BigXML").innerHTML;
			    }
			    catch(e) {
			        var sXmlString = document.getElementById("XML").innerHTML;     
			    }
			    
			    //Debugging...
			    //alert("Firefox: SQL= " + document.getElementById("SQL").value + ", \n\n Length XML value=" + sXmlString.length + "\n\n" + sXmlString);
			    
			    //Is URL encoding needed????
			    //var sXmlString = UrlEncode(sXmlString);
	            
	            //Encode ampersands????
			    //sXmlString = sXmlString.replace(/&/g,"&amp;");
			    
			    //Hack to retain line breaks that are, for some reason, removed by the 
			    //FireFox DOMParser. What we do here is convert the line breaks to another 
			    //unique character string, "-rn-". The application processing the XML must 
			    //then convert all "*r*n" strings back to standard line breaks. GBIW - Goofy But It Works.
			    var sRetainLineBreaks = document.getElementById("FireFoxRetainLineBreaks").value;
			    if (sRetainLineBreaks == "yes") {
			        sXmlString = sXmlString.replace(/\r\n/g,"-rn-");
			    }
			    
			    //If XML exists, parse it using the Firefox DOMParser.
			    //***TODO*** Need to make sure this works for Chrome and other browsers.
			    if (sXmlString && sXmlString.length > 0) {
			    
			        var parser = new DOMParser();
                
                    //Is this helpful in any situations???
	                //moDOMDocument.strictErrorChecking = false;
			        
                    moDOMDocument = parser.parseFromString(sXmlString,"text/xml");
                    
                    //IMPORTANT: May need to use the normalize() method to combine all
                    //nodes. The syntax is something like:
                    //moDOMDocument.childNodes[0].normalize(); //Syntax may not be correct!
                    
                    //Check for Mozilla parser error.
                    if (moDOMDocument.documentElement.nodeName == "parsererror") {
                        var sDetails = moDOMDocument.documentElement.childNodes[0].nodeValue;
                        sDetails = sDetails.replace(/</g, "<");
                        var i = sDetails.indexOf("Location:");
                        if (i > 0) sDetails = sDetails.substr(0,i-1);
                        var sMsg  = "Error attempting to parse XML (Mozilla browser). \n\n";
                        sMsg += "Details: " + sDetails + "\n"; 
                        alert(sMsg + "\n\n XML = \n" + sXmlString);
                    }
                    else {
                        //alert("Successfully parsed. XML: \n\n" + sXmlString);
                    }
		            
		            //Clear the XML from each containing element.
		            try {
		                document.getElementById("XML").innerHTML = "";
		                document.getElementById("BigXML").value = "";
		            }
		            catch(e) {
		                // do nothing
		            }
		            
		        }
            }
            catch(err) {
                alert("Error attempting to parse XML in Mozilla/Firefox browser");
                //do nothing
            }
        }
        else {
            alert('Your browser cannot handle this script. Please contact technical support.');
            return;
        }

	}	
	
	//Determine if an error occurred.
	CheckForError();
	    
    //Execute the specified callback function in the calling frame.
	//alert("Callback = " + frmDB.Callback.value);
	var oCallback = document.forms["frmDB"]["Callback"];
	if (oCallback.value.length > 0) {
	    eval(oCallback.value);
	}
	
}

//-------------------------------------------------------------------------------------
// 	Inserts a new node element in the data node list.
//-------------------------------------------------------------------------------------
function InsertRow(oRefChild) {

	var NODE_ELEMENT = 1;
	var sValue;
	
	//Create node element to hold record.
	var oNode = moDOMDocument.createNode(NODE_ELEMENT, "z:row", "#RowsetSchema");

	//Get array of attributes this node will need to have.
	var aryAttributeNames = Attributes("name");

	//Create the attributes.
	for (var i=0; i<aryAttributeNames.length; i++) {
		oNode.setAttribute(aryAttributeNames[i], "");
	}
	
	//Insert the node into the document.
	var oDateNode = DataNode();
	oDateNode.insertBefore(oNode, oRefChild);
	
	//Return reference to node just created.
	return oNode;
}

//-------------------------------------------------------------------------------------
//  Determines if a "busy" condition exists on the database server.
//-------------------------------------------------------------------------------------
function IsBusy() {

	return mbIsBusy;
}

//-------------------------------------------------------------------------------------
// Indicates if sorting the XML document is complete.
//-------------------------------------------------------------------------------------
function IsSorted() {
	
	return mbIsSorted;
}

//-------------------------------------------------------------------------------------
// 	Removes a node element in the data node list.
//-------------------------------------------------------------------------------------
function RemoveRow(sAttribute, sValue) {

	var oNode = GetRow(sAttribute, sValue);

	//Remove the node from the document.
	if (oNode != null) {
	    var oDataNode = DataNode();
		oDateNode.removeChild(oNode);
	}	
}

//-------------------------------------------------------------------------------------
// Removes all nodes in the data node list.
//-------------------------------------------------------------------------------------
function RemoveRows() {

    var oNodes = DataNodeList();

    while(oNodes.length) {
    	var oDataNode = DataNode();
   		oDataNode.removeChild(oNodes.item(0));
    }
}

//-------------------------------------------------------------------------------------
// Gets a reference to the schema child nodes. 
//-------------------------------------------------------------------------------------
function SchemaNodeList() {

    if (mbIE) {
	    return moDOMDocument.documentElement.childNodes.item(0).childNodes;
	}
	else {
	    return moDOMDocument.documentElement.getElementsByTagName("s:attributetype")
	}
	
}

//-------------------------------------------------------------------------------------
// Loads the XML Document with the supplied XML string.
//-------------------------------------------------------------------------------------
function SetXMLDocument(sXML) {

	//Create a new XML document.
	//*** DAN TESTING *** var oXMLDocument = new ActiveXObject("Microsoft.XMLDOM");
	var oXMLDocument = new ActiveXObject("XMLDOM");

	oXMLDocument.async = false;
		
	//Load the XML document using the supplied string.
	var bRC = oXMLDocument.loadXML(sXML);
	
	//Assign to original document.
	moDOMDocument = oXMLDocument;
}

//-------------------------------------------------------------------------------------
// Sorts the row data by the specified attribute.
//-------------------------------------------------------------------------------------
function SortData(sOrderBy, bDescending) {

    if (moDOMDocument.xml.length == 0) return;

	//Save sort args in member-level variables.
	msOrderBy = sOrderBy;
	mbDescending = bDescending;
	mbIsSorted = false;
	
	ApplySort();
}

//-------------------------------------------------------------------------------------
//  Returns the wait time, if a "busy" condition exists on the database server.
//-------------------------------------------------------------------------------------
function WaitTime() {

	return miWaitTime;
}