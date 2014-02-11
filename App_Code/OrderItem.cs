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
using System.Net.Mail;

public class OrderItem
{
    public int OrderItemID;
    public int OrderID;
    public int ProductCategoryID;
    public int ProductID;
    
    public string OrderNumber;
    
    public int UserID;
    public int EmployeeID;
    
    public int CompanyID;
    public string CompanyName;
    public string CustomerNumber;
    
    public int SiteID;
    public string SiteName;
    
    public string OrderStatus;
    
    public string SubmitDate;
    public string ShipDate;
    public string DeliverDate;
    public string HoldDate;
    public string CancelDate;
    
    public int SubmitDateBy;
    public int ShipDateBy;
    public int DeliverDateBy;
    public int HoldDateBy;
    public int CancelDateBy;
    
    public string DeliverMethod;
    public string DeliverDest;

    public string DeliverAddrLine1;
    public string DeliverAddrLine2;
    public string DeliverAddrLine3;
    
    public string Comments;

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

	//Method to delete an Order from the database.	
	public bool CancelOrderItem()
	{
        bool Result;

        SqlConnection oConn = GetConnection();
		
        try
        {
		    //Create the SQL Stored Procedure command object.
		    SqlCommand oCmd = new SqlCommand("uspOrderItemStatusUpdate", oConn);
		    oCmd.CommandType = CommandType.StoredProcedure;

		    //Add parameters.
		    oCmd.Parameters.Add(new SqlParameter("@OrderItemID", OrderID));
            oCmd.Parameters.Add(new SqlParameter("@Status", "Cancel"));

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
 
	//Method to retrieve one or more Orders from the database.	
    public DataSet Retrieve(int OrderID, int OrderItemID)
	{
        DataSet ds = new DataSet();

        SqlConnection oConn = GetConnection();
        
        //try
        //{
            //Create the SQL Stored Procedure command object.
            SqlCommand oCmd = new SqlCommand("uspOrderItemSel", oConn);
            oCmd.CommandType = CommandType.StoredProcedure;

            //Add parameters.
            if (OrderID > 0) oCmd.Parameters.Add(new SqlParameter("@OrderID", OrderID));
            
            if (OrderItemID > 0) oCmd.Parameters.Add(new SqlParameter("@OrderItemID", OrderID));
       
            //Execute SQL stored procedure.						
            //SqlDataReader oRdr = oCmd.ExecuteReader();

            //oCmd.ExecuteNonQuery();

            SqlDataAdapter da = new SqlDataAdapter(oCmd);
            ds = new DataSet("Order Items");
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
