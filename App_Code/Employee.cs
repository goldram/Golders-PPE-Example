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

public class Employee
{
	public int EmployeeID = 0;
	
    public int CompanyID;
    public string CompanyName;
    
    public int SiteID;
    public string SiteName;
	
	public string FirstName = "";
	public string LastName = "";
    
    public string Email = "";
    public string Phone1 = "";
    public string Phone2 = "";

	public string RespFormat = "Text";

	//Opens connection to database.	
    public SqlConnection GetConnection()
    {
		//Get the connection string. 
		string sConnTxt = ConfigurationManager.ConnectionStrings["OrdersConnStr"].ConnectionString;

		//Create and open the connection object.
		SqlConnection oConn = new SqlConnection(sConnTxt);
		oConn.Open();
    
		return oConn;
    }

    //--------------------------------------------------------------------------------------
    // Method to delete Employee data from the database.	
    //--------------------------------------------------------------------------------------
    public bool Delete()
	{
        bool Result;

        SqlConnection oConn = GetConnection();
		
        try
        {
		    //Create the SQL Stored Procedure command object.
		    SqlCommand oCmd = new SqlCommand("uspEmployeeDelete", oConn);
		    oCmd.CommandType = CommandType.StoredProcedure;

		    //Add parameters.
		    oCmd.Parameters.Add(new SqlParameter("@EmployeeID", EmployeeID));

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

    //--------------------------------------------------------------------------------------
    // Method to retrieve Employee data from the database.	
    //--------------------------------------------------------------------------------------
    public DataSet Retrieve(int UserID, int EmployeeID, int CompanyID, int SiteID, bool bIncludePurchasers)
	{
        DataSet ds = new DataSet();

        SqlConnection oConn = GetConnection();
        
        //try
        //{
            //Create the SQL Stored Procedure command object.
            SqlCommand oCmd = new SqlCommand("uspEmployeeSel", oConn);
            oCmd.CommandType = CommandType.StoredProcedure;

            //
            //Add parameters.
            //
            
            oCmd.Parameters.Add(new SqlParameter("@UserID", UserID));
           
            if (EmployeeID > 0) 
                oCmd.Parameters.Add(new SqlParameter("@EmployeeID", EmployeeID));
                
            if (SiteID > 0)     
                oCmd.Parameters.Add(new SqlParameter("@CompanySiteID", SiteID));
                
            if (CompanyID > 0)  
                oCmd.Parameters.Add(new SqlParameter("@CompanyID", CompanyID));
            
            if (bIncludePurchasers)
                oCmd.Parameters.Add(new SqlParameter("@IncludePurchasers", 1));

            //Execute SQL stored procedure.						
            //SqlDataReader oRdr = oCmd.ExecuteReader();

            //oCmd.ExecuteNonQuery();

            SqlDataAdapter da = new SqlDataAdapter(oCmd);
            ds = new DataSet("Employees");
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

    //--------------------------------------------------------------------------------------
    // Method to save Employee data to the database.	
    //--------------------------------------------------------------------------------------
    public void Save(string sModifiedValues)
    {
        //bool Result = false;

        SqlConnection oConn = GetConnection();
        
        //Create the SQL Stored Procedure command object.
        SqlCommand oCmd = new SqlCommand("uspEmployeeSave", oConn);
        oCmd.CommandType = CommandType.StoredProcedure;

        //Add parameters.
        //           oCmd.Parameters.Add(new SqlParameter("@UserID", sUserID));
        //           oCmd.Parameters.Add(new SqlParameter("@Employee", EmployeeID));
        oCmd.Parameters.Add(new SqlParameter("@ModifiedValues", sModifiedValues));

        //Execute SQL stored procedure.						
        //SqlDataReader oRdr = oCmd.ExecuteReader();

        oCmd.ExecuteNonQuery();

        oConn.Close();
    }

    //--------------------------------------------------------------------------------------
    // Method to save Employee Current Sizes data to the database.	
    //--------------------------------------------------------------------------------------
    public void SaveCurrentSizes(string sModifiedValues)
    {
        //bool Result = false;

        SqlConnection oConn = GetConnection();

        //Create the SQL Stored Procedure command object.
        SqlCommand oCmd = new SqlCommand("uspCurrentSizesSave", oConn);
        oCmd.CommandType = CommandType.StoredProcedure;

        //Add parameters.
        //           oCmd.Parameters.Add(new SqlParameter("@UserID", sUserID));
        oCmd.Parameters.Add(new SqlParameter("@EmployeeID", EmployeeID));
        oCmd.Parameters.Add(new SqlParameter("@ModifiedValues", sModifiedValues));

        //Execute SQL stored procedure.						
        //SqlDataReader oRdr = oCmd.ExecuteReader();

        oCmd.ExecuteNonQuery();

        oConn.Close();
    }    
}
