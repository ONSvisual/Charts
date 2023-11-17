config = {
	"essential": {
		"graphic_data_url": "data.csv",
		"colour_palette": [
			"#206095",
			"#27A0CC",
			"#871A5B",
			"#A8BD3A",
			"#F66068",
			"#118C7B"
		],
		"sourceText": "Office for National Statistics",
		"accessibleSummary": "Here is the screen reader text describing the chart.",
		"xDomain": "auto",
		// either "auto" or an array for the x domain e.g. [0,100]
		"xAxisTickFormat": {
			"sm": "%y",
			"md": "%Y",
			"lg": "%Y"
		},
		"yAxisFormat": ".0%",
		"dateFormat": "%Y",
		"xAxisLabel": "x axis label",
		"yAxisLabel": "y axis label",
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
			"lg": 2
		},
		"aspectRatio": {
			"sm": [1, 1],
			"md": [1, 1],
			"lg": [1, 1]
		},
		"margin": {
			"sm": {
				"top": 50,
				"right": 20,
				"bottom": 50,
				"left": 50
			},
			"md": {
				"top": 50,
				"right": 20,
				"bottom": 50,
				"left": 50
			},
			"lg": {
				"top": 50,
				"right": 20,
				"bottom": 50,
				"left": 50
			}
		},
		"xAxisTicksEvery": {
			"sm": 7,
			"md": 5,
			"lg": 4
		},
		"mobileBreakpoint": 510,
		"mediumBreakpoint": 600,
		"legendColumns": 4,
		"dropYAxis": true
	},
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};
