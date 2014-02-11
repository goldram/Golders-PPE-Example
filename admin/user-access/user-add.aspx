<%@ Page Language="C#" AutoEventWireup="true" CodeFile="user-add.aspx.cs" Inherits="UserAdd" %>

<%@ Register TagPrefix="dc" TagName="alphalinks" Src="~/_controls/alphalinks.ascx" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">

<head runat="server"> 
    <title>Manage Users</title>

    <!--link href='http://fonts.googleapis.com/css?family=Open+Sans:400italic,600italic,800italic,400,600,800' rel='stylesheet' type='text/css' /-->
    <!--link href='http://fonts.googleapis.com/css?family=Lobster' rel='stylesheet' type='text/css'-->  
     
	<link href="~/css/global.css"			rel="stylesheet" type="text/css" />
	<link href="~/css/common/uifields.css"	rel="stylesheet" type="text/css" />
	<link href="~/css/login.css"			rel="stylesheet" type="text/css" />
	<link href="../css/StyleSheet.css"      rel="stylesheet" type="text/css" />

	<script src="../../js/common/dhtml.js"	    type="text/javascript"></script>
	<script src="../../js/common/uifields.js"   type="text/javascript"></script>	
	<script src="../../js/common/cloaker.js"   type="text/javascript"></script>	
	<script src="../../js/global.js"            type="text/javascript"></script>	
	<script src="../js/admin.js"            type="text/javascript"></script>	
	
</head> 

<body>

<div id="ContentBox">

    <% 
    var sUrl = "../inc/header.inc";
    if (UserType.Value == "admin") sUrl = "../inc/header-admin.inc"; 
    Response.WriteFile(sUrl);
    %>
    
    <div id="PageHdrBox">
    	
	    <!--img id="PageHdr" src="images/PageHdrTimeAlloc.jpg"  alt="Client Team Time Allocations" /-->	
	    <p id="PageHdrTitle">Manage Users</p>
	    
		<!-- p id="PageHdrDesc">This page allows you to add, edit, and remove users for the website.</p-->
	
    </div>	
    
    <form id="DataForm" method="post"  enctype="Multipart/Form-Data" runat="server">	

    <!-- #include file="_nav.aspx -->
    
    <!--
    --------------------------------------------------------------------------------------------
     Table for Users.
    ------------------------------------------------------------------------------------------------
    -->
    
 <table class="webparts">
<tr>
	<th>Add User</th>
</tr>
<tr>
<td class="details" valign="top">

<h3>Roles:</h3>
<asp:CheckBoxList ID="UserRoles" runat="server" />

<h3>Main Info:</h3>

<table>
<tr>
	<td class="detailheader">Active User</td>
	<td>
		<asp:CheckBox ID="isapproved" runat="server" Checked="true" />
	</td>
</tr>
<tr>
	<td class="detailheader">User Name</td>
	<td>
		<asp:TextBox ID="username" runat="server"></asp:TextBox>
	</td>
</tr>
<tr>
	<td class="detailheader">Password</td>
	<td>
		<asp:TextBox ID="password" runat="server"></asp:TextBox>
	</td>
</tr>
<tr>
	<td class="detailheader">Email</td>
	<td>
		<asp:TextBox ID="email" runat="server"></asp:TextBox>
	</td>
</tr>
<tr>
	<td class="detailheader">Comment</td>
	<td>
		<asp:TextBox ID="comment" runat="server"></asp:TextBox>
	</td>
</tr>
<tr>
	<td colspan="2"><br />
		<input type="submit" value="Add User" />&nbsp;
		<input type="reset" />
	</td>
</tr>
<tr>
	<td colspan="2">
	<div id="ConfirmationMessage" runat="server" class="alert"></div>
	</td>
</tr>
</table>

<asp:ObjectDataSource ID="MemberData" runat="server" DataObjectTypeName="System.Web.Security.MembershipUser" SelectMethod="GetUser" UpdateMethod="UpdateUser" TypeName="System.Web.Security.Membership">
	<SelectParameters>
		<asp:QueryStringParameter Name="username" QueryStringField="username" />
	</SelectParameters>
</asp:ObjectDataSource> 
</td>

</tr></table>
   
    <!--
    --------------------------------------------------------------------------------------------
     Hidden form fields for user info.
    --------------------------------------------------------------------------------------------
    -->
	
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
    
    <!----------------------------------------------------------------------------------------------
     Footer.
    ------------------------------------------------------------------------------------------------>
       
    <%Response.WriteFile("~/inc/footer.inc");%>

    
    <!----------------------------------------------------------------------------------------------
     iFrame for managing employee's profile.
    ------------------------------------------------------------------------------------------------>

    <%if (User.Identity.Name != null && User.Identity.Name.Length > 0) { %> 
        <iframe id="EmployeePopup" name="EmployeePopup"	src="../../employee-info.aspx" style="display:none" frameborder="0" scrolling="no" allowtransparency=""></iframe>
    <%}%>
	
	
</div> <!-- ContentBox -->
</body>
</html>
