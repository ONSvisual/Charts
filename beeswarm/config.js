config = {
  "essential": {
    "graphic_data_url": "data.csv",
    "colour_palette": "#206095",
    "sourceText": "Office for National Statistics",
    "accessibleSummary": "This chart has been hidden from screen readers. The main message of the chart is summarised in the chart title.",
    "xAxisFormat": ".0f",
    "xAxisLabel": "Percentage",
    "radius": 'auto',//either auto which is x-range / number of bins
    "xDomain": [5,22.5],// either auto or a custom domain as an array e.g [0,100]
    "circleDist": 'auto', //Vertical distance between centres of circles as a diameter of the radius or 'auto'
    "numBands": 75, //number of bins,
    "averages": {
      "show": true,  // Whether to show average lines
      "showLabels": false,  // Whether to show labels for the average lines
      "colour": "#444",  // Color of the average lines
      "strokeWidth": 3,  // Width of the average lines
      "strokeDash": "",  // Dash pattern for the lines
      "labelColour": "#444",  // Color of the labels
      "labelFormat": ".1f",  // Format for the label numbers
      "labelPrefix": "Mean: ",  // Text to show before the value
      "labelOffset": {  // Offset for label positioning
        x: 5,
        y: 0
      },
      "values": [  // Array of average values for each group
        { group: "North East", value: 14.0 },
        { group: "North West", value: 13.8 },
        { group: "Wales", value: 14.3 },
        { group: "Scotland", value: 14.7 },
        { group: "Northern Ireland", value: 14.3 },
        { group: "South East", value: 11.8 },
        { group: "South West", value: 12.6 },
        { group: "Yorkshire and The Humber", value: 14.3 },
        { group: "East Midlands", value: 13.7 },
        { group: "East of England", value: 13.1 },
        { group: "West Midlands", value: 13.6 },
        { group: "London", value: 12.1 },
        { group: "England", value: 13.0}
        // ... add more groups as needed
      ]
    }
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
        "top": 0,
        "right": 0,
        "bottom": 25,
        "left": 0
      }
    },
    "seriesHeight": {
      "sm": 100,
      "md": 100,
      "lg": 80
    },
    "xAxisTicks": {
      "sm": 3,
      "md": 8,
      "lg": 10
    },
    "mobileBreakpoint": 510,
    "mediumBreakpoint": 600
  }
};
