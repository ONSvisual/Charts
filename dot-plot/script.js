import { initialise, wrap, addAxisLabel, addSvg } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, svg;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	let margin = config.optional.margin[size];
	let chart_width =
		parseInt(graphic.style('width')) - margin.left - margin.right;
	//height is set by unique options in column name * a fixed height
	let height = config.optional.seriesHeight[size] * graphic_data.length;

	// Get the column headers with numbers in
	const keys = Object.keys(graphic_data[0]).slice(1)

	//set up scales
	let x = d3.scaleLinear().range([0, chart_width]);

	let y = d3.scalePoint().padding(0.5).range([0, height]);

	const colour = d3.scaleOrdinal()
		.domain(keys)
		.range(config.essential.colour_palette);

	if (config.essential.xDomain == 'auto') {
		let max = d3.max(graphic_data, d => d3.max(keys, col => parseFloat(d[col])));
		let min = d3.min([0,d3.min(graphic_data,d => d3.min(keys, col => parseFloat(d[col])))])
		x.domain([min, max]);
	} else {
		x.domain(config.essential.xDomain);
	}

	//use the data to find unique entries in the name column
	y.domain(graphic_data.map((d) => d.name));

	const processedData = handleMetricOverlap(graphic_data, x, y, keys);

	//set up yAxis generator
	let yAxis = d3.axisLeft(y).tickSize(-chart_width).tickPadding(10);

	//set up xAxis generator
	let xAxis = d3
		.axisBottom(x)
		.tickSize(-height)
		.ticks(config.optional.xAxisTicks[size])
		.tickFormat(d3.format(config.essential.xAxisNumberFormat));

	// Set up the legend
	let legenditem = d3
		.select('#legend')
		.selectAll('div.legend--item')
		.data(
			d3.zip(config.essential.legendLabels, config.essential.colour_palette)
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

	//create svg for chart
	svg = addSvg({
		svgParent: graphic,
		chart_width: chart_width,
		height: height + margin.top + margin.bottom,
		margin: margin
	})

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
		.attr('stroke-dasharray', '2 2')
		.selectAll('text')
		.call(wrap, margin.left - 5);

	svg
		.selectAll('.dot')
		.data(processedData)
		.join('circle')
		.attr('class', 'dot')
		.attr('cx', d => x(d.value))
		.attr('cy', d => d.adjustedY)
		.attr('r', 4)
		.style('fill', d => colour(d.metric))
		.append('title')  // Add tooltip
		.text(d => `${d.name}\n${d.metric}: ${d.value}`);

	// AI generated function to handle overlaps
	function handleMetricOverlap(data, xScale, yScale, metrics, radius = 4) {
		const processedData = [];
		const overlapMap = new Map();
		
		data.forEach(d => {
		  const baseYPos = yScale(d.name) + yScale.bandwidth() / 2;  // Center of the band
		  
		  if (!overlapMap.has(d.name)) {
			overlapMap.set(d.name, {
			  points: [],
			  counter: 0
			});
		  }
		  
		  const yTracker = overlapMap.get(d.name);
		  
		  metrics.forEach(metric => {
			const value = parseFloat(d[metric]);
			if (!isNaN(value)) {
			  const xPos = xScale(value);
			  
			  // Check for overlaps with existing points
			  const overlap = yTracker.points.some(point => 
				Math.abs(point - xPos) < radius * 2.5  // Increased spacing
			  );
			  
			  let finalYPos = baseYPos;
			  
			  if (overlap) {
				yTracker.counter++;
				const offset = Math.ceil(yTracker.counter / 2) * (radius * 2);
				finalYPos = baseYPos + (yTracker.counter % 2 === 0 ? offset : -offset);
			  } else {
				// Only reset counter if this point is far from others
				const farFromAll = yTracker.points.every(point => 
				  Math.abs(point - xPos) > radius * 4
				);
				if (farFromAll) {
				  yTracker.counter = 0;
				}
			  }
			  
			  // Store point position for overlap checking
			  yTracker.points.push(xPos);
			  
			  processedData.push({
				name: d.name,
				metric,
				value,
				adjustedY: finalYPos,
				originalY: baseYPos
			  });
			}
		  });
		  
		  // Sort points for this name by x position
		  yTracker.points.sort((a, b) => a - b);
		});
		
		return processedData;
	  }

	addAxisLabel({
		svgContainer: svg,
		xPosition: chart_width,
		yPosition: height + 30,
		text: config.essential.xAxisLabel,
		textAnchor: "end",
		wrapWidth: chart_width
	});

	//create link to source
	d3.select('#source').text('Source: ' + config.essential.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
}

d3.csv(config.essential.graphic_data_url).then((data) => {
	//load chart data
	graphic_data = data;

	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
