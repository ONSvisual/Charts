let graphic = d3.select('#graphic');
//console.log(`Graphic selected: ${graphic}`);

let graphic_data = [];

let pymChild = null;

function drawGraphic() {
	//Accessible summary
	d3.select('#accessibleSummary').html(config.essential.accessibleSummary);
	//	console.log(`Accessible summary set: ${config.essential.accessibleSummary}`);

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
	// console.log(`Size set: ${size}`);



	// Define the dimensions and margin, width and height of the chart.
	let margin = config.optional.margin[size];
	let width = parseInt(graphic.style('width')) - margin.left - margin.right;
	let height = 400 - margin.top - margin.bottom;
	// console.log(`Margin, width, and height set: ${margin}, ${width}, ${height}`);

	// Remove any existing chart elements
	graphic.selectAll('*').remove();
	//console.log(`Removed existing chart elements`);

    let xScale = d3.scaleTime()
        .domain(d3.extent(graphic_data, d => d.date))
        .range([0, width]);

let yScale = d3.scalePoint()
    .domain(graphic_data.map(d => d.series).sort())
    .range([height, 0])
    .padding(1);

let zScale = d3.scaleLinear()
    .domain([0, d3.max(graphic_data, d => d.value)])
    .range([0, -100]);  // negative for a Joy plot

let xAxis = d3.axisBottom(xScale)
    .ticks(config.optional.xAxisTicks[size])
    .tickFormat(d3.timeFormat(config.essential.xAxisTickFormat[size]));

let yAxis = d3.axisLeft(yScale);

let svg = graphic.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

svg.append("g")
    .call(yAxis);

let line = d3.line()
    .curve(d3.curveBasis)  // for a smooth line
    .x(d => xScale(d.date))
    .y(d => zScale(d.value));

    let series = Array.from(d3.group(graphic_data, d => d.series), ([key, values]) => ({key, values}));


    svg.selectAll(".series")
    .data(series)
    .enter().append("g")
    .attr("fill", "none")
    .attr("stroke", "#000")
    .attr("stroke-width", 1.5)
    .attr("class", "series")
    .attr("transform", d => `translate(0, ${yScale(d.key)})`)
    .append("path")
    .attr("d", d => line(d.values));

	

	// This does the x-axis label
	svg
		.append('g')
		.attr('transform', `translate(0, ${height})`)
		.append('text')
		.attr('x', width)
		.attr('y', 35)
		.attr('class', 'axis--label')
		.text(config.essential.xAxisLabel)
		.attr('text-anchor', 'end');

	//create link to source
	d3.select('#source').text('Source: ' + config.essential.sourceText);
	// console.log(`Link to source created`);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
	// console.log(`PymChild height sent`);
}

//text wrap function for the direct labelling

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

// Load the data
d3.csv(config.essential.graphic_data_url).then((rawData) => {
    rawData.forEach((d) => {
        let date = d3.timeParse(config.essential.dateFormat)(d.date);
        Object.entries(d)
            .filter(([key]) => key !== 'date' && key !== 'series')
            .forEach(([activity, value]) => {
                graphic_data.push({
                    date: date,
                    series: d.series,
                    activity: activity,
                    value: +value,
                });
            });
    });

    // Use pym to create an iframed chart dependent on specified variables
    pymChild = new pym.Child({
        renderCallback: drawGraphic
    });
});
