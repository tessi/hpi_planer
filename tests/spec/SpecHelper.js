beforeEach(function() {
  this.addMatchers({
    toBeNaN: function(nan) {
      return isNaN(nan);
    }
  });
});
