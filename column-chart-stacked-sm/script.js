let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, svg;

function drawGraphic() {
	// clear out existing graphics
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

	// Nest the graphic_data by the 'series' column
	let nested_data = d3.group(graphic_data, (d) => d.series);

	// Create a container div for each small multiple
	let chartContainers = graphic
		.selectAll('.chart-container')
		.data(Array.from(nested_data))
		.join('div')
		.attr('class', 'chart-container');

	let xDataType;

	if (Object.prototype.toString.call(graphic_data[0].date) === '[object Date]') {
		xDataType = 'date';
	} else {
		xDataType = 'numeric';
	}

	// console.log(xDataType)

	function drawChart(container, data, chartIndex) {

		function calculateChartWidth(size) {

			const chartMargin = config.optional.margin[size];

			if (config.optional.dropYAxis) {
				// Chart width calculation allowing for 10px left margin between the charts
				const chartWidth = ((parseInt(graphic.style('width')) - chartMargin.left - ((chartEvery - 1) * 10)) / chartEvery) - chartMargin.right;
				return chartWidth;
			} else {
				const chartWidth = ((parseInt(graphic.style('width')) / chartEvery) - chartMargin.left - chartMargin.right);
				return chartWidth;
			}
		}

		const chartEvery = config.optional.chart_every[size];
		const chartsPerRow = config.optional.chart_every[size];
		let chartPosition = chartIndex % chartsPerRow;

		let margin = { ...config.optional.margin[size] };

		// If the chart is not in the first position in the row, reduce the left margin
		if (config.optional.dropYAxis) {
			if (chartPosition !== 0) {
				margin.left = 10;
			}
		}

		const aspectRatio = config.optional.aspectRatio[size];
		let chart_width = calculateChartWidth(size)

		//height is set by the aspect ratio
		let height =
			aspectRatio[1] / aspectRatio[0] * chart_width;

		//set up scales
		const y = d3.scaleLinear().range([height, 0]);

		const x = d3
			.scaleBand()
			.paddingOuter(0.0)
			.paddingInner(0.1)
			.range([0, chart_width])
			.round(false);

		const colour = d3
			.scaleOrdinal()
			.domain(graphic_data.columns.slice(2))
			.range(config.essential.colour_palette);

		//use the data to find unique entries in the date column
		x.domain([...new Set(graphic_data.map((d) => d.date))]);

		//set up yAxis generator
		const yAxis = d3.axisLeft(y)
			.tickSize(-chart_width)
			.tickPadding(10)
			.ticks(config.optional.yAxisTicks[size])
			.tickFormat((d) => config.optional.dropYAxis !== true ? d3.format(config.essential.yAxisTickFormat)(d) :
				chartPosition == 0 ? d3.format(config.essential.yAxisTickFormat)(d) : "");

		const stack = d3
			.stack()
			.keys(graphic_data.columns.slice(2))
			.offset(d3[config.essential.stackOffset])
			.order(d3[config.essential.stackOrder]);

		const series = stack(data);
		const seriesAll = stack(graphic_data);

		let xTime = d3.timeFormat(config.essential.xAxisTickFormat[size])

		//set up xAxis generator
		const xAxis = d3
			.axisBottom(x)
			.tickSize(10)
			.tickPadding(10)
			.tickValues(xDataType == 'date' ? graphic_data
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
				}) : x.domain().filter((d, i) => { return i % config.optional.xAxisTicksEvery[size] === 0 && i <= graphic_data.length - config.optional.xAxisTicksEvery[size] || i == data.length - 1 })
			)
			.tickFormat((d) => xDataType == 'date' ? xTime(d)
				: d3.format(config.essential.xAxisNumberFormat)(d));

		// //Labelling the first and/or last bar if needed
		// if (config.optional.showStartEndDate == true) {
		// 	xAxis.tickValues(x.domain().filter(function (d, i) {
		// 		return !(i % config.optional.xAxisTicksEvery[size])
		// 	}).concat(x.domain()[0], x.domain()[x.domain().length - 1]))
		// }

		//create svg for chart
		const svg = container
			.append('svg')
			.attr('width', chart_width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.attr('class', 'chart')
			.style('background-color', '#fff')
			.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

		if (config.essential.yDomain == 'auto') {
			y.domain(d3.extent(seriesAll.flat(2))); //flatten the arrays and then get the extent
		} else {
			y.domain(config.essential.yDomain);
		}

		//Getting the list of colours used in this visualisation
		let colours = [...config.essential.colour_palette].slice(0, graphic_data.columns.slice(2).length)

		// Set up the legend
		let legenditem = d3
			.select('#legend')
			.selectAll('div.legend--item')
			.data(
				d3.zip(graphic_data.columns.slice(2).reverse(), colours.reverse())
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
			.append('g')
			.selectAll('g')
			.data(series)
			.join('g')
			.attr('fill', (d, i) => config.essential.colour_palette[i])
			.selectAll('rect')
			.data((d) => d)
			.join('rect')
			.attr('y', (d) => Math.min(y(d[0]), y(d[1])))
			.attr('x', (d) => x(d.data.date))
			.attr('height', (d) => Math.abs(y(d[0]) - y(d[1])))
			.attr('width', x.bandwidth());

		// This does the chart title label
		svg
			.append('g')
			.attr('transform', 'translate(0, 0)')
			.append('text')
			.attr('x', 0)
			.attr('y', 0)
			.attr('dy', -30)
			.attr('class', 'title')
			.text(data[0].series)
			.attr('text-anchor', 'start')
			.call(wrap, chart_width);


		// This does the y-axis label
		svg
			.append('g')
			.attr('transform', 'translate(0,0)')
			.append('text')
			.attr('x', 5 - margin.left)
			.attr('y', -10)
			.attr('class', 'axis--label')
			.text(() => chartIndex % chartEvery == 0 ? config.essential.yAxisLabel : "")
			.attr('text-anchor', 'start');
	};

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

	data.forEach((d, i) => {

		//If the date column is has date data store it as dates
		if (parseTime(data[i].date) !== null) {
			d.date = parseTime(d.date)
		}

	});

	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
