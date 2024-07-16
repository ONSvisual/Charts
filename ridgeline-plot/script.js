import { addAxisLabel } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, chart_g;

function drawGraphic() {
	// Remove any existing chart elements
	graphic.selectAll('*').remove();
	legend.selectAll('*').remove();

	//population accessible summmary
	d3.select('#accessibleSummary').html(config.essential.accessibleSummary);

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

	let margin = config.optional.margin[size];
	let chart_width =
		parseInt(graphic.style('width')) - margin.left - margin.right;
	//height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion

	let keys = Object.keys(graphic_data[0]).filter((d) => d !== 'date');

	let height = config.optional.seriesHeight[size] * keys.length + 10 * (keys.length - 1) + 12;

	let layers = keys.map(key => graphic_data.map(d => ({date: d.date, value: d[key]})));

	const x = d3.scaleTime()
		.range([0, chart_width])
		.domain(d3.extent(graphic_data, d => d.date));

	let xAxis = d3
		.axisBottom(x)
		.tickSize(-height)
		.tickFormat(d3.format('.0%'))
		.ticks(config.optional.xAxisTicks[size]);

	let y = d3.scalePoint()
		.domain(keys)
		.range([height, 0])
		.padding(1);

	let z = d3.scaleSequential(d3.interpolateCool).domain([0, keys.length]);

	let yAxis = d3.axisLeft(y).tickSize(0).tickPadding(10);

	let y_scale = d3.scaleLinear()
		.range([config.optional.seriesHeight[size], 0])
		.domain([0, d3.max(layers, layer => d3.max(layer, d => d.value))]);

	let areaGenerator = d3.area()
		.x((d) => x(d.date))
		.y0(y_scale(0))
		.y1((d) => y_scale(d.value));

	chart_g = graphic
		.append('svg')
		.attr('width', chart_width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.attr('class', 'chart')
		.style('background-color', '#fff')
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	chart_g
		.append('g')
		.attr('transform', 'translate(0,' + height + ')')
		.attr('class', 'x axis')
		//.call(xAxis)
		.call(xAxis.tickFormat(d3.timeFormat('%H:%M')))
		.selectAll('line')
		.each(function (d) {
			if (d == 0) {
				d3.select(this).attr('class', 'zero-line');
			}
		});

		chart_g
		.append('g')
		.attr('class', 'y axis')
		.call(yAxis)
		.selectAll('text')
		.attr('dy', '15px') // Adjust the vertical position of the labels using pixels
		.attr('transform', 'translate(-5, 0)') // Adjust the horizontal position of the labels
		.call(wrap, margin.left); 
	

	let series = chart_g.selectAll('.series')
		.data(layers)
		.enter().append('g')
		.attr('class', 'series')
		//.attr('fill', (d, i) => z(i)) // change this line from interpolateViridis to z(i) to map correctly with z color scale
		.attr('fill', '#206095')
		.attr('transform', (d, i) => `translate(0,${y(keys[i])})`);

	series.append('path')
		.attr('class', 'area') // forgot to specify class for your path
		.attr('d', areaGenerator);

	// chart_g
	// 	.append('g')
	// 	.attr('transform', 'translate(0,' + height + ')')
	// 	.append('text')
	// 	.attr('x', chart_width)
	// 	.attr('y', 35)
	// 	.attr('class', 'axis--label')
	// 	.text(config.essential.xAxisLabel)
	// 	.attr('text-anchor', 'end');
	addAxisLabel({
		svgContainer: chart_g,
		xPosition: chart_width,
		yPosition: height + 35,
		text: config.essential.xAxisLabel,
		textAnchor: "end",
		wrapWidth: chart_width
	});

	//create link to source
	d3.select('#source').text('Source – ' + config.essential.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
}

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

d3.csv(config.essential.graphic_data_url).then((data) => {
	//load chart data
	graphic_data = data;

	let parseTime = d3.timeParse(config.essential.dateFormat);

	data.forEach((d) => {
		d.date = parseTime(d.date);

		for (let prop in d) {
			if (prop !== 'date') {
				d[prop] = +d[prop];
			}

		}
	});
	// console.log("original data ",graphic_data);
	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
