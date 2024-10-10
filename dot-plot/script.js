import { initialise, wrap, addAxisLabel, addSvg } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, svg;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	let margin = config.optional.margin[size];
	let chart_width =
		parseInt(graphic.style('width')) - margin.left - margin.right;
	//height is set by unique options in column name * a fixed height
	let height = config.optional.seriesHeight[size] * graphic_data.length;

	//set up scales
	let x = d3.scaleLinear().range([0, chart_width]);

	let y = d3.scalePoint().padding(0.5).range([0, height]);

	//use the data to find unique entries in the name column
	y.domain(graphic_data.map((d) => d.name));

	//set up yAxis generator
	let yAxis = d3.axisLeft(y).tickSize(-chart_width).tickPadding(10);

	//set up xAxis generator
	let xAxis = d3
		.axisBottom(x)
		.tickSize(-height)
		.ticks(config.optional.xAxisTicks[size])
		.tickFormat(d3.format(config.essential.xAxisNumberFormat));

	// Set up the legend
	let legenditem = d3
		.select('#legend')
		.selectAll('div.legend--item')
		.data(
			d3.zip(config.essential.legendLabels, config.essential.colour_palette)
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

	//create svg for chart
	svg = addSvg({
		svgParent: graphic,
		chart_width: chart_width,
		height: height + margin.top + margin.bottom,
		margin: margin
	})

	if (config.essential.xDomain == 'auto') {
		let max = d3.max(graphic_data, function (d) {
			return d3.max([+d.min, +d.max]);
		});
		x.domain([0, max]);
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
		.attr('stroke-dasharray', '2 2')
		.selectAll('text')
		.call(wrap, margin.left - 5);

	svg
		.selectAll('circle.min')
		.data(graphic_data)
		.enter()
		.append('circle')
		.attr('class', 'min')
		.attr('r', 6)
		.attr('fill', config.essential.colour_palette[0])
		.attr('cx', function (d) {
			return x(d.min);
		})
		.attr('cy', function (d) {
			return y(d.name);
		});

	svg
		.selectAll('circle.max')
		.data(graphic_data)
		.enter()
		.append('circle')
		.attr('class', 'max')
		.attr('r', 6)
		.attr('fill', config.essential.colour_palette[1])
		.attr('cx', function (d) {
			return x(d.max);
		})
		.attr('cy', function (d) {
			return y(d.name);
		});

	addAxisLabel({
		svgContainer: svg,
		xPosition: chart_width,
		yPosition: height + 30,
		text: config.essential.xAxisLabel,
		textAnchor: "end",
		wrapWidth: chart_width
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
