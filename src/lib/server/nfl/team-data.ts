export type TeamSeed = {
	espnId: string;
	abbreviation: string;
	name: string;
	city: string;
	conference: 'AFC' | 'NFC';
	division: string;
	colorPrimary: string;
	colorSecondary: string;
	logoUrl: string;
};

const logo = (code: string) => `https://a.espncdn.com/i/teamlogos/nfl/500/${code}.png`;

export const teamSeeds: TeamSeed[] = [
	{
		espnId: '22',
		abbreviation: 'ARI',
		name: 'Cardinals',
		city: 'Arizona',
		conference: 'NFC',
		division: 'NFC West',
		colorPrimary: '#97233f',
		colorSecondary: '#ffb612',
		logoUrl: logo('ari')
	},
	{
		espnId: '1',
		abbreviation: 'ATL',
		name: 'Falcons',
		city: 'Atlanta',
		conference: 'NFC',
		division: 'NFC South',
		colorPrimary: '#a71930',
		colorSecondary: '#ef3340',
		logoUrl: logo('atl')
	},
	{
		espnId: '33',
		abbreviation: 'BAL',
		name: 'Ravens',
		city: 'Baltimore',
		conference: 'AFC',
		division: 'AFC North',
		colorPrimary: '#241773',
		colorSecondary: '#9e7c0c',
		logoUrl: logo('bal')
	},
	{
		espnId: '2',
		abbreviation: 'BUF',
		name: 'Bills',
		city: 'Buffalo',
		conference: 'AFC',
		division: 'AFC East',
		colorPrimary: '#00338d',
		colorSecondary: '#c60c30',
		logoUrl: logo('buf')
	},
	{
		espnId: '29',
		abbreviation: 'CAR',
		name: 'Panthers',
		city: 'Carolina',
		conference: 'NFC',
		division: 'NFC South',
		colorPrimary: '#0085ca',
		colorSecondary: '#0085ca',
		logoUrl: logo('car')
	},
	{
		espnId: '3',
		abbreviation: 'CHI',
		name: 'Bears',
		city: 'Chicago',
		conference: 'NFC',
		division: 'NFC North',
		colorPrimary: '#0b162a',
		colorSecondary: '#c83803',
		logoUrl: logo('chi')
	},
	{
		espnId: '4',
		abbreviation: 'CIN',
		name: 'Bengals',
		city: 'Cincinnati',
		conference: 'AFC',
		division: 'AFC North',
		colorPrimary: '#fb4f14',
		colorSecondary: '#fb4f14',
		logoUrl: logo('cin')
	},
	{
		espnId: '5',
		abbreviation: 'CLE',
		name: 'Browns',
		city: 'Cleveland',
		conference: 'AFC',
		division: 'AFC North',
		colorPrimary: '#311d00',
		colorSecondary: '#ff3c00',
		logoUrl: logo('cle')
	},
	{
		espnId: '6',
		abbreviation: 'DAL',
		name: 'Cowboys',
		city: 'Dallas',
		conference: 'NFC',
		division: 'NFC East',
		colorPrimary: '#003594',
		colorSecondary: '#869397',
		logoUrl: logo('dal')
	},
	{
		espnId: '7',
		abbreviation: 'DEN',
		name: 'Broncos',
		city: 'Denver',
		conference: 'AFC',
		division: 'AFC West',
		colorPrimary: '#fb4f14',
		colorSecondary: '#002244',
		logoUrl: logo('den')
	},
	{
		espnId: '8',
		abbreviation: 'DET',
		name: 'Lions',
		city: 'Detroit',
		conference: 'NFC',
		division: 'NFC North',
		colorPrimary: '#0076b6',
		colorSecondary: '#b0b7bc',
		logoUrl: logo('det')
	},
	{
		espnId: '9',
		abbreviation: 'GB',
		name: 'Packers',
		city: 'Green Bay',
		conference: 'NFC',
		division: 'NFC North',
		colorPrimary: '#203731',
		colorSecondary: '#ffb612',
		logoUrl: logo('gb')
	},
	{
		espnId: '34',
		abbreviation: 'HOU',
		name: 'Texans',
		city: 'Houston',
		conference: 'AFC',
		division: 'AFC South',
		colorPrimary: '#03202f',
		colorSecondary: '#a71930',
		logoUrl: logo('hou')
	},
	{
		espnId: '11',
		abbreviation: 'IND',
		name: 'Colts',
		city: 'Indianapolis',
		conference: 'AFC',
		division: 'AFC South',
		colorPrimary: '#002c5f',
		colorSecondary: '#a2aaad',
		logoUrl: logo('ind')
	},
	{
		espnId: '30',
		abbreviation: 'JAX',
		name: 'Jaguars',
		city: 'Jacksonville',
		conference: 'AFC',
		division: 'AFC South',
		colorPrimary: '#006778',
		colorSecondary: '#9f792c',
		logoUrl: logo('jax')
	},
	{
		espnId: '12',
		abbreviation: 'KC',
		name: 'Chiefs',
		city: 'Kansas City',
		conference: 'AFC',
		division: 'AFC West',
		colorPrimary: '#e31837',
		colorSecondary: '#ffb81c',
		logoUrl: logo('kc')
	},
	{
		espnId: '13',
		abbreviation: 'LV',
		name: 'Raiders',
		city: 'Las Vegas',
		conference: 'AFC',
		division: 'AFC West',
		colorPrimary: '#000000',
		colorSecondary: '#a5acaf',
		logoUrl: logo('lv')
	},
	{
		espnId: '24',
		abbreviation: 'LAC',
		name: 'Chargers',
		city: 'Los Angeles',
		conference: 'AFC',
		division: 'AFC West',
		colorPrimary: '#0080c6',
		colorSecondary: '#ffc20e',
		logoUrl: logo('lac')
	},
	{
		espnId: '14',
		abbreviation: 'LAR',
		name: 'Rams',
		city: 'Los Angeles',
		conference: 'NFC',
		division: 'NFC West',
		colorPrimary: '#003594',
		colorSecondary: '#ffa300',
		logoUrl: logo('lar')
	},
	{
		espnId: '15',
		abbreviation: 'MIA',
		name: 'Dolphins',
		city: 'Miami',
		conference: 'AFC',
		division: 'AFC East',
		colorPrimary: '#008e97',
		colorSecondary: '#fc4c02',
		logoUrl: logo('mia')
	},
	{
		espnId: '16',
		abbreviation: 'MIN',
		name: 'Vikings',
		city: 'Minnesota',
		conference: 'NFC',
		division: 'NFC North',
		colorPrimary: '#4f2683',
		colorSecondary: '#ffc62f',
		logoUrl: logo('min')
	},
	{
		espnId: '17',
		abbreviation: 'NE',
		name: 'Patriots',
		city: 'New England',
		conference: 'AFC',
		division: 'AFC East',
		colorPrimary: '#002244',
		colorSecondary: '#c60c30',
		logoUrl: logo('ne')
	},
	{
		espnId: '18',
		abbreviation: 'NO',
		name: 'Saints',
		city: 'New Orleans',
		conference: 'NFC',
		division: 'NFC South',
		colorPrimary: '#d3bc8d',
		colorSecondary: '#d3bc8d',
		logoUrl: logo('no')
	},
	{
		espnId: '19',
		abbreviation: 'NYG',
		name: 'Giants',
		city: 'New York',
		conference: 'NFC',
		division: 'NFC East',
		colorPrimary: '#0b2265',
		colorSecondary: '#a71930',
		logoUrl: logo('nyg')
	},
	{
		espnId: '20',
		abbreviation: 'NYJ',
		name: 'Jets',
		city: 'New York',
		conference: 'AFC',
		division: 'AFC East',
		colorPrimary: '#125740',
		colorSecondary: '#ffffff',
		logoUrl: logo('nyj')
	},
	{
		espnId: '21',
		abbreviation: 'PHI',
		name: 'Eagles',
		city: 'Philadelphia',
		conference: 'NFC',
		division: 'NFC East',
		colorPrimary: '#004c54',
		colorSecondary: '#a5acaf',
		logoUrl: logo('phi')
	},
	{
		espnId: '23',
		abbreviation: 'PIT',
		name: 'Steelers',
		city: 'Pittsburgh',
		conference: 'AFC',
		division: 'AFC North',
		colorPrimary: '#ffb612',
		colorSecondary: '#ffb612',
		logoUrl: logo('pit')
	},
	{
		espnId: '25',
		abbreviation: 'SF',
		name: '49ers',
		city: 'San Francisco',
		conference: 'NFC',
		division: 'NFC West',
		colorPrimary: '#aa0000',
		colorSecondary: '#b3995d',
		logoUrl: logo('sf')
	},
	{
		espnId: '26',
		abbreviation: 'SEA',
		name: 'Seahawks',
		city: 'Seattle',
		conference: 'NFC',
		division: 'NFC West',
		colorPrimary: '#002244',
		colorSecondary: '#69be28',
		logoUrl: logo('sea')
	},
	{
		espnId: '27',
		abbreviation: 'TB',
		name: 'Buccaneers',
		city: 'Tampa Bay',
		conference: 'NFC',
		division: 'NFC South',
		colorPrimary: '#d50a0a',
		colorSecondary: '#d50a0a',
		logoUrl: logo('tb')
	},
	{
		espnId: '10',
		abbreviation: 'TEN',
		name: 'Titans',
		city: 'Tennessee',
		conference: 'AFC',
		division: 'AFC South',
		colorPrimary: '#0c2340',
		colorSecondary: '#4b92db',
		logoUrl: logo('ten')
	},
	{
		espnId: '28',
		abbreviation: 'WAS',
		name: 'Commanders',
		city: 'Washington',
		conference: 'NFC',
		division: 'NFC East',
		colorPrimary: '#5a1414',
		colorSecondary: '#ffb612',
		logoUrl: logo('wsh')
	}
];
