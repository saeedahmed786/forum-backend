const express = require('express');
const Subject = require('../Models/subjectModel');
const upload = require('./multer');


const router  = express.Router();

function getAllSubjects (subjects, parentId = null) {
    const subjectsList = [];
    let subject;
    if(parentId == null) {
        subject = subjects.filter(cat => cat.parentId == undefined);
    } else {
        subject = subjects.filter(cat => cat.parentId == parentId);
    }

    for(let sub of subject) {
        subjectsList.push({
            _id: sub._id,
            name: sub.name,
            subject: sub.mainSubjectName,
            children: getAllSubjects(subjects, sub._id)
        })
    }
    return subjectsList; 
} 
router.get('/get', async (req, res) => {
    const findSubjects = await Subject.find();
    if(findSubjects) {
        const subjectsList = getAllSubjects(findSubjects);
        res.status(200).send(subjectsList);
    } else {
        res.status(404).json({errorMessage: 'No Subjects Found'});
    }
});

router.get('/get/edit/:id', async (req, res) => {
    const findSubjects = await Subject.findOne({_id: req.params.id}).populate('parentId');
    if(findSubjects) {
        res.status(200).send(findSubjects);
    } else {
        res.status(404).json({errorMessage: 'No Subjects Found'});
    }
});

router.post('/update/:id', upload.array('') ,async (req, res) => {
   const findSubject = await Subject.findOne({_id: req.params.id});
    if(findSubject) {
        findSubject.name = req.body.subjectName,
        findSubject.parentId = req.body.parentId
        const saveSubject = await findSubject.save();
            if(saveSubject) {
                res.status(200).json({successMessage: 'Subject updated successfuly!'});
            } else {
                res.status(400).json({errorMessage: 'Subject not updated. Please try again'});
            }
    } else {
        res.status(404).json({errorMessage: 'No Subjects Found'});
    }
});

router.post('/main/create', upload.array(''), async (req, res) => {
    // res.header("Access-Control-Allow-Origin", "*");  
    const subject = new Subject({
        name: req.body.name,
    });

    const saveSubject = await subject.save();
    if(saveSubject) {
        res.status(200).json({successMessage: 'Subject created successfuly!'});
    } else {
        res.status(400).json({errorMessage: 'Subject not created. Please try again'});
    }
});

router.post('/sub/create', upload.array(''), async (req, res) => {
    const subject = new Subject({
        name: req.body.name,
        parentId: req.body.parentId
    });

    const saveSubject = await subject.save();
    if(saveSubject) {
        res.status(200).json({successMessage: 'Sub-Subject created successfuly!'});
    } else {
        res.status(400).json({errorMessage: 'Sub-Subject not created. Please try again'});
    }
});


router.post('/delete', upload.array(''), async (req, res) => {
    const subject = await Subject.findOneAndDelete({_id: req.body.subjectId});
     if(subject) {
         subject.remove();
         res.status(200).json({successMessage: 'Subject deleted successfuly!'});
     } 
   else {
        res.status(400).json({errorMessage: 'Subject not deleted. Please try again'});
    }
});



module.exports = router;