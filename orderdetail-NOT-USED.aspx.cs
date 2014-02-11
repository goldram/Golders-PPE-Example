using System;
using System.Collections;
using System.Configuration;
using System.Data;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;

public partial class OrderDetail_NOT_USED : System.Web.UI.Page
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


    protected void Page_Load(object sender, EventArgs e)
    {
        //Get Order ID passed via query string, if possible.
        string sOrderID = Convert.ToString(Context.Request.Params["oid"]);
        
        //Get user info from database.
        GetUserInfo();
        
        //If no Order ID passed via query string, use the last order ID for the
        //user.
        if (sOrderID == null || sOrderID.Length == 0) 
        {
            sOrderID = msUserLastOrderID;
        }
        
        //Save the Order ID in a hidden field.
        OrderID.Value = sOrderID;
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
