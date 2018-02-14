var margin = {top: 80, right: 0, bottom: 10, left: 80},
    width = 720,
    height = 720;

var x = d3.scale.ordinal().rangeBands([0, width]),
    y = d3.scale.ordinal().rangeBands([0, width])
    z = d3.scale.linear().domain([0, 5]).clamp(true),
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
      n_nodes = nodes.length,
      n = items.length;

  // Compute index per node.
  nodes.forEach(function(node, i) {
      node.index = i;
      node.count = 0;
      matrix[i] = d3.range(n).map(function(k) { return {x: i, y: k, z: 0}; });
  });

  // Convert links to matrix; count character occurrences.
  data.links.forEach(function(link) {
    matrix[link.source][link.target].z = link.value;
  });

  // Precompute the orders.
  var orders_i = {
    id: d3.range(n_nodes).sort(function(a, b) { return d3.ascending(nodes[a].id, nodes[b].id); }),
    gender: d3.range(n_nodes).sort(function(a, b) { return d3.ascending(nodes[a].gender, nodes[b].gender); }),
  };
  var orders_j = {
    id: d3.range(n).sort(function(a, b) { return d3.ascending(items[a].id, items[b].id); }),
    gendre:d3.range(n).sort(function(a, b) { return d3.ascending(items[a].gendre, items[b].gendre); })
  };

  // The default sort order.
  y.domain(orders_i.id);
  x.domain(orders_j.id);
  svg.append("rect")
      .attr("class", "background")
      .attr("width", width)
      .attr("height", height);

  var row = svg.selectAll(".row")
      .data(matrix)
    .enter().append("g")
      .attr("class", "row")
      .attr("transform", function(d, i) {
        return "translate(0," + y(i) + ")"; })
      .each(row);

  row.append("line")
      .attr("x2", width);

  row.append("text")
      .attr("x", -6)
      .attr("y", y.rangeBand() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "end")
      .text(function(d, i) {return nodes[i].id; });

  var column = svg.selectAll(".column")
      .data(items)
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
      .text(function(d, i) { return items[i].id; });

  // Define the div for the tooltip
  var div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  function row(row) {
    var cell = d3.select(this).selectAll(".cell")
        .data(row.filter(function(d) { return d.z; }))
      .enter().append("rect")
        .attr("class", "cell")
        .attr("x", function(d) {
          return x(d.y); })
        .attr("width", x.rangeBand())
        .attr("height", y.rangeBand())
        //.style("fill-opacity", function(d) { return z(d.z); })
        .style("fill", function(d) { return c(z(d.z)); })
        .on("mouseover", function(d) {
          console.log(d3.event.pageX,x(d.y));
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div	.html('Usuari: '+d.x + "  Sexe:"+nodes[d.x].gender+"<br/>"  + "Pel·licula: "+d.y+ "  Gènere:"+items[d.y].gendre+"<br/>"+"Rating: "+d.z)
                .style("left", d3.event.pageX-320 + "px")
                .style("top", d3.event.pageY-15 + "px");
            })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
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
      //console.log(this.value);
      order_x(this.value);
    });

    d3.select("#order_y").on("change", function() {
      clearTimeout(timeout);
      order_y(this.value);
    });

    function order_x(value) {
      x.domain(orders_j[value]);

      var t = svg.transition().duration(2500);

      /*t.selectAll(".row")
          .delay(function(d, i) { return x(i) * 4; })
          .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
        .selectAll(".cell")
          .delay(function(d) { return x(d.x) * 4; })
          .attr("x", function(d) { return x(d.x); });*/
      t.selectAll('.cell')
          .delay(function(d) { return x(d.y) * 4; })
          .attr("x", function(d,i) {
            return x(d.y); })

      t.selectAll(".column")
          .delay(function(d, i) { return x(i) * 4; })
          .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
    }
      function order_y(value) {
        y.domain(orders_i[value]);

        var t = svg.transition().duration(2500);

        t.selectAll(".row")
            .delay(function(d, i) { return y(i) * 4; })
            .attr("transform", function(d, i) { return "translate(0," + y(i) + ")"; })
      }

  var timeout = setTimeout(function() {
    order_x("group");
    d3.select("#order").property("selectedIndex", 2).node().focus();
  }, 5000);
});
