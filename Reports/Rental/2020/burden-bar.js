var H = Highcharts

var sheetID = '1_4jZv-x4pTdXHHLZ4JsREQw5YEQY1GxHL0FAJ2BFrug'
var range = 'Sheet1!A:AF'

var chart_title = 'Cost Burdens Remain High for Low-Income Renters, Rise for Middle-Income Renters'
var yAxis_title = 'Share of Renter Households (Percent)'

var table_notes = 'Notes: Only the 100 most populous metros are available. <br/> Source: JCHS tabulations of US Census Bureau, American Community Survey 1-Year Estimates.'

var export_filename = "Renter Cost Burdens by Income by Metro - Harvard JCHS - America's Rental Housing 2020"

var default_selection = 'Minneapolis-St. Paul-Bloomington, MN-WI'

//Variables for adding floating text labels for income groups (see responsiveAnnotation below)
var under15 = 'Under $15,000'
var v15to30 = '$15,000–29,999'
var v30to45 = '$30,000–49,999'
var v45to75 = '$45,000-74,999'
var above75 = '$75,000 and Over'

var categories = [],
    ref_data = [],
    selected_data = [],
    chart_options = {},
    chart = {}

/*~~~~~~~ Document ready function ~~~~~~~*/
$(document).ready(function() {
  //get Google sheet data
  $.get(H.JCHS.requestURL(sheetID, range), function(obj) {
    categories = obj.values[2].slice(2)
    ref_data = obj.values.slice(3)

    //create the chart, title, notes, and search box
    $('#chart_title').html(chart_title)
    createChart(default_selection) 
    $('#table_notes').html(table_notes)
    H.JCHS.createSearchBox(ref_data, createChart, '', 1)
  }) 
}) //end document.ready

function createChart(data_selection) {

  /*~~~~~~~ Build Chart Data ~~~~~~~*/
  selected_data = []
  ref_data.forEach(function (row) {
    if (row[1] == data_selection) {
      selected_data.push({
        name: 'Severely Cost-Burdened',
        data: row.slice(17,32),
        type: 'column'
      })
    } // end if
    
    if (row[1] == data_selection) {
      selected_data.push({
        name: 'Moderately Cost-Burdened',
        data: row.slice(2,17),
        type: 'column'
      })
    } // end if
   
  }) //end forEach


  /*~~~~~~~ Chart Options ~~~~~~~*/
  chart_options = {
    JCHS: {
      yAxisTitle: yAxis_title,
      sheetID: sheetID,
      tableNotes: table_notes
    },

    //Using responsiveAnnotation to add income group name labels
    chart: {
      events: {
        render: function () {
          H.JCHS.responsiveAnnotation(this, under15, -275, 40),
          H.JCHS.responsiveAnnotation(this, v15to30, -135, 40),
          H.JCHS.responsiveAnnotation(this, v30to45, 0, 40),
          H.JCHS.responsiveAnnotation(this, v45to75, 135, 40)
          H.JCHS.responsiveAnnotation(this, above75, 275, 40)
        }
      },
      marginBottom: 110
    },

    series: selected_data,
    
    plotOptions: {
      column: {
        stacking: 'normal'
      }
    },
    xAxis: {
      title: {
        text: data_selection,
        margin: 30
      },
      categories: categories,
      plotLines: [{
        value: 2.5
      },
      {
        value: 5.5
      },
      {
        value: 8.5
      },
      {
        value: 11.5
      }],
    },

    // Custom tooltip content
    tooltip: {
      shared: false,
      formatter: function () {
        var point = this.point
        var tooltip_text = ''
        if (point.index < 3) {
          tooltip_text += '<b>Under $15,000</b><br/>'
          tooltip_text += this.series.name + ': <b>' + H.JCHS.numFormat(this.point.y, 1) + '%</b><br/>'
          //tooltip_text += '<br/>Moderately Burdened Renters: ' + H.JCHS.numFormat(row[17])
          return tooltip_text
        } else if (point.index > 2 & point.index < 6) {
          tooltip_text += '<b>$15,000-$29,999</b><br/>'
          tooltip_text += this.series.name + ': <b>' + H.JCHS.numFormat(this.point.y, 1) + '%</b>'
          return tooltip_text
        } else if(point.index > 5 & point.index < 9) {
          tooltip_text += '<b>$30,000-$44,999</b><br/>'
          tooltip_text += this.series.name + ': <b>' + H.JCHS.numFormat(this.point.y, 1) + '%</b>'
          return tooltip_text
        } else if (point.index > 8 & point.index < 12) {
          tooltip_text += '<b>$45,000-$74,999</b><br/>'
          tooltip_text += this.series.name + ': <b>' + H.JCHS.numFormat(this.point.y, 1) + '%</b>'
          return tooltip_text
        } else {
          tooltip_text += '<b>$75,000+</b><br/>'
          tooltip_text += this.series.name + ': <b>' + H.JCHS.numFormat(this.point.y, 1) + '%</b>'
          return tooltip_text
        }
      }
    },      
      
    // Exporting options
    exporting: {
      filename: export_filename,
      JCHS: { sheetID: sheetID },
      chartOptions: {
        title: { text: chart_title },
        chart: {
          //marginBottom: 130 //may have to adjust to fit all of the notes
        },
        legend: { 
          //y: -45 //may have to adjust to fit all of the notes
        },
        buttons: {
          contextButton: {
            menuItems: ['viewFullDataset', 'separator', 'downloadPDF', 'separator', 'downloadPNG', 'downloadJPEG']
          } //end contextButtons
        } //end buttons
      }
    } //end exporting
  } //end chart_options
  
  /*~~~~~~~ Create Chart ~~~~~~~*/
  chart = Highcharts.chart(
    'container',
    chart_options
  ) //end chart
  
} //end createChart()
