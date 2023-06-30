config = {
	"essential": {
		"graphic_data_url": "data.csv",
		"colour_palette": "#206095",
		"sourceText": "Office for National Statistics",
		"accessibleSummary": "Here is the screenreader text describing the chart.",
		"xAxisTickFormat": {
			"sm": "%Y",
			"md": "%Y",
			"lg": "%b-%y"
		},
		"dateFormat": "%b-%y",
		//the format your date data has in data.csv
		"yDomain": "auto",
		// either "auto" or an array for the x domain e.g. [0,100]
		"yAxisLabel": "y axis label"
	},
	"optional": {
		"margin": {
			"sm": {
				"top": 15,
				"right": 20,
				"bottom": 50,
				"left": 70
			},
			"md": {
				"top": 15,
				"right": 20,
				"bottom": 50,
				"left": 70
			},
			"lg": {
				"top": 15,
				"right": 20,
				"bottom": 50,
				"left": 70
			}
		},
		"aspectRatio": {
			"sm": [1, 2],
			"md": [1, 1],
			"lg": [2, 1]
		},
		"xAxisTicksEvery": {
			"sm": 4,
			"md": 4,
			"lg": 2
		},
		"yAxisTicks": {
			"sm": 4,
			"md": 8,
			"lg": 10
		},
		"mobileBreakpoint": 510,
		"mediumBreakpoint": 600
	},
	"elements": { "select": 0, "nav": 0, "legend": 0, "titles": 0 },
	"chart_build": {}
};
