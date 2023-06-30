# Charts

The official repository of all publication ready ONS charts. (WARNING: This repository is under construction)

## Guide to updating and placing an initial commit for a chart

- All missing charts can be found in the issues section of the repository. They will have the following format, "[descriptive chart name]: Initial Commit".

- If this issue does not have an active branch and you would like to update and upload the chart please create a branch and you will be responsible for updating and making a pull request for the chart.

### Initial chart commit checklist

- All initial commits of charts must must follow [JavaScript ES6](https://www.w3schools.com/js/js_es6.asp) standards and use [D3 v6](https://observablehq.com/@d3/d3v6-migration-guide) or higher.
- Before making additions to the `lib` folder please do check the [ONS CDN](https://github.com/ONSdigital/cdn.ons.gov.uk-vendor) as your addition to the lib folder may already to uploaded.

### Charts uploaded so far

| Chart Name                                                  | Description                                                                   | Preview                                                                                                 | Style Check | Code Check | Codebase Update |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------- | ---------- | --------------- |
| Area stacked                                                | static Area Chart                                                             | [View](https://onsvisual.github.io/Charts/stacked-area/)                                                | ❌           | ❌          | ✅               |
| Area stacked small multiple                                 | A static small multiple area chart                                            | [View](https://onsvisual.github.io/Charts/stacked-area-sm/)                                             | ❌           | ❌          | ✅               |
| Bar chart Split                                             | A static split horizontal bar bar chart                                       | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal-split/)                                  | ❌           | ❌          | ✅               |
| Bar chart horizontal                                        | A static horizontal bar chart with data labels                                | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal/)                                        | ❌           | ❌          | ✅               |
| Bar chart horizontal with dropdrown                         | A dynamic horizontal bar chart with data labels                               | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal-with-dropdown/)                          | ❌           | ❌          | ✅               |
| Bar chart horizontal small multiple                         | A static horizontal bar chart with data labels                                | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal-stacked-sm/)                             | ❌           | ❌          | ✅               |
| Bar chart horizontal small multiple with colour             | A static bar chart with colour for each chart                                 | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal-sm-colour/)                             | ❌           | ❌          | ✅               |
| Bar chart horizontal stacked                                | A static stacked horizontal bar chart                                         | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal-stacked-sm/)                             | ❌           | ❌          | ✅               |
| Bar chart horizontal stacked grouped                        |                                                                               | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal-stacked-grouped/)                        | ❌           | ❌          | ✅               |
| Bar chart horizontal stacked clustered                      |                                                                               | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal-stacked-clustered/)                      | ❌           | ❌          | ✅               |
| Bar chart horizontal grouped clustered                      |                                                                               | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal-grouped-clustered/)                      | ❌           | ❌          | ✅               |
| Bar chart horizontal stacked clustered grouped              |                                                                               | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal-stacked-clustered-grouped/)              | ❌           | ❌          | ✅               |
| Bubble plot animated                                        | Bubble plot showing change over time                                          | [View](https://onsvisual.github.io/Charts/bubble-chart-animated)                                        | ❌           | ❌          | ✅               |
| Comet plot                                                  | A static comet plot                                                           | [View](https://onsvisual.github.io/Charts/comet-plot/)                                                  | ❌           | ❌          | ✅               |
| Column Chart                                                | A simple column chart with ordinal scale on the x-axis                        | [View](https://onsvisual.github.io/Charts/column-chart/)                                                | ❌           | ❌          | ✅               |
| Dot plot                                                    | A static dot plot                                                             | [View](https://onsvisual.github.io/Charts/dot-plot/)                                                    | ❌           | ❌          | ✅               |
| Heatmap by column                                           |                                                                               | [View](https://onsvisual.github.io/Charts/heatmap/)                                                     | ❌           | ❌          | ✅               |
| Line chart                                                  | A static line chart                                                           | [View](https://onsvisual.github.io/Charts/line-chart/)                                                  | ❌           | ❌          | ✅               |
| Line chart with dropdown                                    | A static line chart with dropdown                                             | [❌]()                                                                                                   | ❌           | ❌          | ❌               |
| Line chart small multiple                                   | A simple small multiple line chart                                            | [❌]()                                                                                                   | ❌           | ❌          | ❌               |
| A line chart with area shading                              | A simple small multiple line chart with area shading for confidence intervals | [❌]()                                                                                                   | ❌           | ❌          | ❌               |
| Population pyramid                                          | A static population pyramid                                                   | [View](https://onsvisual.github.io/Charts/population-pyramid-static/)                                   | ❌           | ❌          | ✅               |
| Population pyramid with comparison toggle                   | A static population pyramid with comparison toggle                            | [View](https://onsvisual.github.io/Charts/population-pyramid-with-comparison-toggle/)                   | ❌           | ❌          | ✅               |
| Population pyramid with a static comparison                 |                                                                               | [View](https://onsvisual.github.io/Charts/population-pyramid-static-with-comparison/)                   | ❌           | ❌          | ✅               |
| Population pyramid with dropdown                            |                                                                               | [View](https://onsvisual.github.io/Charts/population-pyramid-with-dropdown/)                            | ❌           | ❌          | ✅               |
| Population pyramid with dropdown and interactive comparison |                                                                               | [View](https://onsvisual.github.io/Charts/population-pyramid-with-dropdown-and-interactive-comparison/) | ❌           | ❌          | ✅               |
| Range plot                                                  |                                                                               | [View](https://onsvisual.github.io/Charts/range-plot/)                                                  | ❌           | ❌          | ✅               |
| Scatter plot                                                | A simple scatter plot with colour options for grouped data                    | [View](https://onsvisual.github.io/Charts/scatter-plot/)                                                | ❌           | ❌          | ✅               |
| Scatter plot animated                                       | Scatter plot showing change over time                                         | [View](https://onsvisual.github.io/Charts/scatter-plot-animated/)                                       | ❌           | ❌          | ❌               |