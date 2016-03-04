angular.module('brainConnectivity')
.directive('circlePlot',function($routeParams,$location,probtrack){

	function link($scope,$attrs,$filter){
		$scope.plotParameters = {};
		$scope.plotParameters.threshold = 0;
		$scope.plotParameters.method = [true,false,false];
		$scope.plotParameters.diameter = 960;
		$scope.plotParameters.tension = 0.85;
		$scope.plotParameters.upperValue = 1;
		$scope.plotParameters.link1 = "";
		$scope.plotParameters.link2 = "";

		$scope.positionNodes = {};
		$scope.positionNodes.Left = {};
		$scope.positionNodes.Right = {};
		$scope.positionNodes.All = {};
		$scope.positionNodes.Left.scalePointLeft = 2.4;
		$scope.positionNodes.Right.scalePointRight = 2.4;
		$scope.positionNodes.All.scalePointAll = 1.85;

		$scope.positionNodes.Left.offsetXLeft = 70;
		$scope.positionNodes.Right.offsetXRight = 115;
		$scope.positionNodes.All.offsetXAll = 68;

		$scope.positionNodes.Left.offsetYLeft = 90;
		$scope.positionNodes.Right.offsetYRight = 92;
		$scope.positionNodes.All.offsetYAll = 58;

		$scope.plotID = _.uniqueId("divDiagram");

    	$scope.choices = [{"id":"average", "value":"1", "label":"Average", "checked":true}, {"id":"max", "value":"2","label":"Maximum","checked":false},{"id":"min", "value":"3","label":"Minumum","checked":false}];	 
		
		//Select method for Matrix processing : Average / Max values / Min values
		$scope.selectMethodMatrixProcess = function(){

			var method = $scope.plotParameters.method;
			console.log(method);
			var returnMethod;
			if(method[0] == true)
			{	
				returnMethod = "average";
			}
			else if ( method[1] == true )
			{
				returnMethod = "max";
			}
			else if( method[2] == true )
			{
				returnMethod = "min";
			}
			else if(method[0] == false && method[1] == false && method[2] == false)
			{	
				$scope.choices[0]["checked"]=true;
				$scope.plotParameters.method[0]=true;
				returnMethod = "average";
			}
			return returnMethod;
			};

		//Average connectivity matrix 
		$scope.AverageMatrix = function(matrix){
			
			var MatrixProc = [];
			matrix.forEach(function(line,i){
				var row = [];
				line.forEach(function(val,j)
				{
					if(i==j)
					{
						row.push(0);
					}
					else if (j>i)
					{
						var average;
						average = ( matrix[i][j] + matrix[j][i] ) /2;
						row.push(average);
					}
					else
					{
						row.push(-1);
					}
				})
				MatrixProc.push(row);
				})
			return MatrixProc;
			}

		//Connectivty matrix : maximum values
		$scope.MaximumMatrix = function(matrix){

				var MatrixProc = [];
				matrix.forEach(function(line,i){
						var row = [];
						line.forEach(function(val,j)
							{
								if(i==j)
								{
									row.push(0);
								}
								else if (j>i)
								{
									var max;
									if(matrix[i][j] > matrix[j][i])
									{
										max = matrix[i][j];
									}
									else{
										max = matrix[j][i];
									}
									row.push(max);
								}
								else
								{
									row.push(-1);
								}
							})
							MatrixProc.push(row);
						})
					return MatrixProc;
		}

		//Connectivty matrix : minimum values
		$scope.MinimumMatrix = function(matrix){

				var MatrixProc = [];
				matrix.forEach(function(line,i){
						var row = [];
						line.forEach(function(val,j)
							{
								if(i==j)
								{
									row.push(0);
								}
								else if (j>i)
								{
									var max;
									if(matrix[i][j] < matrix[j][i])
									{
										max = matrix[i][j];
									}
									else{
										max = matrix[j][i];
									}
									row.push(max);
								}
								else
								{
									row.push(-1);
								}
							})
							MatrixProc.push(row);
						})
					return MatrixProc;
		}


		//This function create the description object for d3 plotting
		$scope.CreateDescription = function(JSONInfo, checkbox){
				 if($scope.plotData)
		 		 {		 		 	
		 		 	console.log("valueCheck" + checkbox);
		 		 	var matrix = JSONInfo["matrix"];
		 		 	var MatProcess = [];
		 		 	//Process matrix 
		 		 	if(checkbox == "average")
		 		 	{
						MatProcess=$scope.AverageMatrix(matrix)
		 		 	}
		 		 	else if (checkbox == "max")
		 		 	{
		 		 		MatProcess=$scope.MaximumMatrix(matrix)
		 		 	}
		 		 	else
		 		 	{
		 		 		MatProcess=$scope.MinimumMatrix(matrix)
		 		 	}
		 			var seeds = JSONInfo["listOrdered"];
		 			var matrixDescription = [];
                
                	var sizeMat = seeds.length;
                	for (var nbseed = 0; nbseed<sizeMat; nbseed++)
                	{
                    	var jsonLine = {"name": seeds[nbseed]["name"] };
                    	var size = [];
                    	var imports = [];

                    	for (var j = 0; j<sizeMat; j++)
                    	{
                        	if(j != nbseed )
                        	{
                            	if(MatProcess[nbseed][j] > "0")
                            	{
                                	size.push(parseFloat(MatProcess[nbseed][j]));
                                	imports.push(seeds[j]);
                            	}
                        	}
                    	}
                    	jsonLine.size = size;
                    	jsonLine.imports = imports;
                    	matrixDescription.push(jsonLine);
               		 }
		 			return matrixDescription;
		 		}
		 }
		 
		 $scope.NewPlot = function(x,y,scale) { 
				if($scope.plotData){
		    	$scope.removeOldPlot();
		       	$scope.plotVisible = true  ;
		      	$scope.Plot();
		    }
		}

		  //This function remove circle plotm tooltips, and brain template plot 
		  //---This function is call when $scope variable are changing - before call Plot()
		  $scope.removeOldPlot = function()
		  {
		  	console.log("REMOVE");
		  	var circlePlot = document.getElementById("divPlot");
		  	circlePlot.parentNode.removeChild(circlePlot);
		  	var tooltipPlot = document.getElementById("tooltip");
		  	tooltipPlot.parentNode.removeChild(tooltipPlot);
		  	var allImg = document.getElementById("divBrainImgALL");
		  	allImg.parentNode.removeChild(allImg);
		  	var allLink = document.getElementById("divBrainLinkALL");
		  	allLink.parentNode.removeChild(allLink);
		  	var rightImg = document.getElementById("divBrainImgRight");
		  	rightImg.parentNode.removeChild(rightImg);
		  	var rightLink = document.getElementById("divBrainLinkRight");
		  	rightLink.parentNode.removeChild(rightLink);
		  	var leftImg = document.getElementById("divBrainImgLeft");
		  	leftImg.parentNode.removeChild(leftImg);
		  	var leftLink = document.getElementById("divBrainLinkLeft");
		  	leftLink.parentNode.removeChild(leftLink);
  		  }

		  //Main function -- this function plot brain connectivity on circle and on brain Template
		  $scope.Plot = function(){

		  	//Catch method used
		  	var method = $scope.selectMethodMatrixProcess();
		  	console.log(method + "method");

		  	//Data 
		    var JSONInfo = $scope.plotData;

		    //Create description object for d3 circle plot
		    var classes = $scope.CreateDescription(JSONInfo,$scope.selectMethodMatrixProcess());
		    
		    //Options
		    var thresholdDefaultValue = $scope.plotParameters.threshold;
		    var diameter = $scope.plotParameters.diameter;
		    var tensionSplines = $scope.plotParameters.tension;
		    var upperValue = $scope.plotParameters.upperValue;

		    //Alert if upper value specified is inferior to threshold value specified
		    if(upperValue != 0)
		    {
		    	if(upperValue <= thresholdDefaultValue) alert("The maximum upper value should be superior to the threshold value");

		    }
		    $scope.plotVisible = true ;
		    
		    var radius = diameter / 2,
		        innerRadius = radius - 120;

		    var cluster = d3.layout.cluster()
		        .size([360, innerRadius])
		        .sort(null)
		        .value(function(d) { return d.size; });

		    var bundle = d3.layout.bundle();

		    var line = d3.svg.line.radial()
		        .interpolate("bundle")
		        .tension(tensionSplines)
		        .radius(function(d) { return d.y; })
		        .angle(function(d) { return d.x / 180 * Math.PI; });

		    // Define the div for the tooltip
		    var div = d3.select('#'+$scope.plotID).append("div") 
		        .attr("class", "tooltip")
		        .attr("id", "tooltip")        
		        .style("opacity", 0);

		      var margin = {top: 30, right: 10, bottom: 15, left: 50},
		        width = 100 - margin.right - margin.left,
		        height = diameter;

		    var intDiameter = parseInt(diameter) + 50;
		    var diamMargin = intDiameter + 100;

		    var bottom = margin.bottom;
		    var newHeight = intDiameter +  bottom;

		    var divPlot = d3.select('#'+$scope.plotID).append("div")
		     	.attr("width", diamMargin)
		        .attr("height", newHeight)
		        .attr("class", "divPlot")
		        .attr("id", "divPlot");;

		    var splines = [];    
		    var svg = divPlot.append("svg")
		         .attr("width", intDiameter )
		         .attr("height", newHeight)
		        .attr("class", "circlePlot")
		        .attr("id", "circlePlot")   
		        .append("g")
		        .attr("transform", "translate(" + radius + "," + radius + ")");
		  
		    var y = d3.scale.linear()
		        .range([height/2, 0])
		        .domain([thresholdDefaultValue, upperValue]);	     

		    //Colorbar 
		    var svgColorbar = divPlot.append("svg")
		        .attr("width", 100)
		        .attr("height", newHeight+10)//+ margin.top + margin.bottom )
		        .attr("id", "colorBar")
		        .attr("class", "colorBar")
		      .append("g")
		        .attr("transform", "translate(" + margin.left + "," + newHeight/4 + ")");
		    
		    //Define gradient for color bar    
		    var gradient = svgColorbar.append("defs")
		      .append("linearGradient")
		        .attr("id", "gradient")
		        .attr("x1", "0%")
		        .attr("y1", "100%")
		        .attr("x2", "0%")
		        .attr("y2", "0%")
		        .attr("spreadMethod", "pad");

		    gradient.append("stop")
		        .attr("offset", "0%")
		        .attr("stop-color", d3.hsl(240,1,0.5))
		        .attr("stop-opacity", 1);

		    gradient.append("stop")
		        .attr("offset", "25%")
		        .attr("stop-color", d3.hsl(180,1,0.5))
		        .attr("stop-opacity", 1);

		    gradient.append("stop")
		        .attr("offset", "50%")
		        .attr("stop-color", d3.hsl(120,1,0.5))
		        .attr("stop-opacity", 1);

		    gradient.append("stop")
		        .attr("offset", "75%")
		        .attr("stop-color", d3.hsl(60,1,0.5))
		        .attr("stop-opacity", 1);
		        
		    gradient.append("stop")
		        .attr("offset", "100%")
		        .attr("stop-color", d3.hsl(0,1,0.5))
		        .attr("stop-opacity", 1);
		        
		    svgColorbar.append("rect")
		        .attr("class", "grid-background")
		        .attr("width", width/1.5)
		        .attr("height", height/2)
		        .style("fill", "url(#gradient)");

		    //Add gradient to colorbar
		    svgColorbar.append("g")
		        .attr("class", "axis")
		        .call(d3.svg.axis().scale(y).orient("left").ticks(10));


		     var nodes = cluster.nodes($scope.packageHierarchy(classes));
		      
		     //console.log(thresholdDefaultValue);
		     var links = $scope.packageImports(nodes,thresholdDefaultValue);
		     splines = bundle(links);
		     //console.log(splines);
		      
		      var size = $scope.sizeMap(nodes,thresholdDefaultValue);

		      var sizeOfLinksRatio = diameter/35;
		      var MinMax = upperValue - thresholdDefaultValue; 

		      var valLink1=$scope.plotParameters.link1;
		      var valLink2=$scope.plotParameters.link2;
		      var path = svg.selectAll(".link")
		          .data(splines)
		          .enter()
		            .append("path")
		          .attr("class", "link")
		          .attr("stroke-width", function(d, i) { return (size[i]*sizeOfLinksRatio+MinMax) + "px"; })
		          .attr("stroke",  function(d, i) { 
		          			if(size[i] >= upperValue)
		          			{
		          				return $scope.colorHSV("max",0,1);

		          			}
		          			else
		          			{
		          				return $scope.colorHSV(size[i],thresholdDefaultValue,upperValue); 	
		          			}
		          	})            
		          .attr("d", line)
		          .on("mouseover", function(d,i) {  
		          		var sized = d.length;
		          		valLink1=d[0].key;
		          		valLink2=d[sized-1].key;
		          		var Text1 = document.getElementById(valLink1);
		          		var Text2 = document.getElementById(valLink2);
		          		Text1.setAttribute("font-weight", "bold");
		          		Text2.setAttribute("font-weight", "bold");
		          		Text1.setAttribute("font-size", "13px");
		          		Text2.setAttribute("font-size", "13px");
		          	
		                div.transition()    
		                    .duration(200)    
		                    .style("opacity", .9);    
		                div.html( "Connectivity value : " + size[i].toFixed(5) ) 
		                    .style("left", (d3.event.pageX) + "px")   
		                    .style("top", (d3.event.pageY + 28) + "px");  
		                })          
		            .on("mouseout", function(d) {   
		            	var sized = d.length;
		          		valLink1=d[0].key;
		          		valLink2=d[sized-1].key;
		          		var Text1 = document.getElementById(valLink1);
		          		var Text2 = document.getElementById(valLink2);
		          		Text1.setAttribute("font-weight", "normal");
		          		Text2.setAttribute("font-weight", "normal");
		          		Text1.setAttribute("font-size", "11px");
		          		Text2.setAttribute("font-size", "11px");

		                div.transition()    
		                    .duration(500)    
		                    .style("opacity", 0); 
		            })
		          ;
		          console.log("VALLINK2" + valLink2);

		       svg.selectAll(".node")
		          .data(nodes.filter(function(n) { 
		          	//if(n.parent["depth"]==1)
		          //console.log(n) ;
		          	return !n.children; }))
		        .enter().append("g")
		          .attr("class", "node")
		          .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
		        .append("text")
		          .attr("id",function(d){ return d.key; })
		          .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
		          .attr("dy", ".31em")
		          .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
		          .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; }) 
		          //.attr("font-weight", "bold")      
		          .text(function(d) { 
		          	// if(d.key == "Precentral_L"){
		          	// 	d.attr("font-weight", "bold");
		          	// }
		          	return d.key; })
		          .attr("font-weight",function(d){
		          	if(d.key == valLink2 )
		          	{
		          		return "bold";
		          	}
		          else
		          {
		          	return "normal";
		          }
		          });

				//document.body.style.backgroundImage = "url('data/brainALL.jpg')";
		      d3.select(self.frameElement).style("height", diameter + "px");  

		     //Plot brain template -- if coord specified in Json table 
		    if(JSONInfo.listOrdered[1].x != undefined)  //should be improve
		     {
		     //Whole brain connection
		     var divBrainImgALL = d3.select("#divBrainALL")
		     	.append("div")
		     	.attr("class","divBrainImgALL")
		     	.attr("id","divBrainImgALL");

		     var divBrainLinkALL = d3.select("#divBrainALL")
		     	.append("div")
		     	.attr("class","divBrainLinkALL")
		     	.attr("id","divBrainLinkALL");

		     var svgBrain = d3.select("#divBrainLinkALL")
		     	.append("svg")
		    	.attr("width", 310 )
		        .attr("height", 325);
		     
		     var imgBrain = d3.select(".divBrainImgALL")
		     .append("img")
		     .attr("src","data/rsz_brainall.png")
		     .attr("class","bgimg")
		     .attr("width", "auto" )
		     .attr("height", "auto" )
		     .attr("max-width", 400 )
		     .attr("max-height", 400 );
			

			//Gradient for nodes 
		    var gradientCircle = svgBrain.append("defs")
		        .append("radialGradient")
		        .attr("id","blueCircle")
		        .attr("gradientUnits", "objectBoundingBox")
		        .attr("fx","30%")
		        .attr("fy","30%")

		       gradientCircle.append("stop")
		       .attr("offset","0%")
		       .attr("stop-color","#FFFFFF");

		       gradientCircle.append("stop")
		       .attr("offset","40%")
		       .attr("stop-color","#AA0000");

		       gradientCircle.append("stop")
		       .attr("offset","100%")
		       .attr("stop-color","#660000");

		       var nodeTooltip = d3.select('#'+$scope.plotID).append("div") 
		       .attr("class", "nodeTooltip")
		       .attr("id", "nodeTooltip")        
		       .style("opacity", 0);		       
		       var CoordDescription = JSONInfo["listOrdered"];

		       var linefunction = d3.svg.line()
		      				.interpolate("bundle")
		       			.tension(tensionSplines)
		        			.x(function(d){return d.x})
		        			.y(function(d){return d.y})

			splines.forEach(function(d,n){
		      		var sized = d.length;
		      		var seedName = d[0].key;
		      		var targetName = d[sized-1].key;
		      		var x1,x2,y1,y2;

		      		CoordDescription.forEach(function(c,i){

		      			var last = c["name"].lastIndexOf(".");
		               var KeyName = c["name"].substring(last+1);
		      			if(KeyName == seedName)
		      			{
		      				x1 = c["x"] + parseFloat($scope.positionNodes.All.offsetXAll);
		      				x1 = x1 * parseFloat($scope.positionNodes.All.scalePointAll);
		      				
		      				y1 = - c["y"];
		      				y1 = y1 + parseFloat($scope.positionNodes.All.offsetYAll);
		      				y1 = y1 * parseFloat($scope.positionNodes.All.scalePointAll);
		      			}
		      			else if(KeyName == targetName)
		      			{
		      				x2 = c["x"] + parseFloat($scope.positionNodes.All.offsetXAll);
		      				x2 = x2 * parseFloat($scope.positionNodes.All.scalePointAll);
		      				y2 = - c["y"];
		      				y2 = y2 + parseFloat($scope.positionNodes.All.offsetYAll);
		      				y2 = y2  * parseFloat($scope.positionNodes.All.scalePointAll);
		      			}
		      			
		      		})

		      		var line = [{"x":x1,"y":y1},{"x":x2,"y":y2}];
		      		var linkRatioBrain = 10
		      		var linegraph = svgBrain.append("path")
		        .attr("d",linefunction(line))
		        .attr("stroke",  function() { 
		         			if(size[n] >= upperValue)
		         			{
		         				return $scope.colorHSV("max",0,1);

		         			}
		         			else
		         			{
		         				return $scope.colorHSV(size[n],thresholdDefaultValue,upperValue); 	
		         			}
		         	})            
		        .attr("stroke-width",function() { return (size[n]*linkRatioBrain) + "px"; })
		        .attr("fill","none");
		         		
		      })


		       CoordDescription.forEach(function(d,i){
		       	var coordX = d["x"]+parseFloat($scope.positionNodes.All.offsetXAll);

		       	var coordY = -d["y"];
		       	coordY = coordY+parseFloat($scope.positionNodes.All.offsetYAll);

		       	svgBrain.append("circle")
		       		.attr("cx", coordX*parseFloat($scope.positionNodes.All.scalePointAll))
		       		.attr("cy", coordY*parseFloat($scope.positionNodes.All.scalePointAll))
		       		.attr("r", 4)
		        	.style("fill", "url(#blueCircle)")
		        	.on("mouseover", function(e,i) {  
		        		nodeTooltip.transition()    
		                   .duration(200)    
		                   .style("opacity", .9);  
		               var last = d["name"].lastIndexOf(".");
		               var KeyName = d["name"].substring(last+1);

		               nodeTooltip.html( "Seed : " + KeyName ) 
		                   .style("left", (d3.event.pageX) + "px")   
		                   .style("top", (d3.event.pageY) + "px");  
		        	})
		        	.on("mouseout", function(d) {   
		        			
		        			nodeTooltip.transition()    
		                   .duration(500)    
		                   .style("opacity", 0); 
		        	});
		       })	    	

		       //Left brain template
		      var divBrainImgLeft = d3.select(".divBrainLeft").append("div")
		     	.attr("class","divBrainImgLeft")
		     	.attr("id","divBrainImgLeft");

		     var divBrainLinkLeft = d3.select(".divBrainLeft").append("div")
		     	.attr("class","divBrainLinkLeft")
		     	.attr("id","divBrainLinkLeft");

		     var svgBrainLeft = divBrainLinkLeft.append("svg")
		    	.attr("width", 400 )
		        .attr("height", 350);
		     
		     var imgBrainLeft = divBrainImgLeft.append("img")
		     .attr("src","data/rsz_brainleft.jpg")
		     .attr("class","bgimg")
		     .attr("width", "auto" )
		     .attr("height", "auto" )
		     .attr("max-width", 400 )
		     .attr("max-height", 400 );
			
			splines.forEach(function(d,n){
		      		var sized = d.length;
		      		var seedName = d[0].key;
		      		var targetName = d[sized-1].key;
		      		var y1=0;
		      		var y2=0;
		      		var z1=0;
		      		var z2=0;

		      		console.log("Coord splines");

		       	var last1 = seedName.lastIndexOf("_");
		       	var End1 = seedName.substring(last1+1);
		       	var last2 = targetName.lastIndexOf("_");
		       	var End2 = targetName.substring(last2+1);
		      		if( End1 == "L" && End2 == "L" )
		      		{
		      			console.log("Coord splines");
		      			CoordDescription.forEach(function(c,i){

		      			var last = c["name"].lastIndexOf(".");
		               var KeyName = c["name"].substring(last+1);


		      			if(KeyName == seedName)
		      			{
		      				console.log(parseFloat(-c["y"]) + parseFloat($scope.positionNodes.Left.offsetXLeft));
		      				y1 = parseFloat(-c["y"]) + parseFloat($scope.positionNodes.Left.offsetXLeft);
		      				y1 = y1 * parseFloat($scope.positionNodes.Left.scalePointLeft);
		      				
		      				z1 = parseFloat(-c["z"]) + parseFloat($scope.positionNodes.Left.offsetYLeft);
		      				z1= z1 *  parseFloat($scope.positionNodes.Left.scalePointLeft);
		      			//	z1 = z1 + $scope.positionNodes.Left.offsetYLeft;
		      			//	z1 = z1 * $scope.positionNodes.Left.scalePointLeft;


		      			}
		      			else if(KeyName == targetName)
		      			{
		      				y2 = parseFloat(-c["y"]);
		      				y2 = y2 + parseFloat($scope.positionNodes.Left.offsetXLeft);
		      				y2 = y2 * parseFloat($scope.positionNodes.Left.scalePointLeft);
		      				
		      				z2 = parseFloat(-c["z"]);
		      				z2 = z2+ parseFloat($scope.positionNodes.Left.offsetYLeft);
		      				z2 = z2 * parseFloat($scope.positionNodes.Left.scalePointLeft);


		      			}
		      			
		      		})    				      		
		      		var line = [{"x":y1,"y":z1},{"x":y2,"y":z2}];
		      		var linkRatioBrain = 10
		      		var linegraph = svgBrainLeft.append("path")
		        			.attr("d",linefunction(line))
		        			.attr("stroke",  function() { 
		         				if(size[n] >= upperValue)
		         				{
		         					return $scope.colorHSV("max",0,1);
		         				}
		         				else
		         				{
		         					return $scope.colorHSV(size[n],thresholdDefaultValue,upperValue); 	
		         				}
		         			})            
		        			.attr("stroke-width",function() { return (size[n]*linkRatioBrain) + "px"; })
		        			.attr("fill","none");
		        				} 		
		      	})

		     CoordDescription.forEach(function(d,i){

		       	var name = d["name"];
		       	var last = d["name"].lastIndexOf("_");
		           var side = d["name"].substring(last+1);
		           if(side == "L")
		           {
		           	var coordY = parseFloat(-d["y"]);
		           	var coordY = coordY+parseFloat($scope.positionNodes.Left.offsetXLeft);

		       		var coordZ = parseFloat(-d["z"]);
		       		coordZ = coordZ+parseFloat($scope.positionNodes.Left.offsetYLeft);

		       		var coordXScale = coordY*parseFloat($scope.positionNodes.Left.scalePointLeft);
		       		var coordYScale = coordZ*parseFloat($scope.positionNodes.Left.scalePointLeft);
		       		console.log("coord");
		       		svgBrainLeft.append("circle")
		       			.attr("cx", coordXScale)
		       			.attr("cy", coordYScale)
		       			.attr("r", 4)
		        		.style("fill", "url(#blueCircle)")
		        		.on("mouseover", function(e,i) {  
		        				nodeTooltip.transition()    
		                   			.duration(200)    
		                   			.style("opacity", .9);  
		               		var last = d["name"].lastIndexOf(".");
		               		var KeyName = d["name"].substring(last+1);

		               		nodeTooltip.html( "Seed : " + KeyName ) 
		                   	.style("left", (d3.event.pageX) + "px")   
		                   	.style("top", (d3.event.pageY) + "px");  
		        				})
		        			.on("mouseout", function(d) {   
		        			
		        			nodeTooltip.transition()    
		                   .duration(500)    
		                   .style("opacity", 0); 
		        			});
		           }
		       })


				
	
		     var divBrainImgRight = d3.select(".divBrainRight").append("div")
		     	.attr("class","divBrainImgRight")
		     	.attr("id","divBrainImgRight");

		     var divBrainLinkRight = d3.select(".divBrainRight").append("div")
		     	.attr("class","divBrainLinkRight")
		     	.attr("id","divBrainLinkRight");

		     var svgBrainRight = divBrainLinkRight.append("svg")
		    	.attr("width", 450 )
		        .attr("height", 350);
		     
		     var imgBrainRight = divBrainImgRight.append("img")
		     .attr("src","data/rsz_brainright.jpg")
		     .attr("class","bgimg")
		     .attr("width", "auto" )
		     .attr("height", "auto" )
		     .attr("max-width", 400 )
		     .attr("max-height", 400 );

			splines.forEach(function(d,n){

		      	var sized = d.length;
		      	var seedName = d[0].key;
		      	var targetName = d[sized-1].key;
		      	var y1,y2,z1,z2;
		       	var last1 = seedName.lastIndexOf("_");
		       	var End1 = seedName.substring(last1+1);
		       	var last2 = targetName.lastIndexOf("_");
		       	var End2 = targetName.substring(last2+1);
		      		if( End1 == "R" && End2 == "R" )
		      		{
		      			CoordDescription.forEach(function(c,i){

		      			var last = c["name"].lastIndexOf(".");
		               var KeyName = c["name"].substring(last+1);


		      			if(KeyName == seedName)
		      			{
		      				y1 =  c["y"] 
		      				y1 = y1 + parseFloat($scope.positionNodes.Right.offsetXRight);
		      				y1 = y1 * parseFloat($scope.positionNodes.Right.scalePointRight);
		      				
		      				z1 = -c["z"];
		      				z1 = z1 + parseFloat($scope.positionNodes.Right.offsetYRight);
		      				z1 = z1 * parseFloat($scope.positionNodes.Right.scalePointRight);
		      			}
		      			else if(KeyName == targetName)
		      			{
		      				y2 = c["y"]
		      				y2 = y2 + parseFloat($scope.positionNodes.Right.offsetXRight);
		      				y2 = y2 * parseFloat($scope.positionNodes.Right.scalePointRight);
		      				
		      				z2 = -c["z"];
		      				z2 = z2 + parseFloat($scope.positionNodes.Right.offsetYRight);
		      				z2 = z2  * parseFloat($scope.positionNodes.Right.scalePointRight);
		      			}
		      			
		      		})

		      				      		

		      		var line = [{"x":y1,"y":z1},{"x":y2,"y":z2}];
		      		var linkRatioBrain = 10
		      		var linegraph = svgBrainRight.append("path")
		        .attr("d",linefunction(line))
		        .attr("stroke",  function() { 
		         			if(size[n] >= upperValue)
		         			{
		         				return $scope.colorHSV("max",0,1);
		         			}
		         			else
		         			{
		         				return $scope.colorHSV(size[n],thresholdDefaultValue,upperValue); 	
		         			}
		         	})            
		        .attr("stroke-width",function() { return (size[n]*linkRatioBrain) + "px"; })
		        .attr("fill","none");
		        	} 		
		      })

				CoordDescription.forEach(function(d,i){

		       	var name = d["name"];
		       	var last = d["name"].lastIndexOf("_");
		           var side = d["name"].substring(last+1);
		           if(side == "R")
		           {
		           	var coordY = d["y"];
		           	var coordY = coordY +parseFloat($scope.positionNodes.Right.offsetXRight);

		       		var coordZ = - d["z"];
		       		coordZ = coordZ+parseFloat($scope.positionNodes.Right.offsetYRight);
		       			       	
		       		svgBrainRight.append("circle")
		       			.attr("cx", coordY*parseFloat($scope.positionNodes.Right.scalePointRight))
		       			.attr("cy", coordZ*parseFloat($scope.positionNodes.Right.scalePointRight))
		       			.attr("r", 4)
		        			.style("fill", "url(#blueCircle)")
		        			.on("mouseover", function(e,i) {  
		        				nodeTooltip.transition()    
		                   			.duration(200)    
		                   			.style("opacity", .9);  
		               		var last = d["name"].lastIndexOf(".");
		               		var KeyName = d["name"].substring(last+1);

		               		nodeTooltip.html( "Seed : " + KeyName ) 
		                   	.style("left", (d3.event.pageX) + "px")   
		                   	.style("top", (d3.event.pageY) + "px");  
		        				})
		        			.on("mouseout", function(d) {   
		        			
		        			nodeTooltip.transition()    
		                   .duration(500)    
		                   .style("opacity", 0); 
		        			});
		           }
		       })
		     }
		  }

	//This function return a color accordinf to a value (size) a a range specified in inputs  
	$scope.colorHSV = function(size,Min,Max){
		if(size == "max")
		{
		  	var color = d3.hsl(0,1,0.5);
		} 
		else
		{
		  	var range = Max - Min; 
		  	var temp = size - Min;
		  	var alpha = temp/range ; 
			var hue = 240 * alpha ;
		    var color = d3.hsl(240-hue,1,0.5);
		}		  		
		return color;
	 }
		       
	//This function return the size of Map (connectivity description) according to a threshold value
	$scope.sizeMap = function (nodes,threshold) {
		    var size = [];
		    // Compute a map from name to node.
		      nodes.forEach(function(d) {
		       if (d.size) 
		        {
		          d.size.forEach(function(i) {
		          if (i > threshold) size.push(i);
		    		});
		        }
		  });    
		   return size;
		}

	// Lazily construct the package hierarchy from class names.
	$scope.packageHierarchy = function (classes) {
  		var map = {};
  		function find(name, data) {
    		var node = map[name], i;
    		if (!node) {
      			node = map[name] = data || {name: name, children: []};
     			 if (name.length) {
        			node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
        			node.parent.children.push(node);
        			node.key = name.substring(i + 1);
      				}
    			}
    		return node;
  		}
  		classes.forEach(function(d) {
    	find(d.name, d);
  	});
  	return map[""];
	}

// Return a list of imports for the given array of nodes.
$scope.packageImports = function (nodes, threshold) {
  var map = {},
      imports = [];
  // Compute a map from name to node.
  nodes.forEach(function(d) {
    map[d.name] = d;
  });

  // For each import, construct a link from the source to target node.
  nodes.forEach(function(d) {
    if (d.imports) d.imports.forEach(function(i,r) {
      if(d.size[r]>threshold)  {
      	imports.push({source: map[d.name], target: map[i["name"]]});
      }
    });
  });
  return imports;
}

		
	//Watch scope variable
		$scope.$watch("positionNodes.Left.scalePointLeft", function(){
		    console.log("HelloWatch scaleLeft", $scope.positionNodes.Left.scalePointLeft);
		    $scope.NewPlot();
		  });

		$scope.$watch("positionNodes.Left.offsetXLeft", function(){
		    console.log("HelloWatch offsetXLeft", $scope.positionNodes.Left.offsetXLeft);
		    $scope.NewPlot();
		  });

		$scope.$watch("positionNodes.Left.offsetYLeft", function(){
		    console.log("HelloWatch offsetYLeft", $scope.positionNodes.Left.offsetYLeft);
		    $scope.NewPlot();
		  });

		$scope.$watch("positionNodes.All.scalePointAll", function(){
		    console.log("HelloWatch scaleAll", $scope.positionNodes.All.scalePointAll);
		    $scope.NewPlot();
		  });

		$scope.$watch("positionNodes.All.offsetXAll", function(){
		    console.log("HelloWatch offsetXAll", $scope.positionNodes.All.offsetXAll);
		    $scope.NewPlot();
		  });

		$scope.$watch("positionNodes.All.offsetYAll", function(){
		    console.log("HelloWatch offsetYAll", $scope.positionNodes.All.offsetYAll);
		    $scope.NewPlot();
		  });

		$scope.$watch("positionNodes.Right.scalePointRight", function(){
		    console.log("HelloWatch scaleRight", $scope.positionNodes.Right.scalePointRight);
		    $scope.NewPlot();
		  });

		$scope.$watch("positionNodes.Right.offsetXRight", function(){
		    console.log("HelloWatch offsetXRight", $scope.positionNodes.Right.offsetXRight);
		    $scope.NewPlot();
		  });

		$scope.$watch("positionNodes.Right.offsetYRight", function(){
		    console.log("HelloWatch offsetYRight", $scope.positionNodes.Right.offsetYRight);
		    $scope.NewPlot();
		  });


		$scope.$watch("plotParameters.link1", function(){
		    console.log("HelloWatch tooltip", $scope.plotParameters.link1);
		    $scope.NewPlot();
		  });

		$scope.$watch("plotParameters.link2", function(){
		    console.log("HelloWatch tooltip", $scope.plotParameters.link2);
		    $scope.NewPlot();
		  });


		$scope.$watch("plotParameters.threshold", function(){
		    console.log("HelloWatch thres", $scope.plotParameters.threshold);
		    $scope.NewPlot();
		  });

		$scope.$watch("plotParameters.diameter", function(){
		    console.log("HelloWatch diam", $scope.plotParameters.diameter);
		    $scope.NewPlot();
		  });

		$scope.$watch("plotParameters.tension", function(){
		    console.log("HelloWatch tension", $scope.plotParameters.tension);
		    $scope.NewPlot();
		  });

		$scope.$watch("plotParameters.upperValue", function(){
		    console.log("HelloWatch upper", $scope.plotParameters.upperValue);
		    $scope.NewPlot();
		  });

		//Checkboxes
		$scope.$watch("plotParameters.method[0]", function(){

		    if($scope.plotParameters.method[0]==true)
		    {
		    	$scope.choices[1]["checked"]=false;
		    	$scope.choices[2]["checked"]=false;
		    	$scope.plotParameters.method[1]=false;
		    	$scope.plotParameters.method[2]=false;
		    }
		    console.log("HelloWatch processvalue", $scope.plotParameters.method);
		    $scope.NewPlot();
		  });

		$scope.$watch("plotParameters.method[1]", function(){
		    
		    if($scope.plotParameters.method[1]==true)
		    {
		    	$scope.choices[0]["checked"]=false;
		    	$scope.choices[2]["checked"]=false;
		    	$scope.plotParameters.method[0]=false;
		    	$scope.plotParameters.method[2]=false;
		    }
		    console.log("HelloWatch processvalue", $scope.plotParameters.method);
		    $scope.NewPlot();
		  });

		$scope.$watch("plotParameters.method[2]", function(){
		     if($scope.plotParameters.method[2]==true)
		    {
		    	$scope.choices[0]["checked"]=false;
		    	$scope.choices[1]["checked"]=false;
		    	$scope.plotParameters.method[0]=false;
		    	$scope.plotParameters.method[1]=false;
		    }
		    $scope.NewPlot();
		    console.log("HelloWatch processvalue", $scope.plotParameters.method);
		  });

		$scope.$watch("plotData", function()
			{
			if($scope.plotData){
				$scope.plotParameters.plotData = $scope.plotData;
				$scope.Plot();
			}
			});		
	}

  return {
    restrict : 'E',
    scope: {
    	plotData : "="
    },
    link : link,
    templateUrl: 'views/directives/directiveCirclePlotTemplate.html'


  }
});