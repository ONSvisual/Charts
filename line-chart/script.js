let graphic = d3.select('#graphic');
let pymChild = null;

function drawGraphic() {
	//Accessible summary
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

	// Define the dimensions and margin, width and height of the chart.
	let margin = config.optional.margin[size];
	let width = parseInt(graphic.style('width')) - margin.left - margin.right;
	let height = 400 - margin.top - margin.bottom;

	// Remove any existing chart elements
	graphic.selectAll('*').remove();


// Get categories from the keys used in the stack generator
const categories = Object.keys(graphic_data[0]).filter((k) => k !== 'date');

// Define the x and y scales
const xAxis = d3
    .scaleTime()
    .domain(d3.extent(graphic_data, (d) => d.date))
    .range([0, width]);

const yAxis = d3
    .scaleLinear()
    .domain([0, d3.max(graphic_data, (d) => d3.sum(categories, (c) => d[c]))])
    .nice()
    .range([height, 0]);

// Create an SVG element
const svg = graphic
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr('class', 'chart')
    .style('background-color', '#fff')
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);


// create lines and circles for each category
categories.forEach(function(category) {
    const lineGenerator = d3.line()
        .x(d => xAxis(d.date))
        .y(d => yAxis(d[category]))
        .curve(d3.curveMonotoneX)
        .context(null);

    svg.append("path")
        .datum(graphic_data)
        .attr("fill", "none")
        .attr("stroke", config.optional.colors[category])
        .attr("stroke-width", 3)
        .attr("d", lineGenerator)
        .style("stroke-linejoin", "round")
        .style("stroke-linecap", "round");

    const lastDatum = graphic_data[graphic_data.length - 1];

    svg.append("circle")
        .attr("cx", xAxis(lastDatum.date))
        .attr("cy", yAxis(lastDatum[category]))
        .attr("r", 4)
        .attr("fill", config.optional.colors[category]);

    svg.append("text")
        .attr("transform", `translate(${xAxis(lastDatum.date)}, ${yAxis(lastDatum[category])})`)
        .attr("x", 10)
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .attr("fill", config.optional.colors[category])
        .text(category);
});

// add grid lines to y axis
svg.append("g")			
    .attr("class", "grid")
    .call(d3.axisLeft(yAxis)
        .ticks(5)
        .tickSize(-width)
        .tickFormat("")
    );

// Add the x-axis
svg
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0, ${height})`)
    .call(
        d3
            .axisBottom(xAxis)
            .ticks(config.optional.xAxisTicks[size])
            .tickFormat(d3.timeFormat(config.essential.xAxisTickFormat[size]))
    );

// Add the y-axis
svg.append('g').attr('class', 'y axis').call(d3.axisLeft(yAxis));

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
	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
}

d3.csv(config.essential.graphic_data_url).then((rawData) => {
	graphic_data = rawData.map((d) => {
		return {
			date: d3.timeParse(config.essential.dateFormat)(d.date),
			...Object.entries(d)
				.filter(([key]) => key !== 'date')
				.map(([key, value]) => [key, +value])
				.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
		};
	});

	console.log('Final data structure:');
	console.log(graphic_data);

	// Use pym to create an iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
