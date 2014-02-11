<%@ Page Language="C#" AutoEventWireup="true" CodeFile="logout.aspx.cs" Inherits="Logout" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">

<head runat="server"> 

  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=8,chrome=1">
    
  <meta name="viewport" content="width=device-width, initial-scale=1">  

  <title>Golders Sign-Out</title>
    
	<link href="css/global.css"				rel="stylesheet" type="text/css" />
	<link href="css/logout.css"				rel="stylesheet" type="text/css" />

	<script src="js/common/dhtml.js"	type="text/javascript"></script>

</head> 

<body>

<div id="ContentBox">

    <%Response.WriteFile("inc/header.inc");%>

   <div id="PageHdrBox">
    	
	    <!--img id="PageHdr" src="images/PageHdrTimeAlloc.jpg"  alt="Client Team Time Allocations" /-->	
	    <p id="PageHdrTitle">You Are Signed Out</p>
	    
		<!--
	    <p id="PageHdrDesc">
		    This page allows you to manage which Departments are included in Core Reports such as the 
		    Resource Planning tool. 
	    </p>
	    -->
	
    </div>	
    
 	<div id="LogoutBox">
		<div id="LogoutFields">
		    <img id="LogoutImg" src="img/login-keys-small.png" alt="login image"/>
	        <label id="LogoutMsg">Click <a href="login.aspx">here</a> when you are ready to sign back in.</label>
		</div>
	</div>  
    	      
    <%Response.WriteFile("inc/footer.inc");%>
	
</div> <!-- ContentBox -->
		  
</body> 
</html> 
