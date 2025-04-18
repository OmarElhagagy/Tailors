const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const Listing = require('../models/Listing');

// @route POST /api/pricing/calculate
// @desc  Calculate order price
// @access Private (Any authenticated user)
router.post('/calculate', [
  auth,
  [
    check('listingId', 'Listing ID is required').not().isEmpty(),
    check('quantity', 'Quantity must be a number').isNumeric(),
    check('customizationOptions', 'Customization options must be an object').optional().isObject()
  ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { listingId, quantity, customizationOptions, deliveryMethod } = req.body

      const listing = await Listing.findById(listingId);

      if (!listing) {
        return res.status(404).json({ errors: [{ message: 'Listing not found' }] });
      }

      // Bas price
      const basePrice = listing.price;

      // calculate customization fee (maybe applied idk)
      let customizationFee = 0;

      if (listing.customizable && customizationOptions) {
        // calculate customization fee based on options
        // simplified example maybe edited
        if (Object.keys(customizationOptions).length > 0) {
          customizationFee = 50.00; // flat fee for customization
        }
      }

      let deliveryFee = parseFloat(sellerSpecifiedFee);

      if (isNaN(deliveryFee) || deliveryFee < 0) {
        deliveryFee = 0; // default to 0 if invalid input
      }

      const totalPrice = (basePrice + customizationFee + deliveryFee) * quantity

      // return price breakdown
      const priceBreakDown = {
        basePrice,
        customizationFee,
        deliveryFee,
        quantity,
        totalPrice
      }
      res.json(priceBreakDown);
    } catch(error) {
      console.error(error.message);
      if (error.kind === 'ObjectId') {
        console.error(error.message);
        return res.status(404).json({ errors: [{ message: 'Listing not found' }] });
      }
      res.status(500).send('Server error');
    }
  });
