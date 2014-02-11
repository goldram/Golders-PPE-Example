<%@ Page Language="C#" AutoEventWireup="true" CodeFile="login-change-pw-LAST.aspx.cs" Inherits="LoginChangePWLAST" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Change/Reset Password</title>
</head>
<body>
    <form id="form1" runat="server">
    <div>
        <asp:ChangePassword runat="server" 
            CancelDestinationPageUrl="login.aspx" 
            ContinueDestinationPageUrl="default.aspx" 
            DisplayUserName="True" 
            SuccessPageUrl="default.aspx">
        </asp:ChangePassword>
    </div>
    </form>
</body>
</html>
