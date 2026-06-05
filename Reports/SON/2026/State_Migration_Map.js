var H = Highcharts
var states = Highcharts.geojson(Highcharts.maps['countries/us/state20_simplified'])

var sheetID = '1bL_VzBzT0Uvwv3FCSsxrK6socdkr7SwAMdWeZxxdJeo'
var range = 'Data_v2025_rpopchg'

var table_notes = '<b>Notes:</b> Natural population change is the difference between births and deaths. Immigration refers to net international migration.<br/> <b>Source: </b><a href="https://www.jchs.harvard.edu/" target="_blank">Harvard Joint Center for Housing Studies</a> tabulations of US Census Bureau, Vintage 2025 Population Estimates.'

var component = 'Population Change'

var default_selection = 2
var selected_state_name = ""
var selected_GEOID = ""

var categories = [],
    ref_data = [],
    selected_data = [],
    chart_options = {},
    chart = {},
    drilldown_chart = {}

var popchg_legend_title = 'Population Change Rate<br/>(per 1,000 People), 2025'
var domig_legend_title = 'Net Domestic Migration Rate<br/>(per 1,000 People), 2025'
var immig_legend_title = 'Immigration Rate<br/>(per 1,000 people), 2025'
var natchg_legend_title = 'Natural Change Rate<br/>(per 1,000 people), 2025'

var default_legend = function () {
  if ((this.to == -4.9)) { 
    return 'Loss: 5 or More'
  } else if ((this.from == -4.9) && (this.to == 0)) {
    return 'Loss: Up to 5'
  } else if ((this.from == 0) && (this.to == 5)) {
    return 'Gain: Up to 5'
  } else if ((this.from == 5)) {
    return 'Gain: 5 or More'
  }
}

var default_classes = [
  { to : -4.9 },
  { from: -4.9, to: 0 }, 
  { from: 0, to: 5 },
  { from: 5 }
]

var default_zones = [
  { value: -5, className: 'zone-0' },
  { value: 0,  className: 'zone-1' },
  { value: 5,  className: 'zone-2' },
  {            className: 'zone-3' }
]

var selected_zones = default_zones

/*~~~~~~~ Document ready function ~~~~~~~*/
$(document).ready(function() {
  $.get(H.JCHS.requestURL(sheetID, range), function(obj) {
    categories = obj.values[1].slice(2)
    ref_data = obj.values.slice(2)
    
    $('#table_notes').html(table_notes)
    createChart() 
  }) 
}) //end document.ready


function createChart() {

  selected_data = ref_data.map(function (x) {
    return [x[0], x[default_selection]] 
  })

  chart_options = {
    JCHS: {
      drilldownFunction: drilldownChart,
      tableNotes: table_notes
    },
    chart: {
      events: {
        load: function() {
          initUserInteraction(),
            drilldownChart('Florida','12')
        },
      },
    },

    legend: {
      title: { text: popchg_legend_title },
      labelFormatter: default_legend
    },
    colorAxis: {
      dataClasses: default_classes
    },
    series: [
      {
        type: 'map',
        name: categories[default_selection],
        mapData: states,
        data: selected_data,
        allowPointSelect: false
      }
    ],

    exporting: {
      filename: component + ' by State - Harvard JCHS - State of the Nation\'s Housing 2026',
      JCHS: { sheetID: sheetID },
      chartOptions: {
        title: { text: 'Population Change by State' },
        chart: {
          events: {
            load: function() {
              this.container.classList.add('JCHS-chart__export-class')
            }
          },
          marginTop: 20,
          marginRight: 90,
          marginBottom: 25
        },
        legend: { y: -75, x: 0 }
      },
      buttons: {
        contextButton: {
          menuItems: ['viewFullDataset', 'separator', 'downloadPDF', 'separator', 'downloadPNG', 'downloadJPEG'] 
        }
      }
    },
    
    tooltip: {
      formatter: function() {
        var point = this.point
        var series = this.series
        var user_selection = $('#user_input :checked').val()   
        
        var tooltip_text = ''
        tooltip_text += '<b>' + point.name + '</b>'

        ref_data.forEach(function (row) {
          if (row[0] == point.GEOID) {
            switch (user_selection) {

              case '2':
                tooltip_text += '<br/><i>Population Change </i>'
                tooltip_text += '<br>Rate: <b>' + H.JCHS.numFormat(row[2]) + '</b>'
                tooltip_text += '<br>Net Change: <b>' + H.JCHS.numFormat(row[6]) + '</b>'
                break
              case '3':  // was case '2'
                tooltip_text += '<br/><i>Net Domestic Migration </i>'
                tooltip_text += '<br>Rate: <b>' + H.JCHS.numFormat(row[3]) + '</b>'   // was row[2]
                tooltip_text += '<br>Net Change: <b>' + H.JCHS.numFormat(row[7]) + '</b>'  // was row[5]
                break
              case '4':  // was case '3'
                tooltip_text += '<br/><i>Net International Migration </i>'
                tooltip_text += '<br>Rate: <b>' + H.JCHS.numFormat(row[4]) + '</b>'   // was row[3]
                tooltip_text += '<br>Net Change: <b>' + H.JCHS.numFormat(row[8]) + '</b>'  // was row[6]
                break
              case '5':  // was case '4'
                tooltip_text += '<br/><i>Natural Population Change </i>'
                tooltip_text += '<br>Rate: <b>' + H.JCHS.numFormat(row[5]) + '</b>'   // was row[4]
                tooltip_text += '<br>Net Change: <b>' + H.JCHS.numFormat(row[9]) + '</b>'  // was row[7]
                break   
            }
            tooltip_text += '<br/><b><i>Click state to see changes over time</b></i>'
          }
        })
        return tooltip_text
      }
    }
  } //end chart_options

  chart = Highcharts.mapChart('container', chart_options)
  
} //end createChart()


/*~~~~~~~~~~~~~~ User interaction ~~~~~~~~~~~~~~~~~~~*/
function drilldownChart(state_name, GEOID) {
  
  selected_state_name = state_name
  selected_GEOID = GEOID
  
  var chart_data = []
    
  ref_data.forEach(function (el) {
    if (el[0] == GEOID) {
      switch ($('#user_input :checked').val()) {

        case '2':
          chart_data = el.slice(10, 21)   
          break
        case '3':                         // was case '2': el.slice(8,19)
          chart_data = el.slice(21, 32)   // Net Domestic Migration 2015–2025
          break
        case '4':                         // was case '3': el.slice(19,30)
          chart_data = el.slice(32, 43)   // Net International Migration 2015–2025
          break
        case '5':                         // was case '4': el.slice(30,41)
          chart_data = el.slice(43, 54)   // Natural Change 2015–2025
          break

      } //end switch
    } //end if
  }) //end forEach
  
  var drilldown_options = {
    JCHS: {
      yAxis_title: 'Number'
    },
    subtitle: {
      text: state_name + ': ' + component + ' Rate (per 1,000 people)'
    },
    yAxis: {
      labels: {
        formatter: function() {
          return H.JCHS.numFormat(this.value) 
        }
      }
    },
    chart: {
      marginLeft: 60
    },
    xAxis: {
      categories: [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025]
    },
    tooltip: {
      formatter: function() {
        var tooltip_text = ''
        tooltip_text += '<b>' + this.x + '</b>: '
        tooltip_text += H.JCHS.numFormat(this.y, 1) + ' per 1,000 people'
        return tooltip_text
      }
    },
    series: [{
      name: state_name,
      data: chart_data,
      type: 'column',
      zones: selected_zones,
    }],
  }

  drilldown_chart = Highcharts.chart(
    'drilldown_chart',
    H.merge(H.JCHS.drilldownOptions, drilldown_options)
  )
} //end drilldownChart()


function initUserInteraction () {
  $('#user_input').on('change', function () {
    var new_col = parseInt($('#user_input :checked').val())
    var new_data = ref_data.map(function (x) {
      return [x[0], x[new_col]]
    })
    chart.series[0].update({name: categories[new_col]})   
    chart.series[0].setData(new_data) 

    switch(new_col) {
      case 2:
        component = 'Population Change'
        chart.legend.update({ title: { text: popchg_legend_title } })
        chart.exporting.update({ chartOptions: { title: { text: 'Population Change by State' }, legend: { y: -75, x: 0 } } })
        break
      case 3:  
        component = 'Net Domestic Migration'
        chart.legend.update({ title: { text: domig_legend_title } })
        chart.exporting.update({ chartOptions: { title: { text: 'Domestic Migration by State' }, legend: { y: -75, x: 20 } } })
        break
      case 4:  
        component = 'Net International Migration'
        chart.legend.update({ title: { text: immig_legend_title } })
        chart.exporting.update({ chartOptions: { title: { text: 'Immigration by State' }, legend: { y: -75, x: 0 } } })
        break
      case 5:  
        component = 'Natural Population Change'
        chart.legend.update({ title: { text: natchg_legend_title } })
        chart.exporting.update({ chartOptions: { title: { text: 'Natural Population Change by State' }, legend: { y: -75, x: 0 } } })
        break
      }

    chart.exporting.update({
      filename: component + ' by State - Harvard JCHS - State of the Nation\'s Housing 2026'
    })
    
    drilldownChart(selected_state_name, selected_GEOID)
  })
}