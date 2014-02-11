<%@ Page Language="C#" AutoEventWireup="true" CodeFile="employee-info.aspx.cs" Inherits="EmployeeInfo" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">

<head runat="server">

  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=8,chrome=1">
    
  <meta name="viewport" content="width=device-width, initial-scale=1">  
  
  <title>Employee Information</title>
    
	<link href="css/global.css"             rel="stylesheet" type="text/css" />
	<link href="css/common/uifields.css"	rel="stylesheet" type="text/css" />
	<link href="css/employee-info.css"      rel="stylesheet" type="text/css" />

    <link href='http://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css' />

	<!--script src="js/global.js" type="text/javascript"></script-->
	<script src="js/common/dhtml.js"        type="text/javascript"></script>	
	<script src="js/common/uifields.js"		type="text/javascript"></script>	
	<script src="js/common/cloaker.js"		type="text/javascript"></script>
	<script src="js/global.js"              type="text/javascript"></script>	
	<script src="js/employee-info.js"       type="text/javascript"></script>	
	
</head>

<body>

<div id="EmployeeBox" class="DataGroupBox">
    
    <div class="ActionBar">
        <a id="ActionSave" href="javascript:SaveChanges();">Save</a>
        <a id="ActionCancel" href="javascript:HideUI();">Close</a>
    </div>	
	    	        
    <label id="EmployeeBoxTitle" class="PopupHdr">Employee Information</label>

    <img id="ImageTop" src="img/golders-logo-small.png" alt="Golder Logo" />
    
    <label class="StatusMsg">loading data, please wait...</label>
 
    <div style="clear:both;"></div>
  					
    <div class="EmployeeGroupBox Left">
    
        <div id="GeneralFieldsGroupBox"  class="FieldGroupBox">
            <label id="GeneralFieldsHdr" class="FieldGroupHdr">General Info</label>
            <div id="GeneralFieldsGroup" class="FieldGroup"></div>
        </div>
     
        <!--
        <div id="StatusFieldsGroupBox"  class="FieldGroupBox">
            <label id="StatusFieldsHdr" class="FieldGroupHdr">Employee Status</label>
            <div id="StatusFieldsGroup" class="FieldGroup"></div>
        </div>
        -->
             
    </div>  <!-- End EmployeeBox Left -->
            
    <div class="EmployeeGroupBox Right">
           
        <div id="ContactFieldsGroupBox" class="FieldGroupBox">
            <label id="ContactFieldsHdr"   class="FieldGroupHdr">Contact Info</label>
            <div   id="ContactFieldsGroup" class="FieldGroup"></div>
            
            <%-- 
 	          <p id="PasswordLink">To change your password click <a id="ActionChangePW" target="_parent" href="<%= this.Page.ResolveClientUrl("~/login-change-pw.aspx")%>">here.</a></p>
            --%>
       </div> 
            
        <% if (UserType.Value == "purchaser") { %>
        <div id="PaymentFieldsGroupBox" class="FieldGroupBox">
            <label id="PaymentFieldsHdr"   class="FieldGroupHdr">Payment Method</label>
            <div   id="PaymentFieldsGroup" class="FieldGroup"></div>
        </div> 
        <% } %>   
                        
    </div>  <!-- End EmployeeBox Right -->
    
    <!-- DO NOT REMOVE -->
    <div class="EmployeeGroupBox ClearFix"></div>
             
</div> <!-- End EmployeeBox -->
				 
    
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
