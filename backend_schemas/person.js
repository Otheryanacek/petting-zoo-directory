export default {
  name: 'person',
  title: 'Person',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Please use "Firstname Lastname" format',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 100,
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'id',
      title: 'ID',
      type: 'number',
    },
    {
      name: 'image',
      title: 'Profile Image',
      type: 'image',
      options: {
        hotspot: true
      },
      description: 'Profile photo for the visitor or administrator'
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      description: 'Contact email address',
      validation: Rule => Rule.email()
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'Person\'s role in the system',
      options: {
        list: [
          { title: 'Visitor', value: 'visitor' },
          { title: 'Administrator', value: 'admin' },
          { title: 'Moderator', value: 'moderator' },
          { title: 'Zoo Owner', value: 'zoo-owner' }
        ],
        layout: 'radio'
      },
      initialValue: 'visitor'
    },
    {
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'City or region where the person is located'
    },
    {
      name: 'bio',
      title: 'Bio',
      type: 'text',
      description: 'Short biography or description',
      rows: 3
    },
    {
      name: 'joinedDate',
      title: 'Joined Date',
      type: 'date',
      description: 'Date when the person joined the platform',
      initialValue: () => new Date().toISOString().split('T')[0]
    },
    {
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Whether this person account is active',
      initialValue: true
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'image',
      email: 'email'
    },
    prepare(selection) {
      const { title, subtitle, media, email } = selection
      return {
        title: title || 'Unnamed Person',
        subtitle: `${subtitle || 'visitor'} ${email ? `(${email})` : ''}`,
        media
      }
    }
  },
}
