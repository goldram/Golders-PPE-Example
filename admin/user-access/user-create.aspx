<%@ Page Language="C#" AutoEventWireup="true" CodeFile="user-create.aspx.cs" Inherits="admin_user_create" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">

<head runat="server"> 
    <title>Create New User</title>

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

    <%Response.WriteFile("~/inc/header.inc");%>

    <div id="PageHdrBox">
    	
	    <!--img id="PageHdr" src="images/PageHdrTimeAlloc.jpg"  alt="Client Team Time Allocations" /-->	
	    <p id="PageHdrTitle">Create New User</p>
	    
		<p id="PageHdrDesc">
		    This page allows you to create a new user for the website. 
	    </p>
	
    </div>	
    
    <form id="DataForm" method="post"  enctype="Multipart/Form-Data" runat="server">	
    
	<div id="LoginBox">
		<img id="LoginImg" src="~/img/login-keys.png" alt="login image"/>
		<div id="LoginFields">
			<asp:CreateUserWizard runat="server" CssClass="FieldHdr" 
				RequireEmail="True" 
				LoginCreatedUser="True">
				<WizardSteps>
					<asp:CreateUserWizardStep runat="server" 
					    Title="Enter New User Account Info">
					</asp:CreateUserWizardStep>
					<asp:CompleteWizardStep runat="server">
					</asp:CompleteWizardStep>
				</WizardSteps>
			</asp:CreateUserWizard>    
		</div>
	</div>
	
    </form>	
     
    <%Response.WriteFile("~/inc/footer.inc");%>
	
</div> <!-- ContentBox -->
		  
</body> 
</html> 
