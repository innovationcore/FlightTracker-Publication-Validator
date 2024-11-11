const api_url = 'https://redcap.ai.uky.edu/api/'; // change to your desired input
const all_records = {}; // will end up storing everything we're pulling in about citations.

document.addEventListener('DOMContentLoaded', function() {
    let buttonRow = document.getElementsByClassName('mb-3')[0];

    if (buttonRow) {
        let popButton = document.createElement('button');
        popButton.className = 'btn btn-xs btn-primary fs13';
        popButton.type = 'button';
        popButton.id = 'populate-pubs';
        popButton.textContent = 'Load Pubs into Validator'
        popButton.style.marginRight = '4px';
        popButton.onclick = function() {
            console.log('Data is being retreived from the API sources you provided. This will take some time.')
            console.log(serviceRequests);

            const info_data = {
            token: '39CD073D4B0EFD5BAC891BDCA2E99CC9',
            content: 'project',
            format: 'json',
            returnFormat: 'json'
            };

            const records_data = {
                token: '39CD073D4B0EFD5BAC891BDCA2E99CC9',
                content: 'record',
                action: 'export',
                format: 'json',
                type: 'flat',
                csvDelimiter: '',
                'fields[0]': 'record_id',
                'fields[1]': 'identifier_first_name',
                'fields[2]': 'identifier_middle',
                'fields[3]': 'identifier_last_name',
                'fields[4]': 'identifier_userid',
                'fields[5]': 'citation_full_citation',
                'fields[6]': 'citation_date',
                rawOrLabel: 'raw',
                rawOrLabelHeaders: 'raw',
                exportCheckboxLabel: 'false',
                exportSurveyFields: 'false',
                exportDataAccessGroups: 'false',
                returnFormat: 'json-array'
            }

            $.post(api_url, records_data)
                .done(response => {
                    console.log(response); // Logs the response data from REDCap

                    response.forEach(object => {
                        /*
                         * Generic format for what an object should look like for a given user.
                         * We want to be able to update these as we cycle through multiple years.
                         * {
                         *     record_id: object.record_id,
                         *     user_id: object.identifier_userid,
                         *     first_name: object.identifier_first_name,
                         *     last_name: object.identifier_last_name,
                         *     citations: {
                         *         2019: [],
                         *         2020: [],
                         *         2021: [],
                         *         2022: [],
                         *         2023: []
                         *     }
                         * }
                         */

                        const { record_id,
                            identifier_userid: user_id,
                            identifier_first_name: first_name,
                            identifier_last_name: last_name,
                            citation_full_citation: citation,
                            citation_date
                        } = object;

                        const citationYear = citation_date.split("-")[0];
                        const key = user_id; // can be whatever as long as it's linked to 1 user

                        if (!all_records[key]) {
                            all_records[key] = {
                                record_id,
                                user_id,
                                first_name,
                                last_name,
                                citations: {}
                            }
                        }

                        if (!all_records[key].citations[citationYear]) {
                            all_records[key].citations[citationYear] = [];
                        }

                        // Add citation to the relevant year array in the citations object
                        if (citation !== '') {
                            all_records[key].citations[citationYear].push(citation);
                        }
                    });

                    console.log(all_records);
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    console.error('Request failed: ' + textStatus, errorThrown);
                });
        }

        buttonRow.appendChild(popButton);
    }



/*    for (let i=0; i<cohortAPIs.length; i++) {

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
    }*/
});