import { initialise, wrap, addSvg, addAxisLabel, addDirectionArrow, addElbowArrow } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, groups, xDomain, divs, svgs, charts;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	let margin = config.optional.margin[size];
	let chart_width =
		parseInt(graphic.style('width')) - margin.left - margin.right;

	groups = d3.groups(graphic_data, (d) => d.group);

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

	const series = [...new Set(graphic_data.map(d => d.series))]
	const colour = d3
		.scaleOrdinal()
		.range(config.essential.colour_palette)
		.domain(series);

	// create the y scale in groups
	groups.map(function (d) {
		//height
		d[2] = config.optional.seriesHeight[size] * d[1].length;

		// y scale
		d[3] = d3
			.scalePoint()
			.padding(0.5)
			.range([0, d[2]])
			.domain(d[1].map((d) => d.name));
		//y axis generator
		d[4] = d3.axisLeft(d[3]).tickSize(0).tickPadding(10);
	});

	//set up xAxis generator
	let xAxis = d3.axisBottom(x)
		.ticks(config.optional.xAxisTicks[size])
		.tickFormat(d3.format(config.essential.xAxisTickFormat));

	divs = graphic.selectAll('div.categoryLabels').data(groups).join('div');

	if (groups.length > 1) { divs.append('p').attr('class', 'groupLabels').html((d) => d[0]) }

	charts = addSvg({
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
			.call(wrap, margin.left - 10);

		d3.select(this)
			.append('g')
			.attr('transform', (d) => 'translate(0,' + d[2] + ')')
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

	const rectHeight = 16

	charts
		.selectAll("rect")
		.data((d) => d[1])
		.join("rect")
		.attr("x", d => x(Number(d.min)))
		.attr("y", (d, i) => groups.filter((e) => e[0] == d.group)[0][3](d.name) - rectHeight / 2)
		.attr("width", d => Math.abs(x(Number(d.max)) - x(Number(d.min))))
		.attr("height", rectHeight)
		.attr("fill", d => colour(d.series))
		.attr("opacity", 0.65);

	charts
		.selectAll('rect.value')
		.data((d) => d[1])
		.join('rect')
		.attr('x', (d) => x(d.value) - 5)
		.attr('y', (d) => groups.filter((f) => f[0] == d.group)[0][3](d.name) - 5)
		.attr('width', 10)
		.attr('height', 10)
		.attr('transform', (d) => `rotate(45 ${x(d.value) + 0} ${groups.filter((f) => f[0] == d.group)[0][3](d.name) - 0})`)
		.attr("fill", "white")
		.attr("stroke-width", "2px")
		.attr('stroke', d => colour(d.series))
		.attr('rx',1)
		.attr('ry',1);


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
	let legend = d3
		.select('#legend')

	let legenditem = legend
		.selectAll('div.legend--item')
		.data(
			d3.zip(
				series,
				config.essential.colour_palette
			)
		)
		.enter()
		.append('div')
		.attr('class', 'legend--item');

	legenditem
		.append('div')
		.attr('class', (d, i) => config.essential.useDiamonds && i == 0 ? 'legend--icon--diamond' : 'legend--icon--circle')
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

	if (config.essential.CI_legend) {


		const ciSvg = legend
			.append('div')
			.attr('class', 'legend--item')
			.append('svg')
			.attr('width', 300)
			.attr('height', 60);

		ciSvg.append('rect')
			.attr('x', 0)
			.attr('y', 1)
			.attr('width', 50)
			.attr('height', 16)
			.attr('fill', "#959495")
			.attr('fill-opacity', 0.65);

		ciSvg
			.append("rect")
			.attr('x', 25)
			.attr('y', 2)
			.attr('width', 10)
			.attr('height', 10)
			.attr('transform', `rotate(45 ${25} ${2})`)
			.attr("fill", "white")
			.attr("stroke-width", "2px")
			.attr('stroke', "#959495")
			.attr('rx',1)
			.attr('ry',1);


		addElbowArrow(
			ciSvg,                // svgName
			25,                   // startX
			25,                   // startY
			68,                   // endX
			47,                    // endY
			"vertical-first",     // bendDirection
			"start",                // arrowAnchor
			config.essential.CI_legend_text, // thisText
			150,                  // wrapWidth
			10,                   // textAdjustY
			"top",               // wrapVerticalAlign
			"#414042",            // arrowColour
			"end"              // textAlignment
		)

		addDirectionArrow(
			//name of your svg, normally just SVG
			ciSvg,
			//direction of arrow: left, right, up or down
			'left',
			//anchor end or start (end points the arrow towards your x value, start points away)
			'end',
			//x value
			50,
			//y value
			3,
			//alignment - left or right for vertical arrows, above or below for horizontal arrows
			'right',
			//annotation text
			config.essential.CI_legend_interval_text,
			//wrap width
			150,
			//text adjust y
			0,
			//Text vertical align: top, middle or bottom (default is middle)
			'bottom'
		)
	}


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
