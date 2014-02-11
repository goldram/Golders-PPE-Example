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

public partial class LoginResetPWOLD : System.Web.UI.Page
{
	
    protected void Page_Load(object sender, EventArgs e)
    {

    }
    
	protected void Login_Authenticate(object sender, AuthenticateEventArgs e)
	{

        if (Membership.ValidateUser(LoginInfo.UserName, LoginInfo.Password)) {
        
		    //if (FormsAuthentication.Authenticate(LoginInfo.UserName, LoginInfo.Password))
		    //{
			    FormsAuthentication.RedirectFromLoginPage(LoginInfo.UserName, LoginInfo.RememberMeSet);
		    //}
		}
		
	}
}
