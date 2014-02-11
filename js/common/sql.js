//-------------------------------------------------------------------------------------
// Description:	Contains functions used to build a SQL statement.
//-------------------------------------------------------------------------------------

//Object to hold a RDBMS SQL statement.
function SQL() {
	var stmt;
}

//Object to hold MS Access SQL statement pieces. 
function MSAccessSQL(sAction, t) {
    
    this.Action = sAction;
    this.Type = t;
	this.Fields = "";
	this.Values = "";
	this.Criteria = "";
	this.stmt = "";
}

//-------------------------------------------------------------------------------------
// Function:	BuildMSAccessSQL
//
// Synopsis:	Builds a SQL statment to execute a against a MS Access database.
//
// Arguments:	oSQL			SQL statment being build.
//				sField		    MS Access field/column name.
//				sValue			Value associated with sField.
//				sDataType       Valid values: "num", "date". If missing, assumes string.		
//				bIgnoreQuotes	Indicates if formatting of quotes should be ignored.	
//
// Returns:		none
//
// Notes:		none
//
//-------------------------------------------------------------------------------------
function BuildMSAccessSQL(oSQL, sField, sValue, sDataType, bIgnoreQuotes) {


//alert("sField = " + sField + ", Value = " + sValue);



    //Strip off the "@" in the fieldname.
    if (sField.indexOf("@") == 0) sField = sField.substr(1);

    var bNumber = (sDataType == "num")  ? true : false;
    var bDate   = (sDataType == "date") ? true : false;
    var bBool   = (sDataType == "bool") ? true : false; 
	
	//Format boolean to "true" or "false".
	//10/27/08. For SQL Server conversion changed this to 1 or 0.
	if (bBool) sValue = (sValue) ? 1 : 0;

	//Trim leading blanks.
	if ((!bNumber) && (!bBool)) {
		sChar = sValue.charAt(0);
		while (sChar == " ") {
			sValue = sValue.substr(1);
			sChar = sValue.charAt(0);
		}
	}

	// Check for empty values, and make them NULL values.
	// 10/23/08. For SQL Server conversion, changed double quotes to single quotes.
	// if (sValue.length == 0 || sValue == "") {sValue = "";}
	// to 
	// if (sValue.length == 0 || sValue == "") {sValue = '';}
	//alert ("sValue = " & sValue);
	if ((!bNumber) && (!bBool)) {
		//if (sValue.length == 0 || sValue == "") {sValue = "NULL";}
		if (sValue.length == 0 || sValue == "") {sValue = '';}

	}

	if (bNumber) {
		// Replace format characters.
		if (isNaN(sValue) == true) {
			sValue += "";
			sValue = sValue.replace(/$/g, "");
			sValue = sValue.replace(/,/g, "");
		}
				
		sValue = parseFloat(sValue);
		if (sValue < 0 || isNaN(sValue)) sValue = "NULL";
	}
	
	
	//If value is not numeric, not a boolean, and not a MS Access zero-length string, then
	//wrap it with single quotes or, if a date, with #'s.
	// 10/20/08 - Do I need to change var sDateDelim = '#'; to var sDateDelim = '''; ??????????
	if ((!bNumber) && (!bBool) && (sValue != '""')) {
		var sSingleQuote = "'";
		var sDoubleQuote = '"';
		var sDateDelim = '#';
		var sNewValue;
		var p;
	
		if (bIgnoreQuotes == true) {
			//If a date, enclose string in #'s.
			if (bDate) sValue = sDateDelim + sValue + sDateDelim;

			//Enclose string in single quotes.
			sValue = sSingleQuote + sValue + sSingleQuote;
		}	
		else {
			//Replace all single quotes with a set of three single quotes.
			p = sValue.indexOf(sSingleQuote);
			
			if (p) {
				sNewValue = "";
				while (p >= 0) {
					sNewValue += sValue.substring(0,p) + "''";
					sValue = sValue.substring(p+1);
					p = sValue.indexOf(sSingleQuote);
				}
		
				if (sValue.length) {
					sNewValue += sValue;
					sValue = sNewValue;
				}	
				else {
					sValue = sNewValue;
				}
			}	
			
			//If a date, enclose string in #'s.
			if (bDate) sValue = sDateDelim + sValue + sDateDelim;
		
			//Enclose string in single quotes.
			sValue = sSingleQuote + sValue + sSingleQuote;
		}	
	}
	
	//Populate the appropriate member variables based on SQL action.
	switch(oSQL.Action) {
	    case "insert":
	        oSQL.Fields += sField + ", ";
	        oSQL.Values += sValue + ", ";
	        break;
	    case "select":
	        oSQL.Fields += sField + ", ";
            break;
	    case "update":
	        oSQL.Fields += sField + " = " + sValue + ", ";
	        break;
	    default:
	        alert("Invalid MS Access action: " + oSQL.Action);
	        break
	}
}

//-------------------------------------------------------------------------------------
// Function:	BuildSQL
//
// Synopsis:	Builds a SQL statment to execute a stored procedure.
//
// Arguments:	oSQL			SQL statment being build.
//				sParameter		Parameter name.
//				sValue			Value to assign to parameter.
//				bNumber			Indicates if value is numeric.		
//				bIgnoreQuotes	Indicates if formatting of quotes should be ignored.	
//
// Returns:		none
//
// Notes:		none
//
//-------------------------------------------------------------------------------------
function BuildSQL(oSQL, sParameter, sValue, bNumber, bIgnoreQuotes) {

	//Trim leading blanks.
	if (bNumber != true) {
		sChar = sValue.charAt(0);
		while (sChar == " ") {
			sValue = sValue.substr(1);
			sChar = sValue.charAt(0);
		}
	}

	//Check for empty values, and make them NULL values.
	if (bNumber != true) {
		if (sValue.length == 0 || sValue == "") {sValue = "NULL";}
	}
	
	if (bNumber == true) {
		// Replace format characters.
		if (isNaN(sValue) == true) {
			sValue += "";
			sValue = sValue.replace(/$/g, "");
			sValue = sValue.replace(/,/g, "");
		}
				
		sValue = parseFloat(sValue);
		if (sValue < 0 || isNaN(sValue)) {sValue = "NULL";}
	}
	
	//If value is not numeric, wrap it with single quotes.
	if (bNumber != true && sValue != "NULL") {
		var sSingleQuote = "'";
		var sDoubleQuote = '"';
		var sNewValue;
		var p;
	
		if (bIgnoreQuotes == true) {
			//Just enclose string in single quotes.
			sValue = sSingleQuote + sValue + sSingleQuote;
		}	
		else {
			//Replace all single quotes with a set of three single quotes.
			p = sValue.indexOf(sSingleQuote);
			
			if (p) {
				sNewValue = "";
				while (p >= 0) {
					sNewValue += sValue.substring(0,p) + "''";
					sValue = sValue.substring(p+1);
					p = sValue.indexOf(sSingleQuote);
				}
		
				if (sValue.length) {
					sNewValue += sValue;
					sValue = sNewValue;
				}	
				else {
					sValue = sNewValue;
				}
			}	
		
			//Enclose string in single quotes.
			sValue = sSingleQuote + sValue + sSingleQuote;
		}	
	}
	
	//Prefix with a blank for esthetic reasons.
	oSQL.stmt += " " + sParameter + "=" + sValue + ", ";
}


//-------------------------------------------------------------------------------------
// Function:	BreakItUp
//
// Synopsis:	Breaks the HTML form variables into multiple form variables before
//				submitting the form.
//
// Arguments:	dbDoc	
//				sSQL
//
// Returns:		none
//
// Notes:		102,399 byte limit for each form variable (IIS 5.0 and before).
//
//-------------------------------------------------------------------------------------
function BreakItUp(dbDoc, sSQL) {

	//Set the limit for field size.
	var iFormLimit = 102399;

	//If the length of the SQL is greater than the limit, break it into multiple fields.
	if (sSQL.length > iFormLimit) {
		while (sSQL.length > 0)	{
			//var oInput = dbDoc.createElement("INPUT");
			//oInput.type = "TEXT";
			//oInput.name = "SQL";
			//oInput.value = sSQL.substr(0, iFormLimit);
			//dbDoc.all.frmDB.appendChild(oInput);
			//sSQL = sSQL.substr(iFormLimit);

			var oLabel = dbDoc.createElement("TEXTAREA");
			oLabel.name = "SQL";
			oLabel.value = sSQL.substr(0, iFormLimit);
			dbDoc.all.frmDB.appendChild(oLabel);
			sSQL = sSQL.substr(iFormLimit);
			
		}
	}
	else {
		dbDoc.all.SQL.value = sSQL;
	}
}
	
//-------------------------------------------------------------------------------------
// Assembles the various pieces of SQL into a completed statement.
// For conversion to SQL Server 10/15/08. I changed sSrc statement from 
// sSrc = (oSQL.Type == "t") ? "tbl" + sSrc : "qry" + sSrc; to
// sSrc = (oSQL.Type == "t") ? "tbl" + sSrc : "vw" + sSrc;
//-------------------------------------------------------------------------------------
function FinishMSAccessSQL(oSQL, sSrc) {
	
	//If no fields, assume all fields. If fields specified, trim the trailing comma.
	if (oSQL.Fields.length == 0) {
	    oSQL.Fields = " * ";
	}
	else {
	    oSQL.Fields = oSQL.Fields.substr(0,oSQL.Fields.length - 2); 
	}
	
	//Trim trailing comma from Values string.
	oSQL.Values = oSQL.Values.substr(0,oSQL.Values.length - 2);
	
	//Changed this for SQL conversion 10/15/08.
	//sSrc = (oSQL.Type == "t") ? "tbl" + sSrc : "qry" + sSrc; 
	sSrc = (oSQL.Type == "t") ? "tbl" + sSrc : "vw" + sSrc;

    oSQL.stmt = oSQL.Action + " ";
 	oSQL.stmt.toUpperCase();
 	
 	//Complete the SQL statement with appropriate assembly based on SQL action.
    switch(oSQL.Action) {
        case "insert":
            oSQL.stmt += " INTO " + sSrc + " (" + oSQL.Fields + ") "
            oSQL.stmt += " VALUES (" + oSQL.Values + ")" ;
            break;
        case "select":
            oSQL.stmt += oSQL.Fields + " FROM " + sSrc + " ";
            if (oSQL.Criteria.length > 0) oSQL.stmt += "WHERE " + oSQL.Criteria;
            break;
        case "update":
            oSQL.stmt += sSrc + " SET " + oSQL.Fields + " ";
            if (oSQL.Criteria.length > 0) oSQL.stmt += "WHERE " + oSQL.Criteria;
            break;
        case "delete":
            oSQL.stmt += " FROM " + sSrc + " ";
            if (oSQL.Criteria.length > 0) oSQL.stmt += "WHERE " + oSQL.Criteria;
            break;
        default:
            alert("Invalid MS Access action: " + oSQL.Action);
            break;
    }   
}
