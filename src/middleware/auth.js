const jwt = require('jsonwebtoken')
const User = require('../models/users')
const Vendor = require('../models/vendors')

const authUser = async (req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ', '')
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({_id: decode._id, 'tokens.token': token})

        if(!user){
            throw new Error()
        }

        req.token = token
        req.user = user
        next()
    }catch(e){
        res.status(401).send('Please Authenticate!')
    }
}

const authVendor = async (req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ', '')
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        const vendor = await Vendor.findOne({_id: decode._id, 'tokens.token': token})

        if(!vendor){
            throw new Error()
        }

        req.token = token
        req.vendor = vendor
        next()
    }catch(e){
        res.status(401).send('Please Authenticate!')
    }
}

module.exports = { authUser, authVendor }