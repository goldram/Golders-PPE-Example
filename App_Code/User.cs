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
using System.Data.SqlClient;
using System.Collections.Specialized;

public class User
{
	public int UserID = 0; //aka. Employee ID
	public string UserLoginID; //aka. Employee email address
    public string UserType = ""; //admin, purchaser, or general 
    public string LastLoginDate = "";
    public string LastPasswordChangedDate = "";
	
    public int CompanyID;
    public string CompanyName;
    
    public int SiteID;
    public string SiteName;
	
	public string FirstName = "";
	public string LastName = "";
    
    public string Email = "";
    public string Phone1 = "";
    public string Phone2 = "";
    
    public int LastOrderID;

	public string RespFormat = "Text";

    //------------------------------------------------------------------------------------------------
    // Default constructor.	
    //------------------------------------------------------------------------------------------------
    public User()
    {
    
    }
    
    //------------------------------------------------------------------------------------------------
    // Constructor to retreive user information from the database	
    //------------------------------------------------------------------------------------------------
    public User(string UserEmailAddr)
    {
        DataSet ds = new DataSet();

        SqlConnection oConn = GetConnection();

        //try
        //{
        //Create the SQL Stored Procedure command object.
        SqlCommand oCmd = new SqlCommand("uspUserSel", oConn);
        oCmd.CommandType = CommandType.StoredProcedure;

        //Add parameters.
        oCmd.Parameters.Add(new SqlParameter("@UserEmailAddr", UserEmailAddr));

        //Execute SQL stored procedure.						
        //SqlDataReader oRdr = oCmd.ExecuteReader();

        //oCmd.ExecuteNonQuery();

        SqlDataAdapter da = new SqlDataAdapter(oCmd);
        ds = new DataSet("User Info");
        da.Fill(ds);

        oConn.Close();

        //
        //Set the object values.
        //

        //Get the UserID/EmployeeID from the dataset.
        UserID = (int)ds.Tables[0].Rows[0]["UserID"];

        //If we have a valid UserID, set the rest of the user info.
        if (UserID != 0)
        {
            UserType = ds.Tables[0].Rows[0]["UserType"].ToString();
            FirstName = ds.Tables[0].Rows[0]["FirstName"].ToString();
            LastName = ds.Tables[0].Rows[0]["LastName"].ToString();
            CompanyID = (int)ds.Tables[0].Rows[0]["CompanyID"];
            CompanyName = ds.Tables[0].Rows[0]["CompanyName"].ToString();
            SiteID = (int)ds.Tables[0].Rows[0]["CompanySiteID"];
            SiteName = ds.Tables[0].Rows[0]["CompanySiteName"].ToString();
            LastOrderID = (int)ds.Tables[0].Rows[0]["LastOrderID"];
            LastLoginDate = ds.Tables[0].Rows[0]["UserLastLoginDate"].ToString();
            LastPasswordChangedDate = ds.Tables[0].Rows[0]["UserLastPasswordChangedDate"].ToString();
        }

        //}
        //catch
        //{
        //    ds = null;
        //    oConn.Close();
        //}

        //Return.
        return;

    }
    
    //------------------------------------------------------------------------------------------------
    // Opens connection to database.	
    //------------------------------------------------------------------------------------------------
    public SqlConnection GetConnection()
    {
		//Get the connection string. 
		string sConnTxt = ConfigurationManager.ConnectionStrings["OrdersConnStr"].ConnectionString;

		//Create and open the connection object.
		SqlConnection oConn = new SqlConnection(sConnTxt);
		oConn.Open();
    
		return oConn;
    }

    //------------------------------------------------------------------------------------------------
    // Method to create a new user in the Membership database.	
    //------------------------------------------------------------------------------------------------
    public string Create()
    {
        string sResult = "";
        
        try
        {
            //Use a temp password until the user logs-in the first time.
            string sPW = GetTempPW();

            string sQuestion = "";
            string sAnswer = "";
            
            MembershipCreateStatus oCreateStatus;
            
            MembershipUser oNewUser = Membership.CreateUser(Email, sPW, Email, null, null, true, out oCreateStatus);
        
            switch (oCreateStatus) 
            {
                case MembershipCreateStatus.Success:
                    sResult = "Success";
                    break;
                case MembershipCreateStatus.DuplicateEmail:
                    sResult = "Error: The email address already exists.";
                    break;
                case MembershipCreateStatus.DuplicateUserName:
                    sResult = "Error: The email address already exists.";
                    break;
                case MembershipCreateStatus.InvalidEmail:
                    sResult = "Error: Invalid email address.";
                    break;
                case MembershipCreateStatus.InvalidPassword:
                    //sResult = "Error: Invalid password (7 characters or more, with at least one special character)";
                    sResult = "Error: Bad password, " + sPW + "";
                    break;
                default:
                    sResult = "Error: Unknown error occurred, unable to create new user account.";
                    break;
            }
            
            //Add user to the appropriate role.
            if (sResult == "Success") Roles.AddUserToRole(Email,UserType);
            
        }
        catch (Exception err)
        {
            sResult = "Error: System error occurred while attempting to create new user.";
            //debug...
            //sResult += " Error Details: " + err.ToString();
        }
        
        //Return results.
        return sResult;

    }
    
    //------------------------------------------------------------------------------------------------
    // Returns the temporary password for the specified user type. The temporary password is only in 
    // effect until the first time the user logs in, at which point they must change their password.	
    //------------------------------------------------------------------------------------------------
    public string GetTempPW()
    {
        string sPW = null;
        
        switch (UserType) 
        {
            case "admin":
                //sPW = "l0ck8D0wn!$!";
                sPW = "goldersAdmin!";
                break;
            case "purchaser":
                //sPW = "ppaass4WW00rd!$!";
                //sPW = "jigaw2tt!";
                sPW = "golders!";
                break;
            case "general":
                //sPW = "p4ss8W0rd!$!";
                sPW = "golders!";
                break;
            default:
                sPW ="abc"; //this won't work
                break;
        }
         
        return sPW;
    }

    //------------------------------------------------------------------------------------------------
    // Method to delete an Employee from the database.	
    //------------------------------------------------------------------------------------------------
    public bool Delete()
	{
        bool Result;

        SqlConnection oConn = GetConnection();
		
        try
        {
		    //Create the SQL Stored Procedure command object.
		    SqlCommand oCmd = new SqlCommand("uspUserDelete", oConn);
		    oCmd.CommandType = CommandType.StoredProcedure;

		    //Add parameters.
		    oCmd.Parameters.Add(new SqlParameter("@UserLogin", UserLoginID));

		    //Execute SQL stored procedure.						
		    //SqlDataReader oRdr = oCmd.ExecuteReader();

            oCmd.ExecuteNonQuery();

            oConn.Close();
            Result = true;
        }
        catch
        {
            Result = false;
            oConn.Close();
        }

        //Return results.
        return Result;

	}

    //------------------------------------------------------------------------------------------------
    // Method to retrieve User information from the database and return as a DataSet object.
    //------------------------------------------------------------------------------------------------
    public DataSet Retrieve(string UserEmailAddr)
	{
        DataSet ds = new DataSet();

        SqlConnection oConn = GetConnection();
        
        //try
        //{
            //Create the SQL Stored Procedure command object.
            SqlCommand oCmd = new SqlCommand("uspUserSel", oConn);
            oCmd.CommandType = CommandType.StoredProcedure;

            //Add parameters.
            oCmd.Parameters.Add(new SqlParameter("@UserEmailAddr", UserEmailAddr));

            //Execute SQL stored procedure.						
            //SqlDataReader oRdr = oCmd.ExecuteReader();

            //oCmd.ExecuteNonQuery();

            SqlDataAdapter da = new SqlDataAdapter(oCmd);
            ds = new DataSet("User Info");
            da.Fill(ds);

            oConn.Close();
        //}
        //catch
        //{
        //    ds = null;
        //    oConn.Close();
        //}

        //Return dataset.
        return ds; 
 
    }

    //------------------------------------------------------------------------------------------------
    // Method to retrieve list of users from database for admin feature.	
    //------------------------------------------------------------------------------------------------
    public DataSet RetrieveUserList(string UserType, string UserID, string UserEmail,  
                                    int EmployeeID, int CompanyID)
    {
        DataSet ds = new DataSet();

        SqlConnection oConn = GetConnection();

        //Create the SQL Stored Procedure command object.
        SqlCommand oCmd = new SqlCommand("uspUserAdminSel", oConn);
        oCmd.CommandType = CommandType.StoredProcedure;

        //
        //Add parameters.
        //
        
        if (UserEmail != null && UserEmail != "")
            oCmd.Parameters.Add(new SqlParameter("@UserEmail", UserEmail));

        if (UserType != null && UserType != "")
            oCmd.Parameters.Add(new SqlParameter("@UserType", UserType));

        if (EmployeeID > 0)
            oCmd.Parameters.Add(new SqlParameter("@EmployeeID", EmployeeID));

        if (CompanyID > 0)
            oCmd.Parameters.Add(new SqlParameter("@CompanyID", CompanyID));

        if (UserID != null && UserID != "")
            oCmd.Parameters.Add(new SqlParameter("@UserID", UserID));

        //Execute SQL stored procedure.						
        //SqlDataReader oRdr = oCmd.ExecuteReader();

        //oCmd.ExecuteNonQuery();

        SqlDataAdapter da = new SqlDataAdapter(oCmd);
        ds = new DataSet("UserList");
        da.Fill(ds);

        oConn.Close();
        //}
        //catch
        //{
        //    ds = null;
        //    oConn.Close();
        //}

        //Return dataset.
        return ds;

    }
}
