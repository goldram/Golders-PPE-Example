using System;
using System.Collections;
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

public partial class db : System.Web.UI.Page
{
    string msUserLoginID = "unknown";
    string msUserID = "0";
    string msUserEmail = "unknown";
    string msUserType = "unknown";

    string msUserFirstName = "unknown";
    string msUserLastName = "unknown";

    string msUserCompanyID = "0";
    string msUserCompanyName = "unknown";

    string msUserSiteID = "0";
    string msUserSiteName = "unknown";

    string msUserLastOrderID = "0";
    string msUserLastLoginDate = "";

    Boolean mbReturnErrorDetails = (ConfigurationManager.AppSettings["ReturnErrorDetails"].ToString() == "false") ? false : true;
    string msGenericErrorMsg = "Viewing error details must be enabled in application configuration file.";

    protected void Page_Load(object sender, EventArgs ea)
    {

        //Get user info from database.
        GetUserInfo();
        
        //Get the action to perform from the request variables.
        string sAction = Convert.ToString(Context.Request.Params["Action"]);

        //Call the appropriate routine based on the requested action.
        switch (sAction)
        {
            case "GetCompanies":
                GetCompanies();
                break;
            case "GetCompanySites":
                GetCompanySites();
                break;
            case "GetEmployee":
                GetEmployee();
                break;
            case "GetEmployeeCurrentSizes":
                GetEmployeeCurrentSizes();
                break;
            case "GetOrder":
                GetOrder();
                break;
            case "GetOrderItems":
                GetOrderItems();
                break;
            case "GetOrderQtySpecs":
                GetOrderQtySpecs();
                break;
            case "GetProducts":
                GetProducts();
                break;
            case "GetUserList":
                GetUserList();
                break;
            case "SaveAuthorizedOrder":
                SaveAuthorizedOrder();
                break;
            case "SaveEmployeeCurrentSizes":
                SaveEmployeeCurrentSizes();
                break;
            case "SaveEmployee":
                SaveEmployee();
                break;
            case "SaveOrder":
                SaveOrder();
                break;
        }

    }

    //--------------------------------------------------------------------------------------
    //Opens connection to database.	
    //--------------------------------------------------------------------------------------
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
    // Retrieve User information.
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
                msUserEmail = ds.Tables[0].Rows[0]["UserEmail"].ToString();
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
            sDetails = "A general error occurred attempting to capture info about logged-in user. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }
    }
    
    //--------------------------------------------------------------------------------------
    // Delete Employee.
    //--------------------------------------------------------------------------------------
    protected void DeleteEmployee()
    {
        string sResponse = "";
        string sDetails = "";

        try
        {
            //Create new LeadSource object.
            Employee oEmployee = new Employee();

            oEmployee.EmployeeID = Convert.ToInt32(Context.Request.Params["EmployeeID"]);

            bool sResult = oEmployee.Delete();

            Response.Clear();

            sResponse = "RespStatus=Success|RespDetail=Deleted";
            Response.Write(sResponse);

        }
        catch (SqlException err)
        {
            sDetails = "SQL error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }
        catch (Exception err)
        {
            sDetails = "A general error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }

    }

    //--------------------------------------------------------------------------------------
    // Retrieve all Companies.
    //--------------------------------------------------------------------------------------
    protected void GetCompanies()
    {
        string sResponse = "";
        string sDetails = "";

        try
        {
            int CompanyID = Convert.ToInt32(Context.Request.Params["CompanyID"]);

            DataSet ds = new DataSet();

            SqlConnection oConn = GetConnection();

            //Create the SQL Stored Procedure command object.
            SqlCommand oCmd = new SqlCommand("uspCompanySel", oConn);
            oCmd.CommandType = CommandType.StoredProcedure;

            //Add parameters.
            //oCmd.Parameters.Add(new SqlParameter("@CompanyID", CompanyID));

            //Execute SQL stored procedure.						
            //SqlDataReader oRdr = oCmd.ExecuteReader();

            //oCmd.ExecuteNonQuery();

            SqlDataAdapter da = new SqlDataAdapter(oCmd);
            ds = new DataSet("Companies");
            da.Fill(ds);

            oConn.Close();

            Response.Clear();

            StringWriter sXml = new StringWriter();

            //ds.WriteXml(sXml,XmlWriteMode.WriteSchema);
            ds.WriteXml(sXml);

            //sResponse = "RespStatus=Success|RespDetail=" + sXml.ToString();
            //Response.Write(sResponse);

            Response.ContentType = "text/xml";
            Response.Charset = "UTF-8";
            Response.Write(sXml);

        }
        catch (SqlException err)
        {
            sDetails = "SQL error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }
        catch (Exception err)
        {
            sDetails = "A general error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }

    }
        
    //--------------------------------------------------------------------------------------
    // Retrieve all Company Sites for the specified Company.
    //--------------------------------------------------------------------------------------
    protected void GetCompanySites()
    {
        string sResponse = "";
        string sDetails = "";

        try
        {
            int CompanyID = Convert.ToInt32(Context.Request.Params["CompanyID"]);

            DataSet ds = new DataSet();

            SqlConnection oConn = GetConnection();

            //Create the SQL Stored Procedure command object.
            SqlCommand oCmd = new SqlCommand("uspCompanySitesSel", oConn);
            oCmd.CommandType = CommandType.StoredProcedure;

            //Add parameters.
            if (CompanyID != 0) oCmd.Parameters.Add(new SqlParameter("@CompanyID", CompanyID));

            //Execute SQL stored procedure.						
            //SqlDataReader oRdr = oCmd.ExecuteReader();

            //oCmd.ExecuteNonQuery();

            SqlDataAdapter da = new SqlDataAdapter(oCmd);
            ds = new DataSet("CompanySites");
            da.Fill(ds);

            oConn.Close();

            Response.Clear();

            StringWriter sXml = new StringWriter();

            //ds.WriteXml(sXml,XmlWriteMode.WriteSchema);
            ds.WriteXml(sXml);

            //sResponse = "RespStatus=Success|RespDetail=" + sXml.ToString();
            //Response.Write(sResponse);

            Response.ContentType = "text/xml";
            Response.Charset = "UTF-8";
            Response.Write(sXml);

        }
        catch (SqlException err)
        {
            sDetails = "SQL error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }
        catch (Exception err)
        {
            sDetails = "A general error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }

    }
        
    //--------------------------------------------------------------------------------------
    // Retrieve Employee information.
    //--------------------------------------------------------------------------------------
    protected void GetEmployee()
    {
        string sResponse = "";
        string sDetails = "";

        try
        {
            //Create new Employee object.
            Employee oEmployee = new Employee();

            int UserID = Convert.ToInt32(Context.Request.Params["UserID"]);
            int EmployeeID = Convert.ToInt32(Context.Request.Params["EmployeeID"]);
            int CompanyID = Convert.ToInt32(Context.Request.Params["CompanyID"]);
            int SiteID = Convert.ToInt32(Context.Request.Params["SiteID"]);
            
            int IncludePurchasers = Convert.ToInt32(Context.Request.Params["IncludePurchasers"]);
            bool bIncludePurchasers = (IncludePurchasers == 1) ? true : false;

            DataSet ds = oEmployee.Retrieve(UserID, EmployeeID, CompanyID, SiteID, false);

            Response.Clear();

            StringWriter sXml = new StringWriter();

            //ds.WriteXml(sXml,XmlWriteMode.WriteSchema);
            ds.WriteXml(sXml);

            //sResponse = "RespStatus=Success|RespDetail=" + sXml.ToString();
            //Response.Write(sResponse);

            Response.ContentType = "text/xml";
            Response.Charset = "UTF-8";
            Response.Write(sXml);

        }
        catch (SqlException err)
        {
            sDetails = "SQL error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }
        catch (Exception err)
        {
            sDetails = "A general error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }

    }

    //--------------------------------------------------------------------------------------
    // Retrieve current sizes for the specified Employee.
    //--------------------------------------------------------------------------------------
    protected void GetEmployeeCurrentSizes()
    {
        string sResponse = "";
        string sDetails = "";

        try
        {
            int EmployeeID = Convert.ToInt32(Context.Request.Params["EmployeeID"]);

            DataSet ds = new DataSet();

            SqlConnection oConn = GetConnection();

            //Create the SQL Stored Procedure command object.
            SqlCommand oCmd = new SqlCommand("uspCurrentSizesSel", oConn);
            oCmd.CommandType = CommandType.StoredProcedure;

            //Add parameters.
            oCmd.Parameters.Add(new SqlParameter("@EmployeeID", EmployeeID));

            //Execute SQL stored procedure.						
            //SqlDataReader oRdr = oCmd.ExecuteReader();

            //oCmd.ExecuteNonQuery();

            SqlDataAdapter da = new SqlDataAdapter(oCmd);
            ds = new DataSet("CurrentSizes");
            da.Fill(ds);

            oConn.Close();

            Response.Clear();

            StringWriter sXml = new StringWriter();

            //ds.WriteXml(sXml,XmlWriteMode.WriteSchema);
            ds.WriteXml(sXml);

            //sResponse = "RespStatus=Success|RespDetail=" + sXml.ToString();
            //Response.Write(sResponse);

            Response.ContentType = "text/xml";
            Response.Charset = "UTF-8";
            Response.Write(sXml);

        }
        catch (SqlException err)
        {
            sDetails = "SQL error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }
        catch (Exception err)
        {
            sDetails = "A general error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }

    }
    
    //--------------------------------------------------------------------------------------
    // Retrieve Order information.
    //--------------------------------------------------------------------------------------
    protected void GetOrder()
    {
        string sResponse = "";
        string sDetails = "";

        try
        {
            //Create new Order object.
            Order oOrder = new Order();

            int OrderID = Convert.ToInt32(Context.Request.Params["OrderID"]);
            int PurchaserID = Convert.ToInt32(Context.Request.Params["PurchaserID"]);
            int EmployeeID = Convert.ToInt32(Context.Request.Params["EmployeeID"]);
            int CompanyID = Convert.ToInt32(Context.Request.Params["CompanyID"]);
            int SiteID = Convert.ToInt32(Context.Request.Params["SiteID"]);
            string OrderStatus = Convert.ToString(Context.Request.Params["StatusFilter"]);

            DataSet ds = oOrder.Retrieve(msUserType, OrderID, PurchaserID, EmployeeID, CompanyID, SiteID, OrderStatus, true);

            Response.Clear();

            StringWriter sXml = new StringWriter();

            //ds.WriteXml(sXml,XmlWriteMode.WriteSchema);
            ds.WriteXml(sXml);

            //sResponse = "RespStatus=Success|RespDetail=" + sXml.ToString();
            //Response.Write(sResponse);

            Response.ContentType = "text/xml";
            Response.Charset = "UTF-8";
            Response.Write(sXml);

        }
        catch (SqlException err)
        {
            sDetails = "SQL error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }
        catch (Exception err)
        {
            sDetails = "A general error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }

    }

    //--------------------------------------------------------------------------------------
    // Retrieve Order Item information.
    //--------------------------------------------------------------------------------------
    protected void GetOrderItems()
    {
        string sResponse = "";
        string sDetails = "";

        try
        {
            //Create new Order object.
            OrderItem oOrderItem = new OrderItem();

            int OrderID = Convert.ToInt32(Context.Request.Params["OrderID"]);
            int OrderItemID = Convert.ToInt32(Context.Request.Params["OrderItemID"]);

            DataSet ds = oOrderItem.Retrieve(OrderID, OrderItemID);

            Response.Clear();

            StringWriter sXml = new StringWriter();

            //ds.WriteXml(sXml,XmlWriteMode.WriteSchema);
            ds.WriteXml(sXml);

            //sResponse = "RespStatus=Success|RespDetail=" + sXml.ToString();
            //Response.Write(sResponse);

            Response.ContentType = "text/xml";
            Response.Charset = "UTF-8";
            Response.Write(sXml);

        }
        catch (SqlException err)
        {
            sDetails = "SQL error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }
        catch (Exception err)
        {
            sDetails = "A general error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }

    }    
     
    //--------------------------------------------------------------------------------------
    // Retrieve Order Quantity requirements.
    //--------------------------------------------------------------------------------------
    protected void GetOrderQtySpecs()
    {
        string sResponse = "";
        string sDetails = "";

        try
        {
            int CompanyID = Convert.ToInt32(Context.Request.Params["CompanyID"]);
            int OrderID = Convert.ToInt32(Context.Request.Params["OrderID"]);

            DataSet ds = new DataSet();

            SqlConnection oConn = GetConnection();

            //Create the SQL Stored Procedure command object.
            SqlCommand oCmd = new SqlCommand("uspOrderQtySpecsSel", oConn);
            oCmd.CommandType = CommandType.StoredProcedure;

            //Add parameters.
            oCmd.Parameters.Add(new SqlParameter("@CustomerID", CompanyID));
            oCmd.Parameters.Add(new SqlParameter("@OrderID",   OrderID));

            //Execute SQL stored procedure.						
            //SqlDataReader oRdr = oCmd.ExecuteReader();

            //oCmd.ExecuteNonQuery();

            SqlDataAdapter da = new SqlDataAdapter(oCmd);
            ds = new DataSet("OrderQtySpecs");
            da.Fill(ds);

            oConn.Close();

            Response.Clear();

            StringWriter sXml = new StringWriter();

            //ds.WriteXml(sXml,XmlWriteMode.WriteSchema);
            ds.WriteXml(sXml);

            //sResponse = "RespStatus=Success|RespDetail=" + sXml.ToString();
            //Response.Write(sResponse);

            Response.ContentType = "text/xml";
            Response.Charset = "UTF-8";
            Response.Write(sXml);

        }
        catch (SqlException err)
        {
            sDetails = "SQL error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }
        catch (Exception err)
        {
            sDetails = "A general error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }

    }

    //--------------------------------------------------------------------------------------
    // Retrieve Products for specified company/customer requirements.
    //--------------------------------------------------------------------------------------
    protected void GetProducts()
    {
        string sResponse = "";
        string sDetails = "";

        try
        {
            int CompanyID = Convert.ToInt32(Context.Request.Params["CompanyID"]);

            DataSet ds = new DataSet();

            SqlConnection oConn = GetConnection();

            //Create the SQL Stored Procedure command object.
            SqlCommand oCmd = new SqlCommand("uspProductsAvailSel", oConn);
            oCmd.CommandType = CommandType.StoredProcedure;

            //Add parameters.
            oCmd.Parameters.Add(new SqlParameter("@CompanyID", CompanyID));

            //Execute SQL stored procedure.						
            //SqlDataReader oRdr = oCmd.ExecuteReader();

            //oCmd.ExecuteNonQuery();

            SqlDataAdapter da = new SqlDataAdapter(oCmd);
            ds = new DataSet("Products");
            da.Fill(ds);

            oConn.Close();

            Response.Clear();

            StringWriter sXml = new StringWriter();

            //ds.WriteXml(sXml,XmlWriteMode.WriteSchema);
            ds.WriteXml(sXml);

            //sResponse = "RespStatus=Success|RespDetail=" + sXml.ToString();
            //Response.Write(sResponse);

            Response.ContentType = "text/xml";
            Response.Charset = "UTF-8";
            Response.Write(sXml);

        }
        catch (SqlException err)
        {
            sDetails = "SQL error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }
        catch (Exception err)
        {
            sDetails = "A general error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }

    }

    //--------------------------------------------------------------------------------------
    // Retrieve User/Employee information.
    //--------------------------------------------------------------------------------------
    protected void GetUserList()
    {
        string sResponse = "";
        string sDetails = "";

        try
        {
            //Create new User object.
            User oUser = new User();

            string UserType = Convert.ToString(Context.Request.Params["UserType"]);
            string UserID = Convert.ToString(Context.Request.Params["UserID"]);
            string UserEmail = Convert.ToString(Context.Request.Params["UserEmail"]);
            int EmployeeID = Convert.ToInt32(Context.Request.Params["EmployeeID"]);
            int CompanyID = Convert.ToInt32(Context.Request.Params["CompanyID"]);

            DataSet ds = oUser.RetrieveUserList(UserType, UserID, UserEmail, EmployeeID, CompanyID);

            StringWriter sXml = new StringWriter();

            //ds.WriteXml(sXml,XmlWriteMode.WriteSchema);
            ds.WriteXml(sXml);

            //sResponse = "RespStatus=Success|RespDetail=" + sXml.ToString();
            //Response.Write(sResponse);

            Response.Clear();

            Response.ContentType = "text/xml";
            Response.Charset = "UTF-8";
            Response.Write(sXml);

        }
        catch (SqlException err)
        {
            sDetails = "SQL error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }
        catch (Exception err)
        {
            sDetails = "A general error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }

    }
    
    //--------------------------------------------------------------------------------------
    // Save Authorized Order information and send email to employee.
    //--------------------------------------------------------------------------------------
    protected void SaveAuthorizedOrder()
    {
        string sResponse = "";
        string sDetails = "";

        try
        {
            //Create new Order object.
            Order oOrder = new Order();

            oOrder.OrderID = Convert.ToInt32(Context.Request.Params["OrderID"]);
            oOrder.UserID = Convert.ToInt32(Context.Request.Params["UserID"]);
            oOrder.EmployeeID = Convert.ToInt32(Context.Request.Params["EmployeeID"]);
            oOrder.EmployeeEmail = Convert.ToString(Context.Request.Params["EmployeeEmail"]);
            oOrder.CompanyID = Convert.ToInt32(Context.Request.Params["CompanyID"]);
            oOrder.PaymentMethod = Convert.ToString(Context.Request.Params["PaymentMethod"]);
            oOrder.DeliverMethod = Convert.ToString(Context.Request.Params["DeliverMethod"]);
            
            string QtyValues = Convert.ToString(Context.Request.Params["QtyValues"]);
            
            DataSet ds = oOrder.SaveAuthOrder(QtyValues);
            
            //Send link to employee containing link to authorized order.
            oOrder.SendOrderAuthorizationEmailToEmployee(msUserEmail);

            Response.Clear();

            StringWriter sXml = new StringWriter();

            //ds.WriteXml(sXml,XmlWriteMode.WriteSchema);
            ds.WriteXml(sXml);

            Response.ContentType = "text/xml";
            Response.Charset = "UTF-8";
            Response.Write(sXml);

            //sResponse = "RespStatus=Success|RespDetail=" + sXml.ToString();
            //Response.Write(sResponse);

        }
        catch (SqlException err)
        {
            sDetails = "SQL error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }
        catch (Exception err)
        {
            sDetails = "A general error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }

    }

    //--------------------------------------------------------------------------------------
    // Save Employee information and create a new user login, if a new user.
    //--------------------------------------------------------------------------------------
    protected void SaveEmployee()
    {
        string sResponse = "";
        string sDetails = "";
        
        int iEmployeeID  = Convert.ToInt32(Context.Request.Params["EmployeeID"]);
	    bool bCreateUser = Convert.ToBoolean(Context.Request.Params["CreateUser"]);
        string sEmail    = Convert.ToString(Context.Request.Params["EmailAddr"]);
 	    string sUserType = Convert.ToString(Context.Request.Params["UserType"]);
 	    
 	    string sTempPW = "";
         
        //Save the Employee information. If a new Employee, create a new user in the 
        //Membership schema, first.
        try
        {
            string sResult = "";
            
            //Create new user?
            if (bCreateUser) 
            {
                //Create new Employee object.
                User oUser = new User();

                oUser.UserType = sUserType;
                oUser.Email = sEmail;

                sResult = oUser.Create();

                if (sResult != "Success")
                {
                    sDetails = sResult.Substring(6);
                    Response.Clear();
                    sResponse = "RespStatus=Error|RespDetail=" + sDetails;
                    Response.Write(sResponse);
                    return;
                }
                
                sTempPW = oUser.GetTempPW();
            }
            
            //Create new Employee object.
            Employee oEmployee = new Employee();

            oEmployee.EmployeeID = Convert.ToInt32(Context.Request.Params["EmployeeID"]);
            oEmployee.Email = Convert.ToString(Context.Request.Params["EmailAddr"]);
            string sModifiedValues = Convert.ToString(Context.Request.Params["ModifiedValues"]);

            oEmployee.Save(sModifiedValues);
            
            sResult = "Employee data saved";
            
            if (bCreateUser) sResult += ", pw=" + sTempPW;

            //sResponse = "RespCode=0|RespStatus=Success|RespDetail=";

            Response.Clear();

            sResponse = "RespStatus=Success|RespDetail=" + sResult;
            Response.Write(sResponse);

        }
        catch (SqlException err)
        {
            sDetails = "SQL error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }
        catch (Exception err)
        {
            sDetails = "A general error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }

    }

    //--------------------------------------------------------------------------------------
    // Save Employee Current Size information.
    //--------------------------------------------------------------------------------------
    protected void SaveEmployeeCurrentSizes()
    {
        string sResponse = "";
        string sDetails = "";

        try
        {
            //Create new Employee object.
            Employee oEmployee = new Employee();

            oEmployee.EmployeeID = Convert.ToInt32(Context.Request.Params["EmployeeID"]);
            string sModifiedValues = Convert.ToString(Context.Request.Params["ModifiedValues"]);

            oEmployee.SaveCurrentSizes(sModifiedValues);

            string sResult = "Employee current size data saved";

            //sResponse = "RespCode=0|RespStatus=Success|RespDetail=";

            Response.Clear();

            sResponse = "RespStatus=Success|RespDetail=" + sResult;
            Response.Write(sResponse);

        }
        catch (SqlException err)
        {
            sDetails = "SQL error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }
        catch (Exception err)
        {
            sDetails = "A general error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }

    }
        
    //--------------------------------------------------------------------------------------
    // Save Order information.
    //--------------------------------------------------------------------------------------
    protected void SaveOrder()
    {
        string sResponse = "";
        string sDetails = "";

        try
        {
            //Create new Order object.
            Order oOrder = new Order();

            oOrder.UserID  = Convert.ToInt32(Context.Request.Params["UserID"]);
            oOrder.OrderID = Convert.ToInt32(Context.Request.Params["OrderID"]);
            oOrder.OrderNumber = Convert.ToString(Context.Request.Params["OrderNumber"]);
            oOrder.OrderStatus = Convert.ToString(Context.Request.Params["OrderStatus"]);
            oOrder.FirstName = Convert.ToString(Context.Request.Params["FirstName"]);
            oOrder.LastName = Convert.ToString(Context.Request.Params["LastName"]);
            oOrder.Email = Convert.ToString(Context.Request.Params["EmailAddr"]);
            oOrder.EmployeeEmail = Convert.ToString(Context.Request.Params["EmailAddr"]);
            
            string SendOrderConfirmation = Convert.ToString(Context.Request.Params["SendOrderConfirmation"]);
            
            string SummaryValues = Convert.ToString(Context.Request.Params["SummaryValues"]);
            string QtyValues = Convert.ToString(Context.Request.Params["QtyValues"]);
            string OrderItemValues = Convert.ToString(Context.Request.Params["OrderItemValues"]);

            DataSet ds = oOrder.SaveOrders(SummaryValues, QtyValues, OrderItemValues);

            //Send email confirmation to employee if this is an Authorized order begin submitted.
            if (SendOrderConfirmation == "yes") oOrder.SendOrderConfirmationEmailToEmployee();

            Response.Clear();

            StringWriter sXml = new StringWriter();

            //ds.WriteXml(sXml,XmlWriteMode.WriteSchema);
            ds.WriteXml(sXml);

            Response.ContentType = "text/xml";
            Response.Charset = "UTF-8";
            Response.Write(sXml);

            //sResponse = "RespStatus=Success|RespDetail=" + sXml.ToString();
            //Response.Write(sResponse);

        }
        catch (SqlException err)
        {
            sDetails = "SQL error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }
        catch (Exception err)
        {
            sDetails = "A general error occurred. Error Details: ";
            sDetails += (mbReturnErrorDetails) ? err.ToString() : msGenericErrorMsg;
            sResponse = "RespStatus=Error|RespDetail=" + sDetails;
            Response.Write(sResponse);
        }

    }
}
