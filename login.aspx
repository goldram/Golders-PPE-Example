<%@ Page Language="C#" AutoEventWireup="true" CodeFile="login.aspx.cs" Inherits="Login" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">

<head runat="server"> 

  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=8,chrome=1">
    
  <meta name="viewport" content="width=device-width, initial-scale=1">  

  <title>Golders Sign-in</title>

    <!--link href='http://fonts.googleapis.com/css?family=Open+Sans:400italic,600italic,800italic,400,600,800' rel='stylesheet' type='text/css' /-->
    <!--link href='http://fonts.googleapis.com/css?family=Lobster' rel='stylesheet' type='text/css'-->  
     
	<link href="css/global.css"				rel="stylesheet" type="text/css" />
	<link href="css/common/uifields.css"	rel="stylesheet" type="text/css" />
	<link href="css/login.css"				rel="stylesheet" type="text/css" />

	<script src="js/common/dhtml.js"	    type="text/javascript"></script>
	<script src="js/common/uifields.js"     type="text/javascript"></script>	

</head> 

<body>

<div id="ContentBox">

    <%Response.WriteFile("inc/header.inc");%>

    <div id="PageHdrBox">
    	
	    <!--img id="PageHdr" src="images/PageHdrTimeAlloc.jpg"  alt="Client Team Time Allocations" /-->	
	    <p id="PageHdrTitle">Golders Sign-In</p>
	    
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
			<asp:Login ID="LoginInfo" runat="server" 
				
				ReturnUrl="Default.aspx"
			    DestinationPageUrl="default.aspx"
				DisplayRememberMe="true"
				OnAuthenticate="Login_Authenticate"
			    
				TitleText="" 
			    CssClass="FieldHdr"
				Font-Names="Tahoma, Verdana" 
				TextLayout="TextOnTop" 
				TextBoxStyle-Width="200px" 
				
				InstructionTextStyle-Width="200px" 
				InstructionTextStyle-Height="40"
				
				FailureText="Your sign-in attempt failed. Please try again." 
				FailureTextStyle-Height="20" 
				FailureTextStyle-Width="240" 
				FailureTextStyle-HorizontalAlign="Left" 
				FailureTextStyle-CssClass="FailureMsg" 
				
				LoginButtonText="Sign In" 
				LoginButtonStyle-Width="100" 
				LoginButtonStyle-Height="28" 
				LoginButtonStyle-CssClass="LoginBtn" 
				
				UserNameLabelText="Your Email Address:"
				UserNameRequiredErrorMessage="User Name is required."
				
				PasswordLabelText="Your Password:"
				PasswordRequiredErrorMessage="Password is required." 
			 
			></asp:Login>
		</div>
	</div>
	
    </form>	
     
    <%Response.WriteFile("inc/footer.inc");%>
	
</div> <!-- ContentBox -->
		  
</body> 
</html> 
