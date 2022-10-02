const express = require('express')
const Vendor = require('../models/vendors')
const Order = require('../models/orders')
const {authVendor} = require('../middleware/auth')
const router = new express.Router()


// Login -> Vendors
router.post('/vendors/login', async(req, res) => {
    try{
        const vendor = await Vendor.findByCredentials(req.body.contactNo, req.body.password)
        const token = await vendor.generateAuthToken()
        res.send({vendor, token})
    } catch(e) {
        res.status(400).send()
    }
    
})

// Logout -> Vendor
router.post('/vendors/logout', authVendor, async(req, res) => {
    try{
        req.vendor.tokens = req.vendor.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.vendor.save()
        res.send('Logged out successfully.')
    }catch(e){
        res.status(500).send()
    }
})

// Logout all
router.post('/vendors/logoutall', authVendor, async (req, res,) => {
    try{
        req.vendor.tokens = []
        await req.vendor.save()

        res.send('Successfully Logged out from all connected devices..')
    }catch(e){
        res.status(500).send()
    }
})

// View Profile
router.get('/vendors/me', authVendor, async (req, res) => {
    res.send(req.vendor)
})

// Update Profile -> Admin
router.patch('/vendors/update/me', authVendor, async (req, res) => {
    const updates = Object.keys(req.body)
    const validUpdates = ['password', 'openOrClosedstatus', 'address']
    const isValidUpdate = updates.every((update) => validUpdates.includes(update))
    if(!isValidUpdate){
        return res.status(400).send('Invalid Update !')
    }
    try {
        updates.forEach((update) => req.vendor[update] = req.body[update])
        await req.vendor.save()
        res.send(req.vendor)
    } catch(e) {
        res.status(500).send(e)
    }
})

// Order details
router.get('/vendors/orders/me', authVendor, async (req, res) => {
    try {
        const orders = await Order.find({vendorName: req.vendor._id})
       
        if(!orders){
            res.status(404).send()
        }

        res.send(orders)
    } catch(e) {
        res.status(500).send(e)
    }
})

// Update order
router.patch('/vendors/update/order/:id', authVendor, async (req, res) => {
    const updates = Object.keys(req.body)
    const validUpdates = ['orderStatus']
    const isValidUpdate = updates.every((update) => validUpdates.includes(update))
    if(!isValidUpdate){
        return res.status(400).send('Invalid Update !')
    }
    try {
        const order = await Order.findOne({_id: req.params.id, vendorName: req.vendor._id})
        if(!order) {
            return res.status(404).send()
        }

        updates.forEach((update) => order[update] = req.body[update])
        await order.save()
        res.send(order)
    } catch (e) {
        res.status(500).send(e)
    }
    
})


module.exports = router