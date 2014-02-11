
using System;
using System.Collections;
using System.Collections.Generic;
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

public partial class LoginChangePWLAST : System.Web.UI.Page
{

    string msUserName = "";
    
    string msUserLoginID = "unknown";
    string msUserID = "0";
    string msUserType = "unknown";

    string msUserFirstName = "unknown";
    string msUserLastName = "unknown";

    string msUserCompanyID = "0";
    string msUserCompanyName = "unknown";

    string msUserSiteID = "0";
    string msUserSiteName = "unknown";

    string msUserLastOrderID = "0";

    Boolean mbReturnErrorDetails = (ConfigurationManager.AppSettings["ReturnErrorDetails"].ToString() == "false") ? false : true;
    string msGenericErrorMsg = "Viewing error details must be enabled in application configuration file.";
              
    protected void Page_Load(object sender, EventArgs e)
    {
        string msUserName = Convert.ToString(Context.Request.Params["un"]);
        
        //Get user info from database.
        GetUserInfo(msUserName);
      
        

    }

    //--------------------------------------------------------------------------------------
    // Retrieve User information.
    //--------------------------------------------------------------------------------------
    protected void GetUserInfo(string sUserName)
    {
        string sResponse = "";
        string sDetails = "";

        //Get the user login ID from the authentication ticket.
        msUserLoginID = sUserName;

        try
        {
            User oUser = new User();

            DataSet ds = oUser.Retrieve(msUserLoginID);

            //Get the UserID/EmployeeID from the dataset.
            msUserID = ds.Tables[0].Rows[0]["UserID"].ToString();

            //If we have a valid UserID, get the rest of the user info.
            if (msUserID != null && msUserID.Length > 0)
            {
                msUserType = ds.Tables[0].Rows[0]["UserType"].ToString();
                msUserFirstName = ds.Tables[0].Rows[0]["FirstName"].ToString();
                msUserLastName = ds.Tables[0].Rows[0]["LastName"].ToString();
                msUserCompanyID = ds.Tables[0].Rows[0]["CompanyID"].ToString();
                msUserCompanyName = ds.Tables[0].Rows[0]["CompanyName"].ToString();
                msUserSiteID = ds.Tables[0].Rows[0]["CompanySiteID"].ToString();
                msUserSiteName = ds.Tables[0].Rows[0]["CompanySiteName"].ToString();
                msUserLastOrderID = ds.Tables[0].Rows[0]["LastOrderID"].ToString();
            }

        }
        catch (Exception err)
        {
            sDetails = "A general error occurred attempting to capture info about the user. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }
    }


    protected void Login_Authenticate(object sender, AuthenticateEventArgs e)
    {

        //if (Membership.ValidateUser(LoginInfo.UserName, LoginInfo.Password))
        //{

        //    MembershipUser oUser = Membership.GetUser(LoginInfo.UserName);

        //    if (oUser.CreationDate == oUser.LastPasswordChangedDate)
        //    {
        //        Response.Redirect("login-change-pw.aspx?un=" + LoginInfo.UserName);
        //    }
        //    else
        //    {
        //        FormsAuthentication.RedirectFromLoginPage(LoginInfo.UserName, LoginInfo.RememberMeSet);
        //    }
        //}

    }
}
