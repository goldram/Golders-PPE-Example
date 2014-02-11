<%@ Page Language="C#" AutoEventWireup="true" CodeFile="login-reset-pw.aspx.cs" Inherits="LoginResetPW" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">

<head runat="server"> 

  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=8,chrome=1">
    
  <meta name="viewport" content="width=device-width, initial-scale=1">  

  <title>Reset Password</title>

    <!--link href='http://fonts.googleapis.com/css?family=Open+Sans:400italic,600italic,800italic,400,600,800' rel='stylesheet' type='text/css' /-->
    <!--link href='http://fonts.googleapis.com/css?family=Lobster' rel='stylesheet' type='text/css'-->  
     
	<link href="css/global.css"				    rel="stylesheet" type="text/css" />
	<link href="css/common/uifields.css"	rel="stylesheet" type="text/css" />
	<link href="css/login-change-pw.css"	rel="stylesheet" type="text/css" />

	<script src="js/common/dhtml.js"	    type="text/javascript"></script>
	<script src="js/common/uifields.js"   type="text/javascript"></script>	

</head> 

<body>

<div id="ContentBox">

    <% 
    var sUrl = "./inc/header.inc";
    //if (UserType.Value == "admin") sUrl = "/inc/header-admin.inc"; 
    Response.WriteFile(sUrl);
    %>
    
    <div id="PageHdrBox">
    	
	    <!--img id="PageHdr" src="images/PageHdrTimeAlloc.jpg"  alt="Client Team Time Allocations" /-->	
	    <p id="PageHdrTitle">Reset Password</p>
	    
		<!--
	    <p id="PageHdrDesc">
		    This page allows you to manage which Departments are included in Core Reports such as the 
		    Resource Planning tool. 
	    </p>
	    -->
	
    </div>	
    
    <form id="DataForm" method="post"  enctype="Multipart/Form-Data" runat="server">	
    
	<div id="LoginBox">
		<img id="LoginImg" src="img/login-keys.png" alt="login image"/>
		<div id="LoginFields">
		
      <h3>RESET PASSWORD</h3>

      <asp:Label id="Msg" runat="server" ForeColor="maroon" />
      
      <br />
      <br />

      Username/Email: <asp:Textbox id="UsernameTextBox" Columns="30" runat="server" AutoPostBack="true" />
      
      <asp:RequiredFieldValidator id="UsernameRequiredValidator" runat="server" 
          ControlToValidate="UsernameTextBox" ForeColor="red"  Display="Static" ErrorMessage="Required" />
          
      <br />
      
      <asp:Button id="ResetPasswordButton" Text="Reset Password" 
         OnClick="ResetPassword_OnClick" Enabled="True" runat="server" />
		
		</div>
	</div>
	
    </form>	
     
    <%Response.WriteFile("inc/footer.inc");%>
	
</div> <!-- ContentBox -->
		  
</body> 
</html> 
