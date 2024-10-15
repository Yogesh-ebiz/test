const _ = require('lodash');
const Reaction = require('../models/reaction.model');
const Comment = require('../models/comment.model');
const reactionSubjectType = require('../const/subjectType');

async function addReaction(reaction){

    if(!reaction){
        return;
    }
    const newReaction = await new Reaction(reaction).save();
    
    // Update the related subject with the new reaction
    await updateReactions(reaction.subjectType, reaction.subject, newReaction._id);
    
    return newReaction;
}

async function removeReaction(reactionId) {

    if(!reactionId){
        return;
    }
    const reaction = await Reaction.findById(reactionId);
    if (!reaction) {
        return;
    }
    await Reaction.deleteOne({ _id: reactionId });
    // Update the related subject by removing the reaction
    await updateReactions(reaction.subjectType, reaction.subject, reactionId, true);

    return reaction;
}

async function getReaction(subjectType, subjectId, userId) {
    if(!subjectType || !subjectId || !userId){
        return;
    }
    return await Reaction.findOne({ subjectType: subjectType, subject: subjectId, reactionBy: userId });
}

async function getReactions(subjectType, subjectId) {
    if(!subjectType || !subjectId){
        return;
    }
    return await Reaction.find({ subjectType: subjectType, subject: subjectId });
}

async function updateReactions(subjectType, subjectId, reactionId, remove = false) {
    if (subjectType === reactionSubjectType.COMMENT) {
        const comment = await Comment.findById(subjectId);
        if (!comment) {
            return;
        }

        if (remove) {
            comment.reactions.pull(reactionId);
        } else {
            comment.reactions.push(reactionId);
        }

        await comment.save();
    }

    // Add more conditions for other subject types in future
}

module.exports = {
    addReaction,
    removeReaction,
    getReactions,
    getReaction
};