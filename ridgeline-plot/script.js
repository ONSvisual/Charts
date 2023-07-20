let graphic = d3.select('#graphic');
let pymChild = null;

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

	let margin = config.optional.margin[size];
	let chart_width =
		parseInt(graphic.style('width')) - margin.left - margin.right;
	//height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion

	// clear out existing graphics
	graphic.selectAll('*').remove();

 let keys = Object.keys(graphic_data[0]).filter((d) => d !== 'date');
//  console.log("keys ",keys);

 //height come from the number of keys - 1 because of date variable.
 let height = config.optional.seriesHeight[size] * keys.length + 10 * (keys.length - 1) + 12;
 
 
//layers version 1
// let layers = keys.map(key => graphic_data.map(({ date, [key]: value }) => ({ date, value })));

//layers version 2

let layers = keys.map(key => graphic_data.map(d => ({date: d.date, value: d[key]})));

//  console.log("layers",layers);


	//set up scales
	const x = d3.scaleTime()
	.range([0, chart_width])
	.domain(d3.extent(graphic_data, d => d.date));

	//set up xAxis generator
	var xAxis = d3
		.axisBottom(x)
		.tickSize(-height)
		.tickFormat(d3.format('.0%'))
		.ticks(config.optional.xAxisTicks[size]);


	const y = d3
		.scaleBand()
		// .paddingOuter(0.2)
		// .paddingInner(((graphic_data.length - 1) * 10) / (graphic_data.length * 30))
		.range([0, height])
		.domain(keys);

		let z = d3.scaleSequential(d3.interpolateCool).domain([0, keys.length]);


	//set up yAxis generator
	var yAxis = d3.axisLeft(y).tickSize(0).tickPadding(10);



	//create chart_g for chart
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
		.call(xAxis)
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
		.call(wrap, margin.left - 10);




let series = chart_g.selectAll('.series')
    .data(layers)
    .enter().append('g')
    .attr('class', 'series')
    .attr('fill', (d, i) => d3.interpolateViridis(i / keys.length)) // This will give each series a different color
    .attr('transform', (d, i) => `translate(0,${y(keys[i])})`);

console.log(series);


// draw the ridgeline plot
// Append lines (the ridges)
    // chart_g.append('g')
    //     .selectAll('path')
    //     .data(layers)
    //     .join('path')
    //         .attr('fill', 'black')
    //         .attr('stroke', (d, i) => z(i))
    //         .attr('d', line);


	// This does the x-axis label
	chart_g
		.append('g')
		.attr('transform', 'translate(0,' + height + ')')
		.append('text')
		.attr('x', chart_width)
		.attr('y', 35)
		.attr('class', 'axis--label')
		.text(config.essential.xAxisLabel)
		.attr('text-anchor', 'end');

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
