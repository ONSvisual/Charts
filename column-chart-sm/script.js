var graphic = d3.select('#graphic');
var pymChild = null;

function drawGraphic() {
	//population accessible summmary
	d3.select('#accessibleSummary').html(config.essential.accessibleSummary);

	var threshold_md = config.optional.mediumBreakpoint;
	var threshold_sm = config.optional.mobileBreakpoint;

	//set variables for chart dimensions dependent on width of #graphic
	if (parseInt(graphic.style('width')) < threshold_sm) {
		size = 'sm';
	} else if (parseInt(graphic.style('width')) < threshold_md) {
		size = 'md';
	} else {
		size = 'lg';
	}


	const aspectRatio = config.optional.aspectRatio[size];
	var margin = config.optional.margin[size];
	var chart_every = config.optional.chart_every[size];
	var chart_width =
		parseInt(graphic.style('width')) / chart_every - margin.left - margin.right;
	//height is set by the aspect ratio
	var height =
		aspectRatio[1] / aspectRatio[0] * chart_width;

	// clear out existing graphics
	graphic.selectAll('*').remove();

	// Nest the graphic_data by the 'series' column
	var nested_data = d3.groups(graphic_data, (d) => d.series);

	// Create a container div for each small multiple
	var chartContainers = graphic
		.selectAll('.chart-container')
		.data(Array.from(nested_data))
		.join('div')
		.attr('class', 'chart-container');

	function drawChart(container, data, series) {
		//set up scales
		const y = d3.scaleLinear().range([height, 0]);

		const x = d3
			.scaleBand()
			.paddingOuter(0.0)
			.paddingInner(0.1)
			.range([0, chart_width])
			.round(true);

		//use the data to find unique entries in the date column
		x.domain([...new Set(graphic_data.map((d) => d.date))]);

		//set up yAxis generator
		var yAxis = d3.axisLeft(y)
			.tickSize(-chart_width)
			.tickPadding(10)
			.ticks(config.optional.yAxisTicks[size])
			.tickFormat(d3.format('.0%'));

		let xTime = d3.timeFormat(config.essential.xAxisTickFormat[size])

		//set up xAxis generator
		var xAxis = d3
			.axisBottom(x)
			.tickSize(10)
			.tickPadding(10)
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
					return i % config.optional.xAxisTicksEvery[size] === 0 && i <= graphic_data.length - config.optional.xAxisTicksEvery[size] || i == data.length - 1 //Rob's fussy comment about labelling the last date
				})
			)
			.tickFormat(xTime);

		//create svg for chart
		svg = d3
			.select('#graphic')
			.append('svg')
			.attr('width', chart_width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.attr('class', 'chart')
			.style('background-color', '#fff')
			.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

		if (config.essential.yDomain == 'auto') {
			y.domain([
				0,
				d3.max(graphic_data.map(({ value }) => Number(value)))]); //modified so it converts string to number
		} else {
			y.domain(config.essential.yDomain);
		}

		svg
			.append('g')
			.attr('transform', 'translate(0,' + height + ')')
			.attr('class', 'x axis')
			.call(xAxis);

		svg
			.append('g')
			.attr('class', 'y axis')
			.call(yAxis)
			.selectAll('line')
			.each(function (d) {
				if (d == 0) {
					d3.select(this).attr('class', 'zero-line');
				}
			})
			.selectAll('text')
			.call(wrap, margin.left - 10);

		svg
			.selectAll('rect')
			.data(data)
			.join('rect')
			.attr('y', (d) => y(d.value))
			.attr('x', (d) => x(d.date))
			.attr('height', (d) => Math.abs(y(d.value) - y(0)))
			.attr('width', x.bandwidth())
			.attr('fill', config.essential.colour_palette);

		// This does the chart title label
		svg
			.append('g')
			.attr('transform', 'translate(0, 0)')
			.append('text')
			.attr('x', 0)
			.attr('y', 0)
			.attr('dy', -25)
			.attr('class', 'title')
			.text(series)
			.attr('text-anchor', 'start')
			.call(wrap, chart_width);

		// This does the y-axis label
		svg
			.append('g')
			.attr('transform', 'translate(0,0)')
			.append('text')
			.attr('x', -margin.left + 10)
			.attr('y', -5)
			.attr('class', 'axis--label')
			.text(config.essential.yAxisLabel)
			.attr('text-anchor', 'start');
	}

	// Draw the charts for each small multiple
	chartContainers.each(function ([key, value]) {
		drawChart(d3.select(this), value, key);
	});

	//create link to source
	d3.select('#source').text('Source: ' + config.essential.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
}

function wrap(text, width) {
	text.each(function () {
		var text = d3.select(this),
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
		var breaks = text.selectAll('tspan').size();
		text.attr('y', function () {
			return -6 * (breaks - 1);
		});
	});
}

d3.csv(config.essential.graphic_data_url).then((data) => {
	//load chart data
	graphic_data = data;

	let parseTime = d3.timeParse(config.essential.dateFormat);

	data.forEach((d) => { d.date = parseTime(d.date) })

	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
