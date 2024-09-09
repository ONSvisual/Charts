import { initialise, wrap, addSvg, addAxisLabel } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let pymChild = null;
let graphic_data, size, svg, xDomain;

function drawGraphic() {

  // // clear out existing graphics
  // graphic.selectAll("*").remove();


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

  let margin = config.optional.margin[size]
  let chart_width = parseInt(graphic.style("width")) - margin.left - margin.right;

  let groups = d3.groups(graphic_data, (d) => d.group)

  if (config.essential.xDomain == "auto") {
    let min = 0
    let max = 0
    for (let i = 2; i < graphic_data.columns.length; i++) {
      min = d3.min([min, d3.min(graphic_data, (d) => +d[graphic_data.columns[i]])])
      max = d3.max([max, d3.max(graphic_data, (d) => +d[graphic_data.columns[i]])])
    }
    xDomain = [min, max]
  } else {
    xDomain = config.essential.xDomain
  }

  //set up scales
  const x = d3.scaleLinear()
    .range([0, chart_width])
    .domain(xDomain);

  const colour = d3.scaleOrdinal()
    .range(config.essential.colour_palette)
    .domain(Object.keys(config.essential.legendLabels))

  // create the y scale in groups
  groups.map(function (d) {
    //height
    d[2] = config.optional.seriesHeight[size] * d[1].length

    // y scale
    d[3] = d3.scaleBand()
      .paddingOuter(0.2)
      .paddingInner((graphic_data.length - 1) * 10 / (graphic_data.length * 30))
      .range([0, d[2]])
      .domain(d[1].map(d => d.name));
    //y axis generator
    d[4] = d3.axisLeft(d[3])
      .tickSize(0)
      .tickPadding(10);
  });

  //set up xAxis generator
  let xAxis = d3.axisBottom(x)
    .ticks(config.optional.xAxisTicks[size])
    .tickFormat(d3.format(config.essential.xAxisFormat));

  let divs = graphic.selectAll('div.categoryLabels')
    .data(groups)
    .join('div')


  divs.append('p').attr('class', 'groupLabels').html((d) => d[0])

  //remove blank headings
  divs.selectAll('p').filter((d) => (d[0] == "")).remove()

  // let svgs = divs.append('svg')
  //   .attr('class', 'chart')
  //   .attr('height', (d) => d[2] + margin.top + margin.bottom)
  //   .attr('width', chart_width + margin.left + margin.right)

  // let charts = svgs.append('g')
  //   .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  let charts = addSvg({
    svgParent: divs,
    chart_width: chart_width,
    height: (d) => d[2] + margin.top + margin.bottom,
    margin: margin
  })

  charts.each(function (d) {
    d3.select(this)
      .append('g')
      .attr('class', 'y axis')
      .call(d[4])
      .selectAll('text')
      .call(wrap, margin.left - 10)

    d3.select(this)
      .append('g')
      .attr('transform', (d) => 'translate(0,' + d[2] + ')')
      .attr('class', 'x axis')
      .each(function () {
        d3.select(this).call(xAxis.tickSize(-d[2]))
          .selectAll('line').each(function (e) {
            if (e == 0) {
              d3.select(this)
                .attr('class', 'zero-line')
            };
          })
      })

  })



  charts.selectAll('rect')
    .data((d) => d[1])
    .join('rect')
    .attr('x', d => d.value < 0 ? x(d.value) : x(0))
    .attr('y', d => groups.filter(f => f[0] == d.group)[0][3](d.name))
    .attr('width', (d) => Math.abs(x(d.value) - x(0)))
    .attr('height', (d) => groups.filter(f => f[0] == d.group)[0][3].bandwidth())
    .attr('fill', config.essential.colour_palette);

  let labelPositionFactor = 7;

  if (config.essential.dataLabels.show == true) {
    charts.selectAll('text.value')
      .data((d) => d[1])
      .join('text')
      .attr('class', 'dataLabels')
      .attr('x', (d) => d.value > 0 ? x(d.value) :
        Math.abs(x(d.value) - x(0)) < chart_width / labelPositionFactor ? x(0) : x(d.value))
      .attr('dx', (d) => d.value > 0 ?
        (Math.abs(x(d.value) - x(0)) < chart_width / labelPositionFactor ? 3 : -3) :
        3)
      .attr('y', (d) => groups.filter(f => f[0] == d.group)[0][3](d.name) + groups.filter(f => f[0] == d.group)[0][3].bandwidth() / 2)
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', (d) => d.value > 0 ?
        (Math.abs(x(d.value) - x(0)) < chart_width / labelPositionFactor ? 'start' : 'end') :
        "start"
      )
      .attr('fill', (d) =>
        (Math.abs(x(d.value) - x(0)) < chart_width / labelPositionFactor ? '#414042' : '#ffffff')
      )
      .text((d) => d3.format(config.essential.dataLabels.numberFormat)(d.value))
  }//end if for datalabels



  // This does the x-axis label
  charts.each(function (d, i) {

    if (i == groups.length - 1) {
      // d3.select(this)
      //   .append('text')
      //   .attr('x', chart_width)
      //   .attr('y', (d) => d[2] + 35)
      //   .attr('class', 'axis--label')
      //   .text(config.essential.xAxisLabel)
      //   .attr('text-anchor', 'end')
      addAxisLabel({
        svgContainer: d3.select(this),
        xPosition: chart_width,
        yPosition: d[2] + 35,
        text: config.essential.xAxisLabel,
        textAnchor: "end",
        wrapWidth: chart_width
      });
    }
  })




  //create link to source
  d3.select("#source")
    .text("Source: " + config.essential.sourceText)

  //use pym to calculate chart dimensions
  if (pymChild) {
    pymChild.sendHeight();
  }
}

// function wrap(text, width) {
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
//     text.attr("y", function () {
//       return -6 * (breaks - 1);
//     });
//   });

// }

d3.csv(config.essential.graphic_data_url)
  .then(data => {
    //load chart data
    graphic_data = data

    //use pym to create iframed chart dependent on specified variables
    pymChild = new pym.Child({
      renderCallback: drawGraphic
    });
  });
