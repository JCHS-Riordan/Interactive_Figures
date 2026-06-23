var H = Highcharts

var sheetID = '1zZY8bbxDKMhUp0VdfYwKQUoaDDtFPuwG7Q87Z8eVgx0'
var range = 'Sheet3!A:AO'

var chart_title = 'The Income Disparity Among Older Households Continues to Increase'
var yAxis_title = 'Household Income (Real 2017 Dollars)'

var table_notes = 'Notes: Household incomes are adjusted to 2017 dollars using CPI-U for All Items. Age is for head of household. Group quarters households are excluded. Percentiles are for each age group. <br/> Source: JCHS tabulations of US Census Bureau, 1980-2018 Current Population Surveys via IPUMS-CPS, University of Minnesota.'

var export_filename = "Income Disparity Among Older Households - Harvard JCHS - Older Adults Report 2019"

var default_selection = 2
var hh_age = '50-64 Year Old Households'

var categories = [],
    ref_data = [],
    selected_data = [],
    chart_options = {},
    chart = {}

/*~~~~~~~ Document ready function ~~~~~~~*/
$(document).ready(function() {
  //get Google sheet data
  $.get(H.JCHS.requestURL(sheetID, range), function(obj) {
    categories = obj.values[0].slice(2)
    ref_data = obj.values

    //create the title, notes, and search box
    $('#chart_title').html(chart_title)
    $('#table_notes').html(table_notes)

    //create the chart
    createChart(default_selection) 

  }) 
}) //end document.ready

function createChart(data_selection) {

  /*~~~~~~~ Chart Options ~~~~~~~*/
  chart_options = {
    JCHS: { 
      //values passed to chart object
      yAxisTitle: yAxis_title,
      sheetID: sheetID,
      tableNotes: table_notes
    },
    
    chart: {
      type: 'spline',
      events: {
        load: function() {
          initUserInteraction()
        },
      },
    },
    
    series: [{
      name: '90th Percentile',
      data: ref_data[5].slice(2)
    }, {
      name: '70th Percentile',
      data: ref_data[4].slice(2)
    }, {
      name: 'Median',
      data: ref_data[3].slice(2)
    }, {
      name: '30th Percentile',
      data: ref_data[2].slice(2)
    },{
      name: '10th Percentile',
      data: ref_data[1].slice(2)
    }],

    xAxis: {
      title: {
        text: 'Income Year',
      },
      categories: categories
    },

    // Exporting options
    exporting: {
      filename: export_filename,
      JCHS: { sheetID: sheetID },
      chartOptions: {
        chart: {
          //marginBottom: 130, //may have to adjust to fit all of the notes
          marginTop: 75 //adjusted to allow for two-line chart title
        },
        title: {
          text: chart_title +  ' - ' + hh_age,
        },
        legend: { 
          verticalAlign: 'bottom',
          width: '75%'
        },
      },
      buttons: {
        contextButton: {
          menuItems: ['viewFullDataset', 'separator', 'downloadPDF', 'separator', 'downloadPNG', 'downloadJPEG'] 
        } //end contextButtons
      } //end buttons
    } //end exporting
  } //end chart_options
    
  /*~~~~~~~ Create Chart ~~~~~~~*/
  chart = Highcharts.chart(
    'container',
    chart_options
  ) //end chart
  
} //end createChart()


/*~~~~~~~~~~~~~~ User interaction ~~~~~~~~~~~~~~~~~~~*/
function initUserInteraction () {
  $('#user_input').on('change', function () {
    //Need an if/else loop to update the data and the name of the export chart
    if($('#user_input :checked').val() == '2'){
      hh_age = '50-64 Year Old Households',
        chart.series[0].update({data: ref_data[5].slice(2)}), //Series 0 is 90th Percentile
        chart.series[1].update({data: ref_data[4].slice(2)}), //Series 1 is 70th Percentile  
        chart.series[2].update({data: ref_data[3].slice(2)}), //Series 2 is Median  
        chart.series[3].update({data: ref_data[2].slice(2)}), //Series 3 is 30th Percentile  
        chart.series[4].update({data: ref_data[1].slice(2)})  //Series 4 is 10th Percentile 
    } else {
      hh_age = '65+ Year Old Households',
        chart.series[0].update({data: ref_data[10].slice(2)}),
        chart.series[1].update({data: ref_data[9].slice(2)}),   
        chart.series[2].update({data: ref_data[8].slice(2)}),   
        chart.series[3].update({data: ref_data[7].slice(2)}),   
        chart.series[4].update({data: ref_data[6].slice(2)})     
    }
    chart.exporting.update({chartOptions: {
      title: { text: chart_title + ' - ' + hh_age},       
    }})
  })
}
