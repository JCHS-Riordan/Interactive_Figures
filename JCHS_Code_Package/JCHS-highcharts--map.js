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
        keys: ['GEOID', 'value'],

        //Highcharts' own default hover state (confirmed via chart.styledMode
        //being false - this chart isn't in styled mode despite our CSS-class
        //based color scheme, so hover changes go through Highcharts' own
        //pointAttribs()+animate() path, not a CSS class toggle) animates the
        //fill-opacity/border change over 150ms. That JS-driven animation is
        //the confirmed point of failure - on at least some Windows
        //Chrome/Firefox setups, it silently never completes/paints (proven
        //via direct pixel sampling: color stays byte-identical to unhovered
        //neighbors for the full duration of a real, sustained hover).
        //Forcing it to apply instantly via a direct .attr() instead of an
        //animated transition sidesteps whatever's wrong with the animation
        //path entirely, rather than trying to force/repair it after the fact.
        states: {
          hover: { animation: false },
          select: { animation: false },
          normal: { animation: false },
          inactive: { animation: false }
        }
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

  //Several rounds of "force a repaint after the fact" JS hacks used to live
  //here, all confirmed (via direct pixel sampling on a real, sustained
  //hover) to silently fail in the field despite passing every local test.
  //Root cause turned out to be upstream of any of that: chart.styledMode is
  //false, so hover isn't a CSS class toggle at all - Highcharts animates to
  //it via its own pointAttribs()+graphic.animate() over 150ms, and that
  //animation path is what doesn't reliably paint. Disabling the animation
  //at the source (states.hover.animation: false, above) makes it an instant
  //.attr() call instead, which is the actual fix - nothing left to patch
  //here.

}(Highcharts))