var graphic = d3.select('#graphic');
var select = d3.select('#select');
var pymChild = null;
var x, y;


function drawGraphic() {
	graphic.selectAll('*').remove();
	select.selectAll('*').remove();
	
	//population accessible summmary
	d3.select('#accessibleSummary').html(config.essential.accessibleSummary);

	uniqueOptions = [...new Set(graphic_data.map((d) => d.option))];

	console.log(`dropdownData contains: ${JSON.stringify(uniqueOptions)}`);

	const optns = select
		.append('div')
		.attr('id', 'sel')
		.append('select')
		.attr('id', 'optionsSelect')
		.attr('style', 'width:calc(100% - 6px)')
		.attr('class', 'chosen-select');

	// Add the placeholder option
	optns.append('option').attr('value', '').text('Select an option'); // Placeholder text

	optns
		.selectAll('option.option')
		.data(uniqueOptions)
		.enter()
		.append('option')
		.attr('value', (d) => d)
		.text((d) => d);

	

			//add some more accessibility stuff
	d3.select('input.chosen-search-input').attr('id', 'chosensearchinput');
	d3.select('div.chosen-search')
		.insert('label', 'input.chosen-search-input')
		.attr('class', 'visuallyhidden')
		.attr('for', 'chosensearchinput')
		.html('Type to select an area');
		

		$('#optionsSelect').trigger('chosen:updated');  // Initialize Chosen

		let labelPositions = new Map();  // Create a map to store label positions
		
		$('#optionsSelect').chosen().change(function () {
			const selectedOption = $(this).val();
			console.log(`Selected option: ${selectedOption}`);
		
			if (selectedOption) {
				changeData(selectedOption);

    } else {
        // Clear the chart if no option is selected
        clearChart();
    }
});

// Clear the chart if no option is selected

function clearChart() {
    // Clear the chart graphics
    svg.selectAll('rect').transition().duration(2000).attr('width', 0).remove();

    svg
        .selectAll('text.dataLabels')
        .transition()
        .duration(1000)
        .attr('x', -100)
        .remove();
};

function changeData(selectedOption) {
	
	let filteredData = graphic_data.filter(
		(d) => d.option === selectedOption
	);
	console.log('Filtered data:', filteredData);

	// Update the y scale domain based on the filtered data
	y.domain(filteredData.map((d) => d.name));

	// Update the y axis with the new domain
	svg
		.select('y axis')
		.transition()
		.duration(2000)
		.call(yAxis)
		.selectAll('text')
		.call(wrap, margin.left - 10);

	// Store the current positions of the labels in the map
	svg.selectAll('text.dataLabels').each(function(d) {
		labelPositions.set(d.name, x(d.value));
	});

	// Enter and update
	let bars = svg.selectAll('rect').data(filteredData, (d) => d.name);

	// Exit
	bars.exit().transition().duration(400).ease(d3.easeCubic).attr('width', 0).remove();

	// Enter and update
	bars
		.enter()
		.append('rect')
		.attr('x', x(0))
		.attr('y', (d) => y(d.name))
		.attr('width', 0)
		.attr('height', y.bandwidth())
		.attr('fill', config.essential.colour_palette)
		.merge(bars)
		.transition()
		.duration(1250)
		.ease(d3.easeCubic)
		.attr('width', (d) => x(d.value) - x(0));

	// Update the data labels
	if (config.essential.dataLabels.show === true) {
		svg
			.selectAll('text.dataLabels')
			.data(filteredData)
			.join('text')
			.attr('class', 'dataLabels')
			.attr('x', (d) => labelPositions.get(d.name) || x(0))  // Use the stored position or x(0) if not found
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
			)
			.transition()
			.duration(1200)
			.ease(d3.easeCubic)
							.tween('text', function(d) {
		// Parse this.textContent as a float and multiply it by 0.001 to get the start value. This need to match the data.
		let startValue = parseFloat(this.textContent)*0.001;

		// Create an interpolator
		const i = d3.interpolate(startValue, d.value);

		// Create a position interpolator
		const xi = d3.interpolate(labelPositions.get(d.name) || x(0), x(d.value) - (x(d.value) - x(0) < chart_width / 10 ? -3 : 3));

		return function(t) {
			// Calculate the interpolated value
			let interpolatedValue = i(t);

			// Update the label's text
			this.textContent = d3.format(config.essential.dataLabels.numberFormat)(interpolatedValue);

			// Update the label's x position
			d3.select(this).attr('x', xi(t));
		};
	});
}

}

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

	var margin = config.optional.margin[size];
	var chart_width =
		parseInt(graphic.style('width')) - margin.left - margin.right;
	//height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion

	var uniqueNames = [...new Set(graphic_data.map((d) => d.name))];
	var height =
		config.optional.seriesHeight[size] * uniqueNames.length +
		10 * (uniqueNames.length - 1) +
		12;

	// clear out existing graphics
	graphic.selectAll('*').remove();

	//set up scales
	x = d3.scaleLinear().range([0, chart_width]);

	y = d3
		.scaleBand()
		.paddingOuter(0.2)
		.paddingInner(((graphic_data.length - 1) * 10) / (graphic_data.length * 30))
		.range([0, height])
		.round(true);

	//use the data to find unique entries in the name column
	y.domain([...new Set(graphic_data.map((d) => d.name))]);

	//set up yAxis generator
	var yAxis = d3.axisLeft(y).tickSize(0).tickPadding(10);

	//set up xAxis generator
	var xAxis = d3
		.axisBottom(x)
		.tickSize(-height)
		.tickFormat(d3.format('.0%'))
		.ticks(config.optional.xAxisTicks[size]);

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

	// Append y-axis to SVG
	svg
		.append('g')
		.attr('class', 'y axis')
		.call(yAxis)
		.selectAll('text')
		.call(wrap, margin.left - 10);

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

	console.log(`Length of graphic_data: ${graphic_data.length}`);


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

	//create link to source
	d3.select('#source').text('Source: ' + config.essential.sourceText);

	$('#optionsSelect').val(config.essential.defaultOption).trigger('chosen:updated');
	changeData(config.essential.defaultOption)
	// updateLegend("Agriculture, forestry and fishing", 0)

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

	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
