cbsas = Highcharts.geojson(Highcharts.maps['countries/us/cbsas23'])
states = Highcharts.geojson(Highcharts.maps['countries/us/state20_simplified'])
logoURL = 'https://www.jchs.harvard.edu/sites/default/files/media/2025-06/jchs_logo_750w.png'

$(document).ready(function() {
  //Google Sheet API request
  SheetID = '1-PMzYAJJmo7qM8xNMXXuLWhP5SfMrzJfMPMOfD9UZRg'
  range = 'Sheet1!B:AW'
  baseURL = 'https://sheets.googleapis.com/v4/spreadsheets/'
  API_Key = 'AIzaSyDY_gHLV0A7liVYq64RxH7f7IYUKF15sOQ'
  API_params = 'valueRenderOption=UNFORMATTED_VALUE'
  requestURL = baseURL + SheetID + '/values/' + range + '?key=' + API_Key + '&' + API_params

  $.get(requestURL, function(obj) {
    console.log(requestURL)
    ref_data = obj.values
    categories = ref_data[0]
    console.log(ref_data[0].slice(0,47))
    data = obj.values.map(function (x) {
      return [x[1],x[47]]
    })
    column_name = data[0][1]
    $('#year_label').html(column_name)

    Highcharts.setOptions({
      lang: {
        thousandsSep: ",",
        contextButtonTitle: 'Export Chart',
        downloadPDF: 'Download as PDF',
        downloadCSV: 'Download chart data (CSV)',
        downloadXLS: 'Download chart data (Excel)'
      }
    })

    // Create the chart 
    map = Highcharts.mapChart('container', {
      chart: {
        margin: [50, 30, 75, 10],
        borderWidth: 0,
        events: {
          load: function () {
            let chart = this; // 'this' is the chart instance
            function drawLogo() {
              if (chart.logoImage) chart.logoImage.destroy(); // Remove old logo
              let maxLogoWidth = 289;
              let aspectRatio = 289 / 75; // Width/height of your logo
              // Make logo at most maxLogoWidth, but responsive to chart width:
              let logoWidth = Math.min(chart.chartWidth, maxLogoWidth);
              let logoHeight = logoWidth / aspectRatio;
              let yOffset = chart.chartHeight - logoHeight - 10; // 10px from bottom
              chart.logoImage = chart.renderer.image(logoURL, 0, yOffset, logoWidth, logoHeight).add();
            }
            drawLogo(); // Draw once on load
            Highcharts.addEvent(chart, 'redraw', drawLogo); // Redraw on chart resize
          }
        }
      },
      credits: {
        enabled: false
      },

      subtitle: {
        //use subtitle element for our table notes
        text: '<b>Note</b>: Home prices are the median sale price of existing single family homes and incomes <br>are the median household income within markets. Income data for 2025 are based on <br>Moody’s Analytics forecasts. <br> <b>Source</b>: JCHS tabulations of National Association of Realtors, Metropolitan Median Area<br> Prices, and Moody’s Analytics estimates.',
        widthAdjust: -300,
        align: 'left',
        x: 300,
        y: 0,
        verticalAlign: 'bottom',
        style: {
          color: '#999999',
          fontSize: '9px'
        }
      },

      title: {
        text: '<span style="font-size: 18px;">' + column_name + '</span>',
        style: {
          color: '#C14D00',
          fontWeight: 600,
          fontSize: '15px'
        }
      },

      legend: {
        title: {
          text: 'Price-to-<br/>Income Ratio' ,
          style: {
            fontWeight: 'normal',
          },
        },
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        y: 110,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        labelFormatter: function () {
          if (!this.from & this.from != 0) {
            return 'Under ' + this.to +'.0'
          } else if (!this.to & this.to != 0) {
            return this.from + '.0 and Over'
          } else {
            return this.from + '.0 – ' + (this.to -1) + '.9'
          }
        },
        itemStyle: {
            fontWeight: 'normal',
          },
      },

      mapNavigation: {
        enabled: true
      },

      colorAxis: {
        dataClasses: [
          {
            to: 3,
            color: '#323e3d'
          }, {
            from: 3,
            to: 4,
            color: '#507687'
          }, {
            from: 4,
            to: 5,
            color: '#afccbf'
          }, {
            from: 5,
            to: 8,
            color: '#f89f5c'
          }, {
            from: 8,
            color: '#bf4f27',
          }
        ],
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
              click: function (event) {
                //console.log('clicked on map: ' + event.point.name)
                //console.dir(event.point)
                getMetroInfo(event.point.GEOID, event.point.name)
              }
            }
          }
        }, {
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
       //outside:true,
          padding: 1,
          backgroundColor: 'rgba(247,247,247,1)',
          formatter: function() {
            var GEOID = this.point.GEOID
            var metro_name = this.point.name
            setTimeout( function() {
              chart_data = []
              $.each(ref_data, function (idx, el) {
                if (el[1] == GEOID) {
                  //console.log(el[0])
                  for (i = 2; i<48; i++) {
                    chart_data.push(el[i])
                  }
                }
              } )

              $("#hc-tooltip").highcharts({
                chart: {
                  spacingTop: 5,
                  marginTop: 20,
                  spacingBottom: 5
                },
                title: {
                  text: metro_name,
                  style: {
                    fontSize: '11px'
                  }
                },
                
                credits: {
                  enabled: false
                },

                legend: {
                  enabled: false  
                },

                exporting: {
                  enabled: false
                },

                yAxis: {
                  labels: {
                    format: '{value:.1f}',
                    softMin: 0,
                    softMax: 10,
                    tickInterval: 2,
                  },
                  title: {
                    text: null,
                  }
                },

                tooltip: {
                  pointFormat: '<b>{point.y}</b>',
                },

                xAxis: {
                  categories: categories.slice(2,48),
                  labels: {
                    overflow: false
                  }, 
                  tickInterval: 1,
                  tickLength: 1,

                },


                series: [{
                  name: 'LIRA',
                  data: chart_data,
                  color: '#213A45',
                  zones: [
                    {
                      value: 3,
                      color: '#323e3d'
                    }, {
                      value: 4,
                      color: '#507687'
                    }, {
                      value: 5,
                      color: '#afccbf'
                    }, {
                      value: 8,
                      color: '#f89f5c'
                    },
                    {
                      color: '#bf4f27'
                    }
                  ],
                }]
              });
            }, 15)
            //console.log(this)
            return '<div id="hc-tooltip" class="tooltip_chart"></div>' 
          }
        },

      /*~~~~~~Exporting options~~~~~~*/
      exporting: {
        enabled: true,
        menuItemDefinitions: {
          viewFullDataset: {
            text: 'View full dataset',
            onclick: function () {
              window.open('https://docs.google.com/spreadsheets/d/1-PMzYAJJmo7qM8xNMXXuLWhP5SfMrzJfMPMOfD9UZRg/')
            }
          }
        },
        chartOptions: {
          title: { text: 'Price-to-Income Ratio by Metro: ' + column_name}
        },
        filename: "Metro Price-to-Income Ratio - Harvard JCHS",
        buttons: {
          contextButton: {
            text: 'Export',
            menuItems: [
              'viewFullDataset'/*,
              'downloadPDF',
              'separator',
              'downloadPNG',
              'downloadJPEG'*/
            ],
            theme: {
              fill: '#ffffff00'
            },
          },
        },

      }
    })
  })

}) //end

//for cross-browser compatibility on slider drag
$("#year_slider").on('input', function () {
  $(this).trigger('change');
});

$('#year_slider').on('change', function () {
  var time_period = this.value
  new_data = ref_data.map(function (x) {
    return [x[1],x[time_period]]
  })
  column_name = new_data[0][1]
  $('#year_label').html(column_name)
  map.series[0].setData(new_data)
  map.title.update({text: '<br/><br/><span style="font-size: 18px;">' + column_name + '</span>' })


})


function getMetroInfo(GEOID, metro_name) {
  //console.log(GEOID)
  chart_data = []
  $.each(ref_data, function (idx, el) {
    if (el[1] == GEOID) {
      //console.log(el[0])
      for (i = 2; i<48; i++) {
        chart_data.push(el[i])
      }
    }
  } )
  //console.log(chart_data)
  var chart = Highcharts.chart("drilldown_chart", {
    chart: {
      spacingTop: 1,
      marginTop: 30
    },

    title: {
      text: metro_name,
      style: {
        fontSize: '15px'
      }
    },

    credits: {
      enabled: false
    },

    legend: {
      enabled: false  
    },

    exporting: {
      enabled: false
    },

    yAxis: {
      labels: {
        format: '{value}',
        softMax: 10,
        min: 0,
        minTickInterval: 1,
      },
    
      title: {
        text: null
      }
    },

    tooltip: {
      pointFormat: '<b>{point.y}</b>',
    },

    xAxis: {
      categories: categories.slice(2,48),
                    labels: {
                    //autoRotation: 1,
                    overflow: false
                  }, 
                  tickInterval: 4,
                  tickLength: 1,

    },
    

    series: [{
      name: 'LIRA',
      data: chart_data,
      color: '#bf4f27',
     zones: [
                    {
                      value: 3,
                      color: '#323e3d'
                    }, {
                      value: 4,
                      color: '#507687'
                    }, {
                      value: 5,
                      color: '#afccbf'
                    }, {
                      value: 8,
                      color: '#f89f5c'

                    }
                  ],
    }]
  });

} //end getMetroInfo()