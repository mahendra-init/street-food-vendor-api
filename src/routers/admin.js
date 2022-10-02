const express = require('express')
const { authVendor } = require('../middleware/auth')
const Vendor = require('../models/vendors')
const router = new express.Router()


// Vendor SignUp
router.post('/admin/vendor-signup', async (req, res) => {
    const vendor = new Vendor(req.body)

    try {
        await vendor.save()
        const token = await vendor.generateAuthToken()
        res.status(201).send({vendor, token})
    } catch (e) {
        res.status(400).send(e)
    }
    
})


// Update Profile -> Admin
router.patch('/admin/vendor-update', authVendor, async (req, res) => {
    const updates = Object.keys(req.body)
    const validUpdates = ['name', 'contactNo', 'documents', 'address', 'takeAwayOrderstatus', 'menuItem']
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

// delete vendor -> Admin
router.delete('/admin/vendors/me', authVendor, async(req, res) => {
    try {
        await req.vendor.remove()
        res.send(req.vendor)
    } catch(e) {
        res.status(500).send()
    }
})

module.exports = router