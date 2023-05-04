var graphic = d3.select("#graphic");
var pymChild = null;

function determineStackOrder(stackOrder) {
  if (stackOrder === "ascending") {
    return d3.stackOrderAscending;
  } else if (stackOrder === "descending") {
    return d3.stackOrderDescending;
  } else if (stackOrder === "insideOut") {
    return d3.stackOrderInsideOut;
  } else {
    return d3.stackOrderNone;
  }
}
function determineStackOffset(stackOffset) {
  if (stackOffset === "expand") {
    return d3.stackOffsetExpand;
  } else if (stackOffset === "diverging") {
    return d3.stackOffsetDiverging;
  } else if (stackOffset === "silhouette") {
    return d3.stackOffsetSilhouette;
  } else {
    return d3.stackOffsetNone;
  }
}

function drawGraphic(seriesName, graphic_data) {
  //population accessible summmary
  d3.select("#accessibleSummary").html(config.essential.accessibleSummary);

  var threshold_md = config.optional.mediumBreakpoint;
  var threshold_sm = config.optional.mobileBreakpoint;

  //set variables for chart dimensions dependent on width of #graphic
  if (parseInt(graphic.style("width")) < threshold_sm) {
    size = "sm";
  } else if (parseInt(graphic.style("width")) < threshold_md) {
    size = "md";
  } else {
    size = "lg";
  }

  var margin = config.optional.margin[size];
  var chart_width =
    parseInt(graphic.style("width")) - margin.left - margin.right;
  //height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion
  var height =
    config.optional.seriesHeight[size] * graphic_data.length +
    10 * (graphic_data.length - 1) +
    12;

  // clear out existing graphics
  graphic.selectAll("*").remove();

  //set up scales
  const xScale = d3
    .scaleBand()
    .domain(graphic_data.map((d) => d.name)) // Use 'name' instead of 'groupedData'
    .range([0, chart_width])
    .paddingInner(0.1)
    .paddingOuter(0.1);

  const yScale = d3.scaleLinear().range([height, 0]);

  const colorScale = d3
    .scaleOrdinal()
    .domain(keys)
    .range(config.essential.colour_palette);

  // Create stack layout
  const stack = d3
    .stack()
    .keys(keys)
    .order(determineStackOrder(config.essential.stackOrder))
    .offset(determineStackOffset(config.essential.stackOffset));

  // Create series
  const series = stack(graphic_data);

  // Update the yScale domain
  yScale.domain([0, d3.max(series, (d) => d3.max(d, (d) => d[1]))]);

  //set up yAxis generator
  var yAxis = d3.axisLeft(yScale).tickSize(0).tickPadding(10);

  //set up xAxis generator
  var xAxis = d3
    .axisBottom(xScale)
    .tickSize(-height)
    .tickFormat(d3.format(config.essential.xAxisTickFormat))
    .ticks(config.optional.xAxisTicks[size]);

  //create svg for chart
  var svg = d3
    .select("#graphic")
    .append("svg")
    .attr("width", chart_width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "chart")
    .style("background-color", "#fff")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Add bars
  svg
    .selectAll(".series")
    .data(series)
    .join("g")
    .attr("class", "series")
    .attr("fill", (d) => colorScale(d.key))
    .selectAll("rect")
    .data((d) => d)
    .join("rect")
    .attr("x", (d) => xScale(d.data.name))
    .attr("y", (d) => yScale(d[1]))
    .attr("height", (d) => yScale(d[0]) - yScale(d[1]))
    .attr("width", xScale.bandwidth());

  // Add x-axis
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

  // Add chart title
  svg
    .append("text")
    .attr("x", 0)
    .attr("y", -margin.top / 2)
    .attr("class", "chart-title")
    .text(seriesName);

  // Add y-axis
  svg
    .append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .selectAll("text")
    .call(wrap, margin.left - 10);

  // Add the legend
  var legenditem = d3
    .select("#legend")
    .selectAll("div.legend--item")
    .data(
      d3.zip(graphic_data.columns.slice(1), config.essential.colour_palette)
    )
    .enter()
    .append("div")
    .attr("class", "legend--item");

  legenditem
    .append("div")
    .attr("class", "legend--icon--circle")
    .style("background-color", function (d) {
      return d[1];
    });

  legenditem
    .append("div")
    .append("p")
    .attr("class", "legend--text")
    .html(function (d) {
      return d[0];
    });

  // Update source text
  d3.select("#source").text("Source – " + config.essential.sourceText);

  // Update chart dimensions with pym
  if (pymChild) {
    pymChild.sendHeight();
  }
}

function wrap(text, width) {
  text.each(function () {
    var text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      y = text.attr("y"),
      dy = parseFloat(text.attr("dy")),
      tspan = text
        .text(null)
        .append("tspan")
        .attr("x", 0)
        .attr("y", y)
        .attr("dy", dy + "em");
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", 0)
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
  });
}

d3.csv(config.essential.graphic_data_url)
  .then(function (data) {
    // Group data by series
    const groupedData = d3.group(data, (d) => d.series);

    // Create an array of objects with the series names and corresponding values
    const formattedData = Array.from(groupedData, ([seriesName, values]) => {
      const categories = {};

      values.forEach((value) => {
        categories[value.category] = +value.value;
      });

      return {
        name: seriesName,
        ...categories,
      };
    });

    // Update the keys based on the unique categories
    keys = Array.from(new Set(data.map((d) => d.category)));

    // Call the drawGraphic function with the necessary parameters
    drawGraphic(formattedData[0].name, formattedData); // Pass the first series name and the formatted data

    // Initialize pym
    pymChild = new pym.Child({ renderCallback: drawGraphic });
  })
  .catch(function (error) {
    console.error("Error loading data:", error);
  });
