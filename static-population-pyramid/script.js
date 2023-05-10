const graphic = d3.select('#graphic');
const titles = d3.select('#titles')
const legend = d3.select('#legend')
var pymChild = null;

function drawGraphic() {

  // clear out existing graphics
  graphic.selectAll("*").remove();
  titles.selectAll("*").remove();
  legend.selectAll("*").remove();

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
  margin.centre = config.optional.margin.centre

  // calculate percentage if we have numbers
  // percentages are based of total populations as is common practice amongst pop pyramids
  if (config.essential.dataType == "numbers") {
    popTotal = d3.sum(graphic_data, d => (d.maleBar + d.femaleBar))


    // turn into tidy data
    graphic_data_new = graphic_data.map(function (d) {
      return [{
        age: d.age,
        sex: 'female',
        value: d.femaleBar / popTotal,
      }, {
        age: d.age,
        sex: 'male',
        value: d.maleBar / popTotal
      }]
    }).flatMap(d => d);
  } else {
    // turn into tidy data
    graphic_data_new = graphic_data.map(function (d) {
      return [{
        age: d.age,
        value: d.femaleBar,
        sex: 'female'
      }, {
        age: d.age,
        sex: 'male',
        value: d.maleBar
      }]
    }).flatMap(d => d)
  }

  maxPercentage = d3.max(graphic_data_new, d => d.value)

  // set up widths
  fullwidth = parseInt(graphic.style("width"))
  chart_width = ((parseInt(graphic.style("width")) - margin.centre) / 2) - margin.left - margin.right
  height = (graphic_data_new.length / 2 * config.optional.seriesHeight[size])

  // set up some scales, first the left scale
  xLeft = d3.scaleLinear()
  .domain([0,maxPercentage])
  .rangeRound([chart_width,0])

  // right scale
  xRight= d3.scaleLinear()
  .domain(xLeft.domain())
  .rangeRound([chart_width+margin.centre,chart_width*2+margin.centre])

  // y scale
  y = d3.scaleBand()
  .domain([...new Set(graphic_data_new.map(d=>d.age))])
  .rangeRound([height,0])
  .paddingInner(0.1)

  // create the svg
  svg = graphic.append('svg').attr('class','chart')
      .attr('height', height + margin.top + margin.bottom)
      .attr('width', fullwidth)
      .append('g')
      .attr('transform','translate('+margin.left+','+margin.top+')')

  //add x-axis left
  svg.append('g').attr('class','x axis')
  .attr('transform','translate(0,'+height+')')
  .call(d3.axisBottom(xLeft).tickFormat(d3.format(".1%")).ticks(config.optional.xAxisTicks[size]).tickSize(-height))
  .selectAll('line').each(function(d){
    if (d == 0) {d3.select(this).attr('class','zero-line')};
  })

  //add x-axis right
  svg.append('g').attr('class','x axis right')
  .attr('transform','translate(0,'+height+')')
  .call(d3.axisBottom(xRight).tickFormat(d3.format(".1%")).ticks(config.optional.xAxisTicks[size]).tickSize(-height))
  .selectAll('line').each(function(d){
    if (d == 0) {d3.select(this).attr('class','zero-line')};
  })

  // add bars
  svg.append('g')
  .selectAll('rect')
  .data(graphic_data_new)
  .join('rect')
  .attr('fill',d=> d.sex==="female" ? config.essential.colour_palette[0] : config.essential.colour_palette[1])
  .attr("x", d => d.sex === "female" ? xLeft(d.value) : xRight(0))
  .attr("y", d => y(d.age))
  .attr("width", d => d.sex === "female" ? xLeft(0) - xLeft(d.value) : xRight(d.value) - xRight(0))
  .attr("height", y.bandwidth());

  //add y-axis
  svg.append('g').attr('class','y axis')
  .attr('transform','translate('+(chart_width+margin.centre/2-3)+',0)')
  .call(d3.axisRight(y).tickSize(0).tickValues(y.domain().filter((d,i)=>!(i%10))))
  .selectAll('text').each(function(){d3.select(this).attr('text-anchor','middle')})

  //add x-axis titles
  svg.append('text')
  .attr('transform','translate('+(fullwidth-margin.left-margin.right)+','+(height+30)+')')
  .attr('class','axis--label')
  .attr('text-anchor','end')
  .text(config.essential.xAxislabel)



  //add y-axis title
  svg.append('text')
  .attr('transform','translate('+(chart_width+margin.centre/2)+',-15)')
  .attr('class','axis--label')
  .attr('text-anchor','middle')
  .text("Age")

  widths=[chart_width + margin.left,chart_width+margin.right]

  legend.append('div')
  .attr('class','flex-row')
  .style('gap',margin.centre+'px')
  .selectAll('div')
  .data(['Females','Males'])
  .join('div')
  .style('width', (d,i)=>widths[i]+ "px")
  .append('div')
  .attr('class', 'chartLabel')
  .append('p').text(d=>d)

  dataForLegend=[['x','x']] //dummy data

  titleDivs=titles.selectAll('div')
  .data(dataForLegend)
  .join('div')
  .attr('class','flex-row')
  .style('gap',margin.centre+'px')
  .selectAll('div')
  .data(d=>d)
  .join('div')
  .style('width', (d,i)=>widths[i]+ "px")
  .append('div').attr('class', 'legend--item')

  titleDivs.append('div')
  .style('background-color',(d,i)=>config.essential.colour_palette[i])
  .attr('class','legend--icon--circle')

  titleDivs.append('div')
  .append('p').attr('class', 'legend--text').html(config.essential.legend)

  //create link to source
  d3.select("#source")
      .text("Source: " + config.essential.sourceText)

  //use pym to calculate chart dimensions
  if (pymChild) {
    pymChild.sendHeight();
  }
}//end draw graphic

d3.csv(config.essential.graphic_data_url, d3.autoType)
  .then(data => {
    //load chart data
    graphic_data = data

    //use pym to create iframed chart dependent on specified variables
    pymChild = new pym.Child({
      renderCallback: drawGraphic
    });
  });
