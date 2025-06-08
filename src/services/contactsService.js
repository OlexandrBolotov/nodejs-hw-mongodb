import Contact from '../models/contactModel.js';

export const getAllContacts = async () => {
  return await Contact.find();
};

export const getContactById = async (contactId) => {
  const contact = await Contact.findById(contactId);
  return contact;
};
