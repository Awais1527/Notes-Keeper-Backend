const express = require("express");
const fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const router = express.Router();
const { body, validationResult } = require("express-validator");

// Route 1 : Get all the notes of logged in user  using: Get "/api/notes/fetchallnotes"   Login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("some error occured");
  }
});

// Route 2 : Add a notes of logged in user  using: post "/api/notes/addnote"   Login required
router.post("/addnote",fetchuser,[
    body("title", "Enter a valid title length min 3 characters").isLength({min: 3,}),
    body("description", "des length min 5 characters").isLength({ min: 5 }),
  ],async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      // if there are errors , return Bad request and errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();
      res.json(savedNote);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("some error occured");
    }
  }
);

// Route 3 : update an existing notes of logged in user  using: put "/api/notes/updatenote"   Login required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  // creating a new note object
  try {
    const newNote = {};
    if (title) {newNote.title = title;}
    if (description) {newNote.description = description; }
    if (tag) { newNote.tag = tag;}

    // find the note to update and update it
    let note = await Note.findById(req.params.id);
    if (!note) {return res.status(404).send("Not Found");}
      // Allow update if user own the note
    if (note.user.toString() !== req.user.id) {return res.status(401).send("Not Allowed");}

    note = await Note.findByIdAndUpdate( req.params.id,{ $set: newNote },{ new: true });
    res.json({ note });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("some error occured");
  }
});

// Route 4 : Delete an existing notes of logged in user  using: Delete "/api/notes/deletenote"   Login required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    // find the note to update and update it
    let note = await Note.findById(req.params.id);
    if (!note) {return res.status(404).send("Not Found"); }
    // Allow deletion if user own the note
    if (note.user.toString() !== req.user.id) { return res.status(401).send("Not Allowed"); }
    // delete note
    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note is deleted", note: note });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("some error occured");
  }
});



module.exports = router;
