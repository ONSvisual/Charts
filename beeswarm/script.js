import { initialise, addSvg, addAxisLabel } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let pymChild = null;
let graphic_data, size, xDomain, circleDist, radius;

function drawGraphic() {
  console.log(graphic_data)
  //Set up some of the basics and return the size value ('sm', 'md' or 'lg')
  size = initialise(size);

  let margin = config.optional.margin[size]
  let groups = d3.groups(graphic_data, (d) => d.group)
  let chart_width = parseInt(graphic.style("width")) - margin.left - margin.right;
  let height = config.optional.seriesHeight[size] * groups.length


  const min = d3.min(graphic_data, (d) => +d["value"])
  const max = d3.max(graphic_data, (d) => +d["value"])

  if (config.essential.xDomain == "auto") {
    xDomain = [min, max]
  } else {
    xDomain = config.essential.xDomain
  }


  //set up scales
  const x = d3.scaleLinear()
    .range([0, chart_width])
    .domain(xDomain);

  const y = d3.scaleBand()
    .domain(groups.map(d => d[0]))
    .rangeRound([margin.top, height - margin.bottom])
    .padding(0.07)

  //set up xAxis generator
  let xAxis = d3.axisBottom(x)
    .ticks(config.optional.xAxisTicks[size])
    .tickFormat(d3.format(config.essential.xAxisFormat));

  if(config.essential.radius=="auto"){
    radius = (x(x.domain()[1]) - x(x.domain()[0])) / (config.essential.numBands * 1.1);
  } else {
    radius = config.essential.radius
  } 
  

  if (config.essential.circleDist == "auto") {
    circleDist = (y.bandwidth() * 0.95 - radius) / d3.max(graphic_data,d=>d.y) ;
  } else {
    circleDist = config.essential.circleDist * radius
  }

  let chart = addSvg({
    svgParent: graphic,
    chart_width: chart_width,
    height: height + margin.top + margin.bottom,
    margin: margin
  })

  chart
    .append("g")
    .attr("fill", "#f5f5f5")
    .selectAll("rect")
    .data(y.domain())
    .join("rect")
    .attr("x", 0)
    .attr("y", d => y(d))
    .attr("width", () => x(x.domain()[1]) - x(x.domain()[0]))
    .attr("height", y.bandwidth);

  // group labels
  if (groups.length > 1) {
    chart
      .append("g")
      .attr("fill", "#444")
      .selectAll("text")
      .data(y.domain())
      .join("text")
      .attr("x", 5)
      .attr("y", d => y(d) + 17)
      .text(d => d);
  }


  // x axis
  chart.append("g")
    .attr('transform', (d) => 'translate(0,' + (height - margin.top - margin.bottom) + ')')
    .attr('class', 'x axis')
    .call(xAxis);



  chart.append("g")
    .attr("fill", config.essential.colour_palette)
    .attr("stroke", "white")
    .attr("stroke-width", 0.6)
    .selectAll("circle")
    .data([...graphic_data].reverse())
    .join("circle")
    .attr("cx", d => x(d.valueRound ))
    .attr("cy", d => y(d.group) + y.bandwidth() * 0.95 - circleDist * d.y)
    .attr("r", radius / 2)
    .append("title")
    .text(d => d.areanm + ' ' + d.value);

  addAxisLabel({
    svgContainer: chart,
    xPosition: chart_width,
    yPosition: height - margin.top - margin.bottom + 40,
    text: config.essential.xAxisLabel,
    textAnchor: "end",
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

d3.csv(config.essential.graphic_data_url)
  .then(data => {
    // First convert string values to numbers if needed
    data.forEach(d => {
      d.value = +d.value;  // Convert to number if it's a string
    });

    // Calculate the binned values
    const minValue = d3.min(data, d => d.value);
    const maxValue = d3.max(data, d => d.value);
    const binSize = (maxValue - minValue) / config.essential.numBands;

    // Create bins and assign vertical positions
    const bins = {};
    data.forEach(d => {
      const binNumber = Math.floor((d.value - minValue) / binSize);
      d.valueRound = minValue + (binNumber * binSize) + (binSize / 2);
      
      // Create unique key for this group and bin combination
      const binKey = d.group + '_' + d.valueRound;
      
      // Assign vertical position
      if (binKey in bins) {
        d.y = bins[binKey]++;
      } else {
        d.y = 0;
        bins[binKey] = 1;
      }
    });

    graphic_data = data;

    // Create visualization using pym
    pymChild = new pym.Child({
      renderCallback: drawGraphic
    });
  });
