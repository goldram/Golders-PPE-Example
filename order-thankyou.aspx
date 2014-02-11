<%@ Page Language="C#" AutoEventWireup="true" CodeFile="order-thankyou.aspx.cs" Inherits="OrderThankYou" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">

<head runat="server"> 

  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=8,chrome=1">
    
  <meta name="viewport" content="width=device-width, initial-scale=1">  
    
  <title>Order Submitted</title>
    
	<link href="css/global.css"				rel="stylesheet" type="text/css" />
	<link href="css/order-thankyou.css"		rel="stylesheet" type="text/css" />

	<script src="js/common/dhtml.js"        type="text/javascript"></script>	
	<script src="js/common/sql.js"	        type="text/javascript"></script>
	<script src="js/common/uifields.js"     type="text/javascript"></script>	
	<script src="js/common/cloaker.js"      type="text/javascript"></script>
	<script src="js/global.js"	            type="text/javascript"></script>
	<script src="js/order-thankyou.js"	    type="text/javascript"></script>

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
	    <p id="PageHdrTitle">Order Submitted Successfully</p>
	    
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
    
 	  <div id="ThankYouBox">
		  <div id="ThankYouMsg">
		      <%-- %><img id="LoginImg" src="img/login-keys-small.png" alt="login image"/> --%>
  	        
	          <p style="font-size:12pt;font-weight:bold;">Thank you for your order!</p>
	          
	          <p>Your order number is <b><% =OrderNumber %></b>. Please refer to this order number when 
	          contacting Golders with questions about your order.</p>   
  	        
	          <p>You will receive an email confirmation shortly. Use the link provided in the email to return to 
	          your order to check on order status or review the details of your order. If this is your first 
	          time placing an order, the email will also contain your temporary password for this website.</p>
  	        
  	        <%--      
	          <%if (TempPW != "") {%>
	            <p>If you return to this website to view your order, you will be required to log in using your email 
	            address and the following temporary password: <b><% =TempPW %></b>. After successfully logging in, 
	            you will be prompted to change this temporary password.</p> 
	          <%} %>
  	        --%>
  	                    
            <p id="SupportText">If you have questions about your order, please call us at (07) 4622 1611 
            to talk to a customer service representative. You can also contact us via email at   
            <a style='font-weight:normal;color:Blue;' href='mailto:goldersromaorders@bigpond.net.au'>goldersromaorders@bigpond.net.au</a>.
            </p>
  	        
		  </div>
	  </div>  
    
    <!----------------------------------------------------------------------------------------------
     iFrame for managing employee's profile.
    ------------------------------------------------------------------------------------------------>

    <%if (User.Identity.Name != null && User.Identity.Name.Length > 0) { %> 
        <iframe id="EmployeePopup" name="EmployeePopup"	src="employee-info.aspx" style="display:none" frameborder="0" scrolling="no" allowtransparency=""></iframe>
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
