import { initialise, wrap, addSvg, calculateChartWidth, addDataLabels, addChartTitleLabel, addAxisLabel } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, svg;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	//Set up the legend
	legend
		.append('div')
		.attr('class', 'legend--item--here')
		.append('div').attr('class', 'legend--icon--circle')
		.style('background-color', config.essential.colour_palette)

	d3.select(".legend--item--here")
		.append('div')
		.append('p').attr('class', 'legend--text')
		.html("Value")

		legend
		.append('div')
		.attr("class", "legend--item--here refline")
		.append('svg')
		.attr('height',14)
		.attr('width',25)
		.append('line')
		.attr('x1',2)
		.attr('x2',22)
		.attr('y1',8)
		.attr('y2',8)
		.attr('class','refline')

	d3.select(".legend--item--here.refline")
		.append('div')
		.append('p').attr('class', 'legend--text')
		.html("Reference value")

	// Nest the graphic_data by the 'series' column
	let nested_data = d3.group(graphic_data, (d) => d.series);

	//Generate a list of categories based on the order in the first chart that we can use to order the subsequent charts
	let namesArray = [...nested_data][0][1].map(d => d.name);

	// Create a container div for each small multiple
	let chartContainers = graphic
		.selectAll('.chart-container')
		.data(Array.from(nested_data))
		.join('div')
		.attr('class', 'chart-container');

	function drawChart(container, seriesName, data, chartIndex) {
		// Log the data being used for each small multiple
		// console.log('Data for this small multiple:', data);
		// console.log(chartIndex);

		//Sort the data so that the bars in each chart are in the same order
		data.sort((a, b) => namesArray.indexOf(a.name) - namesArray.indexOf(b.name))

		// Calculate the height based on the data
		let height = config.optional.seriesHeight[size] * data.length +
			10 * (data.length - 1) +
			12;


		let chartsPerRow = config.optional.chart_every[size];
		let chartPosition = chartIndex % chartsPerRow;

		let margin = { ...config.optional.margin[size] };

		// If the chart is not in the first position in the row, reduce the left margin
		if (config.optional.dropYAxis) {
			if (chartPosition !== 0) {
				margin.left = 10;
			}
		}

		let chart_width = calculateChartWidth({
			screenWidth: parseInt(graphic.style('width')),
			chartEvery: config.optional.chart_every[size],
			chartMargin: config.optional.margin[size]
		})

		//set up scales
		const x = d3.scaleLinear().range([0, chart_width]);

		const y = d3
			.scaleBand()
			.paddingOuter(0.2)
			.paddingInner(((data.length - 1) * 10) / (data.length * 30))
			.range([0, height])
			.round(true);

		//use the data to find unique entries in the name column
		y.domain([...new Set(data.map((d) => d.name))]);

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
		svg = addSvg({
			svgParent: container,
			chart_width: chart_width,
			height: height + margin.top + margin.bottom,
			margin: margin
		})

		if (config.essential.xDomain == 'auto') {
			x.domain([
				Math.min(0, d3.min(graphic_data.map(({ value }) => Number(value))),
					d3.min(graphic_data.map(({ ref }) => Number(ref)))),
				//x domain is the maximum out of the value and the reference value
				Math.max(d3.max(graphic_data.map(({ value }) => Number(value))),
					d3.max(graphic_data.map(({ ref }) => Number(ref))))
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


		svg
			.append('g')
			.attr('class', 'y axis')
			.call(yAxis)
			.selectAll('text')
			.call(wrap, margin.left - 20);


		svg
			.selectAll('rect')
			.data(data)
			.join('rect')
			.attr('x', d => d.value < 0 ? x(d.value) : x(0))
			.attr('y', (d) => y(d.name))
			.attr('width', (d) => Math.abs(x(d.value) - x(0)))
			.attr('height', y.bandwidth())
			.attr('fill', config.essential.colour_palette);


		svg
			.selectAll('line.refline')
			.data(data)
			.join('line')
			.attr('class', 'refline')
			.attr('x1', (d) => x(d.ref))
			.attr('x2', (d) => x(d.ref))
			.attr('y1', (d) => y(d.name))
			.attr('y2', (d) => y(d.name) + y.bandwidth())

		if (config.essential.dataLabels.show == true) {
			addDataLabels({
				svgContainer: svg,
				data: data,
				chart_width: chart_width,
				labelPositionFactor: 7,
				xScaleFunction: x,
				yScaleFunction: y
			})
		} //end if for datalabels

		// This does the chart title label
		addChartTitleLabel({
			svgContainer: svg,
			text: seriesName,
			wrapWidth: chart_width
		});

		// This does the x-axis label
		if (chartIndex % chartsPerRow === chartsPerRow - 1 || chartIndex === [...nested_data].length - 1) {
			addAxisLabel({
				svgContainer: svg,
				xPosition: chart_width,
				yPosition: height + 35,
				text: config.essential.xAxisLabel,
				wrapWidth: chart_width
			});
		}
	}

	// Draw the charts for each small multiple
	chartContainers.each(function ([key, value], i) {
		drawChart(d3.select(this), key, value, i);
	});

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

// window.onresize = drawGraphic