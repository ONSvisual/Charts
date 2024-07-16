import { addAxisLabel } from "../lib/helpers.js";

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


	const aspectRatio = config.optional.aspectRatio[size];
	let margin = config.optional.margin[size];
	let chart_width =
		parseInt(graphic.style('width')) - margin.left - margin.right;
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

	//use the data to find unique entries in the date column
	x.domain([...new Set(graphic_data.map((d) => d.date))]);

	//set up yAxis generator
	let yAxis = d3.axisLeft(y)
		.tickSize(-chart_width)
		.tickPadding(10)
		.ticks(config.optional.yAxisTicks[size])
		.tickFormat(d3.format(config.essential.yAxisTickFormat));

		let xDataType;

		if (Object.prototype.toString.call(graphic_data[0].date) === '[object Date]') {
		  xDataType = 'date';
		} else {
		  xDataType = 'numeric';
		}
	  
		// console.log(xDataType)

	let xTime = d3.timeFormat(config.essential.xAxisTickFormat[size])

	let tickValues = x.domain().filter(function (d, i) {
		return !(i % config.optional.xAxisTicksEvery[size])
	});

	//Labelling the first and/or last bar if needed
	if (config.optional.addFirstDate == true) {
		tickValues.push(graphic_data[0].date)
		console.log("First date added")
	}

	if (config.optional.addFinalDate == true) {
		tickValues.push(graphic_data[graphic_data.length - 1].date)
		console.log("Last date added")
	}

	//set up xAxis generator
	let xAxis = d3
		.axisBottom(x)
		.tickSize(10)
		.tickPadding(10)
		.tickValues(tickValues)
		.tickFormat((d) => xDataType == 'date' ? xTime(d)
		: d3.format(config.essential.xAxisNumberFormat)(d));

	const stack = d3
		.stack()
		.keys(graphic_data.columns.slice(1).filter(d => (d) !== config.essential.line_series))
		.offset(d3[config.essential.stackOffset])
		.order(d3[config.essential.stackOrder]);

	let series = stack(graphic_data);

	//gets array of arrays for individual lines
	let lines = [];
	for (let column in graphic_data[0]) {
		if (column == 'date') continue;
		lines[column] = graphic_data.map(function (d) {
			return {
				'name': d.date,
				'amt': d[column]
			};
		});
	}


	// console.log("linesflat: ", Object.entries(lines).flat(3))

	let counter;
	// do some code to overwrite blanks with the last known point
	let keys = Object.keys(lines);
	for (let i = 0; i < keys.length; i++) {
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

	// Set up the legend
	let legenditem = d3
		.select('#legend')
		.selectAll('div.legend--item')
		.data(
			d3.zip(graphic_data.columns.slice(1).filter(d => (d) !== config.essential.line_series), config.essential.colour_palette)
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
		// y.domain([
		// 	0,
		// 	d3.max(graphic_data, (d) => d3.max(keys, (c) => d[c]))])
		y.domain(d3.extent(series.flat(2)));
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
		.attr('width', x.bandwidth())
	// .attr('fill', config.essential.colour_palette[0]);


	let thisCurve = d3.curveLinear

	let line = d3.line()
		.defined((d) => d.amt !== 'null')
		.curve(thisCurve)
		.x((d) => x(d.name))
		.y((d) => y(d.amt));
	// //     //opposite sex

	let line_values = Object.entries(lines).filter(d => d[0] == config.essential.line_series)

	// console.log("lines: ", lines)
	// console.log("Object.entries(lines)", Object.entries(lines))
	// console.log("filtered lines: ", Object.entries(lines).filter(d => d[0] == config.essential.line_series))

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

	// This does the y-axis label
	// svg
	// 	.append('g')
	// 	.attr('transform', 'translate(0,0)')
	// 	.append('text')
	// 	.attr('x', 5 - margin.left)
	// 	.attr('y', -10)
	// 	.attr('class', 'axis--label')
	// 	.text(config.essential.yAxisLabel)
	// 	.attr('text-anchor', 'start');
	addAxisLabel({
		svgContainer: svg,
		xPosition: 5 - margin.left,
		yPosition: -10,
		text: config.essential.yAxisLabel,
		textAnchor: "start",
		wrapWidth: chart_width
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
