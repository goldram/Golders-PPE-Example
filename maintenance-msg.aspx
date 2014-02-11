<%@ Page Language="C#" AutoEventWireup="true" CodeFile="maintenance-msg.aspx.cs" Inherits="MaintenanceMsg" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">

<head runat="server">

  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=8,chrome=1">
    
  <meta name="viewport" content="width=device-width, initial-scale=1">  
 
  <title>Maintenance Notification</title>
    
	<link href="css/global.css"				rel="stylesheet" type="text/css" />


</head> 

<body>

<div id="ContentBox">

    <div id="HdrBox">

	    <div id="Hdr"></div>

    </div>
    
   <div id="PageHdrBox">
    	
	    <!--img id="PageHdr" src="images/PageHdrTimeAlloc.jpg"  alt="Client Team Time Allocations" /-->	
	    <p id="PageHdrTitle">Website Maintenance in Progress...</p>
	
    </div>	
    
    <div id="MaintenanceMsgBox">
	    <p>
	    The Golders Uniform application is undergoing maintenance at this time. We apologize for any 
	    inconvenience. We'll be back up soon!
        </p>    
    </div>
     
    <%Response.WriteFile("inc/footer.inc");%>
	
</div> <!-- ContentBox -->
		  
</body> 
</html> 
