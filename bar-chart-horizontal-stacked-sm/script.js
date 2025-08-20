import { initialise, wrap, addSvg, calculateChartWidth, addAxisLabel, addSource } from "../lib/helpers.js";

let pymChild = null;
let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let size, graphic_data;



function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	// Group the data by the 'series' column
	const nested_data = d3.groups(graphic_data, (d) => d.series);

	//Generate a list of categories based on the order in the first chart that we can use to order the subsequent charts
	let namesArray = [...nested_data][0][1].map(d => d.name);

	// Create a container div for each small multiple
	let chartContainers = graphic
		.selectAll('.chart-container')
		.data(Array.from(nested_data))
		.join('div')
		.attr('class', 'chart-container');

	function drawChart(container, seriesName, data, chartIndex) {
		//Sort the data so that the bars in each chart are in the same order
		data.sort((a, b) => namesArray.indexOf(a.name) - namesArray.indexOf(b.name))

		const chartsPerRow = config.optional.chart_every[size];
		const chartPosition = chartIndex % chartsPerRow;

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


		//console.log(`The value of chart_width is ${chart_width}.`);

		//height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion

		let height =
			config.optional.seriesHeight[size] * data.length +
			10 * (data.length - 1) +
			12;

		// Define scales
		const x = d3.scaleLinear().range([0, chart_width]);

		// This is a different version
		// const y = d3.scaleBand().rangeRound([0, height]).padding(0.1);

		const y = d3
			.scaleBand()
			.paddingOuter(0.2)
			.paddingInner(((data.length - 1) * 10) / (data.length * 30))
			.range([0, height])
			.round(true);

		// Define axes
		let xAxis = d3
			.axisBottom(x)
			.tickSize(-height)
			.tickFormat(d3.format(config.essential.xAxisTickFormat))
			.ticks(config.optional.xAxisTicks[size]);

		let yAxis = d3.axisLeft(y)
			.tickSize(0)
			.tickPadding(10)
			.tickFormat((d) => config.optional.dropYAxis !== true ? (d) :
				chartPosition == 0 ? (d) : "");

		// Define stack layout
		let stack = d3
			.stack()
			.offset(d3[config.essential.stackOffset])
			.order(d3[config.essential.stackOrder])
			.keys(graphic_data.columns.slice(1, -1));

		// Process data ! This needs review

		const series = stack(data);

		// console.table(series);

		if (config.essential.xDomain === 'auto') {
			x.domain([Math.min(0, d3.min(stack(graphic_data), (d) => d3.min(d, (d) => d[1]))), d3.max(stack(graphic_data), (d) => d3.max(d, (d) => d[1]))]); //removed.nice()
		} else {
			x.domain(config.essential.xDomain);
		}

		y.domain(data.map((d) => d.name));

		// Set up the legend
		let legenditem = legend
			.selectAll('div.legend--item')
			.data(
				d3.zip(graphic_data.columns.slice(1), config.essential.colour_palette)
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

		//End of legend code

		// console.log('Chart width:', chart_width);
		// console.log('Height:', height);
		// console.log('X domain:', x.domain());
		// console.log('Y domain:', y.domain());

		// Create SVG
		let svg = addSvg({
			svgParent: graphic,
			chart_width: chart_width,
			height: height + margin.top + margin.bottom,
			margin: margin
		})


		// Add axes
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

		// console.log(`The value of margin.left - (your value) is ${margin.left - 30}.`);

		// if (chartIndex % chartsPerRow === 0) {
		svg
			.append('g')
			.attr('class', 'y axis')
			.call(yAxis)
			.selectAll('.tick text')
			.call(wrap, margin.left - 10);
		// } else {
		// 	svg.append('g').attr('class', 'y axis').call(yAxis.tickValues([]));
		// }

		// Add a bold text label to the top left corner of the chart SVG
		svg
			.append('text')
			.attr('class', 'title')
			.attr('x', 0)
			.attr('y', -margin.top / 2)
			.text(seriesName);

		// Draw chart
		svg
			.append('g')
			.selectAll('g')
			.data(series)
			.enter()
			.append('g')
			.style('fill', (_, i) => config.essential.colour_palette[i])
			.selectAll('rect')
			.data((d) => d)
			.join('rect')
			.attr('x', (d) => x(d[0]))
			.attr('y', (d, i) => y(data[i].name))
			.attr('width', (d) => x(d[1]) - x(d[0]))
			.attr('height', y.bandwidth());

		// This does the x-axis label
		if (chartIndex % chartsPerRow === chartsPerRow - 1 || chartIndex === nested_data.length - 1) {
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
		drawChart(d3.select(this), key, value, i);
	});

	//create link to source
	addSource('source', config.essential.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
}


// Load the data
d3.csv(config.essential.graphic_data_url)
	.then((data) => {
		// console.log('Original data:', data);

		// // clear out existing graphics
		// graphic.selectAll('*').remove();
		// legend.selectAll('*').remove();

		graphic_data = data;
		// // Group the data by the 'series' column
		// const groupedData = d3.groups(fullData, (d) => d.series);
		// // console.log('Grouped data:', groupedData[0][1]);

		// //Generate a list of categories based on the order in the first chart that we can use to order the subsequent charts
		// let namesArray = [...groupedData][0][1].map(d => d.name);


		// groupedData.forEach((group, i) => {
		// 	const seriesName = group[0];
		// 	const graphic_data = group[1];

		// 	//Sort the data so that the bars in each chart are in the same order
		// 	graphic_data.sort((a, b) => namesArray.indexOf(a.name) - namesArray.indexOf(b.name))

		// 	graphic_data.columns = data.columns;

		// 	pymChild = new pym.Child({ renderCallback: drawGraphic(seriesName, graphic_data, i, groupedData.length, fullData) });
		// });

		//use pym to create iframed chart dependent on specified variables
		pymChild = new pym.Child({
			renderCallback: drawGraphic
		});
	})
	.catch((error) => console.error(error));
