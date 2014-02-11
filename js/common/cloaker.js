//-------------------------------------------------------------------------------------
// Description: Contains JavaScript specific to creating a "cloak" over all objects 
// behind a target object, typically and iframe or div container. Cloaking is typically 
// used to simulate a "modal" presentation of any UI/dialog.
//-------------------------------------------------------------------------------------

function Cloaker() {

    //this.zIndex = 95000;
    
     var mbIE = (!window.addEventListener || navigator.appName.indexOf("Internet Explorer") >= 0) ? true : false;

    var moCloakTarget = null;	//This points to the container to be cloaked.
    var moCloak = null;			//Points to the cloaking object. 
    
    var msBackgroundColor = "rgb(140,140,140)";

    //-------------------------------------------------------------------------------------
    // Returns boolean to indicate whether or not cloak is visible. 
    //-------------------------------------------------------------------------------------
    this.CloakIsVisible = function() {

	    return (moCloak.style.visibility == "visible") ? true : false;
    }

    //-------------------------------------------------------------------------------------
    // Returns the cloak's zIndex value. 
    //-------------------------------------------------------------------------------------
    this.GetZindex = function() {

	    return moCloak.style.zIndex;
    }

    //-------------------------------------------------------------------------------------
    // Hides cloak (used to prevent incidental clicks on objects/elements).
    //-------------------------------------------------------------------------------------
    this.Hide = function() {

        try {
		    moCloak.style.visibility = "hidden";
		    moCloak.style.display = "none";  
		    moCloak.style.width = "1px";
        }
        catch(e) {
            //Do nothing
        }
    }

    //-------------------------------------------------------------------------------------
    // Sets the opacity of the cloak to a lighter transparency.
    //-------------------------------------------------------------------------------------
    this.Lighter = function() {
    
        moCloak.style.filter	= "progid:DXImageTransform.Microsoft.Alpha(opacity=40,style=0)";
        moCloak.style.opacity	= "0.4";
    }

    //-------------------------------------------------------------------------------------
    // Sets the opacity of the cloak to a darker transparency.
    //-------------------------------------------------------------------------------------
    this.Darker = function() {
    
        moCloak.style.filter  = "progid:DXImageTransform.Microsoft.Alpha(opacity=90,style=0)";
        moCloak.style.opacity = "0.9";
    }

    //-------------------------------------------------------------------------------------
    // Sets the opacity of the cloak to the darkest transparency and background color.
    //-------------------------------------------------------------------------------------
    this.Darkest = function() {
    
		moCloak.style.background = "rgb(20,20,20)";
        moCloak.style.filter	 = "progid:DXImageTransform.Microsoft.Alpha(opacity=95,style=0)";
        moCloak.style.opacity	 = "0.95";
    }

    //-------------------------------------------------------------------------------------
    // Covers ("cloaks") target area to prevent incidental clicks on objects/elements.
    //-------------------------------------------------------------------------------------
    this.Show = function(sCloakTarget, zIndex, sHeightTarget) {
        
        //moCloakTarget = window.frameElement.document.getElementById(sCloakTarget);
        //moCloakTarget = parent.window.document.getElementById(sCloakTarget);
        moCloakTarget = $(sCloakTarget);

        var iTop = moCloakTarget.offsetTop;
        
        if (sHeightTarget) {
            oHeightTarget = parent.window.document.getElementById(sHeightTarget);
            var iCloakHeight = oHeightTarget.offsetTop + oHeightTarget.offsetHeight;
        }
        else {
            var iCloakHeight = moCloakTarget.scrollHeight;
        } 
        
        
        //If not already present, create the cloaking object/element.
        if (!moCloak) 
        {
            for (var i=1; i<=100; i++) 
            {
                var sCloakID = "Cloak" + i;
                if ($(sCloakID) == null) break;
            }    
                
            oCloak = document.createElement("DIV");
            oCloak.id = sCloakID;
		    oCloak.style.position	= "absolute";
            oCloak.style.zIndex		= zIndex;
		    oCloak.style.background	= "rgb(140,140,140)";
		    oCloak.style.filter		= "progid:DXImageTransform.Microsoft.Alpha(opacity=90,style=0)";
		    oCloak.style.opacity	= "0.9";
		    oCloak.style.visibility	= "hidden";
    		
            oCloak.style.left		= "0px"; //moCloakTarget.offsetLeft + "px";
            oCloak.style.top		= iTop + "px";
            oCloak.style.width		= moCloakTarget.offsetWidth + "px";
            oCloak.style.height		= iCloakHeight + "px";

            try 
		    {
		        //IE
			    moCloakTarget.insertAdjacentElement("beforeEnd",oCloak);
			    moCloak = moCloakTarget.children(sCloakID);
		    }
		    catch(e)
		    {
			    //FireFox
			    moCloakTarget.appendChild(oCloak);
			    moCloak = oCloak;
		    }
        
	    }

        moCloak.style.zIndex = zIndex;

        moCloak.style.left	 = moCloakTarget.offsetLeft + "px";
        moCloak.style.left	 = "0px";
        moCloak.style.top	 = iTop + "px";
        moCloak.style.width	 = moCloakTarget.offsetWidth + "px";
        moCloak.style.height = iCloakHeight + "px";
        
        //Show cloak.    
        moCloak.style.visibility = "visible";  
        moCloak.style.display = "inline";  
       
        //Return object to caller.
        //return moCloak;  

    }
    
}