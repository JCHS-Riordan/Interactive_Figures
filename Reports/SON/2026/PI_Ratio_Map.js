'use strict';

var H = Highcharts;
var cbsas = H.geojson(H.maps['countries/us/cbsas23']);
var states = H.geojson(H.maps['countries/us/state20_simplified']);

var sheetID = '1-PMzYAJJmo7qM8xNMXXuLWhP5SfMrzJfMPMOfD9UZRg';
var range = 'Sheet1!B:AW';

var table_notes = '<b>Note</b>: Home prices are the median sale price of existing single family ' +
  'homes and incomes are the median household income within markets. Income data for 2025 are ' +
  'based on Moody\'s Analytics forecasts.<br/><b>Source</b>: JCHS tabulations of National ' +
  'Association of Realtors, Metropolitan Median Area Prices, and Moody\'s Analytics estimates.';

// Declare all globals up front
var ref_data = [];
var categories = [];
var column_name = '2025';
var map;
var drilldown_chart_obj;
var selected_GEOID = '';
var selected_metro_name = '';


/*~~~~~~~ Document ready ~~~~~~~*/
$(document).ready(function() {

  // H.JCHS.requestURL() replaces manual URL construction
  $.get(H.JCHS.requestURL(sheetID, range), function(obj) {
    ref_data = obj.values;
    categories = ref_data[0];
    column_name = categories[47]; // default to last column (2025)

    // Populate table notes div for live display
    $('#table_notes').html(table_notes);
    $('#year_label').html(column_name);

    createChart();
    initSlider(); // moved inside document.ready so slider can't fire before data loads
  });

}); // end document.ready


/*~~~~~~~ Create map chart ~~~~~~~*/
function createChart() {

  var data = ref_data.map(function(x) {
    return [x[1], x[47]]; // [GEOID, value for default year]
  });

  var map_options = {

    // JCHS options block - required for library's render wrap; tableNotes used on export
    JCHS: {
      tableNotes: table_notes
    },

    chart: {
      margin: [50, 30, 75, 10],
      borderWidth: 0
      // Removed: manual logo drawing - JCHS library handles logo on export
    },

    // title: null is already set by standardOptions; year is displayed in #year_label instead
    // Removed: dynamic title + subtitle used for notes - notes now in #table_notes and JCHS.tableNotes

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
        // Bug fix: != replaced with !== to avoid falsy misfires on 0
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

    mapNavigation: { enabled: true },

    // 5-class color axis: colors defined in JS since this chart uses 5 classes vs. standard 4
    colorAxis: {
      dataClasses: [
        { to: 3,         color: '#323e3d' },
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
        allAreas: false,
        data: data,
        joinBy: ['GEOID', 0],
        keys: ['GEOID', 'value'],
        point: {
          events: {
            click: function(event) {
              getMetroInfo(event.point.GEOID, event.point.name);
            }
          }
        }
      },
      {
        type: 'mapline',
        name: 'State borders',
        data: states,
        color: '#333',
        lineWidth: 1,
        enableMouseTracking: false
      }
    ],

    tooltip: {
      enabled: true,
      useHTML: true,
      padding: 1,
      backgroundColor: 'rgba(247,247,247,1)',
      formatter: function() {
        var GEOID = this.point.GEOID;
        var metro_name = this.point.name;

        // Render a mini chart inside the tooltip after the tooltip div exists in the DOM
        // Note: each hover creates a new Highcharts instance; this is functional but
        // not ideal for memory - consider replacing with a text-only tooltip if performance suffers
        setTimeout(function() {
          var chart_data = [];
          $.each(ref_data, function(idx, el) {
            if (el[1] == GEOID) {
              for (var i = 2; i < 48; i++) { // Bug fix: var i (was global)
                chart_data.push(el[i]);
              }
            }
          });

          $('#hc-tooltip').highcharts({

            // JCHS: {} required - prevents TypeError from library's render wrap
            JCHS: {},

            chart: {
              spacingTop: 5,
              marginTop: 20,
              spacingBottom: 5
            },

            title: {
              text: metro_name,
              style: { fontSize: '11px' }
            },

            legend:   { enabled: false },
            exporting: { enabled: false },

            // Bug fix: softMin/softMax/tickInterval moved out of labels{} to yAxis level
            yAxis: {
              labels: {
                formatter: function() {
                  return H.JCHS.numFormat(this.value, 1);
                }
              },
              softMin: 0,
              softMax: 10,
              tickInterval: 2,
              title: { text: null }
            },

            tooltip: {
              formatter: function() {
                return '<b>' + H.JCHS.numFormat(this.y, 1) + '</b>';
              }
            },

            xAxis: {
              categories: categories.slice(2, 48),
              labels: { overflow: false },
              tickInterval: 1,
              tickLength: 1
            },

            series: [{
              name: 'Price-to-Income Ratio',
              data: chart_data,
              color: '#213A45',
              zones: [
                { value: 3, color: '#323e3d' },
                { value: 4, color: '#507687' },
                { value: 5, color: '#afccbf' },
                { value: 8, color: '#f89f5c' },
                {           color: '#bf4f27' }
              ]
            }]

          }); // end tooltip highcharts
        }, 15); // end setTimeout

        return '<div id="hc-tooltip" class="tooltip_chart"></div>';
      } // end tooltip formatter
    }, // end tooltip

    exporting: {
      filename: 'Metro Price-to-Income Ratio - Harvard JCHS',

      // JCHS.sheetID triggers library's auto-assignment of viewFullDataset onclick
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

      // Restored full JCHS standard export menu (was mostly commented out)
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

  // Cross-browser: input event triggers change
  $('#year_slider').on('input', function() {
    $(this).trigger('change');
  });

  $('#year_slider').on('change', function() {
    var time_period = parseInt(this.value);

    var new_data = ref_data.map(function(x) {
      return [x[1], x[time_period]];
    });

    // Get year label from header row
    column_name = ref_data[0][time_period];
    $('#year_label').html(column_name);

    // Update series name then data (name update with no redraw, data triggers redraw)
    map.series[0].update({ name: column_name }, false);
    map.series[0].setData(new_data);

    // Keep export title in sync with selected year (false = no redraw needed)
    map.update({
      exporting: {
        chartOptions: {
          title: { text: 'Price-to-Income Ratio by Metro: ' + column_name }
        }
      }
    }, false);

    // Refresh drilldown chart if a metro is already selected
    if (selected_GEOID !== '') {
      getMetroInfo(selected_GEOID, selected_metro_name);
    }

  }); // end slider change

} // end initSlider()


/*~~~~~~~ Drilldown chart ~~~~~~~*/
function getMetroInfo(GEOID, metro_name) {

  selected_GEOID = GEOID;
  selected_metro_name = metro_name;

  var chart_data = [];
  $.each(ref_data, function(idx, el) {
    if (el[1] == GEOID) {
      for (var i = 2; i < 48; i++) { // Bug fix: var i (was global)
        chart_data.push(el[i]);
      }
    }
  });

  var drilldown_options = {

    // JCHS: {} required - prevents TypeError from library's render wrap
    JCHS: {},

    // Subtitle follows JCHS drilldown pattern (replaces custom title styling)
    subtitle: {
      text: metro_name + ': Price-to-Income Ratio'
    },

    chart: {
      marginTop: 30
    },

    // Bug fix: min/softMax/minTickInterval moved out of labels{} to yAxis level
    yAxis: {
      labels: {
        formatter: function() {
          return H.JCHS.numFormat(this.value, 1);
        }
      },
      softMax: 10,
      min: 0,
      minTickInterval: 1
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
      type: 'column',
      zones: [
        { value: 3, color: '#323e3d' },
        { value: 4, color: '#507687' },
        { value: 5, color: '#afccbf' },
        { value: 8, color: '#f89f5c' },
        {           color: '#bf4f27' }
      ]
    }]

  }; // end drilldown_options

  // H.merge pattern matches JCHS template
  drilldown_chart_obj = H.chart(
    'drilldown_chart',
    H.merge(H.JCHS.drilldownOptions, drilldown_options)
  );

} // end getMetroInfo()