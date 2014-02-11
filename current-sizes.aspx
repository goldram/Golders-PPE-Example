<%@ Page Language="C#" AutoEventWireup="true" CodeFile="current-sizes.aspx.cs" Inherits="EmployeeInfo" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">

<head runat="server">

  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=8,chrome=1">
    
  <meta name="viewport" content="width=device-width, initial-scale=1">  
  
  <title>Clothing Size Profile</title>
    
	<link href="css/global.css"             rel="stylesheet" type="text/css" />
	<link href="css/common/uifields.css"	rel="stylesheet" type="text/css" />
	<link href="css/current-sizes.css"      rel="stylesheet" type="text/css" />

    <!--link href='http://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css' /-->

	<!--script src="js/global.js" type="text/javascript"></script-->
	<script src="js/common/dhtml.js"        type="text/javascript"></script>	
	<script src="js/common/uifields.js"		type="text/javascript"></script>	
	<script src="js/common/cloaker.js"		type="text/javascript"></script>
	<script src="js/global.js"              type="text/javascript"></script>	
	<script src="js/current-sizes.js"       type="text/javascript"></script>	
	
</head>

<body>

<div id="CurrentSizesBox">
  
  <!--label id="BoxTitle" class="PopupHdr">Welcome to Golders!</label-->
      
  <label class="StatusMsg">loading data, please wait...</label>
      
  <img id="ImageTop" src="img/golders-logo-small.png" alt="Golder Logo" />

  <div class="ActionBar">
      <a id="ActionSave"      href="javascript:SaveChanges();">Save</a>
      <a id="ActionCancel"    href="javascript:HideUI();">Close</a>
  </div>	
  
  <div style="clear:both";"></div>
         	
  <div id="CurrentSizesPic">
    <img src="img/current-sizes-pic.png" alt="Guy in Oversize Shirt" />
  </div>		
    		
  <div id="SizesBox">
    <p>Want your <br />uniforms to fit???</p> 
    <label id="ItemTypeHdr"  class="FieldHdr2">Item Type</label>
    <label id="ItemBrandHdr" class="FieldHdr2">Brand</label>
    <label id="ItemSizeHdr"  class="FieldHdr2">Size</label>
    <div id="SizesDataBox" class="DataBox"></div>
    <p>Give Us Your Old Sizes!</p>
  </div>  <!-- End SizesBox Left -->
             
</div> <!-- End SizesBox -->

<%-- LAST VERSION --%>
<%-- 
<div id="CurrentSizesBox">
    
    <div class="ActionBar">
        <a id="ActionSave"      href="javascript:SaveChanges();">Save</a>
        <a id="ActionCancel"    href="javascript:HideUI();">Close</a>
    </div>	
	    	        
    <label id="BoxTitle" class="PopupHdr">Welcome to Golders!</label>
    
    <label class="StatusMsg">loading data, please wait...</label>
    
    <p id="para1">Do you want your uniforms to fit? Well, we do, too!</p> 
    
    <p id="para2">Please tell us your sizes for items you currently wear. This will help us to make sure the 
    your new uniform fits properly. Thanks!</p>
   				
    <div id="SizesBox">
                    
         <label id="ItemTypeHdr"  class="FieldHdr2">Item Type</label>
         <label id="ItemBrandHdr" class="FieldHdr2">Brand</label>
         <label id="ItemSizeHdr"  class="FieldHdr2">Size</label>
         <div id="SizesDataBox" class="DataBox"></div>
          
    </div>  <!-- End SizesBox Left -->
             
</div> <!-- End SizesBox -->
--%>				 
    
<form id="DataForm" method="post"  enctype="Multipart/Form-Data" runat="server">
	
    <asp:HiddenField id="UserLoginID"   runat="server" />
    <asp:HiddenField id="UserID"        runat="server" />
    <asp:HiddenField id="UserType"      runat="server" />
    <asp:HiddenField id="UserFirstName" runat="server" />
    <asp:HiddenField id="UserLastName"  runat="server" />
    <asp:HiddenField id="UserCompanyID" runat="server" />
    <asp:HiddenField id="UserCompanyName" runat="server" />
    <asp:HiddenField id="UserSiteID"    runat="server" />
    <asp:HiddenField id="UserSiteName"  runat="server" />
    
    <asp:HiddenField id="EmployeeID"  runat="server" />
	
</form>	
	
</body>

</html>
