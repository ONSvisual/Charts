let pymChild = null;
let graphic = d3.select('#graphic');
let legend = d3.select('#legend');

//Remove previous SVGs
d3.select('#graphic').select('img').remove();

function drawGraphic(seriesName, graphic_data, chartIndex, numberOfSeries, fullData) {

	//population accessible summary
	d3.select('#accessibleSummary').html(config.essential.accessibleSummary);

	//Was trying to be a little fancy but will need to workshop this.
	// let size = window.innerWidth > config.optional.mobileBreakpoint ? "lg" : "sm";

	function calculateChartWidth(size) {
		const chartEvery = config.optional.chart_every[size];
		const aspectRatio = config.optional.aspectRatio[size];
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

	// size thresholds as defined in the config.js file

	let threshold_md = config.optional.mediumBreakpoint;
	let threshold_sm = config.optional.mobileBreakpoint;

	//set variables for chart dimensions dependent on width of #graphic
	let size;
	if (parseInt(graphic.style('width')) < threshold_sm) {
		size = 'sm';
	} else if (parseInt(graphic.style('width')) < threshold_md) {
		size = 'md';
	} else {
		size = 'lg';
	}

	const chartsPerRow = config.optional.chart_every[size];
	const chartPosition = chartIndex % chartsPerRow;

	// Set dimensions
	let margin = { ...config.optional.margin[size] };

	// If the chart is not in the first position in the row, reduce the left margin
	if (config.optional.dropYAxis) {
		if (chartPosition !== 0) {
			margin.left = 10;
		}
	}



	let chart_width = calculateChartWidth(size);

	//console.log(`The value of chart_width is ${chart_width}.`);

	//height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion

	let height =
		config.optional.seriesHeight[size] * graphic_data.length +
		10 * (graphic_data.length - 1) +
		12;

	// Define scales
	const x = d3.scaleLinear().range([0, chart_width]);

	// This is a different version
	// const y = d3.scaleBand().rangeRound([0, height]).padding(0.1);

	const y = d3
		.scaleBand()
		.paddingOuter(0.2)
		.paddingInner(((graphic_data.length - 1) * 10) / (graphic_data.length * 30))
		.range([0, height])
		.round(true);

	// Define axes
	let xAxis = d3
		.axisBottom(x)
		.tickSize(-height)
		.tickFormat(d3.format(config.essential.xAxisTickFormat))
		.ticks(config.optional.xAxisTicks[size]);

	let yAxis = d3.axisLeft(y)
		.tickSize(0)
		.tickPadding(10)
		.tickFormat((d) => config.optional.dropYAxis !== true ? (d) :
			chartPosition == 0 ? (d) : "");

	// Define stack layout
	let stack = d3
		.stack()
		.offset(d3[config.essential.stackOffset])
		.order(d3[config.essential.stackOrder])
		.keys(graphic_data.columns.slice(1, -1));

	// Process data ! This needs review

	const series = stack(graphic_data);

	// console.table(series);

	if (config.essential.xDomain === 'auto') {
		x.domain([Math.min(0, d3.min(stack(fullData), (d) => d3.min(d, (d) => d[1]))), d3.max(stack(fullData), (d) => d3.max(d, (d) => d[1]))]); //removed.nice()
	} else {
		x.domain(config.essential.xDomain);
	}
	
	y.domain(graphic_data.map((d) => d.name));

	// Set up the legend
	let legenditem = legend
		.selectAll('div.legend--item')
		.data(
			d3.zip(graphic_data.columns.slice(1), config.essential.colour_palette)
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

	//End of legend code

	// console.log('Chart width:', chart_width);
	// console.log('Height:', height);
	// console.log('X domain:', x.domain());
	// console.log('Y domain:', y.domain());

	// Create SVG
	let svg = d3
		.select('#graphic')
		.append('svg')
		.attr('width', chart_width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.attr('class', 'chart')
		.style('background-color', '#fff')
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	// Add axis labels  if you want them
	// svg
	//   .append("text")
	//   .attr("class", "axis--label")
	//   .attr(
	//     "transform",
	//     "translate(" + -margin.left / 2 + "," + height / 2 + ") rotate(-90)"
	//   )
	//   .text(seriesName);

	// Add axes

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

	// console.log(`The value of margin.left - (your value) is ${margin.left - 30}.`);

	// if (chartIndex % chartsPerRow === 0) {
	svg
		.append('g')
		.attr('class', 'y axis')
		.call(yAxis)
		.selectAll('.tick text')
		.call(wrap, margin.left - 10, graphic_data);
	// } else {
	// 	svg.append('g').attr('class', 'y axis').call(yAxis.tickValues([]));
	// }

	// Add a bold text label to the top left corner of the chart SVG
	svg
		.append('text')
		.attr('class', 'title')
		.attr('x', 0)
		.attr('y', -margin.top / 2)
		.text(seriesName);

	// Draw chart
	svg
		.append('g')
		.selectAll('g')
		.data(series)
		.enter()
		.append('g')
		.style('fill', (_, i) => config.essential.colour_palette[i])
		.selectAll('rect')
		.data((d) => d)
		.join('rect')
		.attr('x', (d) => x(d[0]))
		.attr('y', (d, i) => y(graphic_data[i].name))
		.attr('width', (d) => x(d[1]) - x(d[0]))
		.attr('height', y.bandwidth());

	// This does the x-axis label
	if (chartIndex % chartsPerRow === chartsPerRow - 1 || chartIndex === numberOfSeries - 1) {
		svg
			.append('g')
			.attr('transform', `translate(0, ${height})`)
			.append('text')
			.attr('x', chart_width)
			.attr('y', 35)
			.attr('class', 'axis--label')
			.text(config.essential.xAxisLabel)
			.attr('text-anchor', 'end');
	}

	//create link to source
	d3.select('#source').text('Source: ' + config.essential.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
}

// You have 2 wrap text options. The first does add any text styling to data with gaps. 


// function wrap(text, width) {
//   text.each(function () {
//     let text = d3.select(this),
//       words = text.text().split(/\s+/).reverse(),
//       word,
//       line = [],
//       lineNumber = 0,
//       lineHeight = 1.1, // ems
//       // y = text.attr("y"),
//       x = text.attr("x"),
//       dy = parseFloat(text.attr("dy")),
//       tspan = text.text(null).append("tspan").attr("x", x);
//     while ((word = words.pop())) {
//       line.push(word);
//       tspan.text(line.join(" "));
//       if (tspan.node().getComputedTextLength() > width) {
//         line.pop();
//         tspan.text(line.join(" "));
//         line = [word];
//         tspan = text
//           .append("tspan")
//           .attr("x", x)
//           .attr("dy", lineHeight + "em")
//           .text(word);
//       }
//     }
//     let breaks = text.selectAll("tspan").size();
//     text.attr("y", function () {
//       return -6 * (breaks - 1);
//     });
//   });
// }


function wrap(text, width, graphic_data) {
	text.each(function (d, i) {
		let text = d3.select(this),
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
		let breaks = text.selectAll('tspan').size();
		text.attr('y', function () {
			return -6 * (breaks - 1);
		});

		// Check if the corresponding data row has no data, and if so, make the y-axis label bold
		const rowData = graphic_data[i];
		const hasNoData = Object.values(rowData)
			.slice(1, -1)
			.every((value) => value === '');
		if (hasNoData) {
			text.style('font-weight', 'bold');
		}
	});
}

// Load the data
d3.csv(config.essential.graphic_data_url)
	.then((data) => {
		// console.log('Original data:', data);

		// clear out existing graphics
		graphic.selectAll('*').remove();
		legend.selectAll('*').remove();

		const fullData = data;
		// Group the data by the 'series' column
		const groupedData = d3.groups(fullData, (d) => d.series);
		// console.log('Grouped data:', groupedData[0][1]);

		//Generate a list of categories based on the order in the first chart that we can use to order the subsequent charts
		let namesArray = [...groupedData][0][1].map(d => d.name);

		// // Remove previous SVGs
		// graphic.selectAll('svg').remove();

		groupedData.forEach((group, i) => {
			const seriesName = group[0];
			const graphic_data = group[1];

			//Sort the data so that the bars in each chart are in the same order
			graphic_data.sort((a, b) => namesArray.indexOf(a.name) - namesArray.indexOf(b.name))

			graphic_data.columns = data.columns;

			pymChild = new pym.Child({ renderCallback: drawGraphic(seriesName, graphic_data, i, groupedData.length, fullData) });
		});
	})
	.catch((error) => console.error(error));
