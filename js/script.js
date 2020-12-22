const getData = async () => {
  try {
    const response = await fetch(`https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json`, { mode: 'cors' });

    const data = await response.json();

    return data;
  } catch (error) {
    alert(error);
  }
  return false;
};


const drawTree = async info => {
  const data = await info;

  var svg;
  var legendsvg;

  var fader = color => (d3.interpolateRgb(color, "#fff")(0.2))
  var color = d3.scaleOrdinal(d3.schemeCategory10.map(fader));
  var format = d3.format(",d");
  var currentSelectedSet = 0;

  const w = 1000;
  const h = 1000;
  const padding = 70;

  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "toolTip")
    .attr("id", "tooltip");

  d3.selectAll("svg").remove();

  svg = d3
    .select("#main")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  const root = d3.hierarchy(data)
    .eachBefore(d => {d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;})
    .sum(d => (d.value))
    .sort((a, b) => (b.value - a.value));

  const treemap = d3.treemap()
    .size([w, h])
    .paddingInner(1);

  treemap(root);

  const cell = svg.selectAll("g")
    .data(root.leaves())
    .enter().append("g")
    .attr("transform", d => ("translate(" + d.x0 + "," + d.y0 + ")"));

  const rectBox = cell.append("rect")
    .attr("id", d => (d.data.id))
    .attr("width", d => (d.x1 - d.x0))
    .attr("height", d => (d.y1 - d.y0))
    .attr("class","tile")
    .attr("data-name", d => (d.data.name))
    .attr("data-category", d => (d.data.category))
    .attr("data-value", d => (d.data.value))
    .attr("fill", (d,i) => (color(d.data.category)))
    .on("mouseover", (d, i) => {
      console.log(d);
      const category = d.data.category;

      tooltip.attr("id", "tooltip")
        .attr("data-value",d.data.value)
        .style("left", d3.event.pageX + 20 + "px")
        .style("top", d3.event.pageY + "px")
        .style("display", "inline-block")
        .style("opacity", 1)
        .html("Name: "+d.data.name + "<br>" + "Category: " + d.data.category + "<br>" + "Value: "+ d.data.value);
    })
    .on("mouseout", d => {
      tooltip.style("opacity", 0);
    });

  cell.append("text")
    .selectAll("tspan")
    .data( d => (d.data.name.split(/(?=[A-Z][^A-Z])/g)))
    .enter()
    .append("tspan")
    .attr("class","cell-title")
    .attr("x", 5)
    .attr("y", (d, i) => (20 + i * 15))
    .text(d => (d));

  const newData = root.leaves();
  const categories = [];

  newData.forEach(value => {
    if(categories.indexOf(value.data.category) === -1) {
      categories.push(value.data.category);
    }
  });

  const numberOfRectPerCoumn = 6;
  const heightPerRow = 55;
  const legendHeight = heightPerRow * numberOfRectPerCoumn;

  legendsvg = d3.select("#main")
    .append("svg")
    .attr("class", "svglegend")
    .attr("width", w)
    .attr("height", legendHeight)
    .attr("x", padding)
    .attr("y", h)
    .attr("id", "legend");


  legendsvg.selectAll("rect")
    .data(categories)
    .enter()
    .append("rect")
    .attr("class","legend-item")
    .attr("x", (d,i) => {
      const xOffset = parseInt(i / numberOfRectPerCoumn);
      return (xOffset * 200);
    })
    .attr("y", (d,i) => ((i % numberOfRectPerCoumn) * 51))
    .attr("width", 50)
    .attr("height", 50)
    .attr("fill", (d,i) => (color(d)));

  legendsvg.selectAll("text")
    .data(categories)
    .enter()
    .append("text")
    .attr("x", (d,i) => {
      const xOffset = parseInt(i / numberOfRectPerCoumn);
      return (xOffset * 200)+55;
    })
    .attr("y", (d,i) => (((i % numberOfRectPerCoumn) * 51) + 28))
    .text((d)=>d);
}

drawTree(getData());
