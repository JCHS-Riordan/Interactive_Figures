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
          return this.from + ' – ' + this.to
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
          menuItems: ['viewFullDataset', 'downloadPDF', 'downloadPNG']
        } //end contextButton
      } //end buttons
    }, //end exporting
  } //end mapOptions

  H.setOptions(H.JCHS.mapOptions)

  // Fire drilldownFunction when user clicks on map
  H.addEvent(H.Chart, 'load', function () {
    var chart = this;
    if (chart.options.chart.type === "map") {

      //map charts draw an Alaska/Hawaii inset in the same bottom-left corner where the
      //export logo is normally placed (see JCHS-highcharts.js), which paints over it -
      //move it to the bottom-right for maps specifically, where there's no map content
      if (chart.jchsLogo) {
        chart.jchsLogo.attr({ x: chart.chartWidth - 170 })
      }

      if (chart.options.JCHS.drilldownFunction) {
        chart.update({
          plotOptions: {
            series: {
              point: {
                events: {
                  click: function () {

                    //JCHS shapefiles call it GEOID, Highcharts shapefiles (e.g., counties) call it fips
                    //`this` is the clicked Point (not the deprecated global `event`)
                    var GEOID = H.pick(this.GEOID, this.fips)

                    chart.options.JCHS.drilldownFunction(this.name, GEOID, this)
                  }
                } //end events
              } //end point
            } //end series
          } //end plotOptions
        }) //end chart.update
      } //end if
    } //end if
  }) //end addEvent 'load'

  //A JS-based "nudge the inline style to force a repaint" fix used to live
  //here (Highcharts 13's highcharts-point-hover class toggle doesn't reliably
  //trigger an actual repaint of complex map paths on Windows Chrome/Firefox -
  //confirmed via direct pixel sampling: fill-opacity computes correctly but
  //the on-screen color never actually changes). That nudge tested correctly
  //in every local/synthetic test but was proven, via real screen capture, to
  //not work at all in the field. Replaced with a plain CSS fix - see
  //will-change on .highcharts-map-series .highcharts-point in the CSS file.

}(Highcharts))