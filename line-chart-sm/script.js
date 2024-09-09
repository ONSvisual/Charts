import { initialise, wrap, addSvg, calculateChartWidth, addChartTitleLabel, addAxisLabel } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, keys, counter;

function drawGraphic() {
	// // Remove any existing chart elements
	// graphic.selectAll('*').remove();
	// legend.selectAll('*').remove();

	// //Accessible summary
	// d3.select('#accessibleSummary').html(config.essential.accessibleSummary);


	// let threshold_md = config.optional.mediumBreakpoint;
	// let threshold_sm = config.optional.mobileBreakpoint;

	// //set variables for chart dimensions dependent on width of #graphic
	// if (parseInt(graphic.style('width')) < threshold_sm) {
	// 	size = 'sm';
	// } else if (parseInt(graphic.style('width')) < threshold_md) {
	// 	size = 'md';
	// } else {
	// 	size = 'lg';
	// }

	//Set up some of the basics and return the size value
	size = initialise(size);

	const aspectRatio = config.optional.aspectRatio[size];
	const chartsPerRow = config.optional.chart_every[size];

	// const droppedMargin = 20;
	// let chart_width =
	// 	((parseInt(graphic.style('width')) - margin.left + 10) / chartsPerRow) - margin.right -10;


	// function calculateChartWidth(size) {
	// 	const chartEvery = config.optional.chartsPerRow[size];
	// 	// const aspectRatio = config.optional.aspectRatio[size];
	// 	const chartMargin = config.optional.margin[size];

	// 	const chartWidth =
	// 		((parseInt(graphic.style('width')) - chartMargin.left + droppedMargin) / chartEvery) - chartMargin.right - droppedMargin;
	// 	return chartWidth;
	// }

	const reference = config.essential.reference_category;

	// Get categories from the keys used in the stack generator
	const categories = Object.keys(graphic_data[0]).filter((k) => k !== 'date' && k !== reference);
	const categoriesToPlot = Object.keys(graphic_data[0]).filter((k) => k !== 'date')

	// Create a container div for each small multiple
	let chartContainers = graphic
		.selectAll('.chart-container')
		.data(categories)
		.join('div')
		.attr('class', 'chart-container');

	function drawChart(container, series, chartIndex) {

		let chartPosition = chartIndex % chartsPerRow;

		// Set dimensions
		let margin = { ...config.optional.margin[size] };

		let chartGap = config.optional?.chartGap || 10;

		let chart_width = calculateChartWidth({
			screenWidth: parseInt(graphic.style('width')),
			chartEvery: chartsPerRow,
			chartMargin: margin,
			chartGap: chartGap
		})

		// If the chart is not in the first position in the row, reduce the left margin
		if (config.optional.dropYAxis) {
			if (chartPosition !== 0) {
				margin.left = chartGap;
			}
		}

		//height is set by the aspect ratio
		let height =
			aspectRatio[1] / aspectRatio[0] * chart_width;

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
		} else {
			x = d3.scaleLinear()
				.domain(d3.extent(graphic_data, (d) => +d.date))
				.range([0, chart_width]);
		}


		const y = d3
			.scaleLinear()
			.range([height, 0]);

		if (config.essential.yDomain == "auto") {
			let minY = d3.min(graphic_data, (d) => Math.min(...categoriesToPlot.map((c) => d[c])))
			let maxY = d3.max(graphic_data, (d) => Math.max(...categoriesToPlot.map((c) => d[c])))
			y.domain([minY, maxY])
			// console.log(minY, maxY)
		} else {
			y.domain(config.essential.yDomain)
		}

		// Create an SVG element
		// const svg = container
		// 	.append('svg')
		// 	.attr('width', chart_width + margin.left + margin.right)
		// 	.attr('height', height + margin.top + margin.bottom)
		// 	.attr('class', 'chart')
		// 	.style('background-color', '#fff')
		// 	.append('g')
		// 	.attr('transform', `translate(${margin.left},${margin.top})`);
		const svg = addSvg({
			svgParent: graphic,
			chart_width: chart_width,
			height: height + margin.top + margin.bottom,
			margin: margin
		})



		// create lines and circles for each category
		categoriesToPlot.forEach(function (category) {
			const lineGenerator = d3
				.line()
				.x((d) => x(d.date))
				.y((d) => y(d.amt))
				.defined(d => d.amt !== null) // Only plot lines where we have values
				.curve(d3[config.essential.lineCurveType]) // I used bracket notation here to access the curve type as it's a string
				.context(null);

			var lines = {};
			for (var column in graphic_data[0]) {
				if (column == 'date') continue;
				lines[column] = graphic_data.map(function (d) {
					return {
						'date': d.date,
						'amt': d[column]
					};
				});
			}

			//This interpolates points when a cell contains no data (draws a line where there are no data points)

			if (config.essential.interpolateGaps) {

				keys = Object.keys(lines)
				for (let i = 0; i < keys.length; i++) {
					lines[keys[i]].forEach(function (d, j) {
						if (d.amt != null) {
							counter = j;
						} else {
							d.date = lines[keys[i]][counter].date
							d.amt = lines[keys[i]][counter].amt
						}
					})
				}

			}

			svg
				.append('path')
				.datum(Object.entries(lines))
				.attr('fill', 'none')
				.attr(
					'stroke', () => (categoriesToPlot.indexOf(category) == chartIndex) ? config.essential.colour_palette[0] :
						category == reference ? config.essential.colour_palette[1] : config.essential.colour_palette[2]
					// config.essential.colour_palette[
					// categories.indexOf(category) % config.essential.colour_palette.length
					// ]
				)
				.attr('stroke-width', 2)
				.attr('d', (d, i) => lineGenerator(d[categoriesToPlot.indexOf(category)][1]))
				.style('stroke-linejoin', 'round')
				.style('stroke-linecap', 'round')
				.attr('class', 'line' + categoriesToPlot.indexOf(category));

			svg.selectAll('.line' + chartIndex).attr('stroke-width', 2.5).raise()

			const lastDatum = graphic_data[graphic_data.length - 1];

			//Labelling the final data point on each chart if option selected in the config
			if (config.essential.labelFinalPoint == true) {
				// Add text labels to the right of the circles
				if (categories.indexOf(category) == chartIndex) {
					svg
						.append('text')
						.attr('class', 'dataLabel')
						.attr(
							'transform',
							`translate(${x(lastDatum.date)}, ${y(lastDatum[category])})`
						)
						.attr('x', 5)
						.attr('y', 4)
						.attr('text-anchor', 'start')
						.attr(
							'fill', config.essential.colour_palette[0]
							// config.essential.colour_palette[
							// categories.indexOf(category) % config.essential.colour_palette.length
							// ]
						)
						.text(d3.format(",.0f")(lastDatum[category]))
				}

				if (categories.indexOf(category) == chartIndex) {
					svg
						.append('circle')
						.attr('cx', x(lastDatum.date))
						.attr('cy', y(lastDatum[category]))
						.attr('r', 3)
						.attr(
							'fill', config.essential.colour_palette[0]
							// config.essential.colour_palette[
							// categories.indexOf(category) % config.essential.colour_palette.length
							// ]
						);

					d3.selectAll('circle').raise()
				}
			}
		});

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
			)
			.lower();

		d3.selectAll('g.tick line')
			.each(function (e) {
				if (e == config.essential.zeroLine) {
					d3.select(this).attr('class', 'zero-line');
				}
			})

		// Add the x-axis
		svg
			.append('g')
			.attr('class', 'x axis')
			.attr('transform', `translate(0, ${height})`)
			.call(
				d3
					.axisBottom(x)
					.tickValues(graphic_data
						.map((d) => xDataType == 'date' ?
							d.date.getTime() : d.date
						) //just get dates as seconds past unix epoch
						.filter(function (d, i, arr) {
							return arr.indexOf(d) == i
						}) //find unique
						.map(function (d) {
							return new Date(d)
						}) //map back to dates
						.sort(function (a, b) {
							return a - b
						})
						.filter(function (d, i) {
							return i % config.optional.xAxisTicksEvery[size] === 0 && i <= graphic_data.length - config.optional.xAxisTicksEvery[size] || i == graphic_data.length - 1 //Rob's fussy comment about labelling the last date
						})
					)
					.tickFormat((d) => xDataType == 'date' ? d3.timeFormat(config.essential.xAxisTickFormat[size])(d)
						: d3.format(config.essential.xAxisNumberFormat)(d))
			);


		//Only draw the y axis tick labels on the first chart in each row
		if (chartIndex % chartsPerRow === 0) {
			svg
				.append('g')
				.attr('class', 'y axis')
				.call(d3.axisLeft(y).ticks(config.optional.yAxisTicks[size]))
				.selectAll('.tick text')
				.call(wrap, margin.left - 10);
		} else {
			svg.append('g').attr('class', 'y axis').call(d3.axisLeft(y).tickValues([]));
		}


		// This does the chart title label
		// svg
		// 	.append('g')
		// 	.attr('transform', 'translate(0, 0)')
		// 	.append('text')
		// 	.attr('x', 0)
		// 	.attr('y', 0)
		// 	.attr('dy', -20)
		// 	.attr('class', 'title')
		// 	.text(series)
		// 	.attr('text-anchor', 'start')
		// 	.call(wrap, (chart_width + margin.right));
		addChartTitleLabel({
			svgContainer: svg,
			yPosition: -margin.top / 2,
			text: series,
			wrapWidth: (chart_width + margin.right)
		})


		// This does the y-axis label
		if (chartIndex % chartsPerRow === 0) {
			// svg
			// 	.append('g')
			// 	.attr('transform', `translate(0, 0)`)
			// 	.append('text')
			// 	.attr('x', -margin.left + 5)
			// 	.attr('y', 0)
			// 	.attr('class', 'axis--label')
			// 	.text(config.essential.yAxisLabel)
			// 	.attr('text-anchor', 'start');
			addAxisLabel({
				svgContainer: svg,
				xPosition: 5 - margin.left,
				yPosition: 0,
				text: config.essential.yAxisLabel,
				textAnchor: "start",
				wrapWidth: chart_width
			});
		}

		// This does the x-axis label
		if (chartIndex % chartsPerRow === chartsPerRow - 1 || chartIndex === [...chartContainers].length - 1) {
			// svg
			// 	.append('g')
			// 	.attr('transform', `translate(0, ${height})`)
			// 	.append('text')
			// 	.attr('x', chart_width)
			// 	.attr('y', 35)
			// 	.attr('class', 'axis--label')
			// 	.text(config.essential.xAxisLabel)
			// 	.attr('text-anchor', 'end');
			addAxisLabel({
				svgContainer: svg,
				xPosition: chart_width,
				yPosition: height + 35,
				text: config.essential.xAxisLabel,
				textAnchor: "end",
				wrapWidth: chart_width
			});
		}
	}

	// Draw the charts for each small multiple
	chartContainers.each(function (chart, i) {
		drawChart(d3.select(this), chart, i);
	});


	// Set up the legend
	let legenditem = legend
		.selectAll('div.legend--item')
		.data([[config.essential.legendLabel, config.essential.colour_palette[0]], [reference, config.essential.colour_palette[1]], [config.essential.allLabel, config.essential.colour_palette[2]]])
		.enter()
		.append('div')
		.attr('class', 'legend--item');

	legenditem
		.append('div')
		.attr('class', 'legend--icon--refline')
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


	//create link to source
	d3.select('#source').text('Source: ' + config.essential.sourceText);


	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
	// console.log(`PymChild height sent`);
}

//text wrap function for the direct labelling

// function wrap(text, width) {
// 	text.each(function () {
// 		let text = d3.select(this),
// 			words = text.text().split(/\s+/).reverse(),
// 			word,
// 			line = [],
// 			lineNumber = 0,
// 			lineHeight = 1.1, // ems
// 			// y = text.attr("y"),
// 			x = text.attr('x'),
// 			dy = parseFloat(text.attr('dy')),
// 			tspan = text.text(null).append('tspan').attr('x', x);
// 		while ((word = words.pop())) {
// 			line.push(word);
// 			tspan.text(line.join(' '));
// 			if (tspan.node().getComputedTextLength() > width) {
// 				line.pop();
// 				tspan.text(line.join(' '));
// 				line = [word];
// 				tspan = text
// 					.append('tspan')
// 					.attr('x', x)
// 					.attr('dy', lineHeight + 'em')
// 					.text(word);
// 			}
// 		}
// 		let breaks = text.selectAll('tspan').size();
// 		text.attr('y', function () {
// 			return -6 * (breaks - 1);
// 		});
// 	});
// }

// Load the data
d3.csv(config.essential.graphic_data_url).then((rawData) => {
	graphic_data = rawData.map((d) => {
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

	// Use pym to create an iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});

});
