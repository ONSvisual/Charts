config = {
  essential: {
    graphic_data_url: "data.csv",
    dateFormat: "%Y",
    legendLineLength: 60,
    legendItemWidth: 150,

    legendLabels: {
      Lower: "Lower skilled workers",
      Upper: "Upper skilled workers",
    },

    colour_palette: ["#206095", "#118C7B", "#003C57"],
    sourceText: "...from the Office for National Statistics",
    yAxisLabel: "%",
    yAxisScale: "auto_zero_max",
  },

  optional: {
    margin: {
      sm: {
        top: 5,
        right: 20,
        bottom: 20,
        left: 100,
      },
      md: {
        top: 5,
        right: 20,
        bottom: 20,
        left: 100,
      },
      lg: {
        top: 5,
        right: 20,
        bottom: 20,
        left: 100,
      },
      xAxisTicks: {
        sm: 4,
        md: 8,
        lg: 10,
      },
      yAxisTicks: {
        sm: 4,
        md: 8,
        lg: 10,
      },
      mobileBreakpoint: 510,
      mediumBreakpoint: 600,
    },
  },
};
