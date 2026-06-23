var H = Highcharts
var cbsas = Highcharts.geojson(Highcharts.maps['countries/us/cbsa'])
var states = Highcharts.geojson(Highcharts.maps['countries/us/states'])

var sheetID = '1SqHgAvbOoc02BY4pe8r-HAVTwBF4F4HkIvwnQ5qMu84'
var range = 'Sheet1!A:V'

var chart_title = 'Many Older Adults Burdened by Housing Costs in 2017'
var chart_subtitle = 'Older Adult Households with Cost Burdens:'
var legend_title = 'Share of Older <br/>Adult Households<br/>with Cost Burdens<br/>(Percent)'

var table_notes = 'Notes: Cost-burdened (severely cost-burdened) households pay more than 30% (more than 50%) of income for housing. Households with zero or negative income are assumed to have severe burdens, while households paying no cash rent are assumed to be without burdens. Monthly housing costs include the contract rent and utilities for renter households. For homeowners, monthly housing costs include any mortgage payments, property taxes, insurance, utilities, and condominium or mobile home fees.<br/> Source: <a href="https://www.jchs.harvard.edu/" target="_blank">Harvard Joint Center for Housing Studies</a> tabulations of US Census Bureau, 2017 American Community Survey 1-Year Estimates using the Missouri Data Center MABLE/geocorr14.'

var export_filename = "Housing Cost Burdens - Harvard JCHS - Older Adults Report 2019"

var default_selection = 2

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
    $('#chart_title').html(chart_title) //Changing for use on website, where the title is in the page, making a chart title redundant, but an instructional title useful
    $('#table_notes').html(table_notes)
    
    H.JCHS.createSearchBox(ref_data, searchCallback, '', 1, 'search', 'Need help finding a metro? Search here...') //4th argument (the 1) tells the search box to list column index 1 from ref_data, instead of the default 0 (in this case metro name, not GEOID)

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
      drilldownFunction: drilldownChart
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
    },
    colorAxis: {
      dataClasses: [
        { from: 0, to : 20 },
        { from: 20, to: 30 }, 
        { from: 30, to: 40 },
        { from: 40, to: 50 },
        { from: 50 },
      ]
    },
    series: [
      {
        type: 'map',
        name: categories[default_selection],
        mapData: cbsas,
        data: selected_data
      }, {
        type: 'mapline',
        name: 'State borders',
        data: states
      }
    ], //end series


    // Exporting options
    exporting: {
      filename: export_filename,
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
                tooltip_text += '<br><i>Share of Households Age 65 and Over with Cost Burdens: </i><b>' + H.JCHS.numFormat(point.value, 1) + '%</b>'
                tooltip_text += '<br><br>Share of Households Age 50–64: <b>' + H.JCHS.numFormat(row[8], 1) + '%</b>'
                tooltip_text += '<br>Share of Households Age 65 and Over: <b>' + H.JCHS.numFormat(row[9],1) + '%</b>'
                tooltip_text += '<br>Median Household Income: <b>$' + H.JCHS.numFormat(row[10]) + '</b>'
                tooltip_text += '<br>Median Monthly Housing Costs: <b>$' + H.JCHS.numFormat(row[13]) + '</b>'
                break
              case '3':
                tooltip_text += '<br><i>Share of Renter Households Age 65 and Over with Cost Burdens: </i><b>' + H.JCHS.numFormat(point.value, 1) + '%</b>'
                tooltip_text += '<br><br>Share of Households Age 50–64: <b>' + H.JCHS.numFormat(row[8], 1) + '%</b>'
                tooltip_text += '<br>Share of Households Age 65 and Over: <b>' + H.JCHS.numFormat(row[9],1) + '%</b>'
                tooltip_text += '<br>Median Renter Household Income: <b>$' + H.JCHS.numFormat(row[11]) + '</b>'
                tooltip_text += '<br>Median Rent: <b>$' + H.JCHS.numFormat(row[14]) + '</b>'
                break
              case '4':
                tooltip_text += '<br><i>Share of Homeowner Households Age 65 and Over with Cost Burdens: </i><b>' + H.JCHS.numFormat(point.value, 1) + '%</b>'
                tooltip_text += '<br><br>Share of Households Age 50–64: <b>' + H.JCHS.numFormat(row[8], 1) + '%</b>'
                tooltip_text += '<br>Share of Households Age 65 and Over: <b>' + H.JCHS.numFormat(row[9],1) + '%</b>'
                tooltip_text += '<br>Median Homeowner Household Income: <b>$' + H.JCHS.numFormat(row[12]) + '</b>'
                tooltip_text += '<br>Median Homeowner Monthly Housing Costs: <b>$' + H.JCHS.numFormat(row[15]) + '</b>'
                break
              case '5':
                tooltip_text += '<br><i>Share of Households Age 50–64 with Cost Burdens: </i><b>' + H.JCHS.numFormat(point.value, 1) + '%</b>'
                tooltip_text += '<br><br>Share of Households Age 50–64: <b>' + H.JCHS.numFormat(row[8], 1) + '%</b>'
                tooltip_text += '<br>Share of Households Age 65 and Over: <b>' + H.JCHS.numFormat(row[9],1) + '%</b>'
                tooltip_text += '<br>Median Household Income: <b>$' + H.JCHS.numFormat(row[16]) + '</b>'
                tooltip_text += '<br>Median Household Monthly Housing Costs: <b>$' + H.JCHS.numFormat(row[19]) + '</b>'
                break
              case '6':
                tooltip_text += '<br><i>Share of Renter Households Age 50–64 with Cost Burdens: </i><b>' + H.JCHS.numFormat(point.value, 1) + '%</b>'
                tooltip_text += '<br><br>Share of Households Age 50–64: <b>' + H.JCHS.numFormat(row[8], 1) + '%</b>'
                tooltip_text += '<br>Share of Households Age 65 and Over: <b>' + H.JCHS.numFormat(row[9],1) + '%</b>'
                tooltip_text += '<br>Median Renter Household Income: <b>$' + H.JCHS.numFormat(row[17]) + '</b>'
                tooltip_text += '<br>Median Rent: <b>$' + H.JCHS.numFormat(row[20]) + '</b>'
                break
              case '7':
                tooltip_text += '<br><i>Share of Homeowner Households Age 50–64 with Cost Burdens: </i><b>' + H.JCHS.numFormat(point.value, 1) + '%</b>'
                tooltip_text += '<br><br>Share of Households Age 50–64: <b>' + H.JCHS.numFormat(row[8], 1) + '%</b>'
                tooltip_text += '<br>Share of Households Age 65 and Over: <b>' + H.JCHS.numFormat(row[9],1) + '%</b>'
                tooltip_text += '<br>Median Homeowner Household Income: <b>$' + H.JCHS.numFormat(row[18]) + '</b>'
                tooltip_text += '<br>Median Homeowner Monthly Housing Costs: <b>$' + H.JCHS.numFormat(row[21]) + '</b>'
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

function drilldownChart(metro_name, GEOID) {
  drilldown_chart = Highcharts.chart(
    'drilldown_chart',
    H.merge(H.JCHS.drilldownOptions, drilldown_options)
  )
} //end drilldownChart()

function searchCallback (metro_name) {
  H.JCHS.mapLocatorCircle(chart, metro_name)
}

  
  
