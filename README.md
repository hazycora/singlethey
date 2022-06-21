# singlethey

a twitter bot that corrects people to use "they" instead of "he/she" 

[live (maybe) example](https://twitter.com/singlethey)

## usage

if there is an existing singlethey bot on twitter, maybe don't host your own.
it'd be frustrating if there were multiple bots replying to the same posts.
use this repo as a reference for making your own bots, or to remake singlethey if the existing singlethey bot goes offline.

anyways, to run this script:

you need to make a twitter bot for this project. register for one at https://developer.twitter.com.

be sure to enable read+write for this twitter bot

then, specify the tokens with the following environment variables

```
API_KEY=twitter api key
API_KEY_SECRET=twitter api key secret
ACCESS_TOKEN=twitter access token
ACCESS_TOKEN_SECRET=twitter access token secret
```

these can be specified using bash, or by making a ``.env`` file

then, assuming nodejs is installed, just run ``node index.js``

---

###### (this was written in a day pls dont kill me i know the codes bad)
