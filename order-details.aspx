<%@ Page Language="C#" AutoEventWireup="true" CodeFile="order-details.aspx.cs" Inherits="OrderDetails" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">

<head runat="server">

  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=8,chrome=1">
    
  <meta name="viewport" content="width=device-width, initial-scale=1">  

  <title>Manage Order Details</title>

	<link href="css/global.css"             rel="stylesheet" type="text/css" />
	<link href="css/common/uifields.css"    rel="stylesheet" type="text/css" />
	<link href="css/order-details.css"      rel="stylesheet" type="text/css" />

	<script src="js/common/dhtml.js"        type="text/javascript"></script>	
	<script src="js/common/sql.js"	        type="text/javascript"></script>
	<script src="js/common/uifields.js"     type="text/javascript"></script>	
	<script src="js/common/cloaker.js"      type="text/javascript"></script>
	<script src="js/global.js"              type="text/javascript"></script>	
	<script src="js/order-details-summary.js" type="text/javascript"></script>	
	<script src="js/order-details.js"       type="text/javascript"></script>	
	
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
	    <p id="PageHdrTitle">Manage Order Details</p>
	    
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
    	    	        
	    <label id="OrderActionBoxTitle" class="DataGroupHdr2">Details for Order #00000-00</label>
 	    
        <div class="ActionBar NoFloat">
	        <a id="ActionRefresh"   href="javascript:RefreshOrder();">Refresh</a>
	        <a id="ActionSave"      href="javascript:moOrderSummary.SaveChanges();">Save Changes</a>
	        <a id="ActionCancel"    href="javascript:moOrderSummary.CancelChanges();">Cancel Changes</a>
        </div>
    
        <label id="MainStatusMsg" class="StatusMsg">loading order details, please wait...</label>
       	    	      
    </div>
    
    <!----------------------------------------------------------------------------------------------
     Container for Order Details information.
    ------------------------------------------------------------------------------------------------>
        
    <div id="OrderSummaryBox" class="DataGroupBox">
    	
    	<%-- 
	    <label id="OrderSummaryBoxTitle" class="DataGroupHdr2">Order Details</label>
      	       
        <label class="StatusMsg">loading summary information, please wait...</label>
        --%>
       
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
     iFrame for managing user's/employee's profile.
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
