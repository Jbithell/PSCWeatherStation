var pusher = new Pusher(pusherConnectionCode, {
    cluster: 'eu',
    encrypted: true
});

//Pusher Error handling
pusher.connection.bind( 'error', function( err ) {
    if( err.error.data.code === 4004 ) {
        console.log("Too many clients connected to device") //TODO Handle this
    }
});

//Pusher connection management
pusher.connection.bind('state_change', function(states) {
    // states = {previous: 'oldState', current: 'newState'}
    $('#connectionstatus').text(" | You are " + states.current);
});

//Connect to channel
var channel = pusher.subscribe('PSCWeatherDataLive');

//Initialize some vars
var gauges = [];

//Download chart data from the server - so that earlier data is available.
function pullServerData() {
    $.ajax({
        url: updateurl, success: function (response) {
            if (response.success) {
                if (response.message.closed == true) {
                    //Maintenence closure of weather station - although it can be used for any time of year really
                    loadingdialog.modal('hide');
                    $(".datadisplay").hide();
                    $("#stationcloseddialogue").show();
                    $("#stationclosedmessage").html(response.message.message);
                    return false;
                } else {
                    $("#stationcloseddialogue").hide();

                    timedifference = response["sent-time"] - response.message["timestamp"]; //timedifference gives you a number in seconds (it's server-server relative so should be acurate) of how upto date the data you're getting is
                    if ((timedifference/60) > minutesbeforefail) {
                        //Over 1 hour out of date
                        $(".datadisplay").hide();

                        $("#nodata").html('<h1>Weather Station Offline</h1><p class="text-center">We have not received data from the Weather Station for ' + Math.round(timedifference/3600) + ' hour' + ((timedifference/3600) != 1 ? 's' : '') + '.<br/>It could be offline for maintenance, or there could be a problem with the internet connection to the club.<br/><button type="button" class="btn btn-default"><a href="https://jbithell.freshdesk.com/support/solutions/articles/42000001330-weather-station-offline">Learn more</a></button></p>');
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
                    displayData(response.message);
                    loadingdialog.modal('hide');
                }
            }
            //How to handle new live Readings from this starting point onwards
            channel.bind('PSCWeatherDataLiveNEWReading', function(data) {
                $("#outofdatedata").hide();
                $("#nodata").hide();
                displayData(data.message.reading);
                $(".datadisplay").show();
            });
        }, error: function (jqXHR, exception) {
            //If can't connect to internet/server show a modal explaining that
            nointernetdialog = bootbox.dialog({
                message: '<p class="text-center">Error - could not download data updates - please check your internet connection or try again later<br/><br/><i>If this error persists please contact James Bithell using the details at <a href="https://www.jbithell.com" target="_blank">https://www.jbithell.com</a></i><br/><br/></p>',
                closeButton: false
            });
        },
        cache: false
    });
}

// On boot functions
$( document ).ready(function() {
    loadingdialog = bootbox.dialog({
        size: "small",
        message: '<p class="text-center"><i class="fa fa-spinner fa-5x fa-pulse"></i></p>',
        closeButton: false,
    });
    drawCharts(function () {
        pullServerData(); //When the charts have been drawn, pull the latest data available from server
    });
});