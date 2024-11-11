<?php

namespace CAAIModules\PublicationValidator;

use ExternalModules\AbstractExternalModule;
use ExternalModules\ExternalModules;
use REDCap;

class PublicationValidator extends AbstractExternalModule {

    // provided courtesy of Scott J. Pearson
    private static function isExternalModulePage() {
		$page = isset($_SERVER['PHP_SELF']) ? $_SERVER['PHP_SELF'] : "";
		if (preg_match("/ExternalModules\/manager\/project.php/", $page)) {
			return TRUE;
		}
		if (preg_match("/ExternalModules\/manager\/ajax\//", $page)) {
			return TRUE;
		}
		if (preg_match("/external_modules\/manager\/project.php/", $page)) {
			return TRUE;
		}
		if (preg_match("/external_modules\/manager\/ajax\//", $page)) {
			return TRUE;
		}
		return FALSE;
	}

    private static function isRecordStatusDashboardPage() {
        $page = isset($_SERVER['PHP_SELF']) ? $_SERVER['PHP_SELF'] : "";
        if (preg_match("/DataEntry\/record_status_dashboard.php/", $page)) {
            return TRUE;
        }
        return FALSE;
    }

    /*private static function isSurveyPage() {
        $page = isset($_SERVER['PHP_SELF']) ? $_SERVER['PHP_SELF'] : "";
        if (preg_match("/ExternalModules\/manager\/project.php/", $page)) {
            return TRUE;
        }
        if (preg_match("/ExternalModules\/manager\/ajax\//", $page)) {
            return TRUE;
        }
        if (preg_match("/external_modules\/manager\/project.php/", $page)) {
            return TRUE;
        }
        if (preg_match("/external_modules\/manager\/ajax\//", $page)) {
            return TRUE;
        }
        return FALSE;
    }*/

    function redcap_every_page_top($project_id) {
        if (self::isRecordStatusDashboardPage()){
            $project_id = $_GET['pid']; // or however you're getting the project ID
            $service_requests = REDCap::getData($project_id, 'json-array');
            $form = $this->getProjectSetting('form-id');
            $apis = $this->getProjectSetting('cohort-api-key');
            $citations = [];
            $project_title = REDCap::getProjectTitle();
            ?>
                <script>
                    const apis = <?= json_encode($apis) ?>;
                    const serviceRequests = <?= json_encode($service_requests) ?>;
                    const cohortAPIs = <?= json_encode($apis)?>;
                </script>
            <script src="<?= $this->getUrl('js/load_publications.js') ?>"></script>
            <?php
        }

        if (self::isExternalModulePage()) {
            $project_id = $_GET['pid']; // or however you're getting the project ID
            $whole_data = REDCap::getData($project_id, 'json-array');
            $form = $this->getProjectSetting('form-id');
            $cohorts = $this->getProjectSetting('cohort-api-key');
            $citations = [];
            $project_title = REDCap::getProjectTitle();

            ?>
            <script>
                const wholeData = <?= json_encode($whole_data) ?>;
                const cohortAPIs = <?= json_encode($cohorts)?>;
                console.log(wholeData);
                console.log(cohortAPIs);
            </script>

            <script src="<?= $this->getUrl('js/cohort_sort.js') ?>"></script>
            <?php
        }
    }
}
