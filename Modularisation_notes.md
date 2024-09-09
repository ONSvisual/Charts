# Modularisation

## Method 

In index.html add `type="module"` to the script tag loading the script.js file – this loads the file as a module, which then allows for static imports. No need to load helpers.js from this file. 

A separate helpers.js file is now in the lib folder, this contains functions with the export keyword which can then be imported by script.js. 

Import the functions that you need at the start of each script file, e.g. 

`import { initialise, wrap, addSvg, calculateChartWidth, addDataLabels, addChartTitleLabel, addXAxisLabel } from "../lib/helpers.js"; `

As script.js is now a module it is interpreted in strict mode. We need to fix some of the common errors in our scripts that are overlooked when not in strict mode. The most common error is using undeclared variables, which will likely throw a ReferenceError. Fix these by declaring them at the start of the script e.g. 

`let graphic_data, size, svg; `


Replace any code that is covered by a function in helpers.js, e.g. 

    svg 
    .append('g') 
    .attr('transform', `translate(0, ${height})`) 
    .append('text') 
    .attr('x', chart_width) 
    .attr('y', 35) 
    .attr('class', 'axis--label') 
    .text(config.essential.xAxisLabel) 
    .attr('text-anchor', 'end'); 

Becomes: 

    addXAxisLabel({ 
    svgContainer: svg, 
    xPosition: chart_width, 
    yPosition: height + 35, 
    text: config.essential.xAxisLabel, 
    wrapWidth: chart_width 
    }); 

## Charts that have been modularised so far

Please add to this list any that you have done.

- Bar-chart-horizontal
- Bar-chart-horizontal-with-reference-sm