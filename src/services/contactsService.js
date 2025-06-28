

import Contact from '../models/contactModel.js';

export const getAllContacts = async (options = {}) => {
  const {
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    type,
    isFavourite,
  } = options;

  const skip = (page - 1) * perPage;

  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const filter = {};
  if (type) filter.contactType = type;
  if (typeof isFavourite !== 'undefined') {
    filter.isFavourite = isFavourite === 'true' || isFavourite === true;
  }

  const totalItems = await Contact.countDocuments(filter);
  const data = await Contact.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(perPage);

  const totalPages = Math.ceil(totalItems / perPage);

  return {
    data,
    page: Number(page),
    perPage: Number(perPage),
    totalItems,
    totalPages,
    hasPreviousPage: Number(page) > 1,
    hasNextPage: Number(page) < totalPages,
  };
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