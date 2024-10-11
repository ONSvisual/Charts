import { initialise, wrap, addSvg, addAxisLabel } from "../lib/helpers.js";

const graphic = d3.select('#graphic');
const titles = d3.select('#titles');
const legend = d3.select('#legend');
let pymChild = null;
let graphic_data, comparison_data, comparisonPopTotal, comparison_data_new, size, popTotal, graphic_data_new, maxPercentage, width, chart_width, height, xLeft, xRight, y, svg, widths, dataForLegend, titleDivs, lineLeft, lineRight, comparisons;

function drawGraphic() {
	// // clear out existing graphics
	titles.selectAll('*').remove();

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	let margin = config.optional.margin[size];
	margin.centre = config.optional.margin.centre;

	// calculate percentage if we have numbers
	// percentages are based of total populations as is common practice amongst pop pyramids

	if (config.essential.dataType == 'numbers') {
		popTotal = d3.sum(graphic_data, (d) => d.maleBar + d.femaleBar);

		comparisonPopTotal = d3.sum(
			comparison_data,
			(d) => d.maleBar + d.femaleBar
		);

		// turn into tidy data
		graphic_data_new = graphic_data
			.map(function (d) {
				return [
					{
						age: d.age,
						sex: 'female',
						value: d.femaleBar / popTotal
					},
					{
						age: d.age,
						sex: 'male',
						value: d.maleBar / popTotal
					}
				];
			})
			.flatMap((d) => d);

		comparison_data_new = comparison_data.map(function (d) {
			return {
				age: d.age,
				malePercent: d.maleBar / comparisonPopTotal,
				femalePercent: d.femaleBar / comparisonPopTotal
			};
		});
	} else {
		// turn into tidy data
		graphic_data_new = graphic_data
			.map(function (d) {
				return [
					{
						age: d.age,
						value: d.femaleBar,
						sex: 'female'
					},
					{
						age: d.age,
						sex: 'male',
						value: d.maleBar
					}
				];
			})
			.flatMap((d) => d);

		comparison_data_new = comparison_data.map(function (d) {
			return {
				age: d.age,
				malePercent: d.maleBar,
				femalePercent: d.femaleBar
			};
		});
	}

	maxPercentage = d3.max([
		d3.max(graphic_data_new, (d) => d.value),
		d3.max(comparison_data_new, (d) => d3.max([d.femaleBar, d.maleBar]))
	]);

	// set up widths
	width = parseInt(graphic.style('width'));
	chart_width = (parseInt(graphic.style('width')) - margin.centre - margin.left - margin.right) / 2;
	height = (graphic_data_new.length / 2) * config.optional.seriesHeight[size];

	// set up some scales, first the left scale
	xLeft = d3
		.scaleLinear()
		.domain([0, maxPercentage])
		.rangeRound([chart_width, 0]);

	// right scale
	xRight = d3
		.scaleLinear()
		.domain(xLeft.domain())
		.rangeRound([chart_width + margin.centre, chart_width * 2 + margin.centre]);

	// y scale
	y = d3
		.scaleBand()
		.domain([...new Set(graphic_data_new.map((d) => d.age))])
		.rangeRound([height, 0])
		.paddingInner(0.1);

	// create the svg
	svg = addSvg({
		svgParent: graphic,
		chart_width: width,
		height: height + margin.top + margin.bottom,
		margin: margin
	})

	// create line generators
	lineLeft = d3
		.line()
		.curve(d3.curveStepBefore)
		.x((d) => xLeft(d.femalePercent))
		.y((d) => y(d.age) + y.bandwidth());

	lineRight = d3
		.line()
		.curve(d3.curveStepBefore)
		.x((d) => xRight(d.malePercent))
		.y((d) => y(d.age) + y.bandwidth());

	//add x-axis left
	svg
		.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(0,' + height + ')')
		.call(
			d3
				.axisBottom(xLeft)
				.tickFormat(d3.format(config.essential.xAxisNumberFormat))
				.ticks(config.optional.xAxisTicks[size])
				.tickSize(-height)
		)
		.selectAll('line')
		.each(function (d) {
			if (d == 0) {
				d3.select(this).attr('class', 'zero-line');
			}
		});

	//add x-axis right
	svg
		.append('g')
		.attr('class', 'x axis right')
		.attr('transform', 'translate(0,' + height + ')')
		.call(
			d3
				.axisBottom(xRight)
				.tickFormat(d3.format(config.essential.xAxisNumberFormat))
				.ticks(config.optional.xAxisTicks[size])
				.tickSize(-height)
		)
		.selectAll('line')
		.each(function (d) {
			if (d == 0) {
				d3.select(this).attr('class', 'zero-line');
			}
		});

	// add bars
	svg
		.append('g')
		.selectAll('rect')
		.data(graphic_data_new)
		.join('rect')
		.attr('fill', (d) =>
			d.sex === 'female'
				? config.essential.colour_palette[0]
				: config.essential.colour_palette[1]
		)
		.attr('x', (d) => (d.sex === 'female' ? xLeft(d.value) : xRight(0)))
		.attr('y', (d) => y(d.age))
		.attr('width', (d) =>
			d.sex === 'female'
				? xLeft(0) - xLeft(d.value)
				: xRight(d.value) - xRight(0)
		)
		.attr('height', y.bandwidth());

	//add y-axis
	svg
		.append('g')
		.attr('class', 'y axis')
		.attr(
			'transform',
			'translate(' + (chart_width + margin.centre / 2 - 3) + ',0)'
		)
		.call(
			d3
				.axisRight(y)
				.tickSize(0)
				.tickValues(y.domain().filter((d, i) => !(i % config.essential.yAxisTicksEvery)))
		)
		.selectAll('text')
		.each(function () {
			d3.select(this).attr('text-anchor', 'middle');
		});

	//draw comparison lines
	comparisons = svg.append('g');

	comparisons
		.append('path')
		.attr('class', 'line')
		.attr('d', lineLeft(comparison_data_new) + 'l 0 ' + -y.bandwidth())
		.attr('stroke', config.essential.comparison_colour_palette[0])
		.attr('stroke-width', '2px');

	comparisons
		.append('path')
		.attr('class', 'line')
		.attr('d', lineRight(comparison_data_new) + 'l 0 ' + -y.bandwidth())
		.attr('stroke', config.essential.comparison_colour_palette[1])
		.attr('stroke-width', '2px');

	//add x-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: (width - margin.left),
		yPosition: (height + 30),
		text: config.essential.xAxisLabel,
		textAnchor: "end",
		wrapWidth: width
	});

	//add y-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: (chart_width + margin.centre / 2),
		yPosition: -15,
		text: config.essential.yAxisLabel,
		textAnchor: "middle",
		wrapWidth: width
	});

	widths = [chart_width + margin.left, chart_width + margin.right];

	legend
		.append('div')
		.attr('class', 'flex-row')
		.style('gap', margin.centre + 'px')
		.selectAll('div')
		.data(['Females', 'Males'])
		.join('div')
		.style('width', (d, i) => widths[i] + 'px')
		.append('div')
		.attr('class', 'chartLabel')
		.append('p')
		.text((d) => d);

	dataForLegend = [
		['x', 'x'],
		['y', 'y']
	]; //dummy data

	titleDivs = titles
		.selectAll('div')
		.data(dataForLegend)
		.join('div')
		.attr('class', 'flex-row')
		.style('gap', margin.centre + 'px')
		.selectAll('div')
		.data((d) => d)
		.join('div')
		.style('width', (d, i) => widths[i] + 'px')
		.append('div')
		.attr('class', 'legend--item');

	titleDivs
		.append('div')
		.style('background-color', (d, i) =>
			d == 'x'
				? config.essential.colour_palette[i]
				: config.essential.comparison_colour_palette[i]
		)
		.attr('class', (d) =>
			d == 'x' ? 'legend--icon--circle' : 'legend--icon--refline'
		);

	titleDivs
		.append('div')
		.append('p')
		.attr('class', 'legend--text')
		.html((d) =>
			d == 'x' ? config.essential.legend[0] : config.essential.legend[1]
		);

	//create link to source
	d3.select('#source').text('Source: ' + config.essential.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
} //end draw graphic

Promise.all([
	d3.csv(config.essential.graphic_data_url, d3.autoType),
	d3.csv(config.essential.comparison_data, d3.autoType)
]).then(([data, datab]) => {
	//load chart data
	graphic_data = data;
	comparison_data = datab;

	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
