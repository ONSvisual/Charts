let grid = d3.select("#grid");
// let charts = ["Area stacked", "Area stacked small multiple", "Bar chart Split", "Bar chart horizontal", "Bar chart horizontal with dropdrown", "Bar chart horizontal small multiple", "Bar chart horizontal with reference small multiple", "Bar chart horizontal small multiple with colour", "Bar chart horizontal clustered", "Bar chart horizontal stacked", "Bar chart horizontal stacked with tooltip", "Bar chart horizontal stacked small multiple", "Bar chart horizontal stacked grouped", "Bar chart horizontal stacked clustered", "Bar chart horizontal grouped", "Bar chart horizontal grouped clustered", "Bar chart horizontal stacked clustered grouped", "Bubble plot animated", "Comet plot", "Column chart", "Column chart small multiple", "Column chart small multiple with confidence intervals", "Column chart stacked", "Column chart stacked with line", "Column chart stacked small multiple", "Dot plot", "Dot plot with confidence intervals small multiple", "Heatmap", "Heatmap by column", "Line chart", "Line chart with dropdown", "Line chart small multiple", "A line chart with area shading", "Population pyramid", "Population pyramid with comparison toggle", "Population pyramid with a static comparison", "Population pyramid with dropdown", "Population pyramid with dropdown and interactive comparison", "Range plot", "Scatter plot", "Scatter plot small multiple", "Scatter plot animated", "Simple map", "Map with line chart showing change over time", "Multiple maps", "Multimap with simple bar chart", "Multimap with vertical scale", "Simple map with beeswarm", "Simple map with stacked bar chart", "Mutiple characteristics map", "Side by side map", "Hexmap", "LSOA house price map", "MSOA deaths map", "MSOA simple map", "MSOA multimap"];
// let urls = ["https://onsvisual.github.io/Charts/area-stacked/", "https://onsvisual.github.io/Charts/area-stacked-sm/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-split/", "https://onsvisual.github.io/Charts/bar-chart-horizontal/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-with-dropdown/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-sm/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-with-reference-sm/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-sm-colour/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-clustered/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-stacked/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-stacked-with-tooltip/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-stacked-sm/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-stacked-grouped/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-stacked-clustered/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-grouped/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-grouped-clustered/", "https://onsvisual.github.io/Charts/bar-chart-horizontal-stacked-clustered-grouped/", "https://onsvisual.github.io/Charts/bubble-chart-animated/", "https://onsvisual.github.io/Charts/comet-plot/", "https://onsvisual.github.io/Charts/column-chart/", "https://onsvisual.github.io/Charts/column-chart-sm/", "https://onsvisual.github.io/Charts/column-chart-stacked/", "https://onsvisual.github.io/Charts/column-chart-stacked-with-line/", "https://onsvisual.github.io/Charts/column-chart-stacked-sm/", "https://onsvisual.github.io/Charts/dot-plot/", "https://onsvisual.github.io/Charts/dot-plot-with-ci-sm/", "https://onsvisual.github.io/Charts/heatmap/", "https://onsvisual.github.io/Charts/heatmap-per-column/", "https://onsvisual.github.io/Charts/line-chart/", "https://onsvisual.github.io/Charts/area-stacked/", "https://onsvisual.github.io/Charts/line-chart-sm/", "https://onsvisual.github.io/Charts/line-chart-with-area/", "https://onsvisual.github.io/Charts/population-pyramid-static/", "https://onsvisual.github.io/Charts/population-pyramid-with-comparison-toggle/", "https://onsvisual.github.io/Charts/population-pyramid-static-with-comparison/", "https://onsvisual.github.io/Charts/population-pyramid-with-dropdown/", "https://onsvisual.github.io/Charts/population-pyramid-with-dropdown-and-interactive-comparison/", "https://onsvisual.github.io/Charts/range-plot/", "https://onsvisual.github.io/Charts/scatter-plot/", "https://onsvisual.github.io/Charts/scatter-plot-sm/", "https://onsvisual.github.io/Charts/scatter-plot-animated/", "https://onsvisual.github.io/maptemplates/simplemap/", "https://onsvisual.github.io/maptemplates/changeovertime/", "https://onsvisual.github.io/maptemplates/multimap/", "https://onsvisual.github.io/maptemplates/multimap_simplebar/", "https://onsvisual.github.io/maptemplates/multimap_vertical-scale/", "https://onsvisual.github.io/maptemplates/simplemap_beeswarm/", "https://onsvisual.github.io/maptemplates/simplemap_stackedbar/", "https://onsvisual.github.io/maptemplates/multiple_characteristics_map/", "https://onsvisual.github.io/maptemplates/Side-by-side-map/", "https://onsvisual.github.io/maptemplates/hexmap/", "https://onsvisual.github.io/maptemplates/lsoa-small-area/houseprice/", "https://onsvisual.github.io/maptemplates/msoa/covid-death-map/", "https://onsvisual.github.io/maptemplates/msoa/simplemap/", "https://onsvisual.github.io/maptemplates/msoa/multimap/"];
let url = "https://onsvisual.github.io/Charts/";
let list = d3.select("#list");
let charts = [
  "Area stacked small multiple",
  "Bar chart Split",
  "Bar chart small multiple",
  "Bar chart horizontal with reference small multiple",
  "Bar chart horizontal stacked small multiple",
  "Bar chart horizontal stacked group",
  "Bar chart horizontal grouped",
  "Comet plot",
  "Column small multiple",
  "Colum chart stacked small multiple",
  "Dotplot",
  "Heatmap",
  "Heatmap by column",
  "Line chart small multiple",
  "A line chart with area shaded",
  "Population pyramid",
  "Population pyramid with toggle",
  "Population pyramid with a static comparison",
  "Population pyramid with dropdown and interactive comparison",
  "Range plot",
  "Simple map",
  "other",
];
let urls = [
  "https://onsvisual.github.io/Charts/area-stacked-sm/",
  "https://onsvisual.github.io/Charts/split-bar-chart/",
  "https://onsvisual.github.io/Charts/bar-chart-horizontal-sm/",
  "https://onsvisual.github.io/Charts/bar-chart-horizontal-with-reference-sm/",
  "https://onsvisual.github.io/Charts/bar-chart-horizontal-stacked-sm/",
  "https://onsvisual.github.io/Charts/bar-chart-horizontal-stacked-grouped/",
  "https://onsvisual.github.io/Charts/bar-chart-horizontal-grouped/",
  "https://onsvisual.github.io/Charts/comet-plot/",
  "https://onsvisual.github.io/Charts/column-chart-sm/",
  "https://onsvisual.github.io/Charts/column-chart-stacked-sm/",
  "https://onsvisual.github.io/Charts/dot-plot/",
  "https://onsvisual.github.io/Charts/heatmap/",
  "https://onsvisual.github.io/Charts/heatmap-per-column/",
  "https://onsvisual.github.io/Charts/line-chart-sm/",
  "https://onsvisual.github.io/Charts/line-chart-with-area/",
  "https://onsvisual.github.io/Charts/population-pyramid-static/",
  "https://onsvisual.github.io/Charts/population-pyramid-with-comparison-toggle/",
  "https://onsvisual.github.io/Charts/population-pyramid-static-with-comparison/",
  "https://onsvisual.github.io/Charts/population-pyramid-with-dropdown-and-interactive-comparison/",
  "https://onsvisual.github.io/Charts/range-plot/",
  "https://onsvisual.github.io/maptemplates/simplemap/",
  "other",
];

/* SLOW SCROLL (ON SOME BROWSERS) */

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

/*GET SCREENSHOT THUMBNAIL*/

function analyticsEvent(props) {
  if (window.dataLayer) window.dataLayer.push(props);
}

function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

function downloadImage(el) {
  console.log(el);
  let content = el.contentWindow.document.body;
  // let heading=document.createElement("h3")
  //console.log(text, body);
  // heading.innerText=text;

  // console.log(content)
  // content.id="chart";
  // document.body.appendChild(content)
  let chart = content;

  html2canvas(chart, { scale: 4 }) //SCALE TO MAKE SMALLER
    .then((canvas) => {
      // canvas.toBlob(function(blob) {
      // 	const item = new ClipboardItem({ "image/png": blob });
      // 	navigator.clipboard.write([item]).then(function(x) {
      // 		alert("Image copied to clipboard");
      // 	  });
      // });

      const dataURL = canvas.toDataURL("image/png", 1.0);
      console.log(dataURL);
      const file = dataURLtoFile(dataURL);

      return dataURL;
    })
    .then((url) => {
      console.log(url);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `chart.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch((e) =>
      alert("sorry, the download was unsuccessful: " + e + " (" + chart + ")")
    );
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

function filterSelection(c) {
  var x, i;
  x = document.getElementsByClassName("container");
  if (c == "all") c = "";
  // Add the "show" class (display:block) to the filtered elements, and remove the "show" class from the elements that are not selected
  for (i = 0; i < x.length; i++) {
    w3RemoveClass(x[i], "show");
    if (x[i].className.indexOf(c) > -1) w3AddClass(x[i], "show");
  }
}

// Show filtered elements
function w3AddClass(element, name) {
  // console.log(element)
  var i, arr1, arr2;
  arr1 = element.className.split(" ");
  arr2 = name.split(" ");
  for (i = 0; i < arr2.length; i++) {
    if (arr1.indexOf(arr2[i]) == -1) {
      element.className += " " + arr2[i];
    }
  }
}

// Hide elements that are not selected
function w3RemoveClass(element, name) {
  var i, arr1, arr2;
  arr1 = element.className.split(" ");
  arr2 = name.split(" ");
  for (i = 0; i < arr2.length; i++) {
    while (arr1.indexOf(arr2[i]) > -1) {
      arr1.splice(arr1.indexOf(arr2[i]), 1);
    }
  }
  element.className = arr1.join(" ");
}

// Add active class to the current control button (highlight it)
var btnContainer = document.getElementById("myBtnContainer");
var btns = btnContainer.getElementsByClassName("btn");
for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function () {
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";
  });
}

function drawGraphic() {
  console.log(graphic_data);

  for (let i = 0; i < charts.length; i++) {
    console.log(Object.entries(graphic_data[i]).filter((d) => d[1] == "TRUE"));
    // console.log(Object.entries(graphic_data))

    let tags = Object.entries(graphic_data[i]).filter((d) => d[1] == "TRUE");

    grid
      .append("div")
      .attr("id", "container" + i)
      .attr("class", "container");
    d3.select("#container" + i)
      .append("div")
      .attr("id", "title" + i)
      .attr("class", "title-div")
      .text(charts[i]);

    tags.forEach((d) => d3.select("#container" + i).classed(d[0], true));

    //d3.select('#container' + i).append('button').attr('type', 'button').attr('id', 'img' + i).text('Get thumbnail to paste in draft')

    d3.select("#container" + i)
      .append("div")
      .attr("id", "chart" + i)
      .attr("class", "chart");
    d3.select("#container" + i).append("br");
    d3.select("#container" + i)
      .append("div")
      .attr("id", "data" + charts[i].replace(/\s/g, ""))
      .html(
        `<a href=${urls[i]}data.csv download>Download the data csv file</a>`
      );
    d3.select("#container" + i).append("br");
    d3.select("#container" + i)
      .append("button")
      .attr("type", "button")
      .attr("id", "btn" + i)
      .text("View full chart"); /*.attr('class', 'reveal')*/
    d3
      .select("#container" + i)
      .append("div")
      .attr("id", "modal" + i)
      .attr("class", "modal")
      .style("display", "none")
      .append("div")
      .attr("class", "modal-content")
      .html(`<span id='close${i}' class="close">&times;</span>
    <p>Take a screenshot of this to use as a placeholder in your draft publication</p><br>
	<div class='title-div'>${charts[i]}</div>
	
	<div id='modal-chart${i}'>Chart ${i}
	</div>
	`);

    let modal = d3.select("#modal" + i);
    let btn = d3.select("#btn" + i);
    let span = d3.select("#close" + i);
    let imgBtn = d3.select("#img" + i);
    // When the user clicks on the button, open the modal
    btn.on("click", function () {
      console.log("clicked");
      // modal.style.display = "block";
      modal.style("display", "block");
      let pymParent1 = new pym.Parent(`modal-chart${i}`, `${urls[i]}`, {});
    });

    imgBtn.on("click", function (e) {
      console.log(e.target.parentElement.getElementsByTagName("iframe")[0]);
      downloadImage(e.target.parentElement.getElementsByTagName("iframe")[0]);
    });

    // for (let i = 0; i < charts.length; i++) {

    // 	//Making the list of charts
    // 	list.append('li').html(`<a href=#container${[i]}>${charts[i]}</a>`)

    // 	//Making the cards
    // 	grid.append('div').attr('id', 'container' + i).attr('class', 'container')
    // 	d3.select('#container' + i).append('div').attr('id', 'title' + i).attr('class', 'title-div').text(charts[i])
    // 	d3.select('#container' + i).append('button').attr('type', 'button').attr('id', 'btn' + i).text('View full chart')/*.attr('class', 'reveal')*/
    // 	d3.select('#container' + i).append('button').attr('type', 'button').attr('id', 'img' + i).text('Get thumbnail to paste in draft')

    // 	d3.select('#container' + i).append('div').attr('id', 'chart' + i).attr('class', 'chart')
    // 	d3.select('#container' + i).append('div').attr('id', 'data' + charts[i].replace(/\s/g, "")).html(`<a href=${urls[i]}data.csv download>Download the data csv file</a>`)
    // if (i % 3 == 0) {
    // 	d3.select('#container' + i).append('div').html(`<a href=#top>🠕 Back to the top</a>`)
    // }

    // 	//Making the 'modal' - the full screen pop-up
    // 	d3.select('#container' + i).append('div').attr('id', 'modal' + i).attr('class', 'modal').style('display', 'none')
    // 		.append('div').attr('class', 'modal-content').html(`<span id='close${i}' class="close">&times;</span>
    //     <div class='title-div'>${charts[i]}</div>
    // 	<div id='modal-chart${i}'>Chart ${i}</div>
    // 	`)

    // 	let modal = d3.select('#modal' + i)
    // 	let btn = d3.select('#btn' + i)
    // 	let span = d3.select('#close' + i)
    // 	let imgBtn = d3.select('#img' + i)
    // 	// When the user clicks on the button, open the modal
    // 	btn.on('click', function () {
    // 		// modal.style.display = "block";
    // 		modal.style('display', 'block')
    // 		let pymParent1 = new pym.Parent(`modal-chart${i}`, `${urls[i]}`, {})
    // 	})

    // 	imgBtn.on('click', function (e) {
    // 		console.log(e.target.nextSibling.id);
    // 		downloadImage(e.target.nextSibling.id)
    // 	})

    // When the user clicks on <span> (x), close the modal
    span.on("click", function () {
      modal.style("display", "none");
    });

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      // console.log(event);
      if (event.target.firstChild.className == `modal-content`) {
        // console.log(event.target)
        d3.select(event.target).style("display", "none");
      }
    };

    let pymParent = new pym.Parent(`chart${i}`, `${urls[i]}`, {});
  } //End the for loop

  // //Some manual adjustments for specific charts - based on longer arrays
  // d3.select('#dataPopulationpyramidwithcomparisontoggle').append('p').html(`<a href=${urls[33]}comparison.csv download>Download the comparison data csv file</a>`)
  // d3.select('#dataPopulationpyramidwithcomparisontoggle').append('p').html(`<a href=${urls[33]}comparison-time.csv download>Download the comparison time data csv file</a>`)
  // d3.select('#dataPopulationpyramidwithastaticcomparison').append('p').html(`<a href=${urls[34]}comparison.csv download>Download the comparison data csv file</a>`)
  // d3.select('#dataPopulationpyramidwithdropdown').append('p').html(`<a href=${urls[35]}comparison.csv download>Download the comparison data csv file</a>`)
  // d3.select('#dataPopulationpyramidwithdropdownandinteractivecomparison').append('p').html(`<a href=${urls[36]}comparison.csv download>Download the comparison data csv file</a>`)
  // d3.select('#dataSimplemap').html(`<a href=${urls[41]}data/data.csv download>Download the data csv file</a>`)
  // d3.select('#dataMapwithlinechartshowingchangeovertime').html(`<a href=${urls[42]}data/data0.csv download>Download the data csv file</a>`)
  // d3.select('#dataMultiplemaps').html(`<a href=${urls[43]}data/data.csv download>Download the data csv file</a>`)
  // d3.select('#dataMultimapwithsimplebarchart').html(`<a href=${urls[44]}data/ttw_map1.csv download>Download the data csv file</a>`)
  // d3.select('#dataMultimapwithverticalscale').html(`<a href=${urls[45]}data/data.csv download>Download the data csv file</a>`)
  // d3.select('#dataSimplemapwithbeeswarm').html(`<a href=${urls[46]}data/data.csv download>Download the data csv file</a>`)
  // d3.select('#dataSimplemapwithstackedbarchart').html(`<a href=${urls[47]}data/data.csv download>Download the data csv file</a>`)
  // d3.select('#dataMultiplecharacteristicsmap').html(`<a href=${urls[48]}data/mortality.csv download>Download the data csv file</a>`)
  // d3.select('#dataSidebysidemap').html(`<a href=${urls[49]}data/data.csv download>Download the data csv file</a>`)
  // d3.select('#dataHexmap').html(`<a href=${urls[50]}data/data.csv download>Download the data csv file</a>`)
  // d3.select('#dataLSOAhousepricemap').html(`<a href=${urls[51]}data/data.csv download>Download the data csv file</a>`)
  // d3.select('#dataMSOAdeathsmap').html(`<a href=${urls[52]}data/data.csv download>Download the data csv file</a>`)
  // d3.select('#dataMSOAsimplemap').html(`<a href=${urls[53]}data/data.csv download>Download the data csv file</a>`)
  // d3.select('#dataMSOAmultimap').html(`<a href=${urls[54]}data/data.csv download>Download the data csv file</a>`)

  //Some manual adjustments for specific charts
  d3.select("#dataPopulationpyramidwithtoggle")
    .append("p")
    .html(
      `<a href=${urls[16]}comparison.csv download>Download the comparison data csv file</a>`
    );
  d3.select("#dataPopulationpyramidwithtoggle")
    .append("p")
    .html(
      `<a href=${urls[16]}comparison-time.csv download>Download the comparison time data csv file</a>`
    );
  d3.select("#dataPopulationpyramidwithastaticcomparison")
    .append("p")
    .html(
      `<a href=${urls[17]}comparison.csv download>Download the comparison data csv file</a>`
    );
  // d3.select('#dataPopulationpyramidwithdropdown').append('p').html(`<a href=${urls[35]}comparison.csv download>Download the comparison data csv file</a>`)
  d3.select("#dataPopulationpyramidwithdropdownandinteractivecomparison")
    .append("p")
    .html(
      `<a href=${urls[18]}comparison.csv download>Download the comparison data csv file</a>`
    );
  d3.select("#dataSimplemap").html(
    `<a href=${urls[20]}data/data.csv download>Download the data csv file</a>`
  );

  d3.selectAll("iframe").attr("loading", "lazy");

  d3.select("#container21").remove();

  filterSelection("all");
} // End drawGraphic

d3.select("body").append("div").html(`<a href=#top>🠕 Back to the top</a>`);

d3.csv(config.essential.graphic_data_url).then((data) => {
  //load chart data
  graphic_data = data;

  drawGraphic();
});
