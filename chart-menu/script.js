let grid = d3.select('#grid')
let charts = ["Area stacked", "Area stacked small multiple", "Bar chart Split", "Bar chart horizontal", "Bar chart horizontal with dropdrown", "Bar chart horizontal small multiple", "Bar chart horizontal with reference small multiple", "Bar chart horizontal small multiple with colour", "Bar chart horizontal clustered", "Bar chart horizontal stacked", "Bar chart horizontal stacked with tooltip", "Bar chart horizontal stacked sm", "Bar chart horizontal stacked grouped", "Bar chart horizontal stacked clustered", "Bar chart horizontal grouped", "Bar chart horizontal grouped clustered", "Bar chart horizontal stacked clustered grouped", "Bubble plot animated", "Comet plot", "Column chart", "Column chart small multiple", "Column chart stacked", "Column chart stacked with line", "Column chart stacked sm", "Dot plot", "Dot plot with confidence intervals sm", "Heatmap", "Heatmap by column", "Line chart", "Line chart with dropdown", "Line chart small multiple", "A line chart with area shading", "Population pyramid", "Population pyramid with comparison toggle", "Population pyramid with a static comparison", "Population pyramid with dropdown", "Population pyramid with dropdown and interactive comparison", "Range plot", "Scatter plot", "Scatter plot small multiple", "Scatter plot animated", "Simple map", "Map with line chart showing change over time", "Multiple maps", "Multimap with simple bar chart", "Multimap with vertical scale", "Simple map with beeswarm", "Simple map with stacked bar chart", "Mutiple characteristics map", "Side by side map", "Hexmap", "LSOA house price map", "MSOA deaths map", "MSOA simple map", "MSOA multimap"];
let urls = ["https://onsvisual.github.io/Charts/area-stacked/", "https://onsvisual.github.io/Charts/area-stacked-sm/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-split/", "https://onsvisual.github.io/Charts/bar-chart-horizontal/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-with-dropdown/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-sm/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-with-reference-sm/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-sm-colour/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-clustered/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-stacked/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-stacked-with-tooltip/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-stacked-sm/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-stacked-grouped/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-stacked-clustered/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-grouped/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-grouped-clustered/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-stacked-clustered-grouped/", "https://onsvisual.github.io/Charts/bubble-chart-animated/", "https://onsvisual.github.io/Charts/comet-plot/", "https://onsvisual.github.io/Charts/column-chart/", "https://onsvisual.github.io/Charts/column-chart-sm/", "https://onsvisual.github.io/Charts/column-chart-stacked/", "https://onsvisual.github.io/Charts/column-chart-stacked-with-line/", "https://onsvisual.github.io/Charts/column-chart-stacked-sm/", "https://onsvisual.github.io/Charts/dot-plot/", "https://onsvisual.github.io/Charts/dot-plot-with-ci-sm/", "https://onsvisual.github.io/Charts/heatmap/", "https://onsvisual.github.io/Charts/heatmap-per-column/", "https://onsvisual.github.io/Charts/line-chart/", "https://onsvisual.github.io/Charts/area-stacked/", "https://onsvisual.github.io/Charts/line-chart-sm/", "https://onsvisual.github.io/Charts/line-chart-with-area/", "https://onsvisual.github.io/Charts/population-pyramid-static/", "https://onsvisual.github.io/Charts/population-pyramid-with-comparison-toggle/", "https://onsvisual.github.io/Charts/population-pyramid-static-with-comparison/", "https://onsvisual.github.io/Charts/population-pyramid-with-dropdown/", "https://onsvisual.github.io/Charts/population-pyramid-with-dropdown-and-interactive-comparison/", "https://onsvisual.github.io/Charts/range-plot/", "https://onsvisual.github.io/Charts/scatter-plot/", "https://onsvisual.github.io/Charts/scatter-plot-sm/", "https://onsvisual.github.io/Charts/scatter-plot-animated/", "https://onsvisual.github.io/maptemplates/simplemap/", "https://onsvisual.github.io/maptemplates/changeovertime/", "https://onsvisual.github.io/maptemplates/multimap/", "https://onsvisual.github.io/maptemplates/multimap_simplebar/", "https://onsvisual.github.io/maptemplates/multimap_vertical-scale/", "https://onsvisual.github.io/maptemplates/simplemap_beeswarm/", "https://onsvisual.github.io/maptemplates/simplemap_stackedbar/", "https://onsvisual.github.io/maptemplates/multiple_characteristics_map/", "https://onsvisual.github.io/maptemplates/Side-by-side-map/", "https://onsvisual.github.io/maptemplates/hexmap/", "https://onsvisual.github.io/maptemplates/lsoa-small-area/houseprice/", "https://onsvisual.github.io/maptemplates/msoa/covid-death-map/", "https://onsvisual.github.io/maptemplates/msoa/simplemap/", "https://onsvisual.github.io/maptemplates/msoa/multimap/"];
let url = "https://onsvisual.github.io/Charts/";

/*GET SCREENSHOT THUMBNAIL*/

function analyticsEvent(props) {
    if (window.dataLayer) window.dataLayer.push(props);
  }

function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

function downloadImage(el) {
	console.log(el);
	let content = document.querySelector('#'+el).firstChild.contentWindow.document.body.innerHTML;
	let heading=document.createElement("h3")
	let text = document.querySelector('#title'+el.replace("chart","")).innerHTML;
	heading.innerText=text;

	// console.log(content)
	// content.id="chart";
	// document.body.appendChild(content)
	let chart=content


	html2canvas(chart, { scale: 2 })
		.then((canvas) => {
			const dataURL = canvas.toDataURL('image/png', 1.0)
			console.log(dataURL)
			const file = dataURLtoFile(dataURL)
			return dataURL
		})
		.then((url) => {
			console.log(url)
			const a = document.createElement('a')
			a.style.display = 'none'
			a.href = url
			a.download = `${text}.png`
			document.body.appendChild(a)
			a.click()
			window.URL.revokeObjectURL(url)
		})
		.catch((e) => alert('sorry, the download was unsuccessful: ' + e + " (" + chart + ")"))
}

/*
  <button
    class="btn-link"
    on:click={function () {
      downloadImage(rows.title.replace(/\s/g, '').replace('#', '') + 'chart')
    }}>
    {'Save as image (PNG <100KB)'}
  </button> |
*/


for (let i = 0; i < charts.length; i++) {
	grid.append('div').attr('id', 'container' + i).attr('class', 'container')
	d3.select('#container' + i).append('div').attr('id', 'title' + i).attr('class', 'title-div').text(charts[i])
	d3.select('#container' + i).append('button').attr('type', 'button').attr('id', 'btn' + i).text('View full chart')/*.attr('class', 'reveal')*/
	d3.select('#container' + i).append('button').attr('type', 'button').attr('id', 'img' + i).text('Get thumbnail to paste in draft')

	d3.select('#container' + i).append('div').attr('id', 'chart' + i).attr('class', 'chart')
	d3.select('#container' + i).append('div').attr('id', 'data' + charts[i].replace(/\s/g, "")).html(`<a href=${urls[i]}data.csv download>Download the data csv file</a>`)

	d3.select('#container' + i).append('div').attr('id', 'modal' + i).attr('class', 'modal').style('display', 'none')
		.append('div').attr('class', 'modal-content').html(`<span id='close${i}' class="close">&times;</span>
    <div class='title-div'>${charts[i]}</div>
	<div id='modal-chart${i}'>Chart ${i}</div>
	`)

	let modal = d3.select('#modal' + i)
	let btn = d3.select('#btn' + i)
	let span = d3.select('#close' + i)
	let imgBtn=d3.select('#img' + i)
	// When the user clicks on the button, open the modal
	btn.on('click', function () {
		// modal.style.display = "block";
		modal.style('display', 'block')
		let pymParent1 = new pym.Parent(`modal-chart${i}`, `${urls[i]}`, {})
	})

	imgBtn.on('click', function (e) {
		console.log(e.target.nextSibling.id);
		downloadImage(e.target.nextSibling.id)
	})


	// When the user clicks on <span> (x), close the modal
	span.on('click', function () {
		modal.style('display', 'none')
	})

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function (event) {
		console.log(event)
		if (event.target !== `div.modal-content`) {
			modal.style('display', 'none')
		}
	}

	let pymParent = new pym.Parent(`chart${i}`, `${urls[i]}`, {})


}//End the for loop

//Some manual adjustments for specific charts
d3.select('#dataPopulationpyramidwithcomparisontoggle').append('p').html(`<a href=${urls[33]}comparison.csv download>Download the comparison data csv file</a>`)
d3.select('#dataPopulationpyramidwithcomparisontoggle').append('p').html(`<a href=${urls[33]}comparison-time.csv download>Download the comparison time data csv file</a>`)
d3.select('#dataPopulationpyramidwithastaticcomparison').append('p').html(`<a href=${urls[34]}comparison.csv download>Download the comparison data csv file</a>`)
d3.select('#dataPopulationpyramidwithdropdown').append('p').html(`<a href=${urls[35]}comparison.csv download>Download the comparison data csv file</a>`)
d3.select('#dataPopulationpyramidwithdropdownandinteractivecomparison').append('p').html(`<a href=${urls[36]}comparison.csv download>Download the comparison data csv file</a>`)
d3.select('#dataSimplemap').html(`<a href=${urls[41]}data/data.csv download>Download the data csv file</a>`)
d3.select('#dataMapwithlinechartshowingchangeovertime').html(`<a href=${urls[42]}data/data0.csv download>Download the data csv file</a>`)
d3.select('#dataMultiplemaps').html(`<a href=${urls[43]}data/data.csv download>Download the data csv file</a>`)
d3.select('#dataMultimapwithsimplebarchart').html(`<a href=${urls[44]}data/ttw_map1.csv download>Download the data csv file</a>`)
//Need to continue these, starting with Multimap with vertical scale



d3.selectAll('iframe').attr('loading', 'lazy')