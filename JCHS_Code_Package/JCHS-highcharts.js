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

    //this text is only ever shown on the static, non-interactive export image, so a clickable
    //link serves no purpose there - and more importantly, Highcharts' SVG text-wrapping can't
    //continue wrapping text that comes after an embedded <a> link, so everything following the
    //"Source:" hyperlink was rendering as one unbroken line that ran off the edge of the canvas
    //(and, since it spans the full width, straight through the logo's corner too). Stripping the
    //link and keeping just its visible text lets normal word-wrapping apply to the whole string.
    text = text.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1');

    //same problem with the manual <br/> before "Source:" - Highcharts' auto-wrap only measures
    //and inserts line breaks up to the first explicit <br/>, then stops, leaving everything after
    //it (the whole "Source:" line) unwrapped. Using a plain space instead lets the auto-wrap
    //treat the whole note as one continuous paragraph, so it keeps wrapping all the way through.
    text = text.replace(/<br\s*\/?>/gi, ' ');

    //map charts put the logo bottom-right instead of bottom-left (see the 'load' handler
    //below) - shift the notes' right edge to end before it, so the two don't overlap
    var noteX = chart.options.chart.type === "map" ? -180 : -10;

    //draw text
    //font-size/color set inline (not just via the JCHS-chart__table-notes--exporting class) because this
    //element only ever exists on the export-only chart clone, and Highcharts' export SVG generation can't
    //read this package's CSS (loaded cross-origin) to bake its rules in, unlike elements already on the
    //live chart. Without this, the text falls back to the export SVG's default size (~16px) instead of
    //7.5px, throws off the getBBox()-based positioning below, and can spill into the logo's corner.
    var rendered_text = chart.renderer.text(text).css({ width: '420px', fontSize: '7.5px', color: '#666' }).addClass('JCHS-chart__table-notes--exporting').align({ align: 'right', verticalAlign: 'bottom', x: noteX, y: 8 }).add();

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
