/*~~ API reference ~~~~~~~~~~~~~~~~~~~~~~~~~

https://api.highcharts.com/highmaps/

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


/*~~~~~ Load external shapefiles and JCHS logo ~~~~~~*/
counties = Highcharts.geojson(Highcharts.maps["countries/us/us-all-all-highres"])
//counties = Highcharts.maps["countries/us/counties"]
states = Highcharts.geojson(Highcharts.maps["countries/us/us-all-all-highres"], 'mapline')
logoURL =
  "http://www.jchs.harvard.edu/sites/jchs.harvard.edu/files/harvard_jchs_logo_2017.png"

Sheet_IDs = {
  SheetID_2016: "1gmnrLqkwLr8S4E29utBisi1_4glZRnSrLkFO1uxOU-k",
  //SheetID_2015: "16CUXS0J0o29tOUyfr5Hx5EDgDN-r_ymFzRrnyfB5SLo",
  SheetID_2014: "1l2WHtO7QxajpsfLla3gxUIWCVhM1qRle17O0uDi5yns",
  SheetID_2013: "1YUODMFwBAd8Mgwk5EDuW4mrGs9ibikfuLsgEHw99JN4",
  SheetID_2012: "1ldHf4OIdJbWvtL9hiGgUZUc8BaGPVsjFTDN1vYtqH5c",
  SheetID_2011: "1ACSukGgmDZx2jXmz0P_zM7Je_gz52irCNL67Hf34Myg",
  SheetID_2010: "1zZ07ank4HF_j2_qfzbIFte_PJZFlbPYxLN1cMCYoan8",
  SheetID_2009: "12MRnB5A_5UrFD1WXZUczr9NND-G1chso4lhqpYQdxwc",
  SheetID_2008: "1CZxUPYi0lOYeveCXnqHq0xETwD0y5lau_lPT812a3E4",
  SheetID_2007: "1bAr05_DNuW0mOvfa9-nNj90W0qGd2pZeep2T1gwUheU",
  SheetID_2006: "1cQiQ-S33NLlz3nJtkIvAuTjWzO6tVrUvNDoTpN-vHdM",
  SheetID_2005: "1J3RA0R67yiu37ArFjDavRf3mLsKHYuydciLE186iHGo",
  SheetID_2004: "1M1o3k-h-RU_7Ls_ht5E7nHv67ku4Rb9GccJYyw8iV-k",
  SheetID_2003: "1CqWtB7eoJcMgIjMSKNjqNe3B6EAQl7rrNJhHehPSF4Y",
  SheetID_2002: "1hugSohxcoCCult-zq8x-Cn_G_w_YhjiRUhdpQAAHb5A",
  SheetID_2001: "1M3gKiIET6N10a-6OLLVBbz-0AdlDXSZcJ98SC6CRJSc",
  SheetID_2000: "1W4gYEQm1akkGFSTPPE77z-y5kIFQO5Fma1i4kJnD-TQ",
  SheetID_1999: "1D3ZNzD7IBnbnQpMntN2YnYPZ0r_q-4OUVz1kjm5yMlI",
  SheetID_1998: "1zbmR7UAcp7oXfiYyiT6P93DLcijhpJRR1_Gm8iN54lE",
  SheetID_1997: "1VsoJ4ozaMuE48no5HvNnat7u_0Dpwo-nMfn8mp23pik",
  SheetID_1996: "1s0sEi7V9ulvfJp6QfdnmbPg4VYqGXivmXs0hiI3lPro",
  SheetID_1995: "1K2LG1tuoJHhiE4Wfs4oRJEXy4aS8CcYUQGqzHli9UMU",
  SheetID_1994: "1xjHLqTFX1TRvS_0FwTUv-em_GKpqJMRx1m8ESu4pWzU",
  SheetID_1993: "1tx6v7NpIgfzqWvB3y7hUBeMspWTh5hdYLtrzPIgB4N4",
  SheetID_Netflow: "1I2cnjym_3_85utkn7En3tXlX94AgT31OVMaTyv2dmYQ",
  SheetID_InOut: "1E1pHdo0rIS-fAx5F_SJhSM4H5R7T-Vm-n2MIdaOcEDU",
}

data_classes_inflow_outflow = [
    {
      from: 10,
      to: 100,
      color: "#F5C35C"
    },
    {
      from: 100,
      to: 1000,
      color: "#ABBFC3"
    },
    {
      from: 1000,
      color: "#4E7686"
    }
  ]

data_classes_netflow = [
  {to: -1000,
   color: "#560101"         
  },
  {from: -1000,
   to: -100,
   color: "#E3371E"
  },
  {
    from: -100,
    to: 0,
    color: "#F9F6F5" /*Originally light red: #FF8372 */
  },
  {
    from: 0,
    to: 100,
    color: "#F9F6F5" /*Originally light blue: #CAF6F5 */
  },
  {
    from: 100,
    to: 1000,
    color: "#ABBFC3"
  },
  {
    from: 1000,
    color: "#4E7686"
  }
]


var selected_year = $('#select_year').val()
var selected_flow = 'Netflows'
var selected_metro = ''
var selected_metro_name = ''
var flow_data = {}
var map_data = []

var baseURL = "https://sheets.googleapis.com/v4/spreadsheets/"
var API_Key = "AIzaSyDY_gHLV0A7liVYq64RxH7f7IYUKF15sOQ"
var API_params = "valueRenderOption=UNFORMATTED_VALUE"

//Changing two outdated county names (changes effective 2015)
var countiesToChange = [
     {
  oldKey: 'us-sd-113',
  newFips: '46102',
  newName: 'Oglala Lakota'
  },
     {
  oldKey: 'us-ak-270',
  newFips: '02158',
  newName: 'Kusilvak'
  }
]

countiesToChange.forEach(function(newInfo) {
  var county = Highcharts.find(Highcharts.maps['countries/us/us-all-all-highres'].features, function (area) {
    return area.properties['hc-key'] === newInfo.oldKey
  })
  county.properties.fips = newInfo.newFips
  county.name = newInfo.newName
})

/*~~~~~~ Document ready function ~~~~~~~~~~~~~~~~~*/
$(document).ready(function() {
  createMap()
  
  var SheetID = Sheet_IDs['SheetID_Netflow']
  var range = 'Netflows!A:C'

  var requestURL2 = baseURL 
  + SheetID 
  + "/values/" 
  + range 
  + "?key=" 
  + API_Key 
  + "&" 
  + API_params

  $.get(requestURL2, function(obj) {
    console.log(requestURL2)

    flow_data['Netflows'] = obj.values
    
  })
})


/*~~~~~~ Create the main map ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
function createMap() { 

  /*~~~~~~~~ Google Sheet API request ~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  //Change for specific source table
  //This is the data for the base map, the first thing that appears -RF
  var SheetID = "1I2cnjym_3_85utkn7En3tXlX94AgT31OVMaTyv2dmYQ"
  var range = "2016%20Netflows"

  var requestURL = baseURL 
    + SheetID 
    + "/values/" 
    + range 
    + "?key=" 
    + API_Key 
    + "&" 
    + API_params

  $.get(requestURL, function(obj) {
    console.log(requestURL)

    map_data = obj.values

    /*~~~~~~~~ Standard JCHS Highcharts options ~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    Highcharts.setOptions({
      credits: { enabled: false },
      lang: {
        thousandsSep: ",",
        contextButtonTitle: "Export Map",
        downloadPDF: "Download as PDF",
        downloadCSV: "Download chart data (CSV)",
        downloadXLS: "Download chart data (Excel)"
      },
      colors: ['#4E7686', '#c14d00', '#998b7d', '#43273a', '#e9c002', '#76ad99', '#c4c6a6'],
    }) //end standard options


    /*~~~~~~~~~~~ Highcharts Map ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    map = Highcharts.mapChart("county_migration_map", {
      chart: {
        height: 600,
        width: 800,
        margin: [50, 30, 75, 10], //to allow space for title at top, legend at right, and notes at bottom
        borderWidth: 0,
        events: {
          load: function(event) {
            this.renderer
              .image(logoURL, 0, this.chartHeight - 80, 289, 85) //puts logo in lower left
              .add() // (src,x,y,width,height)
              
            getFlowData('Inflows', '2016')
            
          }
        }
      },

      mapNavigation: { enabled: true },

      subtitle: {
        //use subtitle element for our table notes
        text:
        "Notes: The IRS does not report any county pairings with fewer than ten migrants due to confidentiality concerns (this does not apply to net flows, which are outflows subtracted from inflows). Each year shown is the second year of a year pairing (e.g. 2012 represents returns matched from 2011-2012). The 2015 data are excluded due to data quality issues that year. <br/>Source: JCHS tabulations of IRS, SOI Migration Data.",
        widthAdjust: -300,
        align: "left",
        x: 300,
        y: -50, //may have to change this, depending on lenght of notes
        verticalAlign: "bottom",
        style: {
          color: "#999999",
          fontSize: "9px"
        }
      },

      //main title of chart
      title: {
        text:
        'Net Flows, ' + selected_year,
        style: {
          color: "#C14D00",
          fontWeight: 600,
          fontSize: "18px"
        }
      },

      legend: { //Base netflow map legend
        title: {
          text: "Net flow of migrants<br />"
        },
        layout: "vertical",
        align: "right",
        verticalAlign: "middle",
        y: 110,
        x: 10,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        labelFormatter: function() {
          if ((this.from != null) & (this.to != null)) { //legend entries w/ upper & lower bound
            return this.from + " to " + this.to
          } else if (this.to != null) { //lowest legend entry
            return "Lower than " + this.to
          } else if (this.from != null) { //highest legend entry
            return "More than " + this.from
          }
        }
      },

      //define value ranges for the data
      colorAxis: {
        dataClasses: data_classes_netflow
      },

      series: [
        {
          type: "map",
          name: 'county map',
          mapData: counties,
          //allAreas: false,
          data: map_data,
          joinBy: ["fips", 0],
          keys: ["fips", "value"],
          allowPointSelect: true,
          nullInteraction: true,
          states: {
            select: { color: "#000" } //highlights selected county
          },
          point: {
            events: {
              click: function(event) {
                console.log("clicked on map: " + event.point.name)
                selected_metro = event.point.fips
                selected_metro_name = event.point.name
                focusMetro(event.point.fips, event.point.name)

              },
            } //end events
          } //end point
        },
        {
          type: "mapline",
          name: "State borders",
          data: states,
          color: "#333",
          lineWidth: 2,
          tooltip: { //make tooltip not show up for 'state borders'
            enabled: false
          }
        }
      ],

      tooltip: {
       formatter: function() {
          if (this.point.value != null) {
            return (
              "<b>" 
              + this.point.name
              + "</b><br/>"
              + 'Migrants'
              //+ this.series.name
              + ": "
              + this.point.value.toLocaleString() 
            )
          } else if (this.point.name != null) {
            return (
              '<b>' 
              + this.point.name
              + '</b>'
            )
          } else {
            return false
          }
        }
      },

      /*~~~~~~Exporting options~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
      exporting: {
        enabled: true,
        filename: "County-level Domestic Migration",
        menuItemDefinitions: {
          /*downloadFullData: {
            text: "Download full dataset (Excel)",
            onclick: function() {
              window.open("http://www.jchs.harvard.edu/")
              alert("See tab A-1 for data from this chart")
            }
          }*/
        },
        buttons: {
          contextButton: {
            text: "Export",
            menuItems: [
              "printChart",
              "downloadPDF",
              "separator",
              "downloadPNG",
              "downloadJPEG"
              //'separator',
              //'downloadFullData'
            ],
            theme: {
              fill: "#ffffff00"
            }
          }
        }
      } //end exporting
      
    }) //end map

  }) //end get request
  
} //end createMap()




/*~~~~ change data to focus on metro ~~~~~~~~~~~~~~~~~~~~~~~~*/
function focusMetro(GEOID, name) {

  console.log(GEOID + ' ' + name)

  if (selected_flow === 'Netflows') {
    selected_flow = 'Inflows'
    $('.flowButton').removeClass('selectedButton')
    $('#inflow_button').addClass('selectedButton')
  }

  var new_data = []
  var dest_counties_data = {}
  
  //pull out single-county flow data from flow-year sheet
  flow_data[selected_flow + selected_year].forEach(function (el) {
    if (el[0] == GEOID) {
      dest_counties_data[el[1]] = el[2]
    } 
  })

  //create data object equal in length to full map data
  map_data.forEach(function (x) {
    if ( dest_counties_data.hasOwnProperty(x.fips)) {
      new_data.push(
        {
          fips: x.fips,
          value: dest_counties_data[x.fips]
        }
      )
    } else {
      new_data.push(
        {
          fips: x.fips,
          value: null
        }
      )
    }
  })

  if (!$.isEmptyObject(dest_counties_data)) {
    map.series[0].setData(new_data)
    map.update({
      title: {
        text: name + ' County<br/>' + selected_flow + ', ' + selected_year
      }
    })
    map.update({
      legend: {
        title: {
          text: 'Number of <br> domestic migrants'
        }
      },
      colorAxis: {
        dataClasses: data_classes_inflow_outflow
      }
    })

  } else {
    var null_data = []
    map_data.forEach(function (el, idx) {
      null_data.push([el.fips, null])
    })
    map.series[0].setData(null_data)
    map.renderer.label('There are no data for this county',270,270,'callout',10,10)
      .css({
      color: '#FFFFFF'
    })
      .attr({
      fill: 'rgba(0, 0, 0, 0.75)',
      padding: 8,
      r: 5,
      zIndex: 6,
      id: 'noData_popover'
    })
      .add()

    setTimeout(function() {
      $('#noData_popover').fadeOut('fast') 
    }, 1000)

    setTimeout(function() { 
      $('#noData_popover').remove() 
    }, 1300)
  }

  //add button to clear the selection
  if (!$('#clear_button').length) {
    map.renderer.button('Clear selection',450,450)
      .attr({
      padding: 7,
      id: 'clear_button'
      })
      .add()

    $('#clear_button').click(function () { 
      netflowMap()
      selected_metro = ''
      selected_metro_name = ''
      $('#clear_button').remove()
    })
  }

}//end focusMetro()


$('#select_year').change(function () {
  selected_year = $('#select_year').val()

  if (selected_flow != 'Netflows') {
    var flow_load_result = getFlowData(selected_flow, selected_year)

    if (selected_metro !== '' & flow_load_result === 'data already loaded') {
      focusMetro(selected_metro, selected_metro_name)
    } 
  } else {
    netflowMap()
    getFlowData('Inflows', selected_year, false)
  }

})


$('#inflow_button').click(function () {
  selected_flow = 'Inflows'
  
  $('.flowButton').removeClass('selectedButton')
  $(this).addClass('selectedButton')
  
  var flow_load_result = getFlowData(selected_flow, selected_year)
  
  if (selected_metro !== '' & flow_load_result === 'data already loaded') {
    focusMetro(selected_metro, selected_metro_name)
  }
  
})


$('#outflow_button').click(function () {
  selected_flow = 'Outflows'
  
  $('.flowButton').removeClass('selectedButton')
  $(this).addClass('selectedButton')
  
  var flow_load_result = getFlowData(selected_flow, selected_year)
  
  console.log(flow_load_result)
  
  if (selected_metro !== '' & flow_load_result === 'data already loaded') {
    focusMetro(selected_metro, selected_metro_name)
  }
   
})


$('#netflow_button').click(function () {
  selected_flow = 'Netflows'
  
  $('.flowButton').removeClass('selectedButton')
  $(this).addClass('selectedButton')
  
  selected_metro = ''
  netflowMap()
  $('#clear_button').remove()
})


function getFlowData(flow, year, show_loading) {
  if (!flow_data[flow + year]) {

    if (typeof map !== 'undefined' & show_loading != false) {
      map.showLoading('Loading data...')
    }
    
    console.log(Sheet_IDs['SheetID_' + year])

    new_range = year + '%20' + flow + '!A:C'
    console.log(new_range)

    new_requestURL = baseURL 
      + Sheet_IDs['SheetID_' + year] 
      + "/values/" 
      + new_range 
      + "?key=" 
      + API_Key 
      + "&" 
      + API_params


    $.get(new_requestURL, function(obj) {
      console.log(new_requestURL)

      flow_data[flow + year] = obj.values
      
      if (selected_metro != '') {
        focusMetro(selected_metro, selected_metro_name)
      }
      
      map.hideLoading()
    
    })
    
    return 'new data retrieved'
    
  } else {
    
    return 'data already loaded'
    
  }
  
}


function resetMap() {
  selected_metro = ''
  map.series[0].setData(map_data)
  map.update({title: {text: 'Net Flows, 2016'}})
  map.update({
    legend: {
      title: {
        text: 'Net flow of migrants'
      }
    },
    colorAxis: { 
      dataClasses: data_classes_netflow
    }
  })
}


function netflowMap() {
  var new_data = []

  flow_data['Netflows'].forEach(function (el, idx) {
    if (el[0] == selected_year) {
      new_data.push([el[1], el[2]])
    } 
  })

  map.series[0].setData(new_data)
  map.update({title: {text: 'Net Flows, ' + selected_year}})
  map.update({
    legend: {
      title: {
        text: 'Net flow of migrants'
      }
    },
    colorAxis: { 
      dataClasses: data_classes_netflow
    }
  })  
}
