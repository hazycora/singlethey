require('dotenv').config()
const Twitter = require('twitter')
const client = new Twitter({
    consumer_key: process.env.API_KEY,
    consumer_secret: process.env.API_KEY_SECRET,
    access_token_key: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
})
let stream = client.stream('statuses/filter', {track: 'his/her,him/her,she/he,he/she'})
let minDelay = (60*1000)*20
let lastTweet = Date.now()-minDelay

let randInt = (from, to) => Math.floor(Math.random()*(to-from))+from
let random = arr => arr[randInt(0, arr.length)]

let randomPassiveAggression = () => random([":)", "🙃", ":]"])

let randomConsoleColor = () => `\x1b[3${randInt(1,7)}m`

let transIndicators = ["she","her","hers","he","him","his","they","their","theirs","it","its",
"trans","transgender","pronouns","pronoun","nonbinary","gender","🏳️‍⚧️",]

function maybePronounsInBio(bio) {
    if (bio==null||bio==undefined) return false
    let words = bio.replace(/[\.,\-|\n\:\/]/gm, ' ').split(' ')
    return transIndicators.some(word => words.includes(word))
}

let sensitiveList = ['dying','dead','die','suicide','suicidal','rape','murder','kill','assassinat','war','bomb','threat']

function isSensitive(event, text) {
    if (event.possibly_sensitive) return true
    if (text.includes('end')&&(text.includes('life')||text.includes('liv'))) return
    return sensitiveList.some(word => text.includes(word))
}

stream.on('data', async (event) => {
    let bio = event.user.description
    let tweetText = event.truncated?event.extended_tweet.full_text:event.text

    if ([
        Date.now()-lastTweet<minDelay,
        event.retweeted_status,
        maybePronounsInBio(bio),
        maybePronounsInBio(event.user.name),
        isSensitive(event, tweetText)
        ['pronoun', 'they', 'their'].some(e=>tweetText.includes(e))
    ].some(Boolean)) return
    let pronounSets = ['he,she,they', 'his,her,their', 'him,her,them'].map(e=>e.split(','))
    let seperators = [' / ', '/', ' or ']
    let pronounType = false
    for (let sep of seperators) {
        for (let pron of pronounSets) {
            if (tweetText.includes(pron[0]+sep+pron[1]) || tweetText.includes(pron[1]+sep+pron[0])) pronounType = pron[2]
        }
    }
    if (!pronounType) return
    lastTweet = Date.now()
    let tweetObj = {
        id: event.id_str,
        text: tweetText,
        author: {
            id: event.user.id_str,
            display_name: event.user.name,
            username: event.user.screen_name,
            bio: event.user.description,
            verified: event.user.verified
        }
    }
    console.log(`${randomConsoleColor()}${tweetObj.author.display_name} (@${tweetObj.author.username})${tweetObj.author.verified?' [V]':''}:\x1b[0m ${tweetObj.text}`)
    let reply = `@${tweetObj.author.username} ${pronounType}* ${randomPassiveAggression()}`
    console.log(`\x1b[47m\x1b[30mREPLY\x1b[0m❭ ${reply}`)
    await client.post('statuses/update', {status: reply, in_reply_to_status_id: tweetObj.id})
})

stream.on('error', function(error) {
    throw error
})
