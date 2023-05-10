config = {
"essential":{
  "graphic_data_url":"data.csv",
  "colour_palette_type": "categorical",
    // type can be mono, divergent, categorical
  "colour_palette_colours":["#206095", "#27A0CC","#871A5B", "#A8BD3A","#F66068"],
    // colours is an array for the colours of the bars
    // e.g. if mono use ["206095"]
    // e.g if divergent you can use ["#206095","#F66068"]
    // e.g if categorical ["#206095", "#27A0CC","#871A5B", "#A8BD3A","#F66068"]
  "numberFormat":".0f",
  "rowWidth":"140",
  // rowWidth set the width of y category column in pixel
  "accessibleSummary":"This chart has been hidden from screen readers. The main message of the chart is summarised in the chart title.",
  "sourceText":"Office for National Statistics – Census 2021",
  "threshold_sm":500
},
//Don't adjust this part - it only affects the chart build tool
"chart_build":{
  "graphic_data_url":"text",
  "colour_palette_type":"radio",
  "colour_palette_type_options":["mono","divergent","categorical"],
  "colour_palette_colours": "colour",
  "colour_palette_colours_options": ["#206095","#27A0CC","#871A5B","#A8BD3A","#F66068"],
  "numberFormat":"dThreeFormat",
  "numberFormat_options":[".0f"],
  "rowWidth":"number",
  "accessibleSummary":"textarea",
  "sourceText":"text",
  "threshold_sm":"number"
},
"elements":{"select":0, "nav":0, "legend":0, "titles":0}
};
