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
		"sourceText": "from the Office for National Statistics",
		"accessibleSummary": "Here is the screen reader text describing the chart.",
		"xDomain": "auto",
		// either "auto" or an array for the x domain e.g. [0,2000]
		"xAxisTickFormat": {
			"sm": "%y",
			"md": "%Y",
			"lg": "%Y"
		},
		"dateFormat": "%Y",
		"xAxisLabel": "x axis label"
	},
	"optional": {
		"aspectRatio": {
			"sm": [1, 1],
			"md": [1, 1],
			"lg": [1, 1]
		},
		"margin": {
			"sm": {
				"top": 15,
				"right": 20,
				"bottom": 50,
				"left": 80
			},
			"md": {
				"top": 15,
				"right": 50,
				"bottom": 50,
				"left": 80
			},
			"lg": {
				"top": 30,
				"right": 50,
				"bottom": 50,
				"left": 80
			}
		},
		"xAxisTicks": {
			"sm": 7,
			"md": 5,
			"lg": 8
		},
		"mobileBreakpoint": 510,
		"mediumBreakpoint": 600
	},
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};
