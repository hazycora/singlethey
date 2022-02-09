require('dotenv').config()
const Twitter = require('twitter')
const client = new Twitter({
    consumer_key: process.env.API_KEY,
    consumer_secret: process.env.API_KEY_SECRET,
    access_token_key: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
})
let stream = client.stream('statuses/filter', {track: 'his/her,him/her,she/he.he/she'})

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

stream.on('data', function(event) {
    if (event.retweeted_status) return
    let bio = event.user.description
    if (maybePronounsInBio(bio)) return
    if (maybePronounsInBio(event.user.name)) return
    let tweetText = event.truncated?event.extended_tweet.full_text:event.text
    if (tweetText.includes('pronoun')) return
    if (tweetText.includes('they')) return
    if (tweetText.includes('their')) return
    if (
        !tweetText.includes('he/she')&&
        !tweetText.includes('she/he')&&
        !tweetText.includes('his/her')&&
        !tweetText.includes('him/her')
    ) return
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
    console.log(`${tweetObj.author.display_name} (@${tweetObj.author.username})${tweetObj.author.verified?' [V]':''}: ${tweetObj.text}`)
})

stream.on('error', function(error) {
    throw error
})
