export class AnnotationGUI {
  constructor(svg, chartConfig) {
    this.svg = svg;
    this.height = chartConfig.height;
    this.xScale = chartConfig.xScale;
    this.yScale = chartConfig.yScale;
    this.isPlacing = false;
    this.mousePosition = { x: 0, y: 0 };
    this.selectedDataPoint = null;
    this.annotationType = null;
    this.annotations = [];
    this.currentAnnotationConfig = null;

    // Create containers
    this.initializeContainers();
    this.initializeControls();
    this.setupEventListeners();
  }

  initializeContainers() {
    // Create container for annotations list
    this.listContainer = d3.select('body')
      .append('div')
      .attr('class', 'annotations-list')
      .style('position', 'fixed')
      .style('left', '20px')
      .style('top', '20px')
      .style('background', 'white')
      .style('padding', '10px')
      .style('border', '1px solid #ccc')
      .style('border-radius', '4px')
      .style('max-height', '400px')
      .style('overflow-y', 'auto');

    // Create overlay for mouse tracking
    this.overlay = d3.select(this.svg)
      .append('rect')
      .attr('class', 'annotation-overlay')
      .attr('width', this.xScale.range()[1])
      .attr('height', this.height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .style('display', 'none');

    // Create preview elements
    this.previewGroup = d3.select(this.svg)
      .append('g')
      .attr('class', 'preview-group')
      .style('display', 'none');

    this.previewCircle = this.previewGroup
      .append('circle')
      .attr('class', 'preview-point')
      .attr('r', 4)
      .style('fill', '#414042');

    this.previewText = this.previewGroup
      .append('text')
      .attr('class', 'preview-text')
      .attr('dy', -10)
      .style('fill', '#414042')
      .style('font-size', '12px');
  }

  initializeControls() {
    // Create control panel
    const controls = d3.select('body')
      .append('div')
      .attr('class', 'annotation-controls')
      .style('position', 'fixed')
      .style('top', '20px')
      .style('right', '20px')
      .style('background', 'white')
      .style('padding', '10px')
      .style('border', '1px solid #ccc')
      .style('border-radius', '4px');

    // Type selector
    this.typeSelector = controls.append('div')
      .html(`
        <p>Select annotation type:</p>
        <select id="annotationType">
          <option value="">Choose type...</option>
          <option value="text">Text</option>
          <option value="arrow">Arrow</option>
          <option value="line">Vertical Line</option>
          <option value="region">Region</option>
        </select>
      `);

    // Configuration panels
    this.configPanels = controls.append('div')
      .attr('class', 'config-panels');

    // Text annotation config
    const textPanel = this.configPanels.append('div')
      .attr('class', 'config-panel text-panel')
      .style('display', 'none');

    textPanel.html(`
      <div class="text-config">
        <h4>Text Annotation</h4>
        <div class="form-group">
          <label>Text:</label>
          <input type="text" id="annotationText" class="form-control">
        </div>
        <div class="form-group">
          <label>Font Size:</label>
          <select id="fontSize" class="form-control">
            <option value="12">Small</option>
            <option value="14" selected>Medium</option>
            <option value="16">Large</option>
          </select>
        </div>
        <div class="form-group">
          <label>Wrap Width:</label>
          <input type="number" id="wrapWidth" value="200" class="form-control">
        </div>
        <div class="form-group">
          <label>Position:</label>
          <select id="textPosition" class="form-control">
            <option value="above">Above point</option>
            <option value="below">Below point</option>
            <option value="right">Right of point</option>
            <option value="left">Left of point</option>
          </select>
        </div>
      </div>
    `);

    // Add placement instructions
    this.placementInstructions = controls.append('div')
      .attr('class', 'placement-instructions')
      .style('display', 'none')
      .html('<p>Click on the chart to place the annotation</p>');

    // Add event listener for type selection
    d3.select("#annotationType").on("change", (event) => {
      const selectedType = event.target.value;
      this.setAnnotationType(selectedType);
    });

    // Add event listeners for text configuration
    d3.select("#annotationText").on("input", () => this.updatePreview());
    d3.select("#fontSize").on("change", () => this.updatePreview());
    d3.select("#textPosition").on("change", () => this.updatePreview());
  }

  setAnnotationType(type) {
    this.annotationType = type;
    this.configPanels.selectAll('.config-panel').style('display', 'none');
    
    if (type) {
      this.placementInstructions.style('display', 'block');
      this.startPlacing();
      
      // Show corresponding config panel
      if (type === 'text') {
        this.configPanels.select('.text-panel').style('display', 'block');
      }
    } else {
      this.placementInstructions.style('display', 'none');
      this.resetPlacement();
    }
  }

  updatePreview() {
    if (!this.selectedDataPoint || this.annotationType !== 'text') return;

    const text = d3.select("#annotationText").property("value") || "New annotation";
    const fontSize = d3.select("#fontSize").property("value");
    const position = d3.select("#textPosition").property("value");
    
    // Update preview text
    this.previewText
      .text(text)
      .style('font-size', `${fontSize}px`);

    // Position the preview text
    const offset = 8;
    switch (position) {
      case 'above':
        this.previewText
          .attr('x', this.selectedDataPoint.xPixel)
          .attr('y', this.selectedDataPoint.yPixel - offset)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'bottom');
        break;
      case 'below':
        this.previewText
          .attr('x', this.selectedDataPoint.xPixel)
          .attr('y', this.selectedDataPoint.yPixel + offset)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'top');
        break;
      case 'right':
        this.previewText
          .attr('x', this.selectedDataPoint.xPixel + offset)
          .attr('y', this.selectedDataPoint.yPixel)
          .attr('text-anchor', 'start')
          .attr('dominant-baseline', 'middle');
        break;
      case 'left':
        this.previewText
          .attr('x', this.selectedDataPoint.xPixel - offset)
          .attr('y', this.selectedDataPoint.yPixel)
          .attr('text-anchor', 'end')
          .attr('dominant-baseline', 'middle');
        break;
    }
  }

  updateAnnotationsList() {
    const list = this.listContainer.selectAll('.annotation-item')
      .data(this.annotations)
      .join('div')
      .attr('class', 'annotation-item')
      .style('margin', '5px')
      .style('padding', '5px')
      .style('border', '1px solid #ddd');

    list.html((d, i) => `
      <div style="display: flex; justify-content: space-between; align-items: center">
        <span>${d.type} - ${d.text || 'Annotation ' + (i + 1)}</span>
        <div>
          <button class="edit-btn" data-index="${i}">Edit</button>
          <button class="remove-btn" data-index="${i}">Remove</button>
        </div>
      </div>
    `);

    // Add event listeners
    list.selectAll('.edit-btn').on('click', (event) => {
      const index = event.target.dataset.index;
      this.editAnnotation(index);
    });

    list.selectAll('.remove-btn').on('click', (event) => {
      const index = event.target.dataset.index;
      this.removeAnnotation(index);
    });
  }

  createAnnotation() {
    if (!this.selectedDataPoint || !this.annotationType) return;

    const annotation = {
      type: this.annotationType,
      position: { ...this.selectedDataPoint },
      id: Date.now()
    };

    if (this.annotationType === 'text') {
      annotation.text = d3.select("#annotationText").property("value") || "New annotation";
      annotation.fontSize = d3.select("#fontSize").property("value");
      annotation.position = d3.select("#textPosition").property("value");
      annotation.wrapWidth = +d3.select("#wrapWidth").property("value");
      this.createTextAnnotation(annotation);
    }
    // ... other annotation types remain the same

    this.annotations.push(annotation);
    this.updateAnnotationsList();
    this.resetPlacement();
  }

  createTextAnnotation(annotation) {
    const group = this.createAnnotationGroup(annotation);

    const textElement = group.append('text')
      .attr('x', annotation.position.xPixel)
      .attr('y', annotation.position.yPixel)
      .text(annotation.text)
      .call(this.wrapText, annotation.wrapWidth);

    annotation.element = group;
  }

  createArrowAnnotation(annotation) {
    const group = this.createAnnotationGroup(annotation);

    // Create the arrow line
    const line = group.append('path')
      .attr('class', 'arrow-line')
      .style('stroke', '#414042')
      .style('fill', 'none');

    // Create end point handle
    const handle = group.append('circle')
      .attr('class', 'end-point-handle')
      .attr('r', 4)
      .attr('cx', annotation.endPoint.x)
      .attr('cy', annotation.endPoint.y)
      .style('fill', '#414042')
      .style('cursor', 'move')
      .call(d3.drag()
        .on('drag', (event) => {
          annotation.endPoint.x += event.dx;
          annotation.endPoint.y += event.dy;
          this.updateArrowPath(annotation);
        }));

    this.updateArrowPath(annotation);
    annotation.element = group;
  }

  updateArrowPath(annotation) {
    const { position, endPoint, connectorStyle } = annotation;
    let path;

    switch (connectorStyle) {
      case 'curveLeft':
        path = d3.line().curve(d3.curveBasis)([
          [position.xPixel, position.yPixel],
          [position.xPixel, endPoint.y],
          [endPoint.x, position.yPixel],
          [endPoint.x, endPoint.y]
        ]);
        break;
      case 'curveRight':
        path = d3.line().curve(d3.curveBasis)([
          [position.xPixel, position.yPixel],
          [endPoint.x, position.yPixel],
          [position.xPixel, endPoint.y],
          [endPoint.x, endPoint.y]
        ]);
        break;
      default: // straight
        path = `M${position.xPixel},${position.yPixel} L${endPoint.x},${endPoint.y}`;
    }

    annotation.element.select('.arrow-line')
      .attr('d', path);

    // Update arrow head or circle
    if (annotation.headStyle === 'arrow') {
      this.updateArrowHead(annotation);
    } else {
      this.updateCircleHead(annotation);
    }
  }

  updateArrowHead(annotation) {
    const { position, endPoint } = annotation;
    const arrowSize = 6;
    const angle = Math.atan2(endPoint.y - position.yPixel, endPoint.x - position.xPixel);

    const points = [
      [endPoint.x - arrowSize * Math.cos(angle - Math.PI / 6),
      endPoint.y - arrowSize * Math.sin(angle - Math.PI / 6)],
      [endPoint.x, endPoint.y],
      [endPoint.x - arrowSize * Math.cos(angle + Math.PI / 6),
      endPoint.y - arrowSize * Math.sin(angle + Math.PI / 6)]
    ];

    annotation.element.select('.arrow-head').remove();
    annotation.element.append('path')
      .attr('class', 'arrow-head')
      .attr('d', `M${points[0][0]},${points[0][1]} L${points[1][0]},${points[1][1]} L${points[2][0]},${points[2][1]}`)
      .style('fill', 'none')
      .style('stroke', '#414042');
  }

  createLineAnnotation(annotation) {
    const group = this.createAnnotationGroup(annotation);

    group.append('line')
      .attr('x1', annotation.position.xPixel)
      .attr('x2', annotation.position.xPixel)
      .attr('y1', 0)
      .attr('y2', this.height)
      .style('stroke', '#414042')
      .style('stroke-dasharray', '4,4');

    group.append('text')
      .attr('x', annotation.position.xPixel + 5)
      .attr('y', 20)
      .text(annotation.text);

    annotation.element = group;
  }

  createRegionAnnotation(annotation) {
    const group = this.createAnnotationGroup(annotation);

    // Create resizable region
    const region = group.append('rect')
      .attr('x', annotation.position.xPixel)
      .attr('width', annotation.width)
      .attr('y', 0)
      .attr('height', this.height)
      .style('fill', '#414042')
      .style('opacity', 0.1);

    // Add resize handles
    const rightHandle = group.append('rect')
      .attr('x', annotation.position.xPixel + annotation.width - 5)
      .attr('y', 0)
      .attr('width', 10)
      .attr('height', this.height)
      .style('fill', 'transparent')
      .style('cursor', 'ew-resize')
      .call(d3.drag()
        .on('drag', (event) => {
          annotation.width = Math.max(10, annotation.width + event.dx);
          this.updateRegion(annotation);
        }));

    group.append('text')
      .attr('x', annotation.position.xPixel + 5)
      .attr('y', 20)
      .text(annotation.text);

    annotation.element = group;
  }

  updateRegion(annotation) {
    const group = annotation.element;
    group.select('rect')
      .attr('width', annotation.width);
    group.select('rect[style*="cursor: ew-resize"]')
      .attr('x', annotation.position.xPixel + annotation.width - 5);
  }

  createAnnotationGroup(annotation) {
    return d3.select(this.svg)
      .append('g')
      .attr('class', 'annotation-group')
      .attr('data-id', annotation.id)
      .call(d3.drag()
        .on('start', this.dragstarted)
        .on('drag', (event, d) => this.dragged(event, d))
        .on('end', this.dragended));
  }

  wrapText(text, width) {
    text.each(function () {
      const text = d3.select(this);
      const words = text.text().split(/\s+/).reverse();
      const lineHeight = 1.1;
      const y = text.attr("y");
      const dy = parseFloat(text.attr("dy") || 0);
      let word;
      let line = [];
      let lineNumber = 0;
      let tspan = text.text(null).append("tspan")
        .attr("x", text.attr("x"))
        .attr("y", y)
        .attr("dy", dy + "em");

      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan")
            .attr("x", text.attr("x"))
            .attr("y", y)
            .attr("dy", ++lineNumber * lineHeight + dy + "em")
            .text(word);
        }
      }
    });
  }

  dragstarted(event, d) {
    d3.select(this).raise().classed("active", true);
  }

  dragged(event, d) {
    const group = d3.select(this);
    const transform = group.attr("transform") || "";
    const currentTranslate = transform.match(/translate\(([-\d.]+),\s*([-\d.]+)\)/) || [0, 0, 0];
    const dx = event.dx + (+currentTranslate[1] || 0);
    const dy = event.dy + (+currentTranslate[2] || 0);
    group.attr("transform", `translate(${dx},${dy})`);

    // Update the position in the annotation data
    const annotationId = group.attr('data-id');
    const annotation = this.annotations.find(a => a.id === +annotationId);
    if (annotation) {
      annotation.position.xPixel += event.dx;
      annotation.position.yPixel += event.dy;
      if (annotation.endPoint) {
        annotation.endPoint.x += event.dx;
        annotation.endPoint.y += event.dy;
      }
    }
  }

  dragended(event, d) {
    d3.select(this).classed("active", false);
  }

  editAnnotation(index) {
    const annotation = this.annotations[index];

    // Show type selector with current values
    this.typeSelector.style('display', 'block');

    // Set current type
    d3.select("#annotationType")
      .property("value", annotation.type)
      .dispatch("change");

    // Set options based on type
    switch (annotation.type) {
      case 'text':
        d3.select("#annotationText").property("value", annotation.text);
        d3.select("#wrapWidth").property("value", annotation.wrapWidth);
        break;
      case 'arrow':
        d3.select("#headStyle").property("value", annotation.headStyle);
        d3.select("#connectorStyle").property("value", annotation.connectorStyle);
        break;
      case 'line':
        d3.select("#lineLabel").property("value", annotation.text);
        break;
      case 'region':
        d3.select("#regionWidth").property("value", annotation.width);
        d3.select("#regionLabel").property("value", annotation.text);
        break;
    }

    // Change create button to update
    const createBtn = d3.select("#createAnnotation");
    createBtn.text("Update");
    createBtn.on("click", () => {
      // Remove old annotation
      annotation.element.remove();

      // Update annotation properties
      switch (annotation.type) {
        case 'text':
          annotation.text = d3.select("#annotationText").property("value");
          annotation.wrapWidth = +d3.select("#wrapWidth").property("value");
          this.createTextAnnotation(annotation);
          break;
        case 'arrow':
          annotation.headStyle = d3.select("#headStyle").property("value");
          annotation.connectorStyle = d3.select("#connectorStyle").property("value");
          this.createArrowAnnotation(annotation);
          break;
        case 'line':
          annotation.text = d3.select("#lineLabel").property("value");
          this.createLineAnnotation(annotation);
          break;
        case 'region':
          annotation.width = +d3.select("#regionWidth").property("value");
          annotation.text = d3.select("#regionLabel").property("value");
          this.createRegionAnnotation(annotation);
          break;
      }

      // Reset UI
      this.resetPlacement();
      this.updateAnnotationsList();
    });
  }

  removeAnnotation(index) {
    const annotation = this.annotations[index];
    annotation.element.remove();
    this.annotations.splice(index, 1);
    this.updateAnnotationsList();
  }

  setupEventListeners() {
    this.overlay.on('mousemove', (event) => {
      if (!this.isPlacing) return;
      const [x, y] = d3.pointer(event);
      this.mousePosition = { x, y };
      this.snapToNearestDataPoint();
      this.updatePreview();
    });

    this.overlay.on('click', () => {
      if (!this.isPlacing) return;
      this.placementComplete();
    });
  }

  snapToNearestDataPoint() {
    const xValue = this.xScale.invert(this.mousePosition.x);
    const yBands = this.yScale.domain();
    const yPos = this.mousePosition.y;

    let closestBand = yBands[0];
    let minDistance = Math.abs(this.yScale(yBands[0]) - yPos);

    yBands.forEach(band => {
      const distance = Math.abs(this.yScale(band) - yPos);
      if (distance < minDistance) {
        minDistance = distance;
        closestBand = band;
      }
    });

    this.selectedDataPoint = {
      x: xValue,
      y: closestBand,
      xPixel: this.xScale(xValue),
      yPixel: this.yScale(closestBand) + this.yScale.bandwidth() / 2
    };
  }

  updatePreview() {
    if (!this.selectedDataPoint) return;
    this.previewCircle
      .attr('cx', this.selectedDataPoint.xPixel)
      .attr('cy', this.selectedDataPoint.yPixel);
  }

  startPlacing() {
    this.isPlacing = true;
    this.overlay.style('display', null);
    this.previewCircle.style('display', null);
  }

  placementComplete() {
    if (this.annotationType && this.selectedDataPoint) {
      this.createAnnotation();
    }
    this.resetPlacement();
  }

  resetPlacement() {
    this.isPlacing = false;
    this.overlay.style('display', 'none');
    this.previewGroup.style('display', 'none');
    this.selectedDataPoint = null;
    d3.select("#annotationType").property('value', '');
    this.configPanels.selectAll('.config-panel').style('display', 'none');
    this.placementInstructions.style('display', 'none');
  }

  createAnnotation() {
    if (!this.selectedDataPoint || !this.annotationType) return;

    const annotation = {
      type: this.annotationType,
      position: { ...this.selectedDataPoint },
      id: Date.now()
    };

    switch (this.annotationType) {
      case 'text':
        annotation.text = d3.select("#annotationText").property("value") || "New annotation";
        annotation.fontSize = d3.select("#fontSize").property("value");
        annotation.textPosition = d3.select("#textPosition").property("value");
        annotation.wrapWidth = +d3.select("#wrapWidth").property("value");
        this.createTextAnnotation(annotation);
        break;
      case 'arrow':
        annotation.headStyle = 'arrow';
        annotation.connectorStyle = 'straight';
        annotation.endPoint = {
          x: annotation.position.xPixel + 50,
          y: annotation.position.yPixel - 50
        };
        this.createArrowAnnotation(annotation);
        break;
      case 'line':
        this.createLineAnnotation(annotation);
        break;
      case 'region':
        annotation.width = 100;
        this.createRegionAnnotation(annotation);
        break;
    }

    this.annotations.push(annotation);
    this.updateAnnotationsList();
  }

  createAnnotationGroup(annotation) {
    return d3.select(this.svg)
      .append('g')
      .attr('class', 'annotation-group')
      .attr('data-id', annotation.id)
      .call(d3.drag()
        .on('start', this.dragstarted)
        .on('drag', (event, d) => this.dragged(event, d))
        .on('end', this.dragended));
  }

  createTextAnnotation(annotation) {
    const group = this.createAnnotationGroup(annotation);
    
    // Calculate text position
    let x = annotation.position.xPixel;
    let y = annotation.position.yPixel;
    let textAnchor = 'middle';
    let dy = 0;
    const offset = 8;

    switch (annotation.textPosition) {
      case 'above':
        y -= offset;
        dy = '-0.5em';
        break;
      case 'below':
        y += offset;
        dy = '1em';
        break;
      case 'right':
        x += offset;
        textAnchor = 'start';
        dy = '0.3em';
        break;
      case 'left':
        x -= offset;
        textAnchor = 'end';
        dy = '0.3em';
        break;
    }

    const textElement = group.append('text')
      .attr('x', x)
      .attr('y', y)
      .attr('dy', dy)
      .attr('text-anchor', textAnchor)
      .style('font-size', `${annotation.fontSize}px`)
      .text(annotation.text)
      .call(this.wrapText, annotation.wrapWidth);

    // Add anchor point indicator
    group.append('circle')
      .attr('cx', annotation.position.xPixel)
      .attr('cy', annotation.position.yPixel)
      .attr('r', 3)
      .style('fill', '#414042')
      .style('opacity', 0.5);

    annotation.element = group;
  }

  createArrowAnnotation(annotation) {
    const group = this.createAnnotationGroup(annotation);

    // Create the arrow line
    const line = group.append('path')
      .attr('class', 'arrow-line')
      .style('stroke', '#414042')
      .style('fill', 'none');

    // Create end point handle
    const handle = group.append('circle')
      .attr('class', 'end-point-handle')
      .attr('r', 4)
      .attr('cx', annotation.endPoint.x)
      .attr('cy', annotation.endPoint.y)
      .style('fill', '#414042')
      .style('cursor', 'move')
      .call(d3.drag()
        .on('drag', (event) => {
          annotation.endPoint.x += event.dx;
          annotation.endPoint.y += event.dy;
          this.updateArrowPath(annotation);
        }));

    this.updateArrowPath(annotation);
    annotation.element = group;
  }

  createLineAnnotation(annotation) {
    const group = this.createAnnotationGroup(annotation);

    group.append('line')
      .attr('x1', annotation.position.xPixel)
      .attr('x2', annotation.position.xPixel)
      .attr('y1', 0)
      .attr('y2', this.height)
      .style('stroke', '#414042')
      .style('stroke-dasharray', '4,4');

    group.append('text')
      .attr('x', annotation.position.xPixel + 5)
      .attr('y', 20)
      .text('Vertical Line');

    annotation.element = group;
  }

  createRegionAnnotation(annotation) {
    const group = this.createAnnotationGroup(annotation);

    // Create resizable region
    const region = group.append('rect')
      .attr('x', annotation.position.xPixel)
      .attr('width', annotation.width)
      .attr('y', 0)
      .attr('height', this.height)
      .style('fill', '#414042')
      .style('opacity', 0.1);

    // Add resize handles
    const rightHandle = group.append('rect')
      .attr('x', annotation.position.xPixel + annotation.width - 5)
      .attr('y', 0)
      .attr('width', 10)
      .attr('height', this.height)
      .style('fill', 'transparent')
      .style('cursor', 'ew-resize')
      .call(d3.drag()
        .on('drag', (event) => {
          annotation.width = Math.max(10, annotation.width + event.dx);
          this.updateRegion(annotation);
        }));

    annotation.element = group;
  }

  updateArrowPath(annotation) {
    const { position, endPoint } = annotation;
    const path = `M${position.xPixel},${position.yPixel} L${endPoint.x},${endPoint.y}`;
    
    annotation.element.select('.arrow-line')
      .attr('d', path);

    // Add arrow head
    const angle = Math.atan2(endPoint.y - position.yPixel, endPoint.x - position.xPixel);
    const arrowSize = 6;
    
    const points = [
      [endPoint.x - arrowSize * Math.cos(angle - Math.PI / 6),
       endPoint.y - arrowSize * Math.sin(angle - Math.PI / 6)],
      [endPoint.x, endPoint.y],
      [endPoint.x - arrowSize * Math.cos(angle + Math.PI / 6),
       endPoint.y - arrowSize * Math.sin(angle + Math.PI / 6)]
    ];

    annotation.element.select('.arrow-head').remove();
    annotation.element.append('path')
      .attr('class', 'arrow-head')
      .attr('d', `M${points[0][0]},${points[0][1]} L${points[1][0]},${points[1][1]} L${points[2][0]},${points[2][1]}`)
      .style('fill', 'none')
      .style('stroke', '#414042');
  }

  updateRegion(annotation) {
    const group = annotation.element;
    group.select('rect')
      .attr('width', annotation.width);
    group.select('rect[style*="cursor: ew-resize"]')
      .attr('x', annotation.position.xPixel + annotation.width - 5);
  }

  wrapText(text, width) {
    text.each(function() {
      const text = d3.select(this);
      const words = text.text().split(/\s+/).reverse();
      const lineHeight = 1.1;
      const y = text.attr("y");
      const x = text.attr("x");
      const dy = parseFloat(text.attr("dy") || 0);
      let word;
      let line = [];
      let lineNumber = 0;
      let tspan = text.text(null).append("tspan")
        .attr("x", x)
        .attr("y", y)
        .attr("dy", dy + "em");

      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", ++lineNumber * lineHeight + dy + "em")
            .text(word);
        }
      }
    });
  }

  dragstarted(event, d) {
    d3.select(this).raise().classed("active", true);
  }

  dragged(event, d) {
    const group = d3.select(this);
    const transform = group.attr("transform") || "";
    const currentTranslate = transform.match(/translate\(([-\d.]+),\s*([-\d.]+)\)/) || [0, 0, 0];
    const dx = event.dx + (+currentTranslate[1] || 0);
    const dy = event.dy + (+currentTranslate[2] || 0);
    group.attr("transform", `translate(${dx},${dy})`);
  }

  dragended(event, d) {
    d3.select(this).classed("active", false);
  }
}