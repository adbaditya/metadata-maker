/*	There are some blocks of numbers 4 or 5 digits long that require leading zeros if the number isn't big enough to
 *	fill all the digits.
 *
 *	content: The number that needs to go into the field
 *	type: Determines the number of digits to output
 *			- 'length' will output 4 digits
 *			- anything else will output 5 digits
 */
console.log("fillManufacturer function loaded:", typeof fillManufacturer);
var subfieldsbd = ["b","c","d"];
function addZeros(content,type) {
	var str = content.toString();
	if (type === 'length') {
		var num_zeros = 4 - str.length;
	}
	else {
		var num_zeros = 5 - str.length;
	}
	var output = '';
	for (var i = 0; i < num_zeros; i++) {
		output += '0';
	};
	output += str;
	return output;
}

/*
 * returns the length of a UTF-8 string in bytes. Acounts for the varying lengths of characters.
 */
function getByteLength(text) {
	var byteLength = 0;
	for (var i = 0; i < text.length; i++) {
		var c = text[i];
		
		if ( c <= '\u007F' && c >= '\u0000') {
			byteLength += 1;
		}
		else if ( c >= '\u0080' && c <= '\u07FF') {
			byteLength += 2;
		}
		else if ( c >= '\u0800' && c <= '\uFFFF') {
			byteLength += 3;
		}
		else if ( c >= '\u10000' && c <= '\u1FFFFF') {
			byteLength += 4;
		}
	}
	return byteLength;
}

/*
 * Generates the MARC format's 008 controlfield for books
 */
/*function create008Field(record) {
	var controlfield008 = '';

	var timestamp = getTimestamp();
	timestamp = timestamp.substring(2,8);

	controlfield008 += timestamp;

	if (checkExists(record.publication_year) && checkExists(record.copyright_year)) {
		controlfield008 += 't' + record.publication_year + record.copyright_year;
	}
	else if (checkExists(record.publication_year)) {
		controlfield008 += 's' + record.publication_year + '    ';
	}
	else if (checkExists(record.copyright_year)) {
		controlfield008 += 't' + record.copyright_year + record.copyright_year;
	}
	else {
		controlfield008 += 'nuuuuuuuu';
	}

	if (checkExists(record.publication_country)) {
		controlfield008 += record.publication_country;
		if (record.publication_country.length === 2) {
			controlfield008 += ' ';
		}
	}
	else {
		controlfield008 += 'xx ';
	}

	if (checkExists(record.illustrations_yes) && record.illustrations_yes == true) {
		controlfield008 += 'a   ';
	}
	else {
		controlfield008 += '    '
	}

	controlfield008 += '       000 ';

	if (checkExists(record.literature_yes) && checkExists(record.literature_dropdown)) {
		controlfield008 += record.literature_dropdown;
	}
	else {
		controlfield008 += '0';
	}

	controlfield008 += 'zxx d';

	return controlfield008;
}*/


function create008Field(record) {
    var controlfield008 = '';

    // Positions 00-05: Date entered (YYMMDD)
    var timestamp = getTimestamp();
    timestamp = timestamp.substring(2,8);
    controlfield008 += timestamp;

    // Position 06: Dates unknown
    controlfield008 += 'n';

    // Positions 07-10: Date 1 unknown
    controlfield008 += 'uuuu';

    // Positions 11-14: Date 2 unknown
    controlfield008 += 'uuuu';

    // Positions 15-17: Place unknown
    if (checkExists(record.manufacturer_country)) {
        controlfield008 += record.manufacturer_country;
        if (record.manufacturer_country.length === 2) {
            controlfield008 += ' ';
        }
    } else {
        controlfield008 += 'xx\\';  // Note the backslash for position 17
    }

    // Positions 18-34: Undefined for mixed materials (17 backslashes)
    controlfield008 += '\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\';  // 17 backslashes

    // Positions 35-37: Language - no linguistic content
    controlfield008 += 'zxx';

    // Position 38: Modified record - not specified
    controlfield008 += '\\';

    // Position 39: Cataloging agency - Other
    controlfield008 += 'd';

    return controlfield008;
}

/*
 * Crate MARC subfield
 */
function createSubfield(code,content) {
	return String.fromCharCode(31) + code + content;
}

/*
 * Crate MARC field, containing all the appropriate subfields
 */
function createContent(ind,subfields) {
	var content = String.fromCharCode(30) + ind;
	for (var i = 0; i < subfields.length; i++) {
		content += subfields[i];
	}
	return content;
}

/*
 * For use in the fill functions. The MARC equivalent of createMARCXMLField. The input tag is unused but is needed
 * so the two equivalent functions take the same input.
 */
function createContentFill(tag,ind1,ind2,subfields) {
	return createContent(ind1+ind2,subfields);
}

/*
 * Create entry in the directory portion of the MARC record for a field in the content portion
 */
function createDirectory(number,content,head) {
	return number + addZeros(getByteLength(content),'length') + addZeros(head,'head');
}

/*
 * Create a MARCXML subfield
 */
function createMARCXMLSubfield(code,content) {
	return '    <subfield code="' + code + '">' + content + '</subfield>\n';
}

/*
 * Create a datafield from the tag, the two ind's, and an array of subfields.
 */
function createMARCXMLField(tag,ind1,ind2,subfields) {
	var datafield = '  <datafield tag="' + tag + '" ind1="' + ind1 + '" ind2="' + ind2 + '">\n';
	for (var i = 0; i < subfields.length; i++) {
		datafield += subfields[i];
	}
	datafield += '  </datafield>\n';
	return datafield;
}

function fillISBN(record,head,fieldFunc,subfieldFunc) {
	if (checkExists(record.isbn)) {
		var isbn = fieldFunc('020',' ',' ',[subfieldFunc('a',record.isbn)]);

		//MARC
		if (head !== null) {
			var isbn_directory = createDirectory('020',isbn,head);
			return [isbn_directory,isbn];
		}
		//MARCXML
		else {
			return isbn;
		}
	}
	else {
		return head !== null ? ['',''] : '';
	}
}


function fillAuthor(record,head,fieldFunc,subfieldFunc) {
	//Transliteration is in author_array[1], normal author input in author_array[0]
	console.log("DownloadMARC");
	//var latin_index = checkExists(record.author[1]['family']) ? 1 : 0;
	var role_index = { 'art': 'artist', 'aut': 'author', 'ctb': 'contributor', 'edt': 'editor', 'ill': 'illustrator', 'trl': 'translator'}
	var author_subfields;
	var author_content = '';
	if(checkExists(record.author[latin_index]['family'])) {
		author_content = record.author[latin_index]['family'];
	}
	else if (checkExists(record.author[latin_index]['family'])) {
		if (checkExists(record.author[latin_index]['family'])) {
			author_content = record.author[latin_index]['family'] 
		}
		else {
		}
	}
	else {
		return head !== null ? ['',''] : '';
	}
	if (record.author[0]['viaf'] !=""){
		if (record.author[0]['lc'] !=""){
			
			// var subbd = record.author[0]['subbd'];
			// add subfield a
			author_subfields = [subfieldFunc('a',author_content)]

			//add subfields b-d
			for (var i = 0; i < subfieldsbd.length; i++) {
				if (record.author[0]['subbd'][i]){
					if (subfieldsbd[i] == "b"){
						author_subfields = [author_subfields[0]]
					}
					author_subfields[author_subfields.length] = subfieldFunc(subfieldsbd[i],record.author[0]['subbd'][i])
				};

			};
			// add other subfields
			author_subfields = author_subfields.concat([
			subfieldFunc('e', role_index[record.author[0]['role']]),
			subfieldFunc('0', record.author[0]['lc']),
			subfieldFunc('1', record.author[0]['viaf']),
			subfieldFunc('4',record.author[0]['role'])]);
		}else{

			author_subfields = [
			subfieldFunc('a',author_content), //do we want to manually seperate birthdeath years from their names
			subfieldFunc('e', role_index[record.author[0]['role']]),
			subfieldFunc('1', record.author[0]['viaf']),
			subfieldFunc('4',record.author[0]['role'])
			];
		}
	}else{

			author_subfields = [
			subfieldFunc('a',author_content + ","), 
			subfieldFunc('e', role_index[record.author[0]['role']]),
			subfieldFunc('4',record.author[0]['role'])
			];
	}
	
	if (latin_index === 1) {
		author_subfields.push(subfieldFunc('6','880-03'));
	}

	var author;
	if (record.author[0]['lc'] !=""){
		author = fieldFunc('100',record.author[0]['ind1'],' ',author_subfields);
	}else{
		author = fieldFunc('100','1',' ',author_subfields);
	}

	//MARC
	if (head !== null) {
		var author_directory = createDirectory('100',author,head);
		return [author_directory,author];
	}
	//MARCXML
	else {
		return author;
	}
}

/*
 * Only for English and French non-filing characters
 */
function getNonfilingCount(title,lang) {
	if (lang === 'eng') {
		if (title.substring(0,2) === 'A ') {
			return '2';
		}
		else if (title.substring(0,3) === 'An ') {
			return '3';
		}
		else if (title.substring(0,4) === 'The ') {
			return '4';
		}
		else {
			return '0';
		}
	}
	else {
		if (title.substring(0,2) === "L'") {
			return '2';
		}
		else if (title.substring(0,3) === 'Le ' || title.substring(0,3) === 'La ') {
			return '3';
		}
		else if (title.substring(0,4) === 'Les ') {
			return '4';
		}
		else {
			return '0';
		}
	}
}

function fillTitle(record,head,fieldFunc,subfieldFunc) {
	//author_array[0] contains the contents of the first author field
	var title_ind1 = checkExists(record.author[0]['family']) || checkExists(record.author[0]['given']) ? '1' : '0';
	var latin_index = checkExists(record.title[1]['title']) || checkExists(record.title[1]['subtitle']) ? 1 : 0;

	if (record.language === 'eng' || record.language === 'fre') {
		var title_ind2 = getNonfilingCount(record.title[latin_index]['title'],record.language);
	}
	else {
		var title_ind2 = '0';
	}

	var title_subfields = [];
	if (checkExists(record.title[0]['subtitle'])) {
		title_subfields.push(subfieldFunc('a',record.title[latin_index]['title'] + ' :'),subfieldFunc('b',record.title[latin_index]['subtitle'] + '.'));
	}
	else {
		title_subfields.push(subfieldFunc('a',record.title[latin_index]['title'] + '.'));
	}

	if (latin_index === 1) {
		title_subfields.push(subfieldFunc('6','880-01'));
	}

	var title = fieldFunc('245',title_ind1,title_ind2,title_subfields);
	//MARC
	if (head !== null) {
		var title_directory = createDirectory('245',title,head);
		return [title_directory,title];
	}
	//MARCXML
	else {
		return title;
	}
}

function fillEdition(record,head,fieldFunc,subfieldFunc) {
	if (checkExists(record.edition)) {
		if (record.edition.substring(record.edition.length-1,record.edition.length) === '.') {
			record.edition = record.edition.substring(0,record.edition.length-1);
		}
		var edition = fieldFunc('250',' ',' ',[subfieldFunc('a',record.edition + '.')]);

		//MARC
		if (head !== null) {
			var edition_directory = createDirectory('250',edition,head);
			return [edition_directory,edition];
		}
		//MARCXML
		else {
			return edition;
		}
	}
	else {
		return head !== null ? ['',''] : '';
	}
}

function getCountryName(countryCode) {
    var countryMap = {
        'af': 'Afghanistan',
        'alu': 'Alabama',
        'aku': 'Alaska',
        'aa': 'Albania',
        'abc': 'Alberta',
        'ae': 'Algeria',
        'as': 'American Samoa',
        'an': 'Andorra',
        'ao': 'Angola',
        'am': 'Anguilla',
        'ay': 'Antarctica',
        'aq': 'Antigua and Barbuda',
        'ag': 'Argentina',
        'azu': 'Arizona',
        'aru': 'Arkansas',
        'ai': 'Armenia (Republic)',
        'aw': 'Aruba',
        'at': 'Australia',
        'aca': 'Australian Capital Territory',
        'au': 'Austria',
        'aj': 'Azerbaijan',
        'bf': 'Bahamas',
        'ba': 'Bahrain',
        'bg': 'Bangladesh',
        'bb': 'Barbados',
        'bw': 'Belarus',
        'be': 'Belgium',
        'bh': 'Belize',
        'dm': 'Benin',
        'bm': 'Bermuda Islands',
        'bt': 'Bhutan',
        'bo': 'Bolivia',
        'bn': 'Bosnia and Hercegovina',
        'bs': 'Botswana',
        'bv': 'Bouvet Island',
        'bl': 'Brazil',
        'bcc': 'British Columbia',
        'bi': 'British Indian Ocean Territory',
        'vb': 'British Virgin Islands',
        'bx': 'Brunei',
        'bu': 'Bulgaria',
        'uv': 'Burkina Faso',
        'br': 'Burma',
        'bd': 'Burundi',
        'cv': 'Cabo Verde',
        'cau': 'California',
        'cb': 'Cambodia',
        'cm': 'Cameroon',
        'xxc': 'Canada',
        'ca': 'Caribbean Netherlands',
        'cj': 'Cayman Islands',
        'cx': 'Central African Republic',
        'cd': 'Chad',
        'cl': 'Chile',
        'cc': 'China',
        'ch': 'China (Republic : 1949- )',
        'xa': 'Christmas Island (Indian Ocean)',
        'xb': 'Cocos (Keeling) Islands',
        'ck': 'Colombia',
        'cou': 'Colorado',
        'cq': 'Comoros',
        'cf': 'Congo (Brazzaville)',
        'cg': 'Congo (Democratic Republic)',
        'ctu': 'Connecticut',
        'cw': 'Cook Islands',
        'xga': 'Coral Sea Islands Territory',
        'cr': 'Costa Rica',
        'iv': 'Côte d\'Ivoire',
        'ci': 'Croatia',
        'cu': 'Cuba',
        'co': 'Curaçao',
        'cy': 'Cyprus',
        'xr': 'Czech Republic',
        'deu': 'Delaware',
        'dk': 'Denmark',
        'dcu': 'District of Columbia',
        'ft': 'Djibouti',
        'dq': 'Dominica',
        'dr': 'Dominican Republic',
        'ec': 'Ecuador',
        'ua': 'Egypt',
        'es': 'El Salvador',
        'enk': 'England',
        'eg': 'Equatorial Guinea',
        'ea': 'Eritrea',
        'er': 'Estonia',
        'et': 'Ethiopia',
        'fk': 'Falkland Islands',
        'fa': 'Faroe Islands',
        'fj': 'Fiji',
        'fi': 'Finland',
        'flu': 'Florida',
        'fr': 'France',
        'fg': 'French Guiana',
        'fp': 'French Polynesia',
        'go': 'Gabon',
        'gm': 'Gambia',
        'gz': 'Gaza Strip',
        'gau': 'Georgia',
        'gs': 'Georgia (Republic)',
        'gw': 'Germany',
        'gh': 'Ghana',
        'gi': 'Gibraltar',
        'gr': 'Greece',
        'gl': 'Greenland',
        'gd': 'Grenada',
        'gp': 'Guadeloupe',
        'gu': 'Guam',
        'gt': 'Guatemala',
        'gv': 'Guinea',
        'pg': 'Guinea-Bissau',
        'gy': 'Guyana',
        'ht': 'Haiti',
        'hiu': 'Hawaii',
        'hm': 'Heard and McDonald Islands',
        'ho': 'Honduras',
        'hu': 'Hungary',
        'ic': 'Iceland',
        'idu': 'Idaho',
        'ilu': 'Illinois',
        'ii': 'India',
        'inu': 'Indiana',
        'io': 'Indonesia',
        'iau': 'Iowa',
        'ir': 'Iran',
        'iq': 'Iraq',
        'iy': 'Iraq-Saudi Arabia Neutral Zone',
        'ie': 'Ireland',
        'is': 'Israel',
        'it': 'Italy',
        'jm': 'Jamaica',
        'ja': 'Japan',
        'ji': 'Johnston Atoll',
        'jo': 'Jordan',
        'ksu': 'Kansas',
        'kz': 'Kazakhstan',
        'kyu': 'Kentucky',
        'ke': 'Kenya',
        'gb': 'Kiribati',
        'kn': 'Korea (North)',
        'ko': 'Korea (South)',
        'kv': 'Kosovo',
        'ku': 'Kuwait',
        'kg': 'Kyrgyzstan',
        'ls': 'Laos',
        'lv': 'Latvia',
        'le': 'Lebanon',
        'lo': 'Lesotho',
        'lb': 'Liberia',
        'ly': 'Libya',
        'lh': 'Liechtenstein',
        'li': 'Lithuania',
        'lau': 'Louisiana',
        'lu': 'Luxembourg',
        'xn': 'Macedonia',
        'mg': 'Madagascar',
        'meu': 'Maine',
        'mw': 'Malawi',
        'my': 'Malaysia',
        'xc': 'Maldives',
        'ml': 'Mali',
        'mm': 'Malta',
        'mbc': 'Manitoba',
        'xe': 'Marshall Islands',
        'mq': 'Martinique',
        'mdu': 'Maryland',
        'mau': 'Massachusetts',
        'mu': 'Mauritania',
        'mf': 'Mauritius',
        'ot': 'Mayotte',
        'mx': 'Mexico',
        'miu': 'Michigan',
        'fm': 'Micronesia (Federated States)',
        'xf': 'Midway Islands',
        'mnu': 'Minnesota',
        'msu': 'Mississippi',
        'mou': 'Missouri',
        'mv': 'Moldova',
        'mc': 'Monaco',
        'mp': 'Mongolia',
        'mtu': 'Montana',
        'mo': 'Montenegro',
        'mj': 'Montserrat',
        'mr': 'Morocco',
        'mz': 'Mozambique',
        'sx': 'Namibia',
        'nu': 'Nauru',
        'nbu': 'Nebraska',
        'np': 'Nepal',
        'ne': 'Netherlands',
        'nvu': 'Nevada',
        'nkc': 'New Brunswick',
        'nl': 'New Caledonia',
        'nhu': 'New Hampshire',
        'nju': 'New Jersey',
        'nmu': 'New Mexico',
        'xna': 'New South Wales',
        'nyu': 'New York (State)',
        'nz': 'New Zealand',
        'nfc': 'Newfoundland and Labrador',
        'nq': 'Nicaragua',
        'ng': 'Niger',
        'nr': 'Nigeria',
        'xh': 'Niue',
        'xx': 'No place, unknown, or undetermined',
        'nx': 'Norfolk Island',
        'ncu': 'North Carolina',
        'ndu': 'North Dakota',
        'nik': 'Northern Ireland',
        'nw': 'Northern Mariana Islands',
        'xoa': 'Northern Territory',
        'ntc': 'Northwest Territories',
        'no': 'Norway',
        'nsc': 'Nova Scotia',
        'nuc': 'Nunavut',
        'ohu': 'Ohio',
        'oku': 'Oklahoma',
        'mk': 'Oman',
        'onc': 'Ontario',
        'oru': 'Oregon',
        'pk': 'Pakistan',
        'pw': 'Palau',
        'pn': 'Panama',
        'pp': 'Papua New Guinea',
        'pf': 'Paracel Islands',
        'py': 'Paraguay',
        'pau': 'Pennsylvania',
        'pe': 'Peru',
        'ph': 'Philippines',
        'pc': 'Pitcairn Island',
        'pl': 'Poland',
        'po': 'Portugal',
        'pic': 'Prince Edward Island',
        'pr': 'Puerto Rico',
        'qa': 'Qatar',
        'quc': 'Québec (Province)',
        'qea': 'Queensland',
        're': 'Réunion',
        'riu': 'Rhode Island',
        'rm': 'Romania',
        'ru': 'Russia (Federation)',
        'rw': 'Rwanda',
        'xj': 'Saint Helena',
        'xd': 'Saint Kitts-Nevis',
        'xk': 'Saint Lucia',
        'xl': 'Saint Pierre and Miquelon',
        'xm': 'Saint Vincent and the Grenadines',
        'sc': 'Saint-Barthélemy',
        'st': 'Saint-Martin',
        'ws': 'Samoa',
        'sm': 'San Marino',
        'sf': 'Sao Tome and Principe',
        'snc': 'Saskatchewan',
        'su': 'Saudi Arabia',
        'stk': 'Scotland',
        'sg': 'Senegal',
        'rb': 'Serbia',
        'se': 'Seychelles',
        'sl': 'Sierra Leone',
        'si': 'Singapore',
        'sn': 'Sint Maarten',
        'xo': 'Slovakia',
        'xv': 'Slovenia',
        'bp': 'Solomon Islands',
        'so': 'Somalia',
        'sa': 'South Africa',
        'xra': 'South Australia',
        'scu': 'South Carolina',
        'sdu': 'South Dakota',
        'xs': 'South Georgia and the South Sandwich Islands',
        'sd': 'South Sudan',
        'sp': 'Spain',
        'sh': 'Spanish North Africa',
        'xp': 'Spratly Island',
        'ce': 'Sri Lanka',
        'sj': 'Sudan',
        'sr': 'Surinam',
        'sq': 'Swaziland',
        'sw': 'Sweden',
        'sz': 'Switzerland',
        'sy': 'Syria',
        'ta': 'Tajikistan',
        'tz': 'Tanzania',
        'tma': 'Tasmania',
        'tnu': 'Tennessee',
        'fs': 'Terres australes et antarctiques françaises',
        'txu': 'Texas',
        'th': 'Thailand',
        'em': 'Timor-Leste',
        'tg': 'Togo',
        'tl': 'Tokelau',
        'to': 'Tonga',
        'tr': 'Trinidad and Tobago',
        'ti': 'Tunisia',
        'tu': 'Turkey',
        'tk': 'Turkmenistan',
        'tc': 'Turks and Caicos Islands',
        'tv': 'Tuvalu',
        'ug': 'Uganda',
        'un': 'Ukraine',
        'ts': 'United Arab Emirates',
        'xxk': 'United Kingdom',
        'uik': 'United Kingdom Misc. Islands',
        'xxu': 'United States',
        'uc': 'United States Misc. Caribbean Islands',
        'up': 'United States Misc. Pacific Islands',
        'uy': 'Uruguay',
        'utu': 'Utah',
        'uz': 'Uzbekistan',
        'nn': 'Vanuatu',
        'vp': 'Various places',
        'vc': 'Vatican City',
        've': 'Venezuela',
        'vtu': 'Vermont',
        'vra': 'Victoria',
        'vm': 'Vietnam',
        'vi': 'Virgin Islands of the United States',
        'vau': 'Virginia',
        'wk': 'Wake Island',
        'wlk': 'Wales',
        'wf': 'Wallis and Futuna',
        'wau': 'Washington (State)',
        'wj': 'West Bank of the Jordan River',
        'wvu': 'West Virginia',
        'wea': 'Western Australia',
        'ss': 'Western Sahara',
        'wiu': 'Wisconsin',
        'wyu': 'Wyoming',
        'ye': 'Yemen',
        'ykc': 'Yukon Territory',
        'za': 'Zambia',
        'rh': 'Zimbabwe'
    };
    
    return countryMap[countryCode] || '[Place of manufacture not identified]';
}

function fillManufacturer(record,head,fieldFunc,subfieldFunc) {
    var manuf_subfields = [];
    
    if (checkExists(record.manufacturer_country)) {
        var countryText = getCountryName(record.manufacturer_country);
        manuf_subfields.push(subfieldFunc('a', countryText + ' :'));
    }
    else {
        manuf_subfields.push(subfieldFunc('a','[Place of manufacture not identified] :'));
    }

    if (checkExists(record.manufacturer)) {
        if (checkExists(record.translit_manufacturer)) {
            manuf_subfields.push(subfieldFunc('b',record.translit_manufacturer + ','));
        }
        else {
            manuf_subfields.push(subfieldFunc('b',record.manufacturer + ','));
        }
    }
    else {
        manuf_subfields.push(subfieldFunc('b','[manufacturer not identified],'));
    }

    if (checkExists(record.manufacturer_year)) {
        manuf_subfields.push(subfieldFunc('c',record.manufacturer_year + '.'));
    }
    else {
        manuf_subfields.push(subfieldFunc('c','[date of manufacture not identified]'));
    }

    if (checkExists(record.translit_manufacturer) || checkExists(record.translit_manuf_place)) {
        manuf_subfields.push(subfieldFunc('6','880-02'));
    }

    var manuf = fieldFunc('264',' ','0',manuf_subfields);

    //MARC
    if (head !== null) {
        var manuf_directory = createDirectory('264',manuf,head);
        return [manuf_directory,manuf];
    }
    //MARCXML
    else {
        return manuf;
    }
}

function fillSerial(record,head,fieldFunc,subfieldFunc) {
    if (checkExists(record.serial)) {
        var serial = fieldFunc('024','7',' ',[
            subfieldFunc('a',record.serial),
            subfieldFunc('2','local')
        ]);

        //MARC
        if (head !== null) {
            var serial_directory = createDirectory('024',serial,head);
            return [serial_directory,serial];
        }
        //MARCXML
        else {
            return serial;
        }
    }
    else {
        return head !== null ? ['',''] : '';
    }
}

function fillCopyright(record,head,fieldFunc,subfieldFunc) {
	if (checkExists(record.copyright_year)) {
		var copyright = fieldFunc('264',' ','4',[subfieldFunc('c','\u00A9' + record.copyright_year)]);

		//MARC
		if (head !== null) {
			var copyright_directory = createDirectory('264',copyright,head);
			return [copyright_directory,copyright];
		}
		//MARCXML
		else {
			return copyright;
		}
	}
	else {
		return head !== null ? ['',''] : '';
	}
}

function fillPhysical(record,head,fieldFunc,subfieldFunc) {
    var physical_subfields = [];

    if (record.pages === '0' || record.unpaged || !checkExists(record.pieces)) {
        var pieces_string = '1 piece';  // Since you only have "pieces" now
    }
    else if (record.pages === '1') {
        var pieces_string = '1 piece';
    }
    else {
        var pieces_string = record.pages + ' pieces';
    }

    physical_subfields.push(subfieldFunc('a',pieces_string + ' ;'));

    if (checkExists(record.dimensions)) {
        var dimensionsText = record.dimensions;
        if (dimensionsText.endsWith(' cm')) {
            physical_subfields.push(subfieldFunc('c', dimensionsText));
        } else {
            physical_subfields.push(subfieldFunc('c', dimensionsText + ' cm'));
        }
    }

    var physical = fieldFunc('300',' ',' ',physical_subfields);

    //MARC
    if (head !== null) {
        var physical_directory = createDirectory('300',physical,head);
        return [physical_directory,physical];
    }
    //MARCXML
    else {
        return physical;
    }
}

function fillNotes(record,head,fieldFunc,subfieldFunc) {
	if (checkExists(record.notes)) {
		var notes = fieldFunc('500',' ',' ',[subfieldFunc('a',record.notes)]);

		//MARC
		if (head !== null) {
			var notes_directory = createDirectory('500',notes,head);
			return [notes_directory,notes];
		}
		//MARCXML
		else {
			return notes;
		}
	}
	else {
		return head !== null ? ['',''] : '';
	}
}

function fillProductManual(record,head,fieldFunc,subfieldFunc) {
    if (checkExists(record.product_manual)) {
        var manual = fieldFunc('856','4','0',[
            subfieldFunc('a',record.product_manual),
            subfieldFunc('z','Product manual or specifications')
        ]);

        //MARC
        if (head !== null) {
            var manual_directory = createDirectory('856',manual,head);
            return [manual_directory,manual];
        }
        //MARCXML
        else {
            return manual;
        }
    }
    else {
        return head !== null ? ['',''] : '';
    }
}

/*function fillKeywords(record,head,fieldFunc,subfieldFunc) {
	var keywords_content = '';
	var keywords_directory = '';
	for (var c = 0; c < record.keywords.length; c++) {
		if (record.keywords[c] !== '') {
			var new_content = fieldFunc('653',' ',' ',[subfieldFunc('a',record.keywords[c]),subfieldFunc('0',record.keywordshtml[c])]);
			keywords_content += new_content;

			//MARC
			if (head !== null) {
				var new_directory = createDirectory('653',new_content,head);
				head += getByteLength(new_content);
				keywords_directory += new_directory;
			}
		}
	}
	if (checkExists(record.lcshvalue)){
		for (var lcshc = 0; lcshc < record.lcshvalue.length; lcshc++){
			if (record.lcshvalue[lcshc] !== ''){
				var new_content = fieldFunc('653',' ',' ',[subfieldFunc('a',record.lcshvalue[lcshc]),subfieldFunc('0',record.lcshuri[lcshc])]);
				keywords_content += new_content;

				if (head !== null) {
					var new_directory = createDirectory('653',new_content,head);
					head += getByteLength(new_content);
					keywords_directory += new_directory;
				}
			}
		}
	}

	//MARC
	if (head !== null) {
		return [keywords_directory,keywords_content,head];
	}
	//MARCXML
	else {
		return keywords_content;
	}
}*/

function fillKeywords(record,head,fieldFunc,subfieldFunc) {
	var tag = '653';

	var keywords_content = '';
	var keywords_directory = '';
	for (var c = 0; c < record.keywords.length; c++) {
		if (record.keywords[c] !== '') {
			var new_content = fieldFunc(tag,' ',' ',[subfieldFunc('a',record.keywords[c])]);
			keywords_content += new_content;

			//MARC
			if (head !== null) {
				var new_directory = createDirectory(tag,new_content,head);
				head += getByteLength(new_content);
				keywords_directory += new_directory;
			}
		}
	}

	return returnMultipleEntries(keywords_directory,keywords_content,head);
}

//Return the results based on which download function was called
function returnMultipleEntries(directory,content,head) {
	//MARC
	if (head !== null) {
		return [directory,content,head];
	}
	//MARCXML
	else {
		return content;
	}
}

function handleSpecialFAST(full_string,check,separating_character,second_field,FAST_subfield,subfieldFunc) {
	var separator = full_string.lastIndexOf(separating_character);
	if (separator != check) {
		separator++;
		if (separating_character == '/') {
			var first = full_string.substring(0,separator-1);
		}
		else {
			var first = full_string.substring(0,separator);
		}
		var second = full_string.substring(separator).trim();
		FAST_subfield.push(subfieldFunc('a',first));
		FAST_subfield.push(subfieldFunc(second_field,second));
	}
	else {
		FAST_subfield.push(subfieldFunc('a',full_string));
	}
}

function fillFAST(record,head,fieldFunc,subfieldFunc) {
	if (checkExists(record.fast)) {
		var FAST = '';
		var FAST_directory = '';
		for (var i = 0; i < record.fast.length; i++) {
			var contentType = record.fast[i][2].substring(1);
			var FAST_subfield = [];
			if (contentType == '00') {
				handleSpecialFAST(record.fast[i][0],record.fast[i][0].indexOf(','),',','d',FAST_subfield,subfieldFunc);
			}
			else if (contentType == '30') {
				handleSpecialFAST(record.fast[i][0],-1,'.','p',FAST_subfield,subfieldFunc);
			}
			else if (contentType == '51') {
				handleSpecialFAST(record.fast[i][0],-1,'/','z',FAST_subfield,subfieldFunc);
			}
			else {
				FAST_subfield.push(subfieldFunc('a',record.fast[i][0]));
			}

			FAST_subfield.push(subfieldFunc('2','fast'));
			FAST_subfield.push(subfieldFunc('0','(OCoLC)' + record.fast[i][1]));

			var new_content = fieldFunc('6' + contentType,record.fast[i][3],'7',FAST_subfield);
			FAST += new_content;

			//MARC
			if (head !== null) {
				var new_directory = createDirectory('6' + contentType,new_content,head);
				head += getByteLength(new_content);
				FAST_directory += new_directory;
			}
		}

		return returnMultipleEntries(FAST_directory,FAST,head);
	}
	else {
		return head !== null ? ['','',head] : '';
	}
}

function fillAdditionalAuthors(record,head,fieldFunc,subfieldFunc) {
	if (checkExists(record.additional_authors)) {
		var authors = '';
		var authors_directory = '';
		var translit_counter = 4;
		var role_index = { 'art': 'artist', 'aut': 'author', 'ctb': 'contributor', 'edt': 'editor', 'ill': 'illustrator', 'trl': 'translator'}

		for (var i = 0; i < record.additional_authors.length; i++) {
			var authors_subfield;
			var new_content;
			if (checkExists(record.additional_authors[i][0]['family'])) {
				var latin_index = checkExists(record.additional_authors[i][1]['family']) ? 1 : 0;

				if (checkExists(record.additional_authors[i][latin_index]['family'])) {
					var authors_content = record.additional_authors[i][latin_index]['family'] ;
				}
				else if (checkExists(record.additional_authors[i][latin_index]['family'])) {
					if (checkExists(record.additional_authors[i][latin_index]['family'])) {
						var authors_content = record.additional_authors[i][latin_index]['family'] ;
					}
					else {
					}
				}
				if (record.additional_authors[i][0]['viaf'] !=""){
					if (record.additional_authors[i][0]['lc'] !=""){
						var subbdm = record.additional_authors[i][0]['subbd'];
						// add subfield a
						authors_subfield = [subfieldFunc('a',authors_content)];
						// add subfields b-d
						for (var m = 0; m < subfieldsbd.length; m++) {
							if(subbdm[m]){
								if(subfieldsbd[m]== "b"){
									authors_subfield = [authors_subfield[0]]
								}
								authors_subfield[authors_subfield.length] = subfieldFunc(subfieldsbd[m],subbdm[m])
							};
							
						};
						authors_subfield = authors_subfield.concat([
							subfieldFunc('e', role_index[record.author[0]['role']] ),
							subfieldFunc('0', record.additional_authors[i][0]['lc'] ),
							subfieldFunc('1', record.additional_authors[i][0]['viaf'] ),
							subfieldFunc('4',record.additional_authors[i][0]['role'])]
						);
					}else{
						authors_subfield = [
							subfieldFunc('a',authors_content),
							subfieldFunc('e',role_index[record.additional_authors[i][0]['role']]),
							subfieldFunc('1',record.additional_authors[i][0]['viaf'] ),
							subfieldFunc('4',record.additional_authors[i][0]['role'])];
					}
				}else{
					authors_subfield = [
							subfieldFunc('a',authors_content + ","),
							subfieldFunc('e',role_index[record.additional_authors[i][0]['role']]),
							subfieldFunc('4',record.additional_authors[i][0]['role'])];
				}
				
				if (latin_index === 1) {
					if (translit_counter < 10) {
						var translit_index = '0' + translit_counter;
					}
					else {
						var translit_index = translit_counter;
					}
					authors_subfield.push(subfieldFunc('6','880-' + translit_index));
					translit_counter++;
				}

				if (record.additional_authors[i][0]['lc'] !=""){
					new_content = fieldFunc('700',record.additional_authors[i][0]['ind1'],' ',authors_subfield);
				}else{
					new_content = fieldFunc('700','1',' ',authors_subfield);
				}

				// var new_content = fieldFunc('700','1',' ',authors_subfield);
				authors += new_content;

				//MARC
				if (head !== null) {
					var new_directory = createDirectory('700',new_content,head);
					head += getByteLength(new_content);
					authors_directory += new_directory;
				}
			}
		}

		//MARC
		if (head !== null) {
			return [authors_directory,authors,head];
		}
		//MARCXML
		else {
			return authors;
		}
	}
	else {
		return head !== null ? ['','',head] : '';
	}
}

function fillTranslitTitle(record,head,fieldFunc,subfieldFunc) {
	//author_array[0] contains the contents of the first author field
	var title_ind1 = checkExists(record.author[0]['family']) || checkExists(record.author[0]['given']) ? '1' : '0';

	if (checkExists(record.title[1]['title'])) {
		var translit_subfields = [];
		if (checkExists(record.title[1]['subtitle'])) {
			translit_subfields.push(subfieldFunc('6','245-01'),subfieldFunc('a',record.title[0]['title'] + ' :'),subfieldFunc('b',record.title[0]['subtitle'] + '.'));
		}
		else {
			translit_subfields.push(subfieldFunc('6','245-01'),subfieldFunc('a',record.title[0]['title'] + '.'));
		}
		var title880 = fieldFunc('880',title_ind1,'0',translit_subfields);

		//MARC
		if (head !== null) {
			var title880_directory = createDirectory('880',title880,head);
			return [title880_directory,title880];
		}
		//MARCXML
		else {
			return title880;
		}
	}
	else {
		return head !== null ? ['',''] : '';
	}
}

function fillTranslitPublisher(record,head,fieldFunc,subfieldFunc) {
	if (checkExists(record.translit_publisher) || checkExists(record.translit_place)) {
		var translit_content = [subfieldFunc('6','264-02')];

		if (checkExists(record.translit_place)) {
			translit_content.push(subfieldFunc('a',record.publication_place + ' :'));
		}

		if (checkExists(record.translit_publisher)) {
			translit_content.push(subfieldFunc('b',record.publisher + ','));
		}

		var publisher880 = fieldFunc('880',' ','1',translit_content);

		//MARC
		if (head !== null) {
			var publisher880_directory = createDirectory('880',publisher880,head);
			return [publisher880_directory,publisher880];
		}
		//MARCXML
		else {
			return publisher880;
		}
	}
	else {
		return head !== null ? ['',''] : '';
	}
}

function fillTranslitAuthor(record,head,fieldFunc,subfieldFunc) {
	//Check if either transliteration field has content
	if (checkExists(record.author[1]['family']) || checkExists(record.author[1]['given'])) {
		var translit_content = [subfieldFunc('6','100-03')];

		if (checkExists(record.author[0]['family']) && checkExists(record.author[0]['given'])) {
			translit_content.push(subfieldFunc('a',record.author[0]['family'] + ', ' + record.author[0]['given'] + '.'));
		}
		else {
			if (checkExists(record.author[0]['family'])) {
				translit_content.push(subfieldFunc('a',record.author[0]['family'] + '.'));
			}
			else {
				translit_content.push(subfieldFunc('a',record.author[0]['given'] + '.'));
			}
		}

		var author880 = fieldFunc('880','1',' ',translit_content);

		//MARC
		if (head !== null) {
			var author880_directory = createDirectory('880',author880,head);
			return [author880_directory,author880];
		}
		//MARCXML
		else {
			return author880;
		}
	}
	else {
		return head !== null ? ['',''] : '';
	}
}

function fillTranslitAdditionalAuthors(record,head,fieldFunc,subfieldFunc) {
	if (checkExists(record.additional_authors)) {
		var authors880 = '';
		var authors880_directory = '';
		var translit_counter = 4;

		for (var i = 0; i < record.additional_authors.length; i++) {
			if ((checkExists(record.additional_authors[i][1]['family']) || checkExists(record.additional_authors[i][1]['given'])) && (checkExists(record.additional_authors[i][0]['family']) || checkExists(record.additional_authors[i][0]['given']))) {
				if (checkExists(record.additional_authors[i][0]['family']) && checkExists(record.additional_authors[i][0]['given'])) {
					var authors_content = record.additional_authors[i][0]['family'] + ', ' + record.additional_authors[i][0]['given'] + '.'
				}
				else {
					if (checkExists(record.additional_authors[i][0]['family'])) {
						var authors_content = record.additional_authors[i][0]['family'] + '.';
					}
					else {
						var authors_content = record.additional_authors[i][0]['given'] + '.';
					}
				}

				if (translit_counter < 10) {
					var translit_index = '0' + translit_counter;
				}
				else {
					var translit_index = translit_counter;
				}
				translit_counter++;

				var new_content = fieldFunc('880',' ','1',[subfieldFunc('6','700-' + translit_index),subfieldFunc('a',authors_content)]);
				authors880 += new_content;

				//MARC
				if (head !== null) {
					var new_directory = createDirectory('880',new_content,head);
					head += getByteLength(new_content);
					authors880_directory += new_directory;
				}
			}
		}

		//MARC
		if (head !== null) {
			return [authors880_directory,authors880,head];
		}
		//MARCXML
		else {
			return authors880;
		}
	}
	else {
		return head !== null ? ['','',head] : '';
	}
}

function fillAlternativeTitle(record, head, createContentFill, createSubfield) {
    if (record.title[0].alternative_title && record.title[0].alternative_title.length > 0) {
        var content = createContentFill('246', '1', ' ', [createSubfield('a', record.title[0].alternative_title)]);
        var directory = createDirectory('246', content, head);
        return [directory, content];
    } else {
        return ['', ''];
    }
}

function fillResourceType(record, head, fieldFunc, subfieldFunc) {
    var resourceType = fieldFunc('945', ' ', ' ', [subfieldFunc('a', 'Mixed material')]);

    if (head !== null) {
        var resourceType_directory = createDirectory('945', resourceType, head);
        return [resourceType_directory, resourceType];
    }
    else {
        return resourceType;
    }
}

/*
 * Create a MARC record. The variable head is a running total of the length of the record so far. The directory/variable[0]
 * variables number the field, point to the content, and list how long the content is. The content/variable[1] variables
 * are simply the content of that field. Order is very important here.
 */
function downloadMARC(record,institution_info) {
	var head = 0;

	var timestamp_content = String.fromCharCode(30) + getTimestamp();
	var timestamp_directory = createDirectory('005',timestamp_content,head);
	head += timestamp_content.length; 

	var controlfield008_content = String.fromCharCode(30) + create008Field(record);
	var controlfield008_directory = createDirectory('008',controlfield008_content,head);
	head += controlfield008_content.length;

	var default1_content = createContent('  ',[createSubfield('a',institution_info['marc']),createSubfield('b','eng'),createSubfield('e','rda'),createSubfield('c',institution_info['marc'])]);
	var default1_directory = createDirectory('040',default1_content,head);
	head += default1_content.length;

	var title = fillTitle(record,head,createContentFill,createSubfield);
	head += getByteLength(title[1]);

	var altTitle = fillAlternativeTitle(record,head,createContentFill,createSubfield);
    head += getByteLength(altTitle[1]);

	var manuf = fillManufacturer(record,head,createContentFill,createSubfield);
	head += getByteLength(manuf[1]);

	var serial = fillSerial(record,head,createContentFill,createSubfield);
	head += getByteLength(serial[1]);

	var physical = fillPhysical(record,head,createContentFill,createSubfield);
	head += getByteLength(physical[1]);

	var default2_content = createContent('  ',[createSubfield('a','three-dimensional form'),createSubfield('b','tdf'),createSubfield('2','rdacontent')]);
	var default2_directory = createDirectory('336',default2_content,head);
	head += default2_content.length;

	var default3_content = createContent('  ',[createSubfield('a','tactile'),createSubfield('b','t'),createSubfield('2','rdamedia')]);
	var default3_directory = createDirectory('337',default3_content,head);
	head += default3_content.length;

	var default4_content = createContent('  ',[createSubfield('a','three-dimensional object'),createSubfield('b','nc'),createSubfield('2','rdacarrier')]);
	var default4_directory = createDirectory('338',default4_content,head);
	head += default4_content.length;

	var notes = fillNotes(record,head,createContentFill,createSubfield);
	head += getByteLength(notes[1]);

	var keywords = fillKeywords(record,head,createContentFill,createSubfield);
	head = keywords[2];

	var resourceType = fillResourceType(record, head, createContentFill, createSubfield);
	head += getByteLength(resourceType[1]);

	var fast = fillFAST(record,head,createContentFill,createSubfield);
	head = fast[2];

	var product_manual = fillProductManual(record,head,createContentFill,createSubfield);
    head += getByteLength(product_manual[1]);

	var title880 = fillTranslitTitle(record,head,createContentFill,createSubfield);
	head += getByteLength(title880[1]);

	var end = String.fromCharCode(30) + String.fromCharCode(29);
	var text = timestamp_directory + controlfield008_directory + default1_directory + title[0] + altTitle[0] + manuf[0] + serial[0] + physical[0] + default2_directory + default3_directory + default4_directory + notes[0] + keywords[0] + product_manual[0] + resourceType[0] + title880[0] + timestamp_content + controlfield008_content + default1_content + title[1] + altTitle[1] + manuf[1] + serial[1] + physical[1] + default2_content + default3_content + default4_content + notes[1] + keywords[1] + product_manual[1] + resourceType[1] + title880[1] + end;

	var leader_len = getByteLength(text) + 24;
    var directory_len = 25 + timestamp_directory.length + controlfield008_directory.length + default1_directory.length + title[0].length + altTitle[0].length + manuf[0].length + serial[0].length + physical[0].length + default2_directory.length + default3_directory.length + default4_directory.length + notes[0].length + keywords[0].length + product_manual[0].length + resourceType[0].length + title880[0].length;
	var leader = addZeros(leader_len,'leader') + 'npm a22' + addZeros(directory_len,'leader') + 'ki 4500';
	text = leader + text;
	downloadFile(text,'mrc');
}

/*
 * Create the MARCXML document
 */
function fillAlternativeTitleXML(record, head, createMARCXMLField, createMARCXMLSubfield) {
    if (record.title[0].alternative_title && record.title[0].alternative_title.length > 0) {
        return createMARCXMLField('246', '1', ' ', [createMARCXMLSubfield('a', record.title[0].alternative_title)]);
    } else {
        return '';
    }
}

function downloadXML(record,institution_info) {
	var startText = '<?xml version="1.0" encoding="utf-8"?>\n<record xmlns="http://www.loc.gov/MARC21/slim" xsi:schemaLocation="http://www.loc.gov/MARC21/slim http://www.loc.gov/standards/marcxml/schema/MARC21slim.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n  <leader>01447nam a2200397ki 4500</leader>\n  <controlfield tag="001"></controlfield>\n';
	
	var formatted_date = getTimestamp();
	var timestamp = '  <controlfield tag="005">' + formatted_date + '</controlfield>\n';
	
	var controlfield008 = create008Field(record);
	controlfield008 = '  <controlfield tag="008">' + controlfield008 + '</controlfield>\n'
	
	var default1 = createMARCXMLField('040',' ',' ',[createMARCXMLSubfield('a','UIU'),createMARCXMLSubfield('b','eng'),createMARCXMLSubfield('e','rda'),createMARCXMLSubfield('c','UIU')]);
	//var isbn = fillISBN(record,null,createMARCXMLField,createMARCXMLSubfield);
	//var author = fillAuthor(record,null,createMARCXMLField,createMARCXMLSubfield);
	var title = fillTitle(record,null,createMARCXMLField,createMARCXMLSubfield);
	var altTitle = fillAlternativeTitleXML(record,null,createMARCXMLField,createMARCXMLSubfield);
	//var edition = fillEdition(record,null,createMARCXMLField,createMARCXMLSubfield);
	var manufacturer = fillManufacturer(record,null,createMARCXMLField,createMARCXMLSubfield);
	var serial = fillSerial(record,null,createMARCXMLField,createMARCXMLSubfield);
    var product_manual = fillProductManual(record,null,createMARCXMLField,createMARCXMLSubfield);
	//var copyright = fillCopyright(record,null,createMARCXMLField,createMARCXMLSubfield);
	var physical = fillPhysical(record,null,createMARCXMLField,createMARCXMLSubfield);
	var default2 = createMARCXMLField('336',' ',' ',[createMARCXMLSubfield('a','three-dimensional form'),createMARCXMLSubfield('b','tdf'),createMARCXMLSubfield('2','rdacontent')]) + 
                   createMARCXMLField('337',' ',' ',[createMARCXMLSubfield('a','tactile'),createMARCXMLSubfield('b','t'),createMARCXMLSubfield('2','rdamedia')]) + 
                   createMARCXMLField('338',' ',' ',[createMARCXMLSubfield('a','three-dimensional object'),createMARCXMLSubfield('b','nc'),createMARCXMLSubfield('2','rdacarrier')]);
	var notes = fillNotes(record,null,createMARCXMLField,createMARCXMLSubfield);
	var keywords = fillKeywords(record,null,createMARCXMLField,createMARCXMLSubfield);
	var resourceType = fillResourceType(record, null, createMARCXMLField, createMARCXMLSubfield);
	//var additional_authors = fillAdditionalAuthors(record,null,createMARCXMLField,createMARCXMLSubfield);
	//var title880 = fillTranslitTitle(record,null,createMARCXMLField,createMARCXMLSubfield);
	//var publisher880 = fillTranslitPublisher(record,null,createMARCXMLField,createMARCXMLSubfield);
	//var author880 = fillTranslitAuthor(record,null,createMARCXMLField,createMARCXMLSubfield);
	//var authors880 = fillTranslitAdditionalAuthors(record,null,createMARCXMLField,createMARCXMLSubfield);
	var endText ='</record>\n';

	var text = startText + timestamp + controlfield008 + default1 + title + altTitle + manufacturer + serial + physical + default2 + notes + keywords + product_manual + resourceType + endText;

    downloadFile(text,'xml');
}
