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
  var height = (config.optional.seriesHeight[size] * graphic_data.length) + (10*(graphic_data.length-1)) + 12

  // clear out existing graphics
  graphic.selectAll("*").remove();

  //set up scales
  const x = d3.scaleLinear()
    .range([0, chart_width]);

  const y = d3.scaleBand()
    .paddingOuter(0.2)
    .paddingInner((graphic_data.length-1)*10/(graphic_data.length*30))
    .range([0, height])
    .round(true);

  const colour = d3.scaleOrdinal()
    .domain(graphic_data.columns.slice(1))
    .range(config.essential.colour_palette)

  //use the data to find unique entries in the name column
  y.domain([...new Set(graphic_data.map(d => d.name))]);

  //set up yAxis generator
  var yAxis = d3.axisLeft(y)
    .tickSize(0)
    .tickPadding(10)

  const stack = d3.stack()
    .keys(graphic_data.columns.slice(1))
    .offset(d3[config.essential.stackOffset])
    .order(d3[config.essential.stackOrder])

  const series = stack(graphic_data)

  //set up xAxis generator
  var xAxis = d3.axisBottom(x)
    .tickSize(-height)
    .tickFormat(d3.format(config.essential.xAxisTickFormat))
    .ticks(config.optional.xAxisTicks[size]);

  //create svg for chart
  svg = d3.select('#graphic').append('svg')
    .attr("width", chart_width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "chart")
    .style("background-color", "#fff")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")")

  if(config.essential.xDomain=="auto"){
    x.domain(d3.extent(series.flat(2))); //flatten the arrays and then get the extent
  }else{
    x.domain(config.essential.xDomain);
  }

  // Set up the legend
  var legenditem = d3.select('#legend')
    .selectAll('div.legend--item')
    .data(d3.zip(graphic_data.columns.slice(1), config.essential.colour_palette))
    .enter()
    .append('div')
    .attr('class', 'legend--item')

  legenditem.append('div').attr('class', 'legend--icon--circle')
    .style('background-color', function(d) {
      return d[1]
    })

  legenditem.append('div')
    .append('p').attr('class', 'legend--text').html(function(d) {
      return d[0]
    })

  svg
    .append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .attr('class', 'x axis')
    .call(xAxis).selectAll('line').each(function(d)
      {
        if (d == 0) {
          d3.select(this)
          .attr('class','zero-line');
        }
      });


  svg
    .append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .selectAll('text').call(wrap,margin.left-10)


  svg.append('g')
    .selectAll("g")
    .data(series)
    .join("g")
    .attr("fill", (d,i) => config.essential.colour_palette[i])
    .selectAll("rect")
    .data(d => d)
    .join("rect")
    .attr("x", (d) => Math.min(x(d[0]), x(d[1])))
    .attr("y", (d) => y(d.data.name))
    .attr("width", (d) => Math.abs(x(d[0]) - x(d[1])))
    .attr("height", y.bandwidth());


// This does the x-axis label
    svg
    .append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .append('text')
    .attr('x',chart_width)
    .attr('y',35)
    .attr('class','axis--label')
    .text(config.essential.xAxisLabel)
    .attr('text-anchor','end');



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
            tspan = text.text(null).append("tspan").attr('x',x);
          while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text.append("tspan").attr('x',x).attr("dy", lineHeight + "em").text(word);
            }
          }
          var breaks = text.selectAll("tspan").size();
          text.attr("y", function(){return -6 * (breaks-1);});
        });

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
