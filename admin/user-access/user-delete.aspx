<%@ Page Language="C#" AutoEventWireup="true" CodeFile="user-delete.aspx.cs" Inherits="admin_user_delete" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">

<head runat="server"> 
    <title>Delete User</title>
     
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
	    <p id="PageHdrTitle">Delete User</p>

	
    </div>	
    
    <form id="DataForm" method="post"  enctype="Multipart/Form-Data" runat="server">	
	    
		<p id="PageHdrDesc">
		    User deleted succssfully.
	    </p>	
    </form>	
     
    <%Response.WriteFile("~/inc/footer.inc");%>
	
</div> <!-- ContentBox -->
		  
</body> 
</html> 
