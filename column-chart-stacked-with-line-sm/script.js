let graphic = d3.select('#graphic');
let pymChild = null;
let legend = d3.select('#legend');

function drawGraphic() {
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


	const aspectRatio = config.optional.aspectRatio[size];
	let margin = config.optional.margin[size];
	const chart_every = config.optional.chart_every[size];
	let chart_width =
		parseInt(graphic.style('width')) / chart_every - margin.left - margin.right;
	//height is set by the aspect ratio
	let height =
		aspectRatio[1] / aspectRatio[0] * chart_width;

	// clear out existing graphics
	graphic.selectAll('*').remove();
	legend.selectAll('*').remove();

	// Nest the graphic_data by the 'series' column
	let nested_data = d3.group(graphic_data, (d) => d.series);

	// Create a container div for each small multiple
	let chartContainers = graphic
		.selectAll('.chart-container')
		.data(Array.from(nested_data))
		.join('div')
		.attr('class', 'chart-container');

	function drawChart(container, data, seriesName) {

		//set up scales
		const y = d3.scaleLinear().range([height, 0]);

		const x = d3
			.scaleBand()
			.paddingOuter(0.0)
			.paddingInner(0.1)
			.range([0, chart_width])
			.round(true);

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
			.tickFormat(d3.format('.0f'));

		const stack = d3
			.stack()
			.keys(graphic_data.columns.slice(2).filter(d => (d) !== config.essential.line_series))
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
		let colours = [...config.essential.colour_palette].slice(0, graphic_data.columns.slice(2).length-1)

		//gets array of arrays for individual lines
		let lines = [];
		for (let column in graphic_data[0]) {
			if (column == 'date' || column == 'series') continue;
			lines[column] = data.map(function (d) {
				return {
					'name': d.date,
					'amt': d[column]
				};
			});
		}

		// console.log("linesflat: ", Object.entries(lines).flat(3))

		let counter;
		// do some code to overwrite blanks with the last known point
		keys = Object.keys(lines);
		for (i = 0; i < keys.length; i++) {
			// console.log(lines[keys[i]])
			lines[keys[i]].forEach(function (d, j) {
				if (d.amt != "null") {
					counter = j;
				} else {
					d.name = lines[keys[i]][counter].name
					d.amt = lines[keys[i]][counter].amt
				}

			})

		}

		// console.log("keys: ", keys)
		let bar_keys = keys.filter(d => d !== config.essential.line_series);
		// console.log(bar_keys)

		// Set up the legend
		let legenditem = d3
			.select('#legend')
			.selectAll('div.legend--item')
			.data(
				d3.zip(bar_keys.reverse(), colours.reverse())
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

		//Columns
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

		//Lines
		let thisCurve = d3.curveLinear

		let line = d3.line()
			.defined((d) => d.amt !== 'null')
			.curve(thisCurve)
			.x((d) => x(d.name))
			.y((d) => y(d.amt));

		let line_values = Object.entries(lines).filter(d => d[0] == config.essential.line_series);

		svg.append('g')
			.selectAll('path')
			.data(line_values)
			.enter()
			.append('path')
			.attr("stroke", (d, i) => config.essential.line_colour)
			.attr("class", "dataLine")
			.attr('d', (d) =>
				line(d[1]))
			.attr("transform", "translate(" + x.bandwidth() / 2 + ",0)");

		// This does the chart title label
		svg
			.append('g')
			.attr('transform', 'translate(0, 0)')
			.append('text')
			.attr('x', 0)
			.attr('y', 0)
			.attr('dy', -30)
			.attr('class', 'title')
			.text(seriesName)
			.attr('text-anchor', 'start')
			.call(wrap, chart_width);


		// This does the y-axis label
		svg
			.append('g')
			.attr('transform', 'translate(0,0)')
			.append('text')
			.attr('x', -margin.left + 10)
			.attr('y', -10)
			.attr('class', 'axis--label')
			.text(config.essential.yAxisLabel)
			.attr('text-anchor', 'start');
	};

	// Draw the charts for each small multiple
	chartContainers.each(function ([key, value]) {
		drawChart(d3.select(this), value, key);
	});

	d3.select('#legend')
		.append('div')
		.attr('class', 'legend--item line')
		.append('div')
		.attr('class', 'legend--icon--refline')
		.style('background-color', config.essential.line_colour);

	d3.select('.legend--item.line')
		.append('div')
		.attr('class', 'legend--text')
		.text(config.essential.line_series)

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

	data.forEach((d) => { d.date = parseTime(d.date) })

	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
