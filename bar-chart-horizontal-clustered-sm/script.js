import { initialise, wrap, addSvg, calculateChartWidth, addDataLabels, addChartTitleLabel, addAxisLabel } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, svg;

function drawGraphic() {
	// // clear out existing graphics
	// graphic.selectAll('*').remove();
	// legend.selectAll('*').remove();

	// //population accessible summmary
	// d3.select('#accessibleSummary').html(config.essential.accessibleSummary);

	// let threshold_md = config.optional.mediumBreakpoint;
	// let threshold_sm = config.optional.mobileBreakpoint;

	// if (parseInt(graphic.style('width')) < threshold_sm) {
	// 	size = 'sm';
	// } else if (parseInt(graphic.style('width')) < threshold_md) {
	// 	size = 'md';
	// } else {
	// 	size = 'lg';
	// }

	//Set up some of the basics and return the size value
	size = initialise(size);

	let legendCategories = [...new Set(graphic_data.map((d) => d.category))]

	//Set up the legend
	let legendItem = legend
		.selectAll('div')
		.data(legendCategories)
		.join('div')
		.attr('class', 'legend--item')

	legendItem
		.append('div')
		.attr('class', 'legend--icon--circle')
		.style('background-color', (d, i) => config.essential.colour_palette[i])

	legendItem
		.append('div')
		.append('p')
		.attr('class', 'legend--text')
		.text(d => d)

	// Nest the graphic_data by the 'series' column
	let nested_data = d3.group(graphic_data, (d) => d.series);

	//Generate a list of categories based on the order in the first chart that we can use to order the subsequent charts
	let namesArray = [...new Set([...nested_data][0][1].map(d => d.name))];
	// console.log(namesArray)

	// Create a container div for each small multiple
	let chartContainers = graphic
		.selectAll('.chart-container')
		.data(Array.from(nested_data))
		.join('div')
		.attr('class', 'chart-container');

	function drawChart(container, data, chartIndex) {

		// console.log(chartIndex);

		//Sort the data so that the bars in each chart are in the same order
		data.sort((a, b) => namesArray.indexOf(a.name) - namesArray.indexOf(b.name))

		// Log the data being used for each small multiple
		// console.log('Data for this small multiple:', data);

		// function calculateChartWidth(size) {
		// 	const chartEvery = config.optional.chart_every[size];
		// 	const chartMargin = config.optional.margin[size];

		// 	if (config.optional.dropYAxis) {
		// 		// Chart width calculation allowing for 10px left margin between the charts
		// 		const chartWidth = ((parseInt(graphic.style('width')) - chartMargin.left - ((chartEvery - 1) * 10)) / chartEvery) - chartMargin.right;
		// 		return chartWidth;
		// 	} else {
		// 		const chartWidth = ((parseInt(graphic.style('width')) / chartEvery) - chartMargin.left - chartMargin.right);
		// 		return chartWidth;
		// 	}
		// }


		// Calculate the height based on the data
		let height = config.optional.seriesHeight[size] * namesArray.length +
			10 * (namesArray.length - 1) +
			12;


		let chartsPerRow = config.optional.chart_every[size];
		let chartPosition = chartIndex % chartsPerRow;

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


		//set up scales
		const x = d3.scaleLinear().range([0, chart_width]);

		const y = d3
			.scaleBand()
			.paddingOuter(0.1)
			.paddingInner(0.2)
			.range([0, height])
			.round(true);

		//use the data to find unique entries in the name column
		y.domain([...new Set(data.map((d) => d.name))]);


		const y2 = d3
			.scaleBand()
			.paddingOuter(0)
			.paddingInner(0)
			.range([0, y.bandwidth()])
			.round(true);

		//use the data to find unique entries in the category column
		y2.domain(legendCategories);
		// console.log(y2.domain())

		//set up yAxis generator

		let yAxis = d3.axisLeft(y)
			.tickSize(0)
			.tickPadding(10)
			.tickFormat((d) => config.optional.dropYAxis !== true ? (d) :
				chartPosition == 0 ? (d) : "");

		//set up xAxis generator
		let xAxis = d3
			.axisBottom(x)
			.tickSize(-height)
			.tickFormat(d3.format(config.essential.dataLabels.numberFormat))
			.ticks(config.optional.xAxisTicks[size]);

		//create svg for chart
		// svg = container
		// 	.append('svg')
		// 	.attr('width', chart_width + margin.left + margin.right)
		// 	.attr('height', height + margin.top + margin.bottom)
		// 	.attr('class', 'chart')
		// 	.style('background-color', '#fff')
		// 	.append('g')
		// 	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
		svg = addSvg({
			svgParent: container,
			chart_width: chart_width,
			height: height + margin.top + margin.bottom,
			margin: margin
		})

		if (config.essential.xDomain == 'auto') {
			x.domain([
				Math.min(0, d3.min(graphic_data.map(({ value }) => Number(value)))),
				//x domain is the maximum out of the value and the reference value
				Math.max(0, d3.max(graphic_data.map(({ value }) => Number(value))))
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

		// if (chartPosition == 0) {
		svg
			.append('g')
			.attr('class', 'y axis')
			.call(yAxis)
			.selectAll('text')
			.call(wrap, margin.left - 10);
		// }


		svg
			.selectAll('rect')
			.data(data)
			.join('rect')
			.attr('x', d => d.value < 0 ? x(d.value) : x(0))
			.attr('y', (d) => y(d.name) + y2(d.category))
			.attr('width', (d) => Math.abs(x(d.value) - x(0)))
			.attr('height', y2.bandwidth())
			.attr('fill', (d) => config.essential.colour_palette[legendCategories.indexOf(d.category)]);


		let labelPositionFactor = 7;

		if (config.essential.dataLabels.show == true && legendCategories.length <= 2) {
			// svg
			// 	.selectAll('text.dataLabels')
			// 	.data(data)
			// 	.join('text')
			// 	.attr('class', 'dataLabels')
			// 	.attr('x', (d) => d.value > 0 ? x(d.value) :
			// 		Math.abs(x(d.value) - x(0)) < chart_width / labelPositionFactor ? x(0) : x(d.value))
			// 	.attr('dx', (d) => d.value > 0 ?
			// 		(Math.abs(x(d.value) - x(0)) < chart_width / labelPositionFactor ? 3 : -3) :
			// 		3)
			// 	.attr('y', (d) => y(d.name) + y2(d.category) + y2.bandwidth() / 2)
			// 	.attr('dominant-baseline', 'middle')
			// 	.attr('text-anchor', (d) => d.value > 0 ?
			// 		(Math.abs(x(d.value) - x(0)) < chart_width / labelPositionFactor ? 'start' : 'end') :
			// 		"start"
			// 	)
			// 	.attr('fill', (d) =>
			// 		(Math.abs(x(d.value) - x(0)) < chart_width / labelPositionFactor ? '#414042' : '#ffffff')
			// 	)
			// 	.text((d) =>
			// 		d3.format(config.essential.dataLabels.numberFormat)(d.value)
			// 	);

			addDataLabels({
				svgContainer: svg,
				data: data,
				chart_width: chart_width,
				labelPositionFactor: 7,
				xScaleFunction: x,
				yScaleFunction: y,
				y2function: y2
			})
		} //end if for datalabels

		// This does the chart title label
		// svg
		// 	.append('g')
		// 	.attr('transform', 'translate(0, 0)')
		// 	.append('text')
		// 	.attr('x', 0)
		// 	.attr('y', 0)
		// 	.attr('dy', -15)
		// 	.attr('class', 'title')
		// 	.text(d => d[0])
		// 	.attr('text-anchor', 'start')
		// 	.call(wrap, chart_width);

		addChartTitleLabel({
			svgContainer: svg,
			yPosition: -15,
			text: d => d[0],
			wrapWidth: chart_width
		})

		// This does the x-axis label
		if (chartIndex % chartsPerRow === chartsPerRow - 1 || chartIndex === [...nested_data].length - 1) {
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
	chartContainers.each(function ([key, value], i) {
		drawChart(d3.select(this), value, i);
	});

	//create link to source
	d3.select('#source').text('Source: ' + config.essential.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
}

// function wrap(text, width) {
// 	text.each(function () {
// 		let text = d3.select(this),
// 			words = text.text().split(/\s+/).reverse(),
// 			word,
// 			line = [],
// 			lineNumber = 0,
// 			lineHeight = 1.1, // ems
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

d3.csv(config.essential.graphic_data_url).then((data) => {
	//load chart data
	graphic_data = data;

	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});