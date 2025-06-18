const Contact = require('../models/contact');

/**
 * Identify and consolidate user identity based on email and/or phone number.
 *
 * This function checks if a contact exists with the given email or phone number.
 * - If no contact exists, a new primary contact is created.
 * - If matching contacts exist:
 *   - It identifies the oldest contact as primary.
 *   - Creates a secondary contact if new information is present.
 *   - Merges multiple primary contacts by demoting others to secondary.
 *
 * Responds with the consolidated contact structure including primary contact ID,
 * all associated emails, phone numbers, and secondary contact IDs.
 *
 * @param {*} req
 * @param {*} res
 * @returns {*} Sends a JSON response with the consolidated contact details or error
 */
const identify = async (req, res) => {
    try {
        let { phoneNumber, email } = req.body;

        // Validation.
        if (phoneNumber && typeof phoneNumber !== 'string') {
            return res
                .status(400)
                .json({ error: 'Phone number must be a string' });
        }
        if (email && typeof email !== 'string') {
            return res.status(400).json({ error: 'Email must be a string' });
        }
        if (!phoneNumber && !email) {
            return res
                .status(400)
                .json({ error: 'Phone number or email is required' });
        }

        // Convert phone number to a string.
        if (phoneNumber) {
            phoneNumber = phoneNumber.toString().trim();
        }

        // Get existing contacts matching the phone number or email.
        const matchedContacts = await Contact.find({
            $or: [
                { phoneNumber: phoneNumber || null },
                { email: email || null },
            ],
        });

        // If no contact exists, a new primary contact is created.
        if (matchedContacts.length === 0) {
            const newContact = await Contact.create({
                phoneNumber,
                email,
                linkPrecedence: 'primary',
            });

            return res.status(200).json({
                contact: {
                    primaryContatctId: newContact._id,
                    emails: email ? [email] : [],
                    phoneNumbers: phoneNumber ? [phoneNumber] : [],
                    secondaryContactIds: [],
                },
            });
        }

        // Find all contacts based on matched contacts.
        const contactIds = new Set();
        matchedContacts.forEach((c) => {
            contactIds.add(c._id.toString());
            if (c.linkedId) contactIds.add(c.linkedId.toString());
        });

        const allRelated = await Contact.find({
            $or: [
                { _id: { $in: Array.from(contactIds) } },
                { linkedId: { $in: Array.from(contactIds) } },
            ],
        });

        // Find the primary contact based on the oldest created date.
        const primaryContacts = allRelated.filter(
            (c) => c.linkPrecedence === 'primary'
        );
        const truePrimary = primaryContacts.reduce((oldest, curr) => {
            return new Date(curr.createdAt) < new Date(oldest.createdAt)
                ? curr
                : oldest;
        });

        // Merge contacts.
        for (const contact of primaryContacts) {
            if (contact._id.toString() !== truePrimary._id.toString()) {
                await Contact.findByIdAndUpdate(contact._id, {
                    linkedId: truePrimary._id,
                    linkPrecedence: 'secondary',
                });
            }
        }

        // Check if the new email or phone number is already associated with any contact.
        const existingInfo = new Set();
        allRelated.forEach((c) => {
            if (c.email) existingInfo.add(`email:${c.email}`);
            if (c.phoneNumber) existingInfo.add(`phone:${c.phoneNumber}`);
        });

        // Create a secondary contact if new email or phone number is provided
        const isNewEmail = email && !existingInfo.has(`email:${email}`);
        const isNewPhone =
            phoneNumber && !existingInfo.has(`phone:${phoneNumber}`);

        if (isNewEmail || isNewPhone) {
            await Contact.create({
                email,
                phoneNumber,
                linkPrecedence: 'secondary',
                linkedId: truePrimary._id,
            });
        }

        // Get all contacts related to the true primary contact.
        const finalContacts = await Contact.find({
            $or: [{ _id: truePrimary._id }, { linkedId: truePrimary._id }],
        });

        const emails = new Set();
        const phones = new Set();
        const secondaryIds = [];

        finalContacts.forEach((c) => {
            if (c.email) emails.add(c.email);
            if (c.phoneNumber) phones.add(c.phoneNumber);
            if (c._id.toString() !== truePrimary._id.toString()) {
                secondaryIds.push(c._id);
            }
        });

        return res.status(200).json({
            contact: {
                primaryContatctId: truePrimary._id,
                emails: [
                    truePrimary.email,
                    ...[...emails].filter((e) => e !== truePrimary.email),
                ],
                phoneNumbers: [
                    truePrimary.phoneNumber,
                    ...[...phones].filter((p) => p !== truePrimary.phoneNumber),
                ],
                secondaryContactIds: secondaryIds,
            },
        });
    } catch (error) {
        console.error('Error in identify controller:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    identify,
};
