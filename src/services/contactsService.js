import Contact from '../models/contactModel.js';

export const getAllContacts = async () => {
  return await Contact.find();
};

export const getContactById = async (contactId) => {
  const contact = await Contact.findById(contactId);
  return contact;
};

export const createContact = async (contactData) => {
  const contact = await Contact.create(contactData);
  return contact;
};

export const updateContactById = async (contactId, updateData) => {
  const updatedContact = await Contact.findByIdAndUpdate(contactId, updateData, {
    new: true,
    runValidators: true,
  });
  return updatedContact;
};

export const deleteContactById = async (contactId) => {
  const deletedContact = await Contact.findByIdAndDelete(contactId);
  return deletedContact;
};
