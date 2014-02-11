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

public partial class admin_user_delete : System.Web.UI.Page
{
    
    string Username; 
    
    protected void Page_Load(object sender, EventArgs e)
    {

        Username = Convert.ToString(Context.Request.Params["un"]); 
        
        DeleteUser(Username);   

    }

    private void DeleteUser(string username)
    {
        //Membership.DeleteUser(username, false); // DC: My apps will NEVER delete the related data.
        Membership.DeleteUser(username, true); // DC: except during testing, of course!
        //Response.Redirect("users.aspx");
    }
}
