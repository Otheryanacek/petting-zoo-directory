export default {
  name: 'property',
  title: 'Property',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'location',
      title: 'Location',
      type: 'geopoint',
    },
    {
      name: 'propertyType',
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
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'propertyImage' }],
    },
    {
      name: 'pricePerNight',
      title: 'Admission Price',
      type: 'number',
    },
    {
      name: 'beds',
      title: 'Animal Count',
      type: 'number',
    },
    {
      name: 'bedrooms',
      title: 'Animal Types',
      type: 'number',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 100,
      },
    },
    {
      name: 'id',
      title: 'ID',
      type: 'number',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'string',
    },
    {
      name: 'host',
      title: 'Zoo Owner',
      type: 'host',
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
      title: 'title',
      pricePerNight: 'pricePerNight',
    },
  },
}
