// Adapted from https://observablehq.com/@d3/marimekko-chart

import { initialise, wrap_vary_width, addSvg, } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, svg;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	const aspectRatio = config.optional.aspectRatio[size];
	let margin = config.optional.margin[size];
	let chart_width =
		parseInt(graphic.style('width')) - margin.left - margin.right;
	//height is set by the aspect ratio
	let height =
		aspectRatio[1] / aspectRatio[0] * chart_width;

	// Create the color scale.
	const color = d3.scaleOrdinal(config.essential.colour_palette).domain(graphic_data.map(d => d.category));

	const categories = [...new Set(graphic_data.map(d => d.category))];

	// Set up the legend
	const legenditem = d3
		.select('#legend')
		.selectAll('div.legend--item')
		.data(d3.zip(categories, color.range()))
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


	// Compute the layout.
	const treemap = data => d3.treemap()
		.round(true)
		.tile(d3.treemapSliceDice)
		.size([
			chart_width - margin.left - margin.right, 
		  	height - margin.top - margin.bottom
		])
	  (d3.hierarchy(d3.group(data, d => d.series, d => d.category)).sum(d => d.value))
	  .each(d => {
		d.x0 += margin.left;
		d.x1 += margin.left;
		d.y0 += margin.top;
		d.y1 += margin.top;
	  });
	const root = treemap(graphic_data);
  
	// Create the SVG container.
	svg = addSvg({
			svgParent: graphic,
			chart_width: chart_width,
			height: height + margin.top + margin.bottom,
			margin: margin
		})

	// Position the nodes.
	const node = svg.selectAll("g")
	  .data(root.descendants())
	  .join("g")
		.attr("transform", d => `translate(${d.x0},${d.y0})`);
  
	const format = d => d.toLocaleString();
  
	// Draw column labels.
	const column = node.filter(d => d.depth === 1);
  
	column.append("text")
		.attr("x", 3)
		.attr("y", "-1.7em")
		.style("font-weight", "bold")
		.text(d => d.data[0]);
  
	column.append("text")
		.attr("x", 3)
		.attr("y", "-0.5em")
		.attr("fill-opacity", 0.7)
		.text(d => format(d.value));
  
	column.append("line")
		.attr("x1", -0.5)
		.attr("x2", -0.5)
		.attr("y1", -30)
		.attr("y2", d => d.y1 - d.y0)
		.attr("stroke", "#000")
  
	// Draw leaves.
	const cell = node.filter(d => d.depth === 2);
  
	cell.append("rect")
		.attr("fill", d => color(d.data[0]))
		.attr("width", d => d.x1 - d.x0 - 1)
		.attr("height", d => d.y1 - d.y0 - 1);
  
	cell.append("text")
		.attr("x", 1)
		.attr("y", 12)
		.attr("font-size", "small")
		.text(d => d.data[0] + ": " + d.value + " " + config.essential.units )
		.call(wrap_vary_width, d => d.x1 - d.x0 - 1);


	//create link to source
	d3.select('#source').text('Source: ' + config.essential.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}

	return svg.node();


}

d3.csv(config.essential.graphic_data_url).then((data) => {
	//load chart data
	graphic_data = data;

	data.forEach((d, i) => {

	});

	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
