export default {
  name: 'pettingZoo',
  title: 'Petting Zoo',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Zoo Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 100,
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text'
    },
    {
      name: 'location',
      title: 'Location',
      type: 'geopoint'
    },
    {
      name: 'address',
      title: 'Street Address',
      type: 'string'
    },
    {
      name: 'phone',
      title: 'Phone Number',
      type: 'string'
    },
    {
      name: 'website',
      title: 'Website',
      type: 'url'
    },
    {
      name: 'operatingHours',
      title: 'Operating Hours',
      type: 'object',
      fields: [
        { name: 'monday', title: 'Monday', type: 'string' },
        { name: 'tuesday', title: 'Tuesday', type: 'string' },
        { name: 'wednesday', title: 'Wednesday', type: 'string' },
        { name: 'thursday', title: 'Thursday', type: 'string' },
        { name: 'friday', title: 'Friday', type: 'string' },
        { name: 'saturday', title: 'Saturday', type: 'string' },
        { name: 'sunday', title: 'Sunday', type: 'string' }
      ]
    },
    {
      name: 'admissionPrice',
      title: 'Admission Price',
      type: 'object',
      fields: [
        { name: 'adult', title: 'Adult Price', type: 'number' },
        { name: 'child', title: 'Child Price', type: 'number' },
        { name: 'senior', title: 'Senior Price', type: 'number' }
      ]
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'images',
      title: 'Additional Images',
      type: 'array',
      of: [{ type: 'propertyImage' }],
    },
    {
      name: 'zooType',
      title: 'Zoo Type',
      type: 'string',
      options: {
        list: [
          { title: 'Farm Petting Zoo', value: 'farm' },
          { title: 'Wildlife Sanctuary', value: 'wildlife' },
          { title: 'Mobile Petting Zoo', value: 'mobile' },
          { title: 'Educational Zoo', value: 'educational' },
        ],
        layout: 'radio',
      },
    },
    {
      name: 'animals',
      title: 'Animals',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'animal' }] }],
      description: 'Select the animals available at this petting zoo'
    },
    {
      name: 'animalCount',
      title: 'Total Animal Count',
      type: 'number',
      description: 'Optional - total number of individual animals (will be calculated from animals array if not provided)'
    },
    {
      name: 'animalTypes',
      title: 'Number of Animal Types',
      type: 'number',
      description: 'Optional - number of different animal types (will be calculated from animals array if not provided)'
    },
    {
      name: 'amenities',
      title: 'Amenities',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'amenity' }] }],
      description: 'Select the amenities available at this petting zoo'
    },
    {
      name: 'owner',
      title: 'Zoo Owner',
      type: 'reference',
      to: [{ type: 'host' }],
      description: 'Optional - you can create a host/owner later'
    },
    {
      name: 'reviews',
      title: 'Reviews',
      type: 'array',
      of: [{ type: 'review' }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      media: 'mainImage',
      subtitle: 'zooType'
    },
  },
}