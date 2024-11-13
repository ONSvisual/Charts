config={
  "essential": {
    "graphic_data_url": "data.csv",
    "colour_palette": "#206095",
    "sourceText": "Office for National Statistics",
    "accessibleSummary":"This chart has been hidden from screen readers. The main message of the chart is summarised in the chart title.",
    "xAxisFormat":".0f",
    "xAxisLabel":"x-axis label",
    "radius":'auto',//either auto which is x-range / number of bins
    "xDomain":'auto',// either auto or a custom domain as an array e.g [0,100]
    "circleDist":'auto', //Vertical distance between centres of circles as a diameter of the radius or 'auto'
    "numBands":50 //number of bins
  },
  "optional": {
    "margin": {
      "sm": {
        "top": 5,
        "right": 20,
        "bottom": 20,
        "left": 120
      },
      "md": {
        "top": 5,
        "right": 20,
        "bottom": 20,
        "left": 120
      },
      "lg": {
        "top": 5,
        "right": 20,
        "bottom": 20,
        "left": 10
      }
    },
    "seriesHeight":{
      "sm":100,
      "md":100,
      "lg":80
    },
    "xAxisTicks":{
      "sm":3,
      "md":8,
      "lg":10
    },
    "mobileBreakpoint": 510,
    "mediumBreakpoint": 600
  }
};
