config = {
  "essential":{
    "accessibleSummary":"This chart has been hidden from screen readers. The main message of the chart is summarised in the chart title.",
    "sourceText":"Office for National Statistics – Census 2021",
    "graphic_data_url":"data.csv",
    "dataType":"numbers",
    // dataType can be a 'percentage' or 'numbers' where it works out the percentage in the script
    "colour_palette": ["#6749A6","#2EA1A4"],
    // this is the darker palette when there are no comparison lines  ["#6749A6","#2EA1A4"]
    "legend":["Variable name"],
    "xAxislabel": ["Percentage"]
  },
  "optional": {
    "margin": {
      "sm": {
        "top": 30,
        "right": 10,
        "bottom": 50,
        "left": 10
      },
      "md": {
        "top": 30,
        "right": 10,
        "bottom": 50,
        "left": 10
      },
      "lg": {
        "top": 30,
        "right": 10,
        "bottom": 50,
        "left": 10
      },
      "centre":60
    },
    "seriesHeight":{
      "sm":6,
      "md":6,
      "lg":6
    },
    "xAxisTicks":{
      "sm":3,
      "md":3,
      "lg":3
    },
    "mobileBreakpoint": 510,
    "mediumBreakpoint": 600
  },
  "elements":{"select":0, "nav":0, "legend":1, "titles":1}
};
