config = {
	"graphic_data_url": "data.csv",
	"colour_palette": ONSlinePalette,
	"sourceText": "Annual Population Survey from the Office for National Statistics ",
	"accessibleSummary": "Here is the screen reader text describing the chart.",
	"lineCurveType": "curveLinear", // Set the default line curve type
	// Examples of line curve types
	// "lineCurveType": "curveLinear", // Straight line segments
	// "lineCurveType": "curveStep", // Step-wise line
	// "lineCurveType": "curveStepBefore", // Step-before line
	// "lineCurveType": "curveStepAfter", // Step-after line
	// "lineCurveType": "curveBasis", // B-spline curve
	// "lineCurveType": "curveCardinal", // Cardinal spline curve
	// "lineCurveType": "curveCatmullRom" // Catmull-Rom spline curve
	// "lineCurveType": "curveMonotoneX" // Monotone spline curve

	"xDomain": [-13, 25],
	// either "auto" or an array for the x domain e.g. [0,2000] - DOES NOT WORK
	"xAxisTickFormat": {
		"sm": "%Y",
		"md": "%Y",
		"lg": "%Y"
	},
	"yAxisFormat": ",.0%",
	"dateFormat": "%Y",
	"yAxisLabel": "Pay Gap",
	"CI_legend": true,
	"CI_legend_interval_text": "Likely range (95% confidence interval)",
	"CI_legend_text": "Estimated value",
	"zeroLine": "0",

	"chart_every": {
		"sm": 1,
		"md": 2,
		"lg": 2
	},
	"aspectRatio": {
		"sm": [1.2, 1],
		"md": [1.2, 1],
		"lg": [1.2, 1]
	},
	"margin": {
		"sm": {
			"top": 70,
			"right": 15,
			"bottom": 50,
			"left": 45
		},
		"md": {
			"top": 70,
			"right": 25,
			"bottom": 50,
			"left": 45
		},
		"lg": {
			"top": 70,
			"right": 25,
			"bottom": 50,
			"left": 45
		}
	},
	"chartGap": 20,
	"xAxisTicksEvery": { // this is the interval of ticks on the x axis but it will always show the first and last date.
		"sm": 2,
		"md": 2,
		"lg": 2
	},
	"yAxisTicks": {
		"sm": 7,
		"md": 5,
		"lg": 8
	},
	"mobileBreakpoint": 510,
	"mediumBreakpoint": 600,
	"dropYAxis": true,
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};
