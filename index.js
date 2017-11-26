var img;

var shiftX = function(image, clipX, clipY, clipH, shiftW) {
  var h = image.height;
  var w = image.width;
  var data = image.data;
  var buf8 = new Uint8ClampedArray(data);

  var y = clipY;
  var x = 0;

  var decrements = [40, 40, 40].map(function(x) { return Math.random() * x; });
  while (y < clipY + clipH) {
    x = 0;
    while (x < clipX + shiftW) {
      var idx = ((y * w) + x) * 4;
      buf8[idx] = 255 - decrements[0];
      buf8[idx + 1] = 255 - decrements[1];
      buf8[idx + 2] = 255 - decrements[2];
      buf8[idx + 3] = 255;
      x++;
    }
    y++;
  }

  y = clipY;
  while (y < clipY + clipH) {
    x = 0;
    while (x < w - (clipX + shiftW)) {
      var idxOrig = ((y * w) + (x)) * 4;
      var idx2 = ((y * w) + (x + shiftW + clipX)) * 4;
      buf8[idx2] = data[idxOrig] - decrements[0];
    //  buf8[idx2 + 1] = data[idxOrig + 1] - decrements[1]
 //     buf8[idx2 + 2] = data[idxOrig + 2] - decrements[2]
    //  buf8[idx2 + 3] = data[idxOrig + 3]
      x++;
    }

    y++;
  }

  image.data.set(buf8);
}

var glitchWithShift = function(image) {
  var w = image.width;
  var h = image.height;
  var segments = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
  var maxShift = 0.015 * w;
  var baseX = 0.05 * w;
  var shiftPhase = 1;

  var clipX = 0, clipY = 0, clipH = 0, shiftW = 0;

  var i = 0;
  var segment;
  while (i < segments.length) {
    segment = segments[i]
    clipH = segment * h;
    shiftW = Math.random() * maxShift * shiftPhase;

    //console.log(clipY, clipH, baseX + shiftW)
    shiftX(image, 0, Math.floor(clipY), Math.floor(clipH), Math.floor(baseX + shiftW));
    clipY += clipH;
    shiftPhase = shiftPhase * -1
    i++;
  };

  return image
}

var onImageReady = function() {
  Filters = {};
  Filters.getPixels = function(img) {
    var c = this.getCanvas(img.width, img.height)
    var ctx = c.getContext('2d');
    console.log(img)
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0,0,c.width,c.height);
  };

  Filters.getCanvas = function(w,h) {
    console.log('canvasing')
    var c = document.getElementById('canvas');
    c.width = w;
    c.height = h;
    return c;
  };

  Filters.filterImage = function(filter, image) {
    var args = [this.getPixels(image)]
    for (var i=2; i<arguments.length; i++) {
      args.push(arguments[i]);
    }
    var filtered = filter.apply(null, args);
    var c = this.getCanvas(img.width, img.height)
    var ctx = c.getContext('2d');
    ctx.putImageData(filtered, 0, 0)
  };

  Filters.grayscale = function(pixels, args) {
    return glitchWithShift(pixels)
  };

  Filters.filterImage(Filters.grayscale, img)
}

function handleImage(e){
    var reader = new FileReader();
    reader.onload = function(event){
        img = new Image();
        img.onload = function(){
          onImageReady();
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
}

var imageControl = document.getElementById('imageControl');
imageControl.onchange = handleImage;
