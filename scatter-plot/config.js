config={
  "graphic_data_url": "data.csv",
  "colour_palette": ONSpalette,
  "fillOpacity":1,
  "strokeOpacity":1,
  "radius": "4",
  "sourceText": "Office for National Statistics",
  "accessibleSummary":"Here is the screenreader text describing the chart.",
  "xDomain":[0,1.05],
  "yDomain":[-0.14,0.95],
  // either "auto" or an array for the x/y domain e.g. [0,100]
  "xAxisLabel":"Change since last month",
  "yAxisLabel":"Difference from trend",
  "xAxisFormat": ".0%",
  "yAxisFormat": ".0%",
  "groupLabel": 'Group',
  "aspectRatio": {
    "sm": [1, 1],
    "md": [1, 1],
    "lg": [1, 1]
  },
  "margin": {
    "sm": {
      "top": 30,
      "right": 20,
      "bottom": 75,
      "left": 50
    },
    "md": {
      "top": 30,
      "right": 20,
      "bottom": 75,
      "left": 50
    },
    "lg": {
      "top": 30,
      "right":50,
      "bottom": 75,
      "left": 50
    }
  },
  "xAxisTicks":{
    "sm":4,
    "md":8,
    "lg":8
  },
  "yAxisTicks":{
    "sm":4,
    "md":4,
    "lg":10
  },
  "mobileBreakpoint": 510,
  "mediumBreakpoint": 600,
  "elements":{"select":0, "nav":0, "legend":0, "titles":0},
  "chart_build":{}
};
