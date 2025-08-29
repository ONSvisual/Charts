# Scatter Plot and Bubble Plot Configuration Guide

This documentation covers the configuration options for creating scatter plots and bubble plots using the enhanced scatter plot component.

## Table of Contents
- [Basic Configuration](#basic-configuration)
- [Data Format](#data-format)
- [Essential Configuration](#essential-configuration)
- [Optional Configuration](#optional-configuration)
- [Size Scaling Configuration](#size-scaling-configuration)
- [Examples](#examples)

## Basic Configuration

The chart configuration is split into two main sections:
- `config.essential` - Required settings for basic functionality
- `config.optional` - Optional settings for customization

## Data Format

Your CSV data should include the following columns:

### Required Columns
- `xvalue` - Numeric values for x-axis positioning
- `yvalue` - Numeric values for y-axis positioning
- `group` - Category for color/shape grouping
- `name` - Display name for each point

### Optional Columns
- `size` - Numeric values for bubble sizing (bubble plot only)
- `highlight` - Set to `'y'` to highlight specific points with labels

### Example CSV Structure
```csv
name,xvalue,yvalue,group,size,highlight
"Company A",45.2,12.8,"Tech",150,"n"
"Company B",38.1,18.5,"Finance",220,"y"
"Company C",52.3,8.2,"Tech",95,"n"
"Company D",41.7,15.3,"Healthcare",180,"n"
```

## Essential Configuration

### `config.essential`

#### Data and Labels
```javascript
config.essential = {
  // Data source
  graphic_data_url: 'data/scatter-data.csv',
  
  // Axis labels
  xAxisLabel: 'Revenue (millions)',
  yAxisLabel: 'Growth Rate (%)',
  
  // Size label (for bubble plots)
  sizeLabel: 'Market Cap',
  
  // Group label
  groupLabel: 'Sector',
  
  // Axis domains
  xDomain: 'auto', // or [min, max] array
  yDomain: 'auto', // or [min, max] array
  
  // Number formatting
  xAxisFormat: '.1f',
  yAxisFormat: '.1f',
  
  // Visual styling
  colour_palette: ['#d73027', '#1a9850', '#313695', '#f46d43'],
  fillOpacity: 0.8,
  strokeOpacity: 1.0,
  
  // Accessibility
  accessibleSummary: 'A scatter plot showing the relationship between revenue and growth rate across different sectors.',
  
  // Source citation
  sourceText: 'Company financial reports, 2024'
};
```

#### Required Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `graphic_data_url` | String | Path to CSV data file | `'data/my-data.csv'` |
| `xAxisLabel` | String | Label for x-axis | `'Revenue (millions)'` |
| `yAxisLabel` | String | Label for y-axis | `'Growth Rate (%)'` |
| `xDomain` | String/Array | X-axis range. Use `'auto'` for automatic scaling | `'auto'` or `[0, 100]` |
| `yDomain` | String/Array | Y-axis range. Use `'auto'` for automatic scaling | `'auto'` or `[-5, 25]` |
| `colour_palette` | Array | Colors for different groups | `['#d73027', '#1a9850']` |
| `accessibleSummary` | String | Screen reader description | `'Chart showing...'` |
| `sourceText` | String | Data source attribution | `'ONS, 2024'` |

#### Optional Essential Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `sizeLabel` | String | `'Size'` | Label for size values in tooltips (bubble plots) |
| `groupLabel` | String | `'Group'` | Label for group categories |
| `xAxisFormat` | String | `'.2f'` | D3 number format for x-axis |
| `yAxisFormat` | String | `'.2f'` | D3 number format for y-axis |
| `fillOpacity` | Number | `0.8` | Opacity of point fills (0-1) |
| `strokeOpacity` | Number | `1.0` | Opacity of point outlines (0-1) |

## Optional Configuration

### `config.optional`

#### Responsive Breakpoints
```javascript
config.optional = {
  // Screen width breakpoints
  mobileBreakpoint: 510,
  mediumBreakpoint: 600,
  
  // Chart margins for different screen sizes
  margin: {
    sm: { top: 15, right: 20, bottom: 50, left: 50 },
    md: { top: 20, right: 25, bottom: 60, left: 60 },
    lg: { top: 25, right: 30, bottom: 70, left: 70 }
  },
  
  // Aspect ratios [width, height]
  aspectRatio: {
    sm: [10, 11],
    md: [10, 8], 
    lg: [10, 6]
  },
  
  // Axis tick counts
  xAxisTicks: {
    sm: 4,
    md: 6,
    lg: 8
  },
  yAxisTicks: {
    sm: 4,
    md: 6,
    lg: 8
  }
};
```

#### Optional Properties

| Property | Type | Description |
|----------|------|-------------|
| `mobileBreakpoint` | Number | Screen width threshold for mobile layout |
| `mediumBreakpoint` | Number | Screen width threshold for medium layout |
| `margin` | Object | Chart margins for each screen size |
| `aspectRatio` | Object | Width:height ratios for each screen size |
| `xAxisTicks` | Object | Number of x-axis ticks for each screen size |
| `yAxisTicks` | Object | Number of y-axis ticks for each screen size |

## Size Scaling Configuration

For bubble plots, configure size scaling in your JavaScript:

### Basic Size Configuration
```javascript
config.essential.sizeConfig = {
  enabled: true,           // Enable/disable size scaling
  minSize: 50,            // Minimum circle size in pixels
  maxSize: 300,           // Maximum circle size in pixels
  sizeField: 'size'       // CSV column name containing size values
};
```

### Size Configuration Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | Boolean | `true` | Whether to enable size scaling |
| `minSize` | Number | `50` | Minimum circle area in pixels |
| `maxSize` | Number | `300` | Maximum circle area in pixels |
| `sizeField` | String | `'size'` | Name of CSV column with size data |

### Important Notes
- Size scaling uses a square root scale for proper area representation
- When size scaling is enabled, all points become circles regardless of group shapes
- Size values should be positive numbers
- Missing size values will use the base circle size

## Examples

### Basic Scatter Plot

**Data (scatter-basic.csv):**
```csv
name,xvalue,yvalue,group,highlight
"Point A",10,20,"Group 1","n"
"Point B",15,25,"Group 1","n"
"Point C",12,18,"Group 2","y"
"Point D",18,22,"Group 2","n"
```

**Configuration:**
```javascript
config = {
    essential:{
        graphic_data_url: 'data/scatter-basic.csv',
        xAxisLabel: 'X Values',
        yAxisLabel: 'Y Values',
        xDomain: 'auto',
        yDomain: 'auto',
        colour_palette: ['#d73027', '#1a9850'],
        xAxisFormat: '.1f',
        yAxisFormat: '.1f',
        fillOpacity: 0.8,
        strokeOpacity: 1.0,
        accessibleSummary: 'Scatter plot showing relationship between X and Y values across two groups.',
        sourceText: 'Sample data, 2024',
        sizeConfig = {
            // Disable size scaling for basic scatter plot
            enabled: false
        }
    }


### Bubble Plot

**Data (bubble-data.csv):**
```csv
name,xvalue,yvalue,group,size,highlight
"Company A",45.2,12.8,"Tech",150,"n"
"Company B",38.1,18.5,"Finance",220,"y"
"Company C",52.3,8.2,"Tech",95,"n"
"Company D",41.7,15.3,"Healthcare",180,"n"
"Company E",49.8,10.1,"Finance",310,"n"
```

**Configuration:**
```javascript
config = {
    essential:{
        graphic_data_url: 'data/bubble-data.csv',
        xAxisLabel: 'Revenue ($ millions)',
        yAxisLabel: 'Growth Rate (%)',
        sizeLabel: 'Market Cap ($ billions)',
        groupLabel: 'Sector',
        xDomain: 'auto',
        yDomain: 'auto',
        colour_palette: ['#d73027', '#1a9850', '#313695'],
        xAxisFormat: '.1f',
        yAxisFormat: '.1f',
        fillOpacity: 0.7,
        strokeOpacity: 1.0,
        accessibleSummary: 'Bubble chart showing company revenue, growth rate, and market capitalization across different sectors.',
        sourceText: 'Financial Times, Company Reports 2024',
        sizeConfig = {
            enabled: true,// Enable size scaling for bubble plot
            minSize: 80,
            maxSize: 400,
            sizeField: 'size'
        }
    }
};
```

### Advanced Bubble Plot with Custom Formatting

**Configuration:**
```javascript
config.essential = {
  graphic_data_url: 'data/countries-data.csv',
  xAxisLabel: 'GDP per capita ($)',
  yAxisLabel: 'Life expectancy (years)', 
  sizeLabel: 'Population (millions)',
  groupLabel: 'Region',
  xDomain: [0, 80000],      // Fixed domain
  yDomain: [50, 85],        // Fixed domain
  colour_palette: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3'],
  xAxisFormat: ',.0f',      // Comma-separated thousands
  yAxisFormat: '.1f',       // One decimal place
  fillOpacity: 0.75,
  strokeOpacity: 1.0,
  accessibleSummary: 'Bubble chart comparing countries by GDP per capita, life expectancy, and population size across different world regions.',
  sourceText: 'World Bank, UN Population Division 2024',
  sizeConfig = {
    enabled: true,
    minSize: 60,
    maxSize: 500,
    sizeField: 'population'
  }
};

const 

config.optional = {
  mobileBreakpoint: 510,
  mediumBreakpoint: 600,
  margin: {
    sm: { top: 20, right: 30, bottom: 60, left: 70 },
    md: { top: 25, right: 40, bottom: 70, left: 80 },
    lg: { top: 30, right: 50, bottom: 80, left: 90 }
  },
  aspectRatio: {
    sm: [10, 12],
    md: [10, 8],
    lg: [10, 7]
  },
  xAxisTicks: {
    sm: 3,
    md: 5,
    lg: 7
  },
  yAxisTicks: {
    sm: 4,
    md: 6,
    lg: 8
  }
};
```

## Best Practices

### Data Preparation
1. **Unique Names**: Ensure point names are unique for dropdown functionality
2. **Clean Numbers**: Remove any non-numeric characters from value columns
3. **Consistent Groups**: Use consistent group names throughout your data
4. **Size Values**: For bubble plots, ensure size values are positive and meaningful

### Visual Design
1. **Color Palette**: Use colorblind-friendly palettes with sufficient contrast
2. **Size Range**: Choose min/max sizes that don't overwhelm the chart
3. **Opacity**: Use lower opacity (0.6-0.8) when points might overlap
4. **Highlighting**: Use the highlight column sparingly for key points

### Performance
1. **Data Size**: Keep datasets under 1000 points for optimal performance
2. **Size Sorting**: Large bubbles are automatically drawn first to prevent overlap issues
3. **Mobile Optimization**: Test on smaller screens and adjust margins accordingly

### Accessibility
1. **Alt Text**: Always provide meaningful `accessibleSummary` text
2. **Keyboard Navigation**: The chart supports arrow key navigation
3. **Screen Readers**: Group and value information is included in tooltips
4. **Focus Management**: The chart is keyboard accessible via tab navigation