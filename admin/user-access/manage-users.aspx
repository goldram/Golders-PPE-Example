<%@ Page Language="C#" AutoEventWireup="true" CodeFile="manage-users.aspx.cs" Inherits="admin_manage_users" %>

<%@ Register TagPrefix="dc" TagName="alphalinks" Src="~/_controls/alphalinks.ascx" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">

<head runat="server"> 
    
  <title>Manage Users</title>
     
	<link href="~/css/global.css"			      rel="stylesheet" type="text/css" />
	<link href="~/css/common/uifields.css"	rel="stylesheet" type="text/css" />
	<link href="~/css/login.css"			      rel="stylesheet" type="text/css" />
	<link href="../css/StyleSheet.css"      rel="stylesheet" type="text/css" />

	<script src="../../js/common/dhtml.js"	    type="text/javascript"></script>
	<script src="../../js/common/uifields.js"   type="text/javascript"></script>	
	<script src="../../js/common/cloaker.js"    type="text/javascript"></script>	
	<script src="../../js/global.js"            type="text/javascript"></script>	
	<script src="../js/admin.js"                type="text/javascript"></script>	
	
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
         
    <div class="AdminActionBar">
	    <%-- <a id="ActionAddUser"  href="user-add.aspx">Add User</a> --%>
	    <a id="ActionAddUser"  href="javascript:ShowNewUserUI();">Add User</a>
	    <a id="ActionResetUserPW"  href="<%= this.Page.ResolveClientUrl("~/login-reset-pw.aspx")%>">Reset User Password</a>
        <asp:Label id="AdminStatusMsg" name="AdminStatusMsg" runat="server" />
    </div>	
            
                
    <form id="DataForm" method="post"  enctype="Multipart/Form-Data" runat="server">	
   
    <!--
    --------------------------------------------------------------------------------------------
     Table for Users.
    ------------------------------------------------------------------------------------------------
    -->
    <div id="AdminBox" class="DataGroupBox" style="padding:0px;">  
     
        <%--
        <asp:GridView ID="Users" runat="server" AutoGenerateColumns="false"
            CssClass="list" AlternatingRowStyle-CssClass="odd" GridLines="none"
        >
        <Columns>
            <asp:TemplateField>
	            <HeaderTemplate>User Name</HeaderTemplate>
	            <ItemTemplate>
	            <a href="edit_user.aspx?username=<%# Eval("UserName") %>"><%# Eval("UserName") %></a>
                <a href="edit_user.aspx?username=<%# Eval("UserName") %>"><%# Eval("UserName") %></a>
	            javascript:ShowEmployeeUI(0,'admin-new-user');
	            </ItemTemplate>
            </asp:TemplateField>
            <asp:BoundField DataField="email" HeaderText="Email" />
            <asp:BoundField DataField="comment" HeaderText="Comments" />
            <asp:BoundField DataField="creationdate" HeaderText="Creation Date" ItemStyle-CssClass="TableDate" HeaderStyle-CssClass="TableDateHdr" ControlStyle-Width="200" />
            <asp:BoundField DataField="lastlogindate" HeaderText="Last Login Date"  ItemStyle-CssClass="TableDate" HeaderStyle-CssClass="TableDateHdr"/>
            <asp:BoundField DataField="lastactivitydate" HeaderText="Last Activity Date"  ItemStyle-CssClass="TableDate" HeaderStyle-CssClass="TableDateHdr"/>
            <asp:BoundField DataField="isapproved" HeaderText="Is Active" ItemStyle-CssClass="TableFlag" HeaderStyle-CssClass="TableFlagHdr"/>
            <asp:BoundField DataField="islockedout" HeaderText="Is Locked Out"  ItemStyle-CssClass="TableFlag" HeaderStyle-CssClass="TableFlagHdr"/>
        </Columns>
        </asp:GridView>
        --%>
      
        <asp:GridView ID="Users" runat="server" AutoGenerateColumns="false"
            CssClass="list" AlternatingRowStyle-CssClass="odd" GridLines="none"
            allowsorting="True"
        >
        <Columns>
            <asp:TemplateField>
	            <HeaderTemplate>User/Employee Name</HeaderTemplate>
	            <ItemTemplate>
	            <a href="javascript:ShowEditUserUI('<%# Eval("EmployeeID")%>','<%# Eval("UserType") %>','<%# Eval("CompanyID") %>');" title="Edit <%# Eval("FullName")%>"><%# Eval("FullName") %></a>
                </ItemTemplate>
            </asp:TemplateField>
            <asp:BoundField DataField="UserType" HeaderText="User Type" />
            <asp:BoundField DataField="EmailAddr" HeaderText="Email Address" />
            <asp:BoundField DataField="CompanyName" HeaderText="Company Name" ControlStyle-Width="200" HeaderStyle-Width="200" ItemStyle-Width="200" />
            <asp:BoundField DataField="Comment" HeaderText="Comments" />
            <asp:BoundField DataField="CreateDate" HeaderText="Creation Date" ItemStyle-CssClass="TableDate" HeaderStyle-CssClass="TableDateHdr" ControlStyle-Width="200" />
            <asp:BoundField DataField="lastlogindate" HeaderText="Last Login Date"  ItemStyle-CssClass="TableDate" HeaderStyle-CssClass="TableDateHdr"/>
            <asp:BoundField DataField="lastactivitydate" HeaderText="Last Activity Date"  ItemStyle-CssClass="TableDate" HeaderStyle-CssClass="TableDateHdr"/>
            <asp:BoundField DataField="islockedout" HeaderText="Is Locked Out"  ItemStyle-CssClass="TableFlag" HeaderStyle-CssClass="TableFlagHdr"/>
            <asp:TemplateField>
	            <HeaderTemplate></HeaderTemplate>
	            <ItemTemplate>
	                <%--
	                <a  href="javascript:alert('Delete <%# Eval("FullName")%>?');" title="Delete <%# Eval("FullName")%>">delete</a>
	                <a  style="color:blue;" title="Delete <%# Eval("FullName")%>">delete</a>
	                <asp:Button runat="server" Text="Delete User" Tooltip='<%# Eval("FullName")%>' OnClick="DeleteUser" OnClientClick="return confirm('Permanently delete user?')" />
	                --%>
	                <asp:Button id="DeleteUserBtn" Text="delete" runat="server" 
	                    CommandName="DeleteUser" CommandArgument='<%# Eval("EmailAddr")%>'
                        OnCommand="DeleteUserBtn_Click"
                        OnClientClick="return confirm('Permanently delete user?')" 
                        ToolTip='Delete <%# Eval("FullName")%>'
                        ForeColor="Blue" BorderWidth="0" BorderStyle="None" BackColor="Transparent" 
                    />
                </ItemTemplate>
            </asp:TemplateField>
           <asp:TemplateField>
	            <HeaderTemplate></HeaderTemplate>
	            <ItemTemplate>
	            <%-- 
	            <a href="javascript:alert('Inactivate feature not enabled');confirm('Inactivate <%# Eval("FullName")%>?');" title="Inactivate <%# Eval("FullName")%>">inactivate</a>
 	            --%>
 	            <a style="color:blue;" title="Inactivate <%# Eval("FullName")%>">inactivate</a>
               </ItemTemplate>
            </asp:TemplateField>        
         </Columns>
        </asp:GridView>   
    </div>
   
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
       
    <%Response.WriteFile("../inc/footer.inc");%>

    
    <!----------------------------------------------------------------------------------------------
     iFrame for managing employee's profile.
    ------------------------------------------------------------------------------------------------>

    <%if (User.Identity.Name != null && User.Identity.Name.Length > 0) { %> 
        <iframe id="EmployeePopup" name="EmployeePopup"	src="../../employee-info.aspx" style="display:none" frameborder="0" scrolling="no" allowtransparency=""></iframe>
    <%}%>
   
    <!----------------------------------------------------------------------------------------------
     iFrame for adding a new employee.
    ------------------------------------------------------------------------------------------------>

    <%if (User.Identity.Name != null && User.Identity.Name.Length > 0) { %> 
        <iframe id="NewEmployeePopup" name="NewEmployeePopup"  src="../../employee-info.aspx" style="display:none" frameborder="0" scrolling="no" allowtransparency=""></iframe>
    <%}%>	
	
</div> <!-- ContentBox -->
</body>
</html>
