// Program2
// CylTree.js
/**
 * Created by Fahim Hasan Khan
 * Date: 10/29/2019
 * DISCLAIMER: Use at your own risk. There's more than one way to implement this. So, this method may be completely different than yours, your data structure, your coding style, etc. and may also require time to adapt to your code, etc. It is highly recommended the use it as a guide to complete your version (if necessary), or use it as it is and expand to add functionality for remaining assignments.
 */

// Vertex shader program
var VSHADER_SOURCE =
	'attribute vec3 a_Position;\n' +
	'attribute vec3 a_Normal;\n' +
	'attribute vec4 a_Color;\n' +
	'uniform mat4 u_NormalMat, u_Projection, u_ModelView;\n' +
	'uniform vec4 u_Translation;\n' +
	'varying vec3 v_NormalInterp;\n' +
	'varying vec3 v_VertPos;\n' +
	'uniform int u_Mode;   // Rendering mode\n' +
	'uniform int u_PickedTree;\n' +
	'uniform bool u_Phong;\n' +
	'uniform float u_Id;\n' +
	'uniform vec3 u_Ka;   // Ambient reflection coefficient\n' +
	'uniform vec3 u_Kd;   // Diffuse reflection coefficient\n' +
	'uniform vec3 u_Ks;   // Specular reflection coefficient\n' +
	'varying float v_Id;		// ID for the tree\n' +
	'uniform float u_ShininessVal; // Shininess\n' +
	'// Material color\n' +
	'uniform vec4 u_Color;\n' +
	'uniform vec3 u_LightColor;\n' +
	'uniform vec3 u_LightDirection; // Light direction;\n' +
	'varying vec4 v_Color; //color\n' +
	'\n' +
	'void main()	{\n' +
	'	 if(u_Phong) {\n' +
	'	 	 vec4 vertPos4 = u_ModelView * (vec4(a_Position, 1.0) + u_Translation);\n' +
  '		 v_VertPos = vec3(vertPos4) / vertPos4.w;\n' +
  '		 v_NormalInterp = vec3(u_NormalMat * vec4(a_Normal, 0.0));\n' +
  '		 gl_Position = u_Projection * vertPos4;\n' +
  '		 return;\n' +
	'	 }\n' +
	'	 vec4 vertPos4 = u_ModelView * (vec4(a_Position, 1.0) + u_Translation);\n' +
  '	 v_VertPos = vec3(vertPos4) / vertPos4.w;\n' +
  '	 v_NormalInterp = vec3(u_NormalMat * vec4(a_Normal, 0.0));\n' +
  '	 gl_Position = u_Projection * vertPos4;\n' +
	'  vec3 N = normalize(v_NormalInterp);\n' +
	'  vec3 L = normalize(u_LightDirection);\n' +
	'  // Lambert\'s cosine law\n' +
	'  float lambertian = max(dot(N, L), 0.0);\n' +
	'  float specular = 0.0;\n' +
	'  if(lambertian > 0.0) {\n' +
	'    vec3 R = reflect(-L, N);      // Reflected light vector\n' +
	'    vec3 V = normalize(-v_VertPos); // Vector to viewer\n' +
	'    // Compute the specular term\n' +
	'    float specAngle = max(dot(R, V), 0.0);\n' +
	'    specular = pow(specAngle, u_ShininessVal);\n' +
	'  }\n' +
	'  v_Color = vec4(u_Ka * u_LightColor +\n' +
	'               u_Kd * lambertian * u_LightColor +\n' +
	'               u_Ks * specular * u_LightColor, 1.0);\n' +
	'\n' +
	'  // only ambient\n' +
	'  if(u_Mode == 2) v_Color = vec4(u_Ka * u_LightColor, 1.0);\n' +
	'  // only diffuse\n' +
	'  if(u_Mode == 3) v_Color = vec4(u_Kd * lambertian * u_LightColor, 1.0);\n' +
	'  // only specular\n' +
	'  if(u_Mode == 4) v_Color = vec4(u_Ks * specular * u_LightColor, 1.0);\n' +
	'  v_Id = u_Id;\n' +  
  '	 int id = int(u_Id);\n' +
	'	 vec3 color = (id == u_PickedTree) ? vec3(0, 1, 0):v_Color.rgb;\n'+
	'  if(u_PickedTree == 0) {\n' + // Insert face numbe0r into alpha
  '    v_Color = vec4(color, 1);\n' +
  '  }\n' +
  'else {\n' +
  '    v_Color = vec4(color, v_Color.a);\n' +
  '  }\n' +
	'}'


// Fragment shader program
var FSHADER_SOURCE =
	'precision highp float;\n' +
	'precision highp int;\n' +
	'varying vec4 v_Color;\n' +
	'varying vec3 v_NormalInterp;\n' +
	'varying vec3 v_VertPos;\n' +
	'uniform int u_Mode;   // Rendering mode\n' +
	'uniform int u_PickedTree;\n' +
	'uniform bool u_Phong;\n' +
	'uniform float u_Id;\n' +
	'uniform vec3 u_Ka;   // Ambient reflection coefficient\n' +
	'uniform vec3 u_Kd;   // Diffuse reflection coefficient\n' +
	'uniform vec3 u_Ks;   // Specular reflection coefficient\n' +
	'varying float v_Id;		// ID for the tree\n' +
	'uniform float u_ShininessVal; // Shininess\n' +
	'// Material color\n' +
	'uniform vec4 u_Color;\n' +
	'uniform vec3 u_LightColor;\n' +
	'uniform vec3 u_LightDirection; // Light direction;\n' +
	'void main() {\n' +
	'	 if(!u_Phong) {\n' +
	'  	 gl_FragColor = v_Color;\n' +
  '		 return;\n' +
	'	 }\n' +
	'  vec3 N = normalize(v_NormalInterp);\n' +
	'  vec3 L = normalize(u_LightDirection);\n' +
	'  // Lambert\'s cosine law\n' +
	'  float lambertian = max(dot(N, L), 0.0);\n' +
	'  float specular = 0.0;\n' +
	'  if(lambertian > 0.0) {\n' +
	'    vec3 R = reflect(-L, N);      // Reflected light vector\n' +
	'    vec3 V = normalize(-v_VertPos); // Vector to viewer\n' +
	'    // Compute the specular term\n' +
	'    float specAngle = max(dot(R, V), 0.0);\n' +
	'    specular = pow(specAngle, u_ShininessVal);\n' +
	'  }\n' +
	'  gl_FragColor = vec4(u_Ka * u_LightColor +\n' +
	'               u_Kd * lambertian * u_LightColor +\n' +
	'               u_Ks * specular * u_LightColor, 1.0);\n' +
	'\n' +
	'  // only ambient\n' +
	'  if(u_Mode == 2) gl_FragColor = vec4(u_Ka * u_LightColor, 1.0);\n' +
	'  // only diffuse\n' +
	'  if(u_Mode == 3) gl_FragColor = vec4(u_Kd * lambertian * u_LightColor, 1.0);\n' +
	'  // only specular\n' +
	'  if(u_Mode == 4) gl_FragColor = vec4(u_Ks * specular * u_LightColor, 1.0);\n' +
//	'  v_Id = u_Id;\n' +  
//  '	 int id = int(u_Id);\n' +
//	'	 vec3 color = (id == u_PickedTree) ? vec3(0, 1, 0):v_Color.rgb;\n'+
//	'  if(u_PickedTree == 0) {\n' + // Insert face numbe0r into alpha
//  '    v_Color = vec4(color, 1);\n' +
//  '  }\n' +
//  'else {\n' +
//  '    v_Color = vec4(color, v_Color.a);\n' +
//  '  }\n' +
	'}'

var g_points = [];  // The array for the position of a mouse press
var mode = 0;
var view = 1;
var proj = 0;
var smooth = 0;
var phong = 0;
var u_PickedTree;
var aspectRatio = 1;
var SpanX = 200;
var SpanY = 200;
var u_NormalMat;

function main() {
	// Retrieve <canvas> element
	var canvas = document.getElementById('webgl');
	canvas.oncontextmenu = () => false;
	aspectRatio = canvas.width/canvas.height;
	// Get the rendering context for WebGL
	var gl = getWebGLContext(canvas);
	if (!gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}
	
	var checkbox1 = document.getElementById("myCheck1");
		checkbox1.addEventListener('change', function () {
			if (checkbox1.checked) {
				view = 0;
				console.log("Sideview");
				draw(gl, u_ModelView, u_Projection);
			} 
			else {
				view = 1;
				console.log("Topview");
				draw(gl, u_ModelView, u_Projection);
			}
		});	
	
	var checkbox2 = document.getElementById("myCheck2");
		checkbox2.addEventListener('change', function () {
			if (checkbox2.checked) {
				console.log("Solid");
				mode = 1;
				draw(gl, u_ModelView, u_Projection);
			} 
			else {
				mode = 0;
				console.log("Wireframe");
				draw(gl, u_ModelView, u_Projection);
			}
		});	
	
	var checkbox4 = document.getElementById("myCheck4");
		checkbox4.addEventListener('change', function () {
			if (checkbox4.checked) {
				proj = 1;
				console.log("Orthographic");
				draw(gl, u_ModelView, u_Projection);
			} 
			else {
				proj = 0;
				console.log("Perspective");
				draw(gl, u_ModelView, u_Projection);
			}
		});	
	var checkbox5 = document.getElementById("myCheck5");
		checkbox5.addEventListener('change', function () {
		if (checkbox5.checked) {
			smooth = 1;
			console.log("Smooth");
			draw(gl, u_ModelView, u_Projection);
		} 
		else {
			smooth = 0;
			console.log("Flat");
			draw(gl, u_ModelView, u_Projection);
		}
	});	
	var checkbox6 = document.getElementById("myCheck6");
		checkbox6.addEventListener('change', function () {
		if (checkbox6.checked) {
			phong = 1;
			console.log("Phong");
			gl.uniform1i(u_Phong, phong);
			if (!initShaders(gl, FSHADER_SOURCE, VSHADER_SOURCE)) {
				console.log('Failed to intialize shaders.');
				return;
			}
			gl.uniform1i(u_Phong, phong);
			draw(gl, u_ModelView, u_Projection);
		} 
		else {
			phong = 0;
			console.log("Gourand");
			gl.uniform1i(u_Phong, phong);
			if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
				console.log('Failed to intialize shaders.');
				return;
			}
			gl.uniform1i(u_Phong, phong);
			draw(gl, u_ModelView, u_Projection);
		}
	});
	var submit = document.getElementById('loadbutton');
		submit.addEventListener('click', function () {
				draw(gl, u_ModelView, u_Projection);
		});

	// Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Failed to intialize shaders.');
		return;
	}
	var u_Id = gl.getUniformLocation(gl.program, 'u_Id');
	if (!u_Id) {
		console.log('Failed to get the storage location of u_Id');
		return;
	}
	gl.uniform1f(u_Id, -1);
	var u_Phong = gl.getUniformLocation(gl.program, 'u_Phong');
	if (!u_Phong) {
		console.log('Failed to get the storage location of u_Phong');
		return;
	}
	gl.uniform1i(u_Phong, 0);
	// Specify the color for clearing <canvas>
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	u_PickedTree = gl.getUniformLocation(gl.program, 'u_PickedTree');
	if (!u_PickedTree) { 
	  console.log('Failed to get uniform variable(s) storage location');
	  return;
	}
	// Get the storage locations of u_ViewMatrix and u_ProjMatrix variables and u_Translate
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
	if (!u_LightDirection) { 
	  console.log('Failed to get uniform variable(s) storage location');
	  return;
	}
	 // Set the light color (white)
	gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
	// Set the light direction (in the world coordinate)
	var lightDirection = new Vector3([1, 1, 1]);
	lightDirection.normalize();     // Normalize
	gl.uniform3fv(u_LightDirection, lightDirection.elements);

	var u_ModelView = gl.getUniformLocation(gl.program, 'u_ModelView');
	var u_Projection = gl.getUniformLocation(gl.program, 'u_Projection');
	if (!u_Projection) { 
	 	console.log('Failed to get u_Projection storage location');
  	return;
	}
	if (!u_ModelView) { 
	 	console.log('Failed to get u_ModelView storage location');
  	return;
	}
	// Register function (event handler) to be called on a mouse press
  u_NormalMat = gl.getUniformLocation(gl.program, 'u_NormalMat');
	if (!u_NormalMat) { 
	  console.log('Failed to get uniform variable(s) storage location');
	  return;
	}  
	var modelMatrix = new Matrix4();   // Model matrix
	var normalMat = new Matrix4();  // Transformation matrix for normal
	var modelViewInv = new Matrix4();
	var modelView = new Matrix4();
	
	// Calculate the model matrix
	modelMatrix.setTranslate(0, 0, 0); // Translate to y-axis direction
	modelMatrix.rotate(0, 0, 0, 1);   // Rotate around the z-axis
	
	// Calculate matrix to transform normal based on the model matrix
	normalMat.setInverseOf(modelMatrix);
	normalMat.transpose();
  modelViewInv.setInverseOf(modelView);
  normalMat.transpose(modelViewInv);
//  mat4Transpose(modelviewInv, normalmatrix);
	// Pass the transformation matrix for normal to u_NormalMatrix
	gl.uniformMatrix4fv(u_NormalMat, false, normalMat.elements);

	canvas.onmousedown = function(ev){ click(ev, gl, canvas, u_ModelView, u_Projection); };
	draw(gl, u_ModelView, u_Projection);
}

function setViewMatrix(gl, u_ModelView, u_Projection){
	var projection = new Matrix4();
	var modelView = new Matrix4();
	if (proj == 0){
		projection.setOrtho(-SpanX, SpanX, -SpanY, SpanY, -1000, 1000);
	}
	else {
		projection.setPerspective(60, aspectRatio, 1, 2000);
	}
	if (view == 0){
		modelView.setLookAt(0, -400, 75, 0, 1, 0, 0, 0, 1);
	}
	else {
		modelView.setLookAt(0, 0, 400, 0, 0, 0, 0, 1, 0);		
	}

	var normalMat = new Matrix4();  // Transformation matrix for normal
	var modelViewInv = new Matrix4();
	
	// Calculate matrix to transform normal based on the model matrix
	normalMat.setInverseOf(modelView);
	normalMat.transpose();
  modelViewInv.setInverseOf(modelView);
  normalMat.transpose(modelViewInv);
	// Pass the transformation matrix for normal to u_NormalMatrix
	gl.uniformMatrix4fv(u_NormalMat, false, normalMat.elements);
	gl.uniformMatrix4fv(u_Projection, false, projection.elements);
	gl.uniformMatrix4fv(u_ModelView, false, modelView.elements);
}

function save(filename) {
	var savedata = document.createElement('a');
	savedata.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(g_points));
	savedata.setAttribute('download', filename);
	savedata.style.display = 'none';
	document.body.appendChild(savedata);
	savedata.click();
	document.body.removeChild(savedata);
}

function load() {
		var Loadfile = document.getElementById("loadscene").files[0];
		var reader = new FileReader();
		reader.readAsText(Loadfile);
		reader.onload = function () {
				var len = this.result.length;
				var data = this.result.slice(1, len);
				var xyb = data.split(',');
				for (var i = 0; i < xyb.length; i=i+3) {
			g_points.push(([parseFloat(xyb[i]), parseFloat(xyb[i+1]), parseFloat(xyb[i+2])]));
				}
		};	
		console.log("g_points: ", g_points);
}

function click(ev, gl, canvas, u_ModelView, u_Projection) {
	
  // Write the positions of vertices to a vertex shader
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();
  var btn = ev.button;
  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  var x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
 	 // Store the coordinates to g_points array
 	 g_points.push([x, y, btn]);
 	 console.log(g_points);
 	 checkTree(gl, x, y, u_ModelView, u_Projection);
		//  drawTree(gl, u_ModelView, u_Projection, [x, y, btn]);
 	// draw(gl, u_ModelView, u_Projection);
}

function draw(gl, u_ModelView, u_Projection) {
	setViewMatrix(gl, u_ModelView, u_Projection);
	var len = g_points.length;
	for(var i = 0; i < len; i++) {
		var xy = g_points[i];
		drawTree(gl, u_ModelView, u_Projection, xy);
	}
}

function drawTree(gl, u_ModelView, u_Projection, xy) {
	if(xy[2] == 0)
	var v = new Float32Array(treeR3);
	else
	var v = new Float32Array(treeR4);  
 
	var n = v.length;
	//console.log(n);
	var r1 = 0;
	var r2 = 0;
	for(var i = 0; i < n; i=i+6) {
		var d = Math.sqrt((v[i]-v[i+3])*(v[i]-v[i+3])+(v[i+1]-v[i+4])*(v[i+1]-v[i+4])+(v[i+2]-v[i+5])*(v[i+2]-v[i+5]));
		drawCylinder(gl, u_ModelView, u_Projection, v[i],v[i+1],v[i+2], v[i+3],v[i+4],v[i+5], d, xy);
	}
}

function drawCylinder(gl, u_ModelView, u_Projection, x1, y1, z1, x2, y2, z2, d, xy) {
	r1 = d/10;
	r2 = d/20;
	sides = 12;
	var cylinder = [];
	var Circle1 = [];
	var Circle2 = [];
	var normals = [];

	for (var i = 0; i <= sides; i++) {
		Circle1.push(r1 * Math.cos(i * Math.PI / 6), r1 * Math.sin(i * Math.PI / 6));
		Circle2.push(r2 * Math.cos(i * Math.PI / 6), r2 * Math.sin(i * Math.PI / 6));       
	}
	
	for (var i = 0; i < (sides*2); i=i+2) {
		cylinder.push(x2+Circle2[i], y2+Circle2[i+1], z2, 
		x1+Circle1[i], y1+Circle1[i+1], z1, 
		x2+Circle2[i+2], y2+Circle2[i+3], z2, 
		x2+Circle2[i+2], y2+Circle2[i+3], z2, 
		x1+Circle1[i], y1+Circle1[i+1], z1, 
		x1+Circle1[i+2], y1+Circle1[i+3], z1);
	}

	for (var i = 0; i <cylinder.length; i=i+9) {
		// Create Vectors
		var v1 = [cylinder[i], cylinder[i+1], cylinder[i+2]];
		var v2 = [cylinder[i+3], cylinder[i+4], cylinder[i+5]];
		var v3 = [cylinder[i+6], cylinder[i+7], cylinder[i+8]];
		var v21 = [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
		var v23 = [v3[0] - v2[0], v3[1] - v2[1], v3[2] - v2[2]];
				
		// Calculate Normals
		var N = [];
		var N1 = v23[1]*v21[2] - v23[2]*v21[1];
		var N2 = v21[0]*v23[2] - v21[2]*v23[0];
		var N3 = v23[0]*v21[1] - v23[1]*v21[0];

		N.push(N1, N2 ,N3);
		var Vmag = Math.sqrt(N[0]**2 + N[1]**2 + N[2]**2);
				
		N[0] = N[0]/Vmag;
		N[1] = N[1]/Vmag;
		N[2] = N[2]/Vmag;
		normals = normals.concat(N, N, N);
	}
	
	var vertices = new Float32Array(cylinder);
	var n = cylinder.length/3;

	// Create a buffer object
	var vertexbuffer = gl.createBuffer();  
	if (!vertexbuffer) {
		console.log('Failed to create the buffer object');
		return -1;
	}

	// Bind the buffer object to target
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
	// Write date into the buffer object
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	// Assign the buffer object to a_Position and enable the assignment
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if(a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return -1;
	}
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);  
	var vN = new Float32Array(normals);

	// Create a buffer object
	var normalbuffer = gl.createBuffer();  
	if (!normalbuffer) {
		console.log('Failed to create the buffer object');
		return -1;
	}

	// Bind the buffer object to target
	gl.bindBuffer(gl.ARRAY_BUFFER, normalbuffer);
	// Write date into the buffer object
	gl.bufferData(gl.ARRAY_BUFFER, vN, gl.STATIC_DRAW);

	// Assign the buffer object to a_Position and enable the assignment
	var a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
	if(a_Normal < 0) {
		console.log('Failed to get the storage location of a_Position');
		return -1;
	}
	gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Normal);

	// Pass the translation distance to the vertex shader
	var u_Translation = gl.getUniformLocation(gl.program, 'u_Translation');
	if (!u_Translation) {
		console.log('Failed to get the storage location of u_Translation');
		return;
	}

	gl.uniform4f(u_Translation, SpanX*xy[0], SpanY*xy[1], 0, 0);  
	
	var u_DiffuseColor = gl.getUniformLocation(gl.program, 'u_DiffuseColor');
	var u_SpecularColor = gl.getUniformLocation(gl.program, 'u_SpecularColor');
	var u_AmbientColor = gl.getUniformLocation(gl.program, 'u_AmbientColor');
	var u_Mode = gl.getUniformLocation(gl.program, 'u_Mode');
	var u_ShininessVal = gl.getUniformLocation(gl.program, 'u_ShininessVal');

	var u_Kd = gl.getUniformLocation(gl.program, 'u_Kd');
	var u_Ks = gl.getUniformLocation(gl.program, 'u_Ks');
	var u_Ka = gl.getUniformLocation(gl.program, 'u_Ka');
	var u_Id = gl.getUniformLocation(gl.program, 'u_Id');

	if (!u_Mode) {
		console.log('Failed to get the storage location of u_Mode');
		return;
	}
	if (!u_Kd) {
		console.log('Failed to get the storage location of u_Kd');
		return;
	}
	if (!u_Ks) {
		console.log('Failed to get the storage location of u_Ks');
		return;
	}
	if (!u_Ka) {
		console.log('Failed to get the storage location of u_Ka');
		return;
	}
	if (!u_Id) {
		console.log('Failed to get the storage location of u_Id');
		return;
	}
	if (!u_ShininessVal) {
		console.log('Failed to get the storage location of u_ShininessVal');
		return;
	}
	var id = g_points.length;
	gl.uniform1f(u_Id, id);
	// Draw
	if (smooth == 1) {
		gl.uniform3f(u_Ks, 1.0, 1.0, 1.0);
		if(xy[2] == 0) {
			gl.uniform3f(u_Ka, 0.2, 0.0, 0.0);
		}
		else if (xy[2] == 2) {
			gl.uniform3f(u_Ka, 0.0, 0.0, 0.2);
		}
	}
	else {
		gl.uniform3f(u_Ks, 0, 0, 0);
		if(xy[2] == 0) {
			gl.uniform3f(u_Ka, 0.0, 0.0, 0.0);
		}
		else if (xy[2] == 2) {
			gl.uniform3f(u_Ka, 0.0, 0.0, 0.0);
		}
	}
	if (mode == 0){
		if(xy[2] == 0) {
			gl.uniform3f(u_Kd, 1, 0, 0);
			gl.uniform1f(u_ShininessVal, 5);
		}
		else if (xy[2] == 2) {
			gl.uniform3f(u_Kd, 0, 0, 1)
			gl.uniform1f(u_ShininessVal, 20);
		}
		// Write vertex information to buffer object
		gl.drawArrays(gl.TRIANGLES, 0, n);
	}
	else if (mode == 1){
		gl.uniform3f(u_DiffuseColor, 0, 0, 0); 
		gl.drawArrays(gl.LINES, 0, n);
	}
}
function checkTree(gl, x, y, u_ModelView, u_Projection) {
  var pixels = new Uint8Array(4); // Array for storing the pixel
  gl.uniform1i(u_PickedTree, 0);  // Write surface number into alpha
//  draw(gl, u_ModelView, u_Projection);
  // Read the pixels at (x, y). pixels[3] is the surface number
  var topTree = g_points.pop();
 // drawTree(gl, u_ModelView, u_Projection, topTree);
  drawTree(gl, u_ModelView, u_Projection, topTree);
  g_points.push(topTree);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  draw(gl, u_ModelView, u_Projection);
  console.log([x, y]);
  console.log(pixels);
  return pixels[3];
}