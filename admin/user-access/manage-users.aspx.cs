using System;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Web;
using System.Net;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Data.SqlClient;
using System.IO;
using System.Text;
using System.Web.Util;

public partial class admin_manage_users : System.Web.UI.Page
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
    
    private void Page_PreRender()
    {
        //if (Alphalinks.Letter == "All")
        //{
        //    Users.DataSource = Membership.GetAllUsers();
        //}
        //else
        //{
        //    Users.DataSource = Membership.FindUsersByName(Alphalinks.Letter + "%");
        //}
        
        User oUser = new User();
        
        Users.DataSource = oUser.RetrieveUserList(null,null,null,0,0);
        
        //Users.DataSource = Membership.GetAllUsers();
        Users.DataBind();
    }

    protected void Page_Load(object sender, EventArgs e)
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

            //If an employee is trying to hit this page, redirect to the order details page.
            if (msUserType == "employee")
            {
                Response.Clear();
                Response.Redirect("order.aspx");
                return;
            }

        }
        catch (Exception err)
        {
            sDetails = "A general error occurred. Error Details: " + err.ToString();
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }

    }

    public void DeleteUserBtn_Click(object sender, CommandEventArgs e)
    {
        string Username = e.CommandArgument.ToString();
        
        try {
        
            //Membership.DeleteUser(username, false); // DC: My apps will NEVER delete the related data.
            bool bSuccess = Membership.DeleteUser(Username, true); // DC: except during testing, of course!
            //Response.Redirect("users.aspx");
            
            if (bSuccess) 
            {
                AdminStatusMsg.Text = "User deleted"; //+ e.CommandArgument;
                AdminStatusMsg.ForeColor = System.Drawing.Color.Green;
            }
            else 
            {
                AdminStatusMsg.Text = "Unable to delete user"; // Username: " + e.CommandArgument;
                AdminStatusMsg.ForeColor = System.Drawing.Color.Red;
            }
        }
        catch(Exception err)
        {
            AdminStatusMsg.Text = "Unable to delete user. Username: " + e.CommandArgument;
            AdminStatusMsg.ToolTip = err.Message;
            AdminStatusMsg.ForeColor = System.Drawing.Color.Red;
        }
    }
    
}
