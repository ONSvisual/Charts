var graphic = d3.select('#graphic');
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

  const numbers = new Map;

  columnNames.forEach((item) => {
    numbers.set(item,graphic_data.map(d => +d[item]));
  });

  const breaks = new Map;

  dataPivoted=Array.from(pivot(graphic_data,graphic_data.columns.slice(1),"region","value"))

  if (config.essential.breaks == "jenks") {
    columnNames.forEach((item) => {

      let temp = [];

      ss.ckmeans(numbers.get(item), config.essential.numberOfBreaks).map(function(cluster, i) {
        if (i < config.essential.numberOfBreaks - 1) {
          temp.push(cluster[0]);
        } else {
          temp.push(cluster[0]);
          //if the last cluster take the last max value
          temp.push(cluster[cluster.length - 1]);
        }
      });
      breaks.set(item,temp)
    });
  } else if (config.essential.breaks == "equal") {
    columnNames.forEach((item) => {
      breaks.set(item,ss.equalIntervalBreaks(numbers.get(item), dvc.numberBreaks));
    });
  } else {
    columnNames.forEach((item) => {
      breaks.set(item,config.essential.breaks[item])
    });
  }

  //set up scales
  const x = d3.scaleBand()
    .paddingOuter(0)
    .paddingInner((columnNames.length - 1) * 10 / (chart_width-((columnNames.length-1)*10)))
    .range([0, chart_width])
    .round(true)
    .domain(columnNames);

  const y = d3.scaleBand()
    .paddingOuter(0)
    .paddingInner((graphic_data.length - 1) * 3 / (graphic_data.length * 30))
    .range([0, height])
    .round(true);

  const colour = new Map;
  columnNames.forEach((item) => {
    colour.set(item,d3.scaleThreshold()
      .domain(breaks.get(item).slice(0,-1))
      .range(chroma.scale(chroma.brewer[config.essential.colour_palette]).colors(config.essential.numberOfBreaks))
    )
  });

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


  svg
    .append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .selectAll('text').call(wrap, margin.left - 10)

  svg.append('g')
    .selectAll('rect')
    .data(dataPivoted)
    .join('rect')
    .attr('fill',d=>colour.get(d.region)(+d.value))
    .attr('x',d=>x(d.region))
    .attr('y',d=>y(d.name))
    .attr('width',x.bandwidth())
    .attr('height',y.bandwidth())

  svg.append('g')
    .selectAll('text')
    .data(dataPivoted)
    .join('text')
    .attr('class','dataLabels')
    .attr('fill', (d) => chroma.contrast(colour.get(d.region)(+d.value), "#fff") < 4.5 ? "#414042" : "#fff")
    .attr('x',d=>x(d.region))
    .attr('dx',x.bandwidth()/2)
    .attr('y',d=>y(d.name))
    .attr('dy',y.bandwidth()/2+4)
    .attr('text-anchor','middle')
    .text(d=>d3.format(config.essential.dataLabelsNumberFormat)(d.value))

  //create link to source
  d3.select("#source")
    .text("Source – " + config.essential.sourceText)

  //use pym to calculate chart dimensions
  if (pymChild) {
    pymChild.sendHeight();
  }
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
  const keepCols = columns
    ? data.columns.filter(c => !columns.includes(c))
    : data.columns;
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
