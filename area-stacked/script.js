const graphic = d3.select("#graphic");
let pymChild = null;

function drawGraphic() {
  d3.select("#accessibleSummary").html(config.essential.accessibleSummary);

  const threshold_md = config.optional.mediumBreakpoint;
  const threshold_sm = config.optional.mobileBreakpoint;

  let size;
  if (parseInt(graphic.style("width")) < threshold_sm) {
    size = "sm";
  } else if (parseInt(graphic.style("width")) < threshold_md) {
    size = "md";
  } else {
    size = "lg";
  }

  const margin = config.optional.margin[size];
}

d3.csv(config.essential.graphic_data_url).then((data) => {
  // load chart data
  const graphic_data = data;
  //use pym to create iframe chart dependent on specified variables.
  //   console.log(data);

  graphic_data.forEach((d) => {
    d.date = d3.timeParse(config.essential.dateFormat)(d.date);
    console.log(d.date);
  });

  pymChild = new pym.Child({
    renderCallback: drawGraphic,
  });
});
