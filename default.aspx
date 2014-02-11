<%@ Page Language="C#" AutoEventWireup="true" CodeFile="default.aspx.cs" Inherits="Default" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">

<head runat="server"> 
  
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=8,chrome=1">
    
  <meta name="viewport" content="width=device-width, initial-scale=1">  

  <title>Golders Home Page</title>
    
	<link href="css/global.css"				    rel="stylesheet" type="text/css" />
	<link href="css/common/uifields.css"	rel="stylesheet" type="text/css" />
	<link href="css/default.css"				  rel="stylesheet" type="text/css" />

	<script src="js/common/dhtml.js"        type="text/javascript"></script>	
	<script src="js/common/uifields.js"     type="text/javascript"></script>	
	<script src="js/common/cloaker.js"      type="text/javascript"></script>
	<script src="js/global.js"	            type="text/javascript"></script>
	<script src="js/default.js"	            type="text/javascript"></script>
  
  <%if (UserType.Value == "admin" || UserType.Value == "purchaser") { %>
    <link href="css/neworder.css" rel="stylesheet" type="text/css" />  
    <script src="js/neworder.js"  type="text/javascript"></script>	
  <%}%>
 
</head> 

<body>

<div id="ContentBox">

   <%----------------------------------------------------------------------------------------------
     Site Header.
    -----------------------------------------------------------------------------------------------%>

    <% 
    var sUrl = "inc/header.inc";

    if (UserType.Value == "admin")
        sUrl = "inc/header-admin.inc";
    else if (UserType.Value == "purchaser")
        sUrl = "inc/header-purchaser.inc";

    Response.WriteFile(sUrl);
    %>   
     
    <%----------------------------------------------------------------------------------------------
     Page Header.
    -----------------------------------------------------------------------------------------------%>
    
   <div id="PageHdrBox">
    	
	    <!--img id="PageHdr" src="images/PageHdrTimeAlloc.jpg"  alt="Client Team Time Allocations" /-->	
	    <p id="PageHdrTitle">Welcome to Golders!</p>
	    
		<!--
	    <p id="PageHdrDesc">
		    This page allows you to manage which Departments are included in Core Reports such as the 
		    Resource Planning tool. 
	    </p>
	    -->
	
    </div>	
    
    <%----------------------------------------------------------------------------------------------
    Main content. 
    -----------------------------------------------------------------------------------------------%>
    
 	  <div id="Main">
 	    
 	    <div id="ViewOrder">
 	      <img src="img/home-order-view.png" />
 	      <h2>Your Order</h2>
 	      <p>Click here to complete and submit your uniform order, or to view the status of an 
 	      existing order. You will be prompted for the order serial number, so please locate it 
 	      before continuing.</p>
 	    </div>
 	    	    
 	    <div id="AuthOrder">
 	      <img src="img/home-order-auth.png" />
 	      <h2>Authorize Order</h2>
 	      <p>If you are a purchasing officer at your company, click here to authorize a uniform 
 	      order for another employee at your company.</p>
 	    </div>
 	    
 	    <div style="clear:both;"></div>

	  </div>  
    
    <%------------------------------------------------------------------------------------------------
     Popup to enter order number for order to view.
    --------------------------------------------------------------------------------------------------%>  
    <div id="OrderNumberBox" class="DataGroupBox Popup">

      <div id="ActionBarTop" class="ActionBar">
        <a id="ActionCancel" class="Basic" href="javascript:OrderNumPopupHide();">X</a>
      </div>
      <div style="clear:both"></div>

      <label id="OrderNumHdr" class="FieldHdr">Order Serial Number:</label>
      <input id="OrderNum"    class="FieldVal" type='text' value="" maxlength='20'/>
      
      <div id="ActionBarBottom" class="ActionBar">
        <a id="ActionSubmit" href="javascript:ViewOrder();">Go To Order</a>
      </div>

    </div> <!-- End OrderNumberBox -->
   
    <%------------------------------------------------------------------------------------------------
     New order view. Only included on page if an admin or purchasing officer.
    --------------------------------------------------------------------------------------------------%>  
  
    <%
    if (UserType.Value == "admin" || UserType.Value == "purchaser") 
    {
      Response.WriteFile("inc/neworder.inc");
    }
    %>
    
    <%------------------------------------------------------------------------------------------------
     iFrame for managing employee's profile.
    --------------------------------------------------------------------------------------------------%>  

    <%if (User.Identity.Name != null && User.Identity.Name.Length > 0) { %> 
        <iframe id="EmployeePopup" name="EmployeePopup"	src="employee-info.aspx" style="display:none" frameborder="0" scrolling="no" allowtransparency=""></iframe>
    <%}%>
    
   <%------------------------------------------------------------------------------------------------
     iFrame for adding a new employee.
    --------------------------------------------------------------------------------------------------%>  

    <%if (UserType.Value == "admin" || UserType.Value == "purchaser") { %>
        <iframe id="NewEmployeePopup" name="NewEmployeePopup"  src="employee-info.aspx" style="display:none" frameborder="0" scrolling="no" allowtransparency=""></iframe>
    <%}%>

        
    <%----------------------------------------------------------------------------------------------
     Footer.
    -----------------------------------------------------------------------------------------------%>
    
    <%Response.WriteFile("inc/footer.inc");%>            
	
</div> <!-- ContentBox -->

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
    <asp:HiddenField id="UserLastLoginDate"  runat="server" />
    <asp:HiddenField id="UserLastPasswordChangedDate"  runat="server" />
	
</form>			  
</body> 
</html> 
