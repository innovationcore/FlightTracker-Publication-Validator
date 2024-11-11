/*
 * In order to try and make this scale as easily as possible, we're gonna make
 * a slightly complicated single array of the data. It should look like this:
 * [ {"2019": [{object}, {object}, {object}]}, {"2020": [{object}, {object}, {object}]}, ... ]
 *
 * This means that as new years are added, we can check for it and add new surveys
 * for that data.
 */
const cohorts = [];

for (let i=0; i<cohortAPIs.length; i++) {

    const data = {
        token: cohortAPIs[0][i],
        content: 'project',
        format: 'json',
        returnFormat: 'json'
    };

    $.post('https://redcap.uky.edu/api/', data)
        .done(response => {
            console.log(response); // Logs the response data from REDCap
        })
        .fail((jqXHR, textStatus, errorThrown) => {
            console.error('Request failed: ' + textStatus, errorThrown);
        });
}


