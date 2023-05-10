const graphic = d3.select('#graphic');
const titles = d3.select('#titles')
const legend = d3.select('#legend')
var pymChild = null;

function drawGraphic() {

  // clear out existing graphics
  graphic.selectAll("*").remove();
  titles.selectAll("*").remove();
  legend.selectAll("*").remove();
  d3.select('#nav').selectAll("*").remove();

  //population accessible summmary
  d3.select('#accessibleSummary').html(config.essential.accessibleSummary)


  // build buttons
  fieldset = d3.select('#nav').append('fieldset');

  fieldset
    .append('legend')
    .attr('class', 'visuallyhidden')
    .html('Choose a variable');

  fieldset
    .append("div")
    .attr('class', 'visuallyhidden')
    .attr('aria-live', 'polite')
    .append('span')
    .attr('id', 'selected');

  grid = fieldset.append('div')
    .attr('class', 'grid');

  cell = grid.selectAll('div.grid-cell')
    .data(config.essential.buttonLabels)
    .join('div')
    .attr('class', 'grid-cell');

  cell.append('input')
    .attr('type', 'radio')
    .attr('class', 'visuallyhidden')
    .attr('id', function (d, i) { return 'button' + i; })
    .attr('value', function (d, i) { return i; })
    .attr('name', 'button');

  cell.append('label')
    .attr('for', function (d, i) { return 'button' + i; })
    .append('div')
    .html(function (d) { return d; });

  // set first button to selected
  d3.select('#button0').property('checked', true);
  d3.select('#selected').text(config.essential.buttonLabels[document.querySelector('input[name="button"]:checked').value] + " is selected");

  // button interactivity
  d3.selectAll('input[type="radio"]').on('change', function (d) {
    onchange(document.querySelector('input[name="button"]:checked').value);
    d3.select('#selected').text(config.essential.buttonLabels[document.querySelector('input[name="button"]:checked').value] + " is selected");
  });




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

    comparisonPopTotal = d3.sum(comparison_data, d => (d.maleBar + d.femaleBar))

    timeComparisonPopTotal = d3.sum(time_comparison_data, d => (d.maleBar + d.femaleBar))

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

    comparison_data_new = comparison_data.map(function (d) {
      return {
        age: d.age,
        malePercent: d.maleBar / comparisonPopTotal,
        femalePercent: d.femaleBar / comparisonPopTotal
      }
    })

    time_comparison_data_new = time_comparison_data.map(function (d) {
      return {
        age: d.age,
        malePercent: d.maleBar / timeComparisonPopTotal,
        femalePercent: d.femaleBar / timeComparisonPopTotal
      }
    })
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

    comparison_data_new = comparison_data.map(function (d) {
      return {
        age: d.age,
        malePercent: d.maleBar,
        femalePercent: d.femaleBar
      }
    })

    time_comparison_data = time_comparison_data.map(function (d) {
      return {
        age: d.age,
        malePercent: d.maleBar,
        femalePercent: d.femaleBar
      }
    })
  }

  maxPercentage = d3.max([
    d3.max(graphic_data_new, d => d.value),
    d3.max(comparison_data_new, d => d3.max([d.femaleBar, d.maleBar])),
    d3.max(time_comparison_data_new, d => d3.max([d.femaleBar, d.maleBar]))
  ])

  // set up widths
  fullwidth = parseInt(graphic.style("width"))
  chart_width = ((parseInt(graphic.style("width")) - margin.centre) / 2) - margin.left - margin.right
  height = (graphic_data_new.length / 2 * config.optional.seriesHeight[size])

  // set up some scales, first the left scale
  xLeft = d3.scaleLinear()
    .domain([0, maxPercentage])
    .rangeRound([chart_width, 0])

  // right scale
  xRight = d3.scaleLinear()
    .domain(xLeft.domain())
    .rangeRound([chart_width + margin.centre, chart_width * 2 + margin.centre])

  // y scale
  y = d3.scaleBand()
    .domain([...new Set(graphic_data.map(d => d.age))])
    .rangeRound([height, 0])
    .paddingInner(0.1)

  // create the svg
  svg = graphic.append('svg').attr('class', 'chart')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', fullwidth)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')


  // create line generators
  lineLeft = d3.line()
    .curve(d3.curveStepBefore)
    .x(d => xLeft(d.femalePercent))
    .y(d => y(d.age) + y.bandwidth())

  lineRight = d3.line()
    .curve(d3.curveStepBefore)
    .x(d => xRight(d.malePercent))
    .y(d => y(d.age) + y.bandwidth())

  //add x-axis left
  svg.append('g').attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(xLeft).tickFormat(d3.format(".1%")).ticks(config.optional.xAxisTicks[size]).tickSize(-height))
    .selectAll('line').each(function (d) {
      if (d == 0) { d3.select(this).attr('class', 'zero-line') };
    })

  //add x-axis right
  svg.append('g').attr('class', 'x axis right')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(xRight).tickFormat(d3.format(".1%")).ticks(config.optional.xAxisTicks[size]).tickSize(-height))
    .selectAll('line').each(function (d) {
      if (d == 0) { d3.select(this).attr('class', 'zero-line') };
    })

  // add bars
  svg.append('g')
    .selectAll('rect')
    .data(graphic_data_new)
    .join('rect')
    .attr('fill', d => d.sex === "female" ? config.essential.colour_palette[0] : config.essential.colour_palette[1])
    .attr("x", d => d.sex === "female" ? xLeft(d.value) : xRight(0))
    .attr("y", d => y(d.age))
    .attr("width", d => d.sex === "female" ? xLeft(0) - xLeft(d.value) : xRight(d.value) - xRight(0))
    .attr("height", y.bandwidth());

  //add y-axis
  svg.append('g').attr('class', 'y axis')
    .attr('transform', 'translate(' + (chart_width + margin.centre / 2 - 3) + ',0)')
    .call(d3.axisRight(y).tickSize(0).tickValues(y.domain().filter((d, i) => !(i % 10))))
    .selectAll('text').each(function () { d3.select(this).attr('text-anchor', 'middle') })

  //draw comparison lines
  comparisons = svg.append('g')

  comparisons.append('path').attr('class', 'line').attr('id', 'comparisonLineLeft')
    .attr('d', lineLeft(comparison_data_new) + 'l 0 ' + -y.bandwidth())
    .attr('stroke', config.essential.comparison_colour_palette[0])
    .attr('stroke-width', '2px')

  comparisons.append('path').attr('class', 'line').attr('id', 'comparisonLineRight')
    .attr('d', lineRight(comparison_data_new) + 'l 0 ' + -y.bandwidth())
    .attr('stroke', config.essential.comparison_colour_palette[1])
    .attr('stroke-width', '2px')

  //add x-axis titles
  svg.append('text')
    .attr('transform', 'translate(' + (fullwidth - margin.left - margin.right) + ',' + (height + 30) + ')')
    .attr('class', 'axis--label')
    .attr('text-anchor', 'end')
    .text(config.essential.xAxislabel)


  //add y-axis title
  svg.append('text')
    .attr('transform', 'translate(' + (chart_width + margin.centre / 2) + ',-15)')
    .attr('class', 'axis--label')
    .attr('text-anchor', 'middle')
    .text("Age")

  // Set up the legend
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

  dataForLegend=[['x','x'],['y','y']] //dummy data

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
  .style('background-color',(d,i)=>d=='x' ? config.essential.colour_palette[i] : config.essential.comparison_colour_palette[i])
  .attr('class',d=>d=='x' ? 'legend--icon--circle' : 'legend--icon--refline')

  titleDivs.append('div')
  .append('p').attr('class', 'legend--text').html(d=>d=='x' ? config.essential.legend[0] : config.essential.legend[1])


  function onchange(value) {
    d3.select("#comparisonLineLeft").transition().attr('d', () => value == 0 ? lineLeft(comparison_data_new) + 'l 0 ' + -y.bandwidth() : lineLeft(time_comparison_data_new) + 'l 0 ' + -y.bandwidth())
    d3.select("#comparisonLineRight").transition().attr('d', () => value == 0 ? lineRight(comparison_data_new) + 'l 0 ' + -y.bandwidth() : lineRight(time_comparison_data_new) + 'l 0 ' + -y.bandwidth())
  }

  //create link to source
  d3.select("#source")
    .text("Source: " + config.essential.sourceText)

  //use pym to calculate chart dimensions
  if (pymChild) {
    pymChild.sendHeight();
  }
}//end draw graphic

Promise.all([
  d3.csv(config.essential.graphic_data_url, d3.autoType),
  d3.csv(config.essential.comparison_data, d3.autoType),
  d3.csv(config.essential.comparison_time_data, d3.autoType)
]).then(([data, datab, datac]) => {
  //load chart data
  graphic_data = data;
  comparison_data = datab;
  time_comparison_data = datac

  //use pym to create iframed chart dependent on specified variables
  pymChild = new pym.Child({
    renderCallback: drawGraphic
  });
});
