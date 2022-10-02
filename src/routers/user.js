const express = require('express')
const Order = require('../models/orders')
const User = require('../models/users')
const { authUser, authVendor } = require('../middleware/auth')
const router = new express.Router()

// SignUp
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
    
})

// Login
router.post('/users/login', async(req, res) => {
    try{
        const user = await User.findByCredentials(req.body.contactNo, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch(e) {
        res.status(400).send()
    }
    
})

// Logout user
router.post('/users/logout', authUser, async(req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send('Logged out successfully.')
    }catch(e){
        res.status(500).send()
    }
})
// Logout all
router.post('/users/logoutall', authUser, async (req, res,) => {
    try{
        req.user.tokens = []
        await req.user.save()

        res.send('Successfully Logged out from all connected devices..')
    }catch(e){
        res.status(500).send()
    }
})

// View Profile
router.get('/users/me', authUser, async (req, res) => {
    res.send(req.user)
})

// Update Profile
router.patch('/users/me', authUser, async (req, res) => {
    const updates = Object.keys(req.body)
    const validUpdates = ['name', 'password']
    const isValidUpdate = updates.every((update) => validUpdates.includes(update))
    if(!isValidUpdate){
        return res.status(400).send('Invalid Update !')
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch(e) {
        res.status(500).send(e)
    }
})

// delete user
router.delete('/users/me', authUser, async(req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch(e) {
        res.status(500).send()
    }
})

// to post a takeaway order
router.post('/users/order', authUser, async (req, res) => {
    const order = new Order({
        ...req.body,
        userName: req.user._id
    })
    try {
        const orders = await order.save()
        res.status(201).send(order)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Order details
router.get('/users/orders/me', authUser, async (req, res) => {
    try {
        const orders = await Order.find({userName: req.user._id})
        // await req.user.populate({
        //     path: 'orders',
        //     match
        // }).execPopulate()

        if(!orders){
            res.status(404).send()
        }

        res.send(orders)
    } catch(e) {
        res.status(500).send(e)
    }
})

module.exports = router