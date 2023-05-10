config={
  "essential": {
    "graphic_data_url": "data.csv",
    "colour_palette": "YlGnBu",
    // must be a colour brewer palette
    "sourceText": "Office for National Statistics",
    "accessibleSummary":"Here is the screenreader text describing the chart.",
    "dataLabelsNumberFormat":".0f",
    "xAxisLabel":"x axis label",
    "numberOfBreaks":5,
    "breaks":"jenks",
    // either "jenks","equal" or an array with custom breaks
    "cascadeX":true,
    //turns on or off cascading xaxis label
    "legendFormat":".0f"
  },
  "optional": {
    "margin": {
      "sm": {
        "top": 180,
        "right": 20,
        "bottom": 50,
        "left": 120
      },
      "md": {
        "top": 180,
        "right": 20,
        "bottom": 50,
        "left": 120
      },
      "lg": {
        "top": 180,
        "right": 20,
        "bottom": 50,
        "left": 120
      }
    },
    "seriesHeight":{
      "sm":40,
      "md":40,
      "lg":40
    },
    "mobileBreakpoint": 510,
    "mediumBreakpoint": 600
  },
  "elements":{"select":0, "nav":0, "legend":1, "titles":0}
};
