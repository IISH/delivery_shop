<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">

<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Test Page</title>
        
        <link rel="stylesheet" media="all" href="resources/css/delivery_shop.css"/>
        
        <script type="text/javascript" charset="utf-8" src="resources/js/jquery-1.5.1.min.js"></script>
		<script type="text/javascript" charset="utf-8" src="resources/js/jquery.jsonp.js"></script>
		<script type="text/javascript" charset="utf-8" src="resources/js/simpleCart.min.js"></script>
		<script type="text/javascript" charset="utf-8" src="resources/js/delivery_shop.js"></script>
		<script type="text/javascript" charset="utf-8">
            $(document).ready(function()
            {
                initDelivery({ 
                    host:      "localhost:8080",
                    language:  "en",
                    email:     "ask@iisg.nl",
                    max_items: 3,
                    cart_div:  "#delivery_cart"
                });
                getDeliveryInfo("#delivery_info");     // For debugging
                
                setButtons();
            });  /* ready */
            
            function setButtons()
            {
                getRecordInfo("10622/03D5FEE7-F079-4A5C-A85E-5D22C251933C", "BG C37/328", "#delivery_test1");   // For debugging
                getRecordInfo("10622/816FC0F9-C941-46E6-86DB-3A66D253D398", "110/61",     "#delivery_test2");   // For debugging
                getRecordInfo("10622/6D8399C0-A2A0-4537-A380-9AE6CF0D05BD", "PM 10546",   "#delivery_test3");   // For debugging                
                
                determineReservationButton("Label1", "10622/03D5FEE7-F079-4A5C-A85E-5D22C251933C", "BG C37/328", false, "#delivery_button1");
                determineReservationButton("Regel2", "10622/816FC0F9-C941-46E6-86DB-3A66D253D398", "110/61",     false, "#delivery_button2");
                determineReservationButton(null,  "10622/6D8399C0-A2A0-4537-A380-9AE6CF0D05BD", "PM 10546",   false, "#delivery_button3");                
            } /* setButtons */
            
            function getHolding()
            {
                getRecordInfo($("#pid").val(), $("#signature").val(), "#delivery_test4");   // For debugging
                
                determineReservationButton($("#pid").val(), $("#signature").val(), false, "#delivery_button4");
            } /* getHolding */
        </script>
    </head>
    <body>
        <h1>The Delivery Shop Tester!</h1>
        <div id="delivery_info"></div>
        <p></p>
        
        <b>Pid: 10622/03D5FEE7-F079-4A5C-A85E-5D22C251933C Signature: BG C37/328</b><br />
        <div id="delivery_test1"></div>
        <div id="delivery_button1"></div>
        <br />
        <b>Pid: 10622/816FC0F9-C941-46E6-86DB-3A66D253D398 Signature: 110/61</b><br />
        <div id="delivery_test2"></div>
        <div id="delivery_button2"></div>
        <br />
        <b>Pid: 10622/6D8399C0-A2A0-4537-A380-9AE6CF0D05BD Signature: PM 10546</b><br />
        <div id="delivery_test3"></div>
        <div id="delivery_button3"></div>
        <br />
        <div>
            &nbsp; Pid <input type="text" name="pid" id="pid" value="" size="80"/>
            &nbsp; Signature <input type="text" name="signature" id="signature" value="" size="50"/>
            &nbsp; <input type="submit" value="Get Holding" name="GetHolding" onclick="getHolding();" />
            <div id="delivery_test4"></div>
            <div id="delivery_button4"></div>
        </div>
        <p></p>
        
        <h2>The Shopping Cart</h2>
        <div id="delivery_cart"></div>
     </body>
</html>
