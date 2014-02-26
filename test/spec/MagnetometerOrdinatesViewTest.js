/*global define*/
/*global describe*/
/*global it*/
/*global beforeEach, afterEach */
define([
	'chai',
	'sinon',
	'mvc/Model',
	'util/Util',

	'geomag/Reading',
	'geomag/Observation',
	'geomag/Measurement',
	'geomag/ObservationBaselineCalculator',
	'geomag/MagnetometerOrdinatesView'
], function (
	chai,
	sinon,
	Model,
	Util,

	Reading,
	Observation,
	Measurement,
	ObservationBaselineCalculator,
	MagnetometerOrdinatesView
){
	'use strict';
	var expect = chai.expect;

	describe('Unit tests for MagnetometerOrdinatesView', function () {

		describe('View', function(){
			var renderSpy,
			    reading,
			    calculator,
			    view,
			    observation,
			    readingMeasurements,
			    measurements;

			beforeEach(function(){
				renderSpy = sinon.spy(MagnetometerOrdinatesView.prototype, 'render');
				reading = new Reading();
				observation = new Observation();
				calculator = new ObservationBaselineCalculator();

				view = new MagnetometerOrdinatesView({
					reading: reading,
					observation: observation,
					baselineCalculator: calculator
				});

				readingMeasurements = view._reading.getMeasurements();
				measurements = [
					readingMeasurements[Measurement.WEST_DOWN][0],
					readingMeasurements[Measurement.EAST_DOWN][0],
					readingMeasurements[Measurement.WEST_UP][0],
					readingMeasurements[Measurement.EAST_UP][0],
					readingMeasurements[Measurement.SOUTH_DOWN][0],
					readingMeasurements[Measurement.NORTH_UP][0],
					readingMeasurements[Measurement.SOUTH_UP][0],
					readingMeasurements[Measurement.NORTH_DOWN][0]
				];
			});

			afterEach(function() {
				renderSpy.restore();
				reading = null;
				view = null;
				observation = null;
				calculator = null;
			});

			it('should render when measurement changes', function () {
				var i = null,
				    len = null;

				for (i = 0, len = measurements.length; i < len; i++) {
					measurements[i].trigger('change');
					// +2 because view renders during instantiation and loop
					// index starts at 0
					expect(renderSpy.callCount).to.equal(i+2);
				}
			});

			it('should render when calculator changes', function (){
				calculator.trigger('change');
				expect(renderSpy.callCount).to.equal(2);
			});
		});

		describe('Values', function () {
			it('updates view elements', function () {
				var reading,
				    calculator,
				    view,
				    observation;
				function format (number) {return number.toFixed(2);}

				//Stub function in ObservationBaselineCalculator.
				sinon.stub(ObservationBaselineCalculator.prototype,
						'meanH', function () {return 1;});
				sinon.stub(ObservationBaselineCalculator.prototype,
						'meanE', function () {return 2;});
				sinon.stub(ObservationBaselineCalculator.prototype,
						'meanZ', function () {return 3;});
				sinon.stub(ObservationBaselineCalculator.prototype,
						'meanF', function () {return 4;});

				sinon.stub(ObservationBaselineCalculator.prototype,
						'horizontalComponent', function () {return 5;});
				sinon.stub(ObservationBaselineCalculator.prototype,
						'magneticDeclination', function () {return 6;});
				sinon.stub(ObservationBaselineCalculator.prototype,
						'verticalComponent', function () {return 7;});
				sinon.stub(ObservationBaselineCalculator.prototype,
						'correctedF', function () {return 8;});

				sinon.stub(ObservationBaselineCalculator.prototype,
						'baselineH', function () {return 9;});
				sinon.stub(ObservationBaselineCalculator.prototype,
						'baselineE', function () {return 10;});
				sinon.stub(ObservationBaselineCalculator.prototype,
						'd', function () {return 11;});
				sinon.stub(ObservationBaselineCalculator.prototype,
						'baselineZ', function () {return 12;});

				reading = new Reading();
				observation = new Observation();
				calculator = new ObservationBaselineCalculator();

				view = new MagnetometerOrdinatesView({
					reading: reading,
					observation: observation,
					baselineCalculator: calculator
				});

				expect(view._hMean.textContent).to.equal(format(1));
				expect(view._eMean.textContent).to.equal(format(2));
				expect(view._zMean.textContent).to.equal(format(3));
				expect(view._fMean.textContent).to.equal(format(4));

				expect(view._absoluteH.textContent).to.equal(format(5));
				expect(view._absoluteD.textContent).to.equal(format(6*60));
				expect(view._absoluteZ.textContent).to.equal(format(7));
				expect(view._absoluteF.textContent).to.equal(format(8));

				expect(view._hBaseline.textContent).to.equal(format(9));
				expect(view._eBaseline.textContent).to.equal(format(10));
				expect(view._dBaseline.textContent).to.equal(format(11));
				expect(view._zBaseline.textContent).to.equal(format(12));

				//TODO restore stubed functions,  if needed for later testing.
			});
		});

	});

});
