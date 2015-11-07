/* ----- 
Author: @coto
*/

var source_api = "";


Number.prototype.formatMoney = function(c, d, t){
var n = this, 
    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "." : d, 
    t = t == undefined ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };

var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function getDate(timestamp){
    var date = new Date(timestamp*1000);
    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();

    var day = "0" + date.getDate();


    // Will display time in 10:30:23 format
    var formattedTime = days[date.getDay()] + " " + day.substr(-2) +"-"+ months[date.getMonth()] +"-"+ date.getFullYear() + " " + hours + ':' + minutes.substr(-2) + " GMT-" + date.getTimezoneOffset()/60 ;
    return formattedTime;
 }

Array.prototype.first = function () {
    return this[0];
};

function RenderData(data) {
    // Discrecionales
    var items = [];
    //console.log(data);

    for (var x of data.discrecionales) {
        //console.log(x)
        class_value = (x[3] < 0) ? "negative": "";
        class_main = (x == data.discrecionales.first()) ? "main": "";
        items.push("<tr class='"+ class_main +"''><td>" + x[0] + "</td><td class='text-right " + class_value + "'>$ " + x[3].formatMoney(0, '.', ',') + "</td></tr>");
    }
    $("#content_discrecionales tbody").html(items.join("")).parent().after("<p class='updated'>"+getDate(data.discrecionales[1][4])+"</p>");

    // Fijos
    var items = [];
    for (var x of data.fijos) {
        //console.log(x)
        class_value = (x[3] < 0) ? "negative": "";
        class_main = (x == data.fijos.first()) ? "main": "";
        items.push("<tr class='"+ class_main +"''><td>" + x[0] + "</td><td class='text-right " + class_value + "'>$ " + x[3].formatMoney(0, '.', ',') + "</td></tr>");
    }
    $("#content_fijos tbody").html(items.join("")).parent().after("<p class='updated'>"+getDate(data.fijos[1][4])+"</p>");

    // Saving
    var items = [];
    for (var x of data.saving) {
        //console.log(x)
        class_value = (x[3] < 0) ? "negative": "";
        class_main = (x == data.saving.first()) ? "main": "";
        items.push("<tr class='"+ class_main +"''><td>" + x[0] + "</td><td class='text-right " + class_value + "'>$ " + x[3].formatMoney(0, '.', ',') + "</td></tr>");
    }
    $("#content_saving tbody").html(items.join("")).parent().after("<p class='updated'>"+getDate(data.saving.first()[4])+"</p>");

    // Indicadores
    var items = [];
    for (var x of data.indicadores) {
        //console.log(x)
        items.push("<td>" + x[0] + ": $" + x[3].formatMoney(0, '.', ',') + "</td>");
    }
    $("#content_indicadores").html(items.join(""));

}


function fetch_calexpense(options) {
    var options = options || null;
    var timestamp = (new Date()).getTime() / 1000;
    var minutes_in_cache = 10;


    if (!(localStorage.timestamp) && isNaN(localStorage.timestamp)) {
        localStorage.timestamp = 0;
    }

    if (!(localStorage.cached) || (parseInt(timestamp) - parseInt(localStorage.timestamp)) > minutes_in_cache * 60 || options == 'force') {

        $("#panel-loading").show();
        $("#panel-primary").hide();
        try {
            console.log((parseInt(timestamp) - parseInt(localStorage.timestamp)) / 60 + " minutes cached. Fetched again..");
            
            //var jqxhr = $.getJSON("http://localhost:8080/api/summary?token=onm1ohi&type=rest&callback=?", function(data) {});
            var jqxhr = $.getJSON(source_api, function(data) {});
            jqxhr.done(function(data) {
            	console.log("done");
                
                RenderData(data);
                

               	localStorage.cached = JSON.stringify(data);
            	localStorage.timestamp = timestamp;
            });
            jqxhr.fail(function(xhr) {
                console.log("fail");
                $("#panel-loading").hide();
                $("#panel-primary").show();
                $(".alert").show();
                $("#error").text("Error "+ xhr.status + " getting info");

                if (localStorage.cached) {
                	RenderData(JSON.parse(localStorage.cached));
                }
            });
            jqxhr.always(function() {
                console.log("always");
            });
            jqxhr.complete(function() {
                console.log("complete");
                $("#panel-loading").hide();
                $("#panel-primary").show();
            });

        } catch (err) {
            $("#panel-loading").hide();
            $("#panel-primary").show();
            $(".alert").show();
            $("#error").text("Error getting info.");
            RenderData(JSON.parse(localStorage.cached));
        }
    } else {
        $("#panel-loading").hide();
        $("#panel-primary").show();
        RenderData(JSON.parse(localStorage.cached));
        console.log((parseInt(timestamp) - parseInt(localStorage.timestamp)) / 60 + " minutes cached.")
    }
}

$(document).ready(function() {
    fetch_calexpense();
    $(".action-refresh").click(function() {
        fetch_calexpense('force');
    });
});