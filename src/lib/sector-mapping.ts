export interface CompanyMapping {
  ticker: string;
  name: string;
  sector: string;
  aliases: string[];
}

export const COMPANY_MAPPINGS: CompanyMapping[] = [
  // Technology
  { ticker: 'AAPL', name: 'Apple', sector: 'Technology', aliases: ['apple', 'iphone', 'ipad', 'mac'] },
  { ticker: 'MSFT', name: 'Microsoft', sector: 'Technology', aliases: ['microsoft', 'windows', 'azure'] },
  { ticker: 'GOOGL', name: 'Alphabet', sector: 'Technology', aliases: ['google', 'alphabet', 'youtube'] },
  { ticker: 'META', name: 'Meta Platforms', sector: 'Technology', aliases: ['meta', 'facebook', 'instagram', 'whatsapp'] },
  { ticker: 'ORCL', name: 'Oracle', sector: 'Technology', aliases: ['oracle'] },
  { ticker: 'IBM', name: 'IBM', sector: 'Technology', aliases: ['ibm', 'international business machines'] },
  { ticker: 'CRM', name: 'Salesforce', sector: 'Technology', aliases: ['salesforce'] },
  { ticker: 'CSCO', name: 'Cisco Systems', sector: 'Technology', aliases: ['cisco'] },
  { ticker: 'ACN', name: 'Accenture', sector: 'Technology', aliases: ['accenture'] },
  { ticker: 'ADBE', name: 'Adobe', sector: 'Technology', aliases: ['adobe', 'photoshop'] },
  { ticker: 'NOW', name: 'ServiceNow', sector: 'Technology', aliases: ['servicenow'] },
  { ticker: 'INTU', name: 'Intuit', sector: 'Technology', aliases: ['intuit', 'turbotax', 'quickbooks'] },
  { ticker: 'PLTR', name: 'Palantir', sector: 'Technology', aliases: ['palantir'] },
  { ticker: 'MSTR', name: 'MicroStrategy', sector: 'Technology', aliases: ['microstrategy', 'micro strategy'] },
  { ticker: 'PANW', name: 'Palo Alto Networks', sector: 'Technology', aliases: ['palo alto'] },
  { ticker: 'FTNT', name: 'Fortinet', sector: 'Technology', aliases: ['fortinet'] },
  { ticker: 'SNPS', name: 'Synopsys', sector: 'Technology', aliases: ['synopsys'] },
  { ticker: 'CDNS', name: 'Cadence Design Systems', sector: 'Technology', aliases: ['cadence'] },
  { ticker: 'HPQ', name: 'HP Inc.', sector: 'Technology', aliases: ['hp', 'hewlett packard'] },
  { ticker: 'HPE', name: 'Hewlett Packard Enterprise', sector: 'Technology', aliases: ['hpe'] },
  { ticker: 'DELL', name: 'Dell Technologies', sector: 'Technology', aliases: ['dell'] },
  { ticker: 'WDC', name: 'Western Digital', sector: 'Technology', aliases: ['western digital'] },
  { ticker: 'STX', name: 'Seagate Technology', sector: 'Technology', aliases: ['seagate'] },
  { ticker: 'NTAP', name: 'NetApp', sector: 'Technology', aliases: ['netapp'] },
  { ticker: 'CTSH', name: 'Cognizant', sector: 'Technology', aliases: ['cognizant'] },
  { ticker: 'IT', name: 'Gartner', sector: 'Technology', aliases: ['gartner'] },
  { ticker: 'EPAM', name: 'EPAM Systems', sector: 'Technology', aliases: ['epam'] },
  { ticker: 'GDDY', name: 'GoDaddy', sector: 'Technology', aliases: ['godaddy'] },
  { ticker: 'GEN', name: 'Gen Digital', sector: 'Technology', aliases: ['gen digital', 'norton', 'lifelock'] },
  { ticker: 'JNPR', name: 'Juniper Networks', sector: 'Technology', aliases: ['juniper'] },
  { ticker: 'RBLX', name: 'Roblox', sector: 'Technology', aliases: ['roblox'] },
  { ticker: 'RDDT', name: 'Reddit', sector: 'Technology', aliases: ['reddit'] },
  { ticker: 'JBL', name: 'Jabil', sector: 'Technology', aliases: ['jabil'] },
  { ticker: 'FDS', name: 'FactSet Research Systems', sector: 'Technology', aliases: ['factset'] },
  { ticker: 'PRGS', name: 'Progress Software', sector: 'Technology', aliases: ['progress software'] },
  { ticker: 'CNXC', name: 'Concentrix', sector: 'Technology', aliases: ['concentrix'] },
  { ticker: 'MLKN', name: 'MillerKnoll', sector: 'Technology', aliases: ['millerknoll', 'herman miller'] },
  { ticker: 'NET', name: 'Cloudflare', sector: 'Technology', aliases: ['cloudflare'] },
  { ticker: 'DDOG', name: 'Datadog', sector: 'Technology', aliases: ['datadog'] },
  { ticker: 'PINS', name: 'Pinterest', sector: 'Technology', aliases: ['pinterest'] },
  { ticker: 'DKNG', name: 'DraftKings', sector: 'Technology', aliases: ['draftkings'] },
  { ticker: 'PTON', name: 'Peloton Interactive', sector: 'Technology', aliases: ['peloton'] },
  { ticker: 'TOST', name: 'Toast', sector: 'Technology', aliases: ['toast'] },
  { ticker: 'GRAB', name: 'Grab Holdings', sector: 'Technology', aliases: ['grab'] },
  { ticker: 'CHGG', name: 'Chegg', sector: 'Technology', aliases: ['chegg'] },
  { ticker: 'ZI', name: 'ZoomInfo Technologies', sector: 'Technology', aliases: ['zoominfo'] },
  { ticker: 'APP', name: 'AppLovin', sector: 'Technology', aliases: ['applovin'] },
  { ticker: 'HUBS', name: 'HubSpot', sector: 'Technology', aliases: ['hubspot'] },
  { ticker: 'YELP', name: 'Yelp', sector: 'Technology', aliases: ['yelp'] },
  { ticker: 'WAY', name: 'Waystar', sector: 'Technology', aliases: ['waystar'] },
  { ticker: 'AMPL', name: 'Amplitude', sector: 'Technology', aliases: ['amplitude'] },
  { ticker: 'DASH', name: 'DoorDash', sector: 'Technology', aliases: ['doordash'] },

  // Semiconductors
  { ticker: 'NVDA', name: 'NVIDIA', sector: 'Semiconductors', aliases: ['nvidia', 'geforce', 'rtx'] },
  { ticker: 'AMD', name: 'AMD', sector: 'Semiconductors', aliases: ['amd', 'radeon', 'ryzen'] },
  { ticker: 'INTC', name: 'Intel', sector: 'Semiconductors', aliases: ['intel'] },
  { ticker: 'AVGO', name: 'Broadcom', sector: 'Semiconductors', aliases: ['broadcom'] },
  { ticker: 'QCOM', name: 'Qualcomm', sector: 'Semiconductors', aliases: ['qualcomm', 'snapdragon'] },
  { ticker: 'TXN', name: 'Texas Instruments', sector: 'Semiconductors', aliases: ['texas instruments', 'ti'] },
  { ticker: 'MU', name: 'Micron Technology', sector: 'Semiconductors', aliases: ['micron'] },
  { ticker: 'ADI', name: 'Analog Devices', sector: 'Semiconductors', aliases: ['analog devices'] },
  { ticker: 'AMAT', name: 'Applied Materials', sector: 'Semiconductors', aliases: ['applied materials'] },
  { ticker: 'LRCX', name: 'Lam Research', sector: 'Semiconductors', aliases: ['lam research'] },
  { ticker: 'KLAC', name: 'KLA Corporation', sector: 'Semiconductors', aliases: ['kla'] },
  { ticker: 'MCHP', name: 'Microchip Technology', sector: 'Semiconductors', aliases: ['microchip'] },
  { ticker: 'NXPI', name: 'NXP Semiconductors', sector: 'Semiconductors', aliases: ['nxp'] },
  { ticker: 'ON', name: 'ON Semiconductor', sector: 'Semiconductors', aliases: ['on semi', 'onsemi'] },
  { ticker: 'MRVL', name: 'Marvell Technology', sector: 'Semiconductors', aliases: ['marvell'] },
  { ticker: 'SWKS', name: 'Skyworks Solutions', sector: 'Semiconductors', aliases: ['skyworks'] },
  { ticker: 'QRVO', name: 'Qorvo', sector: 'Semiconductors', aliases: ['qorvo'] },
  { ticker: 'ARM', name: 'ARM Holdings', sector: 'Semiconductors', aliases: ['arm'] },
  { ticker: 'TSEM', name: 'Tower Semiconductor', sector: 'Semiconductors', aliases: ['tower semiconductor'] },

  // E-commerce & Internet
  { ticker: 'AMZN', name: 'Amazon', sector: 'E-commerce', aliases: ['amazon', 'aws', 'prime'] },
  { ticker: 'EBAY', name: 'eBay', sector: 'E-commerce', aliases: ['ebay'] },
  { ticker: 'ETSY', name: 'Etsy', sector: 'E-commerce', aliases: ['etsy'] },
  { ticker: 'CHWY', name: 'Chewy', sector: 'E-commerce', aliases: ['chewy'] },
  { ticker: 'W', name: 'Wayfair', sector: 'E-commerce', aliases: ['wayfair'] },

  // Streaming & Entertainment
  { ticker: 'NFLX', name: 'Netflix', sector: 'Streaming', aliases: ['netflix'] },
  { ticker: 'DIS', name: 'Disney', sector: 'Streaming', aliases: ['disney', 'disney+', 'hulu', 'espn'] },
  { ticker: 'WBD', name: 'Warner Bros. Discovery', sector: 'Streaming', aliases: ['warner', 'hbo', 'max'] },
  { ticker: 'PARA', name: 'Paramount Global', sector: 'Streaming', aliases: ['paramount', 'cbs'] },
  { ticker: 'CMCSA', name: 'Comcast', sector: 'Streaming', aliases: ['comcast', 'nbc', 'peacock', 'xfinity'] },
  { ticker: 'SPOT', name: 'Spotify', sector: 'Streaming', aliases: ['spotify'] },
  { ticker: 'ROKU', name: 'Roku', sector: 'Streaming', aliases: ['roku'] },
  { ticker: 'LYV', name: 'Live Nation Entertainment', sector: 'Streaming', aliases: ['live nation', 'ticketmaster'] },
  { ticker: 'FOXA', name: 'Fox Corporation', sector: 'Streaming', aliases: ['fox', 'fox news'] },
  { ticker: 'DJT', name: 'Trump Media & Technology', sector: 'Streaming', aliases: ['trump media', 'truth social'] },
  { ticker: 'NWSA', name: 'News Corp', sector: 'Streaming', aliases: ['news corp', 'wall street journal', 'wsj'] },

  // Finance - Banks
  { ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Finance', aliases: ['jpmorgan', 'jp morgan', 'chase'] },
  { ticker: 'BAC', name: 'Bank of America', sector: 'Finance', aliases: ['bank of america', 'bofa'] },
  { ticker: 'WFC', name: 'Wells Fargo', sector: 'Finance', aliases: ['wells fargo'] },
  { ticker: 'C', name: 'Citigroup', sector: 'Finance', aliases: ['citigroup', 'citi'] },
  { ticker: 'GS', name: 'Goldman Sachs', sector: 'Finance', aliases: ['goldman', 'goldman sachs'] },
  { ticker: 'MS', name: 'Morgan Stanley', sector: 'Finance', aliases: ['morgan stanley'] },
  { ticker: 'USB', name: 'U.S. Bancorp', sector: 'Finance', aliases: ['us bancorp', 'us bank'] },
  { ticker: 'PNC', name: 'PNC Financial Services', sector: 'Finance', aliases: ['pnc'] },
  { ticker: 'TFC', name: 'Truist Financial', sector: 'Finance', aliases: ['truist'] },
  { ticker: 'COF', name: 'Capital One', sector: 'Finance', aliases: ['capital one'] },
  { ticker: 'BK', name: 'Bank of New York Mellon', sector: 'Finance', aliases: ['bny mellon', 'bank of new york'] },
  { ticker: 'STT', name: 'State Street', sector: 'Finance', aliases: ['state street'] },
  { ticker: 'SCHW', name: 'Charles Schwab', sector: 'Finance', aliases: ['schwab', 'charles schwab'] },
  { ticker: 'BLK', name: 'BlackRock', sector: 'Finance', aliases: ['blackrock'] },
  { ticker: 'SPGI', name: 'S&P Global', sector: 'Finance', aliases: ['s&p global', 's&p'] },
  { ticker: 'MCO', name: 'Moody\'s', sector: 'Finance', aliases: ['moodys', 'moody'] },
  { ticker: 'ICE', name: 'Intercontinental Exchange', sector: 'Finance', aliases: ['ice', 'nyse'] },
  { ticker: 'CME', name: 'CME Group', sector: 'Finance', aliases: ['cme', 'chicago mercantile'] },
  { ticker: 'NDAQ', name: 'Nasdaq', sector: 'Finance', aliases: ['nasdaq'] },
  { ticker: 'V', name: 'Visa', sector: 'Finance', aliases: ['visa'] },
  { ticker: 'MA', name: 'Mastercard', sector: 'Finance', aliases: ['mastercard'] },
  { ticker: 'AXP', name: 'American Express', sector: 'Finance', aliases: ['american express', 'amex'] },
  { ticker: 'DFS', name: 'Discover Financial', sector: 'Finance', aliases: ['discover'] },
  { ticker: 'CBOE', name: 'Cboe Global Markets', sector: 'Finance', aliases: ['cboe', 'chicago board options'] },
  { ticker: 'TW', name: 'Tradeweb Markets', sector: 'Finance', aliases: ['tradeweb'] },
  { ticker: 'ARES', name: 'Ares Management', sector: 'Finance', aliases: ['ares'] },
  { ticker: 'APO', name: 'Apollo Global Management', sector: 'Finance', aliases: ['apollo'] },
  { ticker: 'TPG', name: 'TPG Inc', sector: 'Finance', aliases: ['tpg', 'texas pacific'] },
  { ticker: 'JEF', name: 'Jefferies Financial Group', sector: 'Finance', aliases: ['jefferies'] },
  { ticker: 'CASH', name: 'Pathward Financial', sector: 'Finance', aliases: ['pathward', 'meta financial'] },
  { ticker: 'KKR', name: 'KKR & Co', sector: 'Finance', aliases: ['kkr', 'kohlberg kravis'] },
  { ticker: 'BGC', name: 'BGC Group', sector: 'Finance', aliases: ['bgc'] },

  // Fintech
  { ticker: 'PYPL', name: 'PayPal', sector: 'Fintech', aliases: ['paypal'] },
  { ticker: 'SQ', name: 'Block', sector: 'Fintech', aliases: ['block', 'square', 'cash app'] },
  { ticker: 'FIS', name: 'Fidelity National', sector: 'Fintech', aliases: ['fis', 'fidelity national'] },
  { ticker: 'FI', name: 'Fiserv', sector: 'Fintech', aliases: ['fiserv'] },
  { ticker: 'GPN', name: 'Global Payments', sector: 'Fintech', aliases: ['global payments'] },
  { ticker: 'COIN', name: 'Coinbase', sector: 'Fintech', aliases: ['coinbase'] },
  { ticker: 'AFRM', name: 'Affirm', sector: 'Fintech', aliases: ['affirm'] },
  { ticker: 'SOFI', name: 'SoFi Technologies', sector: 'Fintech', aliases: ['sofi'] },
  { ticker: 'HOOD', name: 'Robinhood Markets', sector: 'Fintech', aliases: ['robinhood'] },

  // Insurance
  { ticker: 'BRK.B', name: 'Berkshire Hathaway', sector: 'Insurance', aliases: ['berkshire', 'warren buffett'] },
  { ticker: 'PRU', name: 'Prudential Financial', sector: 'Insurance', aliases: ['prudential'] },
  { ticker: 'MET', name: 'MetLife', sector: 'Insurance', aliases: ['metlife'] },
  { ticker: 'AIG', name: 'American International Group', sector: 'Insurance', aliases: ['aig'] },
  { ticker: 'AFL', name: 'Aflac', sector: 'Insurance', aliases: ['aflac'] },
  { ticker: 'TRV', name: 'The Travelers Companies', sector: 'Insurance', aliases: ['travelers'] },
  { ticker: 'ALL', name: 'Allstate', sector: 'Insurance', aliases: ['allstate'] },
  { ticker: 'PGR', name: 'Progressive', sector: 'Insurance', aliases: ['progressive'] },
  { ticker: 'CB', name: 'Chubb', sector: 'Insurance', aliases: ['chubb'] },
  { ticker: 'MMC', name: 'Marsh McLennan', sector: 'Insurance', aliases: ['marsh', 'marsh mclennan'] },
  { ticker: 'AON', name: 'Aon', sector: 'Insurance', aliases: ['aon'] },
  { ticker: 'AJG', name: 'Arthur J. Gallagher', sector: 'Insurance', aliases: ['gallagher'] },
  { ticker: 'CINF', name: 'Cincinnati Financial', sector: 'Insurance', aliases: ['cincinnati financial'] },
  { ticker: 'HIG', name: 'Hartford Financial', sector: 'Insurance', aliases: ['hartford'] },
  { ticker: 'LNC', name: 'Lincoln National', sector: 'Insurance', aliases: ['lincoln national'] },

  // Healthcare - Pharma
  { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', aliases: ['johnson', 'j&j'] },
  { ticker: 'PFE', name: 'Pfizer', sector: 'Healthcare', aliases: ['pfizer'] },
  { ticker: 'MRK', name: 'Merck', sector: 'Healthcare', aliases: ['merck'] },
  { ticker: 'ABBV', name: 'AbbVie', sector: 'Healthcare', aliases: ['abbvie'] },
  { ticker: 'LLY', name: 'Eli Lilly', sector: 'Healthcare', aliases: ['eli lilly', 'lilly'] },
  { ticker: 'BMY', name: 'Bristol-Myers Squibb', sector: 'Healthcare', aliases: ['bristol myers', 'bms'] },
  { ticker: 'AMGN', name: 'Amgen', sector: 'Healthcare', aliases: ['amgen'] },
  { ticker: 'GILD', name: 'Gilead Sciences', sector: 'Healthcare', aliases: ['gilead'] },
  { ticker: 'REGN', name: 'Regeneron', sector: 'Healthcare', aliases: ['regeneron'] },
  { ticker: 'VRTX', name: 'Vertex Pharmaceuticals', sector: 'Healthcare', aliases: ['vertex'] },
  { ticker: 'BIIB', name: 'Biogen', sector: 'Healthcare', aliases: ['biogen'] },
  { ticker: 'MRNA', name: 'Moderna', sector: 'Healthcare', aliases: ['moderna'] },
  { ticker: 'ZTS', name: 'Zoetis', sector: 'Healthcare', aliases: ['zoetis'] },
  { ticker: 'CRSP', name: 'CRISPR Therapeutics', sector: 'Healthcare', aliases: ['crispr'] },

  // Healthcare - Insurance & Services
  { ticker: 'UNH', name: 'UnitedHealth', sector: 'Healthcare', aliases: ['unitedhealth', 'united health', 'optum'] },
  { ticker: 'CVS', name: 'CVS Health', sector: 'Healthcare', aliases: ['cvs', 'aetna'] },
  { ticker: 'CI', name: 'Cigna', sector: 'Healthcare', aliases: ['cigna'] },
  { ticker: 'ELV', name: 'Elevance Health', sector: 'Healthcare', aliases: ['elevance', 'anthem'] },
  { ticker: 'HUM', name: 'Humana', sector: 'Healthcare', aliases: ['humana'] },
  { ticker: 'CNC', name: 'Centene', sector: 'Healthcare', aliases: ['centene'] },
  { ticker: 'HCA', name: 'HCA Healthcare', sector: 'Healthcare', aliases: ['hca'] },
  { ticker: 'MCK', name: 'McKesson', sector: 'Healthcare', aliases: ['mckesson'] },
  { ticker: 'ABC', name: 'AmerisourceBergen', sector: 'Healthcare', aliases: ['amerisourcebergen'] },
  { ticker: 'CAH', name: 'Cardinal Health', sector: 'Healthcare', aliases: ['cardinal health'] },

  // Healthcare - Medical Devices
  { ticker: 'ABT', name: 'Abbott Laboratories', sector: 'Healthcare', aliases: ['abbott'] },
  { ticker: 'TMO', name: 'Thermo Fisher Scientific', sector: 'Healthcare', aliases: ['thermo fisher'] },
  { ticker: 'DHR', name: 'Danaher', sector: 'Healthcare', aliases: ['danaher'] },
  { ticker: 'MDT', name: 'Medtronic', sector: 'Healthcare', aliases: ['medtronic'] },
  { ticker: 'ISRG', name: 'Intuitive Surgical', sector: 'Healthcare', aliases: ['intuitive surgical', 'da vinci'] },
  { ticker: 'SYK', name: 'Stryker', sector: 'Healthcare', aliases: ['stryker'] },
  { ticker: 'BSX', name: 'Boston Scientific', sector: 'Healthcare', aliases: ['boston scientific'] },
  { ticker: 'EW', name: 'Edwards Lifesciences', sector: 'Healthcare', aliases: ['edwards'] },
  { ticker: 'BDX', name: 'Becton Dickinson', sector: 'Healthcare', aliases: ['becton dickinson', 'bd'] },
  { ticker: 'A', name: 'Agilent Technologies', sector: 'Healthcare', aliases: ['agilent'] },
  { ticker: 'IQV', name: 'IQVIA', sector: 'Healthcare', aliases: ['iqvia'] },
  { ticker: 'LH', name: 'Labcorp', sector: 'Healthcare', aliases: ['labcorp', 'laboratory corporation'] },
  { ticker: 'IDXX', name: 'IDEXX Laboratories', sector: 'Healthcare', aliases: ['idexx'] },
  { ticker: 'DXCM', name: 'DexCom', sector: 'Healthcare', aliases: ['dexcom'] },
  { ticker: 'WAT', name: 'Waters Corporation', sector: 'Healthcare', aliases: ['waters'] },
  { ticker: 'MTD', name: 'Mettler-Toledo', sector: 'Healthcare', aliases: ['mettler toledo'] },

  // Energy - Oil & Gas
  { ticker: 'XOM', name: 'ExxonMobil', sector: 'Energy', aliases: ['exxon', 'exxonmobil'] },
  { ticker: 'CVX', name: 'Chevron', sector: 'Energy', aliases: ['chevron'] },
  { ticker: 'COP', name: 'ConocoPhillips', sector: 'Energy', aliases: ['conocophillips', 'conoco'] },
  { ticker: 'OXY', name: 'Occidental Petroleum', sector: 'Energy', aliases: ['occidental', 'oxy'] },
  { ticker: 'EOG', name: 'EOG Resources', sector: 'Energy', aliases: ['eog'] },
  { ticker: 'SLB', name: 'Schlumberger', sector: 'Energy', aliases: ['schlumberger'] },
  { ticker: 'MPC', name: 'Marathon Petroleum', sector: 'Energy', aliases: ['marathon petroleum'] },
  { ticker: 'VLO', name: 'Valero Energy', sector: 'Energy', aliases: ['valero'] },
  { ticker: 'PSX', name: 'Phillips 66', sector: 'Energy', aliases: ['phillips 66'] },
  { ticker: 'HES', name: 'Hess Corporation', sector: 'Energy', aliases: ['hess'] },
  { ticker: 'DVN', name: 'Devon Energy', sector: 'Energy', aliases: ['devon'] },
  { ticker: 'HAL', name: 'Halliburton', sector: 'Energy', aliases: ['halliburton'] },
  { ticker: 'BKR', name: 'Baker Hughes', sector: 'Energy', aliases: ['baker hughes'] },
  { ticker: 'FANG', name: 'Diamondback Energy', sector: 'Energy', aliases: ['diamondback'] },
  { ticker: 'PXD', name: 'Pioneer Natural Resources', sector: 'Energy', aliases: ['pioneer'] },
  { ticker: 'BP', name: 'BP', sector: 'Energy', aliases: ['bp', 'british petroleum'] },
  { ticker: 'WMB', name: 'Williams Companies', sector: 'Energy', aliases: ['williams'] },
  { ticker: 'SUN', name: 'Sunoco', sector: 'Energy', aliases: ['sunoco'] },

  // Utilities
  { ticker: 'NEE', name: 'NextEra Energy', sector: 'Utilities', aliases: ['nextera'] },
  { ticker: 'DUK', name: 'Duke Energy', sector: 'Utilities', aliases: ['duke energy'] },
  { ticker: 'SO', name: 'Southern Company', sector: 'Utilities', aliases: ['southern company'] },
  { ticker: 'D', name: 'Dominion Energy', sector: 'Utilities', aliases: ['dominion'] },
  { ticker: 'AEP', name: 'American Electric Power', sector: 'Utilities', aliases: ['aep'] },
  { ticker: 'SRE', name: 'Sempra', sector: 'Utilities', aliases: ['sempra'] },
  { ticker: 'XEL', name: 'Xcel Energy', sector: 'Utilities', aliases: ['xcel'] },
  { ticker: 'EXC', name: 'Exelon', sector: 'Utilities', aliases: ['exelon'] },
  { ticker: 'PCG', name: 'PG&E', sector: 'Utilities', aliases: ['pge', 'pacific gas'] },
  { ticker: 'WEC', name: 'WEC Energy Group', sector: 'Utilities', aliases: ['wec'] },
  { ticker: 'ED', name: 'Consolidated Edison', sector: 'Utilities', aliases: ['con edison', 'coned'] },
  { ticker: 'CEG', name: 'Constellation Energy', sector: 'Utilities', aliases: ['constellation'] },
  { ticker: 'AWK', name: 'American Water Works', sector: 'Utilities', aliases: ['american water'] },

  // Consumer - Retail
  { ticker: 'WMT', name: 'Walmart', sector: 'Retail', aliases: ['walmart', 'wal-mart'] },
  { ticker: 'COST', name: 'Costco', sector: 'Retail', aliases: ['costco'] },
  { ticker: 'TGT', name: 'Target', sector: 'Retail', aliases: ['target'] },
  { ticker: 'HD', name: 'Home Depot', sector: 'Retail', aliases: ['home depot'] },
  { ticker: 'LOW', name: 'Lowe\'s', sector: 'Retail', aliases: ['lowes', 'lowe\'s'] },
  { ticker: 'DG', name: 'Dollar General', sector: 'Retail', aliases: ['dollar general'] },
  { ticker: 'DLTR', name: 'Dollar Tree', sector: 'Retail', aliases: ['dollar tree'] },
  { ticker: 'BBY', name: 'Best Buy', sector: 'Retail', aliases: ['best buy'] },
  { ticker: 'TSCO', name: 'Tractor Supply', sector: 'Retail', aliases: ['tractor supply'] },
  { ticker: 'KR', name: 'Kroger', sector: 'Retail', aliases: ['kroger'] },
  { ticker: 'SYY', name: 'Sysco', sector: 'Retail', aliases: ['sysco'] },
  { ticker: 'USFD', name: 'US Foods', sector: 'Retail', aliases: ['us foods'] },
  { ticker: 'TJX', name: 'TJX Companies', sector: 'Retail', aliases: ['tjx', 'tj maxx', 'marshalls'] },
  { ticker: 'ROST', name: 'Ross Stores', sector: 'Retail', aliases: ['ross'] },
  { ticker: 'AZO', name: 'AutoZone', sector: 'Retail', aliases: ['autozone'] },
  { ticker: 'ORLY', name: 'O\'Reilly Automotive', sector: 'Retail', aliases: ['oreilly', 'o\'reilly'] },
  { ticker: 'AAP', name: 'Advance Auto Parts', sector: 'Retail', aliases: ['advance auto'] },
  { ticker: 'KMX', name: 'CarMax', sector: 'Retail', aliases: ['carmax'] },
  { ticker: 'CVNA', name: 'Carvana', sector: 'Retail', aliases: ['carvana'] },
  { ticker: 'LZB', name: 'La-Z-Boy', sector: 'Retail', aliases: ['la-z-boy', 'lazboy'] },
  { ticker: 'ULTA', name: 'Ulta Beauty', sector: 'Retail', aliases: ['ulta'] },
  { ticker: 'GME', name: 'GameStop', sector: 'Retail', aliases: ['gamestop', 'game stop'] },

  // Consumer - Food & Beverage
  { ticker: 'KO', name: 'Coca-Cola', sector: 'Consumer', aliases: ['coca-cola', 'coca cola', 'coke'] },
  { ticker: 'PEP', name: 'PepsiCo', sector: 'Consumer', aliases: ['pepsi', 'pepsico', 'frito lay'] },
  { ticker: 'MDLZ', name: 'Mondelez', sector: 'Consumer', aliases: ['mondelez', 'oreo', 'cadbury'] },
  { ticker: 'KHC', name: 'Kraft Heinz', sector: 'Consumer', aliases: ['kraft', 'heinz'] },
  { ticker: 'GIS', name: 'General Mills', sector: 'Consumer', aliases: ['general mills', 'cheerios'] },
  { ticker: 'K', name: 'Kellanova', sector: 'Consumer', aliases: ['kellanova', 'kellogg'] },
  { ticker: 'HSY', name: 'Hershey', sector: 'Consumer', aliases: ['hershey'] },
  { ticker: 'CPB', name: 'Campbell Soup', sector: 'Consumer', aliases: ['campbell', 'campbells'] },
  { ticker: 'SJM', name: 'J.M. Smucker', sector: 'Consumer', aliases: ['smucker', 'jif'] },
  { ticker: 'CAG', name: 'Conagra Brands', sector: 'Consumer', aliases: ['conagra'] },
  { ticker: 'MKC', name: 'McCormick', sector: 'Consumer', aliases: ['mccormick'] },
  { ticker: 'TSN', name: 'Tyson Foods', sector: 'Consumer', aliases: ['tyson'] },
  { ticker: 'HRL', name: 'Hormel Foods', sector: 'Consumer', aliases: ['hormel', 'spam'] },
  { ticker: 'ADM', name: 'Archer-Daniels-Midland', sector: 'Consumer', aliases: ['adm', 'archer daniels'] },
  { ticker: 'BG', name: 'Bunge', sector: 'Consumer', aliases: ['bunge'] },
  { ticker: 'BUD', name: 'Anheuser-Busch InBev', sector: 'Consumer', aliases: ['anheuser', 'budweiser', 'bud light'] },

  // Consumer - Restaurants & Food Service
  { ticker: 'MCD', name: 'McDonald\'s', sector: 'Consumer', aliases: ['mcdonald', 'mcdonalds'] },
  { ticker: 'SBUX', name: 'Starbucks', sector: 'Consumer', aliases: ['starbucks'] },
  { ticker: 'YUM', name: 'Yum! Brands', sector: 'Consumer', aliases: ['yum', 'taco bell', 'kfc', 'pizza hut'] },
  { ticker: 'CMG', name: 'Chipotle', sector: 'Consumer', aliases: ['chipotle'] },
  { ticker: 'DPZ', name: 'Domino\'s Pizza', sector: 'Consumer', aliases: ['dominos', 'domino\'s'] },
  { ticker: 'QSR', name: 'Restaurant Brands', sector: 'Consumer', aliases: ['burger king', 'tim hortons', 'popeyes'] },
  { ticker: 'DRI', name: 'Darden Restaurants', sector: 'Consumer', aliases: ['darden', 'olive garden'] },
  { ticker: 'WEN', name: "Wendy's", sector: 'Consumer', aliases: ['wendys', "wendy's"] },
  { ticker: 'WING', name: 'Wingstop', sector: 'Consumer', aliases: ['wingstop'] },

  // Consumer - Household & Personal Care
  { ticker: 'PG', name: 'Procter & Gamble', sector: 'Consumer', aliases: ['procter', 'p&g', 'tide', 'gillette'] },
  { ticker: 'CL', name: 'Colgate-Palmolive', sector: 'Consumer', aliases: ['colgate', 'palmolive'] },
  { ticker: 'KMB', name: 'Kimberly-Clark', sector: 'Consumer', aliases: ['kimberly clark', 'kleenex', 'huggies'] },
  { ticker: 'CHD', name: 'Church & Dwight', sector: 'Consumer', aliases: ['church dwight', 'arm hammer'] },
  { ticker: 'CLX', name: 'Clorox', sector: 'Consumer', aliases: ['clorox'] },
  { ticker: 'EL', name: 'Estee Lauder', sector: 'Consumer', aliases: ['estee lauder'] },

  // Consumer - Apparel & Footwear
  { ticker: 'NKE', name: 'Nike', sector: 'Consumer', aliases: ['nike', 'jordan'] },
  { ticker: 'LULU', name: 'Lululemon', sector: 'Consumer', aliases: ['lululemon'] },
  { ticker: 'VFC', name: 'VF Corporation', sector: 'Consumer', aliases: ['vf', 'north face', 'vans'] },
  { ticker: 'PVH', name: 'PVH Corp', sector: 'Consumer', aliases: ['pvh', 'calvin klein', 'tommy hilfiger'] },
  { ticker: 'RL', name: 'Ralph Lauren', sector: 'Consumer', aliases: ['ralph lauren', 'polo'] },
  { ticker: 'TPR', name: 'Tapestry', sector: 'Consumer', aliases: ['tapestry', 'coach', 'kate spade'] },
  { ticker: 'DECK', name: 'Deckers Outdoor', sector: 'Consumer', aliases: ['deckers', 'ugg', 'hoka'] },
  { ticker: 'UAA', name: 'Under Armour', sector: 'Consumer', aliases: ['under armour'] },

  // Automotive
  { ticker: 'TSLA', name: 'Tesla', sector: 'Automotive', aliases: ['tesla', 'elon musk'] },
  { ticker: 'GM', name: 'General Motors', sector: 'Automotive', aliases: ['general motors', 'gm', 'chevrolet', 'chevy'] },
  { ticker: 'F', name: 'Ford', sector: 'Automotive', aliases: ['ford', 'mustang', 'f-150'] },
  { ticker: 'RIVN', name: 'Rivian', sector: 'Automotive', aliases: ['rivian'] },
  { ticker: 'LCID', name: 'Lucid Group', sector: 'Automotive', aliases: ['lucid'] },
  { ticker: 'APTV', name: 'Aptiv', sector: 'Automotive', aliases: ['aptiv', 'delphi'] },
  { ticker: 'BWA', name: 'BorgWarner', sector: 'Automotive', aliases: ['borgwarner'] },
  { ticker: 'LEA', name: 'Lear Corporation', sector: 'Automotive', aliases: ['lear'] },
  { ticker: 'HOG', name: 'Harley-Davidson', sector: 'Automotive', aliases: ['harley', 'harley davidson'] },
  { ticker: 'PAG', name: 'Penske Automotive Group', sector: 'Automotive', aliases: ['penske'] },
  { ticker: 'GT', name: 'Goodyear Tire & Rubber', sector: 'Automotive', aliases: ['goodyear'] },

  // Aerospace & Defense
  { ticker: 'BA', name: 'Boeing', sector: 'Aerospace', aliases: ['boeing'] },
  { ticker: 'LMT', name: 'Lockheed Martin', sector: 'Aerospace', aliases: ['lockheed', 'lockheed martin'] },
  { ticker: 'RTX', name: 'RTX Corporation', sector: 'Aerospace', aliases: ['raytheon', 'rtx', 'pratt whitney'] },
  { ticker: 'NOC', name: 'Northrop Grumman', sector: 'Aerospace', aliases: ['northrop', 'northrop grumman'] },
  { ticker: 'GD', name: 'General Dynamics', sector: 'Aerospace', aliases: ['general dynamics', 'gulfstream'] },
  { ticker: 'LHX', name: 'L3Harris Technologies', sector: 'Aerospace', aliases: ['l3harris', 'harris'] },
  { ticker: 'TDG', name: 'TransDigm', sector: 'Aerospace', aliases: ['transdigm'] },
  { ticker: 'HWM', name: 'Howmet Aerospace', sector: 'Aerospace', aliases: ['howmet'] },
  { ticker: 'TXT', name: 'Textron', sector: 'Aerospace', aliases: ['textron', 'bell', 'cessna'] },
  { ticker: 'HII', name: 'Huntington Ingalls', sector: 'Aerospace', aliases: ['huntington ingalls'] },

  // Airlines
  { ticker: 'DAL', name: 'Delta Air Lines', sector: 'Airlines', aliases: ['delta', 'delta air'] },
  { ticker: 'UAL', name: 'United Airlines', sector: 'Airlines', aliases: ['united airlines'] },
  { ticker: 'AAL', name: 'American Airlines', sector: 'Airlines', aliases: ['american airlines'] },
  { ticker: 'LUV', name: 'Southwest Airlines', sector: 'Airlines', aliases: ['southwest', 'southwest airlines'] },
  { ticker: 'ALK', name: 'Alaska Air Group', sector: 'Airlines', aliases: ['alaska airlines'] },
  { ticker: 'JBLU', name: 'JetBlue Airways', sector: 'Airlines', aliases: ['jetblue'] },

  // Transportation & Logistics
  { ticker: 'UPS', name: 'United Parcel Service', sector: 'Transportation', aliases: ['ups'] },
  { ticker: 'FDX', name: 'FedEx', sector: 'Transportation', aliases: ['fedex'] },
  { ticker: 'UNP', name: 'Union Pacific', sector: 'Transportation', aliases: ['union pacific'] },
  { ticker: 'CSX', name: 'CSX Corporation', sector: 'Transportation', aliases: ['csx'] },
  { ticker: 'NSC', name: 'Norfolk Southern', sector: 'Transportation', aliases: ['norfolk southern'] },
  { ticker: 'UBER', name: 'Uber', sector: 'Transportation', aliases: ['uber', 'uber eats'] },
  { ticker: 'LYFT', name: 'Lyft', sector: 'Transportation', aliases: ['lyft'] },
  { ticker: 'EXPD', name: 'Expeditors International', sector: 'Transportation', aliases: ['expeditors'] },
  { ticker: 'CHRW', name: 'C.H. Robinson', sector: 'Transportation', aliases: ['ch robinson'] },
  { ticker: 'J', name: 'Jacobs Solutions', sector: 'Transportation', aliases: ['jacobs'] },

  // Telecom
  { ticker: 'T', name: 'AT&T', sector: 'Telecom', aliases: ['at&t', 'att'] },
  { ticker: 'VZ', name: 'Verizon', sector: 'Telecom', aliases: ['verizon'] },
  { ticker: 'TMUS', name: 'T-Mobile', sector: 'Telecom', aliases: ['t-mobile', 'tmobile'] },
  { ticker: 'CHTR', name: 'Charter Communications', sector: 'Telecom', aliases: ['charter', 'spectrum'] },

  // Travel & Hospitality
  { ticker: 'ABNB', name: 'Airbnb', sector: 'Travel', aliases: ['airbnb'] },
  { ticker: 'BKNG', name: 'Booking Holdings', sector: 'Travel', aliases: ['booking', 'priceline', 'kayak'] },
  { ticker: 'EXPE', name: 'Expedia', sector: 'Travel', aliases: ['expedia', 'vrbo', 'hotels.com'] },
  { ticker: 'MAR', name: 'Marriott International', sector: 'Travel', aliases: ['marriott'] },
  { ticker: 'HLT', name: 'Hilton', sector: 'Travel', aliases: ['hilton'] },
  { ticker: 'H', name: 'Hyatt Hotels', sector: 'Travel', aliases: ['hyatt'] },
  { ticker: 'WH', name: 'Wyndham Hotels', sector: 'Travel', aliases: ['wyndham'] },
  { ticker: 'CCL', name: 'Carnival', sector: 'Travel', aliases: ['carnival'] },
  { ticker: 'RCL', name: 'Royal Caribbean', sector: 'Travel', aliases: ['royal caribbean'] },
  { ticker: 'NCLH', name: 'Norwegian Cruise Line', sector: 'Travel', aliases: ['norwegian cruise'] },
  { ticker: 'MGM', name: 'MGM Resorts International', sector: 'Travel', aliases: ['mgm', 'mgm resorts'] },
  { ticker: 'WYNN', name: 'Wynn Resorts', sector: 'Travel', aliases: ['wynn'] },
  { ticker: 'TRIP', name: 'TripAdvisor', sector: 'Travel', aliases: ['tripadvisor'] },
  { ticker: 'CZR', name: 'Caesars Entertainment', sector: 'Travel', aliases: ['caesars'] },

  // Real Estate
  { ticker: 'AMT', name: 'American Tower', sector: 'Real Estate', aliases: ['american tower'] },
  { ticker: 'PLD', name: 'Prologis', sector: 'Real Estate', aliases: ['prologis'] },
  { ticker: 'CCI', name: 'Crown Castle', sector: 'Real Estate', aliases: ['crown castle'] },
  { ticker: 'EQIX', name: 'Equinix', sector: 'Real Estate', aliases: ['equinix'] },
  { ticker: 'PSA', name: 'Public Storage', sector: 'Real Estate', aliases: ['public storage'] },
  { ticker: 'SPG', name: 'Simon Property Group', sector: 'Real Estate', aliases: ['simon property'] },
  { ticker: 'O', name: 'Realty Income', sector: 'Real Estate', aliases: ['realty income'] },
  { ticker: 'WELL', name: 'Welltower', sector: 'Real Estate', aliases: ['welltower'] },
  { ticker: 'DLR', name: 'Digital Realty', sector: 'Real Estate', aliases: ['digital realty'] },
  { ticker: 'AVB', name: 'AvalonBay Communities', sector: 'Real Estate', aliases: ['avalonbay'] },
  { ticker: 'EQR', name: 'Equity Residential', sector: 'Real Estate', aliases: ['equity residential'] },
  { ticker: 'VICI', name: 'VICI Properties', sector: 'Real Estate', aliases: ['vici'] },
  { ticker: 'ARE', name: 'Alexandria Real Estate', sector: 'Real Estate', aliases: ['alexandria'] },
  { ticker: 'SBAC', name: 'SBA Communications', sector: 'Real Estate', aliases: ['sba communications'] },

  // Industrials - Manufacturing
  { ticker: 'GE', name: 'GE Aerospace', sector: 'Industrials', aliases: ['ge', 'general electric'] },
  { ticker: 'HON', name: 'Honeywell', sector: 'Industrials', aliases: ['honeywell'] },
  { ticker: 'CAT', name: 'Caterpillar', sector: 'Industrials', aliases: ['caterpillar', 'cat'] },
  { ticker: 'DE', name: 'Deere & Company', sector: 'Industrials', aliases: ['john deere', 'deere'] },
  { ticker: 'MMM', name: '3M', sector: 'Industrials', aliases: ['3m'] },
  { ticker: 'EMR', name: 'Emerson Electric', sector: 'Industrials', aliases: ['emerson'] },
  { ticker: 'ETN', name: 'Eaton', sector: 'Industrials', aliases: ['eaton'] },
  { ticker: 'ITW', name: 'Illinois Tool Works', sector: 'Industrials', aliases: ['illinois tool'] },
  { ticker: 'PH', name: 'Parker-Hannifin', sector: 'Industrials', aliases: ['parker hannifin'] },
  { ticker: 'ROK', name: 'Rockwell Automation', sector: 'Industrials', aliases: ['rockwell'] },
  { ticker: 'CMI', name: 'Cummins', sector: 'Industrials', aliases: ['cummins'] },
  { ticker: 'PCAR', name: 'PACCAR', sector: 'Industrials', aliases: ['paccar', 'kenworth', 'peterbilt'] },
  { ticker: 'GWW', name: 'W.W. Grainger', sector: 'Industrials', aliases: ['grainger'] },
  { ticker: 'FAST', name: 'Fastenal', sector: 'Industrials', aliases: ['fastenal'] },
  { ticker: 'WM', name: 'Waste Management', sector: 'Industrials', aliases: ['waste management'] },
  { ticker: 'RSG', name: 'Republic Services', sector: 'Industrials', aliases: ['republic services'] },
  { ticker: 'IR', name: 'Ingersoll Rand', sector: 'Industrials', aliases: ['ingersoll rand'] },
  { ticker: 'DOV', name: 'Dover', sector: 'Industrials', aliases: ['dover'] },
  { ticker: 'SWK', name: 'Stanley Black & Decker', sector: 'Industrials', aliases: ['stanley', 'black decker'] },
  { ticker: 'CARR', name: 'Carrier Global', sector: 'Industrials', aliases: ['carrier'] },
  { ticker: 'OTIS', name: 'Otis Worldwide', sector: 'Industrials', aliases: ['otis'] },
  { ticker: 'AME', name: 'AMETEK', sector: 'Industrials', aliases: ['ametek'] },
  { ticker: 'XYL', name: 'Xylem', sector: 'Industrials', aliases: ['xylem'] },
  { ticker: 'IEX', name: 'IDEX Corporation', sector: 'Industrials', aliases: ['idex'] },
  { ticker: 'ACM', name: 'AECOM', sector: 'Industrials', aliases: ['aecom'] },

  // Materials
  { ticker: 'LIN', name: 'Linde', sector: 'Materials', aliases: ['linde'] },
  { ticker: 'APD', name: 'Air Products', sector: 'Materials', aliases: ['air products'] },
  { ticker: 'SHW', name: 'Sherwin-Williams', sector: 'Materials', aliases: ['sherwin williams'] },
  { ticker: 'FCX', name: 'Freeport-McMoRan', sector: 'Materials', aliases: ['freeport', 'freeport mcmoran'] },
  { ticker: 'NEM', name: 'Newmont', sector: 'Materials', aliases: ['newmont'] },
  { ticker: 'NUE', name: 'Nucor', sector: 'Materials', aliases: ['nucor'] },
  { ticker: 'DOW', name: 'Dow Inc.', sector: 'Materials', aliases: ['dow'] },
  { ticker: 'DD', name: 'DuPont', sector: 'Materials', aliases: ['dupont'] },
  { ticker: 'ECL', name: 'Ecolab', sector: 'Materials', aliases: ['ecolab'] },
  { ticker: 'CTVA', name: 'Corteva', sector: 'Materials', aliases: ['corteva'] },
  { ticker: 'PPG', name: 'PPG Industries', sector: 'Materials', aliases: ['ppg'] },
  { ticker: 'VMC', name: 'Vulcan Materials', sector: 'Materials', aliases: ['vulcan'] },
  { ticker: 'MLM', name: 'Martin Marietta', sector: 'Materials', aliases: ['martin marietta'] },
  { ticker: 'ALB', name: 'Albemarle', sector: 'Materials', aliases: ['albemarle'] },
  { ticker: 'CF', name: 'CF Industries', sector: 'Materials', aliases: ['cf industries'] },
  { ticker: 'MOS', name: 'Mosaic Company', sector: 'Materials', aliases: ['mosaic'] },
  { ticker: 'IFF', name: 'International Flavors', sector: 'Materials', aliases: ['iff', 'international flavors'] },
  { ticker: 'EMN', name: 'Eastman Chemical', sector: 'Materials', aliases: ['eastman'] },
  { ticker: 'CE', name: 'Celanese', sector: 'Materials', aliases: ['celanese'] },
  { ticker: 'STLD', name: 'Steel Dynamics', sector: 'Materials', aliases: ['steel dynamics'] },
];

export function getCompanyByTicker(ticker: string): CompanyMapping | undefined {
  return COMPANY_MAPPINGS.find((c) => c.ticker.toLowerCase() === ticker.toLowerCase());
}

export function getCompaniesBySector(sector: string): CompanyMapping[] {
  return COMPANY_MAPPINGS.filter((c) => c.sector === sector);
}

export function getAllTickers(): string[] {
  return COMPANY_MAPPINGS.map((c) => c.ticker);
}

export function getAllSectors(): string[] {
  const sectors = new Set(COMPANY_MAPPINGS.map((c) => c.sector));
  return Array.from(sectors).sort();
}

export function getRelatedCompanies(
  ticker: string,
  keywords: string[] = [],
  maxItems: number = 8
): CompanyMapping[] {
  const company = getCompanyByTicker(ticker);
  if (!company) return [];

  // Get companies in same sector (excluding current)
  const sectorCompanies = getCompaniesBySector(company.sector).filter(
    (c) => c.ticker !== ticker
  );

  // Score by keyword overlap
  const scored = sectorCompanies.map((c) => {
    let score = 0;
    const aliasWords = c.aliases.flatMap((a) => a.toLowerCase().split(/\s+/));
    keywords.forEach((kw) => {
      if (aliasWords.some((alias) => alias.includes(kw) || kw.includes(alias))) {
        score += 1;
      }
    });
    return { company: c, score };
  });

  // Sort by score descending, then alphabetically
  scored.sort((a, b) => b.score - a.score || a.company.name.localeCompare(b.company.name));

  return scored.slice(0, maxItems).map((s) => s.company);
}

/**
 * Get all companies including dynamically discovered ones from Firestore.
 * This is an async function that combines static mappings with discovered companies.
 */
export async function getAllCompaniesWithDiscovered(): Promise<CompanyMapping[]> {
  const { getAllCompanies } = await import('./company-discovery');
  return getAllCompanies();
}

/**
 * Group companies by sector
 */
export function groupCompaniesBySector(
  companies: CompanyMapping[]
): Record<string, CompanyMapping[]> {
  return companies.reduce<Record<string, CompanyMapping[]>>((acc, company) => {
    if (!acc[company.sector]) {
      acc[company.sector] = [];
    }
    acc[company.sector].push(company);
    return acc;
  }, {});
}
