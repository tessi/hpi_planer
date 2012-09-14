describe("HPI Grade Calculation", function() {
  it("sum up a single grade", function() {
    var grades = [[2,3]];
    var ret = hpi.sumupGrades(grades, 10, 0);
    expect( ret[0] ).toEqual( 2 );
    expect( ret[1] ).toEqual( 3 );
    expect( ret[2] ).toEqual( 3 );
  });
  it("sum up two equal grades", function() {
    var grades = [[2,3],[2,3]];
    var ret = hpi.sumupGrades(grades, 10, 0);
    expect( ret[0] ).toEqual( 2 );
    expect( ret[1] ).toEqual( 6 );
    expect( ret[2] ).toEqual( 6 );
  });
  it("sum up two different grades", function() {
    var grades = [[1,3],[3,3]];
    var ret = hpi.sumupGrades(grades, 10, 0);
    expect( ret[0] ).toEqual( 2 );
    expect( ret[1] ).toEqual( 6 );
    expect( ret[2] ).toEqual( 6 );
  });
  it("sum up three grades with different lp", function() {
    var grades = [[1,6],[3,3],[3,3]];
    var ret = hpi.sumupGrades(grades, 12, 0);
    expect( ret[0] ).toEqual( 2 );
    expect( ret[1] ).toEqual( 12 );
    expect( ret[2] ).toEqual( 12 );
  });
  it("sum up three grades with different lp - aligned", function() {
    var grades = [[1,6],[4,3],[4,3]];
    var ret = hpi.sumupGrades(grades, 9, 0);
    expect( ret[0] ).toEqual( 2 );
    expect( ret[1] ).toEqual( 9 );
    expect( ret[2] ).toEqual( 9 );
  });
  it("sum up three grades with different lp - not aligned", function() {
    var grades = [[1,6],[4,6],[4,6]];
    var ret = hpi.sumupGrades(grades, 9, 0);
    expect( ret[0] ).toEqual( 2 );
    expect( ret[1] ).toEqual( 9 );
    expect( ret[2] ).toEqual( 9 );
  });
  it("sum up three grades with different lp - not aligned, unsorted", function() {
    var grades = [[4,6],[1,6],[4,6]];
    var ret = hpi.sumupGrades(grades, 9, 0);
    expect( ret[0] ).toEqual( 2 );
    expect( ret[1] ).toEqual( 9 );
    expect( ret[2] ).toEqual( 9 );
  });
  it("sum up weighted one grade", function() {
    var grades = [[4,3]];
    var ret = hpi.sumupGrades(grades, 9, 3);
    expect( ret[0] ).toEqual( 4 );
    expect( ret[1] ).toEqual( 9 );
    expect( ret[2] ).toEqual( 3 );
  });
  it("sum up weighted one grade - not aligned", function() {
    var grades = [[4,6]];
    var ret = hpi.sumupGrades(grades, 9, 3);
    expect( ret[0] ).toEqual( 4 );
    expect( ret[1] ).toEqual( 12 );
    expect( ret[2] ).toEqual( 6 );
  });
  it("sum up some more weighted grades", function() {
    var grades = [[3,6],[1,3],[3,3]];
    var ret = hpi.sumupGrades(grades, 12, 3);
    expect( ret[0] ).toEqual( 2 );
    expect( ret[1] ).toEqual( 18 );
    expect( ret[2] ).toEqual( 12 );
  });
  it("sum up some more weighted grades with useless grade", function() {
    var grades = [[3,6],[1,3],[3,3],[5,6]];
    var ret = hpi.sumupGrades(grades, 12, 3);
    expect( ret[0] ).toEqual( 2 );
    expect( ret[1] ).toEqual( 18 );
    expect( ret[2] ).toEqual( 12 );
  });
  it("sum up some more weighted grades", function() {
    var grades = [[3,6],[1,6],[3,6]];
    var ret = hpi.sumupGrades(grades, 18, 3);
    expect( ret[0] ).toEqual( 2 );
    expect( ret[1] ).toEqual( 24 );
    expect( ret[2] ).toEqual( 18 );
  });
  it("sum of no grades", function() {
    var grades = [];
    var ret = hpi.sumupGrades(grades, 18, 3);
    expect( ret[0] ).toBeNaN();
    expect( ret[1] ).toEqual( 0 );
    expect( ret[2] ).toEqual( 0 );
  });
});