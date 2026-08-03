var H = Highcharts

var sheetID = '1ZM37D7C7GfTYq4SU8BTvU8gyovIK0l_3wk_l074zQec'
var range = 'Sheet1'

var chart_title = 'Payments on the Median-Priced Home Have Risen in Every Market'

var table_notes = '<b>Notes</b>: Monthly payments are on the median priced home and assume a 3.5% downpayment on a 30-year fixed-rate loan and 0.55% mortgage insurance, 0.35% property insurance, and 1.15% property tax rates. </a><br/><b>Source</b>: <a href="https://www.jchs.harvard.edu/" target="_blank">Harvard Joint Center for Housing Studies</a> tabulations of Freddie Mac, Primary Mortgage Market Surveys; National Association of Realtors, Existing Home Sales; Moody’s Analytics estimates.'

var export_notes = 'For more detail on the data, see <a href="https://www.zillow.com/research/data/" target="_blank">Zillow\'s methodology.</a><br/> Source: <a href="https://www.jchs.harvard.edu/" target="_blank">Harvard Joint Center for Housing Studies</a> tabulations of Zillow data.'

var export_filename = "Housing Costs on the Median-Priced Home Are Skyrocketing in Many Markets - Harvard JCHS State of the Nation's Housing 2026"

var metro_selection = 'United States'
var metro_selection2 = ''
var metro_selection3 = ''


var categories = [],
    ref_data = [],
    selected_data = [],
    chart_options = {},
    chart = {}

/*~~~~~~~ Document ready function ~~~~~~~*/
$(document).ready(function() {
  $.get(H.JCHS.requestURL(sheetID, range), function(obj) {
    categories = obj.values[1].slice(2)
    ref_data = obj.values.slice(2)

    createChart(metro_selection) 
    $('#table_notes').html(table_notes)
    H.JCHS.createSearchBoxes(3, ref_data, createChart, '', 0, 'dropdown', 
      ['Select a market...', 
      'Select a comparison market (optional)...', 
      'Select another comparison market (optional)...'])
  })  
}) //end document.ready

function createChart(data_selection, data_selection2, data_selection3) {

  // Fallbacks
  data_selection = data_selection || metro_selection
  if (data_selection2 === undefined) { data_selection2 = metro_selection2 }
  if (data_selection3 === undefined) { data_selection3 = metro_selection3 }  

  /*~~~~~~~ Build Chart Data ~~~~~~~*/
  selected_data = []
  metro_selection = data_selection
  metro_selection2 = data_selection2
  metro_selection3 = data_selection3

  ref_data.forEach(function (row) {
    // First metro series
    if (row[0] == data_selection) {
      selected_data.push({
        name: data_selection,
        data: row.slice(2, 146),
        type: 'spline',
        zIndex: 2
      })
    }
    // Second metro series
    if (data_selection2 && row[0] == data_selection2) {
      selected_data.push({
        name: data_selection2,
        data: row.slice(2, 146),
        type: 'spline',
        zIndex: 1
      })
    }
    // Third metro series
    if (data_selection3 && row[0] == data_selection3) {
      selected_data.push({
        name: data_selection3,
        data: row.slice(2, 146),
        type: 'spline',
        zIndex: 1
      })
    }
  }) //end forEach


  /*~~~~~~~ Chart Options ~~~~~~~*/
  chart_options = {
    JCHS: {
      yAxisTitle: 'Total Monthly Costs on the Median-Priced Home (Dollars)',
      sheetID: sheetID,
      tableNotes: table_notes,
    },

    series: selected_data,

    // Show legend so user can tell which line is which
    legend: {
      enabled: true
    },

    xAxis: {
      title: {
        /*text: 'Year:Quarter'*/
      },
      tickInterval: 20,
      categories: categories,
      labels: {
        formatter: function () {
          return this.value.slice(0)
        }
      }
    },

    plotOptions: {
      series: {
        connectNulls: false
      }
    },

    // Custom tooltip content
    tooltip: {
      shared: true,
      formatter: function() {
        var tooltip_text = '<b>' + this.x + '</b>'
        this.points.forEach(function(point) {
          tooltip_text += '<br/><span class="highcharts-color-' + point.colorIndex + '">●</span> <b>' + 
            point.series.name + ':</b> $' + H.JCHS.numFormat(point.y, 0)
        })
        return tooltip_text
      }
    },

    // Exporting options
    exporting: {
      filename: export_filename,
      JCHS: { sheetID: sheetID },
      chartOptions: {
        chart: {
          marginBottom: 130 
        },
        title: { text: 'Housing Costs on the Median-Priced Home Are Rising Rapidly'},
        legend: { 
          y: -45
        },
      },
      buttons: {
        contextButton: {
          menuItems: ['viewFullDataset', 'separator', 'downloadPDF', 'separator', 'downloadPNG', 'downloadJPEG']
        }
      }
    }
  } //end chart_options
  
  /*~~~~~~~ Create Chart ~~~~~~~*/
  chart = Highcharts.chart(
    'container',
    chart_options
  )
} //end createChart()