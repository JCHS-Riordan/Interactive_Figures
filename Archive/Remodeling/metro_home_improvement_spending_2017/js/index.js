var H = Highcharts;

var sheetID = '1DNqj_TOBkbh06XAXNiIQLQEkR3l-HfUr06hadH8ANnY';
var range = 'Sheet3!A:BA';

var chart_title = 'Metropolitan Home Improvement Spending: 2017';
var legend_title = '';

var table_notes = '';
table_notes += '<p>Notes: Data are for 25 metros available in the 2017 AHS, including the 15 largest by population. Size of dot corresponds to aggregate home improvement spending within each metro. Discretionary home improvement projects include kitchen and bath remodels, room additions, and outside attachments (deck, porch, patio, garage, and carport). Replacement projects include roofing, siding, windows, doors, flooring, paneling, ceiling, insulation, and home systems and equipment (plumbing, electrical, HVAC, and appliances). Other projects include improvements to the lot or yard (driveways, walkways, fencing, walls, shed, detached garage, septic, swimming pool or other recreational structure, and landscaping) and disaster repairs. Recent movers include owners who moved in 2015, 2016, or 2017.</p>';

table_notes += '<p>Source: JCHS tabulations of US Department of Housing and Urban Development (HUD), 2017 American Housing Survey.</p>';

var export_filename = "Older Adult Housing Cost Burdens - Harvard JCHS - State of the Nation's Housing 2018";

var default_selection = 'totalSpending';

var categories = [],
ref_data = [],
selected_data = [],
chart_options = {},
chart = {},
drilldown_chart = {};

var state = { smallMap: false };
var categories = {
  homeowners: 'Number of Homeowners', // (Thousands)', 
  ownersReportingProjects: 'Homeowners Reporting Projects', // (Thousands)', 
  averageSpending: 'Average Per Owner Spending', // ($)',
  totalSpending: 'Total Expenditures', // (Billions of $)',
  discretionary: 'Discretionary Share', // (%)', 
  replacement: 'Replacement Share', // (%)', 
  other: 'Other Share', // (%)', 
  medianHomeValue: 'Median Home Value', // ($)', 
  recentMovers: 'Recent Movers Share of Owners' // (Since 2015) (%)'
};

var metro_data = [
{
  name: "Atlanta, GA",
  MSA_name: "Atlanta-Sandy Springs-Roswell, GA",
  lat: 33.693728,
  lon: -84.399911,
  homeowners: 1314.33871,
  ownersReportingProjects: 387.4232965,
  averageSpending: 2760,
  totalSpending: 3.62333871320304,
  discretionary: 26.8703877123526,
  replacement: 57.0257030673936,
  other: 16.1039084703303,
  medianHomeValue: 200000,
  recentMovers: 17.6787307563872,
  dataLabels: {
    align: "left",
    x: 10 } },

{
  name: "Baltimore, MD",
  MSA_name: "Baltimore-Columbia-Towson, MD",
  lat: 39.304361,
  lon: -76.549501,
  homeowners: 678.582,
  ownersReportingProjects: 198.797,
  averageSpending: 4160,
  totalSpending: 2.821628100168,
  discretionary: 38.5155763360861,
  replacement: 48.3901956217504,
  other: 13.0942280422184,
  medianHomeValue: 300000,
  recentMovers: 14.594160382362,
  dataLabels: {
    align: "left",
    x: 7,
    y: 4 } },

{
  name: "Birmingham, AL",
  MSA_name: "Birmingham-Hoover, AL",
  lat: 33.462372,
  lon: -86.814338,
  homeowners: 305.367,
  ownersReportingProjects: 89.804,
  averageSpending: 3360,
  totalSpending: 1.0249296763455,
  discretionary: 29.290632912857,
  replacement: 51.8643837913962,
  other: 18.8449832955955,
  medianHomeValue: 156000,
  recentMovers: 13.6893675702033,
  dataLabels: {
    align: "right",
    x: -3 } },

{
  name: "Boston, MA",
  MSA_name: "Boston-Cambridge-Newton, MA-NH",
  lat: 42.517606,
  lon: -71.021993,
  homeowners: 1138.81499,
  ownersReportingProjects: 319.564803,
  averageSpending: 4590,
  totalSpending: 5.22294025747211,
  discretionary: 39.1798752385344,
  replacement: 48.276513997693,
  other: 12.5436104256938,
  medianHomeValue: 450000,
  recentMovers: 14.3670921089027,
  dataLabels: {
    align: "left",
    x: 13 } },

{
  name: "Chicago, IL",
  MSA_name: "Chicago-Naperville-Elgin, IL-IN-WI",
  lat: 41.823521,
  lon: -87.828297,
  homeowners: 2288.35646,
  ownersReportingProjects: 658.653185,
  averageSpending: 3580,
  totalSpending: 8.20332364836645,
  discretionary: 25.2418647632996,
  replacement: 45.7511542140462,
  other: 29.006982031885,
  medianHomeValue: 200000,
  recentMovers: 14.7318348343014,
  dataLabels: {
    align: "right",
    x: -20,
    y: 10 } },

{
  name: "Dallas-Fort Worth, TX",
  MSA_name: "Dallas-Fort Worth-Arlington, TX",
  lat: 32.822558,
  lon: -97.025131,
  homeowners: 1504.47732,
  ownersReportingProjects: 425.6493125,
  averageSpending: 4090,
  totalSpending: 6.15167920267182,
  discretionary: 23.0037380196632,
  replacement: 55.1189750302481,
  other: 21.8772870764897,
  medianHomeValue: 200000,
  recentMovers: 20.2671253331639,
  dataLabels: {
    align: "right",
    x: -18 } },

{
  name: "Detroit, MI",
  MSA_name: "Detroit-Warren-Dearborn, MI",
  lat: 42.721848,
  lon: -83.200846,
  homeowners: 1195.95783,
  ownersReportingProjects: 362.542008,
  averageSpending: 2440,
  totalSpending: 2.92092247368152,
  discretionary: 29.9006607927465,
  replacement: 56.4237155303479,
  other: 13.6756230420489,
  medianHomeValue: 175000,
  recentMovers: 16.0189096973154,
  dataLabels: {
    align: "right",
    x: -8,
    y: -3 } },

{
  name: "Houston, TX",
  MSA_name: "Houston-The Woodlands-Sugar Land, TX",
  lat: 29.749593,
  lon: -95.353642,
  homeowners: 1432.18104,
  ownersReportingProjects: 372.4917485,
  averageSpending: 3440,
  totalSpending: 4.92117149463026,
  discretionary: 24.6541476851808,
  replacement: 48.4056768684012,
  other: 26.9401757472459,
  medianHomeValue: 200000,
  recentMovers: 16.6530277946712,
  dataLabels: {
    align: "left",
    x: 10,
    y: -8 } },

{
  name: "Las Vegas, NV",
  MSA_name: "Las Vegas-Henderson-Paradise, NV",
  lat: 36.214257,
  lon: -115.013812,
  homeowners: 397.669,
  ownersReportingProjects: 122.328,
  averageSpending: 2720,
  totalSpending: 1.081355860884,
  discretionary: 31.2032368613458,
  replacement: 50.9455893935548,
  other: 17.8511737495444,
  medianHomeValue: 250000,
  recentMovers: 24.4545278976918,
  dataLabels: {
    align: "left",
    x: 3 } },

{
  name: "Los Angeles, CA",
  MSA_name: "Los Angeles-Long Beach-Anaheim, CA",
  lat: 34.109024,
  lon: -118.182549,
  homeowners: 2114.80704,
  ownersReportingProjects: 537.502445,
  averageSpending: 4090,
  totalSpending: 8.64062876552748,
  discretionary: 40.0411614606201,
  replacement: 42.8403629008162,
  other: 17.1184762584045,
  medianHomeValue: 560000,
  recentMovers: 13.671848069351,
  dataLabels: {
    align: "right",
    x: 3,
    y: -20 } },

{
  name: "Miami, FL",
  MSA_name: "Miami-Fort Lauderdale-West Palm Beach, FL",
  lat: 26.101828,
  lon: -80.478755,
  homeowners: 1236.6637,
  ownersReportingProjects: 304.0616685,
  averageSpending: 2340,
  totalSpending: 2.89381289081885,
  discretionary: 31.9753769510055,
  replacement: 53.0709111908354,
  other: 14.9537111734573,
  medianHomeValue: 275000,
  recentMovers: 15.5953069537013,
  dataLabels: {
    align: "left",
    x: 7 } },

{
  name: "Minneapolis, MN",
  MSA_name: "Minneapolis-St. Paul-Bloomington, MN-WI",
  lat: 45.061179,
  lon: -93.3516,
  homeowners: 971.869,
  ownersReportingProjects: 337.702,
  averageSpending: 5250,
  totalSpending: 5.1064394860823,
  discretionary: 32.4690947799779,
  replacement: 46.2930067232679,
  other: 21.2378984967542,
  medianHomeValue: 200000,
  recentMovers: 16.2720490107206,
  dataLabels: {
    align: "center",
    y: -15 } },

{
  name: "New York City, NY",
  MSA_name: "New York-Newark-Jersey City, NY-NJ-PA",
  lat: 40.898788,
  lon: -73.90313,
  homeowners: 3784.23553,
  ownersReportingProjects: 778.882695,
  averageSpending: 3220,
  totalSpending: 12.1848533361156,
  discretionary: 35.4530229521339,
  replacement: 51.4885275928004,
  other: 13.058450097127,
  medianHomeValue: 400000,
  recentMovers: 12.7946582605654,
  dataLabels: {
    align: "left",
    x: 35 } },

{
  name: "Oklahoma City, OK",
  MSA_name: "Oklahoma City, OK",
  lat: 35.430968,
  lon: -97.506966,
  homeowners: 325.558,
  ownersReportingProjects: 108.402,
  averageSpending: 3490,
  totalSpending: 1.1371678107306,
  discretionary: 25.9628802459511,
  replacement: 49.5676878479612,
  other: 24.4694319062695,
  medianHomeValue: 150000,
  recentMovers: 19.3024946361407,
  dataLabels: {
    align: "right",
    x: -5 } },

{
  name: "Philadelphia, PA",
  MSA_name: "Philadelphia-Camden-Wilmington, PA-NJ-DE-MD",
  lat: 39.89513,
  lon: -75.312003,
  homeowners: 1574.1203,
  ownersReportingProjects: 460.785376,
  averageSpending: 3150,
  totalSpending: 4.95553833934751,
  discretionary: 33.871680582344,
  replacement: 54.3680193513147,
  other: 11.7602991141291,
  medianHomeValue: 235000,
  recentMovers: 12.5872209385776,
  dataLabels: {
    align: "right",
    x: -13 } },

{
  name: "Phoenix, AZ",
  MSA_name: "Phoenix-Mesa-Scottsdale, AZ",
  lat: 33.185765,
  lon: -112.067862,
  homeowners: 1092.30428,
  ownersReportingProjects: 325.688829,
  averageSpending: 3070,
  totalSpending: 3.34920067644374,
  discretionary: 31.1347781178228,
  replacement: 49.8498363855995,
  other: 19.0153858674154,
  medianHomeValue: 240000,
  recentMovers: 22.3263334219228,
  dataLabels: {
    align: "left",
    x: 9 } },

{
  name: "Richmond, VA",
  MSA_name: "Richmond, VA",
  lat: 37.531399,
  lon: -77.476009,
  homeowners: 314.957,
  ownersReportingProjects: 98.204,
  averageSpending: 4100,
  totalSpending: 1.2923017989635,
  discretionary: 36.2741282575728,
  replacement: 42.6904733216138,
  other: 21.0353984208134,
  medianHomeValue: 230000,
  recentMovers: 16.2004480605949,
  dataLabels: {
    align: "right",
    x: -4,
    y: 5 } },

{
  name: "Riverside, CA",
  MSA_name: "Riverside-San Bernardino-Ontario, CA",
  lat: 34.537534,
  lon: -116.130921,
  homeowners: 835.207749,
  ownersReportingProjects: 183.4022445,
  averageSpending: 2230,
  totalSpending: 1.861537063549,
  discretionary: 30.7454676577633,
  replacement: 47.2582736507208,
  other: 21.996258691516,
  medianHomeValue: 340000,
  recentMovers: 18.9012625242799,
  dataLabels: {
    align: "left",
    x: 5 } },

{
  name: "Rochester, NY",
  MSA_name: "Rochester, NY",
  lat: 43.148038,
  lon: -77.523257,
  homeowners: 295.32,
  ownersReportingProjects: 94.724,
  averageSpending: 3330,
  totalSpending: 0.982658045136,
  discretionary: 34.6029121602242,
  replacement: 47.8563706048321,
  other: 17.5407172349963,
  medianHomeValue: 135000,
  recentMovers: 11.8669261364444,
  dataLabels: {
    align: "right",
    x: 0,
    y: -4 } },

{
  name: "San Antonio, TX",
  MSA_name: "San Antonio-New Braunfels, TX",
  lat: 29.43306,
  lon: -98.606973,
  homeowners: 500.417,
  ownersReportingProjects: 167.711,
  averageSpending: 4270,
  totalSpending: 2.1353873790303,
  discretionary: 19.0218557202161,
  replacement: 48.162920364097,
  other: 32.8152239155901,
  medianHomeValue: 155000,
  recentMovers: 18.7627883294179,
  dataLabels: {
    align: "right",
    x: -7 } },

{
  name: "San Francisco, CA",
  MSA_name: "San Francisco-Oakland-Hayward, CA",
  lat: 37.773718,
  lon: -122.274432,
  homeowners: 932.312814,
  ownersReportingProjects: 258.829081,
  averageSpending: 5140,
  totalSpending: 4.78782477384503,
  discretionary: 47.612099250798,
  replacement: 30.5998414395248,
  other: 21.7880594103198,
  medianHomeValue: 855000,
  recentMovers: 14.3996628599328,
  dataLabels: {
    align: "left",
    x: 13,
    y: -2 } },

{
  name: "San Jose, CA",
  MSA_name: "San Jose-Sunnyvale-Santa Clara, CA",
  lat: 36.908472,
  lon: -121.371372,
  homeowners: 360.585,
  ownersReportingProjects: 94.927,
  averageSpending: 4840,
  totalSpending: 1.746518472099,
  discretionary: 44.1504583479118,
  replacement: 38.4762741481449,
  other: 17.3732675052453,
  medianHomeValue: 900000,
  recentMovers: 13.1538313061623,
  dataLabels: {
    align: "left",
    x: 5,
    y: 2 } },

{
  name: "Seattle, WA",
  MSA_name: "Seattle-Tacoma-Bellevue, WA",
  lat: 47.490599,
  lon: -121.833996,
  homeowners: 872.098909,
  ownersReportingProjects: 255.6587065,
  averageSpending: 3740,
  totalSpending: 3.2653025134287,
  discretionary: 34.0997812417401,
  replacement: 50.0560052121216,
  other: 15.8442131320221,
  medianHomeValue: 425000,
  recentMovers: 18.2966060386041,
  dataLabels: {
    align: "left",
    x: 10 } },

{
  name: "Tampa, FL",
  MSA_name: "Tampa-St. Petersburg-Clearwater, FL",
  lat: 28.125907,
  lon: -82.465286,
  homeowners: 764.788,
  ownersReportingProjects: 209.983,
  averageSpending: 3430,
  totalSpending: 2.626559610044,
  discretionary: 32.8150859764287,
  replacement: 46.7171399197986,
  other: 20.4677741039695,
  medianHomeValue: 190000,
  recentMovers: 19.9519788364825,
  dataLabels: {
    align: "right",
    x: -7 } },

{
  name: "Washington, DC",
  MSA_name: "Washington-Arlington-Alexandria, DC-VA-MD-WV",
  lat: 38.816928,
  lon: -77.448228,
  homeowners: 1377.07412,
  ownersReportingProjects: 449.0401625,
  averageSpending: 4860,
  totalSpending: 6.69736328601298,
  discretionary: 34.2410493295579,
  replacement: 53.1247238631456,
  other: 12.6342264884854,
  medianHomeValue: 410000,
  recentMovers: 16.7642031754137,
  dataLabels: {
    align: "right",
    x: -17 } }];




/*~~~~~~~ Document ready function ~~~~~~~*/
$(document).ready(function () {
  //get Google sheet data
  //$.get(H.JCHS.requestURL(sheetID, range), function(obj) {
  //categories = obj.values[0]
  //ref_data = obj.values.slice(1)

  //create the title, notes, and search box
  $('#chart_title').html(chart_title);
  $('#table_notes').html(table_notes);

  //H.JCHS.createSearchBox(ref_data, searchCallback, '', 1, 'search')

  //create the chart
  createChart();

  //}) 
}); //end document.ready


function createChart() {

  metro_data.forEach(function (metro) {
    metro.z = metro[default_selection];
  });

  /*~~~~~~~ Chart Options ~~~~~~~*/
  chart_options = {
    JCHS: {
      drilldownFunction: drilldownChart },


    chart: {
      events: {
        load: function () {
          initUserInteraction();
        } },


      map: 'countries/us/us-all' },



    legend: {
      enabled: false },


    series: [
    {
      name: 'United States',
      data: Highcharts.
      geojson(Highcharts.maps['countries/us/us-all']).
      filter(x => x.name !== "Alaska" & x.name !== "Hawaii"),
      showInLegend: false },

    {
      name: categories[default_selection],
      type: 'mapbubble',
      dataLabels: {
        allowOverlap: true,
        enabled: true,
        formatter: function () {
          return this.point.name.split(",")[0];
        },
        crop: false,
        overflow: 'none' },
      //*/
      data: metro_data,
      maxSize: '10%',
      minSize: 5,
      sizeBy: 'width',
      showInLegend: false }],

    //end series

    // Exporting options
    exporting: {
      filename: export_filename,
      JCHS: { sheetID: sheetID },
      chartOptions: {
        chart: {
          //marginBottom: 130 //may have to adjust to fit all of the notes
        },
        title: { text: chart_title },
        legend: {
          //y: -45 //may have to adjust to fit all of the notes
        } },

      buttons: {
        contextButton: {
          text: '' } } },


    //end exporting

    tooltip: {
      formatter: function () {

        var tooltip_text = '';
        tooltip_text += '<div class="JCHS-chart__tooltip__z-value">$' + H.JCHS.numFormat(this.point.z, 2) + 'B</div>';
        tooltip_text += '<b>' + this.series.name + '</b>';
        tooltip_text += '<br><i>' + this.point.name + '</i>';

        tooltip_text += '<br><div class="JCHS-chart__tooltip__more-info">Click for more...</div>';

        return tooltip_text;

      } }

    //end chart_options

    /*~~~~~~~ Create Chart ~~~~~~~*/ };
  chart = Highcharts.mapChart(
  'container',
  chart_options);
  //end chart

} //end createChart()

/*~~~~~~~~~~~~~~ User interaction ~~~~~~~~~~~~~~~~~~~*/
function initUserInteraction() {
  /*
                                $('#user_input').on('change', function () {
                                  var new_col = parseInt($('#user_input :checked').val())
                                  var new_data = ref_data.map(function (x) {
                                    return [x[0], x[new_col]]
                                  })
                                  chart.series[0].update({name: categories[new_col]})   
                                  chart.series[0].setData(new_data)
                                })
                                */
}

function searchCallback(metro_name) {
  /*
                                     H.JCHS.mapLocatorCircle(chart, metro_name)
                                     */
}

function resetMap() {
  this.destroy();
  $('#infobox').empty();
  state.smallMap = false;

  chart.series[1].update({ dataLabels: { enabled: true } }, false);
  chart.update({ exporting: { enabled: true } }, false);
  chart.update({ chart: { width: $('#container').width() } });

}

function drilldownChart(metro_name) {
  console.log(metro_name);

  chart.update({ exporting: { enabled: false } }, false);
  chart.series[1].update({ dataLabels: { enabled: false } });
  if (state.smallMap == false) {
    button = chart.renderer.
    button('Expand Map', 330, 35, resetMap).
    attr({ padding: 7 }).
    add();
  }

  state.smallMap = true;

  $('#infobox').empty();

  metro_data.forEach(function (metro) {
    if (metro.name == metro_name) {
      $('#infobox').append('<div class="JCHS-chart__infobox__title">' + metro_name + '</div>');
      $('#infobox').append('<div>' + categories.homeowners.split(' (')[0] + ': ' + H.JCHS.numFormat(metro.homeowners, 0) + ',000</div>');
      $('#infobox').append('<div>' + categories.ownersReportingProjects.split(' (')[0] + ': ' + H.JCHS.numFormat(metro.ownersReportingProjects, 0) + ',000</div>');
      $('#infobox').append('<div>' + categories.averageSpending.split(' (')[0] + ': $' + H.JCHS.numFormat(metro.averageSpending, 0) + '</div>');
      $('#infobox').append('<div>' + categories.totalSpending.split(' (')[0] + ': $' + H.JCHS.numFormat(metro.totalSpending, 1) + 'B</div>');
      $('#infobox').append('<div>' + categories.discretionary.split(' (')[0] + ': ' + H.JCHS.numFormat(metro.discretionary, 0) + '%</div>');
      $('#infobox').append('<div>' + categories.replacement.split(' (')[0] + ': ' + H.JCHS.numFormat(metro.replacement, 0) + '%</div>');
      $('#infobox').append('<div>' + categories.other.split(' (')[0] + ': ' + H.JCHS.numFormat(metro.other, 0) + '%</div>');
      $('#infobox').append('<div>' + categories.medianHomeValue.split(' (')[0] + ': $' + H.JCHS.numFormat(metro.medianHomeValue, 0) + '</div>');
      $('#infobox').append('<div>' + categories.recentMovers.split(' (')[0] + ': ' + H.JCHS.numFormat(metro.recentMovers, 1) + '%</div>');
      $('#infobox').append('<div>&nbsp;</div>');
    } //end if
  }); //end forEach

  if (chart.chartWidth > 500) {
    chart.update(
    { chart: { width: 500 } },
    true,
    false,
    { duration: 400 });

  }

} //end drilldownChart()

(function (H) {

  H.JCHS.mapOptions = {

    chart: {
      margin: [10, 5, 10, 5],
      marginTop: 10, //needed to override individual settings as well
      marginBottom: 10 //needed to override individual settings as well
    }, //end chart

    plotOptions: {
      map: {
        allAreas: false,
        allowPointSelect: true,
        joinBy: ['GEOID', 0],
        keys: ['GEOID', 'value'] },
      //end plotOptions.map

      mapline: { enableMouseTracking: false } },

    //end plotOptions

    colorAxis: {
      dataClassColor: 'category' },
    //end colorAxis

    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'bottom',
      x: 10,
      padding: 5,
      labelFormatter: function () {
        if (!this.hasOwnProperty('from')) {
          return 'Under ' + this.to;
        } else if (!this.hasOwnProperty('to')) {
          return this.from + ' or Over';
        } else {
          return this.from + ' – ' + this.to;
        }
      } },
    //end legend

    mapNavigation: {
      enabled: true },


    exporting: {
      buttons: {
        contextButton: {
          text: 'Export',
          menuItems: [
          'viewFullDataset',
          //'viewSortableTable',
          'separator',
          'printChart']








          //end contextButton
        } //end buttons
      } } //end exporting
    //end mapOptions
  };
  H.setOptions(H.JCHS.mapOptions);

  // Fire drilldownFunction when user clicks on map
  H.Chart.prototype.callbacks.push(function (chart) {
    if (chart.options.chart.type === "map") {
      if (chart.options.JCHS.drilldownFunction) {
        chart.update({
          plotOptions: {
            series: {
              point: {
                events: {
                  click: function (event) {

                    //JCHS shapefiles call it GEOID, Highcharts shapefiles (e.g., counties) call it fips
                    var GEOID = H.pick(event.point.GEOID, event.point.fips);

                    chart.options.JCHS.drilldownFunction(event.point.name, GEOID, event.point);
                  }
                  //end events
                } //end point 
              } //end series
            } //end plotOptions
          } }); //end chart.update
      } //end if
    } //end if
  }); //end callbacks.push

})(Highcharts);