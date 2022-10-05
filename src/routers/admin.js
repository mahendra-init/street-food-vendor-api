const express = require('express')
const sharp = require('sharp')
const { authVendor } = require('../middleware/auth')
const upload = require('../middleware/upload')
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

router.post('/admin/vendor/upload/documents', authVendor, upload, async (req, res) => {
    const buffer1 = await sharp(req.files.fssaiLicense[0].buffer).resize({ height: 250, width: 250}).png().toBuffer()
    req.vendor.documents.fssaiLicense = buffer1
    
    const buffer2 = await sharp(req.files.hawkerLicense[0].buffer).resize({ height: 250, width: 250}).png().toBuffer()
    req.vendor.documents.hawkerLicense = buffer2
    
    const buffer3 = await sharp(req.files.addressProof[0].buffer).resize({ height: 250, width: 250}).png().toBuffer()
    req.vendor.documents.addressProof = buffer3
    
    await req.vendor.save()
    res.status(200).send("upload successfull")

}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
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