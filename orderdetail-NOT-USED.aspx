﻿<%@ Page Language="C#" AutoEventWireup="true" CodeFile="orderdetail-NOT-USED.aspx.cs" Inherits="OrderDetail_NOT_USED" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">

<head runat="server">

  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=8,chrome=1">
    
  <meta name="viewport" content="width=device-width, initial-scale=1">  

  <title>Employee Order Details</title>

	<link href="css/global.css"             rel="stylesheet" type="text/css" />
	<link href="css/common/uifields.css"    rel="stylesheet" type="text/css" />
	<link href="css/orderdetail.css"        rel="stylesheet" type="text/css" />

	<script src="js/common/dhtml.js"    type="text/javascript"></script>	
	<script src="js/common/sql.js"	    type="text/javascript"></script>
	<script src="js/common/uifields.js" type="text/javascript"></script>	
	<script src="js/common/cloaker.js"  type="text/javascript"></script>
	<script src="js/global.js"          type="text/javascript"></script>	
	<script src="js/ordersummary.js"    type="text/javascript"></script>	
	<script src="js/orderitemlist.js"   type="text/javascript"></script>	
	<script src="js/products.js"        type="text/javascript"></script>	
	<script src="js/orderdetail.js"     type="text/javascript"></script>	
	
</head>

<body>

<div id="ContentBox">
    
    <!----------------------------------------------------------------------------------------------
     Site Header.
    ------------------------------------------------------------------------------------------------>

    <% 
    var sUrl = "inc/header.inc";

    if (UserType.Value == "admin")
        sUrl = "inc/header-admin.inc";
    else if (UserType.Value == "purchaser")
        sUrl = "inc/header-purchaser.inc";

    Response.WriteFile(sUrl);
    %>
    
    <!----------------------------------------------------------------------------------------------
     Page Header.
    ------------------------------------------------------------------------------------------------>
    
    <div id="PageHdrBox">
    	
	    <!--img id="PageHdr" src="images/PageHdrTimeAlloc.jpg"  alt="Client Team Time Allocations" /-->	
	    <p id="PageHdrTitle">Employee Order</p>
	    
		<!--
	    <p id="PageHdrDesc">
		    This page allows you to manage which Departments are included in Core Reports such as the 
		    Resource Planning tool. 
	    </p>
	    -->
	
    </div>	
    
    <!----------------------------------------------------------------------------------------------
     Container for top-level buttons/actions that apply to all tabs (Order Summary and Order Items).
    ------------------------------------------------------------------------------------------------>
         
    <div id="OrderActionBox" class="DataGroupBox">
    	    	        
	    <label id="OrderActionBoxTitle" class="DataGroupHdr2">Order for Unknown</label>
 	    
        <div class="ActionBar NoFloat">
	        <a id="ActionRefresh"   href="javascript:RefreshOrder();">Refresh</a>
	        <a id="ActionSave"      href="javascript:moOrderSummary.SaveChanges();">Submit Order</a>
	        <a id="ActionCancel"    href="javascript:moOrderSummary.CancelChanges();">Cancel Changes</a>
        </div>
    
        <label id="MainStatusMsg" class="StatusMsg">loading order information, please wait...</label>
       	    	      
    </div>
    
    <!----------------------------------------------------------------------------------------------
     Container for top-level tabs.
    ------------------------------------------------------------------------------------------------>
    
    <div id="OrderTabBar" class="TabBar">
        <a id="TabSummary" class="TabActive"    href="javascript:ShowTab('TabSummary');">Order Summary</a>
        <a id="TabItems"   class="TabInactive"  href="javascript:ShowTab('TabItems');">Order Items</a>
    </div>
    
    <!----------------------------------------------------------------------------------------------
     Container for Order Summary information.
    ------------------------------------------------------------------------------------------------>
      	       
        
    <div id="OrderSummaryBox" class="DataGroupBox">
    	
	    <label id="OrderSummaryBoxTitle" class="DataGroupHdr2">Order Summary</label>
      	       
        <label class="StatusMsg">loading summary information, please wait...</label>
         
        <div id="SupportBox">
            <p id="SupportHdr">Questions About Your Order?</p>
            <p id="SupportText">We're here to help! Please call us at (07) 4622 1611 to talk to a customer service representative, 
            or you can send us an email at 
            <a style='font-weight:normal;color:Blue;' href='mailto:goldersromaorders@bigpond.net.au'>goldersromaorders@bigpond.net.au</a>.
            </p>
        </div> 
       
        <div class="OrderSummaryGroupBox Left">
        
            <div id="GeneralFieldsGroupBox"  class="FieldGroupBox">
	            <label id="GeneralFieldsHdr" class="FieldGroupHdr">General Info</label>
                <div id="GeneralFieldsGroup" class="FieldGroup"></div>
            </div>
                  
            <div id="DateFieldsGroupBox" class="FieldGroupBox">
	            <label id="DateFieldsHdr"   class="FieldGroupHdr">Dates</label>
                <div   id="DateFieldsGroup" class="FieldGroup"></div>
            </div>    
               
            <% if (UserType.Value == "admin") { %>
            <div id="PaymentFieldsGroupBox" class="FieldGroupBox">
	            <label id="PaymentFieldsHdr"   class="FieldGroupHdr">Payment Method</label>
                <div   id="PaymentFieldsGroup" class="FieldGroup"></div>
            </div> 
            <% } %> 
                  
        </div>  <!-- End OrderSummaryBox Left -->
                
        <div class="OrderSummaryGroupBox Right">
               
            <div id="DeliveryFieldsGroupBox" class="FieldGroupBox">
	            <label id="DeliveryFieldsHdr"   class="FieldGroupHdr">Delivery Information</label>
                <div   id="DeliveryFieldsGroup" class="FieldGroup"></div>
            </div> 
        
            <div id="QtyFieldsGroupBox" class="FieldGroupBox">
	            <label id="QtyFieldsHdr"   class="FieldGroupHdr">Quantity Requirements</label>
                <div   id="QtyFieldsGroup" class="FieldGroup"></div>
            </div>   
            
            <% if (UserType.Value == "admin") { %>
            <div id="CustomFieldsGroupBox" class="FieldGroupBox">
	            <label id="CustomFieldsHdr"   class="FieldGroupHdr">Custom Fields</label>
                <div   id="CustomFieldsGroup" class="FieldGroup"></div>
            </div>
            <% } %> 
                              
            <% if (UserType.Value == "admin") { %>
            <div id="CommentsFieldsGroupBox" class="FieldGroupBox">
	            <label id="CommentsFieldsHdr"   class="FieldGroupHdr">Comments/Notes</label>
                <div   id="CommentsFieldsGroup" class="FieldGroup"></div>
            </div> 
            <% } %> 
                                   
        </div>  <!-- End OrderSummaryBox Right -->
        
        <!-- DO NOT REMOVE -->
        <div class="OrderSummaryGroupBox ClearFix"></div>    
           
    </div> <!-- End OrderSummaryBox -->	
    
    <!----------------------------------------------------------------------------------------------
     Container for Order Items list (i.e. the "shoppping cart").
    ------------------------------------------------------------------------------------------------>

    <div id="OrderItemsBox" class="DataGroupBox">
    	    	        
	    <label id="OrderItemsBoxTitle" class="DataGroupHdr2">Order Items</label>
	    
	    <label id="CurrentSizesMsg"><a id="ActionShowSizes" href="javascript:moOrderSummary.ShowCurrentSizes();">Click here</a>
            to view current sizes for this employee to help ensure a proper fit!
	    </label>
	    
        <div class="ActionBar">
            <% if (UserType.Value == "admin") { %>
	            <a id="ActionNewCustomItem" href="javascript:AddCustomProductToOrder();">Add Custom Item</a>
            <% } %> 
	        <a id="ActionNewItem" href="javascript:InitProductsUI();">Add Item</a>
        </div>	  
      	        
        <label class="StatusMsg">loading order items, please wait...</label>
           
        <div id="OrderListViewPortHdr" class="ViewPortHdr">
           <div id="OrderItemsColHdr" class="DataColHdr">
                <label id="ItemDeleteHdr">&nbsp</label>
                <!--label id="ItemEditHdr">&nbsp</label-->
			    <label id="ItemTypeHdr">Product Type</label>
			    <label id="ItemDescHdr">Product Description</label>
			    <label id="ItemQtyHdr">Qty</label>
			    <label id="ItemSizeHdr">Size</label>
			    <label id="ItemColorHdr">Color</label>
			    <label id="ItemStatusHdr">Item Status</label>
			    <label id="ItemDeliverDateHdr">Delivery Date</label>
			    <label id="ItemDeliverMethodHdr">Delivery Method</label>
			    <label id="ItemCommentsHdr">Comments</label>
            </div> 
        </div> 
        
        <div id="OrderListViewPort" class="ViewPort">            
            <div id="OrderItemsDataBox" class="DataBox">
                <p id="NoItemsMsg">There are no items selected for this order.</p>
            </div> 
        </div> 
                       
    </div> <!-- End OrderItemsBox -->		    
    
    <!----------------------------------------------------------------------------------------------
     Container for the Products available to this user/employee.
    ------------------------------------------------------------------------------------------------>

    <div id="ProductBox" class="DataGroupBox Popup">
    	    	        
	    <label class="DataGroupHdr2 BrownHdr">Products Available</label>
	    
        <div class="ActionBar NoFloat">
	        <a id="ActionCancel" href="javascript:moProducts.HideUI();">Close</a>
        </div>	  
     	        
        <label class="StatusMsg">Loading products, please wait...</label>
 						
	    <label  id="FilterHdr" class="FieldHdr">Show:</label>
	    <select id="Filter"></select>
       
        <div id="ProductDataBox" class="DataBox"></div>  
         	
    </div> <!-- End OrderSummaryBox -->	
    
    <!----------------------------------------------------------------------------------------------
     iFrame for managing employee's current sizes.
    ------------------------------------------------------------------------------------------------>
    
    <%if (User.Identity.Name != null && User.Identity.Name.Length > 0) { %> 
        <iframe id="CurrentSizesPopup" name="CurrentSizesPopup"	src="current-sizes.aspx" style="display:none" frameborder="0" scrolling="no" allowtransparency=""></iframe>
    <%}%>
    
    <!----------------------------------------------------------------------------------------------
     iFrame for managing employee's profile.
    ------------------------------------------------------------------------------------------------>

    <%if (User.Identity.Name != null && User.Identity.Name.Length > 0) { %> 
        <iframe id="EmployeePopup" name="EmployeePopup"	src="employee-info.aspx" style="display:none" frameborder="0" scrolling="no" allowtransparency=""></iframe>
    <%}%>
    
    <!----------------------------------------------------------------------------------------------
     Footer.
    ------------------------------------------------------------------------------------------------>
    
    <%Response.WriteFile("inc/footer.inc");%>

				 
</div> <!-- ContentBox -->
	
<!-- Calendar Popup -->
<iframe id="CalendarPopup" name="CalendarPopup" src="calendar-popup.aspx" 
		frameborder="0" scrolling="no" allowtransparency>
</iframe>

<form id="DataForm" method="post"  enctype="Multipart/Form-Data" runat="server">
    
    <asp:HiddenField id="OrderID" runat="server" />
	
    <asp:HiddenField id="UserLoginID"   runat="server" />
    <asp:HiddenField id="UserID"        runat="server" />
    <asp:HiddenField id="UserType"      runat="server" />
    <asp:HiddenField id="UserFirstName" runat="server" />
    <asp:HiddenField id="UserLastName"  runat="server" />
    <asp:HiddenField id="UserCompanyID" runat="server" />
    <asp:HiddenField id="UserCompanyName" runat="server" />
    <asp:HiddenField id="UserSiteID"    runat="server" />
    <asp:HiddenField id="UserSiteName"  runat="server" />
	
</form>	
	
</body>

</html>
