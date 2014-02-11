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
//using System.Security.Authentication;

public partial class Login : System.Web.UI.Page
{
	
    protected void Page_Load(object sender, EventArgs e)
    {
        //Get Order ID passed via query string, if possible.
        string sOrderID = Convert.ToString(Context.Request.Params["oid"]);
        
        //Get username to be used for autologin (if requested).
        string sAutoLoginUserName = Convert.ToString(Context.Request.Params["autologin"]);
        
        //If automatic login requested, attempt to authenticate the user based on the username/email
        //passed in the query string parms, effectively bypassing the login form.
        if (sAutoLoginUserName != null && sAutoLoginUserName.Length > 0) 
        {
            //Retrieve user info.
            User oUser = new User(sAutoLoginUserName);
            
            //Get the default password for the user.
            string sPW = oUser.GetTempPW();

            //Attempt authentication.
            if (Membership.ValidateUser(sAutoLoginUserName, sPW))
            {
                string sURL = ConfigurationManager.AppSettings["OrderEmailEmployeeURL"];
                //sURL = "http:" + "//" + sURL;
                sURL += "?oid=" + sOrderID;

                //Create authentication cookie for user.
                FormsAuthentication.SetAuthCookie(sAutoLoginUserName, false);

                //Redirect user to their order.
                //Response.Redirect(sURL);
                Response.Redirect("default.aspx");
            }
            else
            {
                LoginInfo.UserName = sAutoLoginUserName;
            }
        }

    }

    //------------------------------------------------------------------------------------------------
    // Authenticate the user based on the username and password entered in the form. 	
    //------------------------------------------------------------------------------------------------
    protected void Login_Authenticate(object sender, AuthenticateEventArgs e)
	{

        if (Membership.ValidateUser(LoginInfo.UserName, LoginInfo.Password)) 
        {
        
            MembershipUser oUser = Membership.GetUser(LoginInfo.UserName);
            
		    if (oUser.CreationDate == oUser.LastPasswordChangedDate)
		    {
		        Response.Redirect("login-change-pw.aspx?un=" + LoginInfo.UserName);
                //FormsAuthentication.RedirectFromLoginPage(LoginInfo.UserName, LoginInfo.RememberMeSet);
            }
		    else 
		    {
			    FormsAuthentication.RedirectFromLoginPage(LoginInfo.UserName, LoginInfo.RememberMeSet);
			    
		    }
		}
		
	}
}
