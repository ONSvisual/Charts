const graphic = d3.select('#graphic');
const titles = d3.select('#titles')
const legend = d3.select('#legend')
var pymChild = null;

function drawGraphic() {

  // clear out existing graphics
  graphic.selectAll("*").remove();
  titles.selectAll("*").remove();
  legend.selectAll("*").remove();
  d3.select("#select").selectAll("*").remove();

  //population accessible summmary
  d3.select('#accessibleSummary').html(config.essential.accessibleSummary)


  // build dropdown, first unique areas
  // https://stackoverflow.com/questions/38613654/javascript-find-unique-objects-in-array-based-on-multiple-properties
  dropdownData = graphic_data.map(function (d) { return { nm: d.AREANM, cd: d.AREACD } }).filter(function (a) {
    var key = a.nm + '|' + a.cd;
    if (!this[key]) {
      this[key] = true;
      return true;
    }
  }, Object.create(null)).sort((a,b)=>d3.ascending(a.nm,b.nm));//sorted alphabetically

  // // Build option menu
  const optns = d3.select("#select").append("div").attr("id", "sel").append("select")
    .attr("id", "areaselect")
    .attr("style", "width:calc(100% - 6px)")
    .attr("class", "chosen-select");

  optns.append("option")

  //join unique names and codes to build select
  optns.selectAll("p").data(dropdownData).join("option")
    .attr("value", function (d) { return d.cd })
    .text(function (d) { return d.nm });

  // start the chosen dropdown
  $('#areaselect').chosen({ placeholder_text_single: "Select an area", allow_single_deselect: true })

  //add some more accessibility stuff
  d3.select('input.chosen-search-input').attr('id', 'chosensearchinput')
  d3.select('div.chosen-search').insert('label', 'input.chosen-search-input').attr('class', 'visuallyhidden').attr('for', 'chosensearchinput').html("Type to select an area")

  // draw the bars on change
  $('#areaselect').on('change', function () {

    if ($('#areaselect').val() != "") {
      d3.select('#bars').selectAll('rect')
      .data(tidydataPercentage.filter(d=>d.AREACD==$('#areaselect').val()))
        .join('rect')
        .attr('fill', d => d.sex === "female" ? config.essential.colour_palette[0] : config.essential.colour_palette[1])
        .attr("y", d => y(d.age))
        .attr("height", y.bandwidth())
        .transition()
        .attr("x", d => d.sex === "female" ? xLeft(d.percentage) : xRight(0))
        .attr("width", d => d.sex === "female" ? xLeft(0) - xLeft(d.percentage) : xRight(d.percentage) - xRight(0))

        // clear the chart via keyboard
        d3.select('button.abbr').on('keypress',function(evt){
          if(evt.keyCode==13 || evt.keyCode==32){
            evt.preventDefault();
            clear()
          }
        })
    }
    else {//on clear
      clear()
    }
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

  allAges = graphic_data.columns.slice(3)

  // calculate percentage if we have numbers
  if (config.essential.dataType == "numbers") {

    // turn into tidy data
    tidydata = pivot(graphic_data, graphic_data.columns.slice(3), 'age', 'value')

    //rollup to work out totals
    rolledUp = d3.rollup(tidydata, v => d3.sum(v, d => d.value), d => d.AREACD)

    // then use total to work out percentages
    tidydataPercentage = tidydata.map(function (d) {
      return {
        ...d,
        percentage: d.value / rolledUp.get(d.AREACD)
      }
    })

    //work out percentages for comparison
    comparisonPopTotal = d3.sum(comparison_data, d => (d.maleBar + d.femaleBar))

    comparison_data_new = comparison_data.map(function (d) {
      return {
        age: d.age,
        male: d.maleBar / comparisonPopTotal,
        female: d.femaleBar / comparisonPopTotal
      }
    })


  } else {
    // turn into tidy data
    tidydataPercentage = pivot(graphic_data, graphic_data.columns.slice(3), 'age', 'value')

    comparison_data_new = comparison_data.map(function (d) {
      return {
        age: d.age,
        male: d.maleBar,
        female: d.femaleBar
      }
    })
  }

  maxPercentage = d3.max([
    d3.max(tidydataPercentage, d => d.percentage),
    d3.max(comparison_data_new, d => d3.max([d.female, d.male]))])

  // set up widths
  fullwidth = parseInt(graphic.style("width"))
  chart_width = ((parseInt(graphic.style("width")) - margin.centre) / 2) - margin.left - margin.right
  height = allAges.length * config.optional.seriesHeight[size]

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
    .domain(allAges)
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
    .x(d => xLeft(d.female))
    .y(d => y(d.age) + y.bandwidth())

  lineRight = d3.line()
    .curve(d3.curveStepBefore)
    .x(d => xRight(d.male))
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
  svg.append('g').attr('id','bars')
  .selectAll('rect')
  .data(tidydataPercentage.filter(d=>d.AREACD==graphic_data[0].AREACD))
  .join('rect')
  .attr('fill', d => d.sex === "female" ? config.essential.colour_palette[0] : config.essential.colour_palette[1])
  .attr("y", d => y(d.age))
  .attr("height", y.bandwidth())
  .attr("x", d => d.sex === "female" ? xLeft(0) : xRight(0))
  .attr("width", 0)

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
]).then(([data, datab]) => {
  //load chart data
  graphic_data = data;
  comparison_data = datab;

  //use pym to create iframed chart dependent on specified variables
  pymChild = new pym.Child({
    renderCallback: drawGraphic
  });
});

function clear(){
  d3.select('#bars').selectAll('rect')
  .transition()
  .attr("x", d => d.sex === "female" ? xLeft(0) : xRight(0))
  .attr("width", 0)

  $("#areaselect").val(null).trigger('chosen:updated');
 }

// bostock pivot longer function from https://observablehq.com/d/3ea8d446f5ba96fe
function pivot(data, columns, name, value) {
  const keep = data.columns.filter(c => !columns.includes(c));
  return data.flatMap(d => {
    const base = keep.map(k => [k, d[k]]);
    return columns.map(c => {
      return Object.fromEntries([
        ...base,
        [name, c],
        [value, d[c]]
      ]);
    });
  });
}
