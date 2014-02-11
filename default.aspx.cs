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

public partial class Default : System.Web.UI.Page
{
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

    public string OrderNumber = "00000";

    protected void Page_Load(object sender, EventArgs e)
    {
        //Get Order Number passed via query string, if available.
        OrderNumber = Convert.ToString(Context.Request.Params["oid"]);

        //Get user info from database.
        GetUserInfo();
    }

    //--------------------------------------------------------------------------------------
    // Retrieve User/Employee information.
    //--------------------------------------------------------------------------------------
    protected void GetUserInfo()
    {
        string sResponse = "";
        string sDetails = "";

        //Get the user login ID from the authentication ticket.
        msUserLoginID = User.Identity.Name;

        try
        {
            User oUser = new User(msUserLoginID);

            //Get the UserID/EmployeeID from the dataset.
            msUserID = oUser.UserID.ToString();

            //If we have a valid UserID, get the rest of the user info.
            if (oUser.UserID != 0)
            {
                msUserType = oUser.UserType;
                msUserFirstName = oUser.FirstName;
                msUserLastName = oUser.LastName;
                msUserCompanyID = oUser.CompanyID.ToString();
                msUserCompanyName = oUser.CompanyName;
                msUserSiteID = oUser.SiteID.ToString();
                msUserSiteName = oUser.SiteName;
                msUserLastOrderID = oUser.LastOrderID.ToString();
            }

            UserLoginID.Value = msUserLoginID;
            UserID.Value = msUserID;
            UserType.Value = msUserType;
            UserFirstName.Value = msUserFirstName;
            UserLastName.Value = msUserLastName;
            UserCompanyID.Value = msUserCompanyID;
            UserCompanyName.Value = msUserCompanyName;
            UserSiteID.Value = msUserSiteID;
            UserSiteName.Value = msUserSiteName;
        }
        catch (Exception err)
        {
            sDetails = "A general error occurred. Error Details: " + err.ToString();
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }
    }
}
