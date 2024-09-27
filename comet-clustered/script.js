import { initialise, wrap, addSvg, addAxisLabel } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let legendTop = d3.select('#legendTop');
let pymChild = null;
let graphic_data, size, svg, xDomain;

// var minSym = d3.symbol() 
// .type(d3.symbolSquare).size(57)

function drawGraphic() {
	// clear out existing graphics
	legendTop.selectAll('*').remove();

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	let margin = config.optional.margin[size];
	let chart_width =
		parseInt(graphic.style('width')) - margin.left - margin.right;

	let groups = d3.groups(graphic_data, (d) => d.group);

	if (config.essential.xDomain == 'auto') {
		let min = 1000000;
		let max = 0;
		for (i = 2; i < graphic_data.columns.length; i++) {
			min = d3.min([
				min,
				d3.min(graphic_data, (d) => +d[graphic_data.columns[i]])
			]);
			max = d3.max([
				max,
				d3.max(graphic_data, (d) => +d[graphic_data.columns[i]])
			]);
		}
		xDomain = [min, max];
	} else {
		xDomain = config.essential.xDomain;
	}

	//set up scales
	const x = d3.scaleLinear().range([0, chart_width]).domain(xDomain);

	const colour = d3
		.scaleOrdinal()
		.range(config.essential.colour_palette)
		.domain(Object.keys(config.essential.legendLabels));


	// create the y scale in groups
	groups.map(function (d) {
		//height
		d[2] = config.optional.seriesHeight[size] * d[1].length;

		// y scale
		d[3] = d3
			.scaleBand()
			.padding(0.5)
			.range([0, d[2]])
			.domain(d[1].map((d) => d.name));
		//y axis generator
		d[4] = d3.axisLeft(d[3]).tickSize(0).tickPadding(9);
		d[5] = d3.scaleBand()
			.range([0, d[3].bandwidth()])
			.domain([...new Set(graphic_data.map(d => d.series))])
	});

	//set up xAxis generator
	let xAxis = d3.axisBottom(x).ticks(config.optional.xAxisTicks[size]);

	let divs = graphic.selectAll('div.categoryLabels').data(groups).join('div');

	divs
		.append('p')
		.attr('class', 'groupLabels')
		.html((d) => d[0]);

	//remove blank headings
	divs.selectAll('p').filter((d) => (d[0] == "")).remove()

	let charts = addSvg({
		svgParent: divs,
		chart_width: chart_width,
		height: (d) => d[2] + margin.top + margin.bottom,
		margin: margin
	})

	charts.each(function (d) {
		d3.select(this)
			.append('g')
			.attr('class', 'y axis')
			.call(d[4])
			.selectAll('text')
			.call(wrap, margin.left - 12);


		d3.select(this)
			.append('g')
			.attr('transform', (d) => 'translate(0,' + (d[2] - 20) + ')')
			.attr('class', 'x axis')
			.each(function () {
				d3.select(this)
					.call(xAxis.tickSize(-d[2]))
					.selectAll('line')
					.each(function (e) {
						if (e == 0) {
							d3.select(this).attr('class', 'zero-line');
						}
					});
			});
	});

	// charts
	// 	.selectAll("linearGradient")
	// 	.attr("id", "line-gradient")
	// 	.attr("gradientUnits", "userSpaceOnUse")
	// 	.attr("x1", 0)
	// 	.attr("y1", y(0))
	// 	.attr("x2", 0)
	// 	.attr("y2", y(max))
	// 	.selectAll("stop")
	// 	  .data([
	// 		{offset: "0%", color: "blue"},
	// 		{offset: "100%", color: "red"}
	// 	  ])
	// 	.enter().append("stop")
	// 	  .attr("offset", function(d) { return d.offset; })
	// 	  .attr("stop-color", function(d) { return d.color; });

	charts
		.selectAll('line.between')
		.data((d) => d[1])
		.join('line')
		.attr('class', 'between')
		.attr('x1', (d) => x(d.min))
		.attr('x2', (d) => x(d.max))
		.attr('y1', (d, i) => groups.filter((e) => e[0] == d.group)[0][3](d.name) + groups.filter(e => e[0] == d.group)[0][5](d.series))
		.attr('y2', (d, i) => groups.filter((e) => e[0] == d.group)[0][3](d.name) + groups.filter(e => e[0] == d.group)[0][5](d.series))
		// .attr('stroke', (d) =>
		// 	+d.min > +d.max
		// 		? config.essential.colour_palette[1]
		// 		: +d.min < +d.max
		// 		? config.essential.colour_palette[0]
		// 		: config.essential.colour_palette[2]
		// ) //old way of colouring by increase/decrease
		.attr('stroke', (d) => colour(d.series))
		.attr('stroke-width', '2px');

	//   charts.selectAll('circle.min')
	//     .data(d => d[1])
	//     .join('circle')
	//     .attr('class', 'min')
	//     .attr('cx', d => x(d.min))
	// 	.attr('cy', (d) => groups.filter((f) => f[0] == d.group)[0][3](d.name) + groups.filter(e => e[0] == d.group)[0][5](d.series))
	// 	.attr('r', config.essential.dotsize - 2.5)
	//     .attr('fill', (d) => colour(d.series))

	// charts
	// 	.selectAll('sym.min')
	// 	.data((d) => d[1])
	// 	.join("path")
	// 	.attr('class', 'min')
	// 	.attr("d", minSym) 
	// 	.attr('fill', (d) => colour(d.series))
	// 	.attr("transform", d => "translate(" + x(d.min) + "," + (groups.filter((f) => f[0] == d.group)[0][3](d.name) + groups.filter(e => e[0] == d.group)[0][5](d.series)) + ") rotate(45)"); 

	charts
		.selectAll('line.min')
		.data((d) => d[1])
		.join("line")
		.attr("class", "min")
		.attr("x1", (d) => x(d.min))
		.attr("x2", (d) => x(d.min))
		.attr("y1", (d) => (groups.filter((f) => f[0] == d.group)[0][3](d.name) + groups.filter(e => e[0] == d.group)[0][5](d.series)) + (groups.filter(e => e[0] == d.group)[0][5].bandwidth() / 2))
		.attr("y2", (d) => (groups.filter((f) => f[0] == d.group)[0][3](d.name) + groups.filter(e => e[0] == d.group)[0][5](d.series)) - (groups.filter(e => e[0] == d.group)[0][5].bandwidth() / 2))
		.attr('stroke', (d) => colour(d.series))
		.attr('stroke-width', '2.5px');

	charts
		.selectAll('circle.max')
		.data((d) => d[1])
		.join('circle')
		.attr('class', 'max')
		.attr('cx', (d) => x(d.max))
		.attr('cy', (d) => groups.filter((f) => f[0] == d.group)[0][3](d.name) + groups.filter(e => e[0] == d.group)[0][5](d.series))
		.attr('r', config.essential.dotsize)
		// .attr('fill', (d) =>
		// 	+d.min > +d.max
		// 		? config.essential.colour_palette[1]
		// 		: +d.min < +d.max
		// 		? config.essential.colour_palette[0]
		// 		: config.essential.colour_palette[2]
		// )
		.attr('fill', (d) => colour(d.series));

	if (config.essential.showDataLabels == true) {
		charts
			.selectAll('text.min')
			.data((d) => d[1])
			.join('text')
			.attr('class', 'dataLabels')
			.attr('x', (d) => x(d.min) - 2)
			.attr('y', (d) => (groups.filter((f) => f[0] == d.group)[0][3](d.name) + groups.filter(e => e[0] == d.group)[0][5](d.series)) - 1)
			.text((d) => config.essential.numberSuffix + d3.format(config.essential.numberFormat)(d.min))
			// .attr('fill', (d) =>
			// 	+d.min > +d.max
			// 		? config.essential.colour_palette[1]
			// 		: +d.min < +d.max
			// 		? config.essential.colour_palette[0]
			// 		: 'none'
			// )
			// .attr('fill', (d) => colour(d.series))
			.attr("fill", config.essential.colour_min_text)
			.attr('dy', 6)
			.attr('dx', (d) => (+d.min < +d.max ? -5 : 5))
			.attr('text-anchor', (d) => (+d.min < +d.max ? 'end' : 'start'))
		// .style('font-size', "12.5px");

		charts
			.selectAll('text.max')
			.data((d) => d[1])
			.join('text')
			.attr('class', 'dataLabels')
			.attr('x', (d) => x(d.max))
			.attr('y', (d) => (groups.filter((f) => f[0] == d.group)[0][3](d.name) + groups.filter(e => e[0] == d.group)[0][5](d.series)) - 1)
			.text((d) => config.essential.numberSuffix + d3.format(config.essential.numberFormat)(d.max))
			// .attr('fill', (d) =>
			// 	+d.min > +d.max
			// 		? config.essential.colour_palette[1]
			// 		: +d.min < +d.max
			// 		? config.essential.colour_palette[0]
			// 		: config.essential.colour_palette[2]
			// )
			.attr('fill', (d) => colour(d.series))
			.attr('dy', 6)
			.attr('dx', (d) =>
				+d.min > +d.max
					? -(config.essential.dotsize + 5)
					: config.essential.dotsize + 5
			)
			.attr('text-anchor', (d) => (+d.min > +d.max ? 'end' : 'start'))
			.style("font-weight", 700);
	}

	// This does the x-axis label
	charts.each(function (d, i) {
		if (i == groups.length - 1) {
			addAxisLabel({
				svgContainer: d3.select(this),
				xPosition: chart_width,
				yPosition: d[2] + 35,
				text: config.essential.xAxisLabel,
				textAnchor: "end",
				wrapWidth: chart_width
			});
		}
	});

	// Set up the legend
	var legenditemTop = d3.select('#legendTop')
		.selectAll('div.legend--item')
		.data(d3.zip(Object.values(config.essential.seriesLabels), config.essential.colour_palette))
		.enter()
		.append('div')
		.attr('class', 'legend--item')

	legenditemTop.append('div').attr('class', 'legend--icon--circle')
		.style('background-color', function (d) {
			return d[1]
		})

	legenditemTop.append('div')
		.append('p').attr('class', 'legend--text').html(function (d) {
			return d[0]
		})

	// // Set up the legend
	let legenditem = d3
		.select('#legend')
		.selectAll('div.legend--item')
		.data(config.essential.legendItems)
		.enter()
		.append('div')
		.attr('class', (d) => 'legend--item ' + [d]);

	drawLegend();

	function drawLegend() {
		let var_group = d3
			.select('#legend')
			.selectAll('div.legend--item.Inc')
			.append('svg')
			.attr('height', config.optional.legendHeight[size])
			.attr('width', config.essential.legendItemWidth);
		let var_group2 = d3
			.select('#legend')
			.selectAll('div.legend--item.Dec')
			.append('svg')
			.attr('height', config.optional.legendHeight[size])
			.attr('width', config.essential.legendItemWidth);
		// var_group3 = d3
		// 	.select('#legend')
		// 	.selectAll('div.legend--item.No')
		// 	.append('svg')
		// 	.attr('height', config.optional.legendHeight[size])
		// 	.attr('width', config.essential.legendItemWidth);

		//Increase legend item
		var_group
			.append('text')
			.attr('y', 30)
			// .style("font-size", "12.5px")
			.attr('x', 0)
			.attr('text-anchor', 'start')
			.attr('class', 'mintext legendLabel')
			.attr('fill', config.essential.legend_colour)
			.text(config.essential.legendLabels.min);

		//this measures how wide the "min" value is so that we can place the legend items responsively
		let minTextWidth = d3.select('text.mintext').node().getBBox().width + 5;

		var_group
			.append('line')
			.attr('stroke', config.essential.legend_colour)
			.attr('stroke-width', '3px')
			.attr('y1', 26)
			.attr('y2', 26)
			.attr('x1', minTextWidth)
			.attr('x2', minTextWidth + config.essential.legendLineLength);

		var_group
			.append('circle')
			.attr('r', config.essential.dotsize)
			.attr('fill', config.essential.legend_colour)
			.attr('cx', minTextWidth + config.essential.legendLineLength)
			.attr('cy', 26);

		// var_group
		// 	.append('circle')
		// 	.attr('r', config.essential.dotsize - 2.5)
		// 	.attr('fill', config.essential.legend_colour)
		// 	.attr('cx', minTextWidth + 1.25)
		// 	.attr('cy', 26);

		// var_group
		// .append("path")
		// .attr("d", minSym) 
		// .attr("fill", config.essential.legend_colour) 
		// .attr("transform", "translate(" + (minTextWidth) + "," + 26 + ") rotate(45)");

		var_group
			.append("line")
			.attr("x1", minTextWidth)
			.attr("x2", minTextWidth)
			.attr("y1", 26 + 7)
			.attr("y2", 26 - 7)
			.attr('stroke', config.essential.legend_colour)
			.attr('stroke-width', '2.5px');

		var_group
			.append('text')
			.attr('y', 30)
			.attr(
				'x',
				minTextWidth +
				config.essential.legendLineLength +
				config.essential.dotsize +
				5
			)
			.attr('text-anchor', 'start')
			.attr('class', 'maxtext legendLabel')
			.attr('fill', config.essential.legend_colour)
			.text(config.essential.legendLabels.max)
			.style("font-weight", 700);

		//this measures how wide the "max" value is so that we can place the legend items responsively
		let maxTextWidth = d3.select('text.maxtext').node().getBBox().width + 5;

		var_group
			.append('text')
			.attr('y', 15)
			.attr(
				'x',
				(minTextWidth +
					config.essential.legendLineLength +
					config.essential.dotsize +
					maxTextWidth) /
				2
			)
			.attr('text-anchor', 'middle')
			.attr('class', 'legendLabel')
			.attr('fill', "#707070")
			.text('Increase');

		//Decrease legend item
		var_group2
			.append('line')
			.attr('stroke', config.essential.legend_colour)
			.attr('stroke-width', '3px')
			.attr('y1', 26)
			.attr('y2', 26)
			.attr('x1', maxTextWidth + config.essential.dotsize)
			.attr(
				'x2',
				maxTextWidth +
				config.essential.dotsize +
				config.essential.legendLineLength
			);





		var_group2
			.append('circle')
			.attr('r', config.essential.dotsize)
			.attr('fill', config.essential.legend_colour)
			.attr('cx', maxTextWidth + config.essential.dotsize)
			.attr('cy', 26);

		// var_group2
		// 	.append('circle')
		// 	.attr('r', config.essential.dotsize - 2.5)
		// 	.attr('fill', config.essential.legend_colour)
		// 	.attr('cx', maxTextWidth + config.essential.legendLineLength + 2.5)
		// 	.attr('cy', 26);

		// var_group2
		// 	.append("path")
		// 	.attr("d", minSym) 
		//     .attr("fill", config.essential.legend_colour) 
		//     .attr("transform", "translate(" + (maxTextWidth + config.essential.legendLineLength + 2.5) + "," + 26 + ") rotate(45)"); 

		var_group2
			.append("line")
			.attr("x1", maxTextWidth + config.essential.legendLineLength + config.essential.dotsize)
			.attr("x2", maxTextWidth + config.essential.legendLineLength + config.essential.dotsize)
			.attr("y1", 26 + 7)
			.attr("y2", 26 - 7)
			.attr('stroke', config.essential.legend_colour)
			.attr('stroke-width', '2.5px');

		var_group2
			.append('text')
			.attr('y', 30)
			.attr('x', 0)
			.attr('text-anchor', 'start')
			.attr('class', 'legendLabel')
			.attr('fill', config.essential.legend_colour)
			.text(config.essential.legendLabels.max)
			.style("font-weight", 700);

		var_group2
			.append('text')
			.attr('y', 30)
			.attr(
				'x',
				maxTextWidth +
				config.essential.legendLineLength +
				config.essential.dotsize +
				5
			)
			.attr('text-anchor', 'start')
			.attr('class', 'legendLabel')
			.attr('fill', config.essential.legend_colour)
			.text(config.essential.legendLabels.min)
		// .style("font-size", "12.5px");

		var_group2
			.append('text')
			.attr('y', 15)
			.attr(
				'x',
				(maxTextWidth +
					config.essential.legendLineLength +
					config.essential.dotsize +
					minTextWidth) /
				2
			)
			.attr('text-anchor', 'middle')
			.attr('class', 'legendLabel')
			// .attr('fill', config.essential.colour_palette[1])
			.text('Decrease')
			.attr('fill', "#707070");

		// 	//No change legend item
		// 	var_group3
		// 		.append('circle')
		// 		.attr('r', config.essential.dotsize)
		// 		.attr('fill', config.essential.colour_palette[2])
		// 		.attr('cx', 10)
		// 		.attr('cy', 26);

		// 	var_group3
		// 		.append('text')
		// 		.attr('y', 30)
		// 		.attr('x', config.essential.dotsize + 15)
		// 		.attr('text-anchor', 'start')
		// 		.attr('class', 'legendLabel')
		// 		.attr('fill', config.essential.colour_palette[2])
		// 		.text('No change');
	} //End drawLegend

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
