//Note: see data.csv for the required data format - the template is quite paticular on the columns ending with _lowerCI and _upperCI

let graphic = d3.select('#graphic');
//console.log(`Graphic selected: ${graphic}`);
let legend = d3.selectAll('#legend')
let pymChild = null;

function drawGraphic() {
	//Accessible summary
	d3.select('#accessibleSummary').html(config.essential.accessibleSummary);
	//	console.log(`Accessible summary set: ${config.essential.accessibleSummary}`);

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
	// console.log(`Size set: ${size}`);



	// Define the dimensions and margin, width and height of the chart.
	let margin = config.optional.margin[size];
	let width = parseInt(graphic.style('width')) - margin.left - margin.right;
	// let height = 400 - margin.top - margin.bottom;
	let height = (config.optional.aspectRatio[size][1] / config.optional.aspectRatio[size][0]) * width
	// console.log(`Margin, width, and height set: ${margin}, ${width}, ${height}`);

	// Remove any existing chart elements
	graphic.selectAll('*').remove();
	//console.log(`Removed existing chart elements`);
	legend.selectAll('*').remove();

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
			.range([0, width]);
	} else if (config.essential.xDomain == "auto") {
		x = d3.scaleLinear()
			.domain(d3.extent(graphic_data, (d) => +d.date))
			.range([0, width]);
	} else {
		x = d3.scaleLinear()
			.domain(config.essential.xDomain)
			.range([0, width]);
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
	const svg = graphic
		.append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.attr('class', 'chart')
		.style('background-color', '#fff')
		.append('g')
		.attr('transform', `translate(${margin.left},${margin.top})`);
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
				.tickSize(-width)
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
	svg
		.append('g')
		.attr('transform', `translate(0, 0)`)
		.append('text')
		.attr('x', -margin.left + 10)
		.attr('y', -10)
		.attr('class', 'axis--label')
		.text(config.essential.yAxisLabel)
		.attr('text-anchor', 'start');

	//create link to source
	d3.select('#source').text('Source: ' + config.essential.sourceText);
	// console.log(`Link to source created`);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
	// console.log(`PymChild height sent`);
}

//text wrap function for the direct labelling

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
