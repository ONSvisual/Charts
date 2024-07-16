import { calculateChartWidth, addAxisLabel } from "../lib/helpers.js";

let pymChild = null;
let graphic = d3.select("#graphic");
let graphic_data, size, svg;

//Remove previous SVGs
d3.select("#graphic").select("img").remove();

function drawGraphic(seriesName, graphic_data, chartIndex) {
  d3.select("#accessibleSummary").html(config.essential.accessibleSummary);

  // function calculateChartWidth(size) {
  //   const chartEvery = config.optional.chart_every[size];
  //   const aspectRatio = config.optional.aspectRatio[size];
  //   const chartMargin = config.optional.margin[size];

  //   const containerWidth = parseInt(graphic.style("width"));
  //   const chartsPerRow = chartEvery;
  //   // const chartWidth =
  //   //   ((containerWidth - chartMargin.left - chartMargin.right) / chartsPerRow) *
  //   //   (aspectRatio[0] / aspectRatio[1]);

  //   // Chart width calculation allowing for 10px left margin between the charts
  //   const chartWidth = ((parseInt(graphic.style('width')) - chartMargin.left - ((chartEvery - 1) * 10)) / chartEvery) - chartMargin.right;

  //   return chartWidth;
  // }

  // size thresholds as defined in the config.js file

  let threshold_md = config.optional.mediumBreakpoint;
  let threshold_sm = config.optional.mobileBreakpoint;

  //set variables for chart dimensions dependent on width of #graphic
  let size;
  if (parseInt(graphic.style("width")) < threshold_sm) {
    size = "sm";
  } else if (parseInt(graphic.style("width")) < threshold_md) {
    size = "md";
  } else {
    size = "lg";
  }

  const chartsPerRow = config.optional.chart_every[size];
  const chartPosition = chartIndex % chartsPerRow;
  const colorsArray = ["#206095", "#27A0CC", "#871A5B", "#746CB1", "#A8BD3A"];

  // Set dimensions
  let margin = { ...config.optional.margin[size] };

  let height =
    config.optional.seriesHeight[size] * graphic_data.length +
    10 * (graphic_data.length - 1) +
    12;

  let chartGap = config.optional?.chartGap || 10;

  let chart_width = calculateChartWidth({
    screenWidth: parseInt(graphic.style('width')),
    chartEvery: chartsPerRow,
    chartMargin: margin,
    chartGap: chartGap
  })

  // If the chart is not in the first position in the row, reduce the left margin
  if (config.optional.dropYAxis) {
    if (chartPosition !== 0) {
      margin.left = chartGap;
    }
  }

  // Calculate the total available width for two charts in a row
  const containerWidth = parseInt(graphic.style("width"));
  const availableWidth = containerWidth - margin.left - margin.right;

  // Calculate the chart width for two charts in a row, accounting for spacing
  const chartWidthPerRow = availableWidth / chartsPerRow;

  // Adjust the chart width based on the available space and desired grid layout
  chart_width = Math.min(chartWidthPerRow, chart_width);
  chart_width *= 1;

  // Calculate the row index and column index based on chart position
  const rowIndex = Math.floor(chartIndex / chartsPerRow);
  const colIndex = chartIndex % chartsPerRow;

  // Calculate the translation for positioning the chart in the grid
  const translateX = colIndex * (chartWidthPerRow + 10);
  const translateY = rowIndex * (height + margin.top + margin.bottom);


  // Define scales
  const x = d3.scaleLinear().range([0, chart_width]);

  const y = d3
    .scaleBand()
    .paddingOuter(0.2)
    .paddingInner(((graphic_data.length - 1) * 10) / (graphic_data.length * 30))
    .range([0, height])
    .round(true);

  // Define axes
  let xAxis = d3
    .axisBottom(x)
    .tickSize(-height)
    .tickFormat(d3.format(config.essential.xAxisTickFormat))
    .ticks(config.optional.xAxisTicks[size]);

  let yAxis = d3.axisLeft(y).tickSize(0).tickPadding(10);

  // Define stack layout
  let stack = d3
    .stack()
    .offset(d3[config.essential.stackOffset])
    .order(d3[config.essential.stackOrder])
    .keys(graphic_data.columns.slice(1, -1));

  const series = stack(graphic_data);

  // trying a different version because d3.nice() is causing issues.
  if (config.essential.xDomain === "auto") {
    x.domain([0, d3.max(series, (d) => d3.max(d, (d) => d[1]))]);
  } else {
    x.domain([0, config.essential.xDomain[1]]);
  }

  y.domain(graphic_data.map((d) => d.name));

  // Create SVG
  let svg = d3
    .select("#graphic")
    .append("svg")
    .attr("width", chart_width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "chart")
    .style("background-color", "#fff")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  // Add axes
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


  // This will append the y axis to every chart
  svg.append("g").attr("class", "y axis").call(yAxis).remove();

  //trying to wrap text

  if (chartIndex % chartsPerRow === 0) {
    svg
      .append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .selectAll(".tick text")
      .call(wrap, margin.left - 10, graphic_data);
  } else {
    svg.append("g").attr("class", "y axis").call(yAxis.tickValues([]));
  }

  // Add a bold text label to the top left corner of the chart SVG
  svg
    .append("text")
    .attr("class", "axis-label")
    .attr("x", 0)
    .attr("y", 0)
    .attr("transform", "translate(0,-30)") //this changes the height of the group label, increase if it's long
    .text(seriesName)
    .style("font-weight", "bold")
    .style("font-size", "16px")
    //.style("fill", "#707071")
    .style("fill", colorsArray[chartIndex % colorsArray.length])
    .call(wrap, 150, graphic_data);


  // Draw chart
  svg
    .selectAll("g.chart-group")
    .data(series)
    .enter()
    .append("g")
    .attr("class", "chart-group")
    .selectAll("rect")
    .data((d) => d)
    .join("rect")
    .attr("x", (d) => x(d.data.name))
    .attr("y", (d, i) => y(graphic_data[i].name))
    .attr("width", (d) => Math.abs(x(d[0]) - x(d[1])))
    .attr("height", y.bandwidth())
    .style("fill", colorsArray[chartIndex % colorsArray.length]);

  console.log(colorsArray)

  // This does the x-axis label
  if (chartIndex % chartsPerRow === chartsPerRow - 1) {
    // svg
    //   .append('g')
    //   .attr('transform', `translate(0, ${height})`)
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
  }

  //create link to source
  d3.select("#source").text("Source: " + config.essential.sourceText);

  //use pym to calculate chart dimensions
  if (pymChild) {
    pymChild.sendHeight(height + margin.top + margin.bottom);
  }
}

function wrap(text, width, graphic_data) {
  text.each(function (d, i) {
    let text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      x = text.attr("x"),
      dy = parseFloat(text.attr("dy")),
      tspan = text.text(null).append("tspan").attr("x", x);
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", x)
          .attr("dy", lineHeight + "em")
          .text(word);
      }
    }
    let breaks = text.selectAll("tspan").size();
    text.attr("y", function () {
      return -6 * (breaks - 1);
    });

    // Check if the corresponding data row has no data, and if so, make the y-axis label bold
    const rowData = graphic_data[i];
    const hasNoData = Object.values(rowData)
      .slice(1, -1)
      .every((value) => value === "");
    if (hasNoData) {
      text.style("font-weight", "bold");
    }
  });
}

function renderCallback() {
  // Load the data
  d3.csv(config.essential.graphic_data_url)
    .then((data) => {
      // console.log("Original data:", data);

      // Group the data by the 'series' column
      const groupedData = d3.groups(data, (d) => d.series);
      // console.log("Grouped data:", groupedData);

      //Generate a list of categories based on the order in the first chart that we can use to order the subsequent charts
      let namesArray = [...groupedData][0][1].map(d => d.name);

      // Remove previous SVGs
      graphic.selectAll("svg").remove();

      groupedData.forEach((group, i) => {
        const seriesName = group[0];
        const graphic_data = group[1];

        //Sort the data so that the bars in each chart are in the same order
        graphic_data.sort((a, b) => namesArray.indexOf(a.name) - namesArray.indexOf(b.name))

        graphic_data.columns = data.columns;

        drawGraphic(seriesName, graphic_data, i);
      });
    })
    .catch((error) => console.error(error));
}

//use pym to create iframed chart dependent on specified variables
pymChild = new pym.Child({
  renderCallback: renderCallback,
});
