import { initialise, wrap, addSvg, addChartTitleLabel, addAxisLabel } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, svg, grouped_data;

function drawGraphic() {

  //Set up some of the basics and return the size value ('sm', 'md' or 'lg')
  size = initialise(size);

  let colour = d3.scaleOrdinal(config.essential.colour_palette);

  const chartEvery = config.optional.chartEvery[size];

  let margin = config.optional.margin[size]
  let chart_width = (parseInt(graphic.style("width")) / chartEvery) - margin.left - margin.right;
  let height = 400 - margin.top - margin.bottom;

  // lets move on to setting up the legend for this chart. 
  let legendGroups = [...new Set(graphic_data.map(item => item.group))]; // this will extract the unique groups from the data.csv


  let legenditem = d3
    .select('#legend')
    .selectAll('div.legend-item')
    .data(legendGroups)
    .enter()
    .append('div')
    .attr('class', 'legend--item');

  legenditem
    .append('div')
    .attr('class', 'legend--icon--circle')
    .style('background-color', (d) => colour(d));

  legenditem
    .append('div')
    .append('p')
    .attr('class', 'legend--text')
    .html((d) => d);


  //group data on the basis of plot
  grouped_data = d3.group(graphic_data, d => d.plot)

  let plots = [...new Set(d3.map(graphic_data, d => d.plot))];

  let xDataType;

  if (Object.prototype.toString.call(graphic_data[0].date) === '[object Date]') {
    xDataType = 'date';
  } else {
    xDataType = 'numeric';
  }

  // console.log(xDataType)

  //set up scales

  let x;

  if (xDataType == 'date') {
    x = d3.scaleTime()
      .domain(d3.extent(graphic_data, (d) => d.date))
      .range([0, chart_width]);
  } else {
    x = d3.scaleLinear()
      .domain(d3.extent(graphic_data, (d) => +d.date))
      .range([0, chart_width]);
  }


  // console.log("x",d3.extent(graphic_data, (d) => +d.date))

  const y = d3.scaleLinear()
    .range([height, 0])

  //create svg for chart
  svg = d3.select('#graphic')
    .selectAll('div')
    .data(grouped_data)
    .enter()
  
    svg = addSvg({
    svgParent: svg,
    chart_width: chart_width,
    height: height + margin.top + margin.bottom,
    margin: margin
  })

  // both of these are need to be looked at.

  if (config.essential.yDomain == "auto") {
    y.domain([0, d3.max(graphic_data, function (d) { return d.upperCI })]);
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
          : d3.format(config.essential.xAxisNumberFormat)(d)));


  svg
    .append('g')
    .attr('class', 'axis numeric')
    .call(
      d3.axisLeft(y)
        .ticks(config.optional.yAxisTicks[size])
        .tickSize(-chart_width)
        .tickPadding(10)
        .tickFormat(d3.format(config.essential.yAxisFormat))
    );


  //adding ci's to each of the charts.

  svg.append('g')
    .selectAll('line')
    .data((d) => d[1])
    .join('line')
    .attr('x1', d => x(d.date))
    .attr('y1', d => y(d.lowerCI))
    .attr('x2', d => x(d.date))
    .attr('y2', d => y(d.upperCI))
    .attr("stroke", d => colour(d.group))
    .attr('stroke-opacity')

  let capWidth = 10;

  svg.append('g')
    .selectAll('line.lower')
    .data((d) => d[1])
    .join('line')
    .attr('class', 'lower')
    .attr('x1', d => x(d.date) - capWidth / 2)
    .attr('y1', d => y(d.lowerCI))
    .attr('x2', d => x(d.date) + capWidth / 2)
    .attr('y2', d => y(d.lowerCI))
    .attr("stroke", d => colour(d.group))

  svg.append('g')
    .selectAll('line.upper')
    .data((d) => d[1])
    .join('line')
    .attr('class', 'upper')
    .attr('x1', d => x(d.date) - capWidth / 2)
    .attr('y1', d => y(d.upperCI))
    .attr('x2', d => x(d.date) + capWidth / 2)
    .attr('y2', d => y(d.upperCI))
    .attr("stroke", d => colour(d.group))


  //add dots to the plot
  svg.selectAll('circle')
    .data(graphic_data)
    .join('circle')
    .attr('cx', (d) => x(d.date))
    .attr('cy', (d) => y(d.yvalue))
    .attr('r', config.essential.radius)
    .attr("fill", (d) => colour(d.group)) // This adds the colour to the circles based on the group
    .attr('fill-opacity', config.essential.fillOpacity)
    .attr('stroke', (d) => colour(d.group))
    .attr('stroke-opacity', config.essential.strokeOpacity);

  // This does the chart title label
  addChartTitleLabel({
    svgContainer: svg,
    yPosition: -margin.top / 2,
    text: d => d[0],
    wrapWidth: chart_width
  })

  // This does the x-axis label - just on the rightmost chart of each row
  addAxisLabel({
    svgContainer: svg,
    xPosition: chart_width,
    yPosition: height + 40,
    text: (d, i) => i % chartEvery == chartEvery - 1 || plots.indexOf(d[0]) === plots.length - 1 ?
      config.essential.xAxisLabel : "",
    textAnchor: "end",
    wrapWidth: chart_width
  });

  // This does the y-axis label - just on the leftmost chart of each row
  addAxisLabel({
    svgContainer: svg,
    xPosition: -(margin.left - 5),
    yPosition: -10,
    text: (d) => plots.indexOf(d[0]) % chartEvery == 0 ? config.essential.yAxisLabel : "",
    textAnchor: "start",
    wrapWidth: chart_width
  });


  //create link to source
  d3.select("#source")
    .text("Source: " + config.essential.sourceText)


  //use pym to calculate chart dimensions
  if (pymChild) {
    pymChild.sendHeight();
  }
}

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
