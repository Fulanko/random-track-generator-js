class TrackGenerator {

  constructor(width, height, maxDisplacement, steps, thickness, difficulty, seed) {
    this.width = width;
    this.height = height;
    this.seed = seed;
    this.random = new Math.seedrandom(this.seed);
    this.points = [];
    this.hull = [];
    this.pushIterations = 3;
    this.minDistance = 15;
    this.difficulty = difficulty;
    this.maxDisplacement = maxDisplacement;
    this.angle = 100;
    this.isLooping = true;
    this.steps = steps;
    this.thickness = thickness;
    this.generatePoints();
    this.computeConvexHull(this.points, 0, this.points.length);
    for (var i = 0; i < this.pushIterations; i++) {
			this.pushApart();
		}
    this.displace();
    for (var i = 0; i < 10; i++) {
			this.fixAngles();
			this.pushApart();
		}
    this.normalizeSize();
  }

  generatePoints() {
    var pointCount = 20;
  	for (var i = 0; i < pointCount; i++) {
      var x = (this.random() - 0.5) * this.width;
      var y = (this.random() - 0.5) * this.height;
      this.points.push([x, y]);
  	}
  }

  pushApart() {
		for (var i = 0; i < this.hull.length; i++) {
			for (var j = i+1; j < this.hull.length; j++) {
				var hl = Math.sqrt(Math.pow(this.hull[i][0] - this.hull[j][0], 2) + Math.pow(this.hull[i][1] - this.hull[j][1], 2));
				if (hl == 0) {
					hl = 0.1;
				}
				if (hl < this.minDistance) {
					var hx = this.hull[j][0] - this.hull[i][0];
					var hy = this.hull[j][1] - this.hull[i][1];
					hx /= hl;
					hy /= hl;
					var diff = this.minDistance - hl;
					hx *= diff;
					hy *= diff;
					this.hull[j][0] += hx;
					this.hull[j][1] += hy;
					this.hull[i][0] -= hx;
					this.hull[i][1] -= hy;
				}
			}
		}
	}

  normalizeSize() {
    var maxX = 0;
		var maxY = 0;
		for (var i = 0; i < this.hull.length; i++) {
			if (Math.abs(this.hull[i][0]) > maxX) {
				maxX = Math.abs(this.hull[i][0]);
			}
			if (Math.abs(this.hull[i][1]) > maxY) {
				maxY = Math.abs(this.hull[i][1]);
			}
		}
		for (var i = 0; i < this.hull.length; i++) {
      this.hull[i][0] = (this.hull[i][0] / maxX) * this.width / 2;
      this.hull[i][1] = (this.hull[i][1] / maxY) * this.height / 2;
		}
  }

  displace() {
    var newHull = [];
    var disp;
		for (var i = 0; i < this.hull.length; i++) {
      var dispLen = Math.pow(this.random(), this.difficulty) * this.maxDisplacement;
			disp = [0, 1];
      disp = this.rotateVector(disp, this.random() * 360);
			disp = [dispLen * disp[0], dispLen * disp[1]];
      newHull.push(this.hull[i]);
      var point = this.hull[i];
      var point2 = this.hull[(i+1) % this.hull.length];
      newHull.push([
        (point[0] + point2[0]) / 2 + disp[0],
        (point[1] + point2[1]) / 2 + disp[1]
      ]);
		}
		this.hull = newHull;
		//push apart again, so we can stabilize the points distances.
		for (var i = 0; i < this.pushIterations; i++) {
			this.pushApart();
		}
  }

  rotateVector(v, degrees) {
    var radians = degrees * (Math.PI / 180);
		var sin = Math.sin(radians);
		var cos = Math.cos(radians);

		var tx = v[0];
		var ty = v[1];

		return [cos * tx - sin * ty, sin * tx + cos * ty];
  }

  fixAngles() {
    for (var i = 0; i < this.hull.length; i++) {
			var previous = (i-1 < 0) ? this.hull.length-1 : i-1;
			var next = (i+1) % this.hull.length;
			var px = this.hull[i][0] - this.hull[previous][0];
			var py = this.hull[i][1] - this.hull[previous][1];
			var pl = Math.sqrt(px*px + py*py);
			px /= pl;
			py /= pl;

			var nx = this.hull[i][0] - this.hull[next][0];
			var ny = this.hull[i][1] - this.hull[next][1];
			nx = -nx;
			ny = -ny;
			var nl = Math.sqrt(nx*nx + ny*ny);
			nx /= nl;
			ny /= nl;
			//I got a vector going to the next and to the previous points, normalised.

			var a = Math.atan2(px * ny - py * nx, px * nx + py * ny); // perp dot product between the previous and next point.

			if (Math.abs(a * (180 / Math.PI)) <= this.angle) continue;

			var nA = this.angle * Math.sign(a) * (Math.PI / 180);
			var diff = nA - a;
			var cos = Math.cos(diff);
			var sin = Math.sin(diff);
			var newX = nx * cos - ny * sin;
			var newY = nx * sin + ny * cos;
			newX *= nl;
			newY *= nl;
			this.hull[next][0] = this.hull[i][0] + newX;
			this.hull[next][1] = this.hull[i][1] + newY;
			//I got the difference between the current angle and 100degrees, and built a new vector that puts the next point at 100 degrees.
		}
  }

  computeConvexHull(points, offset, count) {
		var end = offset + count;

    points.sort(function(a, b) {
      if (a[0] == b[0]) {
  			return a[1] - b[1];
  		} else if (a[0] > b[0]) {
  			return 1;
  		} else {
  			return -1;
  		}
    })

		// Lower hull.
		for (var i = offset; i < end; i++) {
			var x = points[i][0];
			var y = points[i][1];
			while (this.hull.length >= 2 && this.ccw(x, y) <= 0) {
        this.hull.splice(this.hull.length-1, 1);
      }
      this.hull.push([x, y]);
		}

		// Upper hull.
		for (var i = end - 2, t = this.hull.length + 1; i >= offset; i--) {
      var x = points[i][0];
			var y = points[i][1];
			while (this.hull.length >= t && this.ccw(x, y) <= 0)
				this.hull.splice(this.hull.length-1, 1);
		  this.hull.push([x, y]);
		}

		this.hull.splice(this.hull.length-1, 1);
	}

	ccw(p3x, p3y) {
		var size = this.hull.length;
		var p1x = this.hull[size-2][0];
		var p1y = this.hull[size-2][1];
		var p2x = this.hull[size-1][0];
		var p2y = this.hull[size-1][1];
		return (p2x - p1x) * (p3y - p1y) - (p2y - p1y) * (p3x - p1x);
	}

  drawLine() {
    var points = [];
    for (var i = 0; i < this.hull.length; i++) {
      points.push(new THREE.Vector3(this.hull[i][0], this.hull[i][1], 0));
    }
    points.push(new THREE.Vector3(this.hull[0][0], this.hull[0][1], 0));
    var geometry = new THREE.BufferGeometry().setFromPoints( points );
    var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
    var line = new THREE.Line( geometry, material );
    return line;
  }

  generateMesh() {
		// Create Vertices
    var vertices = [];

		for (var i = 0; i < this.hull.length; i++) {
			if ((i == 0 || i == this.hull.length - 2 || i == this.hull.length - 1) && !this.isLooping) {
				continue;
			}
			var points = CatmullRom.getPosition(this.hull, i);
			for (var t = 0; t < 1;) {
				var point = CatmullRom.positionAt(t, points[0].clone(), points[1].clone(), points[2].clone(), points[3].clone());
				var derivative = CatmullRom.derivativeAt(t, points[0].clone(), points[1].clone(), points[2].clone(), points[3].clone());
				var len = derivative.length();
				t += this.steps / len;
				derivative.divideScalar(len);
				derivative.multiplyScalar(this.thickness);
				derivative = new THREE.Vector3(-derivative.y, derivative.x, derivative.z);
				var v1 = point.clone().add(derivative);
				//v1.y = height;
				vertices.push(v1);
				var v2 = point.clone().sub(derivative);
				//v2.y = height;
				vertices.push(v2);
			}
		}
		vertices.push(vertices[0]);
		vertices.push(vertices[1]);
		vertices.push(vertices[vertices.length-4]);
		vertices.push(vertices[vertices.length-4]);

		var triangles = [];
    var faces = [];
		var uvs = [];

		// Create Triangles and UVs
		var vertexIndex = 0;
		var triangleIndex = 0;
		var n_v = vertices.length;
		for (var i = 0; i < n_v - 4; i++) {
			uvs[i] = new THREE.Vector2(i / 2, i % 2);
			if (i % 2 == 0) {
				triangles[triangleIndex] = vertexIndex % n_v;
				triangles[triangleIndex+1] = (vertexIndex+2) % n_v;
				triangles[triangleIndex+2] = (vertexIndex+1) % n_v;
        faces.push(new THREE.Face3(vertexIndex % n_v, (vertexIndex+2) % n_v, (vertexIndex+1) % n_v));
			} else {
				triangles[triangleIndex] = (vertexIndex+1) % n_v;
				triangles[triangleIndex+1] = (vertexIndex+2) % n_v;
				triangles[triangleIndex+2] = (vertexIndex+3) % n_v;
        faces.push(new THREE.Face3((vertexIndex+1) % n_v, (vertexIndex+2) % n_v, (vertexIndex+3) % n_v));
				vertexIndex += 2;
			}
			triangleIndex += 3;
		}

		// fix start and end
		uvs[n_v-4] = new THREE.Vector2(1, 0);
		uvs[n_v-3] = new THREE.Vector2(1, 1);
		uvs[n_v-2] = new THREE.Vector2(0, 0);
		uvs[n_v-1] = new THREE.Vector2(0, 1);
		triangles[(n_v-4)*3-1] = n_v-3;
		triangles[(n_v-4)*3-2] = n_v-4;
		triangles[(n_v-4)*3-3] = n_v-1;
		triangles[(n_v-4)*3-4] = n_v-1;
		triangles[(n_v-4)*3-5] = n_v-4;
		triangles[(n_v-4)*3-6] = n_v-2;

    const RADIUS = 1;
    const SEGMENTS = 4;
    const RINGS = 4;
    for (var i = 0; i < vertices.length; i++) {
      var sphereMaterial = new THREE.MeshLambertMaterial({color: 0xCC0000});
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(RADIUS, SEGMENTS, RINGS), sphereMaterial);
      sphere.position.x = vertices[i].x;
      sphere.position.y = vertices[i].y;
      sphere.position.z = vertices[i].z;
      //scene.add(sphere);
    }

		// Assemble mesh
    var geom = new THREE.Geometry();
    geom.vertices = vertices;
    geom.faces = faces;

		var mesh = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({color: 0x555555}));
    return mesh;
	}

}
