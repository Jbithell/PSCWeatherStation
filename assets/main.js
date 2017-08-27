
var minutesbeforewarn = 10; //How many minutes out of the data be before a warning is shown
var minutesbeforefail = 120; //How many minutes out of date should the data be before not showing it at all
var pollforupdatesseconds = 30; //How often (in seconds) to check for an update on the server

//Initialize some vars
var loadingdialog, nointernetdialog, closeddialog;
var nointernetdialogshown = false;
var gauges = [];
var updateurl = 'https://www.jbithell.com/projects/psc/weatherapi/live.php';


function findBootstrapEnvironment() {
    //from https://stackoverflow.com/a/15150381/3088158
    var envs = ['xs', 'sm', 'md', 'lg'];

    var $el = $('<div>');
    $el.appendTo($('body'));

    for (var i = envs.length - 1; i >= 0; i--) {
        var env = envs[i];

        $el.addClass('hidden-'+env);
        if ($el.is(':hidden')) {
            $el.remove();
            return env;
        }
    }
}
function sizeCharts() {
    var environemntSize = findBootstrapEnvironment();
    if (environemntSize == "lg" || environemntSize == "md") {
        var dimensions = (($('#maindisplayrow').width()))/6;
    } else if (environemntSize == "sm") {
        var dimensions = (($('#maindisplayrow').width()))/3;
    } else {
        var dimensions = (($('#maindisplayrow').width()));
    }

    console.log(dimensions);
    $('canvas[data-type="radial-gauge"]').attr('data-width', dimensions);
    $('canvas[data-type="radial-gauge"]').attr('data-height', dimensions);
}
function drawCharts(callback) {
    console.log("Drawing Charts");

    //Use this space to make any JS adjustments to display of charts

    gauges["winddirectiongauge"] = document.gauges.get('winddirectiongauge');
    gauges["windgauge"] = document.gauges.get('windgauge');
    gauges["windaveragegauge"] = document.gauges.get('windaveragegauge');
    gauges["windgustgauge"] = document.gauges.get('windgustgauge');
    gauges["humiditygauge"] = document.gauges.get('humiditygauge');
    gauges["tempgauge"] = document.gauges.get('tempgauge');

    console.log("Charts Drawn");
    if( typeof callback == "function" ) {
        callback();
    } else {
        return true;
    }
}
//Download chart data
function updatedata() {
    $("#updatestatus").addClass("fa-spin");
    $.ajax({
        url: updateurl, success: function (response) {
            if (response.success) {
                if (response.message.closed == true) {
                    //Winter closure of weather station - although it can be used for any time of year really
                    console.log("Closed");
                    $("#loading").hide();
                    loadingdialog.modal('hide');
                    //Remove no-internet modal if it's there
                    if (nointernetdialogshown) {
                        nointernetdialog.modal('hide');
                    }
                    $(".datadisplay").hide();
                    $("#stationcloseddialogue").show();
                    $("#stationclosedmessage").html(response.message.message);

                    return false;
                } else {
                    $("#stationcloseddialogue").hide();
                }

                timedifference = response["sent-time"] - response.message["timestamp"]; //timedifference gives you a number in seconds (it's server-server relative so should be acurate) of how upto date the data you're getting is
                if ((timedifference/60) > minutesbeforefail) {
                    //Over 1 hour out of date
                    $(".datadisplay").hide();
                    $("#nodata").html('<strong>Error</strong> We have not received data from the Weather Station for ' + Math.round(timedifference/3600) + ' hour' + ((timedifference/3600) != 1 ? 's' : ''));
                    $("#nodata").fadeIn();
                } else if ((timedifference/60) > minutesbeforewarn) {
                    //5 minutes or more (upto 1 hour) out of date
                    $("#outofdatedata").html('<strong>Warning</strong> Data is ' + Math.round(timedifference/60) + ' minute' + ((timedifference/60) != 1 ? 's' : '') + ' out of date');
                    $("#outofdatedata").fadeIn();
                    $(".datadisplay").show();
                } else {
                    $("#outofdatedata").fadeOut();
                    $(".datadisplay").show();
                }


                console.log("Setting values");
                gauges["winddirectiongauge"].value = response.message['windDirection'];
                gauges["windgauge"].value = response.message['windSpeedMPH'];
                gauges["windaveragegauge"].value = response.message['windSpeed10MinAverageMPH'];
                gauges["windgustgauge"].value = response.message['windSpeed10MinGustMPH'];
                gauges["tempgauge"].value = response.message['temperatureC'];
                gauges["humiditygauge"].value = response.message['humidity'];
                console.log("Values set");

                //Update page HTML as required
                $("#lastupdate").html("Last updated " + response.message["niceFormatTime"] + ' <i id="updatestatus" class="fa fa-refresh fa-fw"></i>');
                $("#compassimage").attr("src", "assets/img/compass/" + (Math.round(response.message["windDirection"] / 10) * 10) + ".png");
                $(window).trigger('resize'); //To refresh the display handling
                $("#loading").hide();
                loadingdialog.modal('hide');
                //Remove no-internet modal if it's there
                if (nointernetdialogshown) {
                    nointernetdialog.modal('hide');
                }
            }

        }, error: function (jqXHR, exception) {
            console.log("Couldn't get weather data");
            //If can't connect to internet/server show a modal (unless it's already showing)
            if (nointernetdialogshown == false) {
                nointernetdialog = bootbox.dialog({
                    message: '<p class="text-center">Error - could not download data updates - please check your internet connection or try again later<br/><br/><i>If this error persists please contact James Bithell using the details at <a href="https://www.jbithell.com" target="_blank">https://www.jbithell.com</a></i><br/><br/></p>',
                    closeButton: false
                });
                nointernetdialogshown = true;
            }

        },
        cache: false
    });
}

//Loading box
$( document ).ready(function() {
    loadingdialog = bootbox.dialog({
        size: "small",
        message: '<p class="text-center"><i class="fa fa-spinner fa-5x fa-pulse"></i></p>',
        closeButton: false,
    });
    sizeCharts();
    drawCharts(function () {
        updatedata();
        setInterval(function () {
            updatedata();
        }, 1000*pollforupdatesseconds);
    });
});
$( window ).resize(function() {
    sizeCharts();
});