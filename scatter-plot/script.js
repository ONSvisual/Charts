import { initialise, wrap2, addSvg, addAxisLabel, diamondShape, createDelaunayOverlay } from "../lib/helpers.js";
import { EnhancedSelect } from "../lib/enhancedSelect.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, svg;

const circleSize = 105; // Define size for circles in pixels
const squareSize = 90; // Define size for squares in pixels
const triangleSize = 75; // Define size for triangles in pixels
const diamondSize = 95; // Define size for diamonds in pixels

// Add this variable to store the overlay cleanup function
let overlayCleanup = null;

function drawGraphic() {
  // add cleanup when the chart is destroyed/redrawn
  function cleanupPreviousChart() {
    if (overlayCleanup) {
      overlayCleanup();
      overlayCleanup = null;
    }
  }
  //Set up some of the basics and return the size value ('sm', 'md' or 'lg')
  size = initialise(size);

  let colour = d3.scaleOrdinal(config.essential.colour_palette);

  let margin = config.optional.margin[size];
  let chart_width = parseInt(graphic.style("width")) - margin.left - margin.right;
  let height = (config.optional.aspectRatio[size][1] / config.optional.aspectRatio[size][0]) * chart_width;

  const x = d3.scaleLinear().range([0, chart_width]);
  const y = d3.scaleLinear().range([height, 0]);

  svg = addSvg({
    svgParent: graphic,
    chart_width: chart_width,
    height: height + margin.top + margin.bottom,
    margin: margin
  });

  let groups = [...new Set(graphic_data.map(item => item.group))].sort();

  let shape = d3.scaleOrdinal()
    .domain(groups)
    .range(['circle', 'square', 'triangle', 'diamond']);

  let legenditem = legend.selectAll('div.legend-item')
    .data(groups)
    .enter()
    .append('div')
    .attr('class', 'legend--item')
    .style('display', 'flex')
    .style('align-items', 'center');

  legenditem.append('svg')
    .attr('width', 20)
    .attr('height', 20)
    .append('path')
    .attr('stroke-width', '1px')
    .attr('d', d => {
      switch (shape(d)) {
        case 'circle': return d3.symbol().type(d3.symbolCircle).size(circleSize)();
        case 'square': return d3.symbol().type(d3.symbolSquare).size(squareSize)();
        case 'triangle': return d3.symbol().type(d3.symbolTriangle).size(triangleSize)();
        case 'diamond': return diamondShape(diamondSize / 10); // Use the custom diamond shape
      }
    })
    .attr('transform', 'translate(10,10)')
    .attr('fill', d => colour(d))
    .attr('stroke', '#fff');

  legenditem.append('p')
    .attr('class', 'legend--text')
    .style('margin-left', '5px')
    .text(d => d);

  // set up dropdown
  const dropdownData = graphic_data.map((point, index) => ({
    id: index,
    label: point.name || `Point ${index + 1}`,
    group: point.group
  }));

  const select = new EnhancedSelect({
    containerId: 'select',
    options: dropdownData,
    label: 'Choose a point',
    mode: 'default',
    idKey: 'id',
    labelKey: 'label',
    groupKey:'group',
    onChange: (selectedValue) => {
      if (selectedValue) {
        overlayCleanup.highlightPoint(selectedValue.id);
      } else {
        overlayCleanup.clearHighlight();
      }
    }
  });



  if (config.essential.xDomain == "auto") {
    x.domain([d3.min(graphic_data, d => d.xvalue), d3.max(graphic_data, d => d.xvalue)]);
  } else {
    x.domain(config.essential.xDomain);
  }


  if (config.essential.yDomain == "auto") {
    y.domain([d3.min(graphic_data, d => d.yvalue), d3.max(graphic_data, d => d.yvalue)]);
  } else {
    y.domain(config.essential.yDomain);
  }

  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x)
      .ticks(config.optional.xAxisTicks[size])
      .tickSize(-height)
      .tickPadding(10)
      .tickFormat(d3.format(config.essential.xAxisFormat))
    )
    .selectAll('line')
    .each(function (d) {
      if (d === 0) {
        d3.select(this).attr('class', 'zero-line');
      }
    });


  svg
    .append('g')
    .attr('class', 'axis numeric')
    .call(
      d3.axisLeft(y)
        .ticks(config.optional.yAxisTicks[size])
        .tickSize(-chart_width)
        .tickPadding(10)
        .tickFormat(d3.format(config.essential.yAxisFormat))
    ).selectAll('line')
    .each(function (d) {
      if (d === 0) {
        d3.select(this).attr('class', 'zero-line');
      }
    });

  svg.append('g').selectAll('path')
    .data(graphic_data)
    .join('path')
    .attr('d', d => {
      switch (shape(d.group)) {
        case 'circle': return d3.symbol().type(d3.symbolCircle).size(circleSize)();
        case 'square': return d3.symbol().type(d3.symbolSquare).size(squareSize)();
        case 'triangle': return d3.symbol().type(d3.symbolTriangle).size(triangleSize)();
        case 'diamond': return diamondShape(diamondSize / 10); // Use the custom diamond shape
      }
    })
    .attr('transform', d => `translate(${x(d.xvalue)},${y(d.yvalue)})`)
    .attr('fill', d => colour(d.group))
    .attr('fill-opacity', config.essential.fillOpacity)
    .attr('stroke', d => d.highlight === 'y' ? '#222' : "#fff")
    .attr('stroke-width', d => d.highlight === 'y' ? '1.5px' : '1px')
    .attr('stroke-linejoin', 'round')
    .attr('stroke-opacity', config.essential.strokeOpacity);

  // Clean up previous overlay if it exists
  if (overlayCleanup) {
    overlayCleanup();
  }

  // Create Delaunay overlay for tooltips (Basic version)
  overlayCleanup = createDelaunayOverlay({
    svgContainer: svg,
    data: graphic_data,
    chart_width: chart_width,
    height: height,
    xScale: x,
    yScale: y,
    shape: shape,
    circleSize: circleSize,
    squareSize: squareSize,
    triangleSize: triangleSize,
    diamondSize: diamondSize,
    tooltipConfig: {
      xValueFormat: d3.format(config.essential.xAxisFormat),
      yValueFormat: d3.format(config.essential.yAxisFormat),
      xLabel: config.essential.xAxisLabel || 'X Value',
      yLabel: config.essential.yAxisLabel || 'Y Value',
      groupLabel: config.essential.groupLabel || 'Group',
      width: "250px",
      offset: { x: 3, y: 3 }
    },
    margin: margin
  });

  svg.selectAll('text.label')
    .data(graphic_data.filter(d => d.highlight === 'y'))
    .join('text')
    .attr('class', 'dataLabels')
    .attr('x', d => x(d.xvalue))
    .attr('y', d => y(d.yvalue))
    .attr('dy', '-1em')
    .attr('text-anchor', 'middle')
    .attr('font-size', '14px')
    .attr('fill', '#404142')
    .text(d => d.name)
    .style('font-weight', '600')
    .call(wrap2, 100, 1.5, 1, 1.05, 1, true, 'middle');

  // This does the x-axis label
  addAxisLabel({
    svgContainer: svg,
    xPosition: chart_width,
    yPosition: height + 40,
    text: config.essential.xAxisLabel,
    textAnchor: "end",
    wrapWidth: chart_width
  });

  // This does the y-axis label
  addAxisLabel({
    svgContainer: svg,
    xPosition: -(margin.left - 5),
    yPosition: -10,
    text: config.essential.yAxisLabel,
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

d3.csv(config.essential.graphic_data_url)
  .then(data => {
    //load chart data
    graphic_data = data

    //use pym to create iframed chart dependent on specified variables
    pymChild = new pym.Child({
      renderCallback: drawGraphic
    });
  });
