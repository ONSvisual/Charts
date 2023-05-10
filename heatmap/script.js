const graphic = d3.select('#graphic');
const legend = d3.select('#legend')
var pymChild = null;

function drawGraphic() {

  //population accessible summmary
  d3.select('#accessibleSummary').html(config.essential.accessibleSummary)

  var threshold_md = config.optional.mediumBreakpoint;
  var threshold_sm = config.optional.mobileBreakpoint;

  //set variables for chart dimensions dependent on width of #graphic
  if (parseInt(graphic.style("width")) < threshold_sm) {
    size = "sm"
  } else if (parseInt(graphic.style("width")) < threshold_md) {
    size = "md"
  } else {
    size = "lg"
  }

  var margin = config.optional.margin[size]
  var chart_width = parseInt(graphic.style("width")) - margin.left - margin.right;
  //height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion
  var height = (config.optional.seriesHeight[size] * graphic_data.length) + (3 * (graphic_data.length - 1));

  // clear out existing graphics
  graphic.selectAll("*").remove();

  columnNames = graphic_data.columns.slice(1);

  numbers = graphic_data.flatMap(function(d) {
      return Object.values(d).map(Number).filter(d => !isNaN(d))
    })
    .sort(d3.ascending);

  dataPivoted = Array.from(pivot(graphic_data, graphic_data.columns.slice(1), "region", "value"))

  if (config.essential.breaks == "jenks") {
    breaks = [];

    ss.ckmeans(numbers, config.essential.numberOfBreaks).map(function(cluster, i) {
      if (i < config.essential.numberOfBreaks - 1) {
        breaks.push(cluster[0]);
      } else {
        breaks.push(cluster[0]);
        //if the last cluster take the last max value
        breaks.push(cluster[cluster.length - 1]);
      }
    });
  } else if (config.essential.breaks == "equal") {
    breaks = ss.equalIntervalBreaks(numbers, dvc.numberBreaks);
  } else {
    breaks = config.essential.breaks;
  }




  //set up scales
  const x = d3.scaleBand()
    .paddingOuter(0)
    .paddingInner((columnNames.length - 1) * 3 / (chart_width - ((columnNames.length - 1) * 3)))
    .range([0, chart_width])
    .round(true)
    .domain(columnNames);

  const y = d3.scaleBand()
    .paddingOuter(0)
    .paddingInner((graphic_data.length - 1) * 3 / (graphic_data.length * 30))
    .range([0, height])
    .round(true);

  colour = d3.scaleThreshold()
    .domain(breaks.slice(1, 6))
    .range(chroma.scale(chroma.brewer[config.essential.colour_palette]).colors(config.essential.numberOfBreaks))

  // draw a legend, stealing code from simple maps template
  legend.selectAll("*").remove();
  key = legend.append("svg")
    .attr("id", "key")
    .attr('aria-hidden', true)
    .attr("width", chart_width + margin.left + margin.right)
    .attr("height", 75)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',35)');

  legendx = d3.scaleLinear()
    .domain([breaks[0], breaks[config.essential.numberOfBreaks]])
    .range([0, chart_width])

  key.append('g').selectAll('rect.blocks')
    .data(colour.range().map((d, i) => {
      return {
        x0: legendx(breaks[i]),
        x1: legendx(breaks[i + 1]),
        fill: d
      }
    }))
    .join('rect')
    .attr('class', 'blocks')
    .attr('height', 10)
    .attr('x', d => d.x0)
    .attr('width', d => d.x1 - d.x0)
    .style('fill', d => d.fill)

  key.append('g')
    .attr('transform', 'translate(0,0)')
    .call(d3.axisBottom(legendx).tickValues(breaks).tickSize(15).tickFormat(d3.format(config.essential.legendFormat)))

  key.append('text')
    .attr('id', 'keytext')
    .attr('text-anchor', 'middle')
    .attr('dy', -12)

  key.append('g').attr('id', 'keysymbol')
    .append('path')
    .attr('d', d3.symbol(d3.symbolTriangle))
    .attr('stroke', 'black')
    .attr('stroke-width', '2px')
    .attr('fill', 'white')
    .attr('opacity', 0)

  //use the data to find unique entries in the name column
  y.domain([...new Set(graphic_data.map(d => d.name))]);

  //set up yAxis generator
  var yAxis = d3.axisLeft(y)
    .tickSize(0)
    .tickPadding(10)

  //set up xAxis generator
  var xAxis = d3.axisTop(x)
    .tickSize(0)

  //create svg for chart
  svg = d3.select('#graphic').append('svg')
    .attr("width", chart_width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "chart")
    .style("background-color", "#fff")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")")

  svg
    .append('g')
    .attr('class', 'x axis')
    .call(xAxis)

  if (config.essential.cascadeX === true) {

    d3.selectAll("g.x.axis text")
      .each(function(d, i) {
        d3.select(this)
          .attr('dy', -20 * i)
          .attr('text-anchor', 'end')
          .attr('x', x.bandwidth() / 2);

        let bbox = this.getBBox();

        d3.select(this.parentNode)
          .append("line")
          .attr('x1', x.bandwidth() / 2 - 2)
          .attr('x2', x.bandwidth() / 2 - 2)
          .attr('y1', 0)
          .attr('y2', bbox.y + bbox.height)
          .attr('stroke', 'black')
          .attr('stroke-width', "3px");
      });
  } //end cascadeX if loop


  svg
    .append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .selectAll('text').call(wrap, margin.left - 10)

  svg.append('g')
    .selectAll('rect')
    .data(dataPivoted)
    .join('rect')
    .attr('fill', d => colour(+d.value))
    .attr('x', d => x(d.region))
    .attr('y', d => y(d.name))
    .attr('width', x.bandwidth())
    .attr('height', y.bandwidth())
    .on('mouseover', function(d) {
      d3.select('#keytext')
        .text(d3.format(config.essential.dataLabelsNumberFormat)(d3.select(this).data()[0].value))
        .transition()
        .attr('x', legendx(+d3.select(this).data()[0].value))

      d3.select('#keysymbol path')
        .attr('opacity', 1)

      d3.select('#keysymbol')
        .transition()
        .attr('transform', 'translate(' + legendx(+d3.select(this).data()[0].value) + ',0)')
    })
    .on("mouseout", mouseout)

  svg.append('g')
    .selectAll('text')
    .data(dataPivoted)
    .join('text')
    .attr('class', 'dataLabels')
    .attr('fill', d => d.value >= breaks[2] ? "#ffffff" : "#414042")
    .attr('x', d => x(d.region))
    .attr('dx', x.bandwidth() / 2)
    .attr('y', d => y(d.name))
    .attr('dy', y.bandwidth() / 2 + 4)
    .attr('text-anchor', 'middle')
    .text(d => d3.format(config.essential.dataLabelsNumberFormat)(d.value))
    .attr("pointer-events", "none")

  //create link to source
  d3.select("#source")
    .text("Source – " + config.essential.sourceText)

  //use pym to calculate chart dimensions
  if (pymChild) {
    pymChild.sendHeight();
  }
}

function mouseout() {
  d3.select('#keytext').text("")
  d3.select('#keysymbol path').attr('opacity', 0)
}

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
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
    var breaks = text.selectAll("tspan").size();
    text.attr("y", function() {
      return -6 * (breaks - 1);
    });
  });

}

// This is from bostock's notebook https://observablehq.com/d/ac2a320cf2b0adc4
// which is turn comes from this thread on wide to long data https://github.com/d3/d3-array/issues/142
function* pivot(data, columns, name, value, opts) {
  const keepCols = columns ?
    data.columns.filter(c => !columns.includes(c)) :
    data.columns;
  for (const col of columns) {
    for (const d of data) {
      const row = {};
      keepCols.forEach(c => {
        row[c] = d[c];
      });
      // TODO, add an option to ignore if fails a truth test to approximate `values_drop_na`
      row[name] = col;
      row[value] = d[col];
      yield row;
    }
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
