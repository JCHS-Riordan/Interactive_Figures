'use strict';

/**
* @namespace JCHS
*/

(function (H) {

  var JCHS = {

    logoURL: 'http://www.jchs.harvard.edu/sites/default/files/harvard_jchs_logo_2017.png',

    standardOptions: {
      lang: {
        thousandsSep: ",",
        contextButtonTitle: 'Export Chart',
        downloadPDF: 'Download as PDF',
        downloadCSV: 'Download chart data (CSV)',
        downloadXLS: 'Download chart data (Excel)'
      },

      chart: {
        spacing: [5, 5, 5, 5],
        marginTop: 40
      },

      title: { text: null },

      subtitle: { text: null },

      yAxis: {
        title: { text: null },
        labels: { format: '{value:,.0f}' },
        reversedStacks: false
      },

      credits: { enabled: false },

      tooltip: {
        enabled: true,
        useHTML: true,
        shared: true
      },

      plotOptions: {
        series: {
          connectNulls: true
        },
        spline: {
          marker: {
            enabled: false
          }
        }
      },

      exporting: {

        enabled: true,

        //default filename 
        filename: 'Chart - Harvard Joint Center for Housing Studies',

        chartOptions: {

          //make space for title at top and table notes at bottom
          chart: {
            spacingTop: 12,
            marginTop: 50,
            marginBottom: 130
          },

          title: {
            y: 8
          },

          //use subtitle element for our table notes on export
          subtitle: {
            widthAdjust: -170,
            x: 170,
            y: -28,
            align: 'left',
            verticalAlign: 'bottom'
          },

          series: { borderWidth: 0.5 },

          legend: { y: -45 }

        }, //end export.chartOptions

        //define menu item (functionality is added as a callback on chart load)
        menuItemDefinitions: {
          viewFullDataset: {
            text: 'View full dataset'
          }
        }, //end menuItemDefinitions

        buttons: {
          contextButton: {
            text: 'Export',
            menuItems: ['viewFullDataset',
            //'viewSortableTable',
            'separator', 'printChart', 'downloadPDF', 'separator', 'downloadPNG', 'downloadJPEG', 'separator', 'downloadXLS'] //end contextButtons
          } //end buttons

        } }, //end exporting

      navigation: {
        buttonOptions: {
          height: 20,
          symbolY: 8,
          symbolSize: 12,
          theme: { padding: 1 }
        } //end navigation
      } }, //end standardOptions

    drilldownOptions: {

      chart: {
        margin: undefined,
        marginTop: undefined,
        marginBottom: 40,
        marginLeft: 50,
        marginRight: 10
      },

      plotOptions: {
        series: {
          label: { enabled: false }
        }
      },

      legend: { enabled: false },

      mapNavigation: { enabled: false },

      exporting: { enabled: false }

    } //end drilldownOptions
    //end JCHS


    /**
     * @function #createSearchBox
     * @memberof JCHS
     *
     * @description Shorthand for createSearchBoxes(1, ...arguments). 
     * (i.e., this function is equivalent to calling createSearchBoxes with number_of_boxes = 1)
     *
     * @param {Array} data - Reference dataset for chart.
     * @param {Function} callback - Function called on seach_box `change` event. 
     * Passes the value of the search box as the only argument 
     * (i.e., $(`#search_input_${chart_slug}`).val()).
     * @param {String} chart_slug - Unique ID of chart, to ensure unique <div> 
     * ids in HTML.
     * @param {Number} [col_index] - Column index of data to be listed in the 
     * search box. Defaults to 0.
     * @param {String} [type] - 'dropdown' or 'search'. Only differences are 
     * 'dropdown' has a down arrow at the right side of the box and has 
     * placeholder text 'Select a metro...', while 'search' has no arrow 
     * and has placehold text  'Search for metro...'.
     * @param {String} [placeholder] - Override the default placeholder text. 
     * (e.g., 'Select a state...').
     *
     */

  };JCHS.createSearchBox = function (data, //eslint-disable-line no-unused-vars
  callback, //eslint-disable-line no-unused-vars
  chart_slug, //eslint-disable-line no-unused-vars
  col_index, //eslint-disable-line no-unused-vars
  type, //eslint-disable-line no-unused-vars
  placeholder) {
    //eslint-disable-line no-unused-vars

    JCHS.createSearchBoxes.apply(JCHS, [1].concat(Array.prototype.slice.call(arguments)));
  }; //end createSearchBox()


  /**
   * @function #createSearchBoxes
   * @memberof JCHS
   *
   * @description Add search box with filtered list to the page. Adds one item to the list 
   * for each unique value of a column from ref_data.
   *    
   * On clicking a list item, the passed callback function is called, which 
   * passes the value of the search box as the only argument 
   * (i.e., $(`#search_input_${chart_slug}`).val()).
   *
   * @param {Number} number_of_boxes - Number of search boxes to create (max of 8).
   * @param {Array} data - Reference dataset for chart.
   * @param {Function} callback - Function called on seach_box `change` event. 
   * Passes the value of the search box as the only argument 
   * (i.e., $(`#search_input_${chart_slug}`).val()).
   * @param {String} [chart_slug] - Unique ID of chart, to ensure unique <div> 
   * ids in HTML.
   * @param {Number} [col_index] - Column index of data to be listed in the 
   * search box. Defaults to 0.
   * @param {String} [type] - 'dropdown' or 'search'. Only differences are 
   * 'dropdown' has a down arrow at the right side of the box and has 
   * placeholder text 'Select a metro...', while 'search' has no arrow 
   * and has placehold text  'Search for metro...'.
   * @param {String|Array} [placeholder] - Override the default placeholder text. 
   * Pass as an array to have different placeholder text in each box. 
   * (e.g., 'Select a state...' or ['Select a state...', 'Select a county...']).
   *
   */

  JCHS.createSearchBoxes = function (number_of_boxes, data, callback) {
    var chart_slug = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
    var col_index = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
    var type = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'dropdown';
    var placeholder = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 'default';


    if (type === 'search' & placeholder === 'default') {
      placeholder = 'Search for metro...';
    }
    if (placeholder === 'default') {
      placeholder = 'Select a metro...';
    }

    //maximum of 8 search boxes
    number_of_boxes = Math.min(number_of_boxes, 8);

    //if chart slug is passed, prepend underscore for readability
    if (chart_slug !== '' & chart_slug.charAt(0) !== "_") {
      chart_slug = '_' + chart_slug;
    }

    //add each of the search boxes
    var counter = 0;
    while (counter < number_of_boxes) {
      //pass i as argument to anonmyous self-executing function so that it passes value not reference
      //see: https://stackoverflow.com/questions/2568966/how-do-i-pass-the-value-not-the-reference-of-a-js-variable-to-a-function
      (function (i) {

        //add text input box
        $('#search_box' + chart_slug).append('\n          <input id="search_input' + chart_slug + '_' + i + '" class="JCHS-chart__search-box__input" autocomplete="off">\n        ');

        var box = $('#search_input' + chart_slug + '_' + i);

        //add placeholder text
        if (Array.isArray(placeholder)) {
          box.attr('placeholder', placeholder[i]);
        } else {
          box.attr('placeholder', placeholder);
        }

        //remove down arrow from box if it is not a dropdown
        if (type != 'dropdown') {
          box.css('background-image', 'none');
        }

        //add a list element after the input box to contain the list of options (e.g., metros) 
        box.after('<ul id="search_list' + chart_slug + '_' + i + '" class="JCHS-chart__search-box__list"></ul>');
        var list = $('#search_list' + chart_slug + '_' + i);

        //get an unduplicated list of options for the list
        var dedup_data = [];
        data.forEach(function (el) {
          if (dedup_data.indexOf(el[col_index]) < 0) {
            dedup_data.push(el[col_index]);
          }
        });

        //add each option to the list
        dedup_data.forEach(function (el) {
          return list.append('<li>' + el + '</li>');
        });

        //when user clicks into the search box, hide the placeholder text and show the list of options
        box.on('focus', function () {
          box.val('');
          list.show();
        });

        //when user types a new letter, filter the list of options
        box.on('keyup focus', function () {
          var filter = box.val().toUpperCase(); //user input, made all uppercase to make comparison easier
          $('li').each(function () {
            //for each item of the list of options
            if ($(this).html().toUpperCase().indexOf(filter) > -1) {
              //indexOf() returns -1 if the filter string can't be found
              $(this).css('display', 'block'); //if the filter string can be found in the list item, keep displaying it
            } else {
              $(this).css('display', 'none'); //if not, hide the list item
            }
          });
        });

        //when value of input box changes, run the callback function with the selected items 
        // ("change" means the user hits enter or we trigger the 'change' event in the code, not just when a user types a new letter)
        box.on('change', function () {
          var params = [];

          //when any box changes, we collect all the selections from all the input boxes...
          $('.JCHS-chart__search-box').children('input').each(function () {
            params.push($(this).val());
          });
          //...and pass them to the callback fucntion
          callback.apply(undefined, params); //spread syntax passes each param as its own argument

          //then take the focus off the input box and hide the list of options
          box.blur();
          list.hide();
        }); //end box.on 'change'

        //when user clicks out of box, hide the list 
        box.on('blur', function () {
          list.hide();
        });

        //when user clicks on list item, make that selection the input box value and trigger a 'change' event
        list.on('mousedown', 'li', function (e) {
          box.val(e.target.innerHTML);
          box.change();
        });
      })(counter);

      counter++; //increment counter when each box is complete
    } //end while loop
  }; //end createSearchBoxes()

  /**
   * @function #yAxisTitle
   * @memberof JCHS
   * 
   * @description Add y-axis titles in JCHS style, horizontal above the chart.
   *
   * @param {Object} chart - Reference to chart object. (`this` if called from within Highcharts event function.)
   * @param {String} yAxis_title - Main y-axis title.
   * @param {String} [yAxis2_title] - Secondary (right) y-axis title.
   * 
   */

  JCHS.yAxisTitle = function (chart, yAxis_title, yAxis2_title) {
    chart.renderer.text(yAxis_title).addClass('highcharts-axis-title').align({ y: -5 }, false, 'plotBox').add();

    //add title to second yAxis, if it exists
    if (typeof yAxis2_title == 'string') {
      var yAxis2 = chart.renderer.text(yAxis2_title).addClass('highcharts-axis-title').align({ align: 'right', y: -5 }, false, 'plotBox').add();
      var box = yAxis2.getBBox();
      yAxis2.translate(-box.width, 0);
    }
  };

  /**
   * @function #responsiveAnnotation
   * @memberof JCHS
   *
   * @description Add annontation text that responsively changes font size.
   *
   * @param {Object} chart - Reference to chart object. (`this` if called from within Highcharts event function.)
   * @param {String} text - Text to draw on chart.
   * @param {Number} [x] - y adjust for text location. Default is 0.
   * @param {Number} [y] - y adjust for text location. Default is -20.
   * @param {String} [verticalAlign] - Vertical alignment of text. Default is 'bottom'.
   * @param {String} [align] - Horizontal alignment of text. Default is 'center'.
   * 
   * @example 
   * var rho_value = 'L(1) Ï = 0.53'
   * ...
   * chart: {
   *   events: {
   *     render: function() {
   *       H.JCHS.responsiveAnnotation(this, rho_value)
   *     }
   *   }
   * }
   * ...
   *
   */

  JCHS.responsiveAnnotation = function (chart, text) {
    var x = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var y = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : -20;
    var verticalAlign = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'bottom';
    var align = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'center';


    var existing_text = $('.JCHS-chart__text-annotation');
    if (existing_text != null) {
      existing_text.each(function (idx, x) {
        //use jQuery .each() to iterate on elements returned by jQuery query
        if (x.innerHTML.search(text) > -1) {
          x.remove();
        }
      });
    }

    var rendered_text = chart.renderer.text(text).addClass('JCHS-chart__text-annotation').align({ align: align, verticalAlign: verticalAlign, x: x, y: y }, false, 'plotBox').add();

    var box = rendered_text.getBBox();
    switch (align) {
      case 'center':
        rendered_text.translate(-box.width / 2, 0);
        break;
      case 'right':
        rendered_text.translate(-box.width, 0);
        break;
    }
  }; //end responsiveAnnotation()


  /**
   * @function #mapLocatorCircle
   * @memberof JCHS
   * 
   * @description Draw a circle animated to "zero in" on a location, based on 
   * a search value that corresponds to a point name in the series 
   * displayed on the map. Useful when called from the searchCallback 
   * function when a user selects a metro from the search dropdown.
   *
   * @param {Object} map_object - Object containing a Highcharts map.
   * @param {String} search_value - The name to search for on the map. 
   * Compares the search_value to the point.name for each point in the 
   * currently displayed series. 
   *
   */

  JCHS.mapLocatorCircle = function (map_obj, search_value) {
    map_obj.series[0].points.forEach(function (el, idx) {
      if (el.name == search_value) {
        map_obj.series[0].points[idx].select(true);

        map_obj.renderer.circle(map_obj.series[0].points[idx].plotX, //x
        map_obj.series[0].points[idx].plotY + map_obj.margin[0], //y
        150 //radius
        ).attr({
          fill: 'transparent',
          stroke: 'black',
          'stroke-width': 1
        }).animate({
          r: 0
        }).add().toFront();
      }

      setTimeout(function () {
        return map_obj.series[0].points[idx].select(false);
      }, 700);
    });
  }; //end mapLocatorCircle()


  /**
   * @function #requestURL
   * @memberof JCHS
   * 
   * @description Builds a GET request URL for the Google Sheets API, based on input
   * sheet ID and range.
   * 
   * @param {String} sheetID - Unique ID of the Google Sheet (e.g., 
            '1LxTyrgt7sTtRYzEr6BlTnKwpwoQPz5WiIrA8dpocgRM').
   * @param {String} [range] - The data range. Defaults to 'Sheet1'. Accepts 
   *        sheet ranges that conform to the Google API (e.g., 'Sheet1!A:F').
   *
   * @returns {String} A URL.
   *
   */

  JCHS.requestURL = function (sheetID) {
    var range = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Sheet1';

    var baseURL = 'https://sheets.googleapis.com/v4/spreadsheets/';
    var API_Key = 'AIzaSyDY_gHLV0A7liVYq64RxH7f7IYUKF15sOQ';
    var API_params = 'valueRenderOption=UNFORMATTED_VALUE';
    var requestURL = baseURL + sheetID + "/values/" + range + "?key=" + API_Key + "&" + API_params;

    console.log(requestURL);

    return requestURL;
  };

  /**
   * @function #addTableNotes
   * @memberof JCHS
   * 
   * @description add table notes to lower right of chart. Used when exporting, but can also be used on its own.
   *
   * @param {Object} chart - The chart object.
   * @param {String} [note] - Defaults to chart.options.exporting.JCHS.tableNotes but you can pass any text you like.
   *
   */

  JCHS.addTableNotes = function (chart, user_input_note) {

    if (chart.options.hasOwnProperty('JCHS') && chart.options.JCHS.hasOwnProperty('tableNotes')) {
      var chart_options_note = chart.options.JCHS.tableNotes;
    }

    var text = H.pick(user_input_note, chart_options_note, '');

    //draw text
    var rendered_text = chart.renderer.text(text).css({ width: '420px' }).addClass('JCHS-chart__table-notes--exporting').align({ align: 'right', verticalAlign: 'bottom', x: -10, y: 8 }).add();

    //align to lower right corner
    var box = rendered_text.getBBox();
    rendered_text.translate(-box.width, -box.height);
  }; //end addTableNotes()

  /**
   * @function #numFormat
   * @memberof JCHS
   * 
   * @description Format a number and return a string. Based on Highcharts.numberFormat().
   *
   * @param {Number} number - The input number to format.
   * @param {Number} [decimals] - The number of decimal places. A value of -1 preserves
   *        the amount in the input number. Defaults to -1.
   *
   * @returns {String} The formatted number.
  
   */

  JCHS.numFormat = function (number) {
    var decimals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;


    return H.numberFormat(number, decimals, '.', ',');
  }; //end numFormat


  /* Add JCHS functionality to Highcharts */

  //attach JCHS to main Highcharts object
  H.JCHS = JCHS;

  //set standard options as default for all charts
  H.setOptions(JCHS.standardOptions);

  //add callbacks to chart load
  H.Chart.prototype.callbacks.push(function (chart) {
    if (chart.renderer.forExport) {

      chart.renderer.image(JCHS.logoURL, 0, chart.chartHeight - 50, 170, 55).add();

      H.JCHS.addTableNotes(chart);
    }

    if (chart.options.exporting.hasOwnProperty('JCHS') && chart.options.exporting.JCHS.hasOwnProperty('sheetID')) {
      chart.update({
        exporting: {
          menuItemDefinitions: {
            viewFullDataset: {
              text: 'View full dataset',
              onclick: function onclick() {
                window.open('https://docs.google.com/spreadsheets/d/' + chart.options.exporting.JCHS.sheetID);
              }
            }
          }
        }
      });
    }
  });

  //add y-axis title draw to chart render event
  H.wrap(H.Chart.prototype, 'render', function (proceed) {
    //call original function
    proceed.apply(this, Array.prototype.slice.call(arguments, 1));
    //draw y-axis titles in JCHS style
    H.JCHS.yAxisTitle(this, this.options.JCHS.yAxisTitle, this.options.JCHS.yAxisTitle2);
  });
})(Highcharts);
