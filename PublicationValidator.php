<?php
namespace CAAIModules\PublicationValidator;

use ExternalModules\AbstractExternalModule;
use REDCap;

class PublicationValidator extends AbstractExternalModule {
    function getRedcapApiUrl() {
        // Construct the API URL dynamically
        $apiUrl = APP_PATH_WEBROOT_FULL . 'api/';
        return $apiUrl;
    }

    // Hook to modify survey display
    function redcap_survey_page_top($project_id, $record, $instrument, $event_id, $group_id, $repeat_instance) {
        if ($instrument === 'pub_validator') {
            ?>
            <script>
            // Modify survey submit to capture custom mapping data
            $(document).ready(function() {
                // Intercept survey submit
                $('form[name="form"]').on('submit', function(e) {
                    // Collect all publication mappings
                    var publicationMappings = {};

                    // Find all service request mapping selects
                    $('.service-request-publications').each(function() {
                        var serviceRequestId = $(this).attr('id').replace('service_request_', '');
                        var selectedPublications = $(this).val() || [];

                        publicationMappings[serviceRequestId] = selectedPublications;
                    });

                    // Add hidden field to submit the mappings
                    $('<input>')
                        .attr('type', 'hidden')
                        .attr('name', 'publication_mappings')
                        .val(JSON.stringify(publicationMappings))
                        .appendTo($(this));
                });
            });

            // Dynamic population of publication choices
            function populatePublicationChoices() {
                // Use global serviceRequests from previous JavaScript
                serviceRequests.forEach(function(request) {
                    var requestYear = request.year; // Adjust based on your data structure
                    var requestId = request.id;

                    // Find publications after the request year
                    var eligiblePublications = Object.values(all_records).flatMap(function(user) {
                        return Object.entries(user.citations)
                            .filter(function(entry) {
                                return parseInt(entry[0]) >= parseInt(requestYear);
                            })
                            .flatMap(function(entry) {
                                var year = entry[0];
                                return entry[1].map(function(citation, index) {
                                    return {
                                        year: year,
                                        citation: citation,
                                        uniqueId: user.record_id + '_' + year + '_' + index
                                    };
                                });
                            });
                    });

                    // Create select element for each service request
                    var selectHtml = '<div class="form-group">' +
                        '<label for="service_request_' + requestId + '">' +
                        'Service Request: ' + request.question +
                        '</label>' +
                        '<select id="service_request_' + requestId + '" ' +
                        'name="service_request_' + requestId + '" ' +
                        'multiple="multiple" ' +
                        'class="service-request-publications form-control">' +
                        eligiblePublications.map(function(pub) {
                            return '<option value="' + pub.uniqueId + '">' +
                                '[' + pub.year + '] ' + pub.citation +
                                '</option>';
                        }).join('') +
                        '</select>' +
                        '</div>';

                    // Append to a container in your form
                    $('#publication-mapping-container').append(selectHtml);
                });

                // Initialize select2 or any multi-select plugin if desired
                $('.service-request-publications').select2({
                    placeholder: 'Select publications',
                    allowClear: true
                });
            }

            // Run population when document is ready
            $(document).ready(function() {
                populatePublicationChoices();
            });
            </script>
            <?php
            // Add a container for dynamic publication mapping
            echo '<div id="publication-mapping-container"></div>';
        }
    }

    function redcap_survey_page($project_id, $record, $instrument, $event_id, $group_id, $survey_hash, $response_id, $repeat_instance) {
        $selected_instrument = $this->getProjectSetting('validation_form');
        $apis = $this->getProjectSetting('cohort-api-key');
        $apis = $apis[0]; // it returns a nested array with one element, this gets the element which has the keys
        $api_url = $this->getRedcapApiUrl();

        if ($instrument === $selected_instrument) {
            // get the script from url since surveys page doesn't have direct access to modules
            $script_url = $this->getUrl('js/load_publications_by_user.js', true, true);
            ?>
                <script>
                    const api_keys = <?= json_encode($apis) ?>;
                    console.log(api_keys)
                    const api_url = <?= json_encode($api_url) ?>;
                    console.log(<?= json_encode($selected_instrument) ?>)
                </script>
                <script src="<?= $script_url ?>"></script>
            <?php
        }
    }

    // Save survey response with publication mappings
    function redcap_survey_complete($project_id, $record, $instrument, $event_id, $group_id, $survey_hash, $repeat_instance) {
        $selected_instrument = $this->getProjectSetting('validation_form');
        if ($instrument === $selected_instrument) {
            // Retrieve submitted publication mappings
            $publicationMappings = isset($_POST['publication_mappings']) 
                ? json_decode($_POST['publication_mappings'], true) 
                : [];

            // Save mappings
            $saveData = [
                $record => [
                    $event_id => [
                        'publication_mappings' => json_encode($publicationMappings)
                    ]
                ]
            ];

            // Save the mappings
            $result = \REDCap::saveData(
                $project_id, 
                'array', 
                $saveData, 
                'normal', 
                'YAMLandCSV', 
                'false', 
                true
            );

            // Log any errors
            if (!empty($result['errors'])) {
                $this->log('Error saving publication mappings: ' . print_r($result['errors'], true));
            }
        }
    }
}