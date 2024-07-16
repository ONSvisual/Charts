import { addDataLabels, addAxisLabel } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let pymChild = null;
let graphic_data, size, svg;

function drawGraphic() {

  //population accessible summmary
  d3.select('#accessibleSummary').html(config.essential.accessibleSummary)

  let threshold_md = config.optional.mediumBreakpoint;
  let threshold_sm = config.optional.mobileBreakpoint;

  //set variables for chart dimensions dependent on width of #graphic
  if (parseInt(graphic.style("width")) < threshold_sm) {
    size = "sm"
  } else if (parseInt(graphic.style("width")) < threshold_md) {
    size = "md"
  } else {
    size = "lg"
  }

  let margin = config.optional.margin[size]
  let chart_width = parseInt(graphic.style("width")) - margin.left - margin.right;
  //height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion
  let height = (config.optional.seriesHeight[size] * graphic_data.length) + (10 * (graphic_data.length - 1)) + 12

  // clear out existing graphics
  graphic.selectAll("*").remove();

  //set up scales
  const x = d3.scaleLinear()
    .range([0, chart_width]);

  const y = d3.scaleBand()
    .paddingOuter(0.2)
    .paddingInner((graphic_data.length - 1) * 10 / (graphic_data.length * 30))
    .range([0, height])
    .round(true);


  //use the data to find unique entries in the name column
  y.domain([...new Set(graphic_data.map(d => d.name))]);

  //set up yAxis generator
  let yAxis = d3.axisLeft(y)
    .tickSize(0)
    .tickPadding(10)

  //set up xAxis generator
  let xAxis = d3.axisBottom(x)
    .tickSize(-height)
    .tickFormat(d3.format(".0%"))
    .ticks(config.optional.xAxisTicks[size]);

  //create svg for chart
  svg = d3.select('#graphic').append('svg')
    .attr("width", chart_width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "chart")
    .style("background-color", "#fff")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")")


  if (config.essential.xDomain == "auto") {
    x.domain([0, d3.max(graphic_data, function (d) { return d.value })]);
  } else {
    x.domain(config.essential.xDomain)
  }

  svg
    .append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .attr('class', 'x axis')
    .call(xAxis).selectAll('line').each(function (d) {
      if (d == 0) {
        d3.select(this)
          .attr('class', 'zero-line')
      };
    })


  svg
    .append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .selectAll('text').call(wrap, margin.left - 10)


  svg.selectAll('bars')
    .data(graphic_data)
    .join('rect')
    .attr('x', x(0))
    .attr('y', (d) => y(d.name))
    .attr('width', (d) => x(d.value) - x(0))
    .attr('height', y.bandwidth())
    .attr('fill', config.essential.colour_palette);


  if (config.essential.dataLabels.show == true) {
    // svg.selectAll('text.dataLabels')
    //   .data(graphic_data)
    //   .join('text')
    //   .attr('class', 'dataLabels')
    //   .attr('x', (d) => x(d.value))
    //   .attr('dx', (d) => x(d.value) - x(0) < chart_width / 10 ? 3 : -3)
    //   .attr('y', (d) => y(d.name) + 19)
    //   .attr('text-anchor', (d) => x(d.value) - x(0) < chart_width / 10 ? "start" : "end")
    //   .attr('fill', (d) => x(d.value) - x(0) < chart_width / 10 ? "#414042" : "#ffffff")
    //   .text((d) => d3.format(config.essential.dataLabels.numberFormat)(d.value))

    addDataLabels({
			svgContainer: svg,
			data: graphic_data,
			chart_width: chart_width,
			labelPositionFactor: 7,
			xScaleFunction: x,
			yScaleFunction: y
		})
  }//end if for datalabels

  // This does the x-axis label
  // svg
  //   .append('g')
  //   .attr('transform', 'translate(0,' + height + ')')
  //   .append('text')
  //   .attr('x', chart_width)
  //   .attr('y', 35)
  //   .attr('class', 'axis--label')
  //   .text(config.essential.xAxisLabel)
  //   .attr('text-anchor', 'end');
  addAxisLabel({
    svgContainer: svg,
    xPosition: chart_width,
    yPosition: height + 35,
    text: config.essential.xAxisLabel,
    textAnchor: "end",
    wrapWidth: chart_width
  });



  //setup the arrowhead marker
  // ("svg") is the reference for the object you are appending to. In most of our templates it will be svg 
  setupArrowhead(d3.select("svg"));


  // adds annoation arrow and text 
  // note - you need to add the setupArrowhead line above
  addAnnotationArrow(

    //name of the svg you're adding to 
    svg,

    //x and y values of your data point

    x(0.48),

    y("Arts") + y.bandwidth() / 2,

    //offset from your data point to arrowhead (x and y values)
    10, 10,

    //arrow length x and y
    60, 80,

    //curve direction (choose 'left' or 'right'). If blank the default is left
    "left",

    //annotation text
    "An arrow annotation, also known as a point annotation",

    //annotation text position - 'above', 'left', 'below' or 'right' 
    //this determines the position and alignment of the text relative to the arrow
    "below",

    //wrap width
    x(1) - x(0.5)
  );


  //adds vertical annotation line and text
  addAnnotationLineVertical(

    //name of the svg you're adding to 
    svg,

    // chart height. Will normally be height
    height,

    //x postion
    x(0.20),

    // text
    'A vertical annotation line',

    //text position ('left' or 'right' of the line)
    'right',

    //y positon of text
    20,

    //wrap width
    150,
    //Move the line to the back (default should be false)
    false
  )
  //   ;


  // adds vertical annotation range and text
  //// n.b. adds band like the other annotations after plotting your chart (the rectangle is moved below the chart, while text remains on top)

  addAnnotationRangeVertical(
    //name of the svg you're adding to 
    svg,

    // chart height. Will normally be height
    height,

    //band start value
    x(0.6),

    //band end value
    x(1),

    // text
    'A vertical annotation range',

    //text position relative to the band (choose 'left' or 'right')
    'left',

    //text position inside or outside band (chose 'inside' or 'outside' )
    'inside',

    //y positon of text
    height - 20,

    //wrap width

    x(1) - x(0.6),


  )



  //adds direction arrow
  addDirectionArrow(
    //name of your svg, normally just SVG
    svg,
    //direction of arrow: left, right, up or down
    'right',

    //anchor end or start (end points the arrow towards your x value, start points away)
    'end',

    //x value
    x(1),

    //y value
    10,

    //alignment - left or right for vertical arrows, above or below for horizontal arrows
    'right',

    //annotation text
    "A direction arrow, with end anchor",

    //wrap width
    200,

    //text adjust y
    0,

    //Text vertical align: top, middle or bottom (default is middle)
    'bottom',
    //

    // you can also optionally add a colour here to make the arrow (but not text) a different colour
  )


  //adds direction arrow
  addDirectionArrow(
    //name of your svg, normally just SVG
    svg,
    //direction of arrow: left, right, up or down
    'right',

    //anchor end or start (end points the arrow towards your x value, start points away)
    'start',

    //x value
    x(0.2),

    //y value
    height - 15,

    //alignment - left or right for vertical arrows, above or below for horizontal arrows
    'right',

    //annotation text
    "A direction anchor",

    //wrap width
    200,

    //text adjust y (probably not needed but if you need to adjust the vertical position of the text if it's not looking aligned)
    0,

    //Text vertical align: top, middle or bottom (default is middle)
    'middle',
    //

    // you can also optionally add a colour here to make the arrow a different colour. This won't change the text colour
  )

  //create link to source
  d3.select("#source")
    .text("Source: " + config.essential.sourceText)

  //use pym to calculate chart dimensions
  if (pymChild) {
    pymChild.sendHeight();
  }
}

function wrap(text, width) {
  text.each(function () {
    let text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      // y = text.attr("y"),
      x = text.attr("x"),
      dy = parseFloat(text.attr("dy")),
      tspan = text.text(null).append("tspan").attr('x', x);
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr('x', x).attr("dy", lineHeight + "em").text(word);
      }
    }
    let breaks = text.selectAll("tspan").size();
    text.attr("y", function () { return -6 * (breaks - 1); });
  });

}


d3.csv(config.essential.graphic_data_url)
  .then(data => {
    //load chart data
    graphic_data = data

    //use pym to create iframed chart dependent on specified variables
    pymChild = new pym.Child({
      renderCallback: drawGraphic
    });
  });
