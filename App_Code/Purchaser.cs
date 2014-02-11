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

public class Purchaser
{
	public int PurchaserID = 0;
    public int EmployeeID = 0;
	
	public string FirstName = "";
	public string LastName = "";
	
    public int CompanyID;
    public string CompanyName;
    
    public int SiteID;
    public string SiteName;
    
    public string Email = "";
    public string Phone1 = "";
    public string Phone2 = "";

    public string PaymentMethod;
    public string PaymentPO = "";
    public string PaymentCCType = "";
    public string PaymentCCName = "";
    public string PaymentCCNumber = "";
    public string PaymentCCExpMonth = "";
    public string PaymentCCExpYear = "";

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

	//Method to delete a Purchaser from the database.	
	public bool Delete()
	{
        bool Result;

        SqlConnection oConn = GetConnection();
		
        try
        {
		    //Create the SQL Stored Procedure command object.
		    SqlCommand oCmd = new SqlCommand("uspPurchaserDelete", oConn);
		    oCmd.CommandType = CommandType.StoredProcedure;

		    //Add parameters.
		    oCmd.Parameters.Add(new SqlParameter("@PurchaserID", PurchaserID));

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
 
	//Method to retrieve a Purchaser from the database.	
    public DataSet Retrieve()
	{
        DataSet ds = new DataSet();

        SqlConnection oConn = GetConnection();
        
        //try
        //{
            //Create the SQL Stored Procedure command object.
            SqlCommand oCmd = new SqlCommand("uspPurchaserSel", oConn);
            oCmd.CommandType = CommandType.StoredProcedure;

            //Add parameters.
            oCmd.Parameters.Add(new SqlParameter("@EmployeeID", EmployeeID));

            //Execute SQL stored procedure.						
            //SqlDataReader oRdr = oCmd.ExecuteReader();

            //oCmd.ExecuteNonQuery();

            SqlDataAdapter da = new SqlDataAdapter(oCmd);
            ds = new DataSet("Purchasers");
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

    //Method to save Purchaser Payment info to the database.	
    public bool SavePaymentInfo()
    {
        bool Result;

        SqlConnection oConn = GetConnection();

        try
        {
            //Create the SQL Stored Procedure command object.
            SqlCommand oCmd = new SqlCommand("uspPurchaserPaymentInfoSave", oConn);
            oCmd.CommandType = CommandType.StoredProcedure;

            //Add parameters.
            oCmd.Parameters.Add(new SqlParameter("@PuchaserID",         PurchaserID));
            oCmd.Parameters.Add(new SqlParameter("@PaymentMethod",      PaymentMethod));
            oCmd.Parameters.Add(new SqlParameter("@PaymentPO",          PaymentPO));
            oCmd.Parameters.Add(new SqlParameter("@PaymentCCType",      PaymentCCType));
            oCmd.Parameters.Add(new SqlParameter("@PaymentCCName",      PaymentCCName));
            oCmd.Parameters.Add(new SqlParameter("@PaymentCCNumber",    PaymentCCNumber));
            oCmd.Parameters.Add(new SqlParameter("@PaymentCCExpMonth",  PaymentCCExpMonth));
            oCmd.Parameters.Add(new SqlParameter("@PaymentCCExpYear",   PaymentCCExpYear));

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

}
