const express = require('express');
const SalesProspect = require('../models/SalesProspect');

const router = express.Router();

router.get('/sales/prospects', async (req, res) => {
    try {
      // Fetch all records from the SalesProspect collection
      const prospects = await SalesProspect.find({});
      
      // Render the view and pass the records
      res.render('dashboard/sales/salesProspectForm', { prospects });
    } catch (error) {
      console.error('Error fetching prospects:', error);
      res.status(500).send('Failed to fetch prospects');
    }
  });

// Route to handle form submission
router.post('/sales/prospects', async (req, res) => {
    try {
        // Save prospect data
        const prospect = new SalesProspect(req.body);
        await prospect.save();

        res.status(201).send('Prospect saved successfully');
    } catch (error) {
        console.error('Error saving prospect:', error);
        res.status(500).send('Error saving prospect');
    }
});

module.exports = router;
