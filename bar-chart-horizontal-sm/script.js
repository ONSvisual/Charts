var graphic = d3.select('#graphic');
var pymChild = null;

function drawGraphic() {
	//population accessible summmary
	// Population accessible summary
	d3.select('#accessibleSummary').html(config.essential.accessibleSummary);

	var threshold_md = config.optional.mediumBreakpoint;
	var threshold_sm = config.optional.mobileBreakpoint;

	if (parseInt(graphic.style('width')) < threshold_sm) {
		size = 'sm';
	} else if (parseInt(graphic.style('width')) < threshold_md) {
		size = 'md';
	} else {
		size = 'lg';
	}

	var margin = config.optional.margin[size];
	var chart_every = config.optional.chart_every[size];
	// var chart_width =
	// 	parseInt(graphic.style('width')) / chart_every - margin.left - margin.right;

	let chart_width = ((parseInt(graphic.style('width'))- margin.left+10) / chart_every) - margin.right -10;
	var height = Math.ceil(
		(chart_width * config.optional.aspectRatio[size][1]) /
		config.optional.aspectRatio[size][0]
	);

	


	// Clear out existing graphics
	graphic.selectAll('*').remove();

	// Nest the graphic_data by the 'series' column
	var nested_data = d3.group(graphic_data, (d) => d.series);

	// Create a container div for each small multiple
	var chartContainers = graphic
		.selectAll('.chart-container')
		.data(Array.from(nested_data))
		.join('div')
		.attr('class', 'chart-container');

	function drawChart(container, data, chartIndex) {
		// Log the data being used for each small multiple
		console.log('Data for this small multiple:', data);
		console.log(chartIndex);
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


		let chartsPerRow = config.optional.chart_every[size];
		let chartPosition = chartIndex % chartsPerRow;
	
	
	
		// If the chart is not in the first position in the row, reduce the left margin
		if (chartPosition !== 0) {
			margin.left = 10;
		}

		//set up yAxis generator
	
		let yAxis = d3.axisLeft(y).tickSize(0).tickPadding(10);

		//set up xAxis generator
		var xAxis = d3
			.axisBottom(x)
			.tickSize(-height)
			.tickFormat(d3.format('.0%'))
			.ticks(config.optional.xAxisTicks[size]);

		//create svg for chart
		svg = container
			.append('svg')
			.attr('width', chart_width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.attr('class', 'chart')
			.style('background-color', '#fff')
			.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

		if (config.essential.xDomain == 'auto') {
			x.domain([
				0,
				d3.max(graphic_data.map(({ value }) => Number(value)))]); //modified so it converts string to number
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
			.call(wrap, margin.left - 10);

		svg
			.selectAll('rect')
			.data(data)
			.join('rect')
			.attr('x', x(0))
			.attr('y', (d) => y(d.name))
			.attr('width', (d) => x(d.value) - x(0))
			.attr('height', y.bandwidth())
			.attr('fill', config.essential.colour_palette);

		if (config.essential.dataLabels.show == true) {
			svg
				.selectAll('text.dataLabels')
				.data(data)
				.join('text')
				.attr('class', 'dataLabels')
				.attr('x', (d) => x(d.value))
				.attr('dx', (d) => (x(d.value) - x(0) < chart_width / 10 ? 3 : -3))
				.attr('y', (d) => y(d.name) + 19)
				.attr('text-anchor', (d) =>
					x(d.value) - x(0) < chart_width / 10 ? 'start' : 'end'
				)
				.attr('fill', (d) =>
					x(d.value) - x(0) < chart_width / 10 ? '#414042' : '#ffffff'
				)
				.text((d) =>
					d3.format(config.essential.dataLabels.numberFormat)(d.value)
				);
		} //end if for datalabels

		// This does the chart title label
		svg
			.append('g')
			.attr('transform', 'translate(0, 0)')
			.append('text')
			.attr('x', 0)
			.attr('y', 0)
			.attr('dy', -15)
			.attr('class', 'title')
			.text(d => d[0])
			.attr('text-anchor', 'start')
			.call(wrap, chart_width);
		
		// This does the x-axis label
		svg
			.append('g')
			.attr('transform', 'translate(0,' + height + ')')
			.append('text')
			.attr('x', chart_width)
			.attr('y', 35)
			.attr('class', 'axis--label')
			.text(config.essential.xAxisLabel)
			.attr('text-anchor', 'end');
	}

	// Draw the charts for each small multiple
	chartContainers.each(function ([key, value], i) {
		drawChart(d3.select(this), value, i);
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
		var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.1, // ems
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
	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
