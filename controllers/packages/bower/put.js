var db = require('../../../utils/db');
var fetch = require('../../../utils/fetch');
var github = require('../../../utils/github');

function controller(request, reply) {
    fetch('https://bower-component-list.herokuapp.com/keyword/web-components')
        .then(function(result) {
            request.log(['#fetch'], 'Done with promise');
            return controller.reduce(result);
        })
        .then(function(result) {
            request.log(['#reduce'], 'Done with promise');
            return db.set('packages:bower', result);
        })
        .then(function(result) {
            request.log(['#db.set'], 'Done with promise');
            return reply({ fetched: Object.keys(result).length });
        })
        .catch(reply);
}

controller.reduce = function(data) {
    var reducedData = {};

    data.forEach(function(elem) {
        if (!elem.website || !github.isValidUrl(elem.website)) {
            return;
        }

        var ghID = github.toShorthand(elem.website);
        var ghURL = github.toHttps(elem.website);

        var pkg = {
            bower: {
                name: elem.name,
                keywords: elem.keywords
            },
            github: {
                url: ghURL
            }
        };

        reducedData[ghID] = pkg;
    });

    return reducedData;
};

module.exports = controller;