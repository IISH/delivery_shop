/*
 * Copyright 2013 International Institute of Social History
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

// Todo Stylesheet
// protype for jquery
// Taal code in aparte js
// in cart allen label en remove zichtbaar

var DeliveryProps = (function() {
    var host        = "localhost";
    var language    = "en";
    var email       = "ask@iisg.nl";
    var max_items   = 3;
    var cart_div    = null;
    
    var set_cartdiv = function(div) {
        var html;
    
        html  = "<div class=\"simpleCart_items\"></div>";
        // html += "<br />" 
        // html += "Quantity: <span class=\"simpleCart_quantity\"></span><br />";
        if (language === 'nl')
        {
            html += "<input type=\"submit\" class=\"simpleCart_checkout\" value=\"Reserveer\" name=\"Reserve\" onclick=\"javascript:;\" />";
            html += "&nbsp;";
            html += "<input type=\"submit\" class=\"simpleCart_empty\" value=\"Leeg\" name=\"Empty\" onclick=\"javascript:;\" />";
        }
        else
        {
            html += "<input type=\"submit\" class=\"simpleCart_checkout\" value=\"Reserve\" name=\"Reserve\" onclick=\"javascript:;\" />";
            html += "&nbsp;";
            html += "<input type=\"submit\" class=\"simpleCart_empty\" value=\"Empty\" name=\"Empty\" onclick=\"javascript:;\" />";
        }
        html += "<br />";
        $(div).html(html);
        cart_div = div;
    }; /* set_cartdiv */

    return {
        setProperties: function(props) {
            if (!!props)
            {
                if (!!props.host)      host      = props.host;
                if (!!props.language)  language  = props.language;
                if (!!props.email)     email     = props.email;
                if (!!props.max_items) max_items = props.max_items;
                if (!!props.cart_div)  set_cartdiv(props.cart_div);
            }
        },
        getDeliveryHost: function() {
            return(host);
        },
        getLanguage: function() {
            return(language);
        },
        getOfficeEmail: function() {
            return(email);
        },
        getMaxItems: function() {
            return(max_items);
        },
        getShoppingCartDiv: function() {
            return(cart_div);
        }
    };
}());

/**
 * Initialize the Delivery API
 *
 * @param object props     the delivery access properties
 * @return void
 */
function initDelivery(props)
{
    jQuery.support.cors = true;
    
    if (!!props) DeliveryProps.setProperties(props);
    syslog("Use delivery host: " + DeliveryProps.getDeliveryHost());
    
    simpleCart({
        // array representing the format and columns of the cart
        cartColumns: [
            { attr: "name",      label: "Pid/Signature"},
            // { attr: "quantity",  label: false},
            { view: "remove",    label: "Remove"}
        ],
        // "div" or "table"
        cartStyle: "div", 
        // how simpleCart should checkout
        checkout: { 
            type: "SendForm", 
            url:  "javascript:sendReservation();" 
        },
        currency: "EUR"
    });
} /* initDelivery */

function deliveryInfo(resultfld)
{
    var html;
    
    html  = "<i>";
    html += "host=" + DeliveryProps.getDeliveryHost();
    html += " ";
    html += "lang=" + DeliveryProps.getLanguage();
    html += "</i>";
    $(resultfld).html(html);
} /* deliveryInfo */

function determineReservationButton(pid, signature, directflag, resultfld) 
{
    var pars = { pid: $.trim(pid), signature: $.trim(signature), direct: directflag, field: resultfld, result:  button_callback };
    get_json_data("GET", "delivery/record/" + encodeURIComponent(pars.pid), pars);
} /* determineReservationButton */

function getRecordData(pid, signature, resultfld) 
{
    var pars = { pid: $.trim(pid), signature: $.trim(signature), field: resultfld, result: record_callback };
    get_json_data("GET", "delivery/record/" + encodeURIComponent(pars.pid), pars);
    $(resultfld).html("Request: pid=" + pars.pid + " signature=" + pars.signature);
} /* getRecordData */

function requestReservation(pid, signature, direct)
{
    var item = pid + ":" + signature;
    
    if (direct === true)
    {
        show_delivery_page(item);
    }
    else
    {
        if (DeliveryProps.getShoppingCartDiv() !== null)
        {
            if (simpleCart.find({ name: item }).length === 0)
            {
                if (simpleCart.quantity() >= DeliveryProps.getMaxItems())
                {
                    if (DeliveryProps.getLanguage() === 'nl')
                    {
                        alert("U kunt maximaal " + DeliveryProps.getMaxItems() + " objecten reserveren");
                    }
                    else
                    {
                        alert("Only a reservation of " + DeliveryProps.getMaxItems() + " holdings kan be made");
                    }
                }
                else
                {
                    simpleCart.add({ 
                        name:     item,
                        quantity: 1
                    });
                }
            }
        }
        else
        {
            show_delivery_page(item);
        }
    }
} /* requestReservation */

function sendReservation()
{
    var pids = "";

    if (simpleCart.quantity() > 0)
    {
        simpleCart.each(function(item, x) {
            if (pids.length > 0) pids += ",";
            pids += item.get('name');
        });
        show_delivery_page(pids);
        simpleCart.empty();
    }
    else
    {
        if (DeliveryProps.getLanguage() === 'nl')
        {
            alert("Geen objecten geselecteerd om te reserveren");
        }
        else
        {
            alert("No holdings selected for reservation");
        }
    }
} /* sendReservation */

// Local functions

function button_callback(pars, data, holding)
{
    var html;
    
    syslog("button_callback: field=" + pars.field);
    if (data === null)
    {
        // Holding is not found in Delivery
        data = {
            pid:             pars.pid,
            title:           "",
            restrictionType: 'OPEN',
            holdings: [
                {
                    signature:        pars.signature,
                    status:           'AVAILABLE',
                    usageRestriction: 'OPEN'
                }  
            ]
        }
        holding = data.holdings[0];
    }
    if (data.restrictionType === 'OPEN')
    {
        if (holding.usageRestriction === 'OPEN')
        {
            if (holding.status === 'AVAILABLE')
            {
                html = "<input type=\"submit\" class=\"delivery_reserve_button\" value=\"";
                if (DeliveryProps.getLanguage() === 'nl')
                {
                    html += "Reserveer Item";
                }
                else
                {
                    html += "Request Item";
                }
                html += "\" name=\"RequestItem\" onclick=\"requestReservation('";
                html += pars.pid;
                html += "', '";
                html += pars.signature;
                html += "', ";
                html += pars.direct;
                html += ");\" />";
            }
            else
            {
                if (DeliveryProps.getLanguage() === 'nl')
                {
                    html = "Dit item is op momenteel gereserveerd door iemand anders, neem contact op met de leeskamer ";
                }
                else
                {
                    html = "The item is currently reserved by someone else, please contact reading room ";
                }
                html += "<a href=\"mailto:";
                html += DeliveryProps.getOfficeEmail();
                html += "\">";
                html += DeliveryProps.getOfficeEmail();
                html += "</a>";
            }
        }
        else
        {
            if (DeliveryProps.getLanguage() === 'nl')
            {
                html = "U kunt dit item niet reserveren i.v.m. beperkingen op dit archief";
            }
            else
            {
                html = "You cannot reserve this item because of restrictions on the archive";
            }
        }
    }
    else if (data.restrictionType === 'RESTRICTED')
    {
        if (DeliveryProps.getLanguage() === 'nl')
        {
            html = "Item is restricted";
        }
        else
        {
            html = "Item is restricted";
        }
    }
    else // CLOSED
    {
        if (DeliveryProps.getLanguage() === 'nl')
        {
            html = "U kunt dit item niet reserveren i.v.m. beperkingen op dit archief";
        }
        else
        {
            html = "You cannot reserve this item because of restrictions on the archive";
        }
    }
    $(pars.field).html(html);
} /* button_callback */

function record_callback(pars, data, holding)
{
    var rec;
    
    syslog("record_callback: field=" + pars.field);
    rec  = "<i>";
    if (data === null)
    {
        rec += "pid=" + pars.pid + "<br />";
        rec += "signature=" + pars.signature + "<br />";
        rec += "status=NOT_FOUND<br />";
    }
    else
    {
        rec += "pid=" + data.pid + "<br />";
        rec += "signature=" + holding.signature + "<br />";
        rec += "title=" + data.title + "<br />";
        rec += "restrictionType=" + data.restrictionType + "<br />";
        rec += "usageRestriction=" + holding.usageRestriction + "<br />";
        rec += "status=" + holding.status + "<br />";        
    }
    rec += "</i>";
    $(pars.field).html("Response:<br />" + rec);
} /* record_callback */

function show_delivery_page(pids)
{
    var url;
    
    url  = "http://" + DeliveryProps.getDeliveryHost();
    url += "/delivery/reservation/createform/";
    url += encodeURIComponent(pids);
    url += "?locale=" + DeliveryProps.getLanguage();
    // window.location = url;
    window.open(url);
} /* show_delivery_page */

function get_json_data(reqtype, url, pars)
{
    url = DeliveryProps.getDeliveryHost() + "/" + url;
    syslog("get_json_data: url=" + url + " pars=" + pars);

    if ($.jsonp === undefined)
    {
        $.ajax({
            type:        reqtype,
            url:         "http://" + url,
            dataType:    'jsonp',
            crossDomain: true,
            cache:       true,
            timeout:     10000,
            success:     function(data, stat, xhr) {handle_complete(data, stat, xhr, pars);},
            error:       function(xhr, stat, err) {handle_error(xhr, stat, err, pars);},
            // complete:      function(xhr, stat) {syslog("Complete " + xhr.status);},
            statusCode: {
                404: function(xhr, stat, err) {handle_error(xhr, stat, err, pars)}
            }
        });
    }
    else
    {
        $.jsonp({
            type:              reqtype,
            url:               "http://" + url,
            callbackParameter: "callback",
            cache:             true,
            timeout:           10000,
            success:           function(data, stat, xhr) {handle_complete(data, stat, xhr, pars);},
            error:             function(xhr, stat, err)  {handle_error(xhr, stat, err, pars);}
            // complete:          function(xhr, stat) {syslog("Complete " + xhr + " stat=" + stat);},
        });    
    }
} /* get_json_data */

function handle_complete(data, stat, xhr, pars)
{
    // syslog("handle_complete: data=" + data);
    syslog("handle_complete: stat=" + stat);    
    syslog("handle_complete: pid=" + data[0].pid);
    for(var hld in data[0].holdings)
    {
        if (pars.pid === data[0].pid && pars.signature === data[0].holdings[hld].signature)
        {
            pars.result(pars, data[0], data[0].holdings[hld]);
        }
    }
} /* handle_complete */

function handle_error(xhr, stat, err, pars)
{
    // syslog("handle_error: err="  + err);
    syslog("handle_error: stat=" + stat);
    var msg = stat;
    if (err !== "") msg += ": " + err;
    if (xhr.status !== 0) msg += " (" + xhr.status + ")";
    syslog("handle_error: msg=" + msg);    
    syslog("handle_error: pid=" + pars.pid);
    pars.result(pars, null, null);
} /* handle_error */

function syslog(msg)
{
    if (!!window.console) window.console.log(msg);
} /* syslog */
