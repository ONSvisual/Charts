var graphic = d3.select('#graphic');
var pymChild = null;

function drawGraphic() {

  // clear out existing graphics
  graphic.selectAll("*").remove();

  if (parseInt(graphic.style("width")) < config.essential.threshold_sm) {
    size = "sm"
  } else {
    size = "not sm"
  }

  //population accessible summmary
  d3.select('#accessibleSummary').html(config.essential.accessibleSummary)

  formatNo = d3.format(config.essential.numberFormat)

  // set up scale
  x = d3.scaleLinear()
    .range([0, 100])
    .domain([d3.min([0, d3.min(graphic_data, d => +d.value)]), d3.max(graphic_data, d => +d.value)])



  // nest data
  groupedData = d3.groups(graphic_data, d => d.plot, d => d.ycategory)

  // unique columns
  xcategories = [...new Set(graphic_data.map(d => d.xcategory))]

  if (config.essential.colour_palette_type == "categorical") {
    colour = d3.scaleOrdinal()
      .range(config.essential.colour_palette_colours)
      .domain(xcategories)

    if(size=="sm"){
      // Set up the legend
    var legenditem = d3.select('#legend')
      .selectAll('div.legend--item')
      .data(d3.zip(xcategories, config.essential.colour_palette_colours))
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
    }


  }

  // create div for each plot, here England, Wales
  plots = graphic.selectAll('div.plots').data(groupedData)
    .join('div')
    .attr('class', 'plots')

  plots.append('p')
    .attr('class', 'plot--title')
    .html(d => d[0])

  // create a div for the chart
  chart = plots.append('div').attr('class', 'chart')


  if(size!="sm"){
    // create a div for the headers
    headers = chart.append('div').attr('class', 'splitBar-label')

    // create div for the first square
    headers.append('div')
      .attr('class', 'rowLabel')
      .style('width', config.essential.rowWidth + 'px')

    // create divs for the rest of the column headers
    headers.append('div').attr('class', 'headers')
      .style('width', `calc(100% - ${config.essential.rowWidth}px)`)
      .selectAll('div.column').data(xcategories)
      .join('div')
      .attr('class', 'column')
      .style('width', 100 / xcategories.length + '%')
      .append('span').html(d => d)
  }


  // create divs as rows
  rows = chart.selectAll('div.rows')
    .data(d => d[1])
    .join('div')
    .attr('class', 'splitBar-row')

  // first div as separate
  rows.append('div').attr('class', 'rowLabel')
    .style('width', config.essential.rowWidth + 'px')
    .append('span')
    .style('text-align', 'right')
    .html(d => d[0])

  // then create another div to hold all split bars
  splitBar = rows.append('div').attr('class', 'headers')
    .style('width', `calc(100% - ${config.essential.rowWidth}px)`)
    .selectAll('div.splitBar')
    .data(d => d[1])
    .join('div')
    // then add a div for each x category
    .attr('class', 'column')
    .style('width', 100 / xcategories.length + '%')

  // divs for inside the splitBar
  splitBarInner = splitBar.append('div').attr('class', 'splitBar-inner')
    // then div for the background
    .append('div')
    .attr('class', 'splitBar-inner--background')

  // add a div to help draw a line for 0
  splitBarInner.append('div')
    .attr('class', 'splitBar-bar--value')
    .style('left', 0)
    .style('width', x(0) + "%")
    .style('border-right', "1.5px solid #b3b3b3")
    .style('height', "calc(100% + 15px)")
    .style('top', "-8px")

  // then div for the value
  splitBarInner.append('div')
    .attr('class', 'splitBar-bar--value')
    .style('left', d => +d.value > 0 ? x(0) + "%" : x(+d.value) + "%")
    .style('right', d => +d.value > 0 ? 100 - x(+d.value) + "%" : (100 - x(0)) + "%")
    .style('background', function(d) {
        if (config.essential.colour_palette_type == "mono") {
          return config.essential.colour_palette_colours[0]
        } else if (config.essential.colour_palette_type == "divergent") {
          return +d.value > 0 ? config.essential.colour_palette_colours[0] : config.essential.colour_palette_colours[1]
        } else if (config.essential.colour_palette_type == "categorical") {
          return colour(d.xcategory)
        }
    })
    .append('div')
    // then a div to hold the value
    .attr('class', 'splitBar-bar--label')
    .style('margin-left', (d) => {
      if (d.value > 0) {
        return Math.abs(+x(d.value) - x(0)) < 20 ? "100%" : "calc(100% - 35px)" // you'll need to adjust these calcs if you want to move the text slightly left or right
      } else {
        return Math.abs(+x(d.value) - x(0)) > 20 ? "0%" : "calc(0% - 35px)"
      }
    })
    .append('span')
    .style('color', d => Math.abs(+x(d.value) - x(0)) < 20 ? "#222222" : "#fff")
    .html(d => formatNo(d.value))

  // final div for the zero indicator
  finalrow = chart.append('div').attr('class', 'finalRow')
  // first div as separate
  finalrow.append('div').attr('class', 'rowLabel')
    .style('width', config.essential.rowWidth + 'px')

  finalrow.append('div').attr('class', '')
    .style('margin-right', '-10px')
    .style('width', `calc(100% - ${config.essential.rowWidth}px)`)
    .style('display', 'inline-block')
    .selectAll('div.column').data(xcategories)
    .join('div')
    .attr('class', 'column')
    .style('width', 100 / xcategories.length + '%')
    .style('padding-right', '8px')
    .style('display', 'inline-block')
    .append('span')
    .style('position', 'relative')
    .style('left', 'calc(' + x(0) + "%" + ' - 5px)')
    .html(0)

  //create link to source
  d3.select("#source")
    .text("Source: " + config.essential.sourceText)



  //use pym to calculate chart dimensions
  if (pymChild) {
    pymChild.sendHeight();
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
