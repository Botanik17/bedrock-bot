const bedrock = require('bedrock-protocol')

function startBot(){

const client = bedrock.createClient({
  host: "pflaume.dat.gg",
  port: 17444,
  username:"Botaniker@gmx.ch",
  offline: false
})

client.on('join', () => {
  console.log("Bot ist online")
})

client.on('disconnect', () => {
  setTimeout(startBot, 5000)
})

}

startBot()
