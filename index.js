require('dotenv').config()
const Twitter = require('twitter')
const client = new Twitter({
    consumer_key: process.env.API_KEY,
    consumer_secret: process.env.API_KEY_SECRET,
    access_token_key: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
})
let stream = client.stream('statuses/filter', {track: 'his/her,him/her,she/he,he/she'})
let minDelay = (60*1000)
let lastTweet = Date.now()-minDelay

function randomPassiveAggression() {
    let examples = [
        ":)",
        "🙃",
        ":]"
    ]
    return examples[Math.floor(Math.random()*examples.length)]
}

function randomConsoleColor() {
    let colors = [
        "\x1b[31m",
        "\x1b[32m",
        "\x1b[33m",
        "\x1b[34m",
        "\x1b[35m",
        "\x1b[36m"
    ]
    return colors[Math.floor(Math.random()*colors.length)]
}

function maybePronounsInBio(bio) {
    if (bio==null||bio==undefined) return false
    let words = bio.replace(/[\.,\-|\n\:\/]/gm, ' ').split(' ')
    if (
        words.includes('she')||
        words.includes('her')||
        words.includes('hers')||
        words.includes('he')||
        words.includes('him')||
        words.includes('his')||
        words.includes('they')||
        words.includes('their')||
        words.includes('theirs')||
        words.includes('it')||
        words.includes('its')||
        words.includes('trans')||
        words.includes('transgender')||
        words.includes('pronouns')||
        words.includes('pronoun')||
        words.includes('nonbinary')||
        words.includes('gender')||
        words.includes('🏳️‍⚧️')
    ) return true
    return false
}

function isSensitive(event, text) {
    if (event.possibly_sensitive) return true
    if (
        text.includes('dying')||
        (text.includes('end')&&(text.includes('life')||text.includes('liv')))||
        text.includes('dead')||
        text.includes('die')||
        text.includes('suicide')||
        text.includes('suicidal')||
        text.includes('rape')||
        text.includes('murder')||
        text.includes('kill')||
        text.includes('assassinat')||
        text.includes('war')||
        text.includes('bomb')||
        text.includes('threat')
    ) return true
    return false
}

stream.on('data', function(event) {
    if (Date.now()-lastTweet<minDelay) return
    if (event.retweeted_status) return
    let bio = event.user.description
    if (maybePronounsInBio(bio)) return
    if (maybePronounsInBio(event.user.name)) return
    let tweetText = event.truncated?event.extended_tweet.full_text:event.text
    if (isSensitive(event, tweetText)) return
    if (tweetText.includes('pronoun')) return
    if (tweetText.includes('they')) return
    if (tweetText.includes('their')) return
    let pronounType = null
    if (tweetText.includes('he/she')||tweetText.includes('she/he')) {
        pronounType = 'they'
    } else if (tweetText.includes('his/her')||tweetText.includes('her/his')) {
        pronounType = 'their'
    } else if (tweetText.includes('him/her')||tweetText.includes('her/him')) {
        pronounType = 'them'
    } else {
        return
    }
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
    console.log(`\x1b[47m\x1b[30mREPLY\x1b[0m❭ @${tweetObj.author.username} ${pronounType}* ${randomPassiveAggression()}`)
})

stream.on('error', function(error) {
    throw error
})
