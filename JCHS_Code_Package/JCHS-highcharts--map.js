(function (H) {

  H.JCHS.mapOptions = {

    chart: {
      margin: [10,5,10,5], 
      marginTop: 10, //needed to override individual settings as well
      marginBottom: 10 //needed to override individual settings as well
    }, //end chart

    plotOptions: {
      map: {
        allAreas: false,
        allowPointSelect: true,
        joinBy: ['GEOID', 0],
        keys: ['GEOID', 'value']
      }, //end plotOptions.map

      mapline: { enableMouseTracking: false }
    
    }, //end plotOptions

    colorAxis: {
      dataClassColor: 'category'
    }, //end colorAxis

    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'bottom',
      x: 10,
      padding: 5,
      labelFormatter: function () {
        if (!this.hasOwnProperty('from')) {
          return 'Under ' + this.to
        } else if (!this.hasOwnProperty('to')) {
          return this.from + ' or Over'
        } else {
          return this.from + ' â€“ ' + this.to
        }
      }
    }, //end legend

    mapNavigation: {
      enabled: true
    },
    
    exporting: {
      buttons: {
        contextButton: {
          text: 'Export',
          menuItems: [
            'viewFullDataset',
            //'viewSortableTable',
            'separator',
            'printChart',
            //'downloadPDF',
            //'separator',
            //'downloadPNG',
            //'downloadJPEG',
            //'separator',
            //'downloadXLS',
            //'downloadFullData'
          ]
        } //end contextButton
      } //end buttons
    }, //end exporting
  } //end mapOptions

  H.setOptions(H.JCHS.mapOptions)

  // Fire drilldownFunction when user clicks on map
  H.Chart.prototype.callbacks.push(function (chart) {
    if (chart.options.chart.type === "map") {
      if (chart.options.JCHS.drilldownFunction) {
        chart.update({
          plotOptions: {
            series: {
              point: {
                events: {
                  click: function () {

                    //JCHS shapefiles call it GEOID, Highcharts shapefiles (e.g., counties) call it fips
                    var GEOID = H.pick(event.point.GEOID, event.point.fips)

                    chart.options.JCHS.drilldownFunction(event.point.name, GEOID, event.point)
                  }
                } //end events
              } //end point 
            } //end series
          } //end plotOptions
        }) //end chart.update
      } //end if
    } //end if
  }) //end callbacks.push

}(Highcharts))