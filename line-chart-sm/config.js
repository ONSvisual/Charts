config = {
	"essential": {
		"graphic_data_url": "data.csv",
		"colour_palette": [
			"#003C57",
			"#27A0CC",
			"#dadada"
		],
		"labelFinalPoint": true,
		"reference_category": "England",// Highlighted on each chart and doesn't get it's own chart - leave blank to turn off
		"sourceText": "Office for National Statistics",
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

		"xDomain": "auto",
		// either "auto" or an array for the x domain e.g. [0,2000]
		"xAxisTickFormat": {
			"sm": "%b %y",
			"md": "%b %y",
			"lg": "%b %y"
		},
		"dateFormat": "%d/%m/%Y",
		"xAxisLabel": "x axis label"
	},
	"optional": {
		"chart_every": {
			"sm": 1,
			"md": 2,
			"lg": 3
		},
		"aspectRatio": {
			"sm": [1, 1],
			"md": [1, 1],
			"lg": [1, 1]
		},
		"margin": {
			"sm": {
				"top": 45,
				"right": 50,
				"bottom": 50,
				"left": 60
			},
			"md": {
				"top": 45,
				"right": 50,
				"bottom": 50,
				"left": 60
			},
			"lg": {
				"top": 45,
				"right": 50,
				"bottom": 50,
				"left": 60
			}
		},
		"xAxisTicksEvery": { // this is the interval of ticks on the x axis but it will always show the first and last date.
			"sm": 4,
			"md": 2,
			"lg": 5
		},
		"yAxisTicks": {
			"sm": 7,
			"md": 5,
			"lg":8
		},
		"mobileBreakpoint": 510,
		"mediumBreakpoint": 600
	},
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};
