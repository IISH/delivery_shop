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

// Reserve / Empty knop als cart is empty
// HTTP 404 code aanpassing (Stefan)

var DeliveryProps = (function() {
    var host        = "localhost/delivery";
    var language    = "en";
    var max_items   = 3;
    var search_url  = "http://hdl.handle.net";
    var cart_div    = null;

    return {
        setProperties: function(props) {
            if (!!props)
            {
                if (!!props.host)       host       = props.host;
                if (!!props.language)   language   = props.language;
                if (!!props.max_items)  max_items  = props.max_items;
                if (!!props.search_url) search_url = props.search_url;
                if (!!props.cart_div)   cart_div   = props.cart_div;
            }
        },
        getDeliveryHost: function() {
            return(host);
        },
        getLanguage: function() {
            return(language);
        },
        getMaxItems: function() {
            return(max_items);
        },
        getSearchURL: function() {
            return(search_url);
        },
        getShoppingCartDiv: function() {
            return(cart_div);
        }
    };
}());

var Rsrc = (function() {
    var language  = 'en';
    var str_table = null;
    
    return {
        setLanguage: function(lang) {
            /*
            var url = "resources/js/delivery.locale." + lang + ".js";
            $.getScript(url, function(data, textStatus, jqxhr) {
                if (jqxhr.status === 200)
                {
                    eval(data);
                    str_table = string_table;
                    language  = lang;
                }              
                syslog("Load was performed with "  + textStatus + " " + jqxhr.status);
            });
            */
           switch (lang)
           {
               case 'nl':
                   str_table = string_table_nl;
                   break;
               case 'en':
               default:
                   str_table = string_table_en;
                   break;
           }
        },
        getString: function(key, par)
        {   
            var str;
            
            if (!!str_table)
            {
                str = str_table[key];
                if (!!par) str = str.replace("{0}", par);
                return(str);
            }
            return("TBS");
        }
    }
}());


// Public functions

/**
 * Initialize the Delivery API
 *
 * @param object props     the delivery access properties
 * @return void
 */
function initDelivery(props) 
{
    var html;

    if (!!props) DeliveryProps.setProperties(props);
    syslog("Use delivery host: " + DeliveryProps.getDeliveryHost());
    Rsrc.setLanguage(DeliveryProps.getLanguage());

    if (DeliveryProps.getShoppingCartDiv() !== null)
    {
        simpleCart({
            // array representing the format and columns of the cart
            cartColumns: [
                { attr: "name",   label: Rsrc.getString('cart_title')},
                { attr: "pid",    label: Rsrc.getString('cart_pid')},
                { view: "remove", label: Rsrc.getString('cart_remove'), text: Rsrc.getString('cart_button_remove')}
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

        html  = "<div class=\"simpleCart_items\"></div>";
        html += "<input type=\"submit\" class=\"simpleCart_checkout\" value=\"";
        html += Rsrc.getString('cart_button_reserve');
        html += "\" name=\"Reserve\" onclick=\"javascript:;\" />";
        html += "&nbsp;";
        html += "<input type=\"submit\" class=\"simpleCart_empty\" value=\"";
        html += Rsrc.getString('cart_button_empty');
        html += "\" name=\"Empty\" onclick=\"javascript:;\" />";
        html += "<br />";
        $(DeliveryProps.getShoppingCartDiv()).html(html);
    }
} /* initDelivery */

(function($) {
    $.fn.getDeliveryInfo = function() {
        var html;

        html  = "<i>";
        html += "host=" + DeliveryProps.getDeliveryHost();
        html += " ";
        html += "lang=" + DeliveryProps.getLanguage();
        html += "</i>";
        $(this).html(html);
    } /* getDeliveryInfo */

    $.fn.determineReservationButton = function(label, pid, signature, directflag) {
        var pars = { 
            label:     label, 
            pid:       $.trim(pid), 
            signature: $.trim(signature), 
            direct:    directflag, 
            field:     $(this), 
            result:    button_callback 
        };
        get_json_data("GET", "record/" + encodeURIComponent(pars.pid), pars);
    } /* determineReservationButton */

    $.fn.getRecordInfo = function(pid, signature) {
        var pars = {
            pid:       $.trim(pid),
            signature: $.trim(signature),
            field:     $(this),
            result:    record_callback
        };
        get_json_data("GET", "record/" + encodeURIComponent(pars.pid), pars);
        $(this).html("Request: pid=" + pars.pid + " signature=" + pars.signature);
    } /* getRecordInfo */
})(jQuery);

function requestReservation(label, pid, signature, direct)
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
            if (simpleCart.find({ pid: item }).length === 0)
            {
                if (simpleCart.quantity() >= DeliveryProps.getMaxItems())
                {
                    alert(Rsrc.getString('alert_max', DeliveryProps.getMaxItems()));
                }
                else
                {   
                    label = "<a href=\"" + DeliveryProps.getSearchURL() + "/" + encodeURIComponent(pid) + "\">" + label + "</a>";
                    simpleCart.add({ 
                        name:     label,
                        pid:      item,
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
            pids += item.get('pid');
        });
        show_delivery_page(pids);
        simpleCart.empty();
    }
    else
    {
        alert(Rsrc.getString('alert_noitems'));
    }
} /* sendReservation */

function requestPermission(pid, signature)
{
    var item = pid + ":" + signature;
    
    show_permission_page(item);
} /* requestPermission */

// Local functions

function button_callback(pars, data, holding)
{
    var html;
    
    syslog("button_callback: field=" + pars.field + " data=" + data);
    if (data === null)
    {
        // Holding is not found in Delivery
        data = {
            pid:             pars.pid,
            title:           pars.pid,
            // embargo:         "2013-03-20",
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
                html  = "<input type=\"submit\" class=\"deliveryReserveButton\" value=\"";
                html += Rsrc.getString('button_request');
                html += "\" name=\"RequestItem\" onclick=\"requestReservation('";
                if (pars.label === null)
                {
                    html += data.title;
                }
                else
                {
                    html += pars.label;
                }
                html += "', '";
                html += pars.pid;
                html += "', '";
                html += pars.signature;
                html += "', ";
                html += pars.direct;
                html += ");\" />";
            }
            else
            {
                html  = "<span class=\"deliveryResponseText\">";
                html += Rsrc.getString('stat_open_reserved');
                html += " ";
                html += "<a href=\"mailto:";
                html += Rsrc.getString('email_office');
                html += "\">";
                html += Rsrc.getString('email_office');
                html += "</a>.";
                html += "</span>";
            }
        }
        else
        {
            html  = "<span class=\"deliveryResponseText\">";
            html += Rsrc.getString('stat_open_restricted');
            html += ".</span>";
        }
    }
    else if (data.restrictionType === 'RESTRICTED')
    {
        html  = "<span class=\"deliveryResponseText\">";
        html += Rsrc.getString('stat_restricted');
        html += " ";
        html += " <input type=\"submit\" class=\"deliveryPermissionButton\" value=\"";
        html += Rsrc.getString('button_permission');
        html += "\" name=\"RequestItem\" onclick=\"requestReservation('";
        html += pars.pid;
        html += "', '";
        html += pars.signature;
        html += ");\" />";
        html += "</span>";
    }
    else // CLOSED
    {
        html = "<span class=\"deliveryResponseText\">";
        if (!!data.embargo)
        {
            html += Rsrc.getString('stat_closed_embargo', data.embargo);
        }
        else
        {
            html += Rsrc.getString('stat_closed');
        }
        html += "</span>";
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
        if (!!data.embargo) rec += "embargo=" + data.embargo + "<br />";
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
    url += "/reservation/createform/";
    url += encodeURIComponent(pids);
    url += "?locale=" + DeliveryProps.getLanguage();
    // window.location = url;
    window.open(url);
} /* show_delivery_page */

function show_permission_page(pids)
{
    var url;
    
    url  = "http://" + DeliveryProps.getDeliveryHost();
    url += "/permission/createform/";
    url += encodeURIComponent(pids);
    url += "?locale=" + DeliveryProps.getLanguage();
    // window.location = url;
    window.open(url);
} /* show_permission_page */

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
