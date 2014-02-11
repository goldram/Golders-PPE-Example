<%@ Page Language="C#" AutoEventWireup="true" CodeFile="login-reset-pw-OLD.aspx.cs" Inherits="LoginResetPWOLD" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">

<head runat="server"> 
    <title>Set Password</title>

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
	    <p id="PageHdrTitle">Set Password</p>
	    
	    <p id="PageHdrDesc">
		    Welcome! It appears this is your first visit to the website. Please create your new password so 
		    that you can access this website in secure manner. Thanks!  
	    </p>
	
    </div>	
    
    <form id="DataForm" method="post"  enctype="Multipart/Form-Data" runat="server">	

 
    
	<div id="LoginBox">
		<img id="LoginImg" src="img/login-keys.png" alt="login image"/>
		<div id="LoginFields">
		
           <asp:ChangePassword runat="server">
                
            </asp:ChangePassword>		
            
		    <!--
			<asp:Login ID="LoginInfo" runat="server" CssClass="FieldHdr"
				OnAuthenticate="Login_Authenticate"
				DisplayRememberMe="true"
				TitleText="" 
				Font-Names="Tahoma, Verdana" 
				TextLayout="TextOnTop" 
				TextBoxStyle-Width="200px" 
				InstructionTextStyle-Width="200px" 
				InstructionTextStyle-Height="40"
				FailureText="Your sign-in attempt failed. Please try again." 
				FailureTextStyle-Height="20" 
				FailureTextStyle-Width="240" 
				FailureTextStyle-HorizontalAlign="Left" 
				LoginButtonStyle-Width="100" 
				LoginButtonStyle-Height="28" 
				LoginButtonText="Sign In" 
				LoginButtonStyle-CssClass="LoginBtn" 
				FailureTextStyle-CssClass="FailureMsg" 
				UserNameLabelText="Your Email Address:"
				UserNameRequiredErrorMessage="User Name is required."
				PasswordLabelText="Your Password:"
				PasswordRequiredErrorMessage="Password is required." 
			>
			</asp:Login>
			-->
		</div>
	</div>
	
    </form>	
     
    <%Response.WriteFile("inc/footer.inc");%>
	
</div> <!-- ContentBox -->
		  
</body> 
</html> 
