const { getFormsCollection, getSubmissionsCollection } = require('../config/db');
const { ObjectId } = require('mongodb');
const { Parser } = require('json2csv');

exports.createForm = async (req, res) => {
  try {
    const form = req.body;
    const result = await getFormsCollection().insertOne(form);
    form._id = result.insertedId;
    res.status(201).json(form);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create form' });
  }
};

exports.getForms = async (req, res) => {
  try {
    const forms = await getFormsCollection().find().toArray();
    res.json(forms);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
};

exports.getForm = async (req, res) => {
  try {
    const form = await getFormsCollection().findOne({ _id: new ObjectId(req.params.id) });
    if (form) {
      res.json(form);
    } else {
      res.status(404).json({ error: 'Form not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch form' });
  }
};

exports.submitForm = async (req, res) => {
  try {
    const submission = {
      formId: req.params.id,
      data: req.body,
      submittedAt: new Date()
    };
    await getSubmissionsCollection().insertOne(submission);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit form' });
  }
};

exports.getSubmissions = async (req, res) => {
  try {
    const submissions = await getSubmissionsCollection().find({ formId: req.params.id }).toArray();
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

exports.exportSubmissionsCSV = async (req, res) => {
  try {
    const submissions = await getSubmissionsCollection().find({ formId: req.params.id }).toArray();
    if (!submissions.length) return res.status(404).send('No submissions');
    const fields = Object.keys(submissions[0].data);
    const parser = new Parser({ fields });
    const csv = parser.parse(submissions.map(s => s.data));
    res.header('Content-Type', 'text/csv');
    res.attachment('submissions.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export CSV' });
  }
};
