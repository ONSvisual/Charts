config = {
	"graphic_data_url": "data.csv",
	"legendLabels": ["Category 1 goes here", "Category 2 goes here"],
	"colour_palette": ONSpalette,
	"sourceText": "Office for National Statistics",
	"accessibleSummary": "Here is the screenreader text describing the chart.",
	"dataLabels": {
		"show": true,
		"numberFormat": ".0%"
	},
	"xDomain": "auto",
	// either "auto" or an array for the x domain e.g. [0,100]
	"xAxisLabel": "x axis label",
	"margin": {
		"sm": {
			"top": 15,
			"right": 20,
			"bottom": 50,
			"left": 120
		},
		"md": {
			"top": 15,
			"right": 20,
			"bottom": 50,
			"left": 120
		},
		"lg": {
			"top": 15,
			"right": 20,
			"bottom": 50,
			"left": 120
		}
	},
	"seriesHeight": {
		"sm": 70,
		"md": 70,
		"lg": 70
	},
	"xAxisTicks": {
		"sm": 4,
		"md": 8,
		"lg": 10
	},
	"mobileBreakpoint": 510,
	"mediumBreakpoint": 600,
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};
