const all_records = {}; // Stores all citation data grouped by user and year

console.log('script loaded');

function insertChoice(element, textarea_id) {
    const id = element.id;
    console.log(id);
    const textarea = document.getElementById(textarea_id);

    let selected = textarea.value.trim(); // Get the current value and trim whitespace
    let selectArray = selected ? selected.split("|") : []; // Convert to array if not empty
    console.log(selectArray);

    if (!textarea) {
        console.error(`Textarea with ID ${textarea_id} not found.`);
        return;
    }

    if (element.checked) {
        if (!selectArray.includes(id)) {
            selectArray.push(id);
        }
        console.log('checked!');
    }
    else {
        const index = selectArray.indexOf(id);
        if (selectArray.includes(id)) {
            selectArray.splice(index, 1);
        }
        console.log('unchecked!');
    }

    // Update the textarea value with the new array, joined by `|`
    textarea.value = selectArray.join("|");

    console.log(textarea.value); // Debugging
}

document.addEventListener('DOMContentLoaded', async function () {
    const linkblue_div = document.querySelector('div[data-mlm-type="label"]');
    const linkblue = linkblue_div ? linkblue_div.textContent.trim() : null;

    console.log('Linkblue:', linkblue); // Debug: ensure linkblue is captured correctly

    // Function to fetch records for a single API key
    const fetchRecords = (key) => {
        const records_data = {
            token: key,
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
            returnFormat: 'json-array',
        };

        return new Promise((resolve, reject) => {
            $.post(api_url, records_data)
                .done(response => resolve(response))
                .fail((jqXHR, textStatus, errorThrown) => reject(new Error(`Request failed: ${textStatus} ${errorThrown}`)));
        });
    };

    try {
        // Fetch data from all API keys
        const allResponses = await Promise.all(api_keys.map(fetchRecords));

        // Process the fetched data
        const all_records = {};
        allResponses.forEach(response => {
            response.forEach(object => {
                const {
                    record_id,
                    identifier_userid: user_id,
                    identifier_first_name: first_name,
                    identifier_last_name: last_name,
                    citation_full_citation: citation,
                    citation_date
                } = object;

                const citationYear = citation_date.split("-")[0];
                const key = record_id;

                if (!all_records[key]) {
                    all_records[key] = {
                        record_id,
                        user_id,
                        first_name,
                        last_name,
                        citations: {}
                    };
                }

                if (citationYear !== '') {
                    if (!all_records[key].citations[citationYear]) {
                        all_records[key].citations[citationYear] = [];
                    }
                    if (citation) {
                        all_records[key].citations[citationYear].push(citation);
                    }
                }
            });
        });

        // Build `user_citations` for the current user
        const user_citations = {};
        Object.values(all_records).forEach(record => {
            if (record.user_id === linkblue) {
                Object.assign(user_citations, record.citations); // Merge user citations
            }
        });

        console.log('User Citations:', user_citations); // Debug: ensure citations are filtered correctly

        // Update the survey rows with user citations
        document.querySelectorAll('tr[id^="supported_pubs_"]').forEach(row => {
            let row_id = row.id;
            row_id = row_id.split('-')[0];
            //console.log(row_id);
            let row_year = row_id.split('_').pop();

            const dataCell = row.querySelector('td.data.col-5');
            if (dataCell) {
                // Loop through available citations for the user
                Object.entries(user_citations).forEach(([year, citations]) => {
                    if (year >= row_year) {
                        citations.forEach(citation => {
                            const customElement = document.createElement('div');
                            // Update below to get an ID from somewhere that shows you the correct table.
                            console.log(row_id);
                            customElement.innerHTML = `
                                <input id="${citation}" type="checkbox" onclick="insertChoice(this, '${row_id}')">
                                <label class="mc" for="${citation}">${citation} (${year})</label>
                            `;
                            dataCell.appendChild(customElement);
                        });
                    }
                });
            }
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});
