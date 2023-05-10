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
  //height is set by unique options in column name * a fixed height
  var height = config.optional.seriesHeight[size] * graphic_data.length

  // clear out existing graphics
  graphic.selectAll("*").remove();

  //set up scales
  var x = d3.scaleLinear()
    .range([0, chart_width]);

  var y = d3.scalePoint()
    .padding(0.5)
    .range([0, height]);

  //use the data to find unique entries in the name column
  y.domain(graphic_data.map(d => d.name));

  //set up yAxis generator
  var yAxis = d3.axisLeft(y)
    .tickSize(-chart_width)
    .tickPadding(10)

  //set up xAxis generator
  var xAxis = d3.axisBottom(x)
    .tickSize(-height)
    .ticks(config.optional.xAxisTicks[size]);

  // Set up the legend
  var legenditem = d3.select('#legend')
    .selectAll('div.legend--item')
    .data(d3.zip(config.essential.legendLabels, config.essential.colour_palette))
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


  //create svg for chart
  svg = d3.select('#graphic').append('svg')
    .attr("width", chart_width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "chart")
    .style("background-color", "#fff")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")")


  if(config.essential.xDomain=="auto"){
    var max = d3.max(graphic_data, function(d) {
      return d3.max([+d.min, +d.max]);
    });
    x.domain([0, max]);
  }else{
    x.domain(config.essential.xDomain)
  }

  svg
    .append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .attr('class', 'x axis')
    .call(xAxis).selectAll('line').each(function(d)
      {
        if (d == 0) {
          d3.select(this)
          .attr('class', 'zero-line')
            };
      })



  svg
    .append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .attr('stroke-dasharray','2 2')
    .selectAll('text').call(wrap,margin.left-5);

  svg.selectAll('circle.min')
    .data(graphic_data)
    .enter()
    .append('circle')
    .attr('class', 'min')
    .attr('r', 6)
    .attr('fill', config.essential.colour_palette[0])
    .attr('cx', function(d) {
      return x(d.min)
    })
    .attr('cy', function(d) {
      return y(d.name)
    })

  svg.selectAll('circle.max')
    .data(graphic_data)
    .enter()
    .append('circle')
    .attr('class', 'max')
    .attr('r', 6)
    .attr('fill', config.essential.colour_palette[1])
    .attr('cx', function(d) {
      return x(d.max)
    })
    .attr('cy', function(d) {
      return y(d.name)
    })


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
