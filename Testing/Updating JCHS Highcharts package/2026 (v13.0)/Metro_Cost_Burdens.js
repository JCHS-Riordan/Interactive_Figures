var H = Highcharts
var cbsas = Highcharts.geojson(Highcharts.maps['countries/us/cbsas23'])
var states = Highcharts.geojson(Highcharts.maps['countries/us/state20_simplified'])

var sheetID = '1AF5CEfHEeDZcQ29_RZynfM_-wfhu1KKTyOPKyRQwcY4'
var range = 'Data2024'

var chart_subtitle = 'Select a household type:'
var legend_title = 'Share of Households <br/>with Cost Burdens,<br/>2024 (Percent)'

var table_notes = '<b>Notes:</b> Cost-burdened (severely cost-burdened) households pay more than 30% (more than 50%) of income for housing. Monthly housing costs include the contract rent and utilities for renter households. For homeowners, monthly housing costs include any mortgage payments, property taxes, insurance, utilities, and condominium or mobile home fees. Households with zero or negative income are assumed to have severe burdens, while households paying no cash rent are assumed to be without burdens. <br/> <b>Source:</b> <a href="https://www.jchs.harvard.edu/" target="_blank">Harvard Joint Center for Housing Studies</a> tabulations of US Census Bureau, American Community Survey 1-Year Estimates using the Missouri Data Center MABLE/Geocorr 2022.'

//To enable drilldown change on radio button change, need to create variables for GEOID and metro_name
var selected_metro_name = ""
var selected_GEOID = ""

var default_selection = 3

var categories = [],
    ref_data = [],
    selected_data = [],
    chart_options = {},
    chart = {},
    drilldown_chart = {}

/*~~~~~~~ Document ready function ~~~~~~~*/
$(document).ready(function() {
  //get Google sheet data
  $.get(H.JCHS.requestURL(sheetID, range), function(obj) {
    categories = obj.values[0]
    ref_data = obj.values.slice(1)
    
    //create the title, notes, and search box
    $('#chart_title').html(chart_subtitle) //Changing for use on website, where the title is in the page, making a chart title redundant, but an instructional title useful
    $('#table_notes').html(table_notes)
    
    H.JCHS.createSearchBox(ref_data, searchCallback, '', 1, 'search', 'Need help finding a CBSA? Search here...') //4th argument (the 1) tells the search box to list column index 1 from ref_data, instead of the default 0 (in this case metro name, not GEOID)

    //create the chart
    createChart() 

  }) 
}) //end document.ready


function createChart() {

  selected_data = ref_data.map(function (x) {
    return [x[0], x[default_selection]] //return data in 2 columns, GEOID and the value to be mapped

  })

  /*~~~~~~~ Chart Options ~~~~~~~*/
  chart_options = {
    JCHS: {
    },
    chart: {
      events: {
        load: function() {
          initUserInteraction()
        },
      },
    },

    legend: {
        title: {
          text: legend_title
        },
      labelFormatter: function () {
        if ((this.from == 0) && (this.to == 10)) { //legend entries w/ upper & lower bound
          return 'Under 10'
        } else if ((this.from == 10) && (this.to == 20)) {
          return '10–19'
        } else if ((this.from == 20) && (this.to == 30)) {
          return '20–29'
        } else if ((this.from == 30) && (this.to == 40)) {
          return '30–39'
        } else if ((this.from == 40) && (this.to == 50)) {
          return '40–49'
        } else if (this.from == 50) { //highest legend entry
          return '50 and Over'
        }
      },
    },
    colorAxis: {
      dataClasses: [
        { from: 0, to : 10 },
        { from: 10, to: 20 }, 
        { from: 20, to: 30 },
        { from: 30, to: 40 },
        { from: 40, to: 50 },
        { from: 50 }
      ]
    },
    series: [
      {
        type: 'map',
        name: categories[default_selection],
        mapData: cbsas,
        data: selected_data, 
        allowPointSelect: false
      }, {
        type: 'mapline',
        name: 'State borders',
        data: states
      }
    ], //end series


    // Exporting options
    exporting: {
      JCHS: { sheetID: sheetID },
      chartOptions: {
        title: { text: chart_title },
      },
      buttons: {
        contextButton: {
          menuItems: ['viewFullDataset']
        } //end contextButtons
      } //end buttons
    }, //end exporting
    
    tooltip: {
      formatter: function() {
        var point = this.point
        var series = this.series
        var user_selection = $('#user_input :checked').val()   
        
        var tooltip_text = ''
        tooltip_text +=  '<b>' +  point.name + '</b>'

        ref_data.forEach(function (row) {
          if (row[0] == point.GEOID) {
            switch (user_selection) {
              case '2':
                tooltip_text += '<br><i>Cost-Burdened Share: </i><b>' + H.JCHS.numFormat(point.value, 1) + '%</b>'
                tooltip_text += '<br><br>Severely Cost-Burdened Share: <b>' + H.JCHS.numFormat(row[5], 1) + '%</b>'
                tooltip_text += '<br>Cost-Burdened Households: <b>' + H.JCHS.numFormat(row[8], 0) + '</b>'
                tooltip_text += '<br>Median Household Income: <b>$' + H.JCHS.numFormat(row[11]) + '</b>'
                tooltip_text += '<br>Median Monthly Housing Costs: <b>$' + H.JCHS.numFormat(row[14]) + '</b>'
                break
              case '3':
                tooltip_text += '<br><i>Cost-Burdened Renter Share: </i><b>' + H.JCHS.numFormat(point.value, 1) + '%</b>'
                tooltip_text += '<br><br>Severely Cost-Burdened Renter Share: <b>' + H.JCHS.numFormat(row[6], 1) + '%</b>'
                tooltip_text += '<br>Cost-Burdened Renters: <b>' + H.JCHS.numFormat(row[9], 0) + '</b>'
                tooltip_text += '<br>Median Renter Household Income: <b>$' + H.JCHS.numFormat(row[12]) + '</b>'
                tooltip_text += '<br>Median Renter Monthly Housing Costs: <b>$' + H.JCHS.numFormat(row[15]) + '</b>'
                break
              case '4':
                tooltip_text += '<br><i>Cost-Burdened Homeowner Share: </i><b>' + H.JCHS.numFormat(point.value, 1) + '%</b>'
                tooltip_text += '<br><br>Severely Cost-Burdened Homeowner Share: <b>' + H.JCHS.numFormat(row[7], 1) + '%</b>'
                tooltip_text += '<br>Cost-Burdened Homeowners: <b>' + H.JCHS.numFormat(row[10], 0) + '</b>'
                tooltip_text += '<br>Median Homeowner Household Income: <b>$' + H.JCHS.numFormat(row[13]) + '</b>'
                tooltip_text += '<br>Median Homeowner Monthly Housing Costs: <b>$' + H.JCHS.numFormat(row[16]) + '</b>'
                break
              case '5':
                tooltip_text += '<br><i>Severely Cost-Burdened Share: </i><b>' + H.JCHS.numFormat(point.value, 1) + '%</b>'
                tooltip_text += '<br><br>Cost-Burdened Share: <b>' + H.JCHS.numFormat(row[2], 1) + '%</b>'
                tooltip_text += '<br>Severely Cost-Burdened Households: <b>' + H.JCHS.numFormat(row[17], 0) + '</b>'
                tooltip_text += '<br>Median Household Income: <b>$' + H.JCHS.numFormat(row[11]) + '</b>'
                tooltip_text += '<br>Median Monthly Housing Costs: <b>$' + H.JCHS.numFormat(row[14]) + '</b>'
                break
              case '6':
                tooltip_text += '<br><i>Severely Cost-Burdened Renter Share: </i><b>' + H.JCHS.numFormat(point.value, 1) + '%</b>'
                tooltip_text += '<br><br>Cost-Burdened Renter Share: <b>' + H.JCHS.numFormat(row[3], 1) + '%</b>'
                tooltip_text += '<br>Severely Cost-Burdened Renters: <b>' + H.JCHS.numFormat(row[18], 0) + '</b>'
                tooltip_text += '<br>Median Renter Household Income: <b>$' + H.JCHS.numFormat(row[12]) + '</b>'
                tooltip_text += '<br>Median Renter Monthly Housing Costs: <b>$' + H.JCHS.numFormat(row[15]) + '</b>'
                break
              case '7':
                tooltip_text += '<br><i>Severely Cost-Burdened Homeowner Share: </i><b>' + H.JCHS.numFormat(point.value, 1) + '%</b>'
                tooltip_text += '<br><br>Cost-Burdened Homeowner Share: <b>' + H.JCHS.numFormat(row[4], 1) + '%</b>'
                tooltip_text += '<br>Severely Cost-Burdened Homeowners: <b>' + H.JCHS.numFormat(row[19], 0) + '</b>'
                tooltip_text += '<br>Median Homeowner Household Income: <b>$' + H.JCHS.numFormat(row[13]) + '</b>'
                tooltip_text += '<br>Median Homeowner Monthly Housing Costs: <b>$' + H.JCHS.numFormat(row[16]) + '</b>'
                break         
            }
          }
        })

        return tooltip_text

      }
    }
  } //end chart_options

  /*~~~~~~~ Create Chart ~~~~~~~*/
  chart = Highcharts.mapChart(
    'container',
    chart_options
  ) //end chart
  
} //end createChart()

/*~~~~~~~~~~~~~~ User interaction ~~~~~~~~~~~~~~~~~~~*/
function initUserInteraction () {
  $('#user_input').on('change', function () {
    var new_col = parseInt($('#user_input :checked').val())
    var new_data = ref_data.map(function (x) {
      return [x[0], x[new_col]]
    })
    chart.series[0].update({name: categories[new_col]})   
    chart.series[0].setData(new_data)
  })
}

function searchCallback (metro_name) {
  H.JCHS.mapLocatorCircle(chart, metro_name)
}