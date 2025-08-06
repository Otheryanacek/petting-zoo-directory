export default {
  name: 'animal',
  title: 'Animal',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Animal Name',
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
      name: 'type',
      title: 'Animal Type',
      type: 'string',
      options: {
        list: [
          { title: 'Farm Animals', value: 'farm' },
          { title: 'Small Mammals', value: 'small-mammals' },
          { title: 'Birds', value: 'birds' },
          { title: 'Reptiles', value: 'reptiles' },
          { title: 'Exotic Animals', value: 'exotic' }
        ],
        layout: 'dropdown'
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'species',
      title: 'Species',
      type: 'string',
      description: 'Specific species (e.g., Nigerian Dwarf Goat, Holland Lop Rabbit)'
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'General information about this animal'
    },
    {
      name: 'image',
      title: 'Animal Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'canPet',
      title: 'Can Be Petted',
      type: 'boolean',
      initialValue: true,
      description: 'Whether visitors are allowed to pet this animal'
    },
    {
      name: 'feedingAllowed',
      title: 'Feeding Allowed',
      type: 'boolean',
      initialValue: false,
      description: 'Whether visitors can feed this animal'
    },
    {
      name: 'feedingInstructions',
      title: 'Feeding Instructions',
      type: 'text',
      description: 'Instructions for feeding (if feeding is allowed)',
      hidden: ({ document }) => !document?.feedingAllowed
    },
    {
      name: 'temperament',
      title: 'Temperament',
      type: 'string',
      options: {
        list: [
          { title: 'Very Gentle', value: 'very-gentle' },
          { title: 'Gentle', value: 'gentle' },
          { title: 'Friendly', value: 'friendly' },
          { title: 'Cautious', value: 'cautious' },
          { title: 'Observe Only', value: 'observe-only' }
        ],
        layout: 'radio'
      }
    },
    {
      name: 'ageGroup',
      title: 'Suitable Age Group',
      type: 'string',
      options: {
        list: [
          { title: 'All Ages', value: 'all-ages' },
          { title: 'Children 3+', value: 'children-3plus' },
          { title: 'Children 5+', value: 'children-5plus' },
          { title: 'Supervised Only', value: 'supervised-only' }
        ],
        layout: 'dropdown'
      },
      initialValue: 'all-ages'
    },
    {
      name: 'funFacts',
      title: 'Fun Facts',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Interesting facts about this animal for educational purposes'
    },
    {
      name: 'careRequirements',
      title: 'Care Requirements',
      type: 'object',
      fields: [
        {
          name: 'diet',
          title: 'Diet',
          type: 'string'
        },
        {
          name: 'habitat',
          title: 'Habitat Needs',
          type: 'string'
        },
        {
          name: 'socialNeeds',
          title: 'Social Needs',
          type: 'string'
        }
      ],
      options: {
        collapsible: true,
        collapsed: true
      }
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'species',
      media: 'image',
      type: 'type'
    },
    prepare(selection) {
      const { title, subtitle, media, type } = selection
      return {
        title: title,
        subtitle: subtitle ? `${subtitle} (${type})` : type,
        media: media
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
      title: 'Animal Type',
      name: 'typeAsc',
      by: [{ field: 'type', direction: 'asc' }, { field: 'name', direction: 'asc' }]
    }
  ]
}