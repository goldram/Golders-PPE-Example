//-------------------------------------------------------------------------------------
//
// Description:	Contains JavaScript specific to selecting products from a list of 
// available products.
//		  
//-------------------------------------------------------------------------------------

function ProductsAvail() {

    var mbDataLoaded = false;
    var mbSavePending = false;
    var mbSaving = false;
    var mbSaveAndClear = false;
    var mbSettingFieldValues = false;
    
    var mbEventHandlersAttached = false; //Ensures event handlers are not attached multiple times.
    
    var mbIE = (!window.addEventListener || navigator.appName.indexOf("Internet Explorer") >= 0) ? true : false;
    
    var mbUseProxy = false;
    var msXHRResponseFormat = "XML";
    
    var moAjax = null;
    var moAjaxEmployees = null;
    var moAjaxProducts = null;
    
    var moCloak = new Cloaker();
    
    var moStatusMsg = null;
    var moMainBox = $("ProductBox");
    var moProductDataBox = $("ProductDataBox");
    var moOrderSummary = null;
    var moOrderItemsList = null;
    var moProductFilter = null;
    
    var moProducts = null;
    var moProductDetails = null;
    
    var msCompanyID = null;
    var msEmployeeGender = null;
    
    //-------------------------------------------------------------------------------------
    // Function to return a reference to the specified element/object in the specified container.
    //-------------------------------------------------------------------------------------
    function $field(sID, oBox) {

        if (!oBox) oBox = moMainBox;

        var oItem = null;
        
        try {
	        for (var i=0; i < oBox.childNodes.length; i++)
	        {
	            var oItem = oBox.childNodes[i];
	            if (oItem.id == sID) return oItem;
	        }
        }
        catch(e) {
            return null;
        }
        
        //If we get here, element/field item was not found.
        return null;
    }
     
    //-------------------------------------------------------------------------------------
    // Function to return the value for the specified element/object in the specified container.
    //-------------------------------------------------------------------------------------
    function $fieldVal(sID, oBox) {
            
        if (!oBox) oBox = moMainBox;

        var oItem = null;
        
        try {
	        for (var i=0; i < oBox.childNodes.length; i++)
	        {
	            var oItem = oBox.childNodes[i];
	            if (oItem.id == sID) return oItem.value;
	        }
        }
        catch(e) {
            return null;
        }
        
        //If we get here, element/field item was not found.
        return null;
    }
        
    //-------------------------------------------------------------------------------------
	// Add selected Product to the Order.
    //-------------------------------------------------------------------------------------
    function AddProductToOrder(e) 
    {
    	var evt = window.event || e;
	    var oSrc = evt.srcElement || e.target;
	    var sType = evt.type || e.type;
	    
	    SetStatusMsg("StatusMsg", "Adding item to order...", "", false);
	    
	    var sProductID = oSrc.getAttribute("ProductID");
	    var sProductCategoryID = oSrc.getAttribute("ProductCategoryID");
	    
	    //var oProductBox = $("ProductItemBox" + sProductID + sProductCategoryID);
	    
	    //Get the product record.
	    for (var i=0; i<moProducts.length; i++)
	    {
	        if ($data("ProductID", moProducts[i]) == sProductID && 
	            $data("ProductCategoryID", moProducts[i]) == sProductCategoryID
	        ) 
	        {
	            var oRecord = moProducts[i];
	            break;
	        }
	    }    
	    
        //Build the Order Item record based on the selected Product.
        var sCategory = $data("ProductCategory", oRecord);
        var sGroup    = $data("ProductGroup",    oRecord);
            
        var sType = (sCategory == sGroup) ? sCategory : sCategory + " - " + sGroup;
        		        
        var oData = {
            "OrderItemID"       : "0",
            "ProductID"         : $data("ProductID", oRecord), 
            "ProductCategoryID" : $data("ProductCategoryID", oRecord), 
            "ProductCategory"   : $data("ProductCategory", oRecord), 
            "ProductGroupID"    : $data("ProductGroupID", oRecord), 
            "ProductGroup"      : $data("ProductGroup", oRecord), 
            "SKU"               : $data("SKU", oRecord), 
            "Brand"             : $data("Brand", oRecord), 
            "ProductName"       : $data("ProductName", oRecord), 
            "ProductDesc"       : $data("ProductDesc", oRecord), 
            "Gender"            : $data("Gender", oRecord), 
            "ItemStatus"        : "pending", 
            "DeliverDate"       : "",
            "DeliverDateDetail" : "",
            "DeliverMethod"     : "",
            "Qty"               : $("Qty"   + sProductID).value, 
            "Size"              : $("Size"  + sProductID).innerHTML, 
            "Color"             : $("Color" + sProductID).value
            //,
            //"Comments"          : $field("Comments",oProductBox).value 
        }
	        
        moOrderItemsList.AddOrderItem(oData);
	            
        var sMsg = "Product added to the order.";
        SetStatusMsg("StatusMsg", sMsg, "", false, true);
        
//        var sProductType = oData.ProductCategory;
//        sProductType += (sProductType === oData.ProductGroup) ? "" : " - " + oData.ProductGroup;
//        
//        sMsg = "The following item has been added to your cart:\n\n";
//        sMsg += "Item: " + sProductType + " - " + oData.ProductName + "\n";
//        sMsg += "Qty: " + oData.Qty + "\n";
//        sMsg += "Size: " + oData.Size + "\n";
//        sMsg += "Color: " + oData.Color + "\n";
//        sMsg += "\n";
//        sMsg += "When you have finished adding items to your cart, be sure to close\n";
//        sMsg += "this window and then submit/save the changes.";
//        alert(sMsg);

    
    }
      	
    //-------------------------------------------------------------------------------------
    // Resets/clears all status message objects when the user begins typing into an input 
    // field.
    //-------------------------------------------------------------------------------------
    function ClearStatusMsg() 
    {

        SetStatusMsg("StatusMsg", "");
    }

    //-------------------------------------------------------------------------------------
    // Returns a string of pipe-delimited values containing the Order Quantity values.
    //-------------------------------------------------------------------------------------
    function GetOrderQtyValues() {

        var sVals = "";
        
        var bInvalidValuesFound = false;
            
        var oData = moProductsBox.childNodes;

        //Build pipe-delimited string of values. Each name-value pair is separated by a 
        //single pipe character, and each record is separated by two pipe-characters. 
        var bValidDate;
        for (var i=0; i<oData.length; i++)
        {
            //ignore text nodes.
            if (oData[i].nodeType != 1) continue; 
            
            var sStatus = oData[i].getAttribute("UpdateStatus");
            
            var sOrderID = oData[i].getAttribute("OrderID");
            var sProductGroupID = oData[i].getAttribute("ProductGroupID");
            var sQty = GetFieldValue(oData[i],"OrderQty").Value;
           
            if (sStatus == "delete") 
            {
                sVals += "UpdateStatus="    + sStatus  + "|";
                sVals += "OrderID="         + sOrderID + "|";
                sVals += "ProductGroupID="  + sProductGroupID + "|";
                       
                sVals += "|"; //Double-up pipe character for record delimiter.
            }
            else
            if (sStatus == "update" || sStatus == "insert") 
            {
                sVals += "UpdateStatus="    + sStatus           + "|";
                sVals += "OrderID="         + sOrderID          + "|";
                sVals += "ProductGroupID="  + sProductGroupID   + "|";
                sVals += "Qty="             + sQty              + "|";
                 
                //var oField = GetFieldValue("RegCount");
                //if (oDateField.Updated) sVals += "RegCount=" + oField.Value + "|";
                        
                sVals += "|"; //Double-up pipe character for record delimiter.
            }
            
        }

        //alert("Modified Exam Time values: " + sVals);

        //Return string to caller.
        return (bInvalidValuesFound) ? "ERROR: Invalid values found." : sVals;
    }

    //-------------------------------------------------------------------------------------
    // Hide the main user interface. 
    //-------------------------------------------------------------------------------------
    this.HideUI = function() {
    
        ClearStatusMsg();
    
        //Hide the cloak.
        moCloak.Hide();

        //Hide the popup.
	    moMainBox.style.visibility = "hidden";
	    moMainBox.style.display = "none";
    }

    //-------------------------------------------------------------------------------------
    // Retrieves all data required by the user interface.
    //-------------------------------------------------------------------------------------
    this.InitUI = function(oOrderSummary, oOrderItemsList, sEmployeeGender) {
    
        msCompanyID = oOrderSummary.GetCompanyID();
        
        moOrderSummary = oOrderSummary;
        moOrderItemsList = oOrderItemsList;
        
        msEmployeeGender = sEmployeeGender;
    
        //Set the status message object.
        var oItems = moMainBox.getElementsByTagName("LABEL");
        for (var i=0; i<oItems.length; i++)
        {
            if (oItems[i].className == "StatusMsg") 
            {
                moStatusMsg = oItems[i];
                break;
            }
        }
        
        //Set the Product Filter object.
        var oItems = moMainBox.getElementsByTagName("SELECT");
        for (var i=0; i<oItems.length; i++)
        {
            if (oItems[i].id == "Filter") 
            {
                moProductFilter = oItems[i];
                break;
            }
        }
        
        //Add event handler to filter.
        AddEvt(moProductFilter,"change", SetChangeToFilter);
        
        RetrieveProducts();  
    }
    
    //-------------------------------------------------------------------------------------
	// Populate container with Products.
    //-------------------------------------------------------------------------------------
    function PopulateProductBox(sFilter) 
    {
		//Clear the data box contents.
		moProductDataBox.innerHTML = "";
		
		//testing....
		//alert("Product Count for CompanyID " + msCompanyID + " = " + moProducts.length);
		
        //Display data.
        var iItemsDisplayed = 0;
        for (var i=0; i < moProducts.length; i++) 
        {
            var oRecord = moProducts[i];
	        
            var sCategoryID = $data("ProductCategoryID",    oRecord);
            var sCategory   = $data("ProductCategory",      oRecord);
            var sGroupID    = $data("ProductGroupID",       oRecord);
            var sGroup      = $data("ProductGroup",         oRecord);
            
            if (moOrderSummary.GetQtyRequirement(sCategoryID, sGroupID) == 0) continue;
            
            var sType = (sCategory == sGroup) ? sCategory : sCategory + " - " + sGroup;
	        
	        if (sFilter == "all" || sType == sFilter)
	        {		        
                var oData = {
	                "ProductID"         : $data("ProductID", oRecord), 
	                "ProductCategoryID" : $data("ProductCategoryID", oRecord), 
	                "ProductCategory"   : $data("ProductCategory", oRecord), 
	                "ProductGroupID"    : $data("ProductGroupID", oRecord), 
	                "ProductGroup"      : $data("ProductGroup", oRecord), 
	                "SKU"               : $data("SKU", oRecord), 
	                "Brand"             : $data("Brand", oRecord), 
	                "ProductName"       : $data("ProductName", oRecord), 
	                "ProductDesc"       : $data("ProductDesc", oRecord), 
	                "Gender"            : $data("Gender", oRecord), 
	                "Colors"            : $data("Colors", oRecord), 
	                "Sizes"             : $data("Sizes", oRecord), 
	                "Image"             : $data("Image", oRecord), 
	                "ProductHilites"    : $data("ProductDetails", oRecord) 
	            }
    	        
	            PopulateProductBoxItem(moProductDataBox, oData, "insert");
	            
	            iItemsDisplayed++;
	        }
	    }
	    
	    //Show count.
	    var sCountMsg = iItemsDisplayed;
	    sCountMsg += (iItemsDisplayed == 1) ? " item displayed" : " items displayed";
	    $("CountMsg").innerHTML = sCountMsg;
	    
	    //Hide/unhide scroll message.
	    $("ScrollMsg").style.visibility = (iItemsDisplayed > 1) ? "visible" : "hidden";
    
    }
            
    //-------------------------------------------------------------------------------------
    // Inserts a new data item into the Products data box.
    //-------------------------------------------------------------------------------------
    function PopulateProductBoxItem(oBox, oData, sUpdateStatus) {
    
        //Adjustment for field padding and/or border width.
        var iAdjust = 1;
        var iCalAdjust = 23;
        
        //Insert container for all columns/fields.
	    var oItemBox = document.createElement("DIV");
	    oItemBox.id = "ProductItemBox" + oData.ProductID;
	    oItemBox.className = "ProductItemBox";
        //oItemBox.setAttribute("UpdateStatus", sUpdateStatus);
        oItemBox.setAttribute("ProductID", oData.ProductID);
        oItemBox.setAttribute("ProductCategoryID", oData.ProductCategoryID);
        oItemBox.setAttribute("ProductGroupID", oData.ProductGroupID);
        oItemBox.setAttribute("Gender", oData.Gender);
	    oBox.appendChild(oItemBox);
	    
        //Insert container for the image.
	    var oImageBox = document.createElement("DIV");
	    //oItemBox.id = "ImageBox";
	    oImageBox.className = "ImageBox";
        //oItemBox.setAttribute("UpdateStatus", sUpdateStatus);
	    oItemBox.appendChild(oImageBox);
	    
        //Insert the image.
	    var oItem = document.createElement("IMG");
	    //oItemBox.id = "ImageBox";
	    //oImageBox.className = "ImageBox";
        //oItemBox.setAttribute("UpdateStatus", sUpdateStatus);
        var sImg = "img/products/";
        sImg += (oData.Image) ? oData.Image : "image-missing.png";
        oItem.src = sImg;
        oItem.setAttribute("ProductID", oData.ProductID);
        oItem.setAttribute("ProductCategoryID", oData.ProductCategoryID);
	    oImageBox.appendChild(oItem);
	    
        //Insert container for the details.
	    var oDetailBox = document.createElement("DIV");
	    oDetailBox.id = "DetailBox" + oData.ProductID;
	    oDetailBox.className = "DetailBox";
        //oItemBox.setAttribute("UpdateStatus", sUpdateStatus);
        oDetailBox.setAttribute("ProductID", oData.ProductID);
        oDetailBox.setAttribute("ProductCategoryID", oData.ProductCategoryID);
	    oItemBox.appendChild(oDetailBox);
	    
        //Insert the Product Name.
	    var oItem = document.createElement("LABEL");
	    oItem.className = "ProductName";
        oItem.innerHTML = oData.Brand + " - " + oData.ProductName;
	    //oImageBox.className = "ImageBox";
        oItem.setAttribute("ProductID", oData.ProductID);
        oItem.setAttribute("ProductCategoryID", oData.ProductCategoryID);
	    oDetailBox.appendChild(oItem);
	    
        //Insert container for the Product Highlights.
	    var oHilitesBox = document.createElement("DIV");
	    //oItemBox.id = "ImageBox";
	    oHilitesBox.className = "ProductHilitesBox";
        //oItemBox.setAttribute("UpdateStatus", sUpdateStatus);
        oHilitesBox.setAttribute("ProductID", oData.ProductID);
        oHilitesBox.setAttribute("ProductCategoryID", oData.ProductCategoryID);
	    oDetailBox.appendChild(oHilitesBox);
	    
	    PopulateProductHilites(oHilitesBox, oData.ProductHilites)
	    	    
        //Insert container for the Color options.
	    var oColorBox = document.createElement("DIV");
	    oColorBox.id = "ColorBox" + oData.ProductID;
	    oColorBox.className = "ColorBox";
        //oItemBox.setAttribute("UpdateStatus", sUpdateStatus);
        oColorBox.setAttribute("ProductID", oData.ProductID);
        oColorBox.setAttribute("ProductCategoryID", oData.ProductCategoryID);
	    oDetailBox.appendChild(oColorBox);
	    
        //Insert the Color field header.
	    var oItem = document.createElement("LABEL");
	    oItem.className = "ColorHdr";
        oItem.innerHTML = "Color: ";
	    //oImageBox.className = "ImageBox";
	    oColorBox.appendChild(oItem);
	    
        //Insert the Color field value.
	    var oItem = document.createElement("SELECT");
	    oItem.id = "Color" + oData.ProductID;
	    oItem.className = "Color";
        oItem.width = "60px";
	    //oImageBox.className = "ImageBox";
        AddEvt(oItem,"change",SetChangeToColor);
        oItem.setAttribute("ProductID", oData.ProductID);
        oItem.setAttribute("ProductCategoryID", oData.ProductCategoryID);
	    oColorBox.appendChild(oItem);
	    
	    PopulateColorOptions(oItem, oData.Colors);

        //Insert container for the Size options.
	    var oSizeBox = document.createElement("DIV");
	    oSizeBox.id = "SizeBox" + oData.ProductID + "-" + oData.ProductCategoryID;
	    oSizeBox.className = "SizeBox";
        //oItemBox.setAttribute("UpdateStatus", sUpdateStatus);
        oSizeBox.setAttribute("ProductID", oData.ProductID);
        oSizeBox.setAttribute("ProductCategoryID", oData.ProductCategoryID);
	    oDetailBox.appendChild(oSizeBox);
	    
        //Insert the Size field header.
	    var oItem = document.createElement("LABEL");
	    oItem.className = "SizeHdr";
        oItem.innerHTML = "Size: ";
	    //oImageBox.className = "ImageBox";
	    oSizeBox.appendChild(oItem);
	    
        //Insert the Size field value.
	    var oItem = document.createElement("LABEL");
	    oItem.id = "Size" + oData.ProductID;
	    oItem.className = "Size";
	    oItem.innerHTML = "";
	    //oImageBox.className = "ImageBox";
        oItem.setAttribute("ProductID", oData.ProductID);
        oItem.setAttribute("ProductCategoryID", oData.ProductCategoryID);
	    oSizeBox.appendChild(oItem);

        //Insert container for the Size Selection box.
	    var oSizeOptionsBox = document.createElement("DIV");
	    oSizeOptionsBox.id = "SizeOptionsBox" + oData.ProductID;
	    oSizeOptionsBox.className = "SizeOptionsBox";
	    //oSizeOptionsBox.innerHTML = "<label>1.5</label><label>2.5</label><label>3.5</label>";
        //oItemBox.setAttribute("UpdateStatus", sUpdateStatus);
        oSizeOptionsBox.setAttribute("ProductID", oData.ProductID);
        oSizeOptionsBox.setAttribute("ProductCategoryID", oData.ProductCategoryID);
	    oDetailBox.appendChild(oSizeOptionsBox);
	    
	    PopulateSizeOptions(oSizeOptionsBox,oData.Sizes);
	    	    	    	    
        //Insert container for the AddToOrder objects.
	    var oAddToOrderBox = document.createElement("DIV");
	    oAddToOrderBox.id = "AddToOrderBox" + oData.ProductID;
	    oAddToOrderBox.className = "AddToOrderBox";
        //oItemBox.setAttribute("UpdateStatus", sUpdateStatus);
        oAddToOrderBox.setAttribute("ProductID", oData.ProductID);
        oAddToOrderBox.setAttribute("ProductCategoryID", oData.ProductCategoryID);
	    oDetailBox.appendChild(oAddToOrderBox);
	    
        //Insert the Qty field header.
	    var oItem = document.createElement("LABEL");
	    oItem.className = "QtyHdr";
        oItem.innerHTML = "Quantity: ";
	    //oImageBox.className = "ImageBox";
	    oAddToOrderBox.appendChild(oItem);
	    
        //Insert the Qty field value.
	    var oItem = document.createElement("SELECT");
	    oItem.id = "Qty" + oData.ProductID;
	    oItem.className = "Qty";
	    //oImageBox.className = "ImageBox";
        AddEvt(oItem,"change",SetChangeToQty);
        oItem.setAttribute("ProductID", oData.ProductID);
        oItem.setAttribute("ProductCategoryID", oData.ProductCategoryID);
	    oAddToOrderBox.appendChild(oItem);
	    
	    PopulateQtyOptions(oItem,oData.Quantities);
	    
        //Insert the AddToOrder button.
	    var oItem = document.createElement("a");
	    oItem.id = "AddToOrder" + oData.ProductID;
	    oItem.className = "AddToOrder";
        oItem.innerHTML = "Add To Order";
        oItem.left = "400px";
	    //oImageBox.className = "ImageBox";
        AddEvt(oItem,"click",AddProductToOrder);
        oItem.setAttribute("ProductID", oData.ProductID);
        oItem.setAttribute("ProductCategoryID", oData.ProductCategoryID);
	    oAddToOrderBox.appendChild(oItem);
	    
	    //Adjust the height of the Highlights box if the AddToOrder box is getting walked on by 
	    //the size options.
	    var iSizeBox = oSizeBox.offsetTop + oSizeBox.offsetHeight + oSizeOptionsBox.offsetHeight + 10;
	    if (iSizeBox > oAddToOrderBox.offsetTop) 
	    {
	        oHilitesBox.style.overflow = "auto";
	        oHilitesBox.style.height = oHilitesBox.offsetHeight - 10 - (iSizeBox - oAddToOrderBox.offsetTop) + "px";
	    }
	    
    }    
     
    //-------------------------------------------------------------------------------------
	// Populate dropdown with Color options.
    //-------------------------------------------------------------------------------------
    function PopulateColorOptions(oDropdown, sOptions) 
    {
		//Clear the dropdown.
		oDropdown.innerHTML = "";
		
		if (!sOptions || sOptions.length == 0) 
		{
		    oDropdown.options[oDropdown.options.length] = new Option("", "");
		    return;
		} 
		
	    //Fill dropdown with values passed.
		var oOptions = sOptions.split("|");
        for (var i=0; i < oOptions.length; i++) 
        {
            oDropdown.options[oDropdown.options.length] = new Option(oOptions[i], oOptions[i]); 
	    }
    }
     
    //-------------------------------------------------------------------------------------
	// Populate dropdown with unique Product Types (Product Category and Product Group).
    //-------------------------------------------------------------------------------------
    function PopulateProductFilter() 
    {
        var oDropdown = moProductFilter;
        
		//Clear the dropdown.
		oDropdown.innerHTML = "";
    
        //Add the "ALL Available Products" option which is the default.
        //AddSelectOption(document, oDropdown, "All Available Products", 0, 0);
	    oDropdown.options[oDropdown.options.length] = new Option("All Available Products", "all"); 
		
	    //Populate dropdown with unique Product Types which is the Product Category and 
	    //the Product Group combined and separated with a dash).
		var sLastType = "";
        for (var i=0; i < moProducts.length; i++) 
        {
            var oRecord = moProducts[i];
            
            var sCategoryID = $data("ProductCategoryID",    oRecord);
            var sCategory   = $data("ProductCategory",      oRecord);
            var sGroupID    = $data("ProductGroupID",       oRecord);
            var sGroup      = $data("ProductGroup",         oRecord);
            
            if (moOrderSummary.GetQtyRequirement(sCategoryID, sGroupID) == 0) continue;
            
            var sType = (sCategory == sGroup) ? sCategory : sCategory + " - " + sGroup;
            
	        if (sType != sLastType) 
	        {
	            oDropdown.options[oDropdown.options.length] = new Option(sType, sType); 
	            sLastType = sType;
	        }
	    }
    }
     
    //-------------------------------------------------------------------------------------
	// Populate textbox with Product Highlights.
    //-------------------------------------------------------------------------------------
    function PopulateProductHilites(oBox, sHilites) 
    {
		//Clear the dropdown.
		oBox.innerHTML = "";
		
		if (!sHilites || sHilites.length == 0) 
		{
		    oBox.innerHTML = "(no product highlights)";
		    oBox.style.height = "60px";
		    return;
		} 
		
		var sHtml = "<ul>";
		
	    //Fill dropdown with text passed.
		var oHilites = sHilites.split("|");
        for (var i=0; i < oHilites.length; i++) 
        {
            sHtml += "<li>" + oHilites[i] + "</li>"; 
	    }
	    
	    sHtml += "</ul>";
	    
	    oBox.innerHTML = sHtml;
	    
    }   
          
    //-------------------------------------------------------------------------------------
	// Populate dropdown with Quantity options.
    //-------------------------------------------------------------------------------------
    function PopulateQtyOptions(oDropdown, sOptions) 
    {
		//Clear the dropdown.
		oDropdown.innerHTML = "";
		
		if (!sOptions || sOptions.length == 0) 
		{
	        //Fill dropdown with default values.
		    for (var i=1; i <= 20; i++) 
            {
                oDropdown.options[oDropdown.options.length] = new Option(i, i); 
	        }
		} 
		else {
	        //Fill dropdown with values passed.
		    var oOptions = sOptions.split("|");
            for (var i=0; i < oOptions.length; i++) 
            {
                oDropdown.options[oDropdown.options.length] = new Option(oOptions[i], oOptions[i]); 
	        }
	    }
    }     
    
    //-------------------------------------------------------------------------------------
	// Populate dropdown with options.
    //-------------------------------------------------------------------------------------
    function PopulateSizeOptions(oBox, sOptions) 
    {
		//Clear the dropdown.
		oBox.innerHTML = "";
		
		if (!sOptions || sOptions.length == 0) {
		    oBox.innerHTML = "<p class='NoOptionsMsg'>No Size options available for this product.</p>";
		    return;
		}
		
		var oOptionLines = [];
		
		if (sOptions.indexOf("||") > 0) 
		    oOptionLines = sOptions.split("||");
		else
		    oOptionLines.push(sOptions);
				
		for (var p=0; p < oOptionLines.length; p++)
        {    	    	    
            //Insert container row to hold all Size options for the Size Option Type.
            var oOptionRow = document.createElement("DIV");
            //oItemBox.id = "ImageBox";
            oOptionRow.className = "SizeOptionRow";
            oOptionRow.style.width = "600px";
            //oItemBox.setAttribute("UpdateStatus", sUpdateStatus);
            oBox.appendChild(oOptionRow);
            
            var oParts = oOptionLines[p].split("=");
            var sOptionType = oParts[0];
            var sSizes = oParts[1];
            
            if (oOptionLines.length > 1) 
            {
	            var oItem = document.createElement("SPAN");
	            //oItemBox.id = "xxxxx";
	            oItem.className = (oOptionLines.length > 1 && p == 0) ? "SizeOptionHdr" : "SizeOption";
	            oItem.innerHTML = sOptionType;
                oItem.style.fontWeight = "normal";
                oItem.style.width = "50px";
                oItem.style.cursor = "default";
	            oOptionRow.appendChild(oItem);
	    
	            //Remove the bottom border from each option in the last/only row.    
	            if (p == (oOptionLines.length-1)) oItem.style.borderBottomWidth = "0px";
            }
                        
	        //Fill container with Size options passed.
		    var oOptions = sSizes.split("|");
            for (var i=0; i < oOptions.length; i++) 
            {
	            var oItem = document.createElement("SPAN");
	            //oItemBox.id = "xxxxx";
	            
	            if (oOptions[i].substring(0,1) == "-") {
	                oItem.className = "SizeOptionNotAvail";
	                op = oOptions[i].substring(1);
	                oItem.innerHTML = op;
                    oItem.setAttribute("DefaultBgColor",oItem.style.background);
	                //oItem.style.fontColor = "rgb(200,200,200)";
	            }
	            else if (oOptionLines.length > 1 && p == 0)
	            {
	                oItem.className = "SizeOptionHdr";
	                oItem.innerHTML = oOptions[i];
                    oItem.setAttribute("DefaultBgColor",oItem.style.background);
	            }
	            else {
	                oItem.className = "SizeOption";
	                oItem.innerHTML = oOptions[i];
	                
	                //Only save the Option Type/Label if we have multiple rows of options.
	                if (oOptionLines.length > 1) oItem.setAttribute("OptionType",sOptionType);
	                
	                //Hold onto the background color so we can reset it properly after
	                //highlighting or selecting.
                    oItem.setAttribute("DefaultBgColor",oItem.style.background);
                    oItem.setAttribute("ProductID", oBox.getAttribute("ProductID"));
                    
                    AddEvt(oItem,"mouseover",SetSizeOptionHilite);
                    AddEvt(oItem,"mouseout",SetSizeOptionHilite);
                    AddEvt(oItem,"click",SetSizeOptionSelected);
                    
                    //oItemBox.setAttribute("UpdateStatus", sUpdateStatus);
                }
	            oOptionRow.appendChild(oItem);
	    
	            //Remove the bottom border from each option in the last/only row.    
	            if (p == (oOptionLines.length-1)) oItem.style.borderBottomWidth = "0px";
	        }
	    
	        //Adjust the width of the row/box to fit its contents. 
	        var oLastChild = oOptionRow.lastChild;
            oOptionRow.style.width = oLastChild.offsetLeft + oLastChild.offsetWidth + 6 + "px"; //NOTE: Added 1px to allow for IE 9 compat.
	    }
    }
               
    //-------------------------------------------------------------------------------------
    // Submits AJAX request to retrieve order quantity defaults.
    //-------------------------------------------------------------------------------------
    function RetrieveProducts() {

	    //Display status message.   
	    //ClearStatusMsg("main"); 
	    SetStatusMsg("StatusMsg", "Retrieving products, please wait...", "", false);
 	    
	    //Create XmlHttpRequest object.
	    moAjaxProducts = AjaxCreate("Products");
	    if (!moAjaxProducts) return;
            
	    //Build parms string.
        var sParms	= "";
	    sParms += "&Action=" + encodeURI("GetProducts");
	    sParms += "&CompanyID=" + encodeURI(msCompanyID);
    	
	    //Initiate call to database.
	    var bSuccess = AjaxSend(moAjaxProducts, sParms, RetrieveProductsCallback);
    	
	    //If not initiated, clear all status messages. 
	    if (!bSuccess) ClearStatusMsg();

    }

    //-------------------------------------------------------------------------------------
    // Callback for RetrieveProducts method. 
    //-------------------------------------------------------------------------------------
    function RetrieveProductsCallback() 
    {  
	    if ((moAjaxProducts.readyState == 4) && (moAjaxProducts.status == 200))  
	    {  
			var sResult = moAjaxProducts.responseText;
			
			var sError = AjaxError(sResult);
			if (sError.length > 0)  
			{
			    alert("Unable to retrieve products available. \n\n\ Error details:" + sError);
			    moAjaxProducts = null;
			    return;
			}
			
			var oXml = (mbIE) ? moAjaxProducts.responseXML.childNodes[0] : moAjaxProducts.responseXML.documentElement; 
			    
			moProducts = oXml.getElementsByTagName("Table");
			
			//Release memory for AJAX object.
			moAjaxProducts = null;
            
            //Populate the Product Types filter dropdown.
            PopulateProductFilter();
            
            //Populate the Products container.
            PopulateProductBox("all");
            
            //Adjust height of popup.
            //moMainBox.style.height = moProductsBox.offsetTop + (moProductsBox.offsetHeight) + "px"; 
            moMainBox.style.height = "640px";
               		
            var sMsg = "Products retrieved successfully.";
            SetStatusMsg("StatusMsg", sMsg, "", false, true);
	       
	        //Display success message in Order Items list.
            moOrderItemsList.SetStatusMsgForProductsLoading(true);
	    } 
    }
    
    //-------------------------------------------------------------------------------------
    // Apply change to Color field value.
    //-------------------------------------------------------------------------------------
    function SetChangeToColor(e) {
    	
    	var evt = window.event || e;
	    var oSrc = evt.srcElement || e.target;
	    var sType = evt.type || e.type;
	    
	    var sProductID = oSrc.getAttribute("ProductID");
	    
	    $("ProductItemBox" + sProductID).setAttribute("Color", oSrc.value);
	    
    }   
    
    //-------------------------------------------------------------------------------------
    // Apply selected filter to the list of Products.
    //-------------------------------------------------------------------------------------
    function SetChangeToFilter(e) {
    	
    	var evt = window.event || e;
	    var oSrc = evt.srcElement || e.target;
	    var sType = evt.type || e.type;
	    
	    SetStatusMsg("StatusMsg", "Applying product filter...", "", false);
	    
	    var sFilter = moProductFilter.value;
	    
        PopulateProductBox(sFilter);    
        
        var sMsg = "Product list filter applied successfully.";
        SetStatusMsg("StatusMsg", sMsg, "", false, true);
    }   
    
    //-------------------------------------------------------------------------------------
    // Apply change to Qty field value.
    //-------------------------------------------------------------------------------------
    function SetChangeToQty(e) {
    	
    	var evt = window.event || e;
	    var oSrc = evt.srcElement || e.target;
	    var sType = evt.type || e.type;
	    
	    var sProductID = oSrc.getAttribute("ProductID");
	    
	    $("ProductItemBox" + sProductID).setAttribute("Qty", oSrc.value);
	    
    }   

    //-------------------------------------------------------------------------------------
    // Adds or removes highlighting for product Size option.
    //-------------------------------------------------------------------------------------
    function SetSizeOptionHilite(e) {

	    var evt = window.event || e;
	    var oSrc = evt.srcElement || e.target;
	    var sType = evt.type || e.type;
    	
        if (sType == "mouseover") {
    	    if (oSrc.style.backgroundColor != "orange") oSrc.style.backgroundColor = "yellow";
            //oSrc.style.borderColor = "yellow";
        }
        else {
            try {
                if (oSrc.style.backgroundColor != "orange") oSrc.style.backgroundColor = oSrc.getAttribute("DefaultBgColor"); 
            }
            catch(e) {
                //ignore error
            }
        }      
    }

    //-------------------------------------------------------------------------------------
    // Sets/adds the selected product Size option.
    //-------------------------------------------------------------------------------------
    function SetSizeOptionSelected(e) {

	    var evt = window.event || e;
	    var oSrc = evt.srcElement || e.target;
	    var sType = evt.type || e.type;
	    
    	var oOptionBox = oSrc.parentNode.parentNode;
    	        
        var sProductID = oOptionBox.getAttribute("ProductID");
        var sProductCategoryID = oOptionBox.getAttribute("ProductCategoryID");
    	
    	//Reset/clear all options.
    	for (var p=0; p < oOptionBox.childNodes.length; p++)
    	{      
    	    var oRowBox = oOptionBox.childNodes[p];
    	    for (var i=0; i<oRowBox.childNodes.length; i++)
    	    {
    	        var op = oRowBox.childNodes[i];
    	        op.style.backgroundColor = op.getAttribute("DefaultBgColor");
            } 
        }
        
        //Hilite/Select the selected option.
        oSrc.style.backgroundColor = "orange";
        
        var sType = oSrc.getAttribute("OptionType");
        
        //Append the Option Type to the selected value if it exists.
        var sValue = (sType == null) ? oSrc.innerHTML : oSrc.innerHTML + " (" + oSrc.getAttribute("OptionType") + ")"
        
        //Display the selected value.
        $("SizeBox" + sProductID + "-" + sProductCategoryID).getElementsByTagName("LABEL")[1].innerHTML = sValue;         
        
        //Set the text displayed in the Size field.
//        var oItems = oOptionBox.parentNode.getElementsByTagName("LABEL");
//        for (var i=0; i<oItems.length; i++)
//        {
//            if (oItems[i].id == "Size") 
//            {
//                sType = oSrc.getAttribute("OptionType");
//                
//                //Append the Option Type to the selected value if it exists.
//                var sValue = (sType == null) ? oSrc.innerHTML : oSrc.innerHTML + " (" + oSrc.getAttribute("OptionType") + ")"
//                
//                //Display the selected value.
//                oItems[i].innerHTML = sValue;
//                
//                //Also save the value as an attribute in the primary/top-level Product container for easier
//                //access if the product is added to the order.
//                var sProductID = oItems[i].getAttribute("ProductID");
//                $("ProductItemBox" + sProductID).setAttribute("Size", sValue);
//                
//                break;
//            }
//        }
//       
            
    }
        
    //-------------------------------------------------------------------------------------
    // Sets status message. 
    //-------------------------------------------------------------------------------------
    function SetStatusMsg(sMsgID, sMsg, sDetails, bError, bTimeout, sColor, iTimeoutLength) 
    {
	    var oMsg = (sMsgID == "StatusMsg") ? moStatusMsg : $(sMsgID);
    	
	    if (bError) 
	    {
		    oMsg.style.color = "red";
		    oMsg.innerHTML = sMsg;
		    oMsg.title = sDetails;
		    oMsg.style.visibility = "visible";
	    }
	    else if ((sMsg.length > 0) && (!bError))
	    {
		    oMsg.style.color = (sColor) ? sColor : "rgb(255,227,0)";  //darker green by default
		    oMsg.innerHTML = sMsg;
		    if (sDetails) oMsg.title = sDetails;
		    oMsg.style.visibility = "visible";
	    }
	    else 
	    {
		    oMsg.style.color = "green";
		    oMsg.innerHTML = "";
		    oMsg.title = "";
		    oMsg.style.visibility = "hidden";
	    }		
         
	    //Clear message after a delay, if requested.
	    if (bTimeout) {
	        iTimeoutLength = (iTimeoutLength == null) ? 2000 : iTimeoutLength;
	        //setTimeout("SetStatusMsg('" + sMsgID + "','')", iTimeoutLength); 
	        //setTimeout("ClearStatusMsg()", iTimeoutLength); 
	        setTimeout(function() {SetStatusMsg(sMsgID,"");}, iTimeoutLength); 
	    }  

    }

    //-------------------------------------------------------------------------------------
    // Show the main user interface.
    //-------------------------------------------------------------------------------------
    this.ShowUI = function(iLeft, iTop, zIndex) {
        
        if (!iTop) iTop = 250;
        if (!iLeft) iLeft = 10;
        
        if (!zIndex || parseInt(zIndex) == 0) zIndex = GetMaxZindex();
                    
        //Throw a cloak over all elements on the page.
        var bModal = true;
        moCloak.Show("ContentBox", zIndex, "ContentBox");
        
        //Set darkness of the cloak to the darkest shade.
        moCloak.Darkest();
        
        //SetFieldDefaults(sFirstName, sLastName, sZipCode);
        
        moMainBox.style.zIndex = zIndex + 1;
        
        //moMainBox.style.left = iLeft + "px";
        //moMainBox.style.top  = iTop + "px";
        
        //new stuff
        /*
        moMainBox.style.left = "50%";     
        moMainBox.style.top = "50%"; 
        var iMarginTop = parseInt(moMainBox.offsetHeight / 2, 10) - $("ContentBox").scrollTop;
        var iMarginLeft = parseInt(moMainBox.offsetWidth / 2, 10);
        moMainBox.style.margin = "-" + iMarginTop + "px 0px 0px -" + iMarginLeft + "px"; 
        */
        
        //var iContentHeight = $("ContentBox").offsetTop + $("ContentBox").offsetHeight;
        
        //while ((moMainBox.offsetTop + moMainBox.offsetHeight) > iContentHeight){
        //    moMainBox.style.top = (moMainBox.offsetTop - 100) + "px";
        //}   
        
       
        //Tweak for IE10, may not work.
        //moMainBox.style.top = (moMainBox.offsetTop - 10) + "px";

       
        moMainBox.style.position = "fixed";
        moMainBox.style.left = "20px";
        moMainBox.style.top = "20px";
        moMainBox.style.borderWidth = "4px";
        moMainBox.style.visibility = "visible";
        moMainBox.style.display = "inline";
        
        //moMainBox.style.width  = $("PopupContent").offsetWidth + "px";
        //moMainBox.style.height = $("PopupContent").offsetHeight + "px";
       
    }
    
    //-------------------------------------------------------------------------------------
    // Validates data. 
    //-------------------------------------------------------------------------------------
    function ValidateChanges() 
    {
    
    
    return true;
    
    
    
    
        var bValid = true;
        
        //Validate field values.
        var oRows = $("DeptDataBox").childNodes;
        
        //Make sure no duplicates for Department Name or Department Code.
        for (var i=0; i<oRows.length; i++) 
        {
            var sDeptName = GetFieldValue(oRows[i],"DeptName").Value;
            var sDeptCode = GetFieldValue(oRows[i],"DeptCode").Value;
            
            if (!ValidateForDuplicates("DeptName", sDeptName, i))
            {
                var sMsg = "Department " + sDeptName + " is a duplicate.";
                SetStatusMsg("StatusMsg", sMsg, "", false, true, "red", 4000);
                return false;
            };
            
            if (!ValidateForDuplicates("DeptCode", sDeptCode, i))
            {
                var sMsg = "Department Code " + sDeptCode + " is a duplicate.";
                SetStatusMsg("StatusMsg", sMsg, "", false, true, "red", 4000);
                return false;
            };
        } 
        
    //    if (!bValid) 
    //    {  
    //        var sMsg = "The xxxx value is invalid.";
    //        SetStatusMsg("StatusMsg", sMsg, "", false, true, "red", 4000);
    //        return false;
    //    }
        
        return bValid;
    }  
      
    //-------------------------------------------------------------------------------------
    // Returns new XMLHttpRequest object. 
    //-------------------------------------------------------------------------------------
    function AjaxCreate(sDataType) 
    {
        var xhr;
        
	    try 
	    {
	        if (window.XMLHttpRequest)         
	        {      
		        xhr = new XMLHttpRequest();
	        }       
	        else if (window.ActiveXObject) 
	        {   
		        xhr = new ActiveXObject("Microsoft.XMLHTTP");
	        }
	    }
	    catch(e) 
	    {
	        var sMsg = "Error: Unable to create data access object for " + sDataType + " data. \n\n";
	        sMsg += "Error Details: " + e.message; 
		    alert(sMsg);
	    }
	    
	    //Make sure the XHR object is really created.
	    if (!xhr)
	    {
	        var sMsg = "Error: Unable to create data access object for " + sDataType + " data. \n\n";
	        sMsg += "Error Details: Unknown error."; 
		    alert(sMsg);
	    } 
	    
	    return xhr;  
     }

    //-------------------------------------------------------------------------------------
    // Returns Ajax error (if any). 
    //-------------------------------------------------------------------------------------
    function AjaxError(sResults) 
    { 
        var sError = "";
        
        try 
        {
            var oResults = sResults.split("|");
	        var sStatus = oResults[0].split("=")[1];
	        if (sStatus.toLowerCase() == "error")
	        {
	            sError = oResults[1].split("=")[1];
	        }
	    }
	    catch(e) {}
	    
	    return sError;
    }

    //-------------------------------------------------------------------------------------
    // Initiate XMLHttpRequest call to specified URL/URI. 
    //-------------------------------------------------------------------------------------
    function AjaxSend(oAjax, sParms, oCallback, bUseXdp){ 
    
        var sType = "POST";   

	    //Set URL/URI. 
	    var sURL = "db.aspx";
	    
	    //If using a server-side cross-domain proxy, modify the URL and establish the
	    //URL/URI for the server-side proxy.
	    if (bUseXdp) 
	    {
		    //Set URL for remote URL and server-side proxy.
		    var sRemoteURL = $("XXXXXX").value + sURL;
		    sURL  = "xdp.aspx";
    	
	        //Modify parms string for use by server-side proxy. Replace equal signs and ampersands so proxy 
	        //ignores the fieldname-value pairs and passes them on to the remote URL.
	        sParms = sParms.replace(/=/g,"||");
	        sParms = sParms.replace(/&/g,"|*|");
    		
	        sParms  = "Parms="		+ sParms;
	        sParms += "&RemoteURL=" + sRemoteURL;
	        sParms += "&Format="	+ msXHRResponseFormat;
        }
    	
	    if (sType == "POST") 
	    {	
		    //Set POST properties and send HTTP request.
		    //moAjax.onreadystatechange = OnAjaxStateChange;    
		    oAjax.onreadystatechange = oCallback;    
		    oAjax.open("POST", sURL, true);  
		    oAjax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		    //oAjax.setRequestHeader("Content-length", sParms.length);
		    oAjax.send(sParms);
	    }
	    else if (sType == "GET") 
	    {
		    alert("AJAX GET-style call not implemented. Request cancelled.");
		    return false;
	    }
    	
	    return true;
    }

}
