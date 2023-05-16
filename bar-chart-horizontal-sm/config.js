config = {
	"essential": {
		"graphic_data_url": "data.csv",
		"colour_palette": ["#206095", "#27A0CC", "#871A5B", "#A8BD3A", "#F66068"],
		"sourceText": "from the Office for National Statistics",
		"accessibleSummary": "Here is the screen reader text describing the chart.",
		"xDomain": "auto",
		"xAxisTickFormat": ".0f",
		"xAxisLabel": "x axis label",
		"stackOffset": "stackOffsetNone",
		"stackOrder": "stackOrderNone",
	},
	"optional": {
		"chart_every": { "sm": 1, "md": 1, "lg": 2 },
		"aspectRatio": { "sm": [1, 1], "md": [1, 1], "lg": [1.6, 2] },
		"margin": {
			"sm": { "top": 15, "right": 10, "bottom": 50, "left": 150 },
			"md": { "top": 15, "right": 20, "bottom": 50, "left": 20 },
			"lg": { "top": 30, "right": 20, "bottom": 50, "left": 160 },
		},
		"seriesHeight": { "sm": 30, "md": 30, "lg": 30 },
		"xAxisTicks": { "sm": 2, "md": 2, "lg": 5 },
		"mobileBreakpoint": 510,
		"mediumBreakpoint": 600,
	},
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 },
};
