// Filename: test_umd.js  
// Timestamp: 2018.04.07-15:19:54 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

(function (root, factory) {
  if (typeof exports === "object" && exports) {
    factory(exports); // CommonJS
  } else {
    var mustache = {};
    factory(mustache);
    if (typeof define === "function" && define.amd) {
      define(mustache); // AMD
    } else {
      root.Mustache = mustache; // <script>
    }
  }
}(this, function (mustache) {
  /* ... mustache.js ... */
}));
