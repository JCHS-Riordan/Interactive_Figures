'use strict';

var H = Highcharts;
var cbsas = H.geojson(H.maps['countries/us/cbsas23']);
var states = H.geojson(H.maps['countries/us/state20_simplified']);

var sheetID = '1-PMzYAJJmo7qM8xNMXXuLWhP5SfMrzJfMPMOfD9UZRg';
var range = 'Sheet1!B:AW';

var table_notes = '<b>Notes</b>: Home prices are the median sale price of existing single family ' +
  'homes and incomes are the median household income within markets. Income data for 2025 are ' +
  'based on Moody\'s Analytics forecasts.<br/><b>Source</b>: JCHS tabulations of National ' +
  'Association of Realtors, Metropolitan Median Area Prices, and Moody\'s Analytics estimates.';

var ref_data = [];
var categories = [];
var column_name = '2025';
var map;
var drilldown_chart_obj;
var selected_GEOID = '';
var selected_metro_name = '';


/*~~~~~~~ Document ready ~~~~~~~*/
$(document).ready(function() {

  $.get(H.JCHS.requestURL(sheetID, range), function(obj) {
    ref_data = obj.values;
    categories = ref_data[0];
    column_name = categories[47];

    $('#table_notes').html(table_notes);
    $('#year_label').html(column_name);

    createChart();
    initSlider();
  });

}); // end document.ready


/*~~~~~~~ Create map chart ~~~~~~~*/
function createChart() {

  var data = ref_data.map(function(x) {
    return [x[1], x[47]];
  });

  var map_options = {

    JCHS: {
      tableNotes: table_notes,
      drilldownFunction: getMetroInfo
    },

    chart: {
      margin: [50, 30, 75, 10],
      borderWidth: 0,
      events: {
        load: function() {
          // Default drilldown so users see the chart is clickable
          getMetroInfo('Los Angeles-Long Beach-Anaheim, CA', '31080');
        }
      }
    },

    legend: {
      title: {
        text: 'Price-to-<br/>Income Ratio',
        style: { fontWeight: 'normal' }
      },
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle',
      y: 110,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      labelFormatter: function() {
        if (!this.from && this.from !== 0) {
          return 'Under ' + this.to + '.0';
        } else if (!this.to && this.to !== 0) {
          return this.from + '.0 and Over';
        } else {
          return this.from + '.0 \u2013 ' + (this.to - 1) + '.9';
        }
      },
      itemStyle: { fontWeight: 'normal' }
    },

    colorAxis: {
      dataClasses: [
        { to: 3,          color: '#323e3d' },
        { from: 3, to: 4, color: '#507687' },
        { from: 4, to: 5, color: '#afccbf' },
        { from: 5, to: 8, color: '#f89f5c' },
        { from: 8,        color: '#bf4f27' }
      ]
    },

    series: [
      {
        type: 'map',
        name: column_name,
        mapData: cbsas,
        borderColor: 'grey',
        borderWidth: 0.4,
        data: data,
        allowPointSelect: false
      },
      {
        type: 'mapline',
        name: 'State borders',
        data: states,
        color: '#333',
        lineWidth: 1
      }
    ],

    tooltip: {
      enabled: true,
      useHTML: true,
      padding: 6,
      backgroundColor: 'rgba(247,247,247,1)',

      positioner: function(labelWidth, labelHeight, point) {
        var chart = this.chart;
        var x = point.plotX + chart.plotLeft + 10;
        var y = point.plotY + chart.plotTop - (labelHeight / 2);

        if (x + labelWidth > chart.chartWidth) {
          x = point.plotX + chart.plotLeft - labelWidth - 10;
        }

        y = Math.max(chart.plotTop, y);
        y = Math.min(chart.chartHeight - labelHeight, y);

        return { x: x, y: y };
      },

      formatter: function() {
        var point = this.point;
        var tooltip_text = '<b>' + point.name + '</b>';

        // Find matching row and show value for currently displayed year
        ref_data.forEach(function(row) {
          if (row[1] == point.GEOID) {
            // this.series.data uses the currently displayed column,
            // so we read directly from point.value which Highcharts keeps current
            tooltip_text += '<br/>Price-to-Income Ratio (' + column_name + '): ';
            tooltip_text += '<b>' + H.JCHS.numFormat(point.value, 1) + '</b>';
            tooltip_text += '<br/><i>Click to see changes over time</i>';
          }
        });

        return tooltip_text;
      }
    },

    exporting: {
      filename: 'Metro Price-to-Income Ratio - Harvard JCHS',
      JCHS: { sheetID: sheetID },
      chartOptions: {
        title: { text: 'Price-to-Income Ratio by Metro: ' + column_name },
        chart: {
          events: {
            load: function() {
              this.container.classList.add('JCHS-chart__export-class');
            }
          },
          marginTop: 20,
          marginRight: 90,
          marginBottom: 25
        },
        legend: {
          y: -75,
          x: 20
        }
      },
      buttons: {
        contextButton: {
          menuItems: ['viewFullDataset', 'separator', 'downloadPDF', 'separator', 'downloadPNG', 'downloadJPEG']
        }
      }
    } // end exporting

  }; // end map_options

  map = H.mapChart('container', map_options);

} // end createChart()


/*~~~~~~~ Slider interaction ~~~~~~~*/
function initSlider() {

  $('#year_slider').on('input', function() {
    $(this).trigger('change');
  });

  $('#year_slider').on('change', function() {
    var time_period = parseInt(this.value);

    var new_data = ref_data.map(function(x) {
      return [x[1], x[time_period]];
    });

    column_name = ref_data[0][time_period];
    $('#year_label').html(column_name);

    map.series[0].update({ name: column_name }, false);
    map.series[0].setData(new_data);

    map.update({
      exporting: {
        chartOptions: {
          title: { text: 'Price-to-Income Ratio by Metro: ' + column_name }
        }
      }
    }, false);

    // Refresh drilldown if a metro is already selected
    if (selected_GEOID !== '') {
      getMetroInfo(selected_metro_name, selected_GEOID);
    }

  }); // end slider change

} // end initSlider()


/*~~~~~~~ Drilldown chart ~~~~~~~*/
// Parameter order matches JCHS map library: drilldownFunction(point.name, GEOID, point)
function getMetroInfo(metro_name, GEOID) {

  selected_GEOID = GEOID;
  selected_metro_name = metro_name;

  var chart_data = [];
  $.each(ref_data, function(idx, el) {
    if (el[1] == GEOID) {
      for (var i = 2; i < 48; i++) {
        chart_data.push(el[i]);
      }
    }
  });

  var drilldown_options = {

    JCHS: {},

    subtitle: {
      text: metro_name + ': Price-to-Income Ratio'
    },

    chart: {
      marginTop: 30
    },

    yAxis: {
      labels: {
        formatter: function() {
          return H.JCHS.numFormat(this.value, 1);
        }
      },
      // Fixed range covers full dataset: min ~1.3 (Elmira 1980), max ~13.7 (Santa Maria 2025)
      min: 0,
      max: 14,
      tickInterval: 2,
      endOnTick: false  // prevents axis extending to 16
    },

    tooltip: {
      formatter: function() {
        return '<b>' + this.x + '</b>: ' + H.JCHS.numFormat(this.y, 1);
      }
    },

    xAxis: {
      categories: categories.slice(2, 48),
      labels: { overflow: false },
      tickInterval: 4,
      tickLength: 1
    },

    series: [{
      name: metro_name,
      data: chart_data,
      zones: [
        { value: 3, className: 'zone-0' },
        { value: 4, className: 'zone-1' },
        { value: 5, className: 'zone-2' },
        { value: 8, className: 'zone-3' },
        {           className: 'zone-4' }
      ]
    }]

  }; // end drilldown_options

  drilldown_chart_obj = H.chart(
    'drilldown_chart',
    H.merge(H.JCHS.drilldownOptions, drilldown_options)
  );

} // end getMetroInfo()