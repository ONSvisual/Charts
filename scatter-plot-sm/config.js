config={
  "essential": { 
    "graphic_data_url": "data.csv",
    "colour_palette": ["#206095","#3fb0b3"],
    "fillOpacity":0.5,
    "strokeOpacity":1,
        "radius": "4",
    "sourceText": "From the Office for National Statistics",
    "accessibleSummary":"Here is the screenreader text describing the chart.",
    "xDomain":"auto",
    "yDomain":"auto",
    // either "auto" or an array for the x domain e.g. [0,100]
    "xAxisLabel":"x axis label",
    "yAxisLabel":"y axis label",
    "xAxisFormat":".0%",
    "yAxisFormat":".0%"
  },
  "optional": {
    "chartEvery":{
      "sm":1,
      "md":1,
      "lg":2
    },
    "margin": {
      "sm": {
        "top": 30,
        "right": 20,
        "bottom": 50,
        "left": 50
      },
      "md": {
        "top": 30,
        "right": 20,
        "bottom": 50,
        "left": 50
      },
      "lg": {
        "top": 30,
        "right":50,
        "bottom": 50,
        "left": 50
      }
    },
    "xAxisTicks":{
      "sm":4,
      "md":4,
      "lg":4
    },
    "yAxisTicks":{
      "sm":4,
      "md":4,
      "lg":10
    },
    "mobileBreakpoint": 510,
    "mediumBreakpoint": 600
  },
  "elements":{"select":0, "nav":0, "legend":0, "titles":0},
  "chart_build":{}
};
