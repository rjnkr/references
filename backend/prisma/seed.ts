/**
 * Prisma seed script - populates the admin-manageable lookup tables.
 *
 * Run with:  npx prisma db seed        (wired up in prisma.config.ts)
 *       or:  npm run seed
 *
 * Idempotent: every row is upserted on its natural key, so it is safe to run
 * repeatedly (e.g. after adding entries to the lists below).
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Currencies (ISO 4217) - the ones Tidalis realistically invoices in, plus the
// major reserve currencies. Extend as needed; `code` is the natural key.
// ---------------------------------------------------------------------------
const currencies: { code: string; name: string; symbol?: string }[] = [
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'Pound Sterling', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan Renminbi', symbol: '¥' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'ISK', name: 'Iceland Krona', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'PKR', name: 'Pakistan Rupee', symbol: '₨' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'QAR', name: 'Qatari Rial', symbol: '﷼' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب' },
  { code: 'OMR', name: 'Rial Omani', symbol: '﷼' },
  { code: 'ILS', name: 'New Israeli Sheqel', symbol: '₪' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'GHS', name: 'Ghana Cedi', symbol: '₵' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/' },
  { code: 'PAN', name: 'Panamanian Balboa', symbol: 'B/.' },
];

// ---------------------------------------------------------------------------
// Countries (ISO 3166-1 alpha-2, complete list). `isoCode` is the natural key,
// short English names are used so they fit the UI comfortably.
// ---------------------------------------------------------------------------
const countries: [string, string][] = [
  ['AF', 'Afghanistan'],
  ['AX', 'Åland Islands'],
  ['AL', 'Albania'],
  ['DZ', 'Algeria'],
  ['AS', 'American Samoa'],
  ['AD', 'Andorra'],
  ['AO', 'Angola'],
  ['AI', 'Anguilla'],
  ['AQ', 'Antarctica'],
  ['AG', 'Antigua and Barbuda'],
  ['AR', 'Argentina'],
  ['AM', 'Armenia'],
  ['AW', 'Aruba'],
  ['AU', 'Australia'],
  ['AT', 'Austria'],
  ['AZ', 'Azerbaijan'],
  ['BS', 'Bahamas'],
  ['BH', 'Bahrain'],
  ['BD', 'Bangladesh'],
  ['BB', 'Barbados'],
  ['BY', 'Belarus'],
  ['BE', 'Belgium'],
  ['BZ', 'Belize'],
  ['BJ', 'Benin'],
  ['BM', 'Bermuda'],
  ['BT', 'Bhutan'],
  ['BO', 'Bolivia'],
  ['BQ', 'Bonaire, Sint Eustatius and Saba'],
  ['BA', 'Bosnia and Herzegovina'],
  ['BW', 'Botswana'],
  ['BV', 'Bouvet Island'],
  ['BR', 'Brazil'],
  ['IO', 'British Indian Ocean Territory'],
  ['BN', 'Brunei Darussalam'],
  ['BG', 'Bulgaria'],
  ['BF', 'Burkina Faso'],
  ['BI', 'Burundi'],
  ['CV', 'Cabo Verde'],
  ['KH', 'Cambodia'],
  ['CM', 'Cameroon'],
  ['CA', 'Canada'],
  ['KY', 'Cayman Islands'],
  ['CF', 'Central African Republic'],
  ['TD', 'Chad'],
  ['CL', 'Chile'],
  ['CN', 'China'],
  ['CX', 'Christmas Island'],
  ['CC', 'Cocos (Keeling) Islands'],
  ['CO', 'Colombia'],
  ['KM', 'Comoros'],
  ['CG', 'Congo'],
  ['CD', 'Congo (Democratic Republic of the)'],
  ['CK', 'Cook Islands'],
  ['CR', 'Costa Rica'],
  ['CI', "Côte d'Ivoire"],
  ['HR', 'Croatia'],
  ['CU', 'Cuba'],
  ['CW', 'Curaçao'],
  ['CY', 'Cyprus'],
  ['CZ', 'Czechia'],
  ['DK', 'Denmark'],
  ['DJ', 'Djibouti'],
  ['DM', 'Dominica'],
  ['DO', 'Dominican Republic'],
  ['EC', 'Ecuador'],
  ['EG', 'Egypt'],
  ['SV', 'El Salvador'],
  ['GQ', 'Equatorial Guinea'],
  ['ER', 'Eritrea'],
  ['EE', 'Estonia'],
  ['SZ', 'Eswatini'],
  ['ET', 'Ethiopia'],
  ['FK', 'Falkland Islands'],
  ['FO', 'Faroe Islands'],
  ['FJ', 'Fiji'],
  ['FI', 'Finland'],
  ['FR', 'France'],
  ['GF', 'French Guiana'],
  ['PF', 'French Polynesia'],
  ['TF', 'French Southern Territories'],
  ['GA', 'Gabon'],
  ['GM', 'Gambia'],
  ['GE', 'Georgia'],
  ['DE', 'Germany'],
  ['GH', 'Ghana'],
  ['GI', 'Gibraltar'],
  ['GR', 'Greece'],
  ['GL', 'Greenland'],
  ['GD', 'Grenada'],
  ['GP', 'Guadeloupe'],
  ['GU', 'Guam'],
  ['GT', 'Guatemala'],
  ['GG', 'Guernsey'],
  ['GN', 'Guinea'],
  ['GW', 'Guinea-Bissau'],
  ['GY', 'Guyana'],
  ['HT', 'Haiti'],
  ['HM', 'Heard Island and McDonald Islands'],
  ['VA', 'Holy See'],
  ['HN', 'Honduras'],
  ['HK', 'Hong Kong'],
  ['HU', 'Hungary'],
  ['IS', 'Iceland'],
  ['IN', 'India'],
  ['ID', 'Indonesia'],
  ['IR', 'Iran'],
  ['IQ', 'Iraq'],
  ['IE', 'Ireland'],
  ['IM', 'Isle of Man'],
  ['IL', 'Israel'],
  ['IT', 'Italy'],
  ['JM', 'Jamaica'],
  ['JP', 'Japan'],
  ['JE', 'Jersey'],
  ['JO', 'Jordan'],
  ['KZ', 'Kazakhstan'],
  ['KE', 'Kenya'],
  ['KI', 'Kiribati'],
  ['KP', "Korea (Democratic People's Republic of)"],
  ['KR', 'Korea (Republic of)'],
  ['KW', 'Kuwait'],
  ['KG', 'Kyrgyzstan'],
  ['LA', "Lao People's Democratic Republic"],
  ['LV', 'Latvia'],
  ['LB', 'Lebanon'],
  ['LS', 'Lesotho'],
  ['LR', 'Liberia'],
  ['LY', 'Libya'],
  ['LI', 'Liechtenstein'],
  ['LT', 'Lithuania'],
  ['LU', 'Luxembourg'],
  ['MO', 'Macao'],
  ['MG', 'Madagascar'],
  ['MW', 'Malawi'],
  ['MY', 'Malaysia'],
  ['MV', 'Maldives'],
  ['ML', 'Mali'],
  ['MT', 'Malta'],
  ['MH', 'Marshall Islands'],
  ['MQ', 'Martinique'],
  ['MR', 'Mauritania'],
  ['MU', 'Mauritius'],
  ['YT', 'Mayotte'],
  ['MX', 'Mexico'],
  ['FM', 'Micronesia'],
  ['MD', 'Moldova'],
  ['MC', 'Monaco'],
  ['MN', 'Mongolia'],
  ['ME', 'Montenegro'],
  ['MS', 'Montserrat'],
  ['MA', 'Morocco'],
  ['MZ', 'Mozambique'],
  ['MM', 'Myanmar'],
  ['NA', 'Namibia'],
  ['NR', 'Nauru'],
  ['NP', 'Nepal'],
  ['NL', 'Netherlands'],
  ['NC', 'New Caledonia'],
  ['NZ', 'New Zealand'],
  ['NI', 'Nicaragua'],
  ['NE', 'Niger'],
  ['NG', 'Nigeria'],
  ['NU', 'Niue'],
  ['NF', 'Norfolk Island'],
  ['MK', 'North Macedonia'],
  ['MP', 'Northern Mariana Islands'],
  ['NO', 'Norway'],
  ['OM', 'Oman'],
  ['PK', 'Pakistan'],
  ['PW', 'Palau'],
  ['PS', 'Palestine'],
  ['PA', 'Panama'],
  ['PG', 'Papua New Guinea'],
  ['PY', 'Paraguay'],
  ['PE', 'Peru'],
  ['PH', 'Philippines'],
  ['PN', 'Pitcairn'],
  ['PL', 'Poland'],
  ['PT', 'Portugal'],
  ['PR', 'Puerto Rico'],
  ['QA', 'Qatar'],
  ['RE', 'Réunion'],
  ['RO', 'Romania'],
  ['RU', 'Russian Federation'],
  ['RW', 'Rwanda'],
  ['BL', 'Saint Barthélemy'],
  ['SH', 'Saint Helena, Ascension and Tristan da Cunha'],
  ['KN', 'Saint Kitts and Nevis'],
  ['LC', 'Saint Lucia'],
  ['MF', 'Saint Martin (French part)'],
  ['PM', 'Saint Pierre and Miquelon'],
  ['VC', 'Saint Vincent and the Grenadines'],
  ['WS', 'Samoa'],
  ['SM', 'San Marino'],
  ['ST', 'Sao Tome and Principe'],
  ['SA', 'Saudi Arabia'],
  ['SN', 'Senegal'],
  ['RS', 'Serbia'],
  ['SC', 'Seychelles'],
  ['SL', 'Sierra Leone'],
  ['SG', 'Singapore'],
  ['SX', 'Sint Maarten (Dutch part)'],
  ['SK', 'Slovakia'],
  ['SI', 'Slovenia'],
  ['SB', 'Solomon Islands'],
  ['SO', 'Somalia'],
  ['ZA', 'South Africa'],
  ['GS', 'South Georgia and the South Sandwich Islands'],
  ['SS', 'South Sudan'],
  ['ES', 'Spain'],
  ['LK', 'Sri Lanka'],
  ['SD', 'Sudan'],
  ['SR', 'Suriname'],
  ['SJ', 'Svalbard and Jan Mayen'],
  ['SE', 'Sweden'],
  ['CH', 'Switzerland'],
  ['SY', 'Syrian Arab Republic'],
  ['TW', 'Taiwan'],
  ['TJ', 'Tajikistan'],
  ['TZ', 'Tanzania'],
  ['TH', 'Thailand'],
  ['TL', 'Timor-Leste'],
  ['TG', 'Togo'],
  ['TK', 'Tokelau'],
  ['TO', 'Tonga'],
  ['TT', 'Trinidad and Tobago'],
  ['TN', 'Tunisia'],
  ['TR', 'Türkiye'],
  ['TM', 'Turkmenistan'],
  ['TC', 'Turks and Caicos Islands'],
  ['TV', 'Tuvalu'],
  ['UG', 'Uganda'],
  ['UA', 'Ukraine'],
  ['AE', 'United Arab Emirates'],
  ['GB', 'United Kingdom'],
  ['US', 'United States of America'],
  ['UM', 'United States Minor Outlying Islands'],
  ['UY', 'Uruguay'],
  ['UZ', 'Uzbekistan'],
  ['VU', 'Vanuatu'],
  ['VE', 'Venezuela'],
  ['VN', 'Viet Nam'],
  ['VG', 'Virgin Islands (British)'],
  ['VI', 'Virgin Islands (U.S.)'],
  ['WF', 'Wallis and Futuna'],
  ['EH', 'Western Sahara'],
  ['YE', 'Yemen'],
  ['ZM', 'Zambia'],
  ['ZW', 'Zimbabwe'],
];

// ---------------------------------------------------------------------------
// Document types.
// ---------------------------------------------------------------------------
const documentTypes = [
  'Contract',
  'Acceptance Certificate',
  'Technical Specification',
  'As-Built Documentation',
  'Test Report',
  'Manual',
  'Other',
];

// ---------------------------------------------------------------------------
// URL types.
// ---------------------------------------------------------------------------
const urlTypes = ['Pipedrive', 'System', 'Support', 'Project'];

// ---------------------------------------------------------------------------
// UN/LOCODE starter set.
//
// NOTE: this is deliberately a handful of well-known ports only. The official
// UN/LOCODE dataset published by UNECE contains 100.000+ locations and should
// be bulk-imported once, from the official CSV release, using
// `npm run import:unlocodes -- /path/to/code-list.csv`
// (see prisma/import-unlocodes.ts). Do not try to maintain the full list here.
// ---------------------------------------------------------------------------
const unLocodes: [string, string, string, number, number][] = [
  // [code, location name, country ISO code, latitude, longitude]
  // Coordinates are WGS84 decimal degrees for the port / city centre; they only
  // need to be good enough to plot the location on a world map.
  ['NLRTM', 'Rotterdam', 'NL', 51.9225, 4.47917],
  ['NLAMS', 'Amsterdam', 'NL', 52.3728, 4.89361],
  ['NLIJM', 'IJmuiden', 'NL', 52.4583, 4.61028],
  ['BEANR', 'Antwerpen', 'BE', 51.2194, 4.40250],
  ['BEZEE', 'Zeebrugge', 'BE', 51.3306, 3.20833],
  ['DEHAM', 'Hamburg', 'DE', 53.5511, 9.99361],
  ['DEBRV', 'Bremerhaven', 'DE', 53.5396, 8.58083],
  ['GBLON', 'London', 'GB', 51.5074, -0.12780],
  ['GBSOU', 'Southampton', 'GB', 50.9097, -1.40430],
  ['FRLEH', 'Le Havre', 'FR', 49.4944, 0.10790],
  ['FRMRS', 'Marseille', 'FR', 43.2965, 5.36978],
  ['ESALG', 'Algeciras', 'ES', 36.1408, -5.45640],
  ['ESBCN', 'Barcelona', 'ES', 41.3851, 2.17340],
  ['ITGOA', 'Genova', 'IT', 44.4056, 8.94630],
  ['NOOSL', 'Oslo', 'NO', 59.9139, 10.75220],
  ['SEGOT', 'Göteborg', 'SE', 57.7089, 11.97460],
  ['DKCPH', 'København', 'DK', 55.6761, 12.56830],
  ['PLGDN', 'Gdansk', 'PL', 54.3520, 18.64660],
  ['USNYC', 'New York', 'US', 40.7128, -74.00600],
  ['USLAX', 'Los Angeles', 'US', 33.7406, -118.27110],
  ['USHOU', 'Houston', 'US', 29.7604, -95.36980],
  ['CAVAN', 'Vancouver', 'CA', 49.2827, -123.12070],
  ['PAPTY', 'Panama City', 'PA', 8.9824, -79.51990],
  ['BRSSZ', 'Santos', 'BR', -23.9608, -46.33360],
  ['SGSIN', 'Singapore', 'SG', 1.2905, 103.85200],
  ['CNSHA', 'Shanghai', 'CN', 31.2304, 121.47370],
  ['CNNGB', 'Ningbo', 'CN', 29.8683, 121.54400],
  ['HKHKG', 'Hong Kong', 'HK', 22.3193, 114.16940],
  ['KRPUS', 'Busan', 'KR', 35.1796, 129.07560],
  ['JPTYO', 'Tokyo', 'JP', 35.6528, 139.83950],
  ['MYPKG', 'Port Klang', 'MY', 3.0000, 101.39000],
  ['AEDXB', 'Dubai', 'AE', 25.2697, 55.30950],
  ['AEJEA', 'Jebel Ali', 'AE', 25.0111, 55.06170],
  ['SAJED', 'Jeddah', 'SA', 21.4858, 39.19250],
  ['QADOH', 'Doha', 'QA', 25.2854, 51.53100],
  ['EGPSD', 'Port Said', 'EG', 31.2653, 32.30190],
  ['ZADUR', 'Durban', 'ZA', -29.8587, 31.02180],
  ['AUSYD', 'Sydney', 'AU', -33.8568, 151.21530],
  ['AUMEL', 'Melbourne', 'AU', -37.8136, 144.96310],
  ['NZAKL', 'Auckland', 'NZ', -36.8485, 174.76330],
];

async function main() {
  console.log('Seeding currencies...');
  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: { name: currency.name, symbol: currency.symbol ?? null },
      create: { code: currency.code, name: currency.name, symbol: currency.symbol ?? null },
    });
  }
  console.log(`  ${currencies.length} currencies`);

  console.log('Seeding countries...');
  for (const [isoCode, name] of countries) {
    await prisma.country.upsert({
      where: { isoCode },
      update: { name },
      create: { isoCode, name },
    });
  }
  console.log(`  ${countries.length} countries`);

  console.log('Seeding document types...');
  for (const name of documentTypes) {
    await prisma.documentType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`  ${documentTypes.length} document types`);

  console.log('Seeding URL types...');
  for (const name of urlTypes) {
    await prisma.urlType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`  ${urlTypes.length} URL types`);

  console.log('Seeding UN/LOCODE starter set...');
  const countryIdByIso = new Map(
    (await prisma.country.findMany({ select: { id: true, isoCode: true } })).map((c) => [
      c.isoCode,
      c.id,
    ]),
  );
  for (const [code, name, isoCode, latitude, longitude] of unLocodes) {
    const countryId = countryIdByIso.get(isoCode) ?? null;
    await prisma.unLocode.upsert({
      where: { code },
      // `update` must list the coordinates too, otherwise re-running the seed
      // would leave rows created before they existed without a position.
      update: { name, countryId, latitude, longitude },
      create: { code, name, countryId, latitude, longitude },
    });
  }
  console.log(`  ${unLocodes.length} UN/LOCODEs`);

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
