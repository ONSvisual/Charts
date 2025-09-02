config = {
	"essential": {
		"graphic_data_url": "data.csv",
		"colour_palette": ["#206095", "#27A0CC", "#871A5B", "#A8BD3A", "#F66068"],
		"sourceText": "Office for National Statistics",
		"accessibleSummary": "Here is the screen reader text describing the chart.",
		"xDomain": "auto",
		// either "auto" or an array for the x domain e.g. [0,100]
		"xAxisTickFormat": ".0f",
		"xAxisLabel": "x axis label",
		"stackOffset": "stackOffsetDiverging",
		// options include
		// stackOffsetNone means the baseline is set at zero
		// stackOffsetExpand to do 100% charts
		// stackOffsetDiverging for data with positive and negative values
		"stackOrder": "stackOrderNone"
		// other options include
		// stackOrderNone means the order is taken from the datafile
		// stackOrderAppearance the earliest series (according to the maximum value) is at the bottom
		// stackOrderAscending the smallest series (according to the sum of values) is at the bottom
		// stackOrderDescending the largest series (according to the sum of values) is at the bottom
		// stackOrderReverse reverse the order as set from the data file
	},
	"optional": {
		"chart_every": {
			"sm": 1,
			"md": 1,
			"lg": 2 // This indicates you want 2 charts side by side
		},
		// "aspectRatio": {
		// 	"sm": [1, 1],
		// 	"md": [1, 1],
		// 	"lg": [1.6, 2] //lg: [1.6, 2], can be used to make a 2x wide grid
		// },
		"margin": {
			"sm": {
				"top": 30,
				"right": 10,
				"bottom": 50,
				"left": 150
			},
			"md": {
				"top": 30,
				"right": 20,
				"bottom": 50,
				"left": 20
			},
			"lg": {
				"top": 30,
				"right": 20,
				"bottom": 50,
				"left": 160
			}
		},
		"chartGap": 20,
		"seriesHeight": {
			"sm": 30,
			"md": 30,
			"lg": 30
		},
		"xAxisTicks": {
			"sm": 2,
			"md": 2,
			"lg": 5
		},
		"mobileBreakpoint": 510,
		"mediumBreakpoint": 600,
		"dropYAxis": true
	},
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};
