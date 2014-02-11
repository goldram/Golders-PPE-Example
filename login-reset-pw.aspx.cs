using System;
using System.Collections;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Xml.Linq;
using System.Security.Authentication;

public partial class LoginResetPW : System.Web.UI.Page
{

    MembershipUser u;

    public void Page_Load(object sender, EventArgs args)
    {
        if (!Membership.EnablePasswordReset)
        {
            FormsAuthentication.RedirectToLoginPage();
        }

        Msg.Text = "";

        if (!IsPostBack)
        {
            Msg.Text = "Please enter the username/email to be reset. A new password will be automatically generated and displayed here.";
        }
        else
        {
            VerifyUsername();
        }
    }


    public void VerifyUsername()
    {
        u = Membership.GetUser(UsernameTextBox.Text, false);

        if (u == null)
        {
            Msg.Text = "Username <b>" + Server.HtmlEncode(UsernameTextBox.Text) + "</b> not found. Ensure the username is correct.";

            ResetPasswordButton.Enabled = true;
        }
        else
        {
            ResetPasswordButton.Enabled = true;
        }
    }

    public void ResetPassword_OnClick(object sender, EventArgs args)
    {
        string newPassword;

        u = Membership.GetUser(UsernameTextBox.Text, false);

        if (u == null)
        {
            Msg.Text = "Username <b>" + Server.HtmlEncode(UsernameTextBox.Text) + "</b> not found. Ensure the username is correct.";
            return;
        }

        try
        {
            newPassword = u.ResetPassword();
        }
        catch (MembershipPasswordException e)
        {
            Msg.Text = "Invalid password answer. Please re-enter and try again.";
            return;
        }
        catch (Exception e)
        {
            Msg.Text = e.Message;
            return;
        }

        if (newPassword != null)
        {
            Msg.Text = "Password reset. The new password is: " + Server.HtmlEncode(newPassword);
        }
        else
        {
            Msg.Text = "Password reset failed. Ensure the username is correct and try again.";
        }
    }
	
}
