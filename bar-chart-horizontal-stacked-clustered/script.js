import { initialise, wrap, addSvg, addAxisLabel } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, svg;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	let margin = config.optional.margin[size];
	margin.centre = config.optional.margin.centre;
	let width = parseInt(graphic.style('width'));
	let chart_width = parseInt(graphic.style('width')) - margin.left - margin.right;
	//height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion
	let height =
		config.optional.seriesHeight[size] * (graphic_data.length / 2) +
		10 * (graphic_data.length / 2 - 1) +
		12;

	// groups = d3.groups(graphic_data, (d) => d.group)

	const stack = d3
		.stack()
		.keys(graphic_data.columns.slice(2)) //Just the columns with data values
		.offset(d3[config.essential.stackOffset])
		.order(d3[config.essential.stackOrder]);

	let categoriesUnique = [...new Set(graphic_data.map((d) => d.sex))];


	//y scale
	const y = d3
		.scaleBand()
		.paddingOuter(0.2)
		.paddingInner(0.2)
		.range([0, height])
		.round(true);

	//use the data to find unique entries in the name column
	y.domain([...new Set(graphic_data.map((d) => d.name))]);

	const y2 = d3
		.scaleBand()
		.range([0, y.bandwidth()])
		.padding(0.1)
		.domain(categoriesUnique);

	//y axis generator
	const yAxis = d3.axisLeft(y).tickSize(0).tickPadding(10);

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
		.attr('transform', 'translate(' + 0 + ',' + 0 + ')')
		.attr('class', 'y axis')
		.call(yAxis)
		.selectAll('text')
		.call(wrap, margin.left - 10)
		.attr('text-anchor', 'end');

	svg
		.append('g')
		.selectAll('g')
		.data(seriesAll)
		.join('g')
		.attr('fill', (d, i) => config.essential.colour_palette[i])
		.selectAll('rect')
		.data((d) => d)
		.join('rect')
		.attr('x', (d) => x(d[0]))
		.attr('y', (d) => y(d.data.name) + y2(d.data.sex))
		.attr('width', (d) => x(d[1]) - x(d[0]))
		.attr('height', y2.bandwidth());

	// This does the x-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: chart_width,
		yPosition: height + 35,
		text: config.essential.xAxisLabel,
		textAnchor: "end",
		wrapWidth: chart_width
	});


	// This does the Females label
	svg
		.append('g')
		.attr('transform', 'translate(0,0)')
		.append('text')
		.attr('x', 5)
		.attr(
			'y',
			// y.paddingOuter() * (1/(1-y.paddingInner()))*y.bandwidth() +
			// y2.paddingOuter() * (1/(1-y2.paddingInner()))*y2.bandwidth()
			y(seriesAll[0][0].data.name) + y2(seriesAll[0][0].data.sex)
		)
		.attr('dy', y2.bandwidth() / 2)
		.attr('dominant-baseline', 'middle')
		.attr('class', 'axis--label')
		.text('Females')
		.attr('text-anchor', 'start')
		.style('font-weight', 600)
		.style('font-size', '14px')
		.style('fill', '#fff');

	// This does the Males label
	svg
		.append('g')
		.attr('transform', 'translate(0,0)')
		.append('text')
		.attr('x', 5)
		.attr(
			'y',
			y(seriesAll[0][1].data.name) + y2(seriesAll[0][1].data.sex)
			// y.paddingOuter() * (1/(1-y.paddingInner()))*y.bandwidth() +
			// y2.paddingOuter() * (1/(1-y2.paddingInner()))*y2.bandwidth() +
			// 	y2.bandwidth() +
			// 	y2.paddingInner() * (1/(1-y2.paddingInner()))*y2.bandwidth() 
		)
		.attr('dy', y2.bandwidth() / 2)
		.attr('dominant-baseline', 'middle')
		.attr('class', 'axis--label')
		.text('Males')
		.attr('text-anchor', 'start')
		.style('font-weight', 600)
		.style('font-size', '14px')
		.style('fill', '#fff');

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


d3.csv(config.essential.graphic_data_url).then((data) => {
	//load chart data
	graphic_data = data;

	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
