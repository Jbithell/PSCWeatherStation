google.charts.load('current', {'packages': ['gauge']});
google.charts.setOnLoadCallback(drawChart);
function hideguage() {
    $("#windgauge").html('<p><i>Data Offline</i></p>');
    $("#tempgauge").html('<p><i>Data Offline</i></p>');
    $("#humiditygauge").html('<p><i>Data Offline</i></p>');
}
function drawChart() {
    var windgaugechartdata = google.visualization.arrayToDataTable([['Label', 'Value'], ['MPH', 0]]);
    var windgaugechartoptions = {
        width: "100%",
        redFrom: 30,
        redTo: 100,
        yellowFrom: 20,
        yellowTo: 30,
        greenFrom: 10,
        greenTo: 20,
        min: 0,
        max: 100,
        minorTicks: 5,
        majorTicks: 10
    };
    var windgaugechart = new google.visualization.Gauge(document.getElementById('windgauge'));
    windgaugechart.draw(windgaugechartdata, windgaugechartoptions);


    var tempgaugechartdata = google.visualization.arrayToDataTable([['Label', 'Value'], ['°C', 0]]);
    var tempgaugechartoptions = {
        width: "100%",
        redFrom: 30,
        redTo: 40,
        yellowFrom: -20,
        yellowTo: 00,
        min: -20,
        max: 40,
        minorTicks: 5,
        majorTicks: 10
    };
    var tempgaugechart = new google.visualization.Gauge(document.getElementById('tempgauge'));
    tempgaugechart.draw(tempgaugechartdata, tempgaugechartoptions);


    var humiditygaugechartdata = google.visualization.arrayToDataTable([['Label', 'Value'], ['%', 0]]);
    var humiditygaugechartoptions = {
        width: "100%",
        redFrom: 95,
        redTo: 100,
        min: 0,
        max: 100,
        minorTicks: 10,
        majorTicks: 20
    };
    var humiditygaugechart = new google.visualization.Gauge(document.getElementById('humiditygauge'));
    humiditygaugechart.draw(humiditygaugechartdata, humiditygaugechartoptions);

    function updatedata() {
        $("#updatestatus").addClass("fa-spin");
        $.ajax({
            url: 'https://www.jbithell.com/projects/psc/weatherapi/live.php', success: function (response) {
                console.log(response);
                if (response.success) {
                    tempgaugechartdata.setValue(0, 1, response.message.temperatureC);
                    tempgaugechart.draw(tempgaugechartdata, tempgaugechartoptions);

                    windgaugechartdata.setValue(0, 1, response.message["windSpeedMPH"]);
                    windgaugechart.draw(windgaugechartdata, windgaugechartoptions);

                    humiditygaugechartdata.setValue(0, 1, response.message["humidity"]);
                    humiditygaugechart.draw(humiditygaugechartdata, humiditygaugechartoptions);
                    $("#lastupdate").html("Last updated " + response.message["niceFormatTime"] + ' <i id="updatestatus" class="fa fa-refresh fa-fw"></i>');
                }

            }, error: function (jqXHR, exception) {
                console.log("Couldn't get weather data");
            }
        });
    }
    updatedata();
    Compassinit();
    setInterval(function () {
        updatedata();
    }, 1000*30);
}













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