import { initialise, wrap, addSvg, addAxisLabel } from "../lib/helpers.js";

const graphic = d3.select('#graphic');
const titles = d3.select('#titles');
const legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, popTotal, graphic_data_new, maxPercentage, width, chart_width, height, xLeft, xRight, y, svg, widths, dataForLegend, titleDivs;

function drawGraphic() {
	// clear out existing graphics
	titles.selectAll('*').remove();

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	let margin = config.optional.margin[size];
	margin.centre = config.optional.margin.centre;

	// calculate percentage if we have numbers
	// percentages are based of total populations as is common practice amongst pop pyramids
	if (config.essential.xAxisDisplayFormat == 'percentage') {
		popTotal = d3.sum(graphic_data, (d) => d.maleBar + d.femaleBar);

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
	}

	maxPercentage = d3.max(graphic_data_new, (d) => d.value);

	// set up widths
	width = parseInt(graphic.style('width'));
	chart_width = (width - margin.centre - margin.left - margin.right) / 2;
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

	const legendData = ['Females', 'Males'];
	const dummyData = [['x', 'x']]; // dummy data

	const createLegend = (justify) => {
		const legendDiv = legend.append('div').attr('class', 'flex-row').style('gap', margin.centre + 'px');
		const titleDiv = titles.selectAll('div').data(dummyData).join('div').attr('class', 'flex-row').style('gap', margin.centre + 'px');

		legendDiv.selectAll('div')
			.data(legendData)
			.join('div')
			.style('width', (d, i) => widths[i] + 'px')
			.append('div')
			.attr('class', 'chartLabel')
			.style('text-align', (d, i) => justify === 'centre' && i === 0 ? 'right' : 'left')
			.append('p')
			.text((d) => d);

		titleDiv.selectAll('div')
			.data((d) => d)
			.join('div')
			.style('width', (d, i) => widths[i] + 'px')
			.append('div')
			.attr('class', (d, i) => i === 0 && justify === 'centre' ? 'legend--item legend--item--right' : 'legend--item') // Apply CSS class for alignment and padding
			.each(function (d, i) {
				const div = d3.select(this);
				if (justify === 'centre' && i === 0) {
					div.append('div')
						.append('p')
						.attr('class', 'legend--text')
						.html(d == 'x' ? config.essential.legend[0] : config.essential.legend[1])
						.style("padding-right", "8px")
						.attr("class", "legend--text");
					div.append('div')
						.style('background-color', d == 'x' ? config.essential.colour_palette[i] : config.essential.comparison_colour_palette[i])
						.attr('class', d == 'x' ? 'legend--icon--circle' : 'legend--icon--refline');
					d3.select('.legend--icon--circle')
						.style('margin-right', '0px')
						.style('margin-left', '8px');
				} else {
					div.append('div')
						.style('background-color', d == 'x' ? config.essential.colour_palette[i] : config.essential.comparison_colour_palette[i])
						.attr('class', d == 'x' ? 'legend--icon--circle' : 'legend--icon--refline');
					div.append('div')
						.append('p')
						.attr('class', 'legend--text')
						.html(d == 'x' ? config.essential.legend[0] : config.essential.legend[1]);
				}
			});
	};

	createLegend(config.essential.legendJustify);

	//create link to source
	d3.select('#source').text('Source: ' + config.essential.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
} //end draw graphic

d3.csv(config.essential.graphic_data_url, d3.autoType).then((data) => {
	//load chart data
	graphic_data = data;

	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
