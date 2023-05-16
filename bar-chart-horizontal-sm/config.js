<<<<<<< HEAD
<<<<<<< HEAD
config = {
<<<<<<< HEAD
	essential: {
		graphic_data_url: "data.csv",
		colour_palette: "#206095",
		sourceText: "Office for National Statistics",
		accessibleSummary: "Here is the screenreader text describing the chart.",
		dataLabels: {
			show: true,
			numberFormat: ".0%",
		},
		xDomain: "auto",
		// either "auto" or an array for the x domain e.g. [0,100]
		xAxisLabel: "x axis label",
	},
	optional: {
		chart_every: {
			sm: 2,
			md: 2,
			lg: 2,
		},
		aspectRatio: {
			sm: [1, 2],
			md: [1, 2],
			lg: [1, 2],
		},
		margin: {
			sm: {
				top: 15,
				right: 20,
				bottom: 50,
				left: 120,
			},
			md: {
				top: 15,
				right: 20,
				bottom: 50,
				left: 120,
			},
			lg: {
				top: 15,
				right: 20,
				bottom: 50,
				left: 120,
			},
		},
		seriesHeight: {
			sm: 40,
			md: 40,
			lg: 40,
		},
		xAxisTicks: {
			sm: 4,
			md: 4,
			lg: 4,
		},
		mobileBreakpoint: 510,
		mediumBreakpoint: 600,
	},
	elements: { select: 0, nav: 0, legend: 0, titles: 0 },
	chart_build: {},
=======
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
>>>>>>> 2be7418093c29c6ed53d008057c939fa32d5b46c
};
=======
config = {"essential":{"graphic_data_url":"data.csv","colour_palette":["#206095","#27A0CC","#871A5B","#A8BD3A","#F66068"],"sourceText":"from the Office for National Statistics","accessibleSummary":"Here is the screen reader text describing the chart.","xDomain":"auto","xAxisTickFormat":".0f","xAxisLabel":"x axis label","stackOffset":"stackOffsetNone","stackOrder":"stackOrderNone"},"optional":{"chart_every":{"sm":1,"md":1,"lg":2},"aspectRatio":{"sm":[1,1],"md":[1,1],"lg":[1.6,2]},"margin":{"sm":{"top":15,"right":10,"bottom":50,"left":150},"md":{"top":15,"right":20,"bottom":50,"left":20},"lg":{"top":30,"right":20,"bottom":50,"left":160}},"seriesHeight":{"sm":30,"md":30,"lg":30},"xAxisTicks":{"sm":2,"md":2,"lg":5},"mobileBreakpoint":510,"mediumBreakpoint":600},"elements":{"select":0,"nav":0,"legend":1,"titles":0}}
>>>>>>> 631bb48 (Update config.js)
=======
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
>>>>>>> 2be7418 (updating config.js)
