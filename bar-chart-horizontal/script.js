import { initialise, wrap, addSvg, addAxisLabel, addDataLabels } from "../lib/helpers.js";

let graphic = d3.select("#graphic");
let pymChild = null;
let graphic_data, size, svg;

function drawGraphic() {

  //Set up some of the basics and return the size value ('sm', 'md' or 'lg')
  size = initialise(size);

  let margin = config.optional.margin[size];
  let chart_width =
    parseInt(graphic.style("width")) - margin.left - margin.right;
  //height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion
  let height =
    config.optional.seriesHeight[size] * graphic_data.length +
    10 * (graphic_data.length - 1) +
    12;

  //set up scales
  const x = d3.scaleLinear().range([0, chart_width]);

  const y = d3
    .scaleBand()
    .paddingOuter(0.2)
    .paddingInner(((graphic_data.length - 1) * 10) / (graphic_data.length * 30))
    .range([0, height])
    .round(true);

  //use the data to find unique entries in the name column
  y.domain([...new Set(graphic_data.map((d) => d.name))]);

  //set up yAxis generator
  let yAxis = d3.axisLeft(y).tickSize(0).tickPadding(10);

  //set up xAxis generator
  let xAxis = d3
    .axisBottom(x)
    .tickSize(-height)
    .tickFormat(d3.format(config.essential.dataLabels.numberFormat))
    .ticks(config.optional.xAxisTicks[size]);

  //create svg for chart
  svg = addSvg({
    svgParent: graphic,
    chart_width: chart_width,
    height: height + margin.top + margin.bottom,
    margin: margin
  })

  if (config.essential.xDomain == "auto") {
    if (d3.min(graphic_data.map(({ value }) => Number(value))) >= 0) {
      x.domain([0, d3.max(graphic_data.map(({ value }) => Number(value)))]); //modified so it converts string to number
    } else {
      x.domain(d3.extent(graphic_data.map(({ value }) => Number(value))));
    }
  } else {
    x.domain(config.essential.xDomain);
  }

  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("class", "x axis")
    .call(xAxis)
    .selectAll("line")
    .each(function (d) {
      if (d == 0) {
        d3.select(this).attr("class", "zero-line");
      }
    });

  svg
    .append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .selectAll("text")
    .call(wrap, margin.left - 20);

  // addYAxis(svg, margin.left-10)

  svg
    .selectAll("rect")
    .data(graphic_data)
    .join("rect")
    .attr("x", (d) => (d.value < 0 ? x(d.value) : x(0)))
    .attr("y", (d) => y(d.name))
    .attr("width", (d) => Math.abs(x(d.value) - x(0)))
    .attr("height", y.bandwidth())
    .attr("fill", config.essential.colour_palette);

  // let labelPositionFactor = 7;

  if (config.essential.dataLabels.show == true) {
    addDataLabels({
      svgContainer: svg,
      data: graphic_data,
      chart_width: chart_width,
      labelPositionFactor: 7,
      xScaleFunction: x,
      yScaleFunction: y
    })
  } //end if for datalabels

  //This does the x-axis label
  addAxisLabel({
    svgContainer: svg,
    xPosition: chart_width,
    yPosition: height + 35,
    text: config.essential.xAxisLabel,
    textAnchor: "end",
    wrapWidth: chart_width
  });

  //create link to source
  d3.select("#source").text("Source: " + config.essential.sourceText);

  //use pym to calculate chart dimensions
  if (pymChild) {
    pymChild.sendHeight();
  }
}

d3.csv(config.essential.graphic_data_url).then((data) => {
  //load chart data
  graphic_data = data;

  //use pym to create iframed chart dependent on specified variables
  pymChild = new pym.Child({
    renderCallback: drawGraphic,
  });
});
