import { initialise, wrap, addSvg, addAxisLabel, addSource } from "../lib/helpers.js";
import { EnhancedSelect } from "../lib/enhancedSelect.js";

const graphic = d3.select('#graphic');
const titles = d3.select('#titles');
const legend = d3.select('#legend');
let pymChild = null;
let graphic_data, comparison_data, dropdownData, size, allAges, tidydata, rolledUp, tidydataPercentage, comparisonPopTotal,
	comparison_data_new, maxPercentage, width, chart_width, height, xLeft, xRight, y, svg, lineLeft, lineRight, comparisons,
	widths, dataForLegend, titleDivs;

function drawGraphic() {
	// // clear out existing graphics
	titles.selectAll('*').remove();
	d3.select('#select').selectAll('*').remove();

	// build dropdown, first unique areas
	// https://stackoverflow.com/questions/38613654/javascript-find-unique-objects-in-array-based-on-multiple-properties
	dropdownData = graphic_data
		.map(function (d) {
			return { label: d.AREANM, id: d.AREACD };
		})
		.filter(function (a) {
			let key = a.label + '|' + a.id;
			if (!this[key]) {
				this[key] = true;
				return true;
			}
		}, Object.create(null))
		.sort((a, b) => d3.ascending(a.label, b.label)); //sorted alphabetically

	const select = new EnhancedSelect({
		containerId: 'select',
		options: dropdownData,
		label: 'Choose an area',
		mode: 'default', // or 'search'
		idKey: 'id',
		labelKey: 'label',
		onChange: (selectedValue) => {
			if (selectedValue !== null) {
				d3.select('#bars')
					.selectAll('rect')
					.data(
						tidydataPercentage.filter((d) => d.AREACD == selectedValue.id)
					)
					.join('rect')
					.attr('fill', (d) =>
						d.sex === 'female'
							? config.essential.colour_palette[0]
							: config.essential.colour_palette[1]
					)
					.attr('y', (d) => y(d.age))
					.attr('height', y.bandwidth())
					.transition()
					.attr('x', (d) =>
						d.sex === 'female' ? xLeft(d.percentage) : xRight(0)
					)
					.attr('width', (d) =>
						d.sex === 'female'
							? xLeft(0) - xLeft(d.percentage)
							: xRight(d.percentage) - xRight(0)
					);
			} else {
				d3.select('#bars').selectAll('rect').transition().attr('height', 0);
			}
		}
	});

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	let margin = config.optional.margin[size];
	margin.centre = config.optional.margin.centre;

	allAges = graphic_data.columns.slice(3);

	// calculate percentage if we have numbers
	if (config.essential.dataType == 'numbers') {
		// turn into tidy data
		tidydata = pivot(
			graphic_data,
			graphic_data.columns.slice(3),
			'age',
			'value'
		);

		//rollup to work out totals
		rolledUp = d3.rollup(
			tidydata,
			(v) => d3.sum(v, (d) => d.value),
			(d) => d.AREACD
		);

		// then use total to work out percentages
		tidydataPercentage = tidydata.map(function (d) {
			return {
				...d,
				percentage: d.value / rolledUp.get(d.AREACD)
			};
		});

		//work out percentages for comparison
		comparisonPopTotal = d3.sum(
			comparison_data,
			(d) => d.maleBar + d.femaleBar
		);

		comparison_data_new = comparison_data.map(function (d) {
			return {
				age: d.age,
				male: d.maleBar / comparisonPopTotal,
				female: d.femaleBar / comparisonPopTotal
			};
		});
	} else {
		// turn into tidy data
		tidydataPercentage = pivot(
			graphic_data,
			graphic_data.columns.slice(3),
			'age',
			'percentage'
		);

		comparison_data_new = comparison_data.map(function (d) {
			return {
				age: d.age,
				male: d.maleBar,
				female: d.femaleBar
			};
		});
	}

	maxPercentage = d3.max([
		d3.max(tidydataPercentage, (d) => d.percentage),
		d3.max(comparison_data_new, (d) => d3.max([d.female, d.male]))
	]);

	// set up widths
	width = parseInt(graphic.style('width'));
	chart_width = (parseInt(graphic.style('width')) - margin.centre - margin.left - margin.right) / 2;
	height = allAges.length * config.optional.seriesHeight[size];

	// set up some scales, first the left scale
	xLeft = d3
		.scaleLinear()
		.domain([0, maxPercentage])
		.rangeRound([chart_width, 0]);

	// right scale
	xRight = d3
		.scaleLinear()
		.domain(xLeft.domain())
		.rangeRound([chart_width + margin.centre, chart_width * 2 + margin.centre]);

	// y scale
	y = d3.scaleBand().domain(allAges).rangeRound([height, 0]).paddingInner(0.1);

	// create the svg
	svg = addSvg({
		svgParent: graphic,
		chart_width: width,
		height: height + margin.top + margin.bottom,
		margin: margin
	})

	// create line generators
	lineLeft = d3
		.line()
		.curve(d3.curveStepBefore)
		.x((d) => xLeft(d.female))
		.y((d) => y(d.age) + y.bandwidth());

	lineRight = d3
		.line()
		.curve(d3.curveStepBefore)
		.x((d) => xRight(d.male))
		.y((d) => y(d.age) + y.bandwidth());

	//add x-axis left
	svg
		.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(0,' + height + ')')
		.call(
			d3
				.axisBottom(xLeft)
				.tickFormat(d3.format(config.essential.xAxisNumberFormat))
				.ticks(config.optional.xAxisTicks[size])
				.tickSize(-height)
		)
		.selectAll('line')
		.each(function (d) {
			if (d == 0) {
				d3.select(this).attr('class', 'zero-line');
			}
		});

	//add x-axis right
	svg
		.append('g')
		.attr('class', 'x axis right')
		.attr('transform', 'translate(0,' + height + ')')
		.call(
			d3
				.axisBottom(xRight)
				.tickFormat(d3.format(config.essential.xAxisNumberFormat))
				.ticks(config.optional.xAxisTicks[size])
				.tickSize(-height)
		)
		.selectAll('line')
		.each(function (d) {
			if (d == 0) {
				d3.select(this).attr('class', 'zero-line');
			}
		});

	// add bars
	svg
		.append('g')
		.attr('id', 'bars')
		.selectAll('rect')
		.data(tidydataPercentage.filter((d) => d.AREACD == graphic_data[0].AREACD))
		.join('rect')
		.attr('fill', (d) =>
			d.sex === 'female'
				? config.essential.colour_palette[0]
				: config.essential.colour_palette[1]
		)
		.attr('y', (d) => y(d.age))
		.attr('height', y.bandwidth())
		.attr('x', (d) => (d.sex === 'female' ? xLeft(0) : xRight(0)))
		.attr('width', 0);

	//add y-axis
	svg
		.append('g')
		.attr('class', 'y axis')
		.attr(
			'transform',
			'translate(' + (chart_width + margin.centre / 2 - 3) + ',0)'
		)
		.call(
			d3
				.axisRight(y)
				.tickSize(0)
				.tickValues(y.domain().filter((d, i) => !(i % config.essential.yAxisTicksEvery)))
		)
		.selectAll('text')
		.each(function () {
			d3.select(this).attr('text-anchor', 'middle');
		});

	//draw comparison lines
	comparisons = svg.append('g');

	comparisons
		.append('path')
		.attr('class', 'line')
		.attr('id', 'comparisonLineLeft')
		.attr('d', lineLeft(comparison_data_new) + 'l 0 ' + -y.bandwidth())
		.attr('stroke', config.essential.comparison_colour_palette[0])
		.attr('stroke-width', '2px');

	comparisons
		.append('path')
		.attr('class', 'line')
		.attr('id', 'comparisonLineRight')
		.attr('d', lineRight(comparison_data_new) + 'l 0 ' + -y.bandwidth())
		.attr('stroke', config.essential.comparison_colour_palette[1])
		.attr('stroke-width', '2px');

	//add x-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: (width - margin.left),
		yPosition: (height + 30),
		text: config.essential.xAxisLabel,
		textAnchor: "end",
		wrapWidth: width
	});

	//add y-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: (chart_width + margin.centre / 2),
		yPosition: -15,
		text: config.essential.yAxisLabel,
		textAnchor: "middle",
		wrapWidth: width
	});

	// Set up the legend
	widths = [chart_width + margin.left, chart_width + margin.right];

	legend
		.append('div')
		.attr('class', 'flex-row')
		.style('gap', margin.centre + 'px')
		.selectAll('div')
		.data(['Females', 'Males'])
		.join('div')
		.style('width', (d, i) => widths[i] + 'px')
		.append('div')
		.attr('class', 'chartLabel')
		.append('p')
		.text((d) => d);

	dataForLegend = [
		['x', 'x'],
		['y', 'y']
	]; //dummy data

	titleDivs = titles
		.selectAll('div')
		.data(dataForLegend)
		.join('div')
		.attr('class', 'flex-row')
		.style('gap', margin.centre + 'px')
		.selectAll('div')
		.data((d) => d)
		.join('div')
		.style('width', (d, i) => widths[i] + 'px')
		.append('div')
		.attr('class', 'legend--item');

	titleDivs
		.append('div')
		.style('background-color', (d, i) =>
			d == 'x'
				? config.essential.colour_palette[i]
				: config.essential.comparison_colour_palette[i]
		)
		.attr('class', (d) =>
			d == 'x' ? 'legend--icon--circle' : 'legend--icon--refline'
		);

	titleDivs
		.append('div')
		.append('p')
		.attr('class', 'legend--text')
		.html((d) =>
			d == 'x' ? config.essential.legend[0] : config.essential.legend[1]
		);

	//create link to source
	addSource('source', config.essential.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
} //end draw graphic

Promise.all([
	d3.csv(config.essential.graphic_data_url, d3.autoType),
	d3.csv(config.essential.comparison_data, d3.autoType)
]).then(([data, datab]) => {
	//load chart data
	graphic_data = data;
	comparison_data = datab;

	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});

function clear() {
	d3.select('#bars')
		.selectAll('rect')
		.transition()
		.attr('x', (d) => (d.sex === 'female' ? xLeft(0) : xRight(0)))
		.attr('width', 0);

	$('#areaselect').val(null).trigger('chosen:updated');
}

// bostock pivot longer function from https://observablehq.com/d/3ea8d446f5ba96fe
function pivot(data, columns, name, value) {
	const keep = data.columns.filter((c) => !columns.includes(c));
	return data.flatMap((d) => {
		const base = keep.map((k) => [k, d[k]]);
		return columns.map((c) => {
			return Object.fromEntries([...base, [name, c], [value, d[c]]]);
		});
	});
}
