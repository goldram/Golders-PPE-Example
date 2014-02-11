<%@ Page Language="C#" AutoEventWireup="true" CodeFile="orders.aspx.cs" Inherits="Orders" %>

<%-- 
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
--%>

<!DOCTYPE html>

<head runat="server">

  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=8,chrome=1">
    
  <meta name="viewport" content="width=device-width, initial-scale=1">  

  <title>Order Management</title>
    
	<link href="css/global.css"             rel="stylesheet" type="text/css" />
	<link href="css/common/uifields.css"	  rel="stylesheet" type="text/css" />
  <link href="css/neworder.css"           rel="stylesheet" type="text/css" />  
	<link href="css/orders.css"             rel="stylesheet" type="text/css" />
	
	<script src="js/common/dhtml.js"        type="text/javascript"></script>	
	<script src="js/common/sql.js"			    type="text/javascript"></script>
	<script src="js/common/uifields.js"		  type="text/javascript"></script>	
	<script src="js/common/cloaker.js"		  type="text/javascript"></script>
	<script src="js/global.js"              type="text/javascript"></script>	
	<script src="js/orderlist.js"           type="text/javascript"></script>	
	<script src="js/neworder.js"            type="text/javascript"></script>	
	<script src="js/orders.js"              type="text/javascript"></script>	
	
</head>

<body>

<div id="ContentBox">

    <% 
    var sUrl = "inc/header.inc";
    
    if (UserType.Value == "admin") 
        sUrl = "inc/header-admin.inc";
    else if (UserType.Value == "purchaser")
        sUrl = "inc/header-purchaser.inc";
        
    Response.WriteFile(sUrl);
    %>

    <div id="PageHdrBox">
    	
	    <!--img id="PageHdr" src="images/PageHdrTimeAlloc.jpg"  alt="Client Team Time Allocations" /-->	
	    <p id="PageHdrTitle">Order Management</p>
	    
		<!--
	    <p id="PageHdrDesc">
		    This page allows you to manage which Departments are included in Core Reports such as the 
		    Resource Planning tool. 
	    </p>
	    -->
	
    </div>	

    <%-- 
    <div id="EmpBox" class="DataGroupBox">
    	    	        
	    <label id="EmpBoxTitle" class="DataGroupHdr2">Purchase Officer Sam Smith</label>
 	    
        <div class="ActionBar">
            <!--
	        <a id="ActionRefresh" href="javascript:Refresh();">Refresh</a>
	        <a id="ActionCancel" href="javascript:CancelChanges();">Cancel</a>
	        -->
	        <a id="ActionEdit" href="javascript:Emp_SaveChanges();">Edit</a>
        </div>	  
          
		<label id="CompanyHdr" class="FieldHdr Right">Company:</label>
		<input id="Company" class="FieldValDynamic NoBorder" type='text' maxlength='45' value="Origin Energy"/>
          
		<label id="LocationHdr" class="FieldHdr Right">Location:</label>
		<input id="Location" class="FieldValDynamic NoBorder" type='text' maxlength='45'  value="Origin Energy - Sydney"/>
          
		<label id="EmailHdr" class="FieldHdr Right">Email:</label>
		<input id="Email" class="FieldValDynamic NoBorder" type='text' maxlength='45'  value="ssmith@origin.com"/>
		
		<label id="PayMethodHdr" class="FieldHdr Right">Payment Method:</label>
		<input id="PayMethod" class="FieldValDynamic NoBorder" type='text' maxlength='45' value="Credit Card"/>
          
		<label id="PayNumberHdr" class="FieldHdr Right">PO Number:</label>
		<input id="PayNumber" class="FieldValDynamic NoBorder" type='text' maxlength='45'  value="*5432"/>
  
    </div> <!-- End EmpBox -->	
    --%>

    <div id="OrderBox" class="DataGroupBox">
    	    	        
	    <label class="DataGroupHdr2">Employee Orders</label>
        
        <label class="StatusMsg">Retrieving orders, please wait...</label>
	    
        <div class="ActionBar">
	        <a id="ActionNewOrder"  href="javascript:InitNewOrder();">New Order</a>
	        <a id="ActionRefresh"   href="javascript:RefreshOrderList();">Refresh</a>
	        <a id="ActionSave"      href="javascript:moOrderList.SaveChanges();">Save Changes</a>
	        <a id="ActionCancel"    href="javascript:moOrderList.CancelChanges();">Cancel Changes</a>
        </div>	
 	    
        <div id="OrdersFilterBar" class="FilterBar">
            <%if (UserType.Value == "admin") { %>
                <label  id="CompanyFilterHdr" class="FieldHdr2">Company Filter:</label>
	            <select id="CompanyFilter" class="FieldVal2" size="1">
	                <!--option value="3">Origin Energy</option-->
	                <option value="2">Santos Ltd </option>
	            </select>
            <%}%>       
	            
           <label  id="StatusFilterHdr" class="FieldHdr2">Status Filter:</label>
           <select id="StatusFilter" class="FieldVal2" size="1">
                <option value="all">All Orders</option>
                <option value="open">Open Orders</option>
                <option value="authorized">Authorized</option>
                <option value="submitted">Submitted</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="closed">Closed</option>
                <option value="cancelled">Cancelled</option>
                <option value="hold">On-Hold</option>
            </select>
            
        </div>	
           
        <div id="OrderListViewPortHdr" class="ViewPortHdr">
            <%if (UserType.Value == "purchaser") { %>
            <div id="OrderColHdr" class="DataColHdr">
                <label id="OrderEditHdr">&nbsp</label>
			    <label id="OrderNumHdr">Serial Number</label>
                <label id="SiteHdr">Company Site</label>
			    <label id="EmployeeNameHdr">Employee Name</label>
			    <label id="OrderStatusHdr">Order Status</label>
			    <label id="AuthorizeDateHdr">Authorized</label>
			    <label id="SubmitDateHdr">Submitted</label>
			    <label id="DeliverDateHdr">Delivered</label>
			    <label id="HoldDateHdr">On Hold</label>
			    <label id="CancelDateHdr">Cancelled</label>
			    <label id="CloseDateHdr">Closed</label>
            </div> 
            <%}%>       
            <%else if (UserType.Value == "admin") { %>
            <div id="OrderColHdr" class="DataColHdr">
                <label id="OrderEditHdr">&nbsp</label>
                <label id="OrderNumHdr">Serial Number</label>
                <label id="CompanyHdr">Company</label>
                <label id="SiteHdr">Company Site</label>
                <label id="EmployeeNameHdr">Employee Name</label>
                <label id="OrderStatusHdr">Order Status</label>
                <label id="AuthorizeDateHdr">Authorized</label>
                <label id="SubmitDateHdr">Submitted</label>
                <label id="ProcessDateHdr">Processing</label>
                <label id="ShipDateHdr">Shipped</label>
                <label id="DeliverDateHdr">Delivered</label>
                <label id="HoldDateHdr">On Hold</label>
                <label id="CancelDateHdr">Cancelled</label>
                <label id="CloseDateHdr">Closed</label>
                <label id="Custom1Hdr">Custom Field 1</label>
                <label id="Custom2Hdr">Custom Field 2</label>
                <label id="Custom3Hdr">Custom Field 3</label>
                <label id="Custom4Hdr">Custom Field 4</label>
                <label id="Custom5Hdr">Custom Field 5</label>
           </div> 
            <%}%>               
        </div> 
        
        <div id="OrderListViewPort" class="ViewPort">            
            <div id="OrderDataBox" class="DataBox"></div> 
        </div> 
                 
    </div> <!-- End OrderBox -->		    

    <%------------------------------------------------------------------------------------------------
     New order view/html. 
    --------------------------------------------------------------------------------------------------%>  
  
    <%  Response.WriteFile("inc/neworder.inc"); %>
    
    <!----------------------------------------------------------------------------------------------
     iFrame for managing employee's profile.
    ------------------------------------------------------------------------------------------------>

    <%if (User.Identity.Name != null && User.Identity.Name.Length > 0) { %> 
        <iframe id="EmployeePopup" name="EmployeePopup"	src="employee-info.aspx" style="display:none" frameborder="0" scrolling="no" allowtransparency=""></iframe>
    <%}%>
    
    <!----------------------------------------------------------------------------------------------
     iFrame for adding a new employee.
    ------------------------------------------------------------------------------------------------>

    <%if (User.Identity.Name != null && User.Identity.Name.Length > 0) { %> 
        <iframe id="NewEmployeePopup" name="NewEmployeePopup"  src="employee-info.aspx" style="display:none" frameborder="0" scrolling="no" allowtransparency=""></iframe>
    <%}%>
    
    <!----------------------------------------------------------------------------------------------
     Footer.
    ------------------------------------------------------------------------------------------------>
            
    <%Response.WriteFile("inc/footer.inc");%>
				 
</div> <!-- ContentBox -->

    
<form id="DataForm" method="post"  enctype="Multipart/Form-Data" runat="server">
	
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
