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

public class Order
{
    public int OrderID;
    public string OrderNumber;
    
    public int UserID;
    public int EmployeeID;
    public string EmployeeEmail;
    
    public string EmployeeLastLoginDate;
    
    public int CompanyID;
    public string CompanyName;
    public string CustomerNumber;
    
    public int SiteID;
    public string SiteName;
    
    public string OrderStatus;
    
    public string EstimateDate;
    public int EstimateDateBy;
    public string AuthorizeDate;
    public int AuthorizeDateBy;
    public string SubmitDate;
    public int SubmitDateBy;
    public string ProcessDate;
    public int ProcessDateBy;
    public string ShipDate;
    public int ShipDateBy;
    public string DeliverDate;
    public int DeliverDateBy;
    public string CloseDate;
    public int CloseDateBy;
    public string HoldDate;
    public int HoldDateBy;
    public string CancelDate;
    public int CancelDateBy;
    
    public string DeliverDest;
    public string DeliverMethod;

    public string DeliverAddrLine1;
    public string DeliverAddrLine2;
    public string DeliverAddrLine3;
    
    public string Custom1;
    public string Custom2;
    public string Custom3;
    public string Custom4;
    public string Custom5;
    public string Comments;
	
	public string FirstName = "";
	public string LastName = "";
    
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
	
    string msEmailHTML = "";
    string msEmailText = "";

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
	public bool CancelOrder()
	{
        bool Result;

        SqlConnection oConn = GetConnection();
		
        try
        {
		    //Create the SQL Stored Procedure command object.
		    SqlCommand oCmd = new SqlCommand("uspOrderStatusUpdate", oConn);
		    oCmd.CommandType = CommandType.StoredProcedure;

		    //Add parameters.
		    oCmd.Parameters.Add(new SqlParameter("@OrderID", OrderID));
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
    public DataSet Retrieve(string UserType, int OrderID, int PurchaserID, 
                            int EmployeeID, int CompanyID, int SiteID, 
                            string OrderStatus, bool bIncludeCancelled)
	{
        DataSet ds = new DataSet();

        SqlConnection oConn = GetConnection();
        
        //try
        //{
            //Create the SQL Stored Procedure command object.
            SqlCommand oCmd = new SqlCommand("uspOrderSel", oConn);
            oCmd.CommandType = CommandType.StoredProcedure;
            
            oCmd.Parameters.Add(new SqlParameter("@UserType", UserType));

            //Add parameters.
            if (OrderID > 0)
                oCmd.Parameters.Add(new SqlParameter("@OrderID", OrderID));

            if (PurchaserID > 0)
                oCmd.Parameters.Add(new SqlParameter("@PurchaserID", PurchaserID));
                
            if (EmployeeID > 0)
                oCmd.Parameters.Add(new SqlParameter("@EmployeeID", EmployeeID));

            if (CompanyID > 0)
                oCmd.Parameters.Add(new SqlParameter("@CompanyID", CompanyID));

            if (SiteID > 0)
                oCmd.Parameters.Add(new SqlParameter("@CompanySiteID", SiteID));

            if (OrderStatus != null && OrderStatus.Length > 0)
                oCmd.Parameters.Add(new SqlParameter("@OrderStatus", OrderStatus));

            if (bIncludeCancelled)
                oCmd.Parameters.Add(new SqlParameter("@IncludeCancelled", 1));
                
            //Execute SQL stored procedure.						
            //SqlDataReader oRdr = oCmd.ExecuteReader();

            //oCmd.ExecuteNonQuery();

            SqlDataAdapter da = new SqlDataAdapter(oCmd);
            ds = new DataSet("Orders");
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
    // Save Authorized Order info to database.
    //--------------------------------------------------------------------------------------
    public DataSet SaveAuthOrder(string QtyValues)
    {
        DataSet ds = new DataSet();

        SqlConnection oConn = GetConnection();

        SqlCommand oCmd = new SqlCommand("uspOrderAuthSave", oConn);
        oCmd.CommandType = CommandType.StoredProcedure;

        //Add parameters.
        oCmd.Parameters.Add(new SqlParameter("@UserID",         UserID));
        oCmd.Parameters.Add(new SqlParameter("@EmployeeID",     EmployeeID));
        oCmd.Parameters.Add(new SqlParameter("@CompanyID",      CompanyID));
        oCmd.Parameters.Add(new SqlParameter("@PaymentMethod",  PaymentMethod));
        oCmd.Parameters.Add(new SqlParameter("@DeliverMethod",  DeliverMethod));
        oCmd.Parameters.Add(new SqlParameter("@QtyValues",      QtyValues));

        //Execute SQL stored procedure.						
        //SqlDataReader oRdr = oCmd.ExecuteReader();

        //oCmd.ExecuteNonQuery();

        SqlDataAdapter da = new SqlDataAdapter(oCmd);
        ds = new DataSet("OrderID");
        da.Fill(ds);
        
        DataRow dataRow = ds.Tables[0].Rows[0];
        
        OrderID = (int)dataRow["OrderID"];
        FirstName = dataRow["FirstName"].ToString();
        LastName = dataRow["LastName"].ToString();
        EmployeeLastLoginDate = dataRow["LastLoginDate"].ToString();
        
        oConn.Close();

        //Return dataset.
        return ds;

    }

    //--------------------------------------------------------------------------------------
    // Save Order info for one or more orders to database.
    //--------------------------------------------------------------------------------------
    public DataSet SaveOrders(string SummaryValues, string QtyValues, string OrderItemValues)
    {
        DataSet ds = new DataSet();

        SqlConnection oConn = GetConnection();

        SqlCommand oCmd = new SqlCommand("uspOrderSave", oConn);
        oCmd.CommandType = CommandType.StoredProcedure;

        //Add parameters.
        oCmd.Parameters.Add(new SqlParameter("@UserID", UserID));

        if (SummaryValues != null && SummaryValues.Length > 0)
            oCmd.Parameters.Add(new SqlParameter("@SummaryValues", SummaryValues));
        
        if (QtyValues != null && QtyValues.Length > 0)
            oCmd.Parameters.Add(new SqlParameter("@QtyReqValues", QtyValues));

        if (OrderItemValues != null && OrderItemValues.Length > 0)
            oCmd.Parameters.Add(new SqlParameter("@OrderItemValues", OrderItemValues));

        //Execute SQL stored procedure.						
        //SqlDataReader oRdr = oCmd.ExecuteReader();

        //oCmd.ExecuteNonQuery();

        SqlDataAdapter da = new SqlDataAdapter(oCmd);
        ds = new DataSet("Orders");
        da.Fill(ds);

        DataRow dataRow = ds.Tables[0].Rows[0];

        //OrderID = (int)dataRow["OrderID"];
        //FirstName = dataRow["FirstName"].ToString();
        //LastName = dataRow["LastName"].ToString();

        oConn.Close();

        //Return dataset.
        return ds;

    }

    //--------------------------------------------------------------------------------------
    // Send email to the employee with a link to the Authorized order.
    //--------------------------------------------------------------------------------------
    public void SendOrderAuthorizationEmailToEmployee(string sAuthorizingUserEmail)
    {
        MailMessage mail = new MailMessage();

        string sMailFrom = ConfigurationManager.AppSettings["OrderEmailFrom"];
        string sMailCC = ConfigurationManager.AppSettings["OrderEmailCC"];
        string sMailBCC = ConfigurationManager.AppSettings["OrderEmailBCC"];
        
        //CC the user who authorized the order.
        sMailCC = (sMailCC == null || sMailCC.Length == 0) ? sAuthorizingUserEmail : sMailCC + ", " + sAuthorizingUserEmail;

        //Email recipient.
        string sMailTo = EmployeeEmail;
        
        if (sMailTo == null || sMailTo.Length == 0) sMailTo = "dcarlson@streamlineic.com";

        mail.From = new MailAddress(sMailFrom);
        mail.To.Add(sMailTo);
        if (sMailCC != null) mail.CC.Add(sMailCC);
        if (sMailBCC != null) mail.Bcc.Add(sMailBCC);

        mail.Subject = "Golders Uniform Order Authorization";

        //Build the URL for the order link. 
        string sURL = ConfigurationManager.AppSettings["OrderEmailEmployeeURL"];
        //sURL = "http:" + "//" + sURL;
        sURL += "?oid=" + OrderID;

        //If the user/employee has not yet changed their temporary password, get the temporary password
        //and include it in the email. 
        User oEmployee = new User(EmployeeEmail);
        string sTempPW = "";
        if (oEmployee.LastPasswordChangedDate == null || oEmployee.LastPasswordChangedDate.Length == 0)
        {
            User oUser = new User(EmployeeEmail);

            //oUser.RetrieveAndSet(EmployeeEmail);

            //Get the temporary password.
            sTempPW = oUser.GetTempPW();
        }
        
        //If this is the first order for the user, append parm to URL that will attempt
        //an automatic login. This is done to make it easier for first time users. Subsequent  
        //visits to the website will perform normal, non-automatic login via the login form.
        if (sTempPW != "") {
            sURL += "&autologin=" + EmployeeEmail;
        }  

        mail.IsBodyHtml = true;

        //Determine if "OTHER" denomination was passed.
        //msDenom = (msDenom.ToLower() == "ot") ? msDenomOther : msDenom;

        //Initialize HTML email body.	
        msEmailHTML = string.Empty;
        msEmailHTML = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01 Transitional//EN' 'http://www.w3.org/TR/html4/loose.dtd'> <html lang='en'> <head></head>";
        msEmailHTML += "<body>";

        msEmailHTML += "<p style='color:rgb(21,0,72);font-family:Arial;font-size:11pt;'>";
        msEmailHTML += "Hello, " + FirstName;
        msEmailHTML += "</p>";
        msEmailHTML += "<p style='color:rgb(21,0,72);font-family:Arial;font-size:11pt;'>";
        msEmailHTML += "Your Golders uniform order has been authorized and ready for your uniform selections. ";
        msEmailHTML += "Your order serial number is <b>" + OrderNumber + "</b>. ";
        msEmailHTML += "</p>";
        //if (sTempPW != "") 
        //{
        //    msEmailHTML += "<p style='color:rgb(21,0,72);font-family:Arial;font-size:11pt;'>";
        //    msEmailHTML += "It appears you have not logged into the Golders Uniform website before. Please use the following temporary ";
        //    msEmailHTML += "password to log into the site: <b>" + sTempPW + "</b>";
        //    msEmailHTML += "<p style='color:rgb(21,0,72);font-family:Arial;font-size:11pt;'>";
        //    msEmailHTML += "After logging in, you will be redirected to a page where you will be requested to create a new, permanent password.";
        //    msEmailHTML += "</p>";
        //}
        msEmailHTML += "<p style='color:rgb(21,0,72);font-family:Arial;font-size:11pt;'>";
        msEmailHTML += "Please ";
        msEmailHTML += "<a href='" + sURL + "' style='color:blue;font-weight:bold;text-decoration:none;'>click here</a>";
        msEmailHTML += " to go to the Golders Uniform Ordering website home page. To view your order, click the Your Order button, and when prompted, enter the order serial number (" + OrderNumber + "). </p>";
        msEmailHTML += "<p style='color:rgb(21,0,72);;font-family:Arial;font-size:11pt;'>";
        msEmailHTML += "Sincerely, <br/> The Golders Team";
        msEmailHTML += "</p><br>";

        //Add closing string to HTML email body.
        msEmailHTML += "</body></html>";

        //
        //Build plain-text email content. 
        //

        msEmailText = string.Empty;
        msEmailText = " ";

        msEmailText += "Hi, " + FirstName;
        msEmailText += "\n\n";
        msEmailText += "Your Golders uniform order has been authorized and ready for your final selections. ";
        msEmailText += "Your order serial number is " + OrderNumber + ". ";
        //if (sTempPW != "")
        //{
        //    msEmailText += "\n\n";
        //    msEmailText += "It appears you have not used the Golders Uniform website in the past. If not, please use the following temporary ";
        //    msEmailText += "password when you log into the site: " + sTempPW;
        //    msEmailText += "\n\n";
        //    msEmailText += "After logging-in using the temporary password, you will be requested to create a new, permanent password.";
        //}
        msEmailText += "\n\n";
        msEmailText += "Please use the following link to go to the Golders Uniform Ordering website. To view your order, click the Your Order button, and when prompted, enter your order serial number (" + OrderNumber + "). \n\n ";
        msEmailText += sURL;
        msEmailText += "\n\n";
        msEmailText += "Thanks again for your uniform order! \n";
        msEmailText += "Sincerely, \n The Golders Team \n\n";

        AlternateView htmlView = AlternateView.CreateAlternateViewFromString(msEmailHTML, null, "text/html");
        mail.AlternateViews.Add(htmlView);

        AlternateView plainView = AlternateView.CreateAlternateViewFromString(msEmailText, null, "text/plain");
        mail.AlternateViews.Add(plainView);

        //Attach Photo ID file.
        //mail.Attachments.Add(new Attachment(sUploadFolder + "\\" + sPhotoFileNameFinal));

        //Attach Class Schedule (student only).
        //if (msCardType == "Student")
        //{
        //    mail.Attachments.Add(new Attachment(sUploadFolder + "\\" + sSchedFileNameFinal));
        //}

        SmtpClient smtp = new SmtpClient();

        //smtp.Host = ConfigurationManager.AppSettings["SMTP"];

        smtp.Send(mail);

        //IMPORTANT! You must call the Dispose method to prevent files to release the "lock" on the files.
        mail.Dispose();

        //Delete the file attachments.
        //File.Delete(sUploadFolder + "\\" + sPhotoFileNameFinal);
        //if (msCardType == "Student") {
        //    File.Delete(sUploadFolder + "\\" + sSchedFileNameFinal);
        //}
    }

    //--------------------------------------------------------------------------------------
    // Send confirmation email to the employee after they've submitted the order.
    //--------------------------------------------------------------------------------------
    public void SendOrderConfirmationEmailToEmployee()
    {
        MailMessage mail = new MailMessage();

        string sURL = ConfigurationManager.AppSettings["OrderEmailEmployeeURL"];
        //sURL = "http:" + "//" + sURL;
        sURL += "?oid=" + OrderID;

        string sMailFrom = ConfigurationManager.AppSettings["OrderEmailFrom"];
        string sMailCC = ConfigurationManager.AppSettings["OrderEmailCC"];
        string sMailBCC = ConfigurationManager.AppSettings["OrderEmailBCC"];

        //Email recipient.
        string sMailTo = Email;

        if (sMailTo == null || sMailTo.Length == 0) sMailTo = "dcarlson@streamlineic.com";

        mail.From = new MailAddress(sMailFrom);
        mail.To.Add(sMailTo);
        if (sMailCC != null) mail.CC.Add(sMailCC);
        if (sMailBCC != null) mail.Bcc.Add(sMailBCC);

        mail.Subject = "Golders Uniform Order Confirmation";

        //If the user/employee has not yet changed their temporary password, get the temporary password
        //and include it in the email. 
        User oEmployee = new User(EmployeeEmail);
        string sTempPW = "";
        if (oEmployee.LastPasswordChangedDate == null || oEmployee.LastPasswordChangedDate.Length == 0)
        {
            User oUser = new User(EmployeeEmail);

            //oUser.RetrieveAndSet(EmployeeEmail);

            //Get the temporary password.
            sTempPW = oUser.GetTempPW();
        }

        mail.IsBodyHtml = true;

        //Determine if "OTHER" denomination was passed.
        //msDenom = (msDenom.ToLower() == "ot") ? msDenomOther : msDenom;

        //Initialize HTML email body.	NOTE!!! Keep length of content lines to less than 76 characters to avoid spam filters.
        msEmailHTML = string.Empty;
        msEmailHTML = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01 Transitional//EN' 'http://www.w3.org/TR/html4/loose.dtd'> <html lang='en'> <head></head>";
        msEmailHTML += "<body>";

        msEmailHTML += "<p style='color:black;font-family:Arial;font-size:11pt;'>";
        msEmailHTML += "Hello, " + FirstName;
        msEmailHTML += "</p>";
        msEmailHTML += "<p style='color:rgb(21,0,72);font-family:Arial;font-size:11pt;'>";
        msEmailHTML += "Thank you for your Golders uniform order! We'll process your order as quickly as possible. ";
        msEmailHTML += "</p>";
        msEmailHTML += "<p style='color:rgb(21,0,72);font-family:Arial;font-size:11pt;'>";
        msEmailHTML += "To view the status of your order at any time, please ";
        msEmailHTML += "<a href='" + sURL + "' style='color:blue;font-weight:normal;text-decoration:none;'>click here</a>. Note that if ";
        msEmailHTML += "you need to make any changes to your order, you will need to contact Golders ";
        msEmailHTML += "Customer Service at (07) 4622 1611 or send an email to ";
        msEmailHTML += "<a style='font-weight:normal;color:Blue;text-decoration:none;' href='mailto:goldersromaorders@bigpond.net.au'>goldersromaorders@bigpond.net.au</a>.  ";
        msEmailHTML += "Please reference order serial number <b>" + OrderNumber + "</b>.";
        msEmailHTML += "</p>";
        if (sTempPW != "")
        {
            msEmailHTML += "<p style='color:rgb(21,0,72);font-family:Arial;font-size:11pt;'>";
            msEmailHTML += "Following is your temporary password to be used when logging into the website. After "; 
            msEmailHTML += "logging in, you will be prompted to change your temporary password to a more secure password. "; 
            msEmailHTML += "</p>";
            msEmailHTML += "<p style='color:rgb(21,0,72);font-family:Arial;font-size:11pt;'>";
            msEmailHTML += "Temporary Password: <b>" + sTempPW + "</b>";
            msEmailHTML += "</p>";
        }
        msEmailHTML += "<p style='color:rgb(21,0,72);font-family:Arial;font-size:11pt;'>";
        msEmailHTML += "Thanks again for your uniform order! ";
        msEmailHTML += "</p>";
        msEmailHTML += "<p style='color:rgb(21,0,72);;font-family:Arial;font-size:11pt;'>";
        msEmailHTML += "Sincerely, <br/> The Golders Team";
        msEmailHTML += "</p><br>";
        
        //Initialize plain-text email body. 			
        msEmailText = string.Empty;
        msEmailText = " ";

        msEmailText += "Hello, " + FirstName;
        msEmailText += "\n\n";
        msEmailText += "Thank you for your Golders uniform order! We'll process your order as quickly as possible. ";
        msEmailText += "\n\n";
        msEmailText += "Please use the following link to view the status of your order at any time: \n\n ";
        msEmailText += sURL;
        msEmailText += "\n\n";
        msEmailText += "Note that if you need to make any changes to your order, you will need to contact \n";
        msEmailText += "Golders Customer Service at (07) 4622 1611 or send an email to goldersromaorders@bigpond.net.au. \n";
        msEmailText += "Please reference order serial number " + OrderNumber + ". \n\n";
        msEmailText += "Thanks again for your uniform order! \n\n";
        msEmailText += "Sincerely, \n The Golders Team \n\n";

        //Add closing string to HTML email body.
        msEmailHTML += "</body></html>";

        AlternateView htmlView = AlternateView.CreateAlternateViewFromString(msEmailHTML, null, "text/html");
        mail.AlternateViews.Add(htmlView);

        AlternateView plainView = AlternateView.CreateAlternateViewFromString(msEmailText, null, "text/plain");
        mail.AlternateViews.Add(plainView);

        //Attach Photo ID file.
        //mail.Attachments.Add(new Attachment(sUploadFolder + "\\" + sPhotoFileNameFinal));

        //Attach Class Schedule (student only).
        //if (msCardType == "Student")
        //{
        //    mail.Attachments.Add(new Attachment(sUploadFolder + "\\" + sSchedFileNameFinal));
        //}

        SmtpClient smtp = new SmtpClient();

        //smtp.Host = ConfigurationManager.AppSettings["SMTP"];

        smtp.Send(mail);

        //IMPORTANT! You must call the Dispose method to prevent files to release the "lock" on the files.
        mail.Dispose();

        //Delete the file attachments.
        //File.Delete(sUploadFolder + "\\" + sPhotoFileNameFinal);
        //if (msCardType == "Student") {
        //    File.Delete(sUploadFolder + "\\" + sSchedFileNameFinal);
        //}
    }

    //-------------------------------------------------------------------------------------
    // Appends a new line of content to both the HTML and Text versions of the email body.
    //-------------------------------------------------------------------------------------
    protected void BuildEmailLine(string sLabel, string sValue, bool bBoldVal, bool bSkipLine)
    {

        var sStyleLabel = "";
        var sStyleValue = "";
        var sStyleLink = "";
        var sLabelWidth = "120";

        bool bIsLink = false;
        bool bAlert = false;
        bool bSectionTitle = false;
        bool bIsTextBox = false;

        //Initialize style.
        var sStyle = "font-family:Tahoma,Verdana;font-size:10pt;";

        if (sValue == null) sValue = "";

        if (sValue.IndexOf("link:") == 0)
        {
            bIsLink = true;
            sValue = sValue.Substring(5);
        }
        else
            if (sValue.IndexOf("textbox:") == 0)
            {
                bIsTextBox = true;
                sValue = sValue.Substring(8);
            }

        //Label style.
        if (sValue == "Alert")
        {
            bAlert = true;
            sValue = "";
            sStyleLabel = sStyle + "color:red;font-weight:bold;";
        }
        else
            if (sValue == "SectionTitle")
            {
                bSectionTitle = true;
                sValue = "";
                sStyleLabel = sStyle + "color:black;font-weight:bold;width:500px;";
            }
            else
            {
                //sStyleLabel = sStyle + "color:black;font-weight:normal;width:" + sLabelWidth + "px;";
                sStyleLabel = sStyle + "color:black;font-weight:normal;";
            }

        //Style for value.
        sStyleValue = sStyle + "color:blue;font-weight:" + ((bBoldVal) ? "bold" : "normal") + ";";

        //Style for link.
        sStyleLink = sStyle + "color:orange;font-weight:bold;";

        //Initialize HTML string with one or two line breaks.
        //var sHTML = (bSkipLine) ? "<br><br>" : "<br>";

        var sHTML = ""; ;

        if (bIsLink)
        {
            //Append a link element to the HTML string.
            sHTML += "<a style='" + sStyleLink + "' href='" + sValue + "'>" + sLabel + "</a>";
        }
        else
        {
            bool bHasQuesMark = (sLabel.Substring(sLabel.Length - 1, 1) == "?") ? true : false;
            //If the last char in the label is not a questions mark, append a colon to it.
            if (!bAlert && !bSectionTitle && !bHasQuesMark) sLabel += ": ";

            //Append the label element and the value element to the HTML string.
            sHTML += "<label style='" + sStyleLabel + "'>" + sLabel + "</label>";

            if (bIsTextBox)
            {
                sHTML += "<br/>";
                sHTML += "<textarea rows='50' cols='83' style='width:800px;" + sStyleValue + "'>" + sValue + "</textarea><br/>";
            }
            else
            {
                if (sLabel == "Essay: ") sHTML += "<br/><br/>";
                sHTML += "<label style='" + sStyleValue + "'>" + sValue + "</label>";
            }
        }

        //Append new line to the string for the HTML version of the email.
        if (bSkipLine) msEmailHTML += "<br/>";
        msEmailHTML += sHTML + "<br/>";

        //Append new line to the string for the Text version of the email.
        if (bSkipLine) msEmailText += "\n";
        msEmailText += sLabel + "  " + sValue + "\n ";

    }

}
