import { wrap, addSvg, calculateChartWidth, addChartTitleLabel, addAxisLabel } from "../lib/helpers.js";

let pymChild = null;
let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
// let graphic_data, size, svg;

//Remove fallback
d3.select('#graphic').select('img').remove();

function drawGraphic(seriesName, graphic_data, chartIndex) {

	//population accessible summary
	d3.select('#accessibleSummary').html(config.essential.accessibleSummary);

	//Was trying to be a little fancy but will need to workshop this.
	// var size = window.innerWidth > config.optional.mobileBreakpoint ? "lg" : "sm";

	// function calculateChartWidth(size) {
	// 	const chartEvery = config.optional.chart_every[size];
	// 	const aspectRatio = config.optional.aspectRatio[size];
	// 	const chartMargin = config.optional.margin[size];

	// 	if (config.optional.dropYAxis) {
	// 		// Chart width calculation allowing for 10px left margin between the charts
	// 		const chartWidth = ((parseInt(graphic.style('width')) - chartMargin.left - ((chartEvery - 1) * 20)) / chartEvery) - chartMargin.right;
	// 		return chartWidth;
	// 	} else {
	// 		const chartWidth = ((parseInt(graphic.style('width')) / chartEvery) - chartMargin.left - chartMargin.right);
	// 		return chartWidth;
	// 	}
	// }




	// size thresholds as defined in the config.js file

	let threshold_md = config.optional.mediumBreakpoint;
	let threshold_sm = config.optional.mobileBreakpoint;

	//set variables for chart dimensions dependent on width of #graphic
	let size;
	if (parseInt(graphic.style('width')) < threshold_sm) {
		size = 'sm';
	} else if (parseInt(graphic.style('width')) < threshold_md) {
		size = 'md';
	} else {
		size = 'lg';
	}


	const chartsPerRow = config.optional.chart_every[size];
	const chartPosition = chartIndex % chartsPerRow;

	// console.log(chartIndex);

	// Set dimensions
	let margin = { ...config.optional.margin[size] };
	let chartGap = config.optional?.chartGap || 10;

	// Calculate chart width here
	let chart_width = calculateChartWidth({
		screenWidth: parseInt(graphic.style('width')),
		chartEvery: chartsPerRow,
		chartMargin: margin,
		chartGap: chartGap
	});

	// If the chart is not in the first position in the row, reduce the left margin
	if (config.optional.dropYAxis) {
		if (chartPosition !== 0) {
			margin.left = chartGap;
		}
	}

	// Get categories from the keys used in the stack generator
	const categories = Object.keys(graphic_data[0]).filter((k) => k !== 'date' && k !== 'series');

	const colorScale = d3
		.scaleOrdinal()
		.domain(categories)
		.range(config.essential.colour_palette);

	//Getting the list of colours used in this visualisation
	let colours = [...config.essential.colour_palette].slice(0, categories.length)

	// Set up the legend
	const legenditem = legend
		.selectAll('div.legend--item')
		.data(
			d3.zip([...categories].reverse(), colours.reverse())
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

	if (size !== 'sm') {
		d3.select('#legend')
			.style('grid-template-columns', `repeat(${config.optional.legendColumns}, 1fr)`)
	}
	//End of legend code


	let height =
		chart_width * (config.optional.aspectRatio[size][1] / config.optional.aspectRatio[size][0]) - margin.top - margin.bottom;

	// Define the x and y scales
	const xAxis = d3
		.scaleTime()
		.domain(d3.extent(graphic_data, (d) => d.date))
		.range([0, chart_width]);

	const yAxis = d3
		.scaleLinear()
		.domain([0, d3.max(graphic_data, (d) => d3.sum(categories, (c) => d[c]))])
		.range([height, 0]);

	// Define the stack generator
	const stack = d3.stack()
		.keys(categories)
		.order(d3[config.essential.stackOrder]) // Use the stack order defined in the config
		.offset(d3[config.essential.stackOffset]); // Convert to percentage values

	// Create an SVG for this chart
	// let svg = graphic
	// 	.append('svg')
	// 	.attr('width', chart_width + margin.left + margin.right)
	// 	.attr('height', height + margin.top + margin.bottom)
	// 	.attr('class', 'chart')
	// 	.style('backgroud-color', '#fff')
	// 	.append('g')
	// 	.attr('transform', `translate(${margin.left}, ${margin.top})`);
	const svg = addSvg({
		svgParent: graphic,
		chart_width: chart_width,
		height: height + margin.top + margin.bottom,
		margin: margin
	})

	// Add the areas
	svg
		.selectAll('.area')
		.data(stack(graphic_data))
		.enter()
		.append('path')
		.attr('class', 'area')
		.attr(
			'd',
			d3
				.area()
				.x((d) => xAxis(d.data.date))
				.y0((d) => yAxis(d[0]))
				.y1((d) => yAxis(d[1]))
		)
		.attr('fill', (d) => colorScale(d.key));

	// Add the x-axis
	svg
		.append('g')
		.attr('class', 'axis numeric')
		.attr('transform', `translate(0, ${height})`)
		.call(
			d3
				.axisBottom(xAxis)
				.tickValues(graphic_data
					.map(function (d) {
						return d.date.getTime()
					}) //just get dates as seconds past unix epoch
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
				.tickFormat(d3.timeFormat(config.essential.xAxisTickFormat[size]))
		);


	//Add the y-axis to the leftmost chart, or all charts if dropYAxis in the config is false
	svg
		.append('g')
		.attr('class', 'y axis numeric')
		.call(d3.axisLeft(yAxis)
			.tickSize(calculateTickSize())
			.tickFormat((d) => config.optional.dropYAxis !== true ? d3.format(config.essential.yAxisFormat)(d) :
				chartPosition == 0 ? d3.format(config.essential.yAxisFormat)(d) : ""));

	function calculateTickSize() {
		if (config.optional.dropYAxis) {
			if (chartPosition == 0) {
				return 5
			} else {
				return 0
			}
		} else {
			return 5
		}
	}

	// Add a title to each of the charts 
	// svg
	// 	.append('text')
	// 	.attr('x', 0)
	// 	.attr('y', -margin.top / 2)
	// 	.attr('text-anchor', 'start')
	// 	.style('font-size', '16px')
	// 	.attr('class', 'title')
	// 	.text(seriesName);

	addChartTitleLabel({
		svgContainer: svg,
		yPosition: -margin.top / 2,
		text: seriesName,
		wrapWidth: chart_width
	})

	// This does the x-axis label
	if (chartIndex % chartsPerRow === chartsPerRow - 1) {
	  addAxisLabel({
		svgContainer: svg,
		xPosition: chart_width,
		yPosition: height + 35,
		text: config.essential.xAxisLabel,
		textAnchor: "end",
		wrapWidth: chart_width
	  });
	}

	// This does the y-axis label
	// svg
	// 	.append('g')
	// 	.attr('transform', 'translate(0,0)')
	// 	.append('text')
	// 	.attr('x', -(margin.left - 5))
	// 	.attr('y', -10)
	// 	.attr('class', 'axis--label')
	// 	.text(() => chartPosition == 0 ? config.essential.yAxisLabel : "")
	// 	.attr('text-anchor', 'start');
	addAxisLabel({
		svgContainer: svg,
		xPosition: -(margin.left - 5),
		yPosition: -10,
		text: chartPosition == 0 ? config.essential.yAxisLabel : "",
		textAnchor: "start",
		wrapWidth: chart_width
	  });
		
	//create link to source
	d3.select('#source').text('Source: ' + config.essential.sourceText);

	// Send the height to the parent frame
	if (pymChild) {
		pymChild.sendHeight();
	}
}


function renderCallback() {
	// clear out existing graphics
	graphic.selectAll('*').remove();
	legend.selectAll('*').remove();

	// Load the data
	d3.csv(config.essential.graphic_data_url)
		.then((data) => {
			// console.log("Original data:", data);

			// Group the data by the 'series' column
			const groupedData = d3.groups(data, (d) => d.series);
			// console.log("Grouped data:", groupedData);

			// console.table(groupedData);
			// Remove previous SVGs
			//	graphic.selectAll('svg').remove();

			groupedData.forEach((group, i) => {
				const seriesName = group[0];
				let graphic_data = group[1];
				graphic_data.columns = data.columns;

				// Further process the graphic_data
				const categories = Object.keys(graphic_data[0]).filter(
					(k) => k !== 'date' && k !== 'series'
				);
				graphic_data.forEach((d) => {
					d.date = d3.timeParse(config.essential.dateFormat)(d.date);
					for (let category of categories) {
						d[category] = +d[category];
					}
				});

				drawGraphic(seriesName, graphic_data, i);
			})
		})
};

// use pym to create iframed charts dependent on specified variables

pymChild = new pym.Child({
	renderCallback: renderCallback,
});

