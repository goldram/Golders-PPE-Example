<%@ Page Language="C#" AutoEventWireup="true" CodeFile="login-change-pw.aspx.cs" Inherits="LoginChangePW" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">

<head runat="server"> 

  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=8,chrome=1">
    
  <meta name="viewport" content="width=device-width, initial-scale=1">  
  
  <title>Change Password</title>

    <!--link href='http://fonts.googleapis.com/css?family=Open+Sans:400italic,600italic,800italic,400,600,800' rel='stylesheet' type='text/css' /-->
    <!--link href='http://fonts.googleapis.com/css?family=Lobster' rel='stylesheet' type='text/css'-->  
     
	<link href="css/global.css"				rel="stylesheet" type="text/css" />
	<link href="css/common/uifields.css"	rel="stylesheet" type="text/css" />
	<link href="css/login-change-pw.css"	rel="stylesheet" type="text/css" />

	<script src="js/common/dhtml.js"	    type="text/javascript"></script>
	<script src="js/common/uifields.js"     type="text/javascript"></script>	

</head> 

<body>

<div id="ContentBox">

    <%Response.WriteFile("inc/header.inc");%>

    <div id="PageHdrBox">
    	
	    <!--img id="PageHdr" src="images/PageHdrTimeAlloc.jpg"  alt="Client Team Time Allocations" /-->	
	    <p id="PageHdrTitle">Change Password</p>
	    
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
            <asp:ChangePassword runat="server"
             
                DisplayUserName="True" 
                
                CancelDestinationPageUrl="login.aspx" 
                ContinueDestinationPageUrl="default.aspx" 
                SuccessPageUrl="default.aspx" 
                
                UserNameLabelText="Email Address/Username:" 
                PasswordLabelText="Current Password:"
                SuccessTitleText="Password change successful!" 
                
                ChangePasswordButtonStyle-Height="40" 
                ChangePasswordButtonStyle-Width="140" 
                
                CancelButtonStyle-Height="40" 
                CancelButtonStyle-Width="140" 
                
                ContinueButtonStyle-Height="40" 
                ContinueButtonStyle-Width="140" 
                
                FailureTextStyle-CssClass="FailureMsg" 
                FailureTextStyle-VerticalAlign="Middle" 
                FailureTextStyle-HorizontalAlign="Left" 
                FailureTextStyle-Width="100" 
                
                InstructionTextStyle-Height="40"
                SuccessTextStyle-ForeColor="#33CC33" 
                
                BorderStyle="none" 
                BorderColor="Green"                                 
                
                ValidatorTextStyle-ForeColor="Red" 
                ValidatorTextStyle-CssClass="FailureMsg"
                
                TitleTextStyle-Height="40" 
                TitleTextStyle-VerticalAlign="Top" 
                TitleTextStyle-HorizontalAlign="Left" 
                TitleTextStyle-Width="250" 
                TitleTextStyle-CssClass="TitleText"
                
                ConfirmPasswordCompareErrorMessage="The new password and the confirm password entries must match." 
                NewPasswordRequiredErrorMessage="Please enter a new password." 
                PasswordRequiredErrorMessage="Your current password is required." 
                UserNameRequiredErrorMessage="Your email address/username is required." 
                ChangePasswordFailureText="Either the current password you entered is incorrect, or the new password is invalid. The new password must be a minimum of seven (7) characters and must include at least one special character (!@#$%^&*+-)." 
                ChangePasswordTitleText="You have been redirected to this page to allow you to change your password." 
            
            ></asp:ChangePassword>
		</div>
	</div>
	
    </form>	
     
    <%Response.WriteFile("inc/footer.inc");%>
	
</div> <!-- ContentBox -->
		  
</body> 
</html> 
