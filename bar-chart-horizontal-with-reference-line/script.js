let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;

function drawGraphic() {
	// clear out existing graphics
	graphic.selectAll('*').remove();
	legend.selectAll('*').remove();

	//population accessible summmary
	d3.select('#accessibleSummary').html(config.essential.accessibleSummary);

	let threshold_md = config.optional.mediumBreakpoint;
	let threshold_sm = config.optional.mobileBreakpoint;

	//set variables for chart dimensions dependent on width of #graphic
	if (parseInt(graphic.style('width')) < threshold_sm) {
		size = 'sm';
	} else if (parseInt(graphic.style('width')) < threshold_md) {
		size = 'md';
	} else {
		size = 'lg';
	}

	let margin = config.optional.margin[size];
	let chart_width =
		parseInt(graphic.style('width')) - margin.left - margin.right;
	//height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion
	let height =
		config.optional.seriesHeight[size] * graphic_data.length +
		10 * (graphic_data.length - 1) +
		12;

	//Set up the legend
	legend
		.append('div')
		.attr('class', 'legend--item--here')
		.append('svg')
		.attr('height',14)
		.attr('width',25)
		.append('circle')
		.attr('cx',13)
		.attr('cy',8)
		.attr('r',6)
		.attr('fill', config.essential.colour_palette)
		.attr('class','legendCircle');
	

	d3.select(".legend--item--here")
		.append('div')
		.append('p').attr('class', 'legend--text')
		.html("Value")

	legend
		.append('div')
		.attr("class", "legend--item--here refline")
		.append('svg')
		.attr('height',14)
		.attr('width',25)
		.append('line')
		.attr('x1',2)
		.attr('x2',22)
		.attr('y1',8)
		.attr('y2',8)
		.attr('class','refline')

	d3.select(".legend--item--here.refline")
		.append('div')
		.append('p').attr('class', 'legend--text')
		.html("Reference value")

	//set up scales
	const x = d3.scaleLinear().range([0, chart_width]);

	const y = d3
		.scaleBand()
		.paddingOuter(0.2)
		.paddingInner(((graphic_data.length - 1) * 10) / (graphic_data.length * 30))
		.range([0, height])
		.round(true);

	//use the data to find unique entries in the name column
	y.domain([...new Set(graphic_data.map((d) => d.name))]);

	//set up yAxis generator
	let yAxis = d3.axisLeft(y).tickSize(0).tickPadding(10);

	//set up xAxis generator
	let xAxis = d3
		.axisBottom(x)
		.tickSize(-height)
		.tickFormat(d3.format(config.essential.xAxisNumberFormat))
		.ticks(config.optional.xAxisTicks[size]);

	//create svg for chart
	svg = d3
		.select('#graphic')
		.append('svg')
		.attr('width', chart_width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.attr('class', 'chart')
		.style('background-color', '#fff')
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


	if (config.essential.xDomain == 'auto') {
		x.domain([
			Math.min(0, d3.min(graphic_data.map(({ value }) => Number(value))),
			d3.min(graphic_data.map(({ ref }) => Number(ref)))),
			//x domain is the maximum out of the value and the reference value
			Math.max(d3.max(graphic_data.map(({ value }) => Number(value))),
			d3.max(graphic_data.map(({ ref }) => Number(ref))))
		])
	} else {
		x.domain(config.essential.xDomain);
	}

	svg
		.append('g')
		.attr('transform', 'translate(0,' + height + ')')
		.attr('class', 'x axis')
		.call(xAxis)
		.selectAll('line')
		.each(function (d) {
			if (d == 0) {
				d3.select(this).attr('class', 'zero-line');
			}
		});

	svg
		.append('g')
		.attr('class', 'y axis')
		.call(yAxis)
		.selectAll('text')
		.call(wrap, margin.left - 10);

	svg
		.selectAll('rect')
		.data(graphic_data)
		.join('rect')
		.attr('x', d => d.value < 0 ? x(d.value) : x(0))
		.attr('y', (d) => y(d.name))
		.attr('width', (d) => Math.abs(x(d.value) - x(0)))
		.attr('height', y.bandwidth())
		.attr('fill', config.essential.colour_palette);

		svg
		.selectAll('line.refline')
		.data(graphic_data)
		.join('line')
		.attr('class', 'refline')
		.attr('x1', (d) => x(d.ref))
		.attr('x2', (d) => x(d.ref))
		.attr('y1', (d) => y(d.name))
		.attr('y2', (d) => y(d.name) + y.bandwidth())


		let labelPositionFactor = 7;

	if (config.essential.dataLabels.show == true) {
		svg
			.selectAll('text.dataLabels')
			.data(graphic_data)
			.join('text')
			.attr('class', 'dataLabels')
			.attr('x', (d) => d.value > 0 ? x(d.value) :
			Math.abs(x(d.value) - x(0)) < chart_width / labelPositionFactor ? x(0) : x(d.value))
		  .attr('dx', (d) => d.value > 0 ?
			(Math.abs(x(d.value) - x(0)) < chart_width / labelPositionFactor ? 3 : -3) :
			3)
			.attr('y', (d) => y(d.name) + y.bandwidth()/2)
			.attr('dominant-baseline', 'middle')
			.attr('text-anchor', (d) => d.value > 0 ?
			(Math.abs(x(d.value) - x(0)) < chart_width / labelPositionFactor ? 'start' : 'end') :
			"start"
		  )
		  .attr('fill', (d) =>
			(Math.abs(x(d.value) - x(0)) < chart_width / labelPositionFactor ? '#414042' : '#ffffff')
		  )
			.text((d) =>
				d3.format(config.essential.dataLabels.numberFormat)(d.value)
			);
	} //end if for datalabels

	// This does the x-axis label
	svg
		.append('g')
		.attr('transform', 'translate(0,' + height + ')')
		.append('text')
		.attr('x', chart_width)
		.attr('y', 35)
		.attr('class', 'axis--label')
		.text(config.essential.xAxisLabel)
		.attr('text-anchor', 'end');

	//create link to source
	d3.select('#source').text('Source: ' + config.essential.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
}

function wrap(text, width) {
	text.each(function () {
		let text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.1, // ems
			// y = text.attr("y"),
			x = text.attr('x'),
			dy = parseFloat(text.attr('dy')),
			tspan = text.text(null).append('tspan').attr('x', x);
		while ((word = words.pop())) {
			line.push(word);
			tspan.text(line.join(' '));
			if (tspan.node().getComputedTextLength() > width) {
				line.pop();
				tspan.text(line.join(' '));
				line = [word];
				tspan = text
					.append('tspan')
					.attr('x', x)
					.attr('dy', lineHeight + 'em')
					.text(word);
			}
		}
		let breaks = text.selectAll('tspan').size();
		text.attr('y', function () {
			return -6 * (breaks - 1);
		});
	});
}

d3.csv(config.essential.graphic_data_url).then((data) => {
	//load chart data
	graphic_data = data;

	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
