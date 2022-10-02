const express = require('express')
require('./db/mongoose.js')
const userRouter = require('./routers/user')
const adminRouter = require('./routers/admin')
const vendorRouter = require('./routers/vendor')

const port = process.env.PORT
const app = express()


app.use(express.json())
app.use(userRouter)
app.use(adminRouter)
app.use(vendorRouter)

app.listen(port, () => {
    console.log('Server is running on Port 3000..')
})