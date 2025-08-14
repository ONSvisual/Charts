import { initialise, wrap, addSvg, calculateChartWidth, addChartTitleLabel, addAxisLabel } from "https://cdn.ons.gov.uk/assets/data-vis-charts/v1/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, chart_width;

function drawGraphic() {
	
	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	// Get categories from the keys used in the stack generator
	const categories = Object.keys(graphic_data[0]).filter((k) => k !== 'date' && k !== 'series');
	// console.log(categories)

	// Nest the graphic_data by the 'series' column
	let nested_data = d3.group(graphic_data, (d) => d.series);

	// console.log(Array.from(nested_data))
	// Create a container div for each small multiple
	let chartContainers = graphic
		.selectAll('.chart-container')
		.data(Array.from(nested_data))
		.join('div')
		.attr('class', 'chart-container');

	function drawChart(container, seriesName, data, chartIndex) {

		const chartEvery = config.optional.chart_every[size];
		const chartsPerRow = config.optional.chart_every[size];
		let chartPosition = chartIndex % chartsPerRow;

		let margin = { ...config.optional.margin[size] };

		let chartGap = config.optional?.chartGap || 10;

		// If the chart is not in the first position in the row, reduce the left margin
		if (config.optional.dropYAxis && !config.optional.freeYAxisScales) {

			chart_width = calculateChartWidth({
				screenWidth: parseInt(graphic.style('width')),
				chartEvery: chartsPerRow,
				chartMargin: margin,
				chartGap: chartGap
			})
			if (chartPosition !== 0) {
				margin.left = chartGap;
			}
		} else {
			chart_width = ((parseInt(graphic.style('width')) / chartEvery) - margin.left - margin.right);
		}
		// }

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
				0, //This should be a calculated rather than 0 to allow for negativ values
				d3.max(config.optional.freeYAxisScales ? data : graphic_data, (d) => Math.max(...categories.map((c) => d[c])))
			])
			.nice()
			.range([height, 0]);


		// Create an SVG element
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

			svg
				.append('path')
				.datum(data)
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
console.log(data)
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
							return i % config.optional.xAxisTicksEvery[size] === 0 && i <= data.length - config.optional.xAxisTicksEvery[size] || i == data.length - 1 //Rob's fussy comment about labelling the last date
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
				.tickFormat((d) => config.optional.freeYAxisScales ? d3.format(config.essential.yAxisFormat)(d) :
					config.optional.dropYAxis ? (chartPosition == 0 ? d3.format(config.essential.yAxisFormat)(d) : "") :
						d3.format(config.essential.yAxisFormat)(d)))
			.selectAll('.tick text')
			.call(wrap, margin.left - 10);



		// This does the chart title label
		addChartTitleLabel({
			svgContainer: svg,
			yPosition: -margin.top / 2,
			text: seriesName,
			wrapWidth: (chart_width + margin.right)
		})


		// This does the y-axis label
		addAxisLabel({
			svgContainer: svg,
			xPosition: -margin.left,
			yPosition: 35 - margin.top,
			text: config.optional.freeYAxisScales ? config.essential.yAxisLabel :
				chartIndex % chartEvery == 0 ?
					config.essential.yAxisLabel : "", //May need to make the y-axis label an array in the config?
			textAnchor: "start",
			wrapWidth: chart_width
		});
	}


	// Draw the charts for each small multiple
	chartContainers.each(function ([key, value], i) {
		drawChart(d3.select(this), key, value, i);
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

	//create link to source
	d3.select('#source').text('Source: ' + config.essential.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
	// console.log(`PymChild height sent`);
}

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
