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

public partial class UserAdd : System.Web.UI.Page
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

    MembershipUser user;

    
    private void Page_PreRender()
    {
        UserRoles.DataSource = Roles.GetAllRoles();
        UserRoles.DataBind();
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

            if (IsPostBack)
            {
                try
                {
                    AddUser();

                    Response.Redirect("manage-users.aspx");
                }
                catch (Exception ex)
                {
                    ConfirmationMessage.InnerText = "Insert Failure: " + ex.Message;
                }
            }
            

        }
        catch (Exception err)
        {
            sDetails = "A general error occurred. Error Details: " + err.ToString();
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }

    }
    
    protected void AddUser()
    {
        // Add User.
        MembershipUser newUser = Membership.CreateUser(username.Text, password.Text, email.Text);
        newUser.Comment = comment.Text;
        Membership.UpdateUser(newUser);

        // Add Roles.
        foreach (ListItem rolebox in UserRoles.Items)
        {
            if (rolebox.Selected)
            {
                Roles.AddUserToRole(username.Text, rolebox.Text);
            }
        }
    }
    
}
