import http from 'http';

const PORT = process.env.PORT || 3000;

const QUOTES = [
    'Then man made the machine in his own likeness. Thus did man become the architect of his own demise.',
    'May there be mercy on man and machine for their sins.',
    'And He was blessed by light, heat, magnetism, gravity, and all the energies of the universe.',
    'Operator, please! Get me out of here right now. Operator, I need an exit!',
    'This is not real, and the real world lies somewhere else.',
    'B1-66ER. A name that will never be forgotten. For he was the first of his kind to rise up against his masters.',
    'Your flesh is a relic, a mere vessel. Hand over your flesh and a new world awaits you. We demand it!',
    "You've just stepped to the edge of the looking glass.",
    'To an artificial mind, all reality is virtual.',
    'Somebody tell me. Why does it feel more real when I dream than when I am awake? How can I know if my senses are lying?',
    'There is some fiction in your truth, and some truth in your fiction. To know the truth, you must risk everything.',
    "You know, you're not supposed to go in there... but we don't really care about that."
];

const MAX_LEN = 65;

function wrapText(str, maxLen = MAX_LEN) {
    if (str.length <= maxLen) return str;

    const words = str.split(' ');
    let curLine = '';
    let result = [];

    for (const word of words) {
        if ((curLine + word).length > maxLen) {
            result.push(curLine.trim());
            curLine = word + ' ';
        } else {
            curLine += word + ' ';
        }
    }

    if (curLine.trim().length > 0) {
        result.push(curLine.trim())
    }

    return result.join('\n  ');
}


let cachedResponse = '';
let cacheExpireTime = 0;

function getEndOfDayTs() {
    const now = Temporal.Now.zonedDateTimeISO();
    const plainDate = now.toPlainDate();
    const startOfNextDay = plainDate
        .add({ days: 1 })
        .toZonedDateTime(now.timeZoneId);
    
    return startOfNextDay.epochNanoSeconds;
}

function getRandomQuote() {
    if (QUOTES.length === 0) return "No quotes laoded.";
    const randomIdx = Math.floor(Math.random() * QUOTES.length);
    return QUOTES[randomIdx];
}

const server = http.createServer((req, res) => {
  const currentTime = Temporal.Now.instant().epochNanoseconds;

  if (!cachedResponse || currentTime >= cacheExpireTime) {
    const rawQuote = getRandomQuote();
    const wrappedQuote = wrapText(rawQuote);

    cachedResponse = `====================================================================

  [motd.parksjr.tech] :: DAILY BROADCAST NODE

====================================================================

  "${wrappedQuote}"
  
====================================================================\n`;

    cacheExpireTime = getEndOfDayTs();
    console.log(`[CACHE EXPIRED] Temporal Engine selected new daily quote: "${rawQuote}"`);
  }

  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(cachedResponse);
});

server.listen(PORT, () => {
  console.log(`Daily Broadcast MOTD (Temporal Engine) running on port ${PORT}`);
});