config = {
  essential: {
    graphic_data_url: "data.csv",
    colour_palette: ["#206095", "#27A0CC", "#871A5B", "#A8BD3A", "#F66068"],
    sourceText: "Office for National Statistics",
    accessibleSummary: "Here is the screenreader text describing the chart.",
    xDomain: "auto",
    // either "auto" or an array for the x domain e.g. [0,100]
    xAxisTickFormat: ".0f",
    xAxisLabel: "x axis label",
    stackOffset: "stackOffsetNone",
    // options include
    // stackOffsetNone means the baseline is set at zero
    // stackOffsetExpand to do 100% charts
    // stackOffsetDivergine for data with positive and negative values
    stackOrder: "stackOrderNone",
    // other options include
    // stackOrderNone means the order is taken from the datafile
    // stackOrderAppearance the earliest series (according to the maximum value) is at the bottom
    // stackOrderAscending the smallest series (according to the sum of values) is at the bottom
    // stackOrderDescending the largest series (according to the sum of values) is at the bottom
    // stackOrderReverse reverse the order as set from the data file
  },
  optional: {
    chart_every: {
      sm: 2,
      md: 2,
      lg: 2,
    },
    aspectRatio: {
      sm: [1, 1],
      md: [1, 1],
      lg: [1, 1],
    },
    margin: {
      sm: {
        top: 15,
        right: 20,
        bottom: 50,
        left: 120,
      },
      md: {
        top: 15,
        right: 20,
        bottom: 50,
        left: 120,
      },
      lg: {
        top: 15,
        right: 20,
        bottom: 50,
        left: 120,
      },
    },
    seriesHeight: {
      sm: 30,
      md: 30,
      lg: 30,
    },
    xAxisTicks: {
      sm: 4,
      md: 8,
      lg: 10,
    },
    mobileBreakpoint: 510,
    mediumBreakpoint: 600,
  },
  elements: { select: 0, nav: 0, legend: 1, titles: 0 },
};
