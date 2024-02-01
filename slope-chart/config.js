config = {
	"essential": {
		"graphic_data_url": "data.csv",
		"colour_palette": [
			"#8D8C8E",
			"#206095",
			"#27A0CC",
			"#871A5B",
			"#A8BD3A",
			"#F66068",
			"#118C7B"
		],
		"colour_palette_text": [
			"#8D8C8E",
			"#206095",
			"#1F80A3",
			"#871A5B",
			"#6E7E26",
			"#F66068",
			"#118C7B"
		],
		"drawLegend": false,
		"sourceText": "Census 2011 and Census 2021 from the Office for National Statistics",
		"accessibleSummary": "",
		"lineCurveType": "curveLinear", 	
		"yDomain": [0,550000],
		// either "auto" or an array for the x domain e.g. [0,2000]
		"xAxisTickFormat": {
			"sm": "%b %y",
			"md": "%b %y",
			"lg": "%B %Y"
		},
		"xAxisNumberFormat": ".0f",
		"yAxisNumberFormat": ",.0f",
		"dateFormat": "%d-%m-%Y",
		"yAxisLabel": "",
		"xAxisLabel": "",
		"paddingLeft":10,
		"paddingRight":20,
	},
	"optional": {
		// default is 75
		 "chartwidth": {
			"sm": 75,
			"md": 75,
			"lg": 75
		},
		"aspectRatio": {
			"sm": [1, 1],
			"md": [1, 1],
			"lg": [1, 1]
		},
		"margin": {
			"sm": {
				"top": 30,
				"right": 300,
				"bottom": 25,
				"left": 70
			},
			"md": {
				"top": 30,
				"right":300,
				"bottom": 15,
				"left": 70
			},
			"lg": {
				"top": 30,
				"right": 300,
				"bottom": 15,
				"left": 70
			}
		},
		"xAxisTicks": { // this is the number of ticks on the x axis - add the first and last date with the options below
			"sm": 2,
			"md": 2,
			"lg": 2
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
