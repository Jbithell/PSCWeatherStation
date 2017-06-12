
var minutesbeforewarn = 10; //How many minutes out of the data be before a warning is shown
var minutesbeforefail = 120; //How many minutes out of date should the data be before not showing it at all
var pollforupdatesseconds = 30; //How often (in seconds) to check for an update on the server

//Initialize some vars
var loadingdialog, nointernetdialog;
var nointernetdialogshown = false;

//Loading box
$( document ).ready(function() {
    loadingdialog = bootbox.dialog({
        message: '<p class="text-center"><i class="fa fa-spinner fa-5x fa-pulse"></i><br/><br/><i>Loading...</i></p>',
        closeButton: false
    });
});

//Load charts
google.charts.load('current', {'packages': ['gauge']});
google.charts.setOnLoadCallback(drawChart);
function drawChart() {
    //Set chart configs
    chartwidth = $("#compassimage").width();
    chartheight = $("#compassimage").height();
    var windgaugechartdata = google.visualization.arrayToDataTable([['Label', 'Value'], ['Wind Speed (MPH)', 0]]);
    var windgaugechartoptions = {
        redFrom: 30,
        redTo: 100,
        yellowFrom: 20,
        yellowTo: 30,
        greenFrom: 10,
        greenTo: 20,
        min: 0,
        max: 100,
        minorTicks: 5,
        majorTicks: 10,
        width: chartwidth,
        height: chartheight
    };

    var windgaugechart = new google.visualization.Gauge(document.getElementById('windgauge'));
    windgaugechart.draw(windgaugechartdata, windgaugechartoptions);


    var tempgaugechartdata = google.visualization.arrayToDataTable([['Label', 'Value'], ['°C', 0]]);
    var tempgaugechartoptions = {
        redFrom: 30,
        redTo: 40,
        yellowFrom: -20,
        yellowTo: 00,
        min: -20,
        max: 40,
        minorTicks: 5,
        majorTicks: 10,
        width: chartwidth,
        height: chartheight
    };
    var tempgaugechart = new google.visualization.Gauge(document.getElementById('tempgauge'));
    tempgaugechart.draw(tempgaugechartdata, tempgaugechartoptions);


    var humiditygaugechartdata = google.visualization.arrayToDataTable([['Label', 'Value'], ['% Humidity', 0]]);
    var humiditygaugechartoptions = {
        redFrom: 95,
        redTo: 100,
        min: 0,
        max: 100,
        minorTicks: 10,
        majorTicks: 20,
        width: chartwidth,
        height: chartheight
    };
    var humiditygaugechart = new google.visualization.Gauge(document.getElementById('humiditygauge'));
    humiditygaugechart.draw(humiditygaugechartdata, humiditygaugechartoptions);

    //Download chart data
    function updatedata() {
        $("#updatestatus").addClass("fa-spin");
        $.ajax({
            url: 'https://www.jbithell.com/projects/psc/weatherapi/live.php', success: function (response) {
                if (response.success) {
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

                    //Refresh width and height incase window was re-sized
                    windgaugechartoptions.width = $("#compassimage").width();
                    windgaugechartoptions.height = $("#compassimage").width();
                    tempgaugechartoptions.width = $("#compassimage").width();
                    tempgaugechartoptions.height = $("#compassimage").width();
                    humiditygaugechartoptions.width = $("#compassimage").width();
                    humiditygaugechartoptions.height = $("#compassimage").width();


                    tempgaugechartdata.setValue(0, 1, response.message.temperatureC);
                    tempgaugechart.draw(tempgaugechartdata, tempgaugechartoptions);

                    windgaugechartdata.setValue(0, 1, response.message["windSpeedMPH"]);
                    windgaugechart.draw(windgaugechartdata, windgaugechartoptions);

                    humiditygaugechartdata.setValue(0, 1, response.message["humidity"]);
                    humiditygaugechart.draw(humiditygaugechartdata, humiditygaugechartoptions);

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

            }
        });
    }
    updatedata();
    setInterval(function () {
        updatedata();
    }, 1000*pollforupdatesseconds);
}












/*
$(document).ready(function () {
    $('#downloadmodal').on('shown.bs.modal', function () {
        $.ajax({
            url: 'api/export/availableall.php?meterid=1', type: "json", success: function (response) {
                $('#yearexportselect').empty();
                $('#monthexportselect').empty();
                $('#weekexportselect').empty();
                $.each(response["YEARS"], function (i, item) {
                    $('#yearexportselect').append($('<option>', {
                        value: response["YEARS"][i]["year"],
                        text: response["YEARS"][i]["year"],
                    }));
                });
                $.each(response["MONTHS"], function (i, item) {
                    $('#monthexportselect').append($('<option>', {
                        value: "" + response["MONTHS"][i]["month"] + " " + response["MONTHS"][i]["year"],
                        text: response["MONTHS"][i]["monthname"] + " " + response["MONTHS"][i]["year"],
                    }));
                });
                $.each(response["WEEKS"], function (i, item) {
                    $('#weekexportselect').append($('<option>', {
                        value: response["WEEKS"][i]["year"] + " " + response["WEEKS"][i]["week"],
                        text: (response["WEEKS"][i]["week"] + " " + response["WEEKS"][i]["year"] + " (" + response["WEEKS"][i]["weekrange"] + ")"),
                    }));
                });
                $("#downloadmodalbody").show();
                $("#downloadmodalloading").hide();
            }, error: function (jqXHR, exception) {
                bootbox.alert("Sorry - we could not download the details of what can be exported - please contact the Webmaster");
            }
        });
    });
    $("#weekdatabutton").click(function () {
        window.open("api/export/week.php?meterid=1&value=" + $("#weekexportselect").val(), '_blank');
    });
    $("#monthdatabutton").click(function () {
        window.open("api/export/month.php?meterid=1&value=" + $("#monthexportselect").val(), '_blank');
    });
    $("#yeardatabutton").click(function () {
        window.open("api/export/year.php?meterid=1&value=" + $("#yearexportselect").val(), '_blank');
    });
});
*/