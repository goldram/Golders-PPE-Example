//-------------------------------------------------------------------------------------
//
// Description:	Contains JavaScript specific to Order ThankYou page.
//		  
//-------------------------------------------------------------------------------------

var mbIE = (!window.addEventListener || navigator.appName.indexOf("Internet Explorer") >= 0) ? true : false;

if (mbIE) {
    window.attachEvent("onload",   InitPage);
    //window.attachEvent("onresize", ResetLayout);
} 
else {
    window.addEventListener("load",   InitPage, false);
    //window.addEventListener("resize", ResetLayout, false);
}

var moNewOrder = null;

var moCloak = new Cloaker();
 
//-------------------------------------------------------------------------------------
// Initializes the page, fires immediately after the browser loads and renders page. 
//-------------------------------------------------------------------------------------
function InitPage() {

    SetUserInfo();
    
    AddEvt($("ViewOrder"), "click", OrderNumPopupShow);
    AddEvt($("AuthOrder"), "click", AuthOrder);

}
 
//-------------------------------------------------------------------------------------
// View order. 
//-------------------------------------------------------------------------------------
function ViewOrder() {

    var OrderID = $("OrderNum").value;
    
    if (OrderID != null && OrderID.length > 0)
    {
        if (OrderID.indexOf("-") > 0) OrderID = OrderID.substr(OrderID.indexOf("-")+1);
        //alert("OrderID = " + OrderID);
        window.location.replace("order.aspx?oid=" + OrderID);
    }
}

//-------------------------------------------------------------------------------------
// Hide the main user interface. 
//-------------------------------------------------------------------------------------
function OrderNumPopupHide() {

    //ClearStatusMsg();

    //Hide the cloak.
    moCloak.Hide();

    //Hide the popup.
    $("OrderNumberBox").style.visibility = "hidden";
    $("OrderNumberBox").style.display = "none";
}
    
//-------------------------------------------------------------------------------------
// Show the Order Number popup.
//-------------------------------------------------------------------------------------
function OrderNumPopupShow() {

    //Popup position.
    var oBox = $("ViewOrder").parentNode;
    var iTop  = oBox.offsetTop + 100;
    var iLeft = oBox.offsetLeft + 200;
    
    var oMainBox = $("OrderNumberBox");
                
    //Throw a cloak over all elements on the page.
    moCloak.Show("ContentBox", GetMaxZindex(), "ContentBox");
    moCloak.Lighter();
    
    //SetFieldDefaults(sFirstName, sLastName, sZipCode);
    
    oMainBox.style.zIndex = parseInt(moCloak.GetZindex(), 10) + 1;
    
    //alert("Cloak zindex=" + moCloak.GetZindex() + ", moMainBox zIndex=" + moMainBox.style.zIndex);
    
    //moMainBox.style.left = iLeft + "px";
    //moMainBox.style.top  = iTop + "px";
    oMainBox.style.marginLeft = "auto";
    oMainBox.style.marginRight = "auto";
    oMainBox.style.top = iTop + "px";
    
    //Adjust top position if it extends past the bottom of the page.       
    var iContentHeight = $("ContentBox").offsetTop + $("ContentBox").offsetHeight;
    while ((oMainBox.offsetTop + oMainBox.offsetHeight) > iContentHeight){
        oMainBox.style.top = (oMainBox.offsetTop - 100) + "px";
    }   
    
    oMainBox.style.visibility = "visible";
    oMainBox.style.display = "inline";
    
    //moMainBox.style.width  = $("PopupContent").offsetWidth + "px";
    //moMainBox.style.height = $("PopupContent").offsetHeight + "px";
   
}
 
//-------------------------------------------------------------------------------------
// Authorize Order.
//-------------------------------------------------------------------------------------
function AuthOrder() {

    try {
        InitNewOrder();
    }
    catch(e) {
        //alert("Error: " + e.message);
        alert("Your Golders user account does not permit you to authorize orders.");
    };
}

//-------------------------------------------------------------------------------------
// Displays user interface for authorizing a new order. 
//-------------------------------------------------------------------------------------
function InitNewOrder() {
    
    //New object.
    if (!moNewOrder) moNewOrder = new AuthorizeNewOrder();
    
    //Initialize user interface with data and initial settings.
    var sCompanyID   = ($("UserType").value == "admin") ? "2" : $("UserCompanyID").value;
    var sCompanyName = ($("UserType").value == "admin") ? "Santos Ltd" : $("UserCompanyName").value;
    moNewOrder.InitUI(sCompanyID, sCompanyName);

    //Popup position.
    var oBox = $("AuthOrder").parentNode;
    var iTop  = oBox.offsetTop + 10;
    var iLeft = oBox.offsetLeft + 200;

    //Show user interface.
    moNewOrder.ShowUI(iTop, iLeft);

}

