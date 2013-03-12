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
var delivery_host  = "localhost";
var delivery_lang  = "en";
var delivery_email = "ask@iisg.nl";
var delivery_cart  = null;
var delivery_max   = 3;

/**
 * Initialize the Delivery API
 *
 * @return void
 */
function initDelivery(host, language)
{
    if (!!host)     delivery_host = host;
    if (!!language) delivery_lang = language;
    syslog("Use delivery host: " + delivery_host);
    
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
        currency: "EUR",
        // set the cart langauge
        language: "english-us"
    });
} /* initDelivery */

function setCartDiv(cartdiv)
{
    var html;
    
    html  = "<div class=\"simpleCart_items\"></div>";
    // html += "<br />" 
    // html += "Quantity: <span class=\"simpleCart_quantity\"></span><br />";
    if (delivery_lang === 'nl')
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
    $(cartdiv).html(html);
    delivery_cart = cartdiv;
} /* setCartDiv */

function deliveryInfo(resultfld)
{
    var html;
    
    html  = "<i>";
    html += "host=" + delivery_host + " ";
    html += "lang=" + delivery_lang;
    html += "</i>";
    $(resultfld).html(html);
} /* deliveryInfo */

function determineReservationButton(pid, signature, directflag, resultfld) 
{
    var pars = { 'pid': pid, 'signature': signature, 'direct': directflag, 'field': resultfld, 'result':  button_callback };
    get_json_data("GET", "delivery/record/" + encodeURIComponent(pid), pars);
} /* determineReservationButton */

function getRecordData(pid, signature, resultfld) 
{
    var pars = { 'pid': pid, 'signature': signature, 'field': resultfld, 'result': record_callback };
    get_json_data("GET", "delivery/record/" + encodeURIComponent(pid), pars);
    $(resultfld).html("Request: pid=" + pid + " signature=" + signature);
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
        if (delivery_cart !== null)
        {
            if (simpleCart.quantity() >= delivery_max)
            {
                if (delivery_lang === 'nl')
                {
                    alert("U kunt maximaal " + delivery_max + " objecten reserveren");
                }
                else
                {
                    alert("Only a reservation of " + delivery_max + " holdings kan be made");
                }
            }
            else
            {
                if (simpleCart.find({ name: item}).length === 0)
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
        // alert("sendReservation " + pids);
        show_delivery_page(pids);
        simpleCart.empty();
    }
    else
    {
        if (delivery_lang === 'nl')
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
    if (data.restrictionType === 'OPEN')
    {
        if (holding.usageRestriction === 'OPEN')
        {
            if (holding.status === 'AVAILABLE')
            {
                html = "<input type=\"submit\" class=\"delivery_reserve_button\" value=\"";
                if (delivery_lang === 'nl')
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
                if (delivery_lang === 'nl')
                {
                    html = "Dit item is op momenteel gereserveerd door iemand anders, neem contact op met de leeskamer ";
                }
                else
                {
                    html = "The item is currently reserved by someone else, please contact reading room ";
                }
                html += "<a href=\"mailto:";
                html += delivery_email;
                html += "\">";
                html += delivery_email;
                html += "</a>";
            }
        }
        else
        {
            if (delivery_lang === 'nl')
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
        if (delivery_lang === 'nl')
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
        if (delivery_lang === 'nl')
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
    rec += "pid=" + data.pid + "<br />";
    rec += "signature=" + holding.signature + "<br />";
    rec += "title=" + data.title + "<br />";
    rec += "restrictionType=" + data.restrictionType + "<br />";
    rec += "usageRestriction=" + holding.usageRestriction + "<br />";
    rec += "status=" + holding.status + "<br />";
    rec += "</i>";
    $(pars.field).html("Response:<br />" + rec);
} /* record_callback */

function show_delivery_page(pids)
{
    var url;
    
    url  = "http://" + delivery_host;
    url += "/delivery/reservation/createform/";
    url += encodeURIComponent(pids);
    if (delivery_lang !== undefined)
    {
        url += "?locale=" + delivery_lang;
    }
    // window.location = url;
    window.open(url);
} /* requestReservation */

function get_json_data(reqtype, url, pars)
{
    if (delivery_host !== null) url = delivery_host + "/" + url;
    syslog("get_json_data: url=" + url + " pars=" + pars);

    jQuery.ajax({
        type:          reqtype,
        url:           "http://" + url,
        dataType:      'jsonp',
        crossDomain:   true,
        cache:         true,
        success:       function(data, stat, xhr) {handle_complete(data, stat, xhr, pars);},
        error:         function(xhr, stat, err) {handle_error(xhr, stat, err, pars);},
        complete:      function(xhr, stat, err) {syslog("Complete " + xhr.status);},
        statusCode: {
            404: function() {syslog("page not found 404");}
            // 404: function(xhr, stat, err) {handle_error(xhr, stat, err, pars)}
        }
    }).fail(function() {syslog("ajax call failed");});
} /* get_json_data */

function handle_complete(data, stat, xhr, pars)
{
    syslog("handle_complete: data=" + data);
    syslog("handle_complete: stat=" + stat);
    syslog("handle_complete: data.errcode=" + data.errorcode);
    
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
    syslog("handle_error: err="  + err);
    syslog("handle_error: stat=" + stat);

    var msg = stat;
    if (err !== "") msg += ": " + err;
    if (xhr.status !== 0) msg += " (" + xhr.status + ")";
    syslog("handle_error: msg=" + msg);
} /* handle_error */

function syslog(msg)
{
    if (!!window.console) window.console.log(msg);
} /* syslog */
