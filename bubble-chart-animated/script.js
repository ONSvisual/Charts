import { wrap, addSvg, addAxisLabel } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, svg, sliderSimple, animating;

function drawGraphic() {
	// clear out existing graphics
	graphic.selectAll('*').remove();
	legend.selectAll('*').remove();
	d3.select('#slider-simple').selectAll('*').remove();

	//population accessible summmary
	d3.select('#accessibleSummary').html(config.essential.accessibleSummary);

	let threshold_md = config.optional.mediumBreakpoint;
	let threshold_sm = config.optional.mobileBreakpoint;

	//set variables for chart dimensions dependent on width of #graphic
	if (parseInt(graphic.style('width')) < threshold_sm) {
		size = 'sm';
	} else if (parseInt(graphic.style('width')) < threshold_md) {
		size = 'md';
	} else {
		size = 'lg';
	}

	let margin = config.optional.margin[size];
	let chart_width =
		parseInt(graphic.style('width')) - margin.left - margin.right;

	//height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion
	let height = Math.ceil(
		(chart_width * config.optional.aspectRatio[size][1]) /
		config.optional.aspectRatio[size][0]
	);

	//Set the timepoints from the data for the slider labels and sort from oldest to newest
	let timepoints = [...new Set(graphic_data.map((d) => d.year))].sort();

	//Takes the last data point from the date series

	let timeLoad = config.essential.timeLoad;

	//set up scales
	const x = d3.scaleLinear().range([0, chart_width]);

	const y = d3.scaleLinear().range([height, 0]);

	const r = d3.scaleSqrt();

	function drawSliderButtons() {
		//Set the initial timepoint for the data load at from the config

		let a = config.essential.timeLoad;

		//Set the date format for the slider label

		let dateformat = d3.timeFormat(config.essential.dateFormat);
		let dateparse = d3.timeParse(config.essential.dateParse);

		//Make the slider

		function makeSlider() {
			let sliderDomain = [0, timepoints.length - 1]; //set the domain according to the length of the timepoints

			//Set the linear scale for the slider

			let sliderScale = d3
				.scaleLinear()
				.domain(sliderDomain)
				.range([0, chart_width - margin.right]);

			sliderSimple = d3
				.sliderHorizontal(sliderScale)
				.step(1)
				.default(timepoints.indexOf(timeLoad)) //defaults the the slider to load with data from timeLoad in the config
				.width(chart_width - 150)
				.displayFormat(function (i) {
					return dateformat(dateparse(timepoints[i]));
				}) //labels taken from timepoints
				.displayValue(true)
				.handle(d3.symbol().type(d3.symbolCircle).size(500)) //Handle colour is set in the chart.css file under parameter handle
				.fill('#206095')
				.ticks(0)
				.on('onchange', function (val) {
					// a is the master variable for the current timepoint
					if (a !== val) {
						// if a has changed
						a = val;
					}
					updateVisuals(
						graphic_data.filter(function (d) {
							return d.year == timepoints[val];
						})
					); //update the chart according to the timepoint value from the slider by filtering on the timepoint
				});

			//call the slider

			d3.select('#slider-simple')
				.append('svg')
				.attr('width', chart_width - 75)
				.attr('height', 100)
				.append('g')
				.attr('transform', 'translate(' + margin.left + ',19)')
				.call(sliderSimple);

			d3.selectAll('.parameter-value text');
		}

		//Set the function of each play, forward and back buttons

		function setButtons() {
			d3.select('#play').on('click', onPlay);

			d3.select('#forward').on('click', fwd_animate);

			d3.select('#back').on('click', rev_animate);
		}

		//Call the functions to set the buttons and make the slider

		setButtons();
		makeSlider();

		//Function to move the slider and retrieve the value from the slider

		function moveSliderToVal() {
			sliderSimple.silentValue(a);
		}

		//Forward animation function for the buttons

		function fwd_animate() {
			// go forwards in time and then back to the beginning once it reaches the end
			if (a < timepoints.length - 1) {
				a = a + 1;
			} else {
				a = 0;
			}
			moveSliderToVal(); //retrieves the value from the slider
			updateVisuals(
				graphic_data.filter(function (d) {
					return d.year == timepoints[a];
				})
			); //update the chart according to the timepoint value from the slider by filtering on the timepoint
		}

		//Backwards animation function for the buttons

		function rev_animate() {
			// go back in time
			if (a > 0) {
				a = a - 1;
			} else {
				a = variables.length - 1;
			}
			moveSliderToVal(); //retrieves the value from the slider
			updateVisuals(
				graphic_data.filter(function (d) {
					return d.year == timepoints[a];
				})
			); //update the chart according to the timepoint value from the slider by filtering on the timepoint
		}

		//Function for clicking on the play button

		function onPlay() {
			fwd_animate(); // don't need a delay bfeore first animation
			animating = setInterval(function () {
				fwd_animate();
			}, 1500); //sets an brief interval before moving the slider on one point

			// replace play control with pause
			d3.select('#play')
				.select('span')
				.classed('glyphicon-play', false)
				.classed('glyphicon-pause', true);

			// switch id/class of play to pause
			d3.select('#play').attr('id', 'pause');
			// change button event from play to pause
			d3.select('#pause').on('click', onPause);
		}

		//Function for clicking on the pause button
		function onPause() {
			// replace pause symbol with play symbol
			d3.select('#pause')
				.select('span')
				.classed('glyphicon-pause', false)
				.classed('glyphicon-play', true);
			d3.select('#pause').attr('id', 'play');
			// make symbols clickable
			setButtons(); //Resets the buttons
			clearInterval(animating); //stops the animation from moving forwards
		}
	}

	//if config drawSliderButtons is set to true, draw the buttons etc

	if (config.essential.drawSliderButtons === true) {
		drawSliderButtons();
	} else {
		d3.selectAll('.flex-container').remove();
	}

	//set up yAxis generator
	let yAxis = d3
		.axisLeft(y)
		.tickSize(-chart_width - 10)
		.tickFormat(d3.format(config.essential.yDisplayFormat));

	//set up xAxis generator
	let xAxis = d3
		.axisBottom(x)
		.tickSize(-height - 10)
		.tickFormat(d3.format(config.essential.xDisplayFormat))
		.ticks(config.optional.xAxisTicks[size]);

	//create svg for chart
	// svg = d3
	// 	.select('#graphic')
	// 	.append('svg')
	// 	.attr('width', chart_width + margin.left + margin.right)
	// 	.attr('height', height + margin.top + margin.bottom)
	// 	.attr('class', 'chart')
	// 	.style('background-color', '#fff')
	// 	.append('g')
	// 	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
	svg = addSvg({
		svgParent: graphic,
		chart_width: chart_width,
		height: height + margin.top + margin.bottom,
		margin: margin
	})

	// Set the scales for the chart - auto calculates the scale from the data or you can select your own in the config
	//X scale
	if (config.essential.xDomain == 'auto') {
		x.domain([
			d3.min(graphic_data, (d) => d.x),
			d3.max(graphic_data, (d) => d.x)
		]);
	} else {
		x.domain(config.essential.xDomain);
	}

	//Y Scale
	if (config.essential.yDomain == 'auto') {
		y.domain([
			d3.min(graphic_data, (d) => d.y),
			d3.max(graphic_data, (d) => d.y)
		]);
	} else {
		y.domain(config.essential.yDomain);
	}

	//R scale for the size of the circle
	if (config.essential.rDomain == 'auto') {
		r.domain([
			d3.min(graphic_data, (d) => d.size),
			d3.max(graphic_data, (d) => d.size)
		]);
		r.range([0, 20]);
	} else {
		r.domain(config.essential.rDomain);
		r.range([0, 20]);
	}

	//Draws the x axis zero line
	svg
		.append('g')
		.attr('transform', 'translate(0,' + height + ')')
		.attr('class', 'x axis')
		.call(xAxis)
		.selectAll('line')
		.each(function (d) {
			if (d == 0) {
				d3.select(this).attr('class', 'zero-line');
			}
		});

	//Draws the y axis zero line
	svg
		.append('g')
		.attr('class', 'y axis')
		.call(yAxis)
		.selectAll('line')
		.each(function (d) {
			if (d == 0) {
				d3.select(this).attr('class', 'zero-line');
			}
		})
		.selectAll('text')
		.call(wrap, margin.left - 10);

	//remove the highlight stroke on mobile
	if (parseInt(graphic.style('width')) < threshold_md) {
		d3.selectAll('.dots').attr('stroke', config.essential.colour_palette);
	}

	// // This does the y-axis label

	// svg
	// 	.append('g')
	// 	.attr('transform', 'translate(0,0)')
	// 	.append('text')
	// 	.attr('x', -margin.left + 2)
	// 	.attr('y', -20)
	// 	.attr('class', 'axis--label')
	// 	.attr('id', 'yAxisLabel')
	// 	.text(config.essential.yAxisLabel)
	// 	.attr('text-anchor', 'start');
	addAxisLabel({
		svgContainer: svg,
		xPosition: -margin.left + 2,
		yPosition: -20,
		text: config.essential.yAxisLabel,
		textAnchor: "start",
		wrapWidth: chart_width
		});

	// // This does the x-axis label

	// svg
	// 	.append('g')
	// 	.attr('transform', 'translate(0,' + height + ')')
	// 	.append('text')
	// 	.attr('x', chart_width)
	// 	.attr('y', 35)
	// 	.attr('class', 'axis--label')
	// 	.text(config.essential.xAxisLabel)
	// 	.attr('text-anchor', 'end');
	addAxisLabel({
		svgContainer: svg,
		xPosition: chart_width,
		yPosition: height + 35,
		text: config.essential.xAxisLabel,
		textAnchor: "end",
		wrapWidth: chart_width
		});

	//Initial draw of the chart with the data filtered on the timeLoad specified

	updateVisuals(
		graphic_data.filter(function (d) {
			return d.year == timeLoad;
		})
	);

	//Function to update the visuals

	function updateVisuals(data) {
		// create a tooltip
		let tooltip = d3
			.selectAll('body')
			.append('div')
			.attr('class', 'tooltip')
			.style('opacity', 0);

		//Set the date format
		let data_format = d3.format('.1f');

		// Three functions that change the tooltip when user hover / move / leave the circle

		let mouseover = function (d) {
			tooltip.style('opacity', 1);
			d3.select(this).style('stroke', 'orange').style('opacity', 1);
		};
		let mousemove = function (event, d) {
			// console.log(d3.pointer(event))
			if (parseInt(graphic.style('width')) > threshold_md) {
				tooltip
					.html(
						'<span style ="color: #206095;font-size: 15px;">' +
						d.group +
						'</span>' +
						'<br><br>' +
						'<span style="font-weight:500; opacity:1">' +
						'Wage growth: ' +
						data_format(d.y) +
						' p.p.' +
						'</span>' +
						'<br>' +
						'<span style="font-weight:500; opacity:1">' +
						'Median hourly pay (£): ' +
						data_format(d.x) +
						'%' +
						'</span>'
					)
					.style(
						'left',
						d3.pointer(event)[0] > chart_width - 200
							? d3.pointer(event)[0] - 200 + 'px'
							: d3.pointer(event)[0] + 25 + 'px'
					)
					.style(
						'top',
						d3.pointer(event)[1] < 25
							? d3.pointer(event)[1] + 150 + 'px'
							: d3.pointer(event)[1] - 20 + 'px'
					);
				// .style("top", (d3.pointer(event)[1]-20) + "px")
			} else {
				tooltip
					.html(
						'<span style ="color: #206095; font-size: 15px;">' +
						d.group +
						'</span>' +
						'<br><br>' +
						'<span style="font-weight:500; opacity:1">' +
						'Wage growth: ' +
						data_format(d.y) +
						' p.p.' +
						'</span>' +
						'<br>' +
						'<span style="font-weight:500; opacity:1">' +
						'Median hourly pay (£): ' +
						data_format(d.x) +
						'%' +
						'</span>'
					)
					.style('right', 5 + 'px')
					.style('top', 0 + 'px');
			}
		};
		let mouseleave = function (d) {
			if (parseInt(graphic.style('width')) > threshold_md) {
				tooltip.style('opacity', 0);
				d3.select(this)
					.style('opacity', 0.75)
					.style('stroke', (d) =>
						d.highlight == 0 ? config.essential.colour_palette : '#222222'
					);
			} else {
				tooltip.style('opacity', 0);
				d3.select(this)
					.style('opacity', 0.75)
					.style('stroke', config.essential.colour_palette);
			}
		};

		//draw the circles with transition if slider is drawn

		let t = d3.transition().duration(750).ease(d3.easeCircle);

		svg
			.selectAll('circle')
			.data(data)
			.join('circle')
			.merge(d3.selectAll('circle'))
			.attr('class', 'dots')
			.transition(t)
			.attr('cx', (d) => x(d.x))
			.attr('cy', (d) => y(d.y))
			.attr('r', (d) => r(d.size))
			.attr('fill', config.essential.colour_palette)
			.attr('opacity', 0.75)
			.attr('stroke-width', (d) => (d.highlight == 0 ? '1px' : '1.5px'))
			.attr('stroke', (d) =>
				d.highlight == 0 ? config.essential.colour_palette : '#222222'
			);

		d3.selectAll('.dots')
			.on('mouseover', mouseover)
			.on('mousemove', mousemove)
			.on('mouseleave', mouseleave)
			.on('click', function (event, d) {
				d3.pointer(event)[0];
			});

		//draw legend on desktop

		function drawLegend() {
			d3.selectAll('.legend_text').remove(); //Remove the legend to redraw

			//pull in the legend data from the config

			let legendData = d3.zip(
				config.essential.legendLabels,
				config.essential.legendRadius,
				config.essential.legendCX
			);

			//draw legend for medium and large screens

			if (parseInt(graphic.style('width')) > threshold_sm) {
				//append circles

				svg
					.selectAll('legend')
					.data(legendData)
					.join('circle')
					.attr('class', 'legend')
					.attr('cx', (d, i) => legendData[i][2])
					.attr('cy', -(margin.top * 0.66))
					.attr('r', (d, i) => r(legendData[i][1]))
					.attr('fill', config.essential.colour_palette)
					.attr('opacity', 0.75)
					.attr('stroke-width', '1px')
					.attr('stroke', config.essential.colour_palette);

				//append text

				svg
					.selectAll('legend_text')
					.data(legendData)
					.join('text')
					.attr('class', 'legend_text')
					.attr('x', (d, i) => legendData[i][2] + r(legendData[i][1]) + 5)
					.attr('y', -(margin.top * 0.66) + 5)
					.text((d, i) => legendData[i][0])
					.style('font-size', '14px')
					.call(wrap, 150);
			} //end if
			//Draw legend for mobile
			else {
				//append circles

				svg
					.selectAll('legend')
					.data(legendData)
					.join('circle')
					.attr('class', 'legend')
					.attr('cx', -10)
					.attr('cy', (d, i) => -margin.top + 20 + r(legendData[i][1] * 5)) //may need to tweak these values to get the legend to sit correctly
					.attr('r', (d, i) => r(legendData[i][1]))
					.attr('fill', config.essential.colour_palette)
					.attr('opacity', 0.75)
					.attr('stroke-width', '1px')
					.attr('stroke', config.essential.colour_palette);

				//append text

				svg
					.selectAll('legend_text')
					.data(legendData)
					.join('text')
					.attr('class', 'legend_text')
					.attr('x', (d, i) => legendData[0][2] + r(legendData[i][1]) + 20)
					.attr('y', (d, i) => -margin.top + 20 + r(legendData[i][1] * 5) + 5) //may need to tweak these values to get the legend to sit correctly
					.text((d, i) => legendData[i][0])
					.style('font-size', '14px')
					.call(wrap, 150);
			} //end else
		} //ends drawLegend function

		drawLegend();

		//if screen is larger than medium threshold and highlight is true in config, add the labels

		if (
			(parseInt(graphic.style('width')) > threshold_md &&
				config.essential.highlight === true) === true
		) {
			drawHighlight();
		} //end if for datalabels

		//if you have lots of labels, you can choose whether you want them to sit above, below or in the middle of the circle using the label_y column in data.csv
		//if you have lots of labels, you can choose whether you want them to start or end on the circle using the label_anchor column in data.csv

		function drawHighlight() {
			// d3.selectAll('.dataLabels').remove()
			svg
				.selectAll('text.dataLabels')
				.data(data)
				.join('text')
				.merge(d3.selectAll('text.dataLabels'))
				.transition(t)
				.attr('class', 'dataLabels')
				.attr('id', function (d, i) {
					return d.group;
				})
				.style('font-size', '14px')
				.style('font-weight', 500)
				.attr('x', function (d) {
					if (d.label_y == 'middle' && d.label_anchor == 'start') {
						return x(d.x) + r(d.size) + 6;
					} // shifts to the side of the circle when text anchor is middle
					else if (d.label_y == 'middle' && d.label_anchor == 'end') {
						return x(d.x) - r(d.size) - 6;
					} // shifts to the other side of the circle when text anchor is middle
					else {
						return x(d.x);
					}
				})
				// .attr('y',function(d) { return (y(d.y) < (topYTick) ? (y(d.y)+r(d.size)+15) : (y(d.y)-r(d.size))-2 )})
				.attr('y', function (d) {
					if (d.label_y == 'top') {
						return y(d.y) - r(d.size) - 6;
					} else if (d.label_y == 'bottom') {
						return y(d.y) + r(d.size) + 15;
					} else if (d.label_y == 'middle') {
						return y(d.y);
					} else {
						return y(d.y) - r(d.size) - 2;
					}
				})
				.style('text-anchor', function (d) {
					if (d.label_anchor == 'start') {
						return d.label_anchor;
					} else if (d.label_anchor == 'middle') {
						return d.label_anchor;
					} else if (d.label_anchor == 'end') {
						return d.label_anchor;
					} else {
						return 'start';
					}
				})
				.text((d) => (d.highlight == 0 ? null : d.group));
		}
	} //end updateVisuals function

	//create link to source
	d3.select('#source').text('Source: ' + config.essential.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
} ///END DRAW GRAPHIC

// function wrap(
// 	text,
// 	width,
// 	dyAdjust,
// 	lineHeightEms,
// 	lineHeightSquishFactor,
// 	splitOnHyphen,
// 	centreVertically
// ) {
// 	// Use default values for the last three parameters if values are not provided.
// 	if (!lineHeightEms) lineHeightEms = 1.15;
// 	if (!lineHeightSquishFactor) lineHeightSquishFactor = 1;
// 	if (splitOnHyphen == null) splitOnHyphen = true;
// 	if (centreVertically == null) centreVertically = true;

// 	text.each(function () {
// 		let text = d3.select(this),
// 			x = text.attr('x'),
// 			y = text.attr('y');

// 		let words = [];
// 		text
// 			.text()
// 			.split(/\s+/)
// 			.forEach(function (w) {
// 				if (splitOnHyphen) {
// 					let subWords = w.split('-');
// 					for (let i = 0; i < subWords.length - 1; i++)
// 						words.push(subWords[i] + '-');
// 					words.push(subWords[subWords.length - 1] + ' ');
// 				} else {
// 					words.push(w + ' ');
// 				}
// 			});

// 		text.text(null); // Empty the text element

// 		// `tspan` is the tspan element that is currently being added to
// 		let tspan = text.append('tspan');

// 		let line = ''; // The current value of the line
// 		let prevLine = ''; // The value of the line before the last word (or sub-word) was added
// 		let nWordsInLine = 0; // Number of words in the line
// 		for (let i = 0; i < words.length; i++) {
// 			let word = words[i];
// 			prevLine = line;
// 			line = line + word;
// 			++nWordsInLine;
// 			tspan.text(line.trim());
// 			if (tspan.node().getComputedTextLength() > width && nWordsInLine > 1) {
// 				// The tspan is too long, and it contains more than one word.
// 				// Remove the last word and add it to a new tspan.
// 				tspan.text(prevLine.trim());
// 				prevLine = '';
// 				line = word;
// 				nWordsInLine = 1;
// 				tspan = text.append('tspan').text(word.trim());
// 			}
// 		}

// 		let tspans = text.selectAll('tspan');

// 		let h = lineHeightEms;
// 		// Reduce the line height a bit if there are more than 2 lines.
// 		if (tspans.size() > 2)
// 			for (let i = 0; i < tspans.size(); i++) h *= lineHeightSquishFactor;

// 		tspans.each(function (d, i) {
// 			// Calculate the y offset (dy) for each tspan so that the vertical centre
// 			// of the tspans roughly aligns with the text element's y position.
// 			let dy = i * h;

// 			if (centreVertically) dy -= ((tspans.size() - 1) * h) / 2;
// 			d3.select(this)
// 				.attr('y', y)
// 				.attr('x', x)
// 				.attr('dy', dy + 'em');
// 		});
// 	});
// } //end wrap

d3.csv(config.essential.graphic_data_url).then((data) => {
	//load chart data
	data.forEach(function (d) {
		d.x = +d.x;
		d.y = +d.y;
		d.size = +d.size;
		d.highlight = +d.highlight;
	});

	graphic_data = data;
	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
