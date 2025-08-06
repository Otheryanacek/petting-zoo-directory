export default {
  name: 'review',
  title: 'Review',
  type: 'object',
  fields: [
    {
      name: 'reviewText',
      title: 'Review Text',
      type: 'text',
      description: 'Detailed review of the petting zoo experience',
      validation: Rule => Rule.required().min(10).max(1000)
    },
    {
      name: 'visitor',
      title: 'Visitor',
      type: 'reference',
      to: [{ type: 'person' }],
      description: 'Person who visited the petting zoo',
      validation: Rule => Rule.required()
    },
    {
      name: 'rating',
      title: 'Rating',
      type: 'number',
      description: 'Rating from 1 to 5 stars',
      validation: Rule => Rule.required().min(1).max(5),
      options: {
        list: [
          { title: '⭐ 1 Star', value: 1 },
          { title: '⭐⭐ 2 Stars', value: 2 },
          { title: '⭐⭐⭐ 3 Stars', value: 3 },
          { title: '⭐⭐⭐⭐ 4 Stars', value: 4 },
          { title: '⭐⭐⭐⭐⭐ 5 Stars', value: 5 },
        ],
        layout: 'radio',
      },
    },
    {
      name: 'visitDate',
      title: 'Visit Date',
      type: 'date',
      description: 'Date when the visitor went to the petting zoo',
      validation: Rule => Rule.required().max(new Date().toISOString().split('T')[0])
    },
    {
      name: 'approved',
      title: 'Approved',
      type: 'boolean',
      description: 'Whether this review has been approved by administrators',
      initialValue: false
    },
    {
      name: 'approvedBy',
      title: 'Approved By',
      type: 'reference',
      to: [{ type: 'person' }],
      description: 'Administrator who approved this review',
      hidden: ({ document }) => !document?.approved
    },
    {
      name: 'approvedAt',
      title: 'Approved At',
      type: 'datetime',
      description: 'When this review was approved',
      hidden: ({ document }) => !document?.approved
    },
    {
      name: 'moderationNotes',
      title: 'Moderation Notes',
      type: 'text',
      description: 'Internal notes for content moderation',
      hidden: ({ document }) => !document?.approved
    }
  ],
  preview: {
    select: { 
      title: 'visitor.name', 
      rating: 'rating',
      visitDate: 'visitDate',
      approved: 'approved'
    },
    prepare(selection) {
      const { title, rating, visitDate, approved } = selection
      const stars = '⭐'.repeat(rating || 0)
      const status = approved ? '✅' : '⏳'
      return {
        title: `${title || 'Anonymous'} - ${stars}`,
        subtitle: `${visitDate || 'No date'} ${status}`
      }
    }
  },
}
