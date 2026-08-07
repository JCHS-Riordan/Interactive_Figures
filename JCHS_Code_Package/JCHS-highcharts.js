'use strict';

/**
* @namespace JCHS
*/

(function (H) {

  var JCHS = {

    /*
     * Embedded as a base64 data URI (not a remote URL) because the export logo is drawn
     * onto the export-only chart clone and Highcharts' client-side PNG/JPEG export loads
     * every chart image with crossOrigin="Anonymous" before rasterizing it to canvas.
     * www.jchs.harvard.edu does not send Access-Control-Allow-Origin on this file, so the
     * image silently fails to load under crossOrigin and gets dropped from the exported
     * image (confirmed: a plain <img crossorigin="anonymous"> load of the remote URL fires
     * onerror in-browser). A data URI has no origin to restrict, so it always loads.
     */
    logoURL: 'data:image/png;base64,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',

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
    //font-size/color set inline (not just via the JCHS-chart__table-notes--exporting class) because this
    //element only ever exists on the export-only chart clone, and Highcharts' export SVG generation can't
    //read this package's CSS (loaded cross-origin) to bake its rules in, unlike elements already on the
    //live chart. Without this, the text falls back to the export SVG's default size (~16px) instead of
    //7.5px, throws off the getBBox()-based positioning below, and can spill into the logo's corner.
    var rendered_text = chart.renderer.text(text).css({ width: '420px', fontSize: '7.5px', color: '#666' }).addClass('JCHS-chart__table-notes--exporting').align({ align: 'right', verticalAlign: 'bottom', x: -10, y: 8 }).add();

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
   *        the amount in the input number. If omitted, decimals are capped at 2 (but a
   *        number with fewer native decimals, e.g. a whole-number count, still prints
   *        with no trailing zeros) — matching JCHS.numFormat's long-standing default.
   *
   * @returns {String} The formatted number.

   */

  JCHS.numFormat = function (number, decimals) {
    if (decimals === undefined) {
      var origDec = ((+number || 0).toString().split('.')[1] || '').length;
      decimals = Math.min(origDec, 2);
    }

    return H.numberFormat(number, decimals, '.', ',');
  }; //end numFormat


  /* Add JCHS functionality to Highcharts */

  //attach JCHS to main Highcharts object
  H.JCHS = JCHS;

  //set standard options as default for all charts
  H.setOptions(JCHS.standardOptions);

  //run on chart load
  H.addEvent(H.Chart, 'load', function () {
    var chart = this;

    if (chart.renderer.forExport) {

      //map charts draw an Alaska/Hawaii inset in the same bottom-left corner the logo
      //normally uses, which paints over it - place it bottom-right for maps instead.
      //(This has to be decided right here rather than in a second addEvent(H.Chart,'load',...)
      //listener in JCHS-highcharts--map.js: only the first-registered 'load' listener between
      //the two files actually runs for the export-clone chart, confirmed by testing - a second
      //one silently never fires for it, even though it fires normally for the on-screen chart.)
      var logoX = chart.options.chart.type === "map" ? chart.chartWidth - 170 : 0;
      chart.renderer.image(JCHS.logoURL, logoX, chart.chartHeight - 50, 170, 55).add();

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

  //draw y-axis titles in JCHS style on every chart render
  H.addEvent(H.Chart, 'render', function () {
    H.JCHS.yAxisTitle(this, this.options.JCHS.yAxisTitle, this.options.JCHS.yAxisTitle2);
  });

  //initialize modal popup behavior for map drilldown
  var modal = $('.JCHS-chart__modal');

  //hide the modal when the background is clicked
  modal.click(function () {
    modal.css('display', 'none');
  }).children().click(function (e) {
    e.stopPropagation();
  });

  $('.JCHS-chart__modal__close').click(function () {
    modal.css('display', 'none');
  });
})(Highcharts);
