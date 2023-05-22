let graphic = d3.select("#graphic");
let pymChild = null;

function drawGraphic() {
	//Accessible summary
	d3.select("#accessibleSummary").html(config.essential.accessibleSummary);

	let threshold_md = config.optional.mediumBreakpoint;
	let threshold_sm = config.optional.mobileBreakpoint;

	//set variables for chart dimensions dependent on width of #graphic
	if (parseInt(graphic.style("width")) < threshold_sm) {
		size = "sm";
	} else if (parseInt(graphic.style("width")) < threshold_md) {
		size = "md";
	} else {
		size = "lg";
	}

	// Define the dimensions and margin, width and height of the chart.
	let margin = config.optional.margin[size];
	let width = parseInt(graphic.style("width")) - margin.left - margin.right;
	let height = 400 - margin.top - margin.bottom;

	// Remove any existing chart elements
	graphic.selectAll("*").remove();

	// Get categories from the keys used in the stack generator
	const categories = Object.keys(graphic_data[0]).filter((k) => k !== "date");

	const colorScale = d3
		.scaleOrdinal()
		.domain(categories)
		.range(config.essential.colour_palette);

	// Set up the legend
	const legenditem = d3
		.select("#legend")
		.selectAll("div.legend--item")
		.data(d3.zip(categories, colorScale.range()))
		.enter()
		.append("div")
		.attr("class", "legend--item");

	legenditem
		.append("div")
		.attr("class", "legend--icon--circle")
		.style("background-color", function (d) {
			return d[1];
		});

	legenditem
		.append("div")
		.append("p")
		.attr("class", "legend--text")
		.html(function (d) {
			return d[0];
		});

	// Create an SVG element
	const svg = graphic
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.attr("class", "chart")
		.style("background-color", "#fff")
		.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

	// Define the x and y scales
	const xAxis = d3
		.scaleTime()
		.domain(d3.extent(graphic_data, (d) => d.date))
		.range([0, width]);

	const yAxis = d3
		.scaleLinear()
		.domain([0, 1]) // Assuming the y-axis represents the percentage from 0 to 1
		.range([height, 0]);

	// Define the stack generator
	const stack = d3
		.stack()
		.keys(categories) // Use the category names as keys
		.order(d3.stackOrderNone) // Use the stack order defined in the config later
		.offset(d3.stackOffsetExpand); // Convert to percentage values

	// Generate the stacked data
	const stackedData = stack(graphic_data);

	console.log("stackedData:", stackedData);

	// Define the area generator
	const area = d3
		.area()
		.x((d) => xAxis(d.data.date))
		.y0((d) => yAxis(d[0]))
		.y1((d) => yAxis(d[1]));

	// Create the areas
	svg
		.selectAll("path")
		.data(stackedData)
		.enter()
		.append("path")
		.attr("fill", (d) => {
			// Assign colors to each category
			const category = d.key;
			return colorScale(category);
		})
		.attr("d", area);

	// Add the x-axis
	svg
		.append("g")
		.attr("class", "y axis")
		.attr("transform", `translate(0, ${height})`)
		.call(
			d3
				.axisBottom(xAxis)
				.tickFormat(d3.timeFormat(config.essential.xAxisTickFormat[size]))
				.ticks(config.optional.xAxisTicks[size])
		);

	// Add the y-axis
	svg
		.append("g")
		.attr("class", "y axis")
		.call(d3.axisLeft(yAxis).tickFormat(d3.format(".0%")));

	// This does the x-axis label
	svg
		.append("g")
		.attr("transform", `translate(0, ${height})`)
		.append("text")
		.attr("x", width)
		.attr("y", 35)
		.attr("class", "axis--label")
		.text(config.essential.xAxisLabel)
		.attr("text-anchor", "end");

	//create link to source
	d3.select("#source").text("Source: " + config.essential.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
}

d3.csv(config.essential.graphic_data_url).then((rawData) => {
	graphic_data = rawData.map((d) => {
		return {
			date: d3.timeParse(config.essential.dateFormat)(d.date),
			...Object.entries(d)
				.filter(([key]) => key !== "date")
				.map(([key, value]) => [key, +value])
				.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
		};
	});

	console.log("Final data structure:");
	console.log(graphic_data);

	// Use pym to create an iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic,
	});
});
