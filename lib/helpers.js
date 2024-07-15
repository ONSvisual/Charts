export function calculateChartWidth({ screenWidth, chartEvery, chartMargin, chartGap = 10 }) {
  if (config.optional.dropYAxis) {
    // Chart width calculation allowing for {chartGap}px left margin between the charts
    const chartWidth = ((screenWidth - chartMargin.left - ((chartEvery - 1) * chartGap)) / chartEvery) - chartMargin.right;
    return chartWidth;
  } else {
    const chartWidth = ((screenWidth / chartEvery) - chartMargin.left - chartMargin.right);
    return chartWidth;
  }
}

export function addDataLabels({ svgContainer = svg, data, chart_width, labelPositionFactor = 7, xScaleFunction = x, yScaleFunction = y, y2function = null }) {

  svgContainer
    .selectAll('text.dataLabels')
    .data(data)
    .join('text')
    .attr('class', 'dataLabels')
    .attr('x', (d) => d.value > 0 ? xScaleFunction(d.value) :
      Math.abs(xScaleFunction(d.value) - xScaleFunction(0)) < chart_width / labelPositionFactor ? xScaleFunction(0) : xScaleFunction(d.value))
    .attr('dx', (d) => d.value > 0 ?
      (Math.abs(xScaleFunction(d.value) - xScaleFunction(0)) < chart_width / labelPositionFactor ? 3 : -3) :
      3)
    .attr('y', (d) => y2function ? yScaleFunction(d.name) + y2function(d.category) + y2function.bandwidth() / 2 :
      yScaleFunction(d.name) + yScaleFunction.bandwidth() / 2)
    .attr('dominant-baseline', 'middle')
    .attr('text-anchor', (d) => d.value > 0 ?
      (Math.abs(xScaleFunction(d.value) - xScaleFunction(0)) < chart_width / labelPositionFactor ? 'start' : 'end') :
      "start"
    )
    .attr('fill', (d) =>
      (Math.abs(xScaleFunction(d.value) - xScaleFunction(0)) < chart_width / labelPositionFactor ? '#414042' : '#ffffff')
    )
    .text((d) =>
      d3.format(config.essential.dataLabels.numberFormat)(d.value)
    );
}

export function addChartTitleLabel({
  svgContainer = svg, //Default values, but can be overwritten in the function call
  xPosition = 0, //Default values, but can be overwritten in the function call
  yPosition = -15, //Default values, but can be overwritten in the function call
  text,
  wrapWidth,
}) {
  svgContainer
    .append('g')
    .attr('transform', 'translate(0, 0)')
    .append('text')
    .attr('x', xPosition)
    .attr('y', yPosition)
    // .attr('dy', -15)
    .attr('class', 'title')
    .text(text)
    .attr('text-anchor', 'start')
    .call(wrap, wrapWidth);
}

export function addXAxisLabel({
  svgContainer = svg,
  xPosition,
  yPosition,
  text,
  wrapWidth,
}) {
  svgContainer
    .append("g")
    .append("text")
    .attr("x", xPosition)
    .attr("y", yPosition)
    .attr("class", "axis--label")
    .text(text)
    .attr("text-anchor", "end")
    .call(wrap, wrapWidth);
}

export function wrap(text, width) {
  text.each(function () {
    let text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      y = text.attr("y") ? text.attr("y") : 0,
      x = text.attr("x") ? text.attr("x") : 0,
      dy = parseFloat(text.attr("dy")),
      tspan = text.text(null).append("tspan").attr("x", x);
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", x)
          .attr("dy", lineHeight + "em")
          .text(word);
      }
    }
    let breaks = text.selectAll("tspan").size();
    text.attr("y", function () {
      return y - 6 * (breaks - 1);
    });
  });
}
