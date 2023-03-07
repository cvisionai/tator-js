const express = require('express')
const app = express()
const port = 3000

function add_headers(res, path, stat)
{
  res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
}

app.use(express.static('public', {setHeaders:add_headers}));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})