d3.layout.ringnet = function() {
  var ringnet = {}, size = [ 1, 1 ], items = [], links = [], anchors = [], trajectory = [];
  
  ringnet.layout = function() {
  		if(items.length == 0 || links.length == 0 || 
  			anchors.length == 0 || trajectory.length == 0) {
  			return;
  		}
		
		var fixedcnt = 20;
		var cx = size[0] / 2.0, cy = size[1] / 2.0;
		var radii = Math.min(cx, cy);
		var dtheta = 2 * Math.PI / fixedcnt;
		
		for(var i = 0; i < anchors.length; ++i) {
			anchors[i].x = cx + 0.9 * radii * Math.cos(dtheta * i);
			anchors[i].y = cy + 0.9 * radii * Math.sin(dtheta * i);
			anchors[i].fixed = true;
		}
		
		for(var i = 0; i < items.length; ++i) {
			items[i].x = Math.random() * 0.9  * size[0];
			items[i].y = Math.random() * 0.9  * size[1];
			items[i].fixed = false;
		}
				
		var epsilon = 1E-5;
		var changed = true;
		while (changed){
			changed = false;
			var i;
			for (i = 0; i < items.length; i++) {
				var X = 0
				var Y = 0
				console.log(items[i].name);
				items[i].neighbors.forEach(function(n) {
					X += n.x;
					Y += n.y;
				});
				
				X = X/items[i].neighbors.length;
				Y = Y/items[i].neighbors.length;
				
				if (Math.abs(X-items[i].x) > epsilon || Math.abs(Y-items[i].y) > epsilon) {
					items[i].x = X;
					items[i].y = Y;
					changed = true;
				}
			}
		}
		
	  	return ringnet;
  };
  
  ringnet.clearindex = function() {
	   // build index
	  links.forEach(function(e){
	    	items[e.source].neighbors = [];
			items[e.target].neighbors = [];
	  });
	  return ringnet;
  }
  
  var cnt = 0;
  ringnet.index = function() {
		 // build index
		links.forEach(function(e){
		  	var node1 = items[e.source];
		  	var node2 = items[e.target];
		  	
		  			  	
		  	cnt ++;
		  	if(cnt==55){
		  		console.log(cnt);
		  	}
		  	
		  	if(node1.neighbors == undefined || node1.neighbors == null) {
		  		node1.neighbors = [];
		  	}
		  	node1.neighbors.push(node2);
		  	
		  	if(node2.neighbors == undefined || node2.neighbors == null) {
		  		node2.neighbors = [];
		  	}
		  	node2.neighbors.push(node1);
		});
		return ringnet;
  };
  
  ringnet.anchors = function(x) {
  	if(!arguments.length) return anchors;
  	anchors = x;
  	return ringnet;
  };
  
  ringnet.items = function(x) {
  	if(!arguments.length) return items;
  	items = x;
  	return ringnet;
  };
  
  ringnet.links = function(x) {
    if (!arguments.length) return links;
    links = x;
    return ringnet;
  };
  
  ringnet.trajectory = function(x) {
  	if (!arguments.length) return trajectory;
  	trajectory = x;
  	return ringnet;
  };
  
  ringnet.size = function(x) {
    if (!arguments.length) return size;
    size = x;
    return ringnet;
  };
  return ringnet;
};

var width = 500,
    height = 500;

var color = d3.scale.category20();

var ringnet = d3.layout.ringnet()
    .size([width, height]);

var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("http://localhost:8000/static/css/topic.json", function(json) {
  ringnet
      .anchors(json.anchors)
      .items(json.items)
      .links(json.links)
      .trajectory(json.trajectories)
      .index()
      .layout();
      
var nodes = ringnet.nodes();

var link = svg.selectAll("line.link")
	.data(json.links)
	.enter().append("line")
	.attr("class", "link")
	.style("stroke-width", function(d) { return Math.sqrt(d.value); })
	.attr("x1", function(d) { return nodes[d.source].x; })
	.attr("y1", function(d) { return nodes[d.source].y; })
	.attr("x2", function(d) { return nodes[d.target].x; })
	.attr("y2", function(d) { return nodes[d.target].y; });
      
var node = svg.selectAll("circle.node")
	.data(json.nodes)
	.enter().append("circle")
	.attr("class", "node")
	.attr("r", 5)
	.style("fill", function(d) { return color(d.group);})
	.attr("cx", function(d) { return d.x; })
	.attr("cy", function(d) { return d.y; });
	
	node.append("title").text(function(d) { return d.name; });   
});
