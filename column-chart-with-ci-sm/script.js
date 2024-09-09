import { initialise, wrap, addSvg, calculateChartWidth, addChartTitleLabel, addAxisLabel } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let pymChild = null;
let legend = d3.select('#legend');
let graphic_data, size, svg;

function drawGraphic() {

  // //population accessible summmary
  // d3.select('#accessibleSummary').html(config.essential.accessibleSummary)

  // let threshold_md = config.optional.mediumBreakpoint;
  // let threshold_sm = config.optional.mobileBreakpoint;




  // //set variables for chart dimensions dependent on width of #graphic
  // if (parseInt(graphic.style("width")) < threshold_sm) {
  //   size = "sm"
  // } else if (parseInt(graphic.style("width")) < threshold_md) {
  //   size = "md"
  // } else {
  //   size = "lg"
  // }

	//Set up some of the basics and return the size value
	size = initialise(size);

  let colour = d3.scaleOrdinal(config.essential.colour_palette);

  const chartEvery = config.optional.chartEvery[size];


  // // clear out existing graphics
  // graphic.selectAll("*").remove();
  // legend.selectAll("*").remove();


  // let legenditem = d3
  //   .select('#legend')
  //   .selectAll('div.legend-item')
  //   .data(legendGroups)
  //   .enter()
  //   .append('div')
  //   .attr('class', 'legend--item');

  // legenditem
  //   .append('div')
  //   .attr('class', 'legend--icon--circle')
  //   .style('background-color', (d) => colour(d));

  // legenditem
  //   .append('div')
  //   .append('p')
  //   .attr('class', 'legend--text')
  //   .html((d) => d);


  //lets also try a new smallmultiple version here which will group data on the basis of plot
  let grouped_data = d3.group(graphic_data, d => d.plot)

  let xDataType;

  if (Object.prototype.toString.call(graphic_data[0].date) === '[object Date]') {
    xDataType = 'date';
  } else {
    xDataType = 'numeric';
  }

  // console.log(xDataType)

  // console.log(Array.from(grouped_data))

  // Create a container div for each small multiple
  var chartContainers = graphic
    .selectAll('.chart-container')
    .data(Array.from(grouped_data))
    .join('div')
    .attr('class', 'chart-container');

  function drawChart(container, data, chartIndex) {

    // function calculateChartWidth(size) {
    //   const chartEvery = config.optional.chartEvery[size];
    //   const chartMargin = config.optional.margin[size];

    //   if (config.optional.dropYAxis) {
    //     // Chart width calculation allowing for 10px left margin between the charts
    //     const chartWidth = ((parseInt(graphic.style('width')) - chartMargin.left - ((chartEvery - 1) * 10)) / chartEvery) - chartMargin.right;
    //     return chartWidth;
    //   } else {
    //     const chartWidth = ((parseInt(graphic.style('width')) / chartEvery) - chartMargin.left - chartMargin.right);
    //     return chartWidth;
    //   }


    // }

    let chartsPerRow = chartEvery;
    let chartPosition = chartIndex % chartsPerRow;

    let margin = { ...config.optional.margin[size] };

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

    let height = 400 - margin.top - margin.bottom;

    const x = d3
      .scaleBand()
      .paddingOuter(0.0)
      .paddingInner(0.1)
      .range([0, chart_width])
      .round(false);

    //use the data to find unique entries in the date column
    x.domain([...new Set(graphic_data.map((d) => d.date))]);

    // console.log("x", d3.extent(graphic_data, (d) => +d.date))

    const y = d3.scaleLinear()
      .range([height, 0])

    //create svg for chart
    // svg = container
    //   .append('svg')
    //   .attr("width", chart_width + margin.left + margin.right)
    //   .attr("height", height + margin.top + margin.bottom)
    //   .attr("class", "chart")
    //   .style("background-color", "#fff")
    //   .append("g")
    //   .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")")
    svg = addSvg({
      svgParent: container,
      chart_width: chart_width,
      height: height + margin.top + margin.bottom,
      margin: margin
    })

    // console.log(grouped_data)

    // both of these are need to be looked at.
    if (config.essential.yDomain == "auto") {
      if (d3.min(graphic_data.map(({ lowerCI }) => Number(lowerCI))) >= 0) {
        y.domain([
          0,
          d3.max(graphic_data.map(({ upperCI }) => Number(upperCI)))]); //modified so it converts string to number
      } else {
        y.domain([d3.min(graphic_data, function (d) { return d.lowerCI }), d3.max(graphic_data, function (d) { return d.upperCI })])
      }

    } else {
      y.domain(config.essential.yDomain)
    }

    svg
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3.axisBottom(x)
          .ticks(config.optional.xAxisTicks[size])
          .tickSize(-height)
          .tickPadding(10)
          .tickFormat((d) => xDataType == 'date' ? d3.timeFormat(config.essential.xAxisFormat)(d)
            : d3.format(config.essential.xAxisNumberFormat)(d)))

    svg.selectAll('g.x.axis')
      .selectAll('text')
      .call(wrap, x.bandwidth());


    //Add the y-axis to the leftmost chart, or all charts if dropYAxis in the config is false
    svg
      .append('g')
      .attr('class', 'axis numeric')
      .call(
        d3.axisLeft(y)
          .ticks(config.optional.yAxisTicks[size])
          .tickSize(-chart_width)
          .tickPadding(10)
          .tickFormat((d) => config.optional.dropYAxis !== true ? d3.format(config.essential.yAxisTickFormat)(d) :
            chartPosition == 0 ? d3.format(config.essential.yAxisTickFormat)(d) : "")
      );



    //add columns to the plot
    svg.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', (d) => x(d.date))
      .attr('y', (d) => y(Math.max(d.yvalue, 0)))
      .attr('height', (d) => Math.abs(y(d.yvalue) - y(0)))
      .attr('width', x.bandwidth())
      // .attr('r', config.essential.radius)
      .attr("fill", (d) => colour(d.group)) // This adds the colour to the circles based on the group
      .attr('fill-opacity', config.essential.fillOpacity)
      .attr('stroke', (d) => colour(d.group))
      .attr('stroke-opacity', config.essential.strokeOpacity);


    //adding ci's to each of the charts.
    svg.append('g')
      .selectAll('line')
      .data((d) => d[1])
      .join('line')
      .attr('x1', d => x(d.date) + x.bandwidth() / 2)
      .attr('y1', d => y(d.lowerCI))
      .attr('x2', d => x(d.date) + x.bandwidth() / 2)
      .attr('y2', d => y(d.upperCI))
      .attr("stroke", '#222')
      .attr('stroke-width', '2px')


    let capWidth = 10;

    svg.append('g')
      .selectAll('line.lower')
      .data((d) => d[1])
      .join('line')
      .attr('class', 'lower')
      .attr('x1', d => x(d.date) + x.bandwidth() / 2 - capWidth / 2)
      .attr('y1', d => y(d.lowerCI))
      .attr('x2', d => x(d.date) + x.bandwidth() / 2 + capWidth / 2)
      .attr('y2', d => y(d.lowerCI))
      .attr("stroke", '#222')
      .attr('stroke-width', '2px')


    svg.append('g')
      .selectAll('line.upper')
      .data((d) => d[1])
      .join('line')
      .attr('class', 'upper')
      .attr('x1', d => x(d.date) + x.bandwidth() / 2 - capWidth / 2)
      .attr('y1', d => y(d.upperCI))
      .attr('x2', d => x(d.date) + x.bandwidth() / 2 + capWidth / 2)
      .attr('y2', d => y(d.upperCI))
      .attr("stroke", '#222')
      .attr('stroke-width', '2px')


    // This does the chart title label
    // svg
    //   .append('g')
    //   .attr('transform', 'translate(0, 0)')
    //   .append('text')
    //   .attr('x', 0)
    //   .attr('y', 0)
    //   .attr('dy', 5 - margin.top)
    //   .attr('class', 'title')
    //   .text(d => d[0])
    //   .attr('text-anchor', 'start')
    //   .call(wrap, chart_width);
    addChartTitleLabel({
      svgContainer: svg,
      yPosition: -margin.top / 2,
      text: d => d[0],
      wrapWidth: chart_width
    })

    // This does the x-axis label
    // svg
    //   .append('g')
    //   .attr('transform', 'translate(0,' + height + ')')
    //   .append('text')
    //   .attr('x', chart_width)
    //   .attr('y', margin.bottom)
    //   .attr('class', 'axis--label')
    //   .text(() => chartIndex % chartEvery == chartEvery - 1 ?
    //     config.essential.xAxisLabel : "")
    //   .attr('text-anchor', 'end')
    // .call(wrap, chart_width);
    addAxisLabel({
      svgContainer: svg,
      xPosition: chart_width,
      yPosition: height + margin.bottom,
      text: chartIndex % chartEvery == chartEvery - 1 ?
        config.essential.xAxisLabel : "",
      textAnchor: "end",
      wrapWidth: chart_width
    });

    // This does the y-axis label
    // svg
    //   .append('g')
    //   .attr('transform', 'translate(0,0)')
    //   .append('text')
    // 	.attr('x', 5 - margin.left)
    // 	.attr('y', -10)
    //   .attr('class', 'axis--label')
    //   .text(() => chartPosition == 0 ? config.essential.yAxisLabel : "")
    //   .attr('text-anchor', 'start');
    addAxisLabel({
      svgContainer: svg,
      xPosition: 5 - margin.left,
      yPosition: -10,
      text: chartPosition == 0 ? config.essential.yAxisLabel : "",
      textAnchor: "start",
      wrapWidth: chart_width
    });



  }// End drawChart



  // Draw the charts for each small multiple
  chartContainers.each(function ([key, value], i) {
    drawChart(d3.select(this), value, i);
  });



  //create link to source
  d3.select("#source")
    .text("Source: " + config.essential.sourceText)


  //use pym to calculate chart dimensions
  if (pymChild) {
    pymChild.sendHeight();
  }
}

// function wrap(text, width) {
//   // console.log(width)
//   text.each(function () {
//     let text = d3.select(this),
//       words = text.text().split(/\s+/).reverse(),
//       word,
//       line = [],
//       lineNumber = 0,
//       lineHeight = 1.1, // ems
//       // y = text.attr("y"),
//       x = text.attr("x"),
//       dy = parseFloat(text.attr("dy")),
//       tspan = text.text(null).append("tspan").attr('x', x);
//     if (x == undefined) { x = 0 }
//     while (word = words.pop()) {
//       line.push(word);
//       tspan.text(line.join(" "));
//       if (tspan.node().getComputedTextLength() > width) {
//         line.pop();
//         tspan.text(line.join(" "));
//         line = [word];
//         tspan = text.append("tspan").attr('x', x).attr("dy", lineHeight + "em").text(word);
//       }
//     }
//     let breaks = text.selectAll("tspan").size();
//     text.attr("y", function () { return 10 - 6 * (breaks - 1); });
//   });

// }

//load data 
d3.csv(config.essential.graphic_data_url)
  .then((data) => {

    let parseTime = d3.timeParse(config.essential.dateFormat);
    //load chart data
    graphic_data = data;

    data.forEach((d, i) => {

      //If the date column is has date data store it as dates
      if (parseTime(data[i].date) !== null) {
        d.date = parseTime(d.date)
      }
      // console.log(data[i].date)
    });

    //use pym to create iframed chart dependent on specified variables
    pymChild = new pym.Child({
      renderCallback: drawGraphic
    });
  });
