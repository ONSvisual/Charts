import { initialise, wrap, addSvg, addAxisLabel } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, svgs, xDomain, divs, charts, var_group, var_group2, var_group3;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	let margin = config.optional.margin[size];
	let chart_width =
		parseInt(graphic.style('width')) - margin.left - margin.right;

	let groups = d3.groups(graphic_data, (d) => d.group);

	if (config.essential.xDomain == 'auto') {
		let min = 1000000;
		let max = 0;
		for (i = 2; i < graphic_data.columns.length; i++) {
			min = d3.min([
				min,
				d3.min(graphic_data, (d) => +d[graphic_data.columns[i]])
			]);
			max = d3.max([
				max,
				d3.max(graphic_data, (d) => +d[graphic_data.columns[i]])
			]);
		}
		xDomain = [min, max];
	} else {
		xDomain = config.essential.xDomain;
	}

	//set up scales
	const x = d3.scaleLinear().range([0, chart_width]).domain(xDomain);

	const colour = d3
		.scaleOrdinal()
		.range(config.essential.colour_palette)
		.domain(Object.keys(config.essential.legendLabels));

	// create the y scale in groups
	groups.map(function (d) {
		//height
		d[2] = config.optional.seriesHeight[size] * d[1].length;

		// y scale
		d[3] = d3
			.scalePoint()
			.padding(0.5)
			.range([0, d[2]])
			.domain(d[1].map((d) => d.name));
		//y axis generator
		d[4] = d3.axisLeft(d[3]).tickSize(0).tickPadding(10);
	});

	//set up xAxis generator
	let xAxis = d3.axisBottom(x)
		.ticks(config.optional.xAxisTicks[size])
		.tickFormat(d3.format(config.essential.xAxisNumberFormat));

	divs = graphic.selectAll('div.categoryLabels').data(groups).join('div');

	if (groups.length > 1) { divs.append('p').attr('class', 'groupLabels').html((d) => d[0]) }

	let charts = addSvg({
		svgParent: divs,
		chart_width: chart_width,
		height: (d) => d[2] + margin.top + margin.bottom,
		margin: margin
	})

	charts.each(function (d) {
		d3.select(this)
			.append('g')
			.attr('class', 'y axis')
			.call(d[4])
			.selectAll('text')
			.call(wrap, margin.left - 10);

		d3.select(this)
			.append('g')
			.attr('transform', (d) => 'translate(0,' + d[2] + ')')
			.attr('class', 'x axis')
			.each(function () {
				d3.select(this)
					.call(xAxis.tickSize(-d[2]))
					.selectAll('line')
					.each(function (e) {
						if (e == 0) {
							d3.select(this).attr('class', 'zero-line');
						}
					});
			});
	});

	charts
		.selectAll('line.between')
		.data((d) => d[1])
		.join('line')
		.attr('class', 'between')
		.attr('x1', (d) => x(d.min))
		.attr('x2', (d) => x(d.max))
		.attr('y1', (d, i) => groups.filter((e) => e[0] == d.group)[0][3](d.name))
		.attr('y2', (d, i) => groups.filter((e) => e[0] == d.group)[0][3](d.name))
		.attr('stroke', (d) =>
			+d.min > +d.max
				? config.essential.colour_palette[1]
				: +d.min < +d.max
					? config.essential.colour_palette[0]
					: config.essential.colour_palette[2]
		)
		.attr('stroke-width', '3px');

	//   charts.selectAll('circle.min')
	//     .data(d => d[1])
	//     .join('circle')
	//     .attr('class', 'min')
	//     .attr('cx', d => x(d.min))
	//     .attr('cy', d => groups.filter(f => f[0] == d.group)[0][3](d.name))
	//     .attr('r', 6)
	//     .attr('fill', colour('min'))

	charts
		.selectAll('circle.max')
		.data((d) => d[1])
		.join('circle')
		.attr('class', 'max')
		.attr('cx', (d) => x(d.max))
		.attr('cy', (d) => groups.filter((f) => f[0] == d.group)[0][3](d.name))
		.attr('r', config.essential.dotsize)
		.attr('fill', (d) =>
			+d.min > +d.max
				? config.essential.colour_palette[1]
				: +d.min < +d.max
					? config.essential.colour_palette[0]
					: config.essential.colour_palette[2]
		);

	if (config.essential.showDataLabels == true) {
		charts
			.selectAll('text.min')
			.data((d) => d[1])
			.join('text')
			.attr('class', 'dataLabels')
			.attr('x', (d) => x(d.min))
			.attr('y', (d) => groups.filter((f) => f[0] == d.group)[0][3](d.name))
			.text((d) => d3.format(config.essential.numberFormat)(d.min))
			.attr('fill', (d) =>
				+d.min > +d.max
					? config.essential.colour_palette[1]
					: +d.min < +d.max
						? config.essential.colour_palette[0]
						: 'none'
			)
			.attr('dy', 6)
			.attr('dx', (d) => (+d.min < +d.max ? -5 : 5))
			.attr('text-anchor', (d) => (+d.min < +d.max ? 'end' : 'start'));

		charts
			.selectAll('text.max')
			.data((d) => d[1])
			.join('text')
			.attr('class', 'dataLabels')
			.attr('x', (d) => x(d.max))
			.attr('y', (d) => groups.filter((f) => f[0] == d.group)[0][3](d.name))
			.text((d) => d3.format(config.essential.numberFormat)(d.max))
			.attr('fill', (d) =>
				+d.min > +d.max
					? config.essential.colour_palette[1]
					: +d.min < +d.max
						? config.essential.colour_palette[0]
						: config.essential.colour_palette[2]
			)
			.attr('dy', 6)
			.attr('dx', (d) =>
				+d.min > +d.max
					? -(config.essential.dotsize + 5)
					: config.essential.dotsize + 5
			)
			.attr('text-anchor', (d) => (+d.min > +d.max ? 'end' : 'start'));
	}

	// This does the x-axis label
	charts.each(function (d, i) {
		if (i == groups.length - 1) {
			addAxisLabel({
				svgContainer: d3.select(this),
				xPosition: chart_width,
				yPosition: d[2] + 35,
				text: config.essential.xAxisLabel,
				textAnchor: "end",
				wrapWidth: chart_width
			});
		}
	});

	// // Set up the legend
	let legenditem = d3
		.select('#legend')
		.selectAll('div.legend--item')
		.data(config.essential.legendItems)
		.enter()
		.append('div')
		.attr('class', (d) => 'legend--item ' + [d]);

	drawLegend();

	function drawLegend() {
		var_group = d3
			.select('#legend')
			.selectAll('div.legend--item.Inc')
			.append('svg')
			.attr('height', config.optional.legendHeight[size])
			.attr('width', config.essential.legendItemWidth);
		var_group2 = d3
			.select('#legend')
			.selectAll('div.legend--item.Dec')
			.append('svg')
			.attr('height', config.optional.legendHeight[size])
			.attr('width', config.essential.legendItemWidth);
		var_group3 = d3
			.select('#legend')
			.selectAll('div.legend--item.No')
			.append('svg')
			.attr('height', config.optional.legendHeight[size])
			.attr('width', config.essential.legendItemWidth);

		//Increase legend item
		var_group
			.append('text')
			.attr('y', 30)
			.attr('x', 0)
			.attr('text-anchor', 'start')
			.attr('class', 'mintext legendLabel')
			.attr('fill', config.essential.colour_palette[0])
			.text(config.essential.legendLabels.min);

		//this measures how wide the "min" value is so that we can place the legend items responsively
		let minTextWidth = d3.select('text.mintext').node().getBBox().width + 5;

		var_group
			.append('line')
			.attr('stroke', config.essential.colour_palette[0])
			.attr('stroke-width', '3px')
			.attr('y1', 26)
			.attr('y2', 26)
			.attr('x1', minTextWidth)
			.attr('x2', minTextWidth + config.essential.legendLineLength);

		var_group
			.append('circle')
			.attr('r', config.essential.dotsize)
			.attr('fill', config.essential.colour_palette[0])
			.attr('cx', minTextWidth + config.essential.legendLineLength)
			.attr('cy', 26);

		var_group
			.append('text')
			.attr('y', 30)
			.attr(
				'x',
				minTextWidth +
				config.essential.legendLineLength +
				config.essential.dotsize +
				5
			)
			.attr('text-anchor', 'start')
			.attr('class', 'maxtext legendLabel')
			.attr('fill', config.essential.colour_palette[0])
			.text(config.essential.legendLabels.max);

		//this measures how wide the "max" value is so that we can place the legend items responsively
		let maxTextWidth = d3.select('text.maxtext').node().getBBox().width + 5;

		var_group
			.append('text')
			.attr('y', 15)
			.attr(
				'x',
				(minTextWidth +
					config.essential.legendLineLength +
					config.essential.dotsize +
					maxTextWidth) /
				2
			)
			.attr('text-anchor', 'middle')
			.attr('class', 'legendLabel')
			.attr('fill', config.essential.colour_palette[0])
			.text('Increase');

		//Decrease legend item
		var_group2
			.append('line')
			.attr('stroke', config.essential.colour_palette[1])
			.attr('stroke-width', '3px')
			.attr('y1', 26)
			.attr('y2', 26)
			.attr('x1', maxTextWidth + config.essential.dotsize)
			.attr(
				'x2',
				maxTextWidth +
				config.essential.dotsize +
				config.essential.legendLineLength
			);

		var_group2
			.append('circle')
			.attr('r', config.essential.dotsize)
			.attr('fill', config.essential.colour_palette[1])
			.attr('cx', maxTextWidth + config.essential.dotsize)
			.attr('cy', 26);

		var_group2
			.append('text')
			.attr('y', 30)
			.attr('x', 0)
			.attr('text-anchor', 'start')
			.attr('class', 'legendLabel')
			.attr('fill', config.essential.colour_palette[1])
			.text(config.essential.legendLabels.max);

		var_group2
			.append('text')
			.attr('y', 30)
			.attr(
				'x',
				maxTextWidth +
				config.essential.legendLineLength +
				config.essential.dotsize +
				5
			)
			.attr('text-anchor', 'start')
			.attr('class', 'legendLabel')
			.attr('fill', config.essential.colour_palette[1])
			.text(config.essential.legendLabels.min);

		var_group2
			.append('text')
			.attr('y', 15)
			.attr(
				'x',
				(maxTextWidth +
					config.essential.legendLineLength +
					config.essential.dotsize +
					minTextWidth) /
				2
			)
			.attr('text-anchor', 'middle')
			.attr('class', 'legendLabel')
			.attr('fill', config.essential.colour_palette[1])
			.text('Decrease');

		//No change legend item
		var_group3
			.append('circle')
			.attr('r', config.essential.dotsize)
			.attr('fill', config.essential.colour_palette[2])
			.attr('cx', 10)
			.attr('cy', 26);

		var_group3
			.append('text')
			.attr('y', 30)
			.attr('x', config.essential.dotsize + 15)
			.attr('text-anchor', 'start')
			.attr('class', 'legendLabel')
			.attr('fill', config.essential.colour_palette[2])
			.text('No change');
	} //End drawLegend

	//create link to source
	d3.select('#source').text('Source: ' + config.essential.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
}

d3.csv(config.essential.graphic_data_url).then((data) => {
	//load chart data
	graphic_data = data;

	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
