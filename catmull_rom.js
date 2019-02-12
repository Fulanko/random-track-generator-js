var CatmullRom = {
  positionAt: function(t, p0, p1, p2, p3) {
    var a = p1;
    var b = p2.clone().sub(p0.clone()).multiplyScalar(0.5);
    var c = p0.clone().multiplyScalar(2).sub(p1.clone().multiplyScalar(5)).add(p2.clone().multiplyScalar(4)).sub(p3.clone()).multiplyScalar(0.5);
    var d = p0.clone().multiplyScalar(-1).add(p1.clone().multiplyScalar(3)).sub(p2.clone().multiplyScalar(3)).add(p3.clone()).multiplyScalar(0.5);
  	return a.add(b.multiplyScalar(t)).add(c.multiplyScalar(t*t)).add(d.multiplyScalar(t*t*t));
  },

  derivativeAt: function(t, p0, p1, p2, p3) {
    var a = p2.clone().sub(p0.clone()).multiplyScalar(0.5);
    var b = p0.clone().multiplyScalar(4).sub(p1.clone().multiplyScalar(10)).add(p2.clone().multiplyScalar(8)).sub(p3.clone().multiplyScalar(2)).multiplyScalar(0.5);
    var c = p0.clone().multiplyScalar(-3).add(p1.clone().multiplyScalar(9)).sub(p2.clone().multiplyScalar(9)).add(p3.clone().multiplyScalar(3)).multiplyScalar(0.5);

  	return a.add(b.multiplyScalar(t)).add(c.multiplyScalar(t*t));
  },

  getPosition: function(hull, pos) {
    var clampListPos = function(hull, pos)  {
  		if (pos < 0) {
  			pos = hull.length - 1;
  		}
  		if (pos > hull.length) {
  			pos = 1;
  		}
  		else if (pos > hull.length - 1) {
  			pos = 0;
  		}
  		return pos;
  	}
		// Clamp to allow looping
		var result = [];
    result.push(new THREE.Vector3(hull[clampListPos(hull, pos - 1)][0], hull[clampListPos(hull, pos - 1)][1], 0));
    result.push(new THREE.Vector3(hull[pos][0], hull[pos][1], 0));
    result.push(new THREE.Vector3(hull[clampListPos(hull, pos + 1)][0], hull[clampListPos(hull, pos + 1)][1], 0));
		result.push(new THREE.Vector3(hull[clampListPos(hull, pos + 2)][0], hull[clampListPos(hull, pos + 2)][1], 0));
		return result;
	}
}
