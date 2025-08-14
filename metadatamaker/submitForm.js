/*
 *	Reads the 'name' variable from the URL and returns the value. Used for passing custom institution info.
 *		if the value has not been passed the function will return undefined.
 *
 *	name: String with the name of an expected variable in the URL
 */
function get(name) {
	if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search)) {
		return decodeURIComponent(name[1]);
	}
}
/* 
 * Edit the strings in this output to attribute records to another institution. The second half of the
 *		function checks the URL for custom info. If that info exists, it overwrites the defaults.
 *
 *	Returns the institution info
 */
function generateInstitutionInfo() {
    var output = {
        //040 $a, 040 $c
        marc: 'VCU',
        mods: {
            physicalLocation: 'Art & Design Library',
            recordContentSource: 'D@A'
        },
        //"seller" info
        html: {
            url: 'http://id.loc.gov/authorities/names/qadovcu',
            name: 'Virginia Commonwealth University, Qatar'
        }
    };

    // First check form fields (if they exist)
    const marcField = document.querySelector('#marc_code');
    const physicalLocationField = document.querySelector('#physicalLocation');
    const recordContentSourceField = document.querySelector('#recordContentSource');
    const lcnField = document.querySelector('#lcno');
    const nameField = document.querySelector('#org_name');

    if (marcField && marcField.value.trim()) {
        output['marc'] = marcField.value.trim();
    }
    if (physicalLocationField && physicalLocationField.value.trim()) {
        output['mods']['physicalLocation'] = physicalLocationField.value.trim();
    }
    if (recordContentSourceField && recordContentSourceField.value.trim()) {
        output['mods']['recordContentSource'] = recordContentSourceField.value.trim();
    }
    if (lcnField && lcnField.value.trim()) {
        output['html']['url'] = 'http://id.loc.gov/authorities/names/' + lcnField.value.trim();
    }
    if (nameField && nameField.value.trim()) {
        output['html']['name'] = nameField.value.trim();
    }

    // Then check URL parameters (existing functionality)
    marc = get('marc');
    if (typeof marc !== 'undefined') {
        output['marc'] = marc;
    }
    physicalLocation = get('physicalLocation');
    if (typeof physicalLocation !== 'undefined') {
        output['mods']['physicalLocation'] = physicalLocation;
    }
    recordContentSource = get('recordContentSource');
    if (typeof recordContentSource !== 'undefined') {
        output['mods']['recordContentSource'] = recordContentSource;
    }
    lcn = get('lcn');
    if (typeof lcn !== 'undefined') {
        output['html']['url'] = 'http://id.loc.gov/authorities/names/' + lcn;
    }
    n = get('n');
    if (typeof n !== 'undefined') {
        output['html']['name'] = n;
    }

    return output;
}

const institutionAlertHTML = `
    <div class="custom-alert-backdrop-common institution-changed-backdrop"></div>
    <div class="custom-alert-common institution-changed-alert">
        <h3>✅ Institution Updated!</h3>
        <div id="institution-details"></div>
        <button class="close-btn">OK</button>
    </div>
`;
document.body.insertAdjacentHTML("beforeend", institutionAlertHTML);

// Handle institution form submission
document.addEventListener('DOMContentLoaded', function() {
    const institutionForm = document.querySelector('#institution_menu');
    if (institutionForm) {
        institutionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get updated institution info
            const institutionInfo = generateInstitutionInfo();
            
            // Show custom alert with the new information
            const detailsDiv = document.querySelector('#institution-details');
            detailsDiv.innerHTML = `
                <p><strong>MARC Code:</strong> ${institutionInfo.marc}</p>
                <p><strong>Physical Location:</strong> ${institutionInfo.mods.physicalLocation}</p>
                <p><strong>Record Content Source:</strong> ${institutionInfo.mods.recordContentSource}</p>
                <p><strong>Organization:</strong> ${institutionInfo.html.name}</p>
            `;
            
            // Show the alert
            document.querySelector('.institution-changed-backdrop').style.display = 'block';
            document.querySelector('.institution-changed-alert').style.display = 'block';
            
            // Hide the institution form
            institutionForm.classList.add('hidden');
        });
    }

    // Handle closing the institution alert
    document.querySelector('.institution-changed-alert .close-btn').addEventListener('click', function() {
        document.querySelector('.institution-changed-backdrop').style.display = 'none';
        document.querySelector('.institution-changed-alert').style.display = 'none';
    });

    // Handle clicking backdrop to close
    document.querySelector('.institution-changed-backdrop').addEventListener('click', function() {
        document.querySelector('.institution-changed-backdrop').style.display = 'none';
        document.querySelector('.institution-changed-alert').style.display = 'none';
    });
});

/*
 * The first listed author should be placed in 100. If no author is listed, then the first
 * listed artist should be placed in 100. If neither role is listed, then we return a person
 * with no name or role listed.
 *
 * list: List of people. Each person is a list of two objects. The first object contains the
 *		 person's family name, given name, and role in creating the piece being catalogued.
 *		 The second object contains the transliterated family name and given name of the same
 *		 person if applicable. Otherwise those two fields are empty strings.
 */
function find100(list) {
	for (iterator = 0; iterator < list.length; iterator++) {
		if (list[iterator][0]['role'] == 'aut') {
			return list.splice(iterator,1);
		}
	}

	for (iterator = 0; iterator < list.length; iterator++) {
		if (list[iterator][0]['role'] == 'art') {
			return list.splice(iterator,1);
		}
	}

	return [[{'family':'','given':'','role':''},{'family':'','given':''}]];
}

/*
 * When the form is submitted, create an object with all user-submitted data. Pass that object to functions that
 * build a record around the data.
 *
 * The first listed author or artist is placed in recordObject.author, while all other credited individuals are
 * placed into recordObject.additional_authors.
 *
 * No information should be submitted to the server, so the default behavior of the button is blocked.
 */
$("#marc-maker").submit(function(event) {
	var words = [];
	var fast_array = [];
	for (var i = 0; i < counter; i++) {
		if(checkExists($("#fastID" + i).val()) && checkExists($("#keyword" + i).val())) {
			if ($("#keyword" + i).val().substring($("#keyword" + i).val().length - 1) == ']') {
				var endpoint = $("#keyword" + i).val().lastIndexOf('[');
				fast_array.push([$("#keyword" + i).val().substring(0,endpoint-1),$("#fastID" + i).val(),$("#fastType" + i).val(),$("#fastInd" + i).val()]);
			}
			else {
				fast_array.push([$("#keyword" + i).val(),$("#fastID" + i).val(),$("#fastType" + i).val(),$("#fastInd" + i).val()]);
			}
		}
		else {
			words.push($("#keyword" + i).val());
		}
	};

	var additional_names = [];
	var translit_additional_names = [];
	var complete_names_list = [
		[
			{
				family: $("#family_name").val(),
				given: $("#given_name").val(),
				role: $("#role").val()
			},
			{
				family: $("#translit_family_name").val(),
				given: $("#translit_given_name").val()
			}
		]
	];
	for (var i = 0; i < aCounter; i++) {
		complete_names_list.push([{ "family": $("#family_name" + i).val(), "given": $("#given_name" + i).val(), "role": $("#role" + i).val()},{ "family": $("#translit_family_name" + i).val(), "given": $("#translit_given_name" + i).val()}]);
	}
	//Find the first listed author or artist
	var entry100 = find100(complete_names_list);

	var recordObject = {
		title: [
			{
				title: $("#title").val(),
				subtitle: $("#subtitle").val()
			},
			{
				title: $("#translit_title").val(),
				subtitle: $("#translit_subtitle").val()
			}
		],
		author: entry100[0],
		publisher: $("#publisher").val(),
		publication_year: $("#year").val(),
		publication_place: $("#place").val(),
		publication_country: $("#country").val(),
		copyright_year: $("#cyear").val(),
		language: $("#language").val(),
		isbn: $("#isbn").val(),
		volume_or_page: $("#vorp").val(),
		pages: $("#pages").val(),
		unpaged: $("#pages_listed").is(':checked'),
		literature_yes: $("#literature-yes").is(':checked'),
		literature_dropdown: $("#literature-dropdown").val(),
		illustrations_yes: $("#illustrations-yes").is(':checked'),
		dimensions: $("#dimensions").val(),
		edition: $("#edition").val(),
		translit_edition: $("#translit_edition").val(),
		translit_publisher: $("#translit_publisher").val(),
		translit_place: $("#translit_place").val(),
		notes: $("#notes").val(),
		keywords: words,
		fast: fast_array,
		additional_authors: complete_names_list
	};

	var institution_info = generateInstitutionInfo();

	if ($("#MARC").is(':checked')) {
		downloadMARC(recordObject,institution_info);
	}

	if ($("#MARCXML").is(':checked')) {
		downloadXML(recordObject,institution_info);
	}

	if ($("#MODS").is(':checked')) {
		downloadMODS(recordObject,institution_info);
	}

	if ($("#HTML").is(':checked')) {
		downloadHTML(recordObject,institution_info);
	}

	if ($("#BIBFRAME").is(':checked')) {
		downloadBIBFRAME(recordObject,institution_info);
	}

	event.preventDefault();
});