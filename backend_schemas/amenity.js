export default {
  name: 'amenity',
  title: 'Amenity',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Amenity Name',
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
      type: 'text',
      description: 'Brief description of this amenity'
    },
    {
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Icon name or class for UI display (e.g., "parking", "restroom", "wheelchair")',
      validation: Rule => Rule.required()
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Accessibility', value: 'accessibility' },
          { title: 'Facilities', value: 'facilities' },
          { title: 'Services', value: 'services' },
          { title: 'Safety', value: 'safety' },
          { title: 'Convenience', value: 'convenience' }
        ],
        layout: 'dropdown'
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'isEssential',
      title: 'Essential Amenity',
      type: 'boolean',
      initialValue: false,
      description: 'Mark as essential if this amenity is particularly important for visitors'
    },
    {
      name: 'availabilityNotes',
      title: 'Availability Notes',
      type: 'string',
      description: 'Additional notes about availability (e.g., "Seasonal", "Weekends only", "By appointment")'
    },
    {
      name: 'additionalCost',
      title: 'Additional Cost',
      type: 'object',
      fields: [
        {
          name: 'hasAdditionalCost',
          title: 'Has Additional Cost',
          type: 'boolean',
          initialValue: false
        },
        {
          name: 'cost',
          title: 'Cost',
          type: 'number',
          hidden: ({ parent }) => !parent?.hasAdditionalCost,
          description: 'Cost in dollars'
        },
        {
          name: 'costDescription',
          title: 'Cost Description',
          type: 'string',
          hidden: ({ parent }) => !parent?.hasAdditionalCost,
          description: 'Description of the cost (e.g., "per person", "per hour")'
        }
      ],
      options: {
        collapsible: true,
        collapsed: true
      }
    },
    {
      name: 'relatedAmenities',
      title: 'Related Amenities',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'amenity' }] }],
      description: 'Other amenities that are commonly found together with this one'
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      description: 'description'
    },
    prepare(selection) {
      const { title, subtitle, description } = selection
      return {
        title: title,
        subtitle: `${subtitle}${description ? ` - ${description.substring(0, 50)}...` : ''}`,
        media: null // Could add icon rendering here in the future
      }
    }
  },
  orderings: [
    {
      title: 'Name A-Z',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }]
    },
    {
      title: 'Category',
      name: 'categoryAsc',
      by: [{ field: 'category', direction: 'asc' }, { field: 'name', direction: 'asc' }]
    },
    {
      title: 'Essential First',
      name: 'essentialFirst',
      by: [{ field: 'isEssential', direction: 'desc' }, { field: 'name', direction: 'asc' }]
    }
  ]
}