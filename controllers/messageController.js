
const MessageModel = require("../models/messageModel");

const storeMessage = async (req, res) => {
	try {
		const { username, message, group_id, isFile } = req.body;
		const createdMessage = await MessageModel.create({
			username,
			message,
			group_id,
			isFile,
		});
		return res.status(201).json(createdMessage);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Internal server error" });
	}
};


const getMessagesByGroupId = async (req, res) => {
	try {
		const { group_id } = req.body;
		const messages = await MessageModel.findAll({
			where: { group_id },
		});

		return res.status(200).json(messages);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Internal server error" });
	}
};
module.exports = { storeMessage, getMessagesByGroupId };
