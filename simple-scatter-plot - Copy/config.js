config={
  "essential": {
    "graphic_data_url": "data.csv",
    "colour_palette": "#206095",
    "fillOpacity":0.5,
    "strokeOpacity":1,
        "chart_height": 1,
    // Chart height as a proportion of the chart width
    // For example, 
    ///  1 would make the height equal to the width (a square), 
    ///  0.5 would make the height half the width
        "radius": "4",
    "sourceText": "Office for National Statistics",
    "accessibleSummary":"Here is the screenreader text describing the chart.",
    "dataLabels":{
      "show":true,
      "numberFormat":".0%"
    },
    "xDomain":"auto",
    "yDomain":"auto",
    // either "auto" or an array for the x domain e.g. [0,100]
    "xAxisLabel":"x axis label",
    "yAxisLabel":"y axis label"
  },
  "optional": {
    "margin": {
      "sm": {
        "top": 15,
        "right": 20,
        "bottom": 50,
        "left": 50
      },
      "md": {
        "top": 15,
        "right": 20,
        "bottom": 50,
        "left": 120
      },
      "lg": {
        "top": 30,
        "right":150,
        "bottom": 43,
        "left": 40
      }
    },
    "xAxisTicks":{
      "sm":4,
      "md":8,
      "lg":10
    },
    "yAxisTicks":{
      "sm":4,
      "md":8,
      "lg":10
    },
    "mobileBreakpoint": 510,
    "mediumBreakpoint": 600
  },
  "elements":{"select":0, "nav":0, "legend":0, "titles":0},
  "chart_build":{}
};
