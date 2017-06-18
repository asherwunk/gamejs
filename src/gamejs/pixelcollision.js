var gamejs = require('../gamejs');
var objects = require('./utils/objects');
var graphics = require('./graphics');

/**
 * @fileoverview Image mask. Usefull for pixel perfect collision detection:
 *
 * @example
 * var unitMask = new Maks(unitSurface, collisionThresholdAlphaValue);
 * var spearMask = new Maks(unitSurface, collisionThresholdAlphaValue);
 * var collide = unitMask.overlap(spearMask);
 */

/*  Modified by: Asher Wolfstein (asherwunk@gmail.com) June 18th, 2017
 *               For more information see my blog at http://wunk.me/
 *               Also the specific URL: http://wunk.me/programming-projects/pygjs
 */


/**
 * Creates an image mask from the given Surface. The alpha of each pixel is checked
 * to see if it is greater than the given threshold. If it is greater then
 * that pixel is set as not colliding.
 *
 * @param {Surface} surface used for image mask
 * @param {Number} threshold 0 to 255. defaults to: 255, fully transparent
 *
 */
var Mask = exports.Mask = function(surface, threshold) {
   /**
    * @ignore
    */
   this._bits = [];

   threshold = (threshold && (255 - threshold)) || 255;
   var imgData = surface.getImageData().data;
   var dims = surface.getSize();
   /**
    * @ignore
    */
   this.width = dims[0];
   /**
    * @ignore
    */
   this.height = dims[1];

   var i,j;
   for (i=0;i<this.width;i++) {
      this._bits[i] = [];
      for (j=0;j<this.height;j++) {
         this._bits[i][j] = false;
      }
   }
   for (i=0;i<imgData.length;i += 4) {
      // y: pixel # / width
      var y = parseInt((i / 4) / dims[0], 10);
      // x: pixel # % width
      var x = parseInt((i / 4) % dims[0], 10);
      var alpha = imgData[i+3];
      if (alpha >= threshold) {
         this.setAt(x, y);
      }
   }
   return;
};

/**
 * @param {gamejs.mask.Mask} otherMask
 * @param {Array} offset [x,y]
 * @returns the overlapping rectangle or null if there is no overlap;
 */
Mask.prototype.overlapRect = function(otherMask, offset) {
   var arect = this.rect;
   var brect = otherMask.rect;
   if (offset) {
      brect.moveIp(offset);
   }
   // bounding box intersect
   if (!brect.collideRect(arect)) {
      return null;
   }
   var xStart = Math.max(arect.left, brect.left);
   var xEnd = Math.min(arect.right, brect.right);

   var yStart = Math.max(arect.top, brect.top);
   var yEnd = Math.min(arect.bottom, brect.bottom);

   return new gamejs.Rect([xStart, yStart], [xEnd - xStart, yEnd - yStart]);
};

/**
 *
 * @returns True if the otherMask overlaps with this map.
 * @param {Mask} otherMask
 * @param {Array} offset
 */
Mask.prototype.overlap = function(otherMask, offset) {
   var overlapRect = this.overlapRect(otherMask, offset);
   if (overlapRect === null) {
      return false;
   }

   var arect = this.rect;
   var brect = otherMask.rect;
   if (offset) {
      brect.moveIp(offset);
   }

   var count = 0;
   var x,y;
   for (y=overlapRect.top; y<=overlapRect.bottom; y++) {
      for (x=overlapRect.left; x<=overlapRect.right; x++) {
         if (this.getAt(x - arect.left, y - arect.top) &&
             otherMask.getAt(x - brect.left, y - brect.top)) {
             return true;
         }
      }
   }
   // NOTE this should not happen because either we bailed out
   // long ago because the rects do not overlap or there is an
   // overlap and we should not have gotten this far.
   // throw new Error("Maks.overlap: overlap detected but could not create mask for it.");
   return false;
};

/**
 *
 * Draws othermask onto this mask using OR
 * 
 * @param {Mask} otherMask
 * @param {Array} offset
 */
Mask.prototype.draw = function(otherMask, offset) {
   var overlapRect = this.overlapRect(otherMask, offset);
   if (overlapRect === null) {
      return false;
   }

   var arect = this.rect;
   var brect = otherMask.rect;
   if (offset) {
      brect.moveIp(offset);
   }

   var count = 0;
   var x,y;
   for (y=overlapRect.top; y<=overlapRect.bottom; y++) {
      for (x=overlapRect.left; x<=overlapRect.right; x++) {
         if (this.getAt(x - arect.left, y - arect.top) ||
             otherMask.getAt(x - brect.left, y - brect.top)) {
             this.setAt(x - arect.left, y - arect.top);
         }
      }
   }
   
   return true;
};

/**
 *
 * Draws othermask onto this mask using OR
 * 
 * @param {Mask} otherMask
 * @param {Array} offset
 */
Mask.prototype.erase = function(otherMask, offset) {
   var overlapRect = this.overlapRect(otherMask, offset);
   if (overlapRect === null) {
      return false;
   }

   var arect = this.rect;
   var brect = otherMask.rect;
   if (offset) {
      brect.moveIp(offset);
   }

   var count = 0;
   var x,y;
   for (y=overlapRect.top; y<=overlapRect.bottom; y++) {
      for (x=overlapRect.left; x<=overlapRect.right; x++) {
         if (otherMask.getAt(x - brect.left, y - brect.top)) {
             this.setAt(x - arect.left, y - arect.top, false);
         }
      }
   }
   
   return true;
};

/**
 *
 * @returns [x, y] if the otherMask overlaps with this map.
 * @param {Mask} otherMask
 * @param {Array} offset
 */
Mask.prototype.overlapXY = function(otherMask, offset) {
   var overlapRect = this.overlapRect(otherMask, offset);
   if (overlapRect === null) {
      return false;
   }

   var arect = this.rect;
   var brect = otherMask.rect;
   if (offset) {
      brect.moveIp(offset);
   }

   var count = 0;
   var x,y;
   for (y=overlapRect.top; y<=overlapRect.bottom; y++) {
      for (x=overlapRect.left; x<=overlapRect.right; x++) {
         if (this.getAt(x - arect.left, y - arect.top) &&
             otherMask.getAt(x - brect.left, y - brect.top)) {
             return [x, y];
         }
      }
   }
   // NOTE this should not happen because either we bailed out
   // long ago because the rects do not overlap or there is an
   // overlap and we should not have gotten this far.
   // throw new Error("Maks.overlap: overlap detected but could not create mask for it.");
   return false;
};

/**
 * @param {gamejs.mask.Mask} otherMask
 * @param {Array} offset [x,y]
 * @returns the number of overlapping pixels
 */
Mask.prototype.overlapArea = function(otherMask, offset) {
   var overlapRect = this.overlapRect(otherMask, offset);
   if (overlapRect === null) {
      return 0;
   }

   var arect = this.rect;
   var brect = otherMask.rect;
   if (offset) {
      brect.moveIp(offset);
   }

   var count = 0;
   var x,y;
   for (y=overlapRect.top; y<=overlapRect.bottom; y++) {
      for (x=overlapRect.left; x<=overlapRect.right; x++) {
         if (this.getAt(x - arect.left, y - arect.top) &&
             otherMask.getAt(x - brect.left, y - brect.top)) {
             count++;
         }
      }
   }
   return count;
};

/**
 * @param {gamejs.mask.Mask} otherMask
 * @param {Array} offset [x,y]
 * @returns a mask of the overlapping pixels
 */
Mask.prototype.overlapMask = function(otherMask, offset) {
   var overlapRect = this.overlapRect(otherMask, offset);
   if (overlapRect === null) {
      return 0;
   }

   var arect = this.rect;
   var brect = otherMask.rect;
   if (offset) {
      brect.moveIp(offset);
   }

   var mask = new Mask(new gamejs.graphics.Surface([overlapRect.width, overlapRect.height]));
   var x,y;
   for (y=overlapRect.top; y<=overlapRect.bottom; y++) {
      for (x=overlapRect.left; x<=overlapRect.right; x++) {
         if (this.getAt(x - arect.left, y - arect.top) &&
             otherMask.getAt(x - brect.left, y - brect.top)) {
             mask.setAt(x, y);
         }
      }
   }
   return mask;
};

/**
 * Set bit at position.
 * @param {Number} x
 * @param {Number} y
 */
Mask.prototype.setAt = function(x, y, value) {
   if (typeof(value) !== 'undefined') {
      this._bits[x][y] = value ? true : false;
   } else {
      this._bits[x][y] = true;
   }
};

/**
 * Get bit at position.
 *
 * @param {Number} x
 * @param {Number} y
 */
Mask.prototype.getAt = function(x, y) {
   x = parseInt(x, 10);
   y = parseInt(y, 10);
   if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return false;
   }
   return this._bits[x][y];
};


/**
 * Flip the bits in this map.
 */
Mask.prototype.invert = function() {
   this._bits = this._bits.map(function(row) {
      return row.map(function(b) {
         return !b;
      });
   });
};

/**
 * Clear the bits in this map.
 */
Mask.prototype.clear = function() {
   this._bits = this._bits.map(function(row) {
      return row.map(function(b) {
         return false;
      });
   });
};

/**
 * Fill the bits in this map.
 */
Mask.prototype.fill = function() {
   this._bits = this._bits.map(function(row) {
      return row.map(function(b) {
         return true;
      });
   });
};

// taken from pygame/src/bitmask.c [bitmask_scale()]
Mask.prototype.scale = function(width, height) {
   surface = graphics.Surface(width, height);
   newmask = Mask(surface, 255);
   
   var nx, ny, dnx, dny;
   
   ny = dny = 0;
   
   for (var y = 0, dy = h; y < this.height; y++, dy += height) {
      while (dny < dy) {
         nx = dnx = 0;
         for (var x = 0, dx = width; x < this.width; x++, dx += width) {
            if (this.getAt(x, y)) {
               while (dnx < dx) {
                  newmask.setAt(nx, ny);
                  nx++;
                  dnx += this.width;
               }
            } else {
               while (dnx < dx) {
                  nx++;
                  dnx += this.width;
               }
            }
         }
         
         ny++;
         dny += this.height;
      }
   }
   
   return newmask;
}

/**
 * @returns {Array} the dimensions of the map
 */
Mask.prototype.getSize = function() {
   return [this.width, this.height];
};

Mask.prototype.countBits = function() {
   var ret = 0;
   
   for (var x = 0; x < this.width; x++) {
      for (var y = 0; y < this.height; y++ ) {
         if (this._bits[x][y]) {
            ret++;
         }
      }
   }
   
   return ret;
};

// adapted from pygame/src/mask.c [mask_centroid()]
Mask.prototype.centroid = function() {
   var m10, m01, m00;
   
   m10 = m01 = m00 = 0;
   
   for (var x = 0; x < this.width; x++) {
      for (var y = 0; y < this.height; y++ ) {
         if (this._bits[x][y]) {
            m10 += x;
            m01 += y;
            m00++;
         }
      }
   }
   
   if (m00) {
      return [m10/m00, m01/m00];
   } else {
      return [0, 0];
   }
};

// adapted from pygame/src/mask.c [mask_angle()]
Mask.prototype.angle = function() {
   var m10, m01, m00, m20, m02, m11;
   
   m10 = m01 = m00 = m20 = m02 = m11 = 0;
   
   for (var x = 0; x < this.width; x++) {
      for (var y = 0; y < this.height; y++ ) {
         if (this._bits[x][y]) {
            m10 += x;
            m20 += x*x;
            m11 += x*y;
            m02 += y*y;
            m01 += y;
            m00++;
         }
      }
   }
   
   if (m00) {
      var xc = m10/m00, yc = m01/m00;
      var theta = -90.0 * Math.atan((2*(m11/m00 - xc*yc))/((m20/m00 - xc*xc)-(m02/m00 - yc*yc)))/Math.PI;
      return theta;
   } else {
      return 0;
   }
};

// adapted from pygame/src/mask.c [mask_outline()]
Mask.prototype.outline = function(every) {
   var x, y, e, firstx, firsty, secx, secy, currx, curry, nextx, nexty, n;
   var a = new Array(14), b = new Array(14);
   var plist = new Array();
   
   a[0] = a[1] = a[7] = a[8] = a[9] = b[1] = b[2] = b[3] = b[9] = b[10] = b[11] = 1;
   a[2] = a[6] = a[10] = b[4] = b[0] = b[12] = b[8] = 0;
   a[3] = a[4] = a[5] = a[11] = a[12] = a[13] = b[5] = b[6] = b[7] = b[13] = -1;
   
   n = firstx = firsty = secx = x = 0;
   
   var surface = graphics.Surface(this.width + 2, this.height + 2);
   var largermask = Mask(surface, 255);
   
   largermask.draw(this, [1,1]);
   
   e = every;
   
   for (y = 1; y < largermask.height - 1; y++) {
      for (x = 1; x < largermask.width - 1; x++) {
         if (largermask._bits[x][y]) {
            firstx = x;
            firsty = y;
            plist.push([x-1, y01]);
            break;
         }
      }
      
      if (largermask._bits[x][y]) {
         break;
      }
   }
   
   if ((x == largermask.width - 1) && (y == largermask.height - 1)) {
      return plist;
   }
   
   for (n = 0; n < 8; n++) {
      if (largermask._bits[x+a[n]][y+b[n]]) {
         currx = secx = x+a[n];
         curry = secy = y+b[n];
         e--;
         if (!e) {
            e = every;
            plist.push([secx-1, secy-1]);
         }
         
         break;
      }
   }
   
   if (!secx) {
      return plist;
   }
   
   for (;;) {
      for (n = (n + 6) & 7;;n++) {
         if (largermask._bits[currx+a[n]][curry+b[n]]) {
            nextx = currx+a[n];
            nexty = curry+b[n];
            e--;
            if (!e) {
               e = every;
               if ((curry == firsty && currx == firstx) && (secx == nextx && secy == nexty)) {
                  break;
               }
               
               plist.push([nextx-1, nexty-1]);
            }
            
            break;
         }
      }
      
      if ((curry == firsty && currx == firstx) && (secx == nextx && secy == nexty)) {
         break;
      }
      
      curry = nexty;
      currx = nextx;
   }
   
   return plist;
};

// adapted from pygame/src/mask.c [mask_convolve()]
// pygame/src/bitmask.c [bitmask_convolve()]
Mask.prototype.convolve = function(othermask, offset) {
   var surface = graphics.Surface(self.width + othermask.width - 1, self.height + othermask.height - 1);
   var ret = Mask(surface, 255);
   
   // bitmask_convolve(this, othermask, largermask, offset.x, offset.y)
   
   var xoffset = offset[0] + othermask.width - 1;
   var yoffset = offset[1] + othermask.height - 1;
   
   for (var y = 0; y < othermask.height; y++) {
      for (var x = 0; x < othermask.width; x++) {
         if (othermask._bits[x][y]) {
            ret.draw(this, [xoffset - x, yoffset - y]);
         }
      }
   }
   
   return ret;
};

objects.accessors(Mask.prototype, {
   /**
    * Rect of this Mask.
    */
   'rect': {
      get: function() {
         return new gamejs.Rect([0, 0], [this.width, this.height]);
      }
   },
   /**
    * @returns {Number} number of set pixels in this mask.
    */
   'length': {
      get: function() {
         var c = 0;
         this._bits.forEach(function(row) {
            row.forEach(function(b) {
               if (b) {
                  c++;
               }
            });
         });
         return c;
      }
   }
});
