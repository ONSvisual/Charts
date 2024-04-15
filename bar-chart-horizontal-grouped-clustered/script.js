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

	namesUnique = [...new Set(graphic_data.map((d) => d.name))];
	categoriesUnique = [...new Set(graphic_data.map((d) => d.category))];

	let margin = config.optional.margin[size];
	let chart_width =
		parseInt(graphic.style('width')) - margin.left - margin.right;
	//height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion
	let height =
		config.optional.seriesHeight[size] * graphic_data.length +
		14 * (namesUnique.length - 1) +
		(config.optional.seriesHeight[size] * categoriesUnique.length + 14) * 0.2;

	//grouping the data
	groups = d3.groups(graphic_data, (d) => d.group)

	// create the y scale in groups
	groups.map(function (d) {
		//height
		d[2] = config.optional.seriesHeight[size] * [...new Set(d[1].map((d) => d.name))].length //height determined based on number of unique names on y axis
		// y scale
		d[3] = d3.scaleBand()
			.paddingOuter(0.1)
			.paddingInner(([...new Set(d[1].map((d) => d.name))].length - 1) * 14 / (d[1].length * 28))
			.range([0, d[2]])
			.domain(d[1].map(d => d.name));

		//y axis generator
		d[4] = d3.axisLeft(d[3])
			.tickSize(0)
			.tickPadding(10);
		//y2
		d[5] = d3.scaleBand()
			.range([0, d[3].bandwidth()])
			.padding(0)
			.domain(categoriesUnique)
	});

	//set up scales
	const x = d3.scaleLinear().range([0, chart_width]);

	if (config.essential.xDomain == 'auto') {
		if (d3.min(graphic_data.map(({ value }) => Number(value))) >= 0) {
			x.domain([
				0,
				d3.max(graphic_data.map(({ value }) => Number(value)))]); //modified so it converts string to number
		} else {
			x.domain(d3.extent(graphic_data.map(({ value }) => Number(value))))
		}
	} else {
		x.domain(config.essential.xDomain);
	}

	const colour = d3
		.scaleOrdinal()
		.range(config.essential.colour_palette)
		.domain(categoriesUnique);


	//set up xAxis generator
	let xAxis = d3
		.axisBottom(x)
		.tickSize(-height)
		.tickFormat(d3.format(config.essential.dataLabels.numberFormat))
		.ticks(config.optional.xAxisTicks[size]);

	divs = graphic.selectAll('div.categoryLabels')
		.data(groups)
		.join('div')

	divs.append('p').attr('class', 'groupLabels').html((d) => d[0])

	svgs = divs.append('svg')
		.attr('class', (d) => 'chart chart' + groups.indexOf(d))
		.attr('height', (d) => d[2] + margin.top + margin.bottom)
		.attr('width', chart_width + margin.left + margin.right)

	charts = svgs.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

	charts.each(function (d, i) {

		d3.select(this)
			.append('g')
			.attr('class', 'y axis')
			.call(d[4])
			.selectAll('text')
			.call(wrap, margin.left - 10)

		d3.select(this)
			.append('g')
			.attr('transform', (d) => 'translate(0,' + d[2] + ')')
			.attr('class', 'x axis')
			.each(function () {
				d3.select(this).call(xAxis.tickSize(-d[2]))
					.selectAll('line').each(function (e) {
						if (e == 0) {
							d3.select(this)
								.attr('class', 'zero-line')
						};
					})
			})

		// charts.selectAll('rect')
		d3.select(this).selectAll('rect')
			.data((d) => d[1])
			.join('rect')
			.attr('x', d => d.value < 0 ? x(d.value) : x(0))
			.attr('y', (d) => groups[i][3](d.name) + groups[i][5](d.category))
			.attr('width', (d) => Math.abs(x(d.value) - x(0)))
			.attr('height', (d) => groups[i][5].bandwidth())
			.attr("fill", (d) => colour(d.category));

		let labelPositionFactor = 7;

		//adding data labels to the bars - only if two categories or fewer
		if (config.essential.dataLabels.show == true && categoriesUnique.length <= 2) {
			d3.select(this)
				.selectAll('text.dataLabels')
				.data((d) => d[1])
				.join('text')
				.attr('class', 'dataLabels')
				.attr('x', (d) => d.value > 0 ? x(d.value) :
					Math.abs(x(d.value) - x(0)) < chart_width / labelPositionFactor ? x(0) : x(d.value))
				.attr('dx', (d) => d.value > 0 ?
					(Math.abs(x(d.value) - x(0)) < chart_width / labelPositionFactor ? 3 : -3) :
					3)
				.attr('y', (d) => groups[i][3](d.name) + groups[i][5](d.category) + groups[i][5].bandwidth()/2)
				.attr('dominant-baseline', 'middle')
				.attr('text-anchor', (d) => d.value > 0 ?
					(Math.abs(x(d.value) - x(0)) < chart_width / labelPositionFactor ? 'start' : 'end') :
					"start"
				)
				.attr('fill', (d) =>
					(Math.abs(x(d.value) - x(0)) < chart_width / labelPositionFactor ? '#414042' : '#ffffff')
				)
				.text((d) =>
					d3.format(config.essential.dataLabels.numberFormat)(d.value)
				);
		} //end if for datalabels


		// This does the x-axis label - here only added to the last group
		if (i == (groups.length - 1)) {
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
				.call(wrap, (chart_width + margin.left));
		}

	})


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
