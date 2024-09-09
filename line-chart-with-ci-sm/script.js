import { initialise, wrap, addSvg, calculateChartWidth, addChartTitleLabel, addAxisLabel } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size;

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

	// const droppedMargin = 20;

	// var chart_width =
	// 	((parseInt(graphic.style('width')) - margin.left + 10) / chartEvery) - margin.right -10;


	// function calculateChartWidth(size) {
	// 	const chartEvery = config.optional.chart_every[size];
	// 	// const aspectRatio = config.optional.aspectRatio[size];
	// 	const chartMargin = config.optional.margin[size];

	// 	const chartWidth =
	// 		((parseInt(graphic.style('width')) - chartMargin.left + droppedMargin) / chartEvery) - chartMargin.right - droppedMargin;
	// 	return chartWidth;
	// }

	// Get categories from the keys used in the stack generator
	// const categories = Object.keys(graphic_data[0]).filter((k) => k !== 'date');
	const categories = Object.keys(graphic_data[0]).filter(d => !d.endsWith('_lowerCI') && !d.endsWith('_upperCI')).slice(1).filter((k) => k !== 'series')
	//  console.log(categories);

	const fulldataKeys = Object.keys(graphic_data[0]).slice(1).filter((k) => k !== 'series')

	// console.log(fulldataKeys);

	// Nest the graphic_data by the 'series' column
	let nested_data = d3.group(graphic_data, (d) => d.series);

	// console.log(Array.from(nested_data))
	// Create a container div for each small multiple
	let chartContainers = graphic
		.selectAll('.chart-container')
		.data(Array.from(nested_data))
		.join('div')
		.attr('class', 'chart-container');

	function drawChart(container, data, chartIndex) {

		const chartEvery = config.optional.chart_every[size];
		const chartsPerRow = config.optional.chart_every[size];
		let chartPosition = chartIndex % chartsPerRow;

		let margin = { ...config.optional.margin[size] };

		// // If the chart is not in the first position in the row, reduce the left margin
		// if (config.optional.dropYAxis) {
		// 	if (chartPosition !== 0) {
		// 		margin.left = droppedMargin;
		// 	}
		// }


		let chartGap = config.optional?.chartGap || 10;

		let chart_width = calculateChartWidth({
			screenWidth: parseInt(graphic.style('width')),
			chartEvery: chartsPerRow,
			chartMargin: margin,
			chartGap: chartGap
		})

		if (chartPosition !== 0) {
			margin.left = chartGap;
		}

		const aspectRatio = config.optional.aspectRatio[size];

		//height is set by the aspect ratio
		var height =
			aspectRatio[1] / aspectRatio[0] * chart_width;

		// Define the x and y scales
		const x = d3
			.scaleTime()
			.domain(d3.extent(graphic_data, (d) => d.date))
			.range([0, chart_width]);


		const y = d3
			.scaleLinear()
			.domain([
				d3.min(graphic_data, (d) => Math.min(...fulldataKeys.map((c) => d[c]))),
				d3.max(graphic_data, (d) => Math.max(...fulldataKeys.map((c) => d[c])))
			])
			// .nice()
			.range([height, 0]);


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
			svgParent: container,
			chart_width: chart_width,
			height: height + margin.top + margin.bottom,
			margin: margin
		})


		// create lines and circles for each category
		categories.forEach(function (category) {
			const lineGenerator = d3
				.line()
				.x((d) => x(d.date))
				.y((d) => y(d[category]))
				.curve(d3[config.essential.lineCurveType]) // I used bracket notation here to access the curve type as it's a string
				.context(null)
				.defined(d => d[category] !== null) // Only plot lines where we have values

			// console.log(data)

			svg
				.append('path')
				.datum(data[1])
				.attr('fill', 'none')
				.attr(
					'stroke', /*() => (categories.indexOf(category) == chartIndex) ? "#206095" : "#dadada"*/
					config.essential.colour_palette[
					categories.indexOf(category) % config.essential.colour_palette.length
					]
				)
				.attr('stroke-width', 2.5)
				.attr('d', lineGenerator)
				.style('stroke-linejoin', 'round')
				.style('stroke-linecap', 'round')
				.attr('class', 'line' + categories.indexOf(category));

			const areaGenerator = d3.area()
				.x(d => x(d.date))
				.y0(d => y(d[`${category}_lowerCI`]))
				.y1(d => y(d[`${category}_upperCI`]))
				.defined(d => d[`${category}_lowerCI`] !== null && d[`${category}_upperCI`] !== null) // Only plot areas where we have values

			svg.append('path')
				.attr('d', areaGenerator(data[1]))
				.attr('fill', config.essential.colour_palette[
					categories.indexOf(category) % config.essential.colour_palette.length
				])
				.attr('opacity', 0.15)

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
					.tickValues([...new Set(graphic_data
						.map(function (d) {
							return d.date.getTime()
						}))] //just get unique dates as seconds past unix epoch
						.map(function (d) {
							return new Date(d)
						}) //map back to dates
						.sort(function (a, b) {
							return a - b
						})
						.filter(function (d, i) {
							return i % config.optional.xAxisTicksEvery[size] === 0 && i <= data[1].length - config.optional.xAxisTicksEvery[size] || i == data[1].length - 1 //Rob's fussy comment about labelling the last date
						})
					)
					.tickFormat(d3.timeFormat(config.essential.xAxisTickFormat[size]))
			);


		//If dropYAxis == true Only draw the y axis tick labels on the first chart in each row
		svg
			.append('g')
			.attr('class', 'y axis numeric')
			.call(d3.axisLeft(y)
				.ticks(config.optional.yAxisTicks[size])
				.tickFormat((d) => config.optional.dropYAxis !== true ? d3.format(config.essential.yAxisFormat)(d) :
					chartPosition == 0 ? d3.format(config.essential.yAxisFormat)(d) : ""))
			.selectAll('.tick text')
			.call(wrap, margin.left - 10);





		// This does the chart title label
		// svg
		// 	.append('g')
		// 	.attr('transform', 'translate(0, 0)')
		// 	.append('text')
		// 	.attr('x', 0)
		// 	.attr('y', 0)
		// 	.attr('dy', -45)
		// 	.attr('class', 'title')
		// 	.text(d => d[0])
		// 	.attr('text-anchor', 'start')
		// 	.call(wrap, (chart_width + margin.right));
		addChartTitleLabel({
			svgContainer: svg,
			yPosition: -margin.top / 2,
			text: d => d[0],
			wrapWidth: (chart_width + margin.right)
		})


		// This does the y-axis label
		// svg
		// 	.append('g')
		// 	.attr('transform', `translate(${-margin.left}, ${-margin.top})`)
		// 	.append('text')
		// 	.attr('x', 0)
		// 	.attr('y', margin.top - 15)
		// 	.attr('class', 'axis--label')
		// 	.text(() => chartIndex % chartEvery == 0 ?
		// 		config.essential.yAxisLabel : "")
		// 	.attr('text-anchor', 'start');
		addAxisLabel({
			svgContainer: svg,
			xPosition: -margin.left,
			yPosition: -15,
			text: chartIndex % chartEvery == 0 ?
				config.essential.yAxisLabel : "",
			textAnchor: "start",
			wrapWidth: chart_width
		});
	}


	// Draw the charts for each small multiple
	chartContainers.each(function (chart, i) {
		drawChart(d3.select(this), chart, i);
	});


	// Set up the legend
	var legenditem = d3
		.select('#legend')
		.selectAll('div.legend--item')
		.data(
			d3.zip(categories, config.essential.colour_palette)
		)
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

	if (config.essential.CI_legend) {

		// add confidence interval into legend as seperate div 
		var legenditemCI = d3.select('#legend')
			.selectAll('div.legend--item2')
			.data(d3.zip(0)) // creating a filler for the div to read in. 0 is meaningless
			.enter()
			.append('div')
			.attr('class', 'legend--itemCI')

		legenditemCI.append('div')
			.attr('class', 'legend--icon--rect')
			.style('background-color', '#C6C6C6');


		legenditemCI.append('div')
			.append('p')
			.attr('class', 'legend--text')
			.html(config.essential.CI_legend_text);

	}


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
// 		var text = d3.select(this),
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
// 		var breaks = text.selectAll('tspan').size();
// 		text.attr('y', function () {
// 			return -6 * (breaks - 1);
// 		});
// 	});
// }

// Load the data
d3.csv(config.essential.graphic_data_url).then((rawData) => {
	graphic_data = rawData.map((d) => {
		return {
			date: d3.timeParse(config.essential.dateFormat)(d.date),
			...Object.entries(d)
				.filter(([key]) => key !== 'date')
				.map(([key, value]) => key !== "series" ? [key, value == "" ? null : +value] : [key, value]) // Checking for missing values so that they can be separated from zeroes
				.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
		};
	});

	// Use pym to create an iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});

});

window.onresize = drawGraphic