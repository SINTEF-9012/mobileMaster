/// <reference path="./../../../app/scripts/reference.ts" />
/// <reference path="./../../../app/scripts/references/jasmine/jasmine.d.ts" />

'use strict';

describe('Filter: distance', function () {

  // load the filter's module
  beforeEach(module('mobileMasterApp'));

  // initialize a new instance of the filter before each test
  var distance;
  beforeEach(inject(function ($filter) {
    distance = $filter('distance');
  }));

  it('should return an undefined value when the input is incorrect', function () {

    expect(distance(null)).toBe(undefined);
    expect(distance({})).toBe(undefined);
    expect(distance({from: {}, to: {}})).toBe(undefined);

  });

  it('should return a distance', function () {
   
    // Just one test because it doesn't make sense to test Leaflet 
    expect(distance({from: {lat: 0.0, lng:0.0}, to: {lat: 1.1, lng:1.1}})).toBeGreaterThan(10)
  });

});
