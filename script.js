
  const body = d3.select('body');
  const tooltip = body
    .append('div')
    .attr('class', 'tooltip')
    .attr('id', 'tooltip')
    .style('opacity', 0);
  
  const svg = d3.select('#tree-map');
  const width = +svg.attr('width');
  const height = +svg.attr('height');
  
  const fader = color => d3.interpolateRgb(color, '#fff')(0.2);
  
  const color = d3.scaleOrdinal().range((d3.schemePastel1).map(fader)
  );
  
  const treemap = d3.treemap().size([width, height]).paddingInner(1);
  
  d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json')
    .then(data => {
      const root = d3
        .hierarchy(data)
        .eachBefore(d => {
          d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name;
        })
        .sum(d => d.value)
        .sort((a, b) => b.height - a.height || b.value - a.value);
  
      treemap(root);
  
      const cell = svg
        .selectAll('g')
        .data(root.leaves())
        .enter()
        .append('g')
        .attr('class', 'group')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);
  
      cell
        .append('rect')
        .attr('id', d => d.data.id)
        .attr('class', 'tile')
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('data-name', d => d.data.name)
        .attr('data-category', d => d.data.category)
        .attr('data-value', d => d.data.value)
        .attr('fill', d => color(d.data.category))
        .on('mousemove', (event, d) => {
          tooltip.style('opacity', 0.9);
          tooltip
            .html(
              `Name: ${d.data.name}<br>Category: ${d.data.category}<br>Value: ${d.data.value}`
            )
            .attr('data-value', d.data.value)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 28}px`);
        })
        .on('mouseout', () => {
          tooltip.style('opacity', 0);
        });
  
      cell
        .append('text')
        .attr('class', 'tile-text')
        .selectAll('tspan')
        .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
        .enter()
        .append('tspan')
        .attr('x', 4)
        .attr('y', (d, i) => 13 + i * 10)
        .text(d => d);
  
      const categories = [...new Set(root.leaves().map(nodes => nodes.data.category))];
      const legend = d3.select('#legend');
      const legendWidth = +legend.attr('width');
      const LEGEND_OFFSET = 10;
      const LEGEND_RECT_SIZE = 15;
      const LEGEND_H_SPACING = 150;
      const LEGEND_V_SPACING = 10;
      const LEGEND_TEXT_X_OFFSET = 3;
      const LEGEND_TEXT_Y_OFFSET = -2;
      const legendElemsPerRow = Math.floor(legendWidth / LEGEND_H_SPACING);
  
      const legendElem = legend
        .append('g')
        .attr('transform', `translate(60, ${LEGEND_OFFSET})`)
        .selectAll('g')
        .data(categories)
        .enter()
        .append('g')
        .attr('transform', (d, i) => `translate(${(i % legendElemsPerRow) * LEGEND_H_SPACING}, ${Math.floor(i / legendElemsPerRow) * LEGEND_RECT_SIZE + LEGEND_V_SPACING * Math.floor(i / legendElemsPerRow)})`);
  
      legendElem
        .append('rect')
        .attr('width', LEGEND_RECT_SIZE)
        .attr('height', LEGEND_RECT_SIZE)
        .attr('class', 'legend-item')
        .attr('fill', d => color(d));
  
      legendElem
        .append('text')
        .attr('x', LEGEND_RECT_SIZE + LEGEND_TEXT_X_OFFSET)
        .attr('y', LEGEND_RECT_SIZE + LEGEND_TEXT_Y_OFFSET)
        .text(d => d);
    })
    .catch(err => console.log(err));
  