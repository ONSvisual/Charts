let graphic = d3.select("#graphic");
let pymChild = null;

function drawGraphic() {
  // Define the dimensions and margins for the chart
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  const width = graphic.node().offsetWidth - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Remove any existing chart elements
  graphic.selectAll("*").remove();

  // Start of create legend

  let legenditem = d3
    .select("#legend")
    .selectAll("div.legend--item")
    .data(
      d3.zip(
        graphic_data.map((d) => d.category),
        config.essential.colour_palette
      )
    )
    .enter()
    .append("div")
    .attr("class", "legend--item");

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
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define the x and y scales
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(graphic_data, (d) => d.date))
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([0, 1]) // Assuming the y-axis represents the percentage from 0 to 1
    .range([height, 0]);

  // Define the stack generator
  const stack = d3
    .stack()
    .keys(graphic_data.columns.slice(1)) // Use the category names as keys
    .order(d3.stackOrderNone) // Use the stack order defined in the config
    .offset(d3.stackOffsetExpand); // Convert to percentage values

  // Generate the stacked data
  const stackedData = stack(graphic_data);

  // Define the area generator
  const area = d3
    .area()
    .x((d) => xScale(d.data.date))
    .y0((d) => yScale(d[0]))
    .y1((d) => yScale(d[1]));

  // Create the areas
  svg
    .selectAll("path")
    .data(stackedData)
    .enter()
    .append("path")
    .attr("fill", (d) => {
      // Assign colors to each category
      // You can modify this to use your color palette
      const category = d.key;
      return getColorForCategory(category);
    })
    .attr("d", area);

  // Add the x-axis
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

  // Add the y-axis
  svg.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale));

  // Helper function to get color for each category
  function getColorForCategory(category) {
    // This function should return the color corresponding to the category
    // You can customize this function to match your color palette or use a predefined color scale
    // For simplicity, this example assigns random colors to each category
    const colorScale = d3.scaleOrdinal(config.essential.colour_palette);
    return colorScale(category);
  }

  //use pym to calculate chart dimensions
  if (pymChild) {
    pymChild.sendHeight();
  }
}

d3.csv(config.essential.graphic_data_url).then((data) => {
  // Load chart data
  graphic_data = data;

  // Format date and convert value to a number
  graphic_data.forEach((d) => {
    d.date = d3.timeParse(config.essential.dateFormat)(d.date);
    d.value = +d.value;
  });

  console.log("Final data structure:");
  console.log(graphic_data);

  // Use pym to create an iframed chart dependent on specified variables
  pymChild = new pym.Child({
    renderCallback: drawGraphic,
  });
});
