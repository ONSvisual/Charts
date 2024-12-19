//Note: see data.csv for the required data format - the template is quite paticular on the columns ending with _lowerCI and _upperCI

import { initialise, wrap, addSvg, addAxisLabel } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
//console.log(`Graphic selected: ${graphic}`);
let legend = d3.selectAll('#legend')
let pymChild = null;

let graphic_data, size;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	// Define the dimensions and margin, width and height of the chart.
	let margin = config.optional.margin[size];
	let chart_width = parseInt(graphic.style('width')) - margin.left - margin.right;
	let height = (config.optional.aspectRatio[size][1] / config.optional.aspectRatio[size][0]) * chart_width
	// console.log(`Margin, chart_width, and height set: ${margin}, ${chart_width}, ${height}`);



	// Get categories from the keys used in the stack generator
	// const categories = Object.keys(graphic_data[0]).filter((k) => k !== 'date');
	const categories = Object.keys(graphic_data[0]).filter(d => !d.endsWith('_lowerCI') && !d.endsWith('_upperCI')).slice(1)
	// console.log(categories);

	const fulldataKeys = Object.keys(graphic_data[0]).slice(1)

	// Define the x and y scales

	let xDataType;

	if (Object.prototype.toString.call(graphic_data[0].date) === '[object Date]') {
		xDataType = 'date';
	} else {
		xDataType = 'numeric';
	}

	// console.log(xDataType)

	let x;



	if (xDataType == 'date') {
		x = d3.scaleTime()
			.domain(d3.extent(graphic_data, (d) => d.date))
			.range([0, chart_width]);
	} else if (config.essential.xDomain == "auto") {
		x = d3.scaleLinear()
			.domain(d3.extent(graphic_data, (d) => +d.date))
			.range([0, chart_width]);
	} else {
		x = d3.scaleLinear()
			.domain(config.essential.xDomain)
			.range([0, chart_width]);
	}
	//console.log(`x defined`);

	const y = d3
		.scaleLinear()
		.range([height, 0]);

	if (config.essential.yDomain == "auto") {
		y.domain(
			[d3.min(graphic_data, (d) => Math.min(...fulldataKeys.map((c) => d[c]))),
			d3.max(graphic_data, (d) => Math.max(...fulldataKeys.map((c) => d[c])))]
		)
	} else {
		y.domain(config.essential.yDomain)
	}
	//console.log(`yAxis defined`);


	// This function generates an array of approximately count + 1 uniformly-spaced, rounded values in the range of the given start and end dates (or numbers).
	let tickValues = x.ticks(config.optional.xAxisTicks[size]);

	// Add the first and last dates to the ticks array, and use a Set to remove any duplicates
	// tickValues = Array.from(new Set([graphic_data[0].date, ...tickValues, graphic_data[graphic_data.length - 1].date]));

	if (config.optional.addFirstDate == true) {
		tickValues.push(graphic_data[0].date)
		console.log("First date added")
	}

	if (config.optional.addFinalDate == true) {
		tickValues.push(graphic_data[graphic_data.length - 1].date)
		console.log("Last date added")
	}


	// Create an SVG element
	const svg = addSvg({
		svgParent: graphic,
		chart_width: chart_width,
		height: height + margin.top + margin.bottom,
		margin: margin
	})
	//console.log(`SVG element created`);


	// Add the x-axis
	svg
		.append('g')
		.attr('class', 'x axis')
		.attr('transform', `translate(0, ${height})`)
		.call(
			d3
				.axisBottom(x)
				.tickValues(tickValues)
				.tickFormat((d) => xDataType == 'date' ? d3.timeFormat(config.essential.xAxisTickFormat[size])(d)
					: d3.format(config.essential.xAxisNumberFormat)(d))
		);


	// Add the y-axis
	svg
		.append('g')
		.attr('class', 'y axis numeric')
		.call(d3.axisLeft(y).ticks(config.optional.yAxisTicks[size]));

	// add grid lines to y axis
	svg
		.append('g')
		.attr('class', 'grid')
		.call(
			d3
				.axisLeft(y)
				.ticks(config.optional.yAxisTicks[size])
				.tickSize(-chart_width)
				.tickFormat('')
		);

	d3.selectAll('g.tick line')
		.each(function (e) {
			if (e == config.essential.zeroLine) {
				d3.select(this).attr('class', 'zero-line');
			}
		})

	// create lines and areas for each category
	categories.forEach(function (category) {
		const lineGenerator = d3
			.line()
			.x((d) => x(d.date))
			.y((d) => y(d[category]))
			.defined(d => d[category] !== null) // Only plot lines where we have values
			.curve(d3[config.essential.lineCurveType]) // I used bracket notation here to access the curve type as it's a string
			.context(null);
		// console.log(`Line generator created for category: ${category}`);

		svg
			.append('path')
			.datum(graphic_data)
			.attr('fill', 'none')
			.attr(
				'stroke',
				config.essential.colour_palette[
				categories.indexOf(category) % config.essential.colour_palette.length
				]
			)
			.attr('stroke-width', 3)
			.attr('d', lineGenerator)
			.style('stroke-linejoin', 'round')
			.style('stroke-linecap', 'round');
		//console.log(`Path appended for category: ${category}`);

		const lastDatum = graphic_data[graphic_data.length - 1];

		const areaGenerator = d3.area()
			.x(d => x(d.date))
			.y0(d => y(d[`${category}_lowerCI`]))
			.y1(d => y(d[`${category}_upperCI`]))
			.defined(d => d[`${category}_lowerCI`] !== null && d[`${category}_upperCI`] !== null) // Only plot areas where we have values

		svg.append('path')
			.attr('class', 'shaded')
			.attr('d', areaGenerator(graphic_data))
			.attr('fill', config.essential.colour_palette[
				categories.indexOf(category) % config.essential.colour_palette.length
			])
			.attr('opacity', 0.15)

		// console.log(`drawLegend: ${size}`);
		// size === 'sm'

		if (config.essential.drawLegend || size === 'sm') {


			// Set up the legend
			let legenditem = d3
				.select('#legend')
				.selectAll('div.legend--item')
				.data(categories.map((c, i) => [c, config.essential.colour_palette[i % config.essential.colour_palette.length]]))
				.enter()
				.append('div')
				.attr('class', 'legend--item');

			legenditem
				.append('div')
				.attr('class', 'legend--icon--circle')
				.style('background-color', function (d) {
					return d[1];
				});

			legenditem
				.append('div')
				.append('p')
				.attr('class', 'legend--text')
				.html(function (d) {
					return d[0];
				});

		} else {

			// Add text labels to the right of the circles
			svg
				.append('text')
				.attr(
					'transform',
					`translate(${x(lastDatum.date)}, ${y(lastDatum[category])})`
				)
				.attr('x', 10)
				.attr('dy', '.35em')
				.attr('text-anchor', 'start')
				.attr(
					'fill', //Colours adjusted for text where needed
					config.essential.text_colour_palette[
					categories.indexOf(category) % config.essential.text_colour_palette.length
					]
				)
				.text(category)
				.attr("class", "directLineLabel")
				.call(wrap, margin.right - 10); //wrap function for the direct labelling.

			svg
				.append('circle')
				.attr('cx', x(lastDatum.date))
				.attr('cy', y(lastDatum[category]))
				.attr('r', 4)
				.attr(
					'fill',
					config.essential.colour_palette[
					categories.indexOf(category) % config.essential.colour_palette.length
					]
				);
			// console.log(`Circle appended for category: ${category}`);

		};


	});

	d3.select('#legend')
		.append('div')
		.attr('class', 'legend--item CI')
		.append('div')
		.attr('class', 'legend--icon--square')

	d3.select('.legend--item.CI')
		.append('div')
		.attr('class', 'legend--text')
		.text('95% confidence interval')


	// This does the y-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: 10 - margin.left,
		yPosition: -10,
		text: config.essential.yAxisLabel,
		textAnchor: "start",
		wrapWidth: chart_width
	});

	//create link to source
	d3.select('#source').text('Source: ' + config.essential.sourceText);
	// console.log(`Link to source created`);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
	// console.log(`PymChild height sent`);
}

// Load the data
d3.csv(config.essential.graphic_data_url).then(data => {

	graphic_data = data.map((d) => {
		if (d3.timeParse(config.essential.dateFormat)(d.date) !== null) {
			return {
				date: d3.timeParse(config.essential.dateFormat)(d.date),
				...Object.entries(d)
					.filter(([key]) => key !== 'date')
					.map(([key, value]) => [key, value == "" ? null : +value]) // Checking for missing values so that they can be separated from zeroes
					.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
			}
		} else {
			return {
				date: (+d.date),
				...Object.entries(d)
					.filter(([key]) => key !== 'date')
					.map(([key, value]) => [key, value == "" ? null : +value]) // Checking for missing values so that they can be separated from zeroes
					.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
			}
		}
	});

	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});

});
