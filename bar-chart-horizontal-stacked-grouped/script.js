let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;

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

	let margin = config.optional.margin[size];
	margin.centre = config.optional.margin.centre;
	fullwidth = parseInt(graphic.style('width'));
	chart_width = parseInt(graphic.style('width')) - margin.left - margin.right;
	//height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion
	let height =
		config.optional.seriesHeight[size] * graphic_data.length +
		10 * (graphic_data.length - 1) +
		12;

	groups = d3.groups(graphic_data, (d) => d.group);

	const stack = d3
		.stack()
		.keys(graphic_data.columns.slice(2)) //Just the columns with data values
		.offset(d3[config.essential.stackOffset])
		.order(d3[config.essential.stackOrder]);

	// create the y scale in groups
	groups.map(function (d) {
		//height
		d[2] = config.optional.seriesHeight[size] * d[1].length;
		// y scale
		d[3] = d3
			.scaleBand()
			.paddingOuter(0.2)
			.paddingInner(0.25)
			.range([0, d[2]])
			.domain(d[1].map((d) => d.name));
		//y axis generator
		d[4] = d3.axisLeft(d[3]).tickSize(0).tickPadding(10);
		//stack
		d[5] = stack(d[1]);
	});

	//set up x scale
	const x = d3
		.scaleLinear()
		.range([0, chart_width])
		.domain(config.essential.xDomain);

	const seriesAll = stack(graphic_data);

	if (config.essential.xDomain == 'auto') {
		x.domain(d3.extent(seriesAll.flat(2))); //flatten the arrays and then get the extent
	} else {
		x.domain(config.essential.xDomain);
	}

	let xAxis = d3
		.axisBottom(x)
		.tickSize(-height)
		.tickFormat(d3.format(config.essential.xAxisTickFormat))
		// .tickFormat(d => d  + "%")
		.ticks(config.optional.xAxisTicks[size]);

	divs = graphic.selectAll('div.categoryLabels').data(groups).join('div');

	divs
		.append('p')
		.attr('class', 'groupLabels')
		.html((d) => d[0]);

	//remove blank headings
	divs.selectAll('p').filter((d) => (d[0] == "")).remove()

	svgs = divs
		.append('svg')
		.attr('class', (d) => 'chart chart' + groups.indexOf(d))
		.attr('height', (d) => d[2] + margin.top + margin.bottom)
		.attr('width', chart_width + margin.left + margin.right);

	charts = svgs
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	charts.each(function (d, i) {
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

		for (let j = 0; j < groups.length; j++) {
			if (i == j) {
				d3.select(this)
					.append('g')
					.attr('class', 'bars')
					.selectAll('g')
					.data((d) => d[5])
					.join('g')
					.attr('fill', (d, k) => config.essential.colour_palette[k])
					.selectAll('rect')
					.data((d) => d)
					.join('rect')
					.attr('x', (d) => x(d[0]))
					.attr('y', (d) => groups[i][3](d.data.name))
					.attr('width', (d) => x(d[1]) - x(d[0]))
					.attr('height', groups[i][3].bandwidth());
			}
		}

		// This does the x-axis label - here only added to the last group
		if (i == groups.length - 1) {
			d3.select(this)
				.append('g')
				.attr('transform', 'translate(' + 0 + ',' + (d[2] + margin.top) + ')')
				.append('text')
				.attr('x', chart_width)
				.attr('y', 0)
				.attr('dy', 25)
				.attr('class', 'axis--label')
				.text(config.essential.xAxisLabel)
				.attr('text-anchor', 'end')
				.call(wrap, chart_width + margin.left);
		}
	});

	// Set up the legend
	let legenditem = d3
		.select('#legend')
		.selectAll('div.legend--item')
		.data(
			d3.zip(graphic_data.columns.slice(2), config.essential.colour_palette)
		)
		.enter()
		.append('div')
		.attr('class', 'legend--item');

	legenditem
		.append('div')
		.attr('class', 'legend--icon--circle')
		.style('background-color', (d) => d[1]);

	legenditem
		.append('div')
		.append('p')
		.attr('class', 'legend--text')
		.html((d) => d[0]);

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

	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
