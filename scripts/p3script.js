/**
 * Created by pnallasamy on 12/3/13.
 */

jQuery.noConflict();
function onBodyLoad() {
    google.load("maps", "3", {callback: init, other_params: "sensor=false"});
}


function init() {
    if (google.loader.ClientLocation != null) {
        latLng = new google.maps.LatLng(google.loader.ClientLocation.latitude, google.loader.ClientLocation.longitude);
        loadAtStart(google.loader.ClientLocation.latitude, google.loader.ClientLocation.longitude, 8);
    } else {
        loadAtStart(42.372698, -71.109658, 13);
    }
}

function toggle(divId) {
    var divObj = document.getElementById(divId);
    if (divObj.innerHTML == "") {
        divObj.innerHTML = document.getElementById(divId + "_hidden").innerHTML;
        document.getElementById(divId + "_hidden").innerHTML = "";
    } else {
        document.getElementById(divId + "_hidden").innerHTML = divObj.innerHTML;
        divObj.innerHTML = "";
    }
}

jQuery(function () {

    //Auto Complete Plugin for geocoding
   // jQuery("#depot").geocomplete();


    jQuery("#accordion").accordion({
        collapsible: true,
        autoHeight: false,
        clearStyle: true
    });
    jQuery("input:button").button();
    jQuery("#dialogProgress").dialog({
        height: 140,
        modal: true,
        autoOpen: false
    });
    jQuery("#progressBar").progressbar({ value: 0 });

//Auto Complete Plugin for geocoding
//    jQuery("#depot").geocomplete();

    jQuery('.myMap').height(jQuery(window).height() - 80.);


/*    jQuery('#print-button').click(function () {
        alert("boo");

        *//* then use the canvas 2D drawing functions to add text, etc. for the result *//*
        window.open('', document.getElementById('#map').toDataURL());
//        var print_window = window.open('', '_blank', '');

        // Get the content we want to put in that window - this line is a little tricky to understand, but it gets the job done
        var contents = jQuery('<div>').html(jQuery('#map').clone()).html();

        // Build the HTML content for that window, including the contents
        var html = '<html><head><link rel="stylesheet" href="../styles/print.css" type="text/css"></head><body>' + contents + '</body></html>';

        // Write to our new window
        print_window.document.open();
        print_window.document.write(html);
        print_window.document.close();

    });*/


});

function addDelivery() {
    var name = jQuery("#name").val();
    var address = jQuery("#addressStr").val();
    var quantity = jQuery("#quantity").val();

    if (name == '' || address == '' || quantity == '') {
        return;
    }

    jQuery("#time").val(Math.ceil(calculateTime(quantity)));
    jQuery ("#orderdetails").append('<table border="1" cellpadding="15">');
    jQuery("#orderdetails").append('<tr><td>' + jQuery("#name").val() + '</td><td>' + jQuery("#addressStr").val() + '</td><td>' + jQuery("#quantity").val() + '</td><td>' + jQuery("#time").val() + '</td></tr></table>');
//    jQuery("#orderdetails").append('<div> <span>'+jQuery("#name").val()+'</span><span>'+jQuery("#addressStr").val()+'</span><span>'+jQuery("#quantity").val()+'</span><span>'+jQuery("#time").val()+'</span></div>');
//    jQuery ("#orderdetails").append('</table>');
    clickedAddAddress();

}

function calculateTime(quantity) {
    var fixedtime = Math.random();
    return  quantity * fixedtime;

}

/*
function geocodeget(){
// Trigger geocoding request.
    jQuery("#Add!").click(function(){
        jQuery("#addressStr").trigger("geocode");
    });
}

*//**/
