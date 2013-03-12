<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">

<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Test Page</title>
        <script type="text/javascript" charset="utf-8" src="resources/js/jquery-1.9.1.min.js"></script>
		<script type="text/javascript" charset="utf-8" src="resources/js/simpleCart.min.js"></script>
		<script type="text/javascript" charset="utf-8" src="resources/js/delivery_shop.js"></script>
		<script type="text/javascript" charset="utf-8">
            $(document).ready(function()
            {
                initDelivery("localhost:8080", "nl");
                deliveryInfo("#delivery_info");
                setCartDiv("#deliver_cart");
                setButtons();
            });  /* ready */
            
            function setButtons()
            {
                getRecordData("10622/03D5FEE7-F079-4A5C-A85E-5D22C251933C", "BG C37/328", "#delivery_test1");
                getRecordData("10622/816FC0F9-C941-46E6-86DB-3A66D253D398", "110/61",     "#delivery_test2");
                getRecordData("10622/6D8399C0-A2A0-4537-A380-9AE6CF0D05BD", "PM 10546",   "#delivery_test3");                
                
                determineReservationButton("10622/03D5FEE7-F079-4A5C-A85E-5D22C251933C", "BG C37/328", false, "#delivery_button1");
                determineReservationButton("10622/816FC0F9-C941-46E6-86DB-3A66D253D398", "110/61",     false, "#delivery_button2");
                determineReservationButton("10622/6D8399C0-A2A0-4537-A380-9AE6CF0D05BD", "PM 10546",   false, "#delivery_button3");                
            }
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
        <p></p>
        
        <div id="deliver_cart"></div>
        
        <!--
        <div class="simpleCart_shelfItem">
            <h2 class="item_name"> Awesome T-shirt </h2>
            <p>
                <input type="text" value="1" class="item_Quantity"><br>
                <span class="item_price">€35.99</span><br>
                <a class="item_add" href="javascript:;"> Add to Cart </a>
            </p>
        </div>
        items - <span class="simpleCart_total"></span>
        <a href="javascript:;" class="simpleCart_checkout">Reserve</a>
        <a href="javascript:;" class="simpleCart_empty">Empty</a>
        <div class="item-remove "><a href="javascript:;" class="simpleCart_remove">X</a></div>
        <div class="simpleCart_items"></div>
        <br />
        Aantal: <span class="simpleCart_quantity"></span>
        <br />
        <input type="submit" class="simpleCart_checkout" value="Reserve" name="Reserve" onclick="javascript:;" />
        &nbsp;
        <input type="submit" class="simpleCart_empty" value="Empty" name="Empty" onclick="javascript:;" />
        <br />
        -->
        
     </body>
</html>
