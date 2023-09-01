let graphic = d3.select('#graphic');
let pymChild = null;
let legend = d3.select('#legend');

function drawGraphic() {

  //population accessible summmary
  d3.select('#accessibleSummary').html(config.essential.accessibleSummary)

  let threshold_md = config.optional.mediumBreakpoint;
  let threshold_sm = config.optional.mobileBreakpoint;
  let colour = d3.scaleOrdinal(config.essential.colour_palette); //



  //set variables for chart dimensions dependent on width of #graphic
  if (parseInt(graphic.style("width")) < threshold_sm) {
    size = "sm"
  } else if (parseInt(graphic.style("width")) < threshold_md) {
    size = "md"
  } else {
    size = "lg"
  }

  const chartEvery = config.optional.chartEvery[size];

  let margin = config.optional.margin[size]
  let chart_width = (parseInt(graphic.style("width"))/chartEvery) - margin.left - margin.right;
  let height = 400 - margin.top - margin.bottom;

  // clear out existing graphics
  graphic.selectAll("*").remove();



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
 .style('background-color', (d) => colour(d) );

legenditem
 .append('div')
 .append('p')
 .attr('class', 'legend--text')
 .html((d) => d);


 // running the time parse here
 

   
  //lets also try a new smallmultiple version here which will group data on the basis of series
 grouped_data = d3.group(graphic_data, d => d.series)  


 
  //set up scales
  const x = d3.scaleTime()
    .domain(d3.extent(graphic_data, (d) => d.date))
    .range([0, chart_width]);

// console.log("x",d3.extent(graphic_data, (d) => d.date))

  const y = d3.scaleLinear()
     .range([height, 0])

  //create svg for chart
  svg = d3.select('#graphic')
     .selectAll('div')
     .data(grouped_data)
     .enter()
     .append('svg')
     .attr("width", chart_width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom)
     .attr("class", "chart")
     .style("background-color", "#fff")
     .append("g")
     .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")")

    // both of these are need to be looked at.

  if(config.essential.yDomain=="auto"){
    y.domain([0, d3.max(graphic_data,function(d){return d.yvalue})]);
  }else{
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
    .tickFormat(d3.timeFormat(config.essential.xAxisFormat)));
  

  svg
.append('g')
.attr('class','axis numeric')
.call(
  d3.axisLeft(y)
  .ticks(config.optional.yAxisTicks[size])
  .tickSize(-chart_width)
  .tickPadding(10)
  .tickFormat(d3.format(config.essential.yAxisFormat))
);



  svg.selectAll('circle')
      .data(graphic_data)
      .join('circle')
      .attr('cx',(d) => x(d.date))
      .attr('cy',(d) => y(d.yvalue))
      .attr('r',config.essential.radius)
      .attr("fill", (d) => colour(d.group)) // This adds the colour to the circles based on the group
      .attr('fill-opacity',config.essential.fillOpacity)
      .attr('stroke',(d)=> colour(d.group))
      .attr('stroke-opacity',config.essential.strokeOpacity);


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
          let text = d3.select(this),
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

//load data 
d3.csv(config.essential.graphic_data_url)
  .then((data) => {

    let parseTime = d3.timeParse(config.essential.dateFormat);
    //load chart data
    graphic_data = data;

    data.forEach((d) => {d.date = parseTime(d.date) });

    //use pym to create iframed chart dependent on specified variables
    pymChild = new pym.Child({
      renderCallback: drawGraphic
    });
  });
