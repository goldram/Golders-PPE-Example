  
 
<div id="NewOrderBox" class="DataGroupBox Popup">

    <label class="PopupHdr">Authorize New Order</label>

    <img id="ImageTop" src="img/golders-logo-small.png" alt="Golder Logo" />

    <label class="StatusMsg">loading data, please wait...</label>

    <div class="ActionBar NoFloat">
        <a id="ActionSubmit" href="javascript:moNewOrder.SubmitAuthorizedOrder();">Authorize Order</a>
        <a id="ActionCancel" href="javascript:moNewOrder.HideUI();">Close</a>
    </div>

    <div style="clear:both;"></div>

    <label  id="EmployeeHdr" class="FieldHdr Right">Employee Name:</label>
    <select id="Employee"    class="FieldVal" size="1" runat="server"></select>
    <a id="ActionEditEmployee" href="javascript:moNewOrder.ShowEmployeeUI(0,'general');">new</a>

    <label  id="GenderHdr" class="FieldHdr Right">Gender:</label>
    <input  id="Gender"    class="FieldVal ReadOnly NoBorder" type='text' value="" maxlength='10' tabindex="-1"/>

    <label  id="DeliverToHdr" class="FieldHdr Right">Deliver To:</label>
    <select id="DeliverTo"    class="FieldVal" size="1">
        <option value=""></option>
        <option value="Employee Site">Employee Site</option>
        <option value="Pick Up">Pick Up</option>
        <option value="Other Address">Other Address</option>
    </select>

    <label  id="AuthorizedByHdr" class="FieldHdr Right">Authorized By:</label>
    <select id="AuthorizedBy"    class="FieldVal" size="1" runat="server"></select>

    <label  id="OrderPayMethodHdr" class="FieldHdr Right">Payment Method:</label>
    <select id="OrderPayMethod"    class="FieldVal" size="1">
        <option value=""></option>
        <option value="Purchase Order">Purchase Order</option>
        <option value="Credit Card">Credit Card</option>
    </select>

    <label id="OrderQtyHdr" class="FieldHdr">Quantity Requirements:</label>
    <div id="OrderQtyDataBox" class="DataBox CoolBox"></div>

</div> <!-- End NewOrderBox -->

