/// <reference path="./../../../app/bower_components/DefinitelyTyped/angularjs/angular-mocks.d.ts" />

'use strict';

describe('Filter: humanizeDistance', function () {

  // load the filter's module
  beforeEach(module('mobileMasterApp'));

  // initialize a new instance of the filter before each test
  var humanizeDistance;
  beforeEach(inject(function ($filter) {
    humanizeDistance = $filter('humanizeDistance');
  }));

  it('should use rounded kilometers for the biggest distances', function() {
    expect(humanizeDistance(3000000)).toContain("3000 km");
    expect(humanizeDistance(3023432)).toContain("3000 km");
    expect(humanizeDistance(3043432)).toContain("3000 km");
  });

  it('should use kilometers for large distances', function() {
    expect(humanizeDistance(30000)).toContain("30 km");
    expect(humanizeDistance(32000)).toContain("32 km");
    expect(humanizeDistance(232000)).toContain("232 km");
  });

  it('should use kilometers and half for small kilometers distances', function() {
    expect(humanizeDistance(3000)).toContain("3 km");
    expect(humanizeDistance(3200)).toContain("3 km");
    expect(humanizeDistance(3500)).toContain("3.5 km");
    expect(humanizeDistance(3700)).toContain("3.5 km");
    expect(humanizeDistance(3900)).toContain("4 km");
    expect(humanizeDistance(4900)).toContain("5 km");
    // The limit is at 5 kilometers
    expect(humanizeDistance(5600)).toContain("6 km");
  });

  it('should use round meters for normal distances', function() {
    expect(humanizeDistance(2583)).toContain("2600 m");
    expect(humanizeDistance(1673)).toContain("1700 m");
    expect(humanizeDistance(1643)).toContain("1600 m");
  });

  it('should use less rounded meters for very small distances', function() {
    expect(humanizeDistance(1500)).toContain("1500 m");
    expect(humanizeDistance(1499)).toContain("1500 m");
    expect(humanizeDistance(1450)).toContain("1450 m");
    expect(humanizeDistance(1319)).toContain("1300 m");
  });

  it('use meters when the objets are close', function() {
    expect(humanizeDistance(971)).toContain("971 m");
    expect(humanizeDistance(238)).toContain("238 m");
    expect(humanizeDistance(3)).toContain("3 m");
    expect(humanizeDistance(3.345456667)).toContain("3 m");
  });
  it('use centimeters when the objets are in the same location', function() {
    expect(humanizeDistance(2.1)).toContain("210 cm");
    expect(humanizeDistance(1.8)).toContain("180 cm");
    expect(humanizeDistance(1.87)).toContain("187 cm");
    expect(humanizeDistance(1.8743333)).toContain("187 cm");
    expect(humanizeDistance(0.03)).toContain("3 cm");
  });
});
