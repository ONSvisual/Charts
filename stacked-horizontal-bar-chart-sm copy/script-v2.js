var pymChild = null;
var graphic = d3.select("#graphic");
var size = window.innerWidth > config.optional.mobileBreakpoint ? "lg" : "sm";

function drawGraphic(seriesName, graphic_data, groupedData) {
  // Remove previous SVGs
  // graphic.selectAll("svg").remove();

  // Set dimensions
  var margin = config.optional.margin[size];
  var numSeries = groupedData.length;
  var chart_width =
    (parseInt(graphic.style("width")) - margin.left - margin.right) /
      numSeries -
    10;
  var height =
    config.optional.seriesHeight[size] * graphic_data.length +
    10 * (graphic_data.length - 1) +
    12;

  // Define scales
  var x = d3.scaleLinear().range([0, chart_width]);

  var y = d3.scaleBand().rangeRound([0, height]).padding(0.1);

  // Define axes
  var xAxis = d3
    .axisTop(x)
    .tickSize(-height, 0, 0)
    .tickFormat(d3.format(config.essential.xAxisTickFormat));

  var yAxis = d3.axisLeft(y);

  // Define stack layout
  var stack = d3
    .stack()
    .offset(d3[config.essential.stackOffset])
    .order(d3[config.essential.stackOrder])
    .keys(graphic_data.columns.slice(1, -1));

  // Process data
  const series = stack(graphic_data);
  if (config.essential.xDomain === "auto") {
    x.domain([0, d3.max(series, (d) => d3.max(d, (d) => d[1]))]).nice();
  } else {
    x.domain(config.essential.xDomain);
  }
  y.domain(graphic_data.map((d) => d.name));

  // Create SVG
  var svg = graphic
    .append("svg")
    .attr("width", chart_width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Add axis labels
  svg
    .append("text")
    .attr("class", "axis-label")
    .attr(
      "transform",
      "translate(" + -margin.left / 2 + "," + height / 2 + ") rotate(-90)"
    )
    .text(seriesName);

  // Add axes
  svg.append("g").attr("class", "x axis").call(xAxis);

  svg.append("g").attr("class", "y axis").call(yAxis);

  // Draw chart
  var layer = svg
    .selectAll(".layer")
    .data(series)
    .enter()
    .append("g")
    .attr("class", "layer")
    .style("fill", (_, i) => config.essential.colour_palette[i]);

  layer
    .selectAll("rect")
    .data((d) => d)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d[0]))
    .attr("y", (d, i) => y(graphic_data[i].name))
    .attr("width", (d) => x(d[1]) - x(d[0]))
    .attr("height", y.bandwidth());
}

// Load the data
d3.csv(config.essential.graphic_data_url)
  .then((data) => {
    // Group the data by the 'series' column
    const groupedData = d3.groups(data, (d) => d.series);

    // Remove previous SVGs
    graphic.selectAll("svg").remove();

    groupedData.forEach((group, i) => {
      const seriesName = group[0];
      const graphic_data = group[1];
      graphic_data.columns = data.columns;

      // Pass groupedData as an argument to the drawGraphic function
      drawGraphic(seriesName, graphic_data, groupedData);
    });
  })
  .catch((error) => console.error(error));
