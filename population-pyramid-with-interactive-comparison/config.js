config = {
  "essential": {
    "accessibleSummary": "This chart has been hidden from screen readers. The main message of the chart is summarised in the chart title.",
    "sourceText": "Office for National Statistics – Census 2021",
    "graphic_data_url": "data.csv",
    "comparison_data": "comparison.csv",
    "comparison_time_data": "comparison-time.csv",
    "buttonLabels":["England and Wales","2011"],
    "dataType": "numbers",
    // dataType can be a 'percentage' or 'numbers' where it works out the percentage in the script
    "colour_palette": ["#9A86E9", "#3fb0b3"],
    // this is the lighter palette for reference lines ["#9A86E9", "#3fb0b3"]
    "comparison_colour_palette": ["#5c5185", "#306970"],
    "legend": ["Area name","Selected comparison"],
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
      "centre": 60
    },
    "seriesHeight": {
      "sm": 6,
      "md": 6,
      "lg": 6
    },
    "xAxisTicks": {
      "sm": 3,
      "md": 3,
      "lg": 3
    },
    "mobileBreakpoint": 510,
    "mediumBreakpoint": 600
  },
  "elements":{"select":0, "nav":1, "legend":1, "titles":1}
};
