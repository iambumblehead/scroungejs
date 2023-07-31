// Filename: test_umd.js  
// Timestamp: 2018.04.07-15:19:54 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

(function (root, factory) {
  // eslint-disable-next-line no-undef
  if (typeof exports === "object" && exports) {
    // eslint-disable-next-line no-undef
    factory(exports); // CommonJS
  } else {
    var mustache = {};
    factory(mustache);
    // eslint-disable-next-line no-undef
    if (typeof define === "function" && define.amd) {
      // eslint-disable-next-line no-undef
      define(mustache); // AMD
    } else {
      root.Mustache = mustache; // <script>
    }
  }
}(this, (/*mustache*/) => {
  /* ... mustache.js ... */
}));
