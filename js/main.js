var margin = {top: 80, right: 0, bottom: 10, left: 80},
    width = 720,
    height = 720;

var x = d3.scale.ordinal().rangeBands([0, width]),
    y = d3.scale.ordinal().rangeBands([0, width])
    z = d3.scale.linear().domain([0, 4]).clamp(true),
    c = d3.scale.category10().domain(d3.range(10));

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("margin-left", -margin.left + "px")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("./jsons/net.json", function(data) {
  var matrix = [],
      nodes = data.nodes,
      items = data.items,
      n = items.length;

  // Compute index per node.
  nodes.forEach(function(node, i) {
      node.index = i;
      node.count = 0;
      matrix[i] = d3.range(n).map(function(k) { return {x: i, y: k, z: 0}; });
  });
console.log(matrix);
  // Convert links to matrix; count character occurrences.
  data.links.forEach(function(link) {
    matrix[link.source][link.target].z = link.value;
  });

  // Precompute the orders.
  var orders_i = {
    id: d3.range(n).sort(function(a, b) { return d3.ascending(nodes[a].id, nodes[b].id); })
  };
  var orders_j = {
    id: d3.range(n).sort(function(a, b) { return d3.ascending(items[a].id, items[b].id); })
  };

  // The default sort order.
  x.domain(orders_i.id);
  y.domain(orders_j.id);
  console.log(matrix);
  svg.append("rect")
      .attr("class", "background")
      .attr("width", width)
      .attr("height", height);

  var row = svg.selectAll(".row")
      .data(items)
    .enter().append("g")
      .attr("class", "row")
      .attr("transform", function(d, i) { return "translate(0," + y(i) + ")"; })
      .each(row);

  row.append("line")
      .attr("x2", width);

  row.append("text")
      .attr("x", -6)
      .attr("y", y.rangeBand() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "end")
      .text(function(d, i) {
          console.log(i);
         return items[i].id; });

  var column = svg.selectAll(".column")
      .data(matrix)
    .enter().append("g")
      .attr("class", "column")
      .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

  column.append("line")
      .attr("x1", -width);

  column.append("text")
      .attr("x", 6)
      .attr("y", x.rangeBand() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "start")
      .text(function(d, i) { return nodes[i].id; });

  function row(row) {
    var cell = d3.select(this).selectAll(".cell")
        .data(row.filter(function(d) { return d.z; }))
      .enter().append("rect")
        .attr("class", "cell")
        .attr("x", function(d) { return x(d.x); })
        .attr("width", x.rangeBand())
        .attr("height", x.rangeBand())
        .style("fill-opacity", function(d) { return z(d.z); })
        .style("fill", function(d) { return nodes[d.x].group == nodes[d.y].group ? c(nodes[d.x].group) : null; })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);
  }

  function mouseover(p) {
    d3.selectAll(".row text").classed("active", function(d, i) { return i == p.y; });
    d3.selectAll(".column text").classed("active", function(d, i) { return i == p.x; });
  }

  function mouseout() {
    d3.selectAll("text").classed("active", false);
  }

    d3.select("#order_x").on("change", function() {
      clearTimeout(timeout);
      order_x(this.value);
    });

    d3.select("#order_y").on("change", function() {
      clearTimeout(timeout);
      order_y(this.value);
    });

    function order_x(value) {
      x.domain(orders[value]);

      var t = svg.transition().duration(2500);

      /*t.selectAll(".row")
          .delay(function(d, i) { return x(i) * 4; })
          .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
        .selectAll(".cell")
          .delay(function(d) { return x(d.x) * 4; })
          .attr("x", function(d) { return x(d.x); });*/
      t.selectAll('.cell')
          .delay(function(d) { return x(d.x) * 4; })
          .attr("x", function(d) { return x(d.x); })

      t.selectAll(".column")
          .delay(function(d, i) { return x(i) * 4; })
          .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
    }
      function order_y(value) {
        x.domain(orders[value]);

        var t = svg.transition().duration(2500);

        t.selectAll(".row")
            .delay(function(d, i) { return x(i) * 4; })
            .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
      }

  var timeout = setTimeout(function() {
    order_x("group");
    d3.select("#order").property("selectedIndex", 2).node().focus();
  }, 5000);
});
