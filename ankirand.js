var parameters = {
    passRate : 0.9,  // percent success
    intervalFactor :
        1.0,  // percent interval modifier (Options->Reviews->Interval modifier)
    defaultDelay : 0  // assume we review every day
};

var interval = 1;   // days
var factor = 1300;  // unitless
var delay = 0;      // assume 0 days delay
var maxYears = 5;   // don't simulate a hundred years...

function runSimulation(parameters, interval, factor, delay, maxYears) {
    var simulation = {
        intervals : [interval],
        factors : [factor],
        results : [true]
    };
    var simDays = 1;

    for (var i = 0; i < 1000; i++) {
        var success = Math.random() < parameters.passRate;

        if (success) {
            // New factor calculation depends on ease:
            // https://github.com/dae/anki/blob/24e83abe22aefd145987a382fc53364a8bedb8cc/anki/sched.py#L855
            factor = Math.max(1300, factor + 0);

            // Implements _nextRevIvl() in
            // https://github.com/dae/anki/blob/24e83abe22aefd145987a382fc53364a8bedb8cc/anki/sched.py#L881
            var ivl2 = Math.round(Math.max(
                interval + 1,
                parameters.intervalFactor * ((interval + delay / 4) * 1.2)));
            interval = Math.round(Math.max(
                ivl2 + 1, parameters.intervalFactor *
                              ((interval + delay / 2) * (factor / 1000))));
        } else {
            // Reset interval to 1
            interval = 1;
            // Factor calculation per
            // https://github.com/dae/anki/blob/24e83abe22aefd145987a382fc53364a8bedb8cc/anki/sched.py#L816
            factor = Math.max(1300, factor - 200)
        }

        simulation.intervals.push(interval);
        simulation.factors.push(factor);
        simulation.results.push(success);
        simDays += interval;
        if (simDays / 365 > maxYears) {
            break;
        }
    }

    return simulation;
}

function cumsum(arr) {
    var cuml = [arr[0]];
    for (var i = 1; i < arr.length; i++) {
        cuml[i] = cuml[i - 1] + arr[i];
    }
    return cuml;
}

function plotSimulation(result) {
    var chart = c3.generate({
        bindto : '#chart',
        data : {
                 x : "intervals",
                 columns : [
                     ['intervals'].concat(cumsum(result.intervals)),
                     ['y'].concat(result.intervals),
                 ]
               },
        axis : {
                 x : {
                       label : {text : "Days after learning"},
                       tick : {fit : false}
                     },
                 y : {label : {text : "Interval, in days"}, min : 0}
               },
        legend : {show : false}
    });
}

plotSimulation(runSimulation(parameters, interval, factor, delay, maxYears));