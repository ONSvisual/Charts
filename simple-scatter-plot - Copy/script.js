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
   var height = config.essential.chart_height * chart_width

  // clear out existing graphics
  graphic.selectAll("*").remove();

  //set up scales
  const x = d3.scaleLinear()
    .range([0, chart_width]);

  const y = d3.scaleLinear()
     .range([height, 0])
 

  //set up yAxis generator
  var yAxis = d3.axisLeft(y)
    .tickSize(chart_width+5)
    .tickPadding(5)
    .tickFormat(d3.format(".0%"))
    .ticks(config.optional.yAxisTicks[size])
  
      //set up xAxis generator
  var xAxis = d3.axisBottom(x)
    .tickSize(-height-5)
    .tickPadding(5)
      .tickFormat(d3.format(".0%"))
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
    x.domain([0, d3.max(graphic_data,function(d){return d.value})]);
  }else{
    x.domain(config.essential.xDomain)
  }



  if(config.essential.xDomain=="auto"){
    y.domain([0, d3.max(graphic_data,function(d){return d.value2})]);
  }else{
    y.domain(config.essential.xDomain)
  }

  svg
    .append('g')
    .attr('transform', 'translate(0,' + (height +5)+ ')')
    .attr('class', 'x axis')
    .call(xAxis).selectAll('line').each(function(d)
      {
        if (d == 0) {
          d3.select(this)
          .attr('class','zero-line')
        };
      })

  svg
    .append('g')
    .attr('class', 'y axis numeric')
    .call(yAxis)
    // .selectAll('text').call(wrap,margin.left-10)
        .attr("transform","translate ("+chart_width+",0)")
    .selectAll('line').each(function(d)
    {
      if (d == 0) {
        d3.select(this)
        .attr('class','zero-line')
      };
    })



  svg.selectAll('circle')
      .data(graphic_data)
      .join('circle')
      .attr('cx',(d) => x(d.value))
      .attr('cy',(d) => y(d.value2))
      .attr('r',config.essential.radius)
        .attr("fill", config.essential.colour_palette)
      .attr('fill-opacity',config.essential.fillOpacity)
.attr('stroke',config.essential.colour_palette)
.attr('stroke-opacity',config.essential.strokeOpacity)


// This does the x-axis label
    svg
    .append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .append('text')
    .attr('x',chart_width)
    .attr('y',40)
    .attr('class','axis--label')
    .text(config.essential.xAxisLabel)
    .attr('text-anchor','end');

// This does the y-axis label
svg
.append('g')
.attr('transform', 'translate(0,0)')
.append('text')
.attr('x',-(margin.left-5))
.attr('y',-10)
.attr('class','axis--label')
.text(config.essential.yAxisLabel)
.attr('text-anchor','start');


  //create link to source
  d3.select("#source")
    .text("Source: " + config.essential.sourceText)



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
