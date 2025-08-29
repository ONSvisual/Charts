# Chart Annotation System Documentation

A comprehensive library for adding annotations to D3.js charts with support for mobile-friendly alternatives.

## Table of Contents
- [Quick Start](#quick-start)
- [Core Functions](#core-functions)
- [Configuration Reference](#configuration-reference)
- [Annotation Types](#annotation-types)
- [Examples](#examples)
- [Legacy Functions](#legacy-functions)

## Quick Start

```javascript
// Setup arrowheads (required for arrow annotations)
setupArrowhead(svg);

// Simple arrow annotation
addAnnotation({
  svg: chartSvg,
  type: 'arrow',
  x: 100, y: 50,
  text: 'Important point',
  arrow: { lengthX: 40, lengthY: 30 }
});

// Or use the simplified version
addSimpleAnnotation(chartSvg, 'arrow', 100, 50, 'Important point');
```

## Core Functions

### `setupArrowhead(svgContainer)`
**Required setup function for arrow annotations**
- `svgContainer`: D3 SVG selection where arrowhead markers will be defined

### `addAnnotation(config)`
**Universal annotation function**
- `config`: Configuration object (see [Configuration Reference](#configuration-reference))

### `addSimpleAnnotation(svg, type, x, y, text, options?)`
**Simplified annotation function for common use cases**
- `svg`: D3 SVG selection
- `type`: Annotation type string
- `x`: X coordinate
- `y`: Y coordinate  
- `text`: Annotation text
- `options`: Optional configuration object (same structure as `addAnnotation`)

## Configuration Reference

### Base Configuration

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `svg` | Object | ✓ | D3 SVG selection |
| `type` | String | ✓ | Annotation type (see [Annotation Types](#annotation-types)) |
| `x` | Number | ✓ | Primary X coordinate |
| `y` | Number | ✓ | Primary Y coordinate |
| `text` | String | | Annotation text content |

### Position Settings (`position`)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `text` | String | `'right'` | Text position: `'above'`, `'below'`, `'left'`, `'right'`, `'center'`, `'start'`, `'end'` |
| `anchor` | String | `'end'` | Arrow anchor point: `'start'`, `'end'` |
| `alignment` | String | `'above'` | Direction arrow alignment: `'above'`, `'below'`, `'left'`, `'right'` |
| `inside` | String | `'outside'` | Range text placement: `'inside'`, `'outside'` |

### Arrow Settings (`arrow`)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `offsetX` | Number | `0` | Arrow start X offset |
| `offsetY` | Number | `0` | Arrow start Y offset |
| `lengthX` | Number | `0` | Arrow X length/direction |
| `lengthY` | Number | `0` | Arrow Y length/direction |
| `curve` | String | `'right'` | Curve direction: `'left'`, `'right'` |
| `direction` | String | `'right'` | Direction arrow: `'up'`, `'down'`, `'left'`, `'right'` |
| `bendDirection` | String | `'horizontal-first'` | Elbow bend: `'horizontal-first'`, `'vertical-first'` |
| `endX` | Number | | Elbow arrow end X coordinate |
| `endY` | Number | | Elbow arrow end Y coordinate |

### Line/Range Settings (`line`)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `width` | Number | `100` | Width for horizontal lines/ranges |
| `height` | Number | `100` | Height for vertical lines/ranges |
| `endX` | Number | | End X coordinate for vertical ranges |
| `endY` | Number | | End Y coordinate for horizontal ranges |
| `moveToBack` | Boolean | `false` | Move line behind other elements |

### Text Settings (`text`)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `wrapWidth` | Number | `150` | Maximum text width before wrapping |
| `adjustY` | Number | `0` | Vertical text adjustment |
| `verticalAlign` | String | `'middle'` | Vertical alignment: `'top'`, `'middle'`, `'bottom'` |

### Mobile Settings (`mobile`)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | Boolean | `false` | Use mobile-friendly numbered circles |
| `number` | String/Number | `1` | Circle number identifier |
| `circleOffsetX` | Number | `0` | Circle horizontal offset |
| `circleOffsetY` | Number | `0` | Circle vertical offset |

### Style Settings (`style`)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `color` | String | `'#414042'` | Arrow/line color |
| `size` | String | `'md'` | Chart size: `'sm'`, `'md'`, `'lg'` |

## Annotation Types

### `'arrow'` - Curved Arrow
Draws a curved arrow pointing to a specific location with customizable text positioning.

**Key Properties:**
- `arrow.lengthX`, `arrow.lengthY`: Arrow direction and length
- `arrow.curve`: Curve direction (`'left'` or `'right'`)
- `position.text`: Text position relative to arrow end

```javascript
addAnnotation({
  svg: chartSvg,
  type: 'arrow',
  x: 100, y: 50,
  text: 'Peak performance',
  arrow: {
    offsetX: 10,
    offsetY: -20,
    lengthX: 40,
    lengthY: 30,
    curve: 'right'
  },
  position: { text: 'above' }
});
```

### `'text'` - Standalone Text
Places text at a specific location without any connecting elements.

**Key Properties:**
- `arrow.offsetX`, `arrow.offsetY`: Text position offsets
- `position.text`: Text anchor alignment

```javascript
addAnnotation({
  svg: chartSvg,
  type: 'text',
  x: 200, y: 100,
  text: 'Milestone reached',
  arrow: { offsetX: 10, offsetY: 5 },
  position: { text: 'left' }
});
```

### `'line-vertical'` - Vertical Reference Line
Draws a vertical line across the chart height with optional text.

**Key Properties:**
- `line.height`: Line height
- `position.text`: Text position (`'left'` or `'right'` of line)

```javascript
addAnnotation({
  svg: chartSvg,
  type: 'line-vertical',
  x: 150,
  y: 10, // Text Y position
  text: 'Target deadline',
  line: { height: 300, moveToBack: true },
  position: { text: 'right' }
});
```

### `'line-horizontal'` - Horizontal Reference Line
Draws a horizontal line across the chart width with optional text.

**Key Properties:**
- `line.width`: Line width
- `position.text`: Text position (`'above'` or `'below'` line)

```javascript
addAnnotation({
  svg: chartSvg,
  type: 'line-horizontal',
  x: 10, // Text X position
  y: 200,
  text: 'Baseline',
  line: { width: 400, moveToBack: true },
  position: { text: 'above' }
});
```

### `'range-vertical'` - Vertical Shaded Range
Creates a shaded rectangular area between two X coordinates.

**Key Properties:**
- `line.height`: Range height
- `line.endX`: End X coordinate
- `position.text`: Text alignment (`'left'` or `'right'`)
- `position.inside`: Text placement (`'inside'` or `'outside'` range)

```javascript
addAnnotation({
  svg: chartSvg,
  type: 'range-vertical',
  x: 100, // Start X
  y: 20,  // Text Y position
  text: 'Critical period',
  line: {
    height: 400,
    endX: 180 // End X
  },
  position: {
    text: 'left',
    inside: 'inside'
  }
});
```

### `'range-horizontal'` - Horizontal Shaded Range
Creates a shaded rectangular area between two Y coordinates.

**Key Properties:**
- `line.width`: Range width
- `line.endY`: End Y coordinate
- `position.text`: Text alignment (`'above'` or `'below'`)
- `position.inside`: Text placement (`'inside'` or `'outside'` range)

```javascript
addAnnotation({
  svg: chartSvg,
  type: 'range-horizontal',
  x: 20,  // Text X position
  y: 100, // Start Y
  text: 'Normal range',
  line: {
    width: 500,
    endY: 150 // End Y
  },
  position: {
    text: 'above',
    inside: 'outside'
  }
});
```

### `'direction-arrow'` - Simple Directional Arrow
Draws a simple straight arrow in cardinal directions with text.

**Key Properties:**
- `arrow.direction`: Arrow direction (`'up'`, `'down'`, `'left'`, `'right'`)
- `position.anchor`: Arrow anchor (`'start'`, `'end'`)
- `position.alignment`: Text alignment relative to arrow

```javascript
addAnnotation({
  svg: chartSvg,
  type: 'direction-arrow',
  x: 250, y: 200,
  text: 'Increasing trend',
  arrow: { direction: 'up' },
  position: {
    anchor: 'start',
    alignment: 'right'
  },
  style: { color: '#ff6b6b' }
});
```

### `'elbow-arrow'` - L-Shaped Connector Arrow
Draws an L-shaped arrow connecting two points with customizable bend direction.

**Key Properties:**
- `arrow.endX`, `arrow.endY`: End coordinates
- `arrow.bendDirection`: Bend style (`'horizontal-first'`, `'vertical-first'`)
- `position.anchor`: Arrowhead location (`'start'`, `'end'`)
- `position.text`: Text position (`'start'`, `'center'`, `'end'`)

```javascript
addAnnotation({
  svg: chartSvg,
  type: 'elbow-arrow',
  x: 50, y: 100,
  text: 'Connected data point',
  arrow: {
    endX: 200,
    endY: 150,
    bendDirection: 'horizontal-first'
  },
  position: {
    anchor: 'end',
    text: 'center'
  }
});
```

## Examples

### Basic Arrow with Mobile Support
```javascript
addAnnotation({
  svg: chartSvg,
  type: 'arrow',
  x: 120, y: 80,
  text: 'Significant spike in activity',
  arrow: {
    lengthX: 50,
    lengthY: -40,
    curve: 'left'
  },
  position: { text: 'above' },
  text: { wrapWidth: 120 },
  mobile: {
    enabled: true,
    number: 1,
    circleOffsetX: 10,
    circleOffsetY: -20
  }
});
```

### Complex Multi-Element Annotation
```javascript
// Background range
addAnnotation({
  svg: chartSvg,
  type: 'range-vertical',
  x: 100,
  text: 'Q4 Performance',
  line: { height: 300, endX: 200 },
  position: { text: 'left', inside: 'outside' }
});

// Reference line
addAnnotation({
  svg: chartSvg,
  type: 'line-vertical',
  x: 150,
  text: 'Target',
  line: { height: 300 },
  position: { text: 'right' }
});

// Arrow pointing to peak
addAnnotation({
  svg: chartSvg,
  type: 'arrow',
  x: 175, y: 60,
  text: 'Record high',
  arrow: { lengthX: 25, lengthY: 20 },
  position: { text: 'right' }
});
```

### Responsive Design Pattern
```javascript
const isMobile = window.innerWidth < 768;
const chartSize = window.innerWidth < 480 ? 'sm' : 
                 window.innerWidth < 1024 ? 'md' : 'lg';

addAnnotation({
  svg: chartSvg,
  type: 'arrow',
  x: 100, y: 50,
  text: 'Key insight that needs explanation',
  arrow: { lengthX: 40, lengthY: 30 },
  text: { wrapWidth: isMobile ? 100 : 150 },
  mobile: {
    enabled: isMobile,
    number: 1,
    circleOffsetX: 15,
    circleOffsetY: -10
  },
  style: { size: chartSize }
});
```

### Custom Styling
```javascript
addAnnotation({
  svg: chartSvg,
  type: 'direction-arrow',
  x: 200, y: 150,
  text: 'Growth trajectory',
  arrow: { direction: 'up' },
  position: {
    anchor: 'end',
    alignment: 'left'
  },
  text: {
    adjustY: -5,
    verticalAlign: 'bottom',
    wrapWidth: 100
  },
  style: { color: '#2ecc71' }
});
```

## Mobile Annotation System

When `mobile.enabled` is true, annotations automatically switch to a numbered circle system:

1. **Chart Display**: Shows numbered circles instead of full text
2. **Footnote Generation**: Creates corresponding footnotes in `.mobile-annotation-footnotes-div`
3. **Responsive**: Automatically disabled on large screens (`size: 'lg'`)

### Mobile Setup Required:
```html
<div class="mobile-annotation-footnotes-div"></div>
```

```css
.mobile-annotation-circle {
  fill: #ffffff;
  stroke: #333333;
  stroke-width: 1.5;
}

.mobile-annotation-circle-text {
  font-family: sans-serif;
  font-size: 11px;
  font-weight: bold;
  fill: #333333;
}
```

## Legacy Functions

All original functions remain available for backward compatibility:

- `addAnnotationText()`
- `addAnnotationArrow()` 
- `addDirectionArrow()`
- `addElbowArrow()`
- `addAnnotationLineVertical()`
- `addAnnotationLineHorizontal()`
- `addAnnotationRangeVertical()`
- `addAnnotationRangeHorizontal()`

These maintain their original parameter structures but are now internally routed through the new consolidated system.

## CSS Classes Reference

The annotation system uses these CSS classes:

| Class | Applied To | Purpose |
|-------|------------|---------|
| `.annotation-text` | Text elements | Style annotation text |
| `.annotation_arrow` | Arrow paths | Style curved arrows |
| `.annotation-line` | Line elements | Style reference lines |
| `.annotation-range` | Rectangle elements | Style shaded ranges |
| `.direction-arrow` | Direction arrow paths | Style direction arrows |
| `.elbow-arrow` | Elbow arrow paths | Style L-shaped arrows |
| `.mobile-annotation-circle` | Mobile circles | Style mobile annotation circles |
| `.mobile-annotation-circle-text` | Mobile circle text | Style mobile circle numbers |

## Best Practices

1. **Setup First**: Always call `setupArrowhead()` before using arrow annotations
2. **Consistent Naming**: Use descriptive text that works both inline and in mobile footnotes  
3. **Responsive Design**: Consider mobile users with the mobile annotation system
4. **Text Wrapping**: Set appropriate `wrapWidth` values for your chart size
5. **Layer Management**: Use `moveToBack: true` for reference lines that shouldn't obscure data
6. **Color Accessibility**: Ensure sufficient contrast for arrow and text colors