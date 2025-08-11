import { initialise, wrap, addSvg, addAxisLabel } from "https://cdn.ons.gov.uk/assets/data-vis-charts/v1/helpers.js";

let graphic = d3.select('#graphic');
let select = d3.select('#select');
let legend = d3.select('#legend');
let graphic_data, size;
//console.log(`Graphic selected: ${graphic}`);

let pymChild = null;

function drawGraphic() {
	select.selectAll('*').remove(); // Remove the select element if it exists

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);
	const aspectRatio = config.optional.aspectRatio[size]
	let margin = config.optional.margin[size];
	let chart_width = parseInt(graphic.style('width')) - margin.left - margin.right;
	let height = (aspectRatio[1] / aspectRatio[0]) * chart_width;

	// Create an SVG element at the top so all functions can use it
	const svg = addSvg({
		svgParent: graphic,
		chart_width: chart_width,
		height: height + margin.top + margin.bottom,
		margin: margin
	});

	let uniqueOptions = [...new Set(graphic_data.map((d) => d.option))];

	console.log(graphic_data);

	console.log(uniqueOptions);

	console.log(`dropdownData contains: ${JSON.stringify(uniqueOptions)}`);

	const optns = select
		.append('div')
		.attr('id', 'sel')
		.append('select')
		.attr('id', 'optionsSelect')
		.attr('style', 'width:calc(100% - 6px)')
		.attr('class', 'chosen-select')
		.attr('data-placeholder', 'Select an option');


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
		svg.selectAll('path')
		// .transition().duration(2000)
		.attr('width', 0).remove();

		svg.selectAll('circle.line-end')
			// .transition().duration(2000)
			// .attr('r', 0)
			.remove();

		svg
			.selectAll('text.directLineLabel')
			// .transition()
			// .duration(1000)
			// .attr('x', -100)
			.remove();
	};

// Function to change the data based on the selected option
function changeData(selectedOption) {
	// Remove all existing lines and circles
	svg.selectAll('path.line').remove();
	svg.selectAll('circle.line-end').remove();
	svg.selectAll('text.directLineLabel').remove();
	svg.selectAll('line.label-leader-line').remove();

	d3.selectAll('.y.axis .tick').attr('opacity', 1); // Reveal y-axis ticks

	// Clear existing legend
	d3.select('#legend').selectAll('div.legend--item').remove();

	// Filter data for the selected option
	let filteredData = graphic_data.filter((d) => d.option === selectedOption);
	if (filteredData.length === 0) return;

	// Get categories (series) for this option
	const categories = Object.keys(filteredData[0]).filter((k) => k !== 'date' && k !== 'option');

	// Set y domain for "auto" (per selected option)
	if (config.essential.yDomain === "auto") {
		let minY = d3.min(filteredData, (d) => Math.min(...categories.map((c) => d[c])));
		let maxY = d3.max(filteredData, (d) => Math.max(...categories.map((c) => d[c])));
		y.domain([minY, maxY]);
		console.log("auto y domain:", minY, maxY);
		// Update y axis
		svg.select('.y.axis.numeric')
			.transition()
			.duration(500)
			.call(d3.axisLeft(y).ticks(config.optional.yAxisTicks[size])
				.tickFormat(d3.format(config.essential.yAxisNumberFormat)));
		// Update grid lines
		svg.select('.grid')
			.transition()
			.duration(500)
			.call(
				d3.axisLeft(y)
					.ticks(config.optional.yAxisTicks[size])
					.tickSize(-chart_width)
					.tickFormat('')
			);
	}

	// Draw all lines and circles first
	categories.forEach(function (category, index) {
		const lineGenerator = d3.line()
			.x((d) => x(d.date))
			.y((d) => y(d[category]))
			.defined(d => d[category] !== null)
			.curve(d3[config.essential.lineCurveType]);

		svg.append('path')
			.datum(filteredData)
			.attr('class', 'line')
			.attr('fill', 'none')
			.attr('stroke', config.essential.colour_palette[index % config.essential.colour_palette.length])
			.attr('stroke-width', 3)
			.attr('d', lineGenerator)
			.style('stroke-linejoin', 'round')
			.style('stroke-linecap', 'round');

		// Add circle at the end of the line
		const lastDatum = filteredData[filteredData.length - 1];
		svg.append('circle')
			.attr('class', 'line-end')
			.attr('cx', x(lastDatum.date))
			.attr('cy', y(lastDatum[category]))
			.attr('r', 4)
			.attr('fill', config.essential.colour_palette[index % config.essential.colour_palette.length]);
	});

	// Handle legend vs direct labels
	if (config.essential.drawLegend || size === 'sm') {
		// Create legend (moved outside the loop)
		let legenditem = d3
			.select('#legend')
			.selectAll('div.legend--item')
			.data(categories.map((c, i) => [c, config.essential.colour_palette[i % config.essential.colour_palette.length]]))
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
	} else {
		// Handle direct labels with collision detection
		createDirectLabels(categories, filteredData);
	}
}

// Separate function to handle direct label creation and positioning
function createDirectLabels(categories, filteredData) {
	let labelData = [];
	const lastDatum = filteredData[filteredData.length - 1];

	// Create all labels first and collect their data
	categories.forEach(function (category, index) {
		// Skip if the last value is null (no data point to label)
		if (lastDatum[category] === null) return;

		const label = svg.append('text')
			.attr('class', 'directLineLabel')
			.attr('x', x(lastDatum.date) + 10)
			.attr('y', y(lastDatum[category]))
			.attr('dy', '.35em')
			.attr('text-anchor', 'start')
			.attr('fill', config.essential.text_colour_palette[index % config.essential.text_colour_palette.length])
			.text(category)
			.call(wrap, margin.right - 10);

		// Get the actual height of the text element after wrapping
		const bbox = label.node().getBBox();
		
		labelData.push({
			node: label,
			x: x(lastDatum.date) + 10,
			y: y(lastDatum[category]),
			originalY: y(lastDatum[category]),
			height: bbox.height,
			category: category
		});
	});

	// Only run collision detection if we have multiple labels
	if (labelData.length > 1) {
		// Sort labels by their y position for easier collision detection
		labelData.sort((a, b) => a.y - b.y);

		// Simple collision detection and adjustment
		const minSpacing = 12; // Minimum pixels between label centers
		
		for (let i = 1; i < labelData.length; i++) {
			const current = labelData[i];
			const previous = labelData[i - 1];
			
			// Check if current label overlaps with previous
			const overlap = (previous.y + previous.height/2 + minSpacing/2) - (current.y - current.height/2 - minSpacing/2);
			
			if (overlap > 0) {
				// Move current label down
				current.y += overlap;
				
				// Make sure it doesn't go below chart bounds
				if (current.y + current.height/2 > height) {
					// If it would go below, try moving the previous label up instead
					const pushUp = (current.y + current.height/2) - height;
					
					// Move all previous labels up by the required amount
					for (let j = i - 1; j >= 0; j--) {
						labelData[j].y -= pushUp;
						// Don't let them go above the chart
						if (labelData[j].y - labelData[j].height/2 < 0) {
							labelData[j].y = labelData[j].height/2;
						}
					}
					
					// Adjust current label to fit
					current.y = height - current.height/2;
				}
			}
		}

		// Apply the adjusted positions
		labelData.forEach(label => {
			label.node.attr('y', label.y);
			// Draw a leader line if the label is offset vertically from the end point
			if (Math.abs(label.y - label.originalY) > 1) {
				svg.append('line')
					.attr('class', 'label-leader-line')
					.attr('x1', label.x - 10) // end of the line (before label offset)
					.attr('y1', label.originalY)
					.attr('x2', label.x) // start of the label
					.attr('y2', label.y)
					.attr('stroke', config.essential.colour_palette[categories.indexOf(label.category) % config.essential.colour_palette.length])
					.attr('stroke-width', 1)
					.attr('stroke-dasharray', '2,2'); // optional: dashed line
			}
		});
	}
}

// Alternative force-based approach which I can't get to work properly
function createDirectLabelsWithForce(categories, filteredData) {
	let labelData = [];
	const lastDatum = filteredData[filteredData.length - 1];

	// Create all labels first
	categories.forEach(function (category, index) {
		if (lastDatum[category] === null) return;

		const label = svg.append('text')
			.attr('class', 'directLineLabel')
			.attr('x', x(lastDatum.date) + 10)
			.attr('y', y(lastDatum[category]))
			.attr('dy', '.35em')
			.attr('text-anchor', 'start')
			.attr('fill', config.essential.text_colour_palette[index % config.essential.text_colour_palette.length])
			.text(category)
			.call(wrap, margin.right - 10);

		const bbox = label.node().getBBox();
		
		labelData.push({
			node: label,
			x: x(lastDatum.date) + 10,
			y: y(lastDatum[category]),
			originalY: y(lastDatum[category]),
			height: bbox.height,
			width: bbox.width
		});
	});

	if (labelData.length > 1) {
		// Use d3 force simulation for more sophisticated positioning
		const simulation = d3.forceSimulation(labelData)
			.force('y', d3.forceY(d => d.originalY).strength(0.8))
			.force('collide', d3.forceCollide().radius(d => d.height/2 + 2))
			.force('bounds', () => {
				labelData.forEach(d => {
					d.y = Math.max(d.height/2, Math.min(height - d.height/2, d.y));
				});
			})
			.stop();

		// Run simulation
		for (let i = 0; i < 120; i++) {
			simulation.tick();
		}

		// Apply final positions
		labelData.forEach(d => {
			d.node.attr('y', d.y);
		});
	}
}
	// Define the dimensions and margin, width and height of the chart.
	// Remove duplicate declarations of margin, chart_width, and height in drawGraphic

	// Get categories from the keys used in the stack generator
	const categories = Object.keys(graphic_data[0]).filter((k) => k !== 'date' && k !== 'option');
	// console.log(`Categories retrieved: ${categories}`);

	let xDataType;

	if (Object.prototype.toString.call(graphic_data[0].date) === '[object Date]') {
		xDataType = 'date';
	} else {
		xDataType = 'numeric';
	}

	// console.log(xDataType)

	// Define the x and y scales

	let x;

	if (xDataType == 'date') {
		x = d3.scaleTime()
			.domain(d3.extent(graphic_data, (d) => d.date))
			.range([0, chart_width]);
	} else {
		x = d3.scaleLinear()
			.domain(d3.extent(graphic_data, (d) => +d.date))
			.range([0, chart_width]);
	}
	//console.log(`x defined`);

	const y = d3
		.scaleLinear()
		.range([height, 0]);

	// Set y domain for "autoAll" or array, but not for "auto"
	if (config.essential.yDomain === "autoAll") {
		let minY = d3.min(graphic_data, (d) => Math.min(...categories.map((c) => d[c])));
		let maxY = d3.max(graphic_data, (d) => Math.max(...categories.map((c) => d[c])));
		y.domain([minY, maxY]);
		console.log("autoAll y domain:", minY, maxY);
	} else if (Array.isArray(config.essential.yDomain)) {
		y.domain(config.essential.yDomain);
	} // else "auto" will be handled in changeData

	// Helper to generate x-axis ticks based on config
	function getXAxisTicks({
	    data,
	    xDataType,
	    size,
	    config
	}) {
	    let ticks = [];
	    const method = config.optional.xAxisTickMethod || "interval";
	    if (xDataType === 'date') {
	        const start = data[0].date;
	        const end = data[data.length - 1].date;
	        if (method === "total") {
	            // Use d3.ticks for total number of ticks
	            const count = config.optional.xAxisTickCount[size] || 5;
	            ticks = d3.scaleTime().domain([start, end]).ticks(count);
	        } else if (method === "interval") {
	            // Use d3.time* for interval ticks
	            const interval = config.optional.xAxisTickInterval || { unit: "year", step: { sm: 1, md: 1, lg: 1 } };
	            const step = typeof interval.step === 'object' ? interval.step[size] : interval.step;
	            let d3Interval;
	            switch (interval.unit) {
	                case "year":
	                    d3Interval = d3.timeYear.every(step);
	                    break;
	                case "month":
	                    d3Interval = d3.timeMonth.every(step);
	                    break;
	                case "quarter":
	                    d3Interval = d3.timeMonth.every(step * 3);
	                    break;
	                case "day":
	                    d3Interval = d3.timeDay.every(step);
	                    break;
	                default:
	                    d3Interval = d3.timeYear.every(1);
	            }
	            ticks = d3Interval.range(start, d3.timeDay.offset(end, 1));
	        }
	        // Only add first/last if not present by value
	        if (config.optional.addFirstDate && !ticks.some(t => +t === +start)) {
	            ticks.unshift(start);
	        }
	        if (config.optional.addFinalDate && !ticks.some(t => +t === +end)) {
	            ticks.push(end);
	        }
	    } else {
	        // Numeric axis
	        if (method === "total") {
	            const count = config.optional.xAxisTickCount[size] || 5;
	            const extent = d3.extent(data, d => d.date);
	            ticks = d3.ticks(extent[0], extent[1], count);
	        } else if (method === "interval") {
	            const interval = config.optional.xAxisTickInterval || { unit: "number", step: { sm: 1, md: 1, lg: 1 } };
	            const step = typeof interval.step === 'object' ? interval.step[size] : interval.step;
	            const extent = d3.extent(data, d => d.date);
	            let current = extent[0];
	            while (current <= extent[1]) {
	                ticks.push(current);
	                current += step;
	            }
	        }
	        if (config.optional.addFirstDate && !ticks.some(t => t === data[0].date)) {
	            ticks.unshift(data[0].date);
	        }
	        if (config.optional.addFinalDate && !ticks.some(t => t === data[data.length - 1].date)) {
	            ticks.push(data[data.length - 1].date);
	        }
	    }
	    // Remove duplicates and sort
	    ticks = Array.from(new Set(ticks.map(t => +t))).sort((a, b) => a - b).map(t => xDataType === 'date' ? new Date(t) : t);
	    return ticks;
	}

	// In drawGraphic, replace the x-axis tickValues logic:
	svg
		.append('g')
		.attr('class', 'x axis')
		.attr('transform', `translate(0, ${height})`)
		.call(
			d3
				.axisBottom(x)
				.tickValues(getXAxisTicks({
					data: graphic_data,
					xDataType,
					size,
					config
				}))
				.tickFormat((d) => xDataType == 'date' ? d3.timeFormat(config.essential.xAxisTickFormat[size])(d)
					: d3.format(config.essential.xAxisNumberFormat)(d))
		);

	// Add the y-axis
	svg
		.append('g')
		.attr('class', 'y axis numeric')
		.call(d3.axisLeft(y).ticks(config.optional.yAxisTicks[size])
			.tickFormat(d3.format(config.essential.yAxisNumberFormat)));



	// This does the y-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: 5 - margin.left,
		yPosition: -15,
		text: config.essential.yAxisLabel,
		textAnchor: "start",
		wrapWidth: chart_width
	});

	// This does the x-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: chart_width,
		yPosition: height + margin.bottom - 25,
		text: config.essential.xAxisLabel,
		textAnchor: "end",
		wrapWidth: chart_width
	});

	//create link to source
	d3.select('#source').text('Source: ' + config.essential.sourceText);
	// console.log(`Link to source created`);

	//if there is a default option, set it
	if (config.essential.defaultOption) {
		$('#optionsSelect').val(config.essential.defaultOption).trigger('chosen:updated');
		changeData(config.essential.defaultOption);
	} else {
		// If no default option, clear the chart
		clearChart();
		$('#optionsSelect').val('').trigger('chosen:updated');
		d3.selectAll('.y.axis .tick').attr('opacity', 0); // Hide y-axis ticks
	}

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
	// console.log(`PymChild height sent`);
}


// Load the data
d3.csv(config.essential.graphic_data_url).then((rawData) => {
	graphic_data = rawData.map((d) => {
		if (d3.timeParse(config.essential.dateFormat)(d.date) !== null) {
			return {
				date: d3.timeParse(config.essential.dateFormat)(d.date),
				option: d.option,
				...Object.entries(d)
					.filter(([key]) => key !== 'date' && key !== 'option') // Exclude 'date' and 'option' keys from the data
					.map(([key, value]) => [key, value == "" ? null : +value]) // Checking for missing values so that they can be separated from zeroes
					.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
			}
		} else {
			return {
				date: (+d.date),
				option: d.option,
				...Object.entries(d)
					.filter(([key]) => key !== 'date' && key !== 'option')
					.map(([key, value]) => [key, value == "" ? null : +value]) // Checking for missing values so that they can be separated from zeroes
					.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
			}
		}
	});

	console.log(graphic_data);

	// Use pym to create an iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
	// console.log(`PymChild created with renderCallback to drawGraphic`);
});
