// JavaScript Document


/*
 This scirpt has been created as part of CSCIE-15 Course for Assignment P3
 Here we handle functions such as validation, calculation of traveling time,
 Generating random unloading time etc

 Author: Ponnusamy Nallasamy
 */

jQuery.noConflict();

function onBodyLoad() {
    google.load("maps", "3", {callback: init, other_params: "sensor=false"});
}

//if we detect user location pan it in the startup map or use Cambridge, MA as default
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
    onBodyLoad();

//Auto Complete Plugin for geocoding
    // jQuery("#depot").geocomplete(); Tried to make it work, but could not :(

//Accordion Menu
    jQuery("#accordion").accordion({
        collapsible: true,
        autoHeight: false,
        clearStyle: true,
        event: false
    });
    jQuery("input:button").button();
    jQuery("#dialogProgress").dialog({
        height: 140,
        modal: true,
        autoOpen: false
    });
    jQuery("#progressBar").progressbar({ value: 0 });

    // date picker from UI
    jQuery("#date").datepicker();

    // Map window size
    jQuery('.myMap').height(jQuery(window).height() - 80.);

    //Print button to print only the direction
    jQuery('#print-button').click(function () {
        jQuery(function () {
            jQuery("#dialog").prop('title', 'For Your Information!');
            var originalContent;
            jQuery("#dialog").dialog({
                modal: true,
                buttons: {
                    Ok: function () {
                        jQuery(this).dialog("close");
                    }
                },
                open: function (event, ui) {
                    jQuery("#dialog").append('<p> The Print Out Will Contain Total Miles, Time, Order Details, Turn' +
                        'by Turn Navigation Information and NO Map!</p>');
                    originalContent = jQuery("#dialog").html();
                },
                close: function (event, ui) {
                    jQuery("#dialog").html('');
                }
            });

        });
        var print_window = window.open('', '_blank', '');
        // Get the content we want to put in that window - this line is a little tricky to understand, but it gets the job done
        var contentduration = jQuery('<div>').html(jQuery('#path').clone()).html();
        var contents = jQuery('<div>').html(jQuery('#my_textual_div').clone()).html();

        // Build the HTML content for that window, including the contents
        var html = '<html><head><link rel="stylesheet" href="/styles/print.css" type="text/css"></head><body>' + contentduration + contents + '</body></html>';

        // Write to our new window
        print_window.document.open();
        print_window.document.write(html);
        print_window.document.close();
    });

    //Use this function to validate the menus and to take the user in a sequence
    jQuery('#accordion h3').click(function (event) {
        var active = jQuery("#accordion").accordion("option", "active");
        if (active > 5) {
            active = -1;
        }
        var newactive = active + 1;
        if (validate(active)) {
            if (active == 1) {
                addDepot();
            }
            jQuery("#accordion").accordion('activate', newactive);
        } else {
            jQuery(function () {
                jQuery("#dialog").prop('title', 'For Your Information!');
                var originalContent;
                jQuery("#dialog").dialog({
                    modal: true,
                    buttons: {
                        Ok: function () {
                            jQuery(this).dialog("close");
                        }
                    },
                    open: function (event, ui) {
                        jQuery("#dialog").append('<p> You must fill in all the required ' +
                            'information to continue and make sure phone and shift are number!</p>');
                        originalContent = jQuery("#dialog").html();
                    },
                    close: function (event, ui) {
                        jQuery("#dialog").html('');
                    }
                });

            });
        }
        event.stopPropagation();
    });
});


/* copy of addAddress from library to do validation instead
 *	passing in dual callbacks to handle validation since it's an ajax call
 */

function addressCheck(address, successCallback, errorCallback) {
    //make sure all three params are passed in
    if (arguments.length != 3) {
        return;
    }

    //addressProcessing = true;
    new google.maps.Geocoder().geocode({ address: address }, function (results, status) {
        console.log(status);
        if (status == google.maps.GeocoderStatus.OK) {
            if (typeof(successCallback) == 'function')
                successCallback(address);
        } else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
            //call again
            setTimeout(function () {
                addressCheck(address, successCallback, errorCallback)
            }, 100);
        } else {
            if (typeof(errorCallback) == 'function')
                errorCallback(address);
        }
    });
}

/* simple phone number validator
 *	pass in value as String
 *		accepts numbs, '1234567890' or '1-123-456-7890'
 *	returns true/false validation
 */
function phoneCheck(valVar) {
    //check for param, or default to 0. change to a string for match
    var val = ((arguments.length) ? arguments[0] : 0).toString();
    //replace out dashes if they exist, then match against 10 digits
    return (val.replace(/[^0-9]/g, '').match(/^\d{10}/)) ? true : false;
}

/* simple qty validator
 *	assumes qty should be a number and can have a decimal, but should be > 0
 *	returns true/false validation
 */
function qtyCheck(valVar) {
    //check for param, or default to 0. change to a string for match
    var val = ((arguments.length) ? arguments[0] : 0).toString();
    //match against digits and decimal, and make sure it's over 0
    return (val.match(/^[\d.]+$/) && parseInt(val) > 0) ? true : false;
}

/* clear form fields on page of text type
 */
function clearAllTextInputs() {
    jQuery(':input').filter(':text').val('');
}

/* reset page handler, since we need to do several things */
function resetPage() {
    //clear inputs
    clearAllTextInputs();
    //remove appended table data
    jQuery("#orderdetails").empty();
    //and error msgs
    jQuery('.err').hide();
    //call old startOver method
    //reset accordion menu
    jQuery("#accordion").accordion('activate', 0);

    startOver();
}

/* do things with the field validations */
function addDeliveryValidator(onAllValid) {
    var name = jQuery("#name");
    var address = jQuery("#addressStr");
    var quantity = jQuery("#quantity");
    var hasError = false;

    /*assuming name can have any chars and isn't validated other than empty*/
    if (name.val() == '') {
        //show name isn't correct
        jQuery('#nameErr').show();
        hasError = true;
    } else {
        jQuery('#nameErr').hide();
    }

    if (quantity.val() == '') {
        //show name isn't correct
        jQuery('#qtyErr').show();
        hasError = true;
    } else {
        jQuery('#qtyErr').hide();
    }


    if (address.val() == '') {
        //show address isn't correct
        //addressErr doesn't have a msg, so set it first
        jQuery('#addressErr').html('Please enter an Address').show();
    } else {
        //hide old errors
        jQuery('#addressErr').hide();

        //only call if there's no other errors, to save the ajax call
        if (!hasError) {
            var sCall = function () {
                if (!hasError) {
                    onAllValid();
                }
            };
            //call address checker. this needs to handle showing the error msg as well
            //so we'll pass success and error callbacks
            addressCheck(address.val(), sCall, function () {
                jQuery('#addressErr').html('Unable to geocode address.').show();
            });
        }
    }
}
var orderArray = {};
function addDelivery() {
    //call field validators. this calls an address check so it has to handle success, pass in success function
    addDeliveryValidator(function () {

        var name = jQuery("#name");
        var address = jQuery("#addressStr");
        var quantity = jQuery("#quantity");
        var time = jQuery("#time");
        var orderdetails = jQuery("#orderdetails");

        //headers
        if (orderdetails.html() == '') {
            orderdetails.append('<table cellpadding="5" width="85%" cellspacing="0" border="1"><tr><th width="30%">Customer Name</th>' +
                '<th width="40%">Delivery Address</th><th width="15%">Quantity (in Gallons)</th><th width="15%">System Calculated Delivery Time</th></tr></table>');
        }
        time.val(Math.ceil(calculateTime(quantity.val())));
        orderdetails.append('<table cellpadding="7" width="85%" cellspacing="0" border="1"><tr><td width="30%">' + name.val() + '</td>' +
            '<td width="40%">' + address.val() + '</td><td width="15%">' + quantity.val() + '</td><td width="15%">' + time.val() + '</td></tr></table>');

//        Add orders into Array for later reference
//        orderArray.push(name, address, quantity);
        var str = address.val();
        orderArray[address.val()] = {
            "name": name.val(),
            "address": address.val(),
            "quantity": quantity.val()
        };
        clickedAddAddress();
    });

}
//Math function to calculate random number
function calculateTime(quantity) {
    var fixedtime = Math.random();
    return  quantity * fixedtime;

}
//Get the starting and additional depot routes
function addDepot() {
    jQuery("#addressStr").val(jQuery("#saddressStr").val());
    if (address == '') {
        return;
    }
    jQuery(function () {
        jQuery("#dialog").prop('title', 'Please Note');
        var originalContent;
        jQuery("#dialog").dialog({
            modal: true,
            buttons: {
                Ok: function () {
                    jQuery(this).dialog("close");
                }
            },
            open: function (event, ui) {
                jQuery("#dialog").append('<p>' + ' Your Starting Address is - ' + jQuery("#addressStr").val() + '</p>');
                originalContent = jQuery("#dialog").html();
            },
            close: function (event, ui) {
                jQuery("#dialog").html('');
            }
        });

        clickedAddAddress();
    });
}

//Validate the input fields in active accordion form
function validate(active) {
    var elemArr = [];

    if (active == 1) {
        elemArr.push(jQuery("#date"));
        elemArr.push(jQuery("#routenumber"));
        elemArr.push(jQuery("#trklicense"));

        return checkForNotBlank(elemArr);
    }
    else if (active == 2) {
        elemArr.push(jQuery("#employeeid"));
        elemArr.push(jQuery("#dname"));
        elemArr.push(jQuery("#dlname"));
        elemArr.push(jQuery("#cellno"));

        return checkForNotBlank(elemArr);
    }
    else if (active == 3) {
        elemArr.push(jQuery("#shift"));

        return checkForNotBlank(elemArr);
    }
    else if (active == 4) {
        elemArr.push(jQuery("#name"));
        elemArr.push(jQuery("#adressstr"));
        elemArr.push(jQuery("#quantity"));

        return checkForNotBlank(elemArr);
    }
    return(true);
}

function checkForNotBlank(arr) {
    var err = false;
    jQuery(arr).each(function (i, e) {
        if (jQuery(e).val() == '') {
            err = true;
        }
    });
    return !err;
}